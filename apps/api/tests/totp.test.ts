import { describe, expect, it } from 'bun:test';

// The encryption helpers derive their key from SESSION_SECRET lazily, so setting
// it here is enough - totp.ts deliberately does not import the app's env module.
process.env.SESSION_SECRET ??= 'test-session-secret-for-totp-unit-tests-only';

import {
  base32Decode,
  base32Encode,
  currentTotpCode,
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  normalizeRecoveryCode,
  otpauthUri,
  verifyTotpCode,
} from '../src/auth/totp';

describe('base32', () => {
  it('round-trips arbitrary bytes', () => {
    for (const input of ['a', 'ab', 'abc', 'abcd', 'abcde', 'hello world', '']) {
      const buf = Buffer.from(input, 'utf8');
      expect(base32Decode(base32Encode(buf)).toString('utf8')).toBe(input);
    }
  });

  it('matches known RFC 4648 encodings', () => {
    expect(base32Encode(Buffer.from('f'))).toBe('MY');
    expect(base32Encode(Buffer.from('fo'))).toBe('MZXQ');
    expect(base32Encode(Buffer.from('foobar'))).toBe('MZXW6YTBOI');
  });

  it('rejects invalid characters rather than decoding silently', () => {
    expect(() => base32Decode('MZXW6YT!')).toThrow();
  });
});

describe('TOTP against RFC 6238 test vectors', () => {
  // RFC 6238 Appendix B uses the ASCII secret "12345678901234567890" with
  // HMAC-SHA1. These are the published expected values, truncated to 6 digits
  // from the RFC's 8. Testing against the spec - rather than against our own
  // output - is what proves the implementation is interoperable with real
  // authenticator apps instead of merely self-consistent.
  const secret = base32Encode(Buffer.from('12345678901234567890', 'utf8'));

  const vectors: Array<[number, string]> = [
    [59, '287082'],
    [1111111109, '081804'],
    [1111111111, '050471'],
    [1234567890, '005924'],
    [2000000000, '279037'],
  ];

  for (const [unixSeconds, expected] of vectors) {
    it(`t=${unixSeconds} produces ${expected}`, () => {
      expect(currentTotpCode(secret, unixSeconds * 1000)).toBe(expected);
    });
  }
});

describe('verifyTotpCode', () => {
  it('accepts the code generated right now', () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, currentTotpCode(secret))).toBe(true);
  });

  it('accepts a code formatted with a space', () => {
    const secret = generateTotpSecret();
    const code = currentTotpCode(secret);
    expect(verifyTotpCode(secret, `${code.slice(0, 3)} ${code.slice(3)}`)).toBe(true);
  });

  it('rejects a wrong code', () => {
    const secret = generateTotpSecret();
    const wrong = currentTotpCode(secret) === '000000' ? '111111' : '000000';
    expect(verifyTotpCode(secret, wrong)).toBe(false);
  });

  it("rejects another account's code", () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    expect(verifyTotpCode(a, currentTotpCode(b))).toBe(false);
  });

  it('rejects malformed input instead of throwing', () => {
    const secret = generateTotpSecret();
    for (const bad of ['', '12345', '1234567', 'abcdef', '   ']) {
      expect(verifyTotpCode(secret, bad)).toBe(false);
    }
  });

  it('rejects a code from well outside the drift window', () => {
    const secret = generateTotpSecret();
    // Ten minutes ago: far beyond the +/-1 step tolerance.
    const stale = currentTotpCode(secret, Date.now() - 10 * 60 * 1000);
    expect(verifyTotpCode(secret, stale)).toBe(false);
  });
});

describe('secret encryption', () => {
  it('round-trips a secret', () => {
    const secret = generateTotpSecret();
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it('does not store the secret in the clear', () => {
    const secret = generateTotpSecret();
    expect(encryptSecret(secret)).not.toContain(secret);
  });

  it('produces different ciphertext each time (fresh IV)', () => {
    const secret = generateTotpSecret();
    expect(encryptSecret(secret)).not.toBe(encryptSecret(secret));
  });

  it('fails closed on a tampered ciphertext', () => {
    const stored = encryptSecret(generateTotpSecret());
    const parts = stored.split('.');
    // Flip a character in the ciphertext segment.
    parts[2] = parts[2][0] === 'A' ? `B${parts[2].slice(1)}` : `A${parts[2].slice(1)}`;
    expect(decryptSecret(parts.join('.'))).toBeNull();
  });

  it('fails closed on garbage input', () => {
    expect(decryptSecret('not-a-ciphertext')).toBeNull();
    expect(decryptSecret('')).toBeNull();
  });
});

describe('recovery codes', () => {
  it('generates the requested number of unique codes', () => {
    const codes = generateRecoveryCodes(10);
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
  });

  it('omits characters that are ambiguous on paper', () => {
    for (const code of generateRecoveryCodes(25)) {
      expect(code).not.toMatch(/[O0I1]/);
    }
  });

  it('normalizes user-typed formatting', () => {
    expect(normalizeRecoveryCode('abcde-fghjk')).toBe('ABCDEFGHJK');
    expect(normalizeRecoveryCode(' ABCDE FGHJK ')).toBe('ABCDEFGHJK');
  });
});

describe('otpauth URI', () => {
  it('includes the secret, issuer and parameters an authenticator needs', () => {
    const secret = generateTotpSecret();
    const uri = otpauthUri(secret, 'admin@example.com');
    expect(uri).toStartWith('otpauth://totp/');
    expect(uri).toContain(`secret=${secret}`);
    expect(uri).toContain('digits=6');
    expect(uri).toContain('period=30');
  });
});
