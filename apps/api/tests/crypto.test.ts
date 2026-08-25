import { describe, expect, test } from 'bun:test';
import { flagHmac, flagHmacFor, normalizeFlagFor, safeEqual, sha256, generateToken } from '../src/core/crypto';

describe('flag verification', () => {
  test('same flag produces same HMAC', () => {
    expect(flagHmacFor('SURAKSHA{test_flag}', true)).toBe(flagHmacFor('SURAKSHA{test_flag}', true));
  });
  test('different flags produce different HMACs', () => {
    expect(flagHmacFor('SURAKSHA{a}', true)).not.toBe(flagHmacFor('SURAKSHA{b}', true));
  });
  test('case-sensitive mode preserves case', () => {
    expect(flagHmacFor('SURAKSHA{Case}', true)).not.toBe(flagHmacFor('suraksha{case}', true));
  });
  test('case-insensitive mode folds case consistently', () => {
    expect(flagHmacFor('SURAKSHA{Case}', false)).toBe(flagHmacFor('   suraksha{case}  ', false));
  });
  test('normalizeFlagFor trims whitespace', () => {
    expect(normalizeFlagFor('  flag  ', true)).toBe('flag');
    expect(normalizeFlagFor('a  b', true)).toBe('a b');
  });
  test('legacy flagHmac matches flagHmacFor case-sensitive', () => {
    expect(flagHmac('X{y}')).toBe(flagHmacFor('X{y}', true));
  });
  test('safeEqual accepts equal strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
  });
  test('safeEqual rejects different strings and lengths', () => {
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});

describe('token utilities', () => {
  test('generateToken is URL-safe and unique', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(40);
  });
  test('sha256 is deterministic hex', () => {
    expect(sha256('x')).toBe(sha256('x'));
    expect(sha256('x')).toMatch(/^[a-f0-9]{64}$/);
  });
});
