import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { errors } from '../core/errors';
import { hashPassword, verifyPassword } from '../core/password';
import {
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  normalizeRecoveryCode,
  otpauthUri,
  verifyTotpCode,
} from './totp';

/**
 * Two-factor authentication for staff accounts.
 *
 * WHY STAFF ONLY (for now): a learner account holds progress and XP. A staff
 * account can rewrite every lesson, read the user table and replace lab
 * packages, so its blast radius is the whole platform. Mandating 2FA there is
 * high value; mandating it on learner signup would cost sign-ups for little gain.
 * Learners may still enrol voluntarily.
 */

/** Roles for which the platform REQUIRES a second factor. */
const STAFF_ROLES = new Set(['moderator', 'content_editor', 'lab_manager', 'administrator', 'super_admin']);

export function roleRequiresTwoFactor(role: string): boolean {
  return STAFF_ROLES.has(role);
}

export function hasTwoFactor(user: { totpSecret: string | null; totpEnrolledAt: Date | null }): boolean {
  return Boolean(user.totpSecret && user.totpEnrolledAt);
}

/* ------------------------- Pending-login challenge ------------------------ */
/**
 * Between "password was correct" and "second factor was correct" the caller must
 * hold something, but it must NOT be a usable session - otherwise the second
 * factor is decorative, because a stolen password would already grant access.
 *
 * So the first step returns a short-lived HMAC-signed challenge that proves only
 * "this password was verified at this time". It is stateless (no table, nothing
 * to clean up) and expires quickly, bounding how long a phished password stays
 * useful without the device.
 */
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function challengeKey(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is required to sign 2FA challenges.');
  return secret;
}

export function issueTwoFactorChallenge(userId: string): string {
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  const nonce = randomBytes(8).toString('base64url');
  const payload = `${userId}.${expiresAt}.${nonce}`;
  const sig = createHmac('sha256', challengeKey()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyTwoFactorChallenge(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [userId, expiresAtRaw, nonce, sig] = parts;

  const expected = createHmac('sha256', challengeKey()).update(`${userId}.${expiresAtRaw}.${nonce}`).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return userId;
}

/* ------------------------------- Enrolment -------------------------------- */

export type EnrolmentOffer = { secret: string; otpauthUri: string };

/**
 * Starts enrolment. Returns a secret that is NOT yet active: it is stored but
 * `totpEnrolledAt` stays null until the user proves they can generate a code.
 * Activating on issue would lock people out whenever a QR scan silently failed.
 *
 * Requires the current password: without that, anyone with a hijacked session
 * could bind their own authenticator to the victim's account and hold it.
 */
export async function beginEnrolment(userId: string, currentPassword: string): Promise<EnrolmentOffer> {
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!user) throw errors.notFound('Account not found.');

  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw errors.unauthorized('That password is not correct.');
  }
  if (hasTwoFactor(user)) {
    throw errors.conflict('Two-factor authentication is already enabled. Disable it first to re-enrol.');
  }

  const secret = generateTotpSecret();
  await db
    .update(users)
    .set({ totpSecret: encryptSecret(secret), totpEnrolledAt: null, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { secret, otpauthUri: otpauthUri(secret, user.email) };
}

/**
 * Completes enrolment once the user submits a working code, and returns the
 * recovery codes ONCE - they are stored only as hashes, so this is the single
 * opportunity to record them.
 */
export async function confirmEnrolment(userId: string, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!user?.totpSecret) throw errors.badRequest('Start enrolment before confirming it.');

  const secret = decryptSecret(user.totpSecret);
  if (!secret) throw errors.internal('Stored two-factor secret could not be read. Restart enrolment.');
  if (!verifyTotpCode(secret, code)) throw errors.unauthorized('That code is not valid. Check your authenticator and try again.');

  const recoveryCodes = generateRecoveryCodes(10);
  const hashes = await Promise.all(recoveryCodes.map((rc) => hashPassword(normalizeRecoveryCode(rc))));

  await db
    .update(users)
    .set({ totpEnrolledAt: new Date(), totpRecoveryHashes: hashes, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { recoveryCodes };
}

/**
 * Turns 2FA off. Staff are refused: allowing a content editor to opt out would
 * make the platform-wide requirement advisory. A super-admin must change the
 * role first, which is itself audited.
 */
export async function disableTwoFactor(userId: string, currentPassword: string, code: string): Promise<void> {
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!user) throw errors.notFound('Account not found.');

  if (roleRequiresTwoFactor(user.role)) {
    throw errors.forbidden('Two-factor authentication is mandatory for staff accounts and cannot be disabled.');
  }
  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw errors.unauthorized('That password is not correct.');
  }
  const secret = user.totpSecret ? decryptSecret(user.totpSecret) : null;
  if (!secret || !verifyTotpCode(secret, code)) throw errors.unauthorized('That code is not valid.');

  await db
    .update(users)
    .set({ totpSecret: null, totpEnrolledAt: null, totpRecoveryHashes: [], updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/* ------------------------------ Login step 2 ------------------------------ */

/**
 * Validates the second factor, accepting either a TOTP code or a recovery code.
 *
 * A used recovery code is REMOVED, making it single-use: a reusable recovery
 * code found in a screenshot or a password manager export would be a permanent
 * bypass of the second factor.
 */
export async function verifySecondFactor(userId: string, submitted: string): Promise<boolean> {
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!user?.totpSecret || !user.totpEnrolledAt) return false;

  const secret = decryptSecret(user.totpSecret);
  if (secret && verifyTotpCode(secret, submitted)) return true;

  // Fall back to recovery codes. Compared against every stored hash so a valid
  // code works regardless of position.
  const candidate = normalizeRecoveryCode(submitted);
  if (candidate.length < 8) return false;

  for (const hash of user.totpRecoveryHashes) {
    if (await verifyPassword(candidate, hash)) {
      const remaining = user.totpRecoveryHashes.filter((h) => h !== hash);
      await db.update(users).set({ totpRecoveryHashes: remaining, updatedAt: new Date() }).where(eq(users.id, userId));
      return true;
    }
  }
  return false;
}
