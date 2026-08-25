import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { env, isProd } from '../config/env';

/** Cryptographically strong random token (URL-safe). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Whitespace normalization applied to all flags before hashing. */
export function normalizeFlag(flag: string): string {
  return flag.trim().replace(/\s+/g, ' ');
}

/** HMAC for flag verification — plaintext flags are never stored. */
export function flagHmac(flag: string): string {
  return createHmac('sha256', env.FLAG_HMAC_SECRET).update(normalizeFlag(flag)).digest('hex');
}

/**
 * Canonical flag HMAC honoring the lab's case sensitivity setting.
 * Both storage (seed/admin) and verification (submission) MUST use this so
 * case-insensitive labs compare lowercased values consistently.
 */
export function flagHmacFor(flag: string, caseSensitive: boolean): string {
  const normalized = normalizeFlag(flag);
  return createHmac('sha256', env.FLAG_HMAC_SECRET)
    .update(caseSensitive ? normalized : normalized.toLowerCase())
    .digest('hex');
}

/** Normalizes a submitted flag the same way flagHmacFor does before hashing. */
export function normalizeFlagFor(flag: string, caseSensitive: boolean): string {
  const normalized = normalizeFlag(flag);
  return caseSensitive ? normalized : normalized.toLowerCase();
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still perform a comparison to keep timing roughly constant.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** Hash IP addresses for privacy-safe abuse tracking (not identification). */
export function hashIp(ip: string): string | null {
  if (!ip) return null;
  return createHmac('sha256', env.SESSION_SECRET).update(ip).digest('hex').slice(0, 64);
}

export const sessionCookieName = 'suraksha_session';
export const oauthStateCookieName = 'suraksha_oauth_state';

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
