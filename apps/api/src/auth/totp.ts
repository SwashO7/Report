import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * TOTP (RFC 6238) second factor for staff accounts.
 *
 * Implemented directly on node:crypto rather than pulling in a dependency: the
 * algorithm is a HMAC and a truncation, and an auth-critical path is the last
 * place to add third-party supply-chain surface for thirty lines of code.
 *
 * Works with any authenticator app (Google Authenticator, Authy, 1Password,
 * Aegis) via the standard otpauth:// URI.
 */

const DIGITS = 6;
const PERIOD_SECONDS = 30;
/**
 * Accept the adjacent steps as well as the current one. Phone clocks drift and
 * people finish typing after a boundary; ±1 step is the usual compromise between
 * usability and keeping the guessable window small (3 codes out of a million).
 */
const DRIFT_STEPS = 1;

/* ----------------------------- Base32 (RFC 4648) -------------------------- */
// Authenticator apps expect the secret base32-encoded, so this is required.

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = B32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error('Invalid base32 character in TOTP secret.');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/* --------------------------- Secret encryption ---------------------------- */
/**
 * The TOTP secret is a bearer credential: whoever holds it can generate valid
 * codes forever, which would make the second factor worthless. So it is
 * encrypted at rest with AES-256-GCM, meaning a leaked database dump alone does
 * not yield working secrets - the attacker also needs SESSION_SECRET, which
 * lives in Secret Manager rather than the database.
 *
 * GCM is chosen over CBC for its built-in authentication tag: a tampered
 * ciphertext fails to decrypt instead of silently producing garbage.
 */
function encryptionKey(): Buffer {
  // Read lazily from process.env rather than importing the validated env module:
  // this keeps an auth-critical crypto primitive free of application wiring, so
  // it can be unit-tested in isolation. Production still fails loudly on a
  // missing secret, because config/env.ts validates SESSION_SECRET at boot.
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is required to encrypt or decrypt TOTP secrets.');

  // scrypt stretches the env secret into a proper 32-byte key. The salt is a
  // fixed domain label, not a secret - its job is only to separate this key from
  // any other key derived from the same env value.
  return scryptSync(secret, 'suraksha-totp-secret-v1', 32);
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${enc.toString('base64url')}.${tag.toString('base64url')}`;
}

export function decryptSecret(stored: string): string | null {
  try {
    const [version, ivB64, dataB64, tagB64] = stored.split('.');
    if (version !== 'v1' || !ivB64 || !dataB64 || !tagB64) return null;
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    // Wrong key, tampered ciphertext, or corrupt row. Fail closed: no secret
    // means no valid code, which locks the account rather than admitting anyone.
    return null;
  }
}

/* ------------------------------- Code maths ------------------------------- */

/** A fresh 20-byte (160-bit) secret, the size RFC 4226 recommends for HMAC-SHA1. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

function codeForCounter(secret: Buffer, counter: number): string {
  // 8-byte big-endian counter. Written via a DataView to stay correct past
  // 2^32, which bit-shifting in JS would silently get wrong.
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac('sha1', secret).update(buf).digest();
  // Dynamic truncation (RFC 4226 section 5.3).
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

/** The code valid right now, for tests and for the enrolment self-check. */
export function currentTotpCode(base32Secret: string, atMs = Date.now()): string {
  return codeForCounter(base32Decode(base32Secret), Math.floor(atMs / 1000 / PERIOD_SECONDS));
}

/**
 * Verifies a submitted code against the secret, allowing for clock drift.
 *
 * Comparison is constant-time. A plain `===` on a 6-digit code leaks timing
 * information about how many leading digits matched, which over many attempts
 * narrows the search space - cheap to avoid, so avoided.
 */
export function verifyTotpCode(base32Secret: string, submitted: string): boolean {
  const cleaned = submitted.replace(/\D/g, '');
  if (cleaned.length !== DIGITS) return false;

  const secret = base32Decode(base32Secret);
  const step = Math.floor(Date.now() / 1000 / PERIOD_SECONDS);
  const submittedBuf = Buffer.from(cleaned, 'utf8');

  for (let drift = -DRIFT_STEPS; drift <= DRIFT_STEPS; drift++) {
    const candidate = Buffer.from(codeForCounter(secret, step + drift), 'utf8');
    if (candidate.length === submittedBuf.length && timingSafeEqual(candidate, submittedBuf)) return true;
  }
  return false;
}

/** The otpauth:// URI an authenticator app scans as a QR code. */
export function otpauthUri(base32Secret: string, accountEmail: string, issuer = 'Suraksha Labs'): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/* ----------------------------- Recovery codes ----------------------------- */
/**
 * Single-use codes for a lost or wiped authenticator device. Without these, a
 * broken phone means a support ticket and manual DB surgery on a super-admin -
 * which is exactly the situation where someone is tempted to disable 2FA.
 *
 * Only Argon2id hashes are stored (see the schema), never the codes themselves,
 * for the same reason passwords are hashed: a database read must not yield
 * usable credentials.
 */
export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Crockford-ish alphabet: no O/0/I/1 confusion when read off paper.
    const raw = base32Encode(randomBytes(10)).replace(/[O0I1]/g, 'X').slice(0, 10);
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
  }
  return codes;
}

export function normalizeRecoveryCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z2-9]/g, '');
}
