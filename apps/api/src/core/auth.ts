import { eq, and, gt, isNull, sql } from 'drizzle-orm';
import type { Context, MiddlewareHandler } from 'hono';
import { db } from '../db/client';
import { sessions, users } from '../db/schema';
import { generateToken, sha256, sessionCookieName, sessionCookieOptions, hashIp } from './crypto';
import { isProd } from '../config/env';
import { errors, getClientIp } from './errors';
import {
  CONTENT_ROLES,
  LAB_MANAGE_ROLES,
  PUBLISH_ROLES,
  STAFF_ROLES,
  SUPER_ADMIN_ROLES,
  USER_ADMIN_ROLES,
  type Role,
} from '@suraksha/shared';

export const SESSION_TTL_DAYS = 30;

export interface AuthedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: string;
  xp: number;
  levelOrder: number;
  avatarUrl: string | null;
  emailVerified: boolean;
  onboarded: boolean;
}

declare module 'hono' {
  interface ContextVariableMap {
    authUser?: AuthedUser;
    sessionId?: string;
  }
}

function toAuthedUser(row: typeof users.$inferSelect): AuthedUser {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: row.role as Role,
    status: row.status,
    xp: row.xp,
    levelOrder: row.levelOrder,
    avatarUrl: row.avatarUrl,
    emailVerified: Boolean(row.emailVerifiedAt),
    onboarded: Boolean(row.onboardedAt),
  };
}

/** Creates a DB-backed session and sets the secure cookie. */
export async function createSession(c: Context, userId: string): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    userId,
    tokenHash: sha256(token),
    userAgent: c.req.header('user-agent')?.slice(0, 300) ?? null,
    ipHash: hashIp(getClientIp(c)),
    expiresAt,
  });
  const cookie = `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_DAYS * 86400}${isProd ? '; Secure' : ''}`;
  c.header('Set-Cookie', cookie, { append: true });
  return token;
}

/** Resolves the current user from the session cookie; null when anonymous. */
export async function resolveSessionUser(c: Context): Promise<AuthedUser | null> {
  const raw = getCookieToken(c);
  if (!raw) return null;
  const tokenHash = sha256(raw);
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.user.status !== 'active') return null;

  // Touch activity lazily at most once per minute per session.
  if (Date.now() - row.session.lastSeenAt.getTime() > 60_000) {
    const today = new Date().toISOString().slice(0, 10);
    await db
      .update(sessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(sessions.id, row.session.id));
    await db
      .update(users)
      .set({
        lastActiveAt: new Date(),
        lastActiveDate: today,
        // Streak: consecutive active days. last_active_date is a Postgres
        // `date`, so every comparison against the JS string must carry an
        // explicit ::date cast -- an uncast parameter binds as text and
        // Postgres rejects the whole statement with
        // "operator does not exist: date = text". Anchoring "yesterday" to
        // ${today}::date - 1 rather than CURRENT_DATE also keeps both sides on
        // the same reference day, instead of mixing this process's UTC date
        // with the database session's timezone.
        streakCount: sql`CASE
          WHEN ${users.lastActiveDate} = ${today}::date THEN ${users.streakCount}
          WHEN ${users.lastActiveDate} = ${today}::date - 1 THEN ${users.streakCount} + 1
          ELSE 1 END`,
      })
      .where(and(eq(users.id, row.user.id), sql`${users.lastActiveDate} IS DISTINCT FROM ${today}::date`));
  }
  return toAuthedUser(row.user);
}

export function getCookieToken(c: Context): string | null {
  const cookieHeader = c.req.header('cookie');
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === sessionCookieName) return decodeURIComponent(rest.join('='));
  }
  return null;
}

/** Requires an authenticated user. */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = await resolveSessionUser(c);
  if (!user) throw errors.unauthorized('Please sign in to continue.');
  c.set('authUser', user);
  await next();
};

/** Guaranteed accessor for routes behind requireAuth/requireRole. */
export function getAuthUser(c: Context): AuthedUser {
  const user = c.get('authUser');
  if (!user) throw errors.unauthorized();
  return user;
}

/** Requires authentication AND one of the given roles. Server-side only. */
export function requireRole(...roles: readonly Role[]): MiddlewareHandler {
  return async (c, next) => {
    const user = await resolveSessionUser(c);
    if (!user) throw errors.unauthorized();
    if (!roles.includes(user.role)) throw errors.forbidden();
    c.set('authUser', user);
    await next();
  };
}

export const requireStaff = requireRole(...STAFF_ROLES);
export const requireContentEditor = requireRole(...CONTENT_ROLES);
export const requireLabManager = requireRole(...LAB_MANAGE_ROLES);
export const requirePublisher = requireRole(...PUBLISH_ROLES);
export const requireUserAdmin = requireRole(...USER_ADMIN_ROLES);
export const requireSuperAdmin = requireRole(...SUPER_ADMIN_ROLES);

/** Revokes a specific session by id (must belong to user unless admin). */
export async function revokeSession(sessionId: string, userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
}

export async function revokeAllSessions(userId: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

export async function revokeCurrentSession(c: Context) {
  const raw = getCookieToken(c);
  if (raw) {
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, sha256(raw)));
  }
  clearSessionCookie(c);
}

export function clearSessionCookie(c: Context) {
  const cookie = `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
  c.header('Set-Cookie', cookie, { append: true });
}
