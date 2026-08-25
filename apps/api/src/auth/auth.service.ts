import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { db } from '../db/client';
import { users, verificationTokens } from '../db/schema';
import { generateToken, sha256 } from '../core/crypto';
import { errors } from '../core/errors';
import { queueEmail, appUrl } from '../email/send';
import { audit } from '../audit/audit.service';
import { notify } from '../notifications/notifications.service';
import type { Context } from 'hono';
import { getClientIp } from '../core/errors';

const VERIFY_TTL_HOURS = 24;
const RESET_TTL_MINUTES = 60;

export async function findByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function findByUsername(username: string) {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

export async function findByGoogleId(googleId: string) {
  const rows = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: { name: string; username: string; email: string; passwordHash: string | null; authProvider: string; googleId?: string | null; emailVerified?: boolean }) {
  const [row] = await db
    .insert(users)
    .values({
      name: input.name,
      username: input.username,
      email: input.email,
      passwordHash: input.passwordHash,
      authProvider: input.authProvider,
      googleId: input.googleId ?? null,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
    })
    .returning();
  await audit({ actorId: row.id, action: 'user_signup', entityType: 'user', entityId: row.id, metadata: { provider: input.authProvider } });
  return row;
}

/** Creates a one-time verification/reset token and emails it. */
export async function issueToken(userId: string, type: 'email_verify' | 'password_reset', email: string, name: string) {
  const token = generateToken(32);
  const ttlMs = type === 'email_verify' ? VERIFY_TTL_HOURS * 3600_000 : RESET_TTL_MINUTES * 60_000;
  await db.insert(verificationTokens).values({
    userId,
    type,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + ttlMs),
  });

  const path = type === 'email_verify' ? `/verify-email?token=${encodeURIComponent(token)}` : `/reset-password?token=${encodeURIComponent(token)}`;
  const url = appUrl(path);
  if (type === 'email_verify') {
    await queueEmail(email, 'verify_email', { url, name });
  } else {
    await queueEmail(email, 'reset_password', { url, name });
  }
  return token;
}

export async function consumeToken(token: string, type: 'email_verify' | 'password_reset') {
  const tokenHash = sha256(token);
  const rows = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.tokenHash, tokenHash),
        eq(verificationTokens.type, type),
        isNull(verificationTokens.usedAt),
        gt(verificationTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) throw errors.badRequest('This link is invalid or has expired. Please request a new one.');

  await db.update(verificationTokens).set({ usedAt: new Date() }).where(eq(verificationTokens.id, row.id));
  return row;
}

/** Constant-time-ish login that avoids revealing whether the email exists. */
export async function verifyCredentials(email: string, password: string) {
  const user = await findByEmail(email);
  const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$m+GPUJlj8zvwtVI+L8zKpB/TI4YRLhQ1fYcW/fZMzJU';
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const valid = await Bun.password.verify(password, hash).catch(() => false);
  if (!user || !valid) return null;
  return user;
}

export async function markEmailVerified(userId: string): Promise<boolean> {
  // Returns true only when this call performed the verification (first time).
  const row = (await db.select({ emailVerifiedAt: users.emailVerifiedAt }).from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!row || row.emailVerifiedAt) return false;
  await db.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
  return true;
}

export async function sendWelcome(userId: string, email: string, name: string) {
  await queueEmail(email, 'welcome', { name, url: appUrl('/learn') });
  await notify({
    userId,
    type: 'new_lesson',
    title: 'Welcome to Suraksha Labs',
    body: 'Start with Level 0 — Foundations. Your journey begins with a single lesson.',
    link: '/learn',
  });
}

export function clientIp(c: Context) {
  return getClientIp(c);
}
