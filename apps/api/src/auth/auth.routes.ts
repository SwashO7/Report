import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, isNull, ne } from 'drizzle-orm';
import { db } from '../db/client';
import { sessions, users } from '../db/schema';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from '@suraksha/shared';
import { errors } from '../core/errors';
import { rateLimitMiddleware } from '../core/middleware';
import {
  clearSessionCookie,
  createSession,
  requireAuth,
  resolveSessionUser,
  revokeAllSessions,
  revokeCurrentSession,
  revokeSession,
} from '../core/auth';
import { flagHmac } from '../core/crypto';
import { hashPassword, verifyPassword } from '../core/password';
import { getAuthUser } from '../core/auth';
import * as authService from './auth.service';
import { audit } from '../audit/audit.service';
import { env, googleOAuthEnabled, isProd } from '../config/env';
import { computeXpProgress, getLevels } from '../gamification/xp';
import type { SelfUser } from '@suraksha/shared';

async function toSelfUser(user: typeof users.$inferSelect): Promise<SelfUser> {
  const levels = await getLevels();
  const level = computeXpProgress(user.xp, levels).level;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role as SelfUser['role'],
    status: user.status as SelfUser['status'],
    xp: user.xp,
    level: level ? { id: level.id, order: level.order, name: level.name, title: level.title, xpThreshold: level.xpThreshold } : null,
    authProvider: user.authProvider,
    emailVerified: Boolean(user.emailVerifiedAt),
    onboarded: Boolean(user.onboardedAt),
    experienceLevel: user.experienceLevel,
    interests: user.interests ?? [],
    bio: user.bio,
    profileVisibility: user.profileVisibility as SelfUser['profileVisibility'],
    createdAt: user.createdAt.toISOString(),
    lastActiveAt: user.lastActiveAt.toISOString(),
  };
}

export const authRoutes = new Hono()

  /* ------------------------------- Signup -------------------------------- */
  .post('/signup', rateLimitMiddleware('signup', 10, 60_000), async (c) => {
    const input = signupSchema.parse(await c.req.json());

    const existingEmail = await authService.findByEmail(input.email);
    if (existingEmail) throw errors.conflict('An account with this email already exists. Try signing in instead.');
    const existingUsername = await authService.findByUsername(input.username);
    if (existingUsername) throw errors.conflict('This username is taken. Choose another one.');

    const passwordHash = await hashPassword(input.password);
    const user = await authService.createUser({
      name: input.name,
      username: input.username,
      email: input.email,
      passwordHash,
      authProvider: 'email',
    });

    await authService.issueToken(user.id, 'email_verify', user.email, user.name);
    await createSession(c, user.id);
    await audit({ actorId: user.id, action: 'login', entityType: 'session', metadata: { method: 'password', kind: 'signup' } });

    return c.json({ user: await toSelfUser(user) }, 201);
  })

  /* -------------------------------- Login -------------------------------- */
  .post('/login', rateLimitMiddleware('login', 15, 60_000), async (c) => {
    const input = loginSchema.parse(await c.req.json());
    const user = await authService.verifyCredentials(input.email, input.password);

    if (!user) {
      await audit({ action: 'login_failed', entityType: 'user', metadata: { email: input.email.slice(0, 3) + '***' } });
      throw errors.unauthorized('Incorrect email or password.');
    }
    if (user.status !== 'active') throw errors.forbidden('This account is suspended. Contact support if you believe this is a mistake.');

    await createSession(c, user.id);
    await audit({ actorId: user.id, action: 'login', entityType: 'session', metadata: { method: 'password' } });
    return c.json({ user: await toSelfUser(user) });
  })

  /* ------------------------------- Logout -------------------------------- */
  .post('/logout', async (c) => {
    await revokeCurrentSession(c);
    return c.json({ ok: true });
  })

  /* --------------------------- Current user ------------------------------ */
  .get('/me', async (c) => {
    const user = await resolveSessionUser(c);
    if (!user) throw errors.unauthorized();
    const row = (await db.select().from(users).where(eq(users.id, user.id)).limit(1))[0];
    return c.json({ user: await toSelfUser(row) });
  })

  /* --------------------------- Email verify ------------------------------ */
  .post('/verify-email', rateLimitMiddleware('verify', 10, 60_000), async (c) => {
    const input = verifyEmailSchema.parse(await c.req.json());
    const tokenRow = await authService.consumeToken(input.token, 'email_verify');
    const wasVerified = await authService.markEmailVerified(tokenRow.userId);
    if (wasVerified) {
      const row = (await db.select().from(users).where(eq(users.id, tokenRow.userId)).limit(1))[0];
      if (row) await authService.sendWelcome(row.id, row.email, row.name);
    }
    await audit({ actorId: tokenRow.userId, action: 'email_verified', entityType: 'user', entityId: tokenRow.userId });
    return c.json({ ok: true });
  })

  .post('/resend-verification', requireAuth, rateLimitMiddleware('resend_verify', 3, 10 * 60_000), async (c) => {
    const user = getAuthUser(c);
    if (user.emailVerified) return c.json({ ok: true, alreadyVerified: true });
    const row = (await db.select().from(users).where(eq(users.id, user.id)).limit(1))[0];
    await authService.issueToken(user.id, 'email_verify', row.email, row.name);
    return c.json({ ok: true });
  })

  /* -------------------------- Password reset ----------------------------- */
  .post('/forgot-password', rateLimitMiddleware('forgot', 5, 10 * 60_000), async (c) => {
    const input = forgotPasswordSchema.parse(await c.req.json());
    const user = await authService.findByEmail(input.email);
    // Always return success to avoid account enumeration.
    if (user && user.status === 'active') {
      await authService.issueToken(user.id, 'password_reset', user.email, user.name);
      await audit({ actorId: user.id, action: 'password_reset_requested', entityType: 'user', entityId: user.id });
    }
    return c.json({ ok: true, message: 'If an account exists for that email, a reset link is on its way.' });
  })

  .post('/reset-password', rateLimitMiddleware('reset', 10, 10 * 60_000), async (c) => {
    const input = resetPasswordSchema.parse(await c.req.json());
    const tokenRow = await authService.consumeToken(input.token, 'password_reset');

    const passwordHash = await hashPassword(input.password);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, tokenRow.userId));
    // Reset invalidates all existing sessions (account recovery hygiene).
    await revokeAllSessions(tokenRow.userId);
    await audit({ actorId: tokenRow.userId, action: 'password_reset_completed', entityType: 'user', entityId: tokenRow.userId });
    return c.json({ ok: true });
  })

  .post('/change-password', requireAuth, rateLimitMiddleware('change_pw', 5, 10 * 60_000), async (c) => {
    const user = getAuthUser(c);
    const input = changePasswordSchema.parse(await c.req.json());
    const row = (await db.select().from(users).where(eq(users.id, user.id)).limit(1))[0];

    if (row.passwordHash) {
      const valid = await verifyPassword(input.currentPassword, row.passwordHash);
      if (!valid) throw errors.badRequest('Your current password is incorrect.');
    }
    const passwordHash = await hashPassword(input.newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    await audit({ actorId: user.id, action: 'password_changed', entityType: 'user', entityId: user.id });
    return c.json({ ok: true });
  })

  /* ---------------------------- Sessions list ---------------------------- */
  .get('/sessions', requireAuth, async (c) => {
    const user = getAuthUser(c);
    const rows = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, user.id), isNull(sessions.revokedAt)))
      .orderBy(desc(sessions.createdAt))
      .limit(50);
    return c.json({
      sessions: rows.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
      })),
    });
  })

  .delete('/sessions/:id', requireAuth, async (c) => {
    const user = getAuthUser(c);
    await revokeSession(c.req.param('id'), user.id);
    return c.json({ ok: true });
  })

  /* ---------------------------- Google OAuth ----------------------------- */
  .get('/providers', (c) => c.json({ google: googleOAuthEnabled }))

  .get('/google', async (c) => {
    if (!googleOAuthEnabled) throw errors.notFound('Google sign-in is not configured on this deployment.');
    const state = crypto.randomUUID();
    const redirectUri = `${env.API_URL.replace(/\/$/, '')}/api/v1/auth/google/callback`;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');

    // State cookie (double-submit) — CSRF protection for the OAuth flow.
    const cookie = `suraksha_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isProd ? '; Secure' : ''}`;
    c.header('Set-Cookie', cookie, { append: true });
    return c.redirect(authUrl.toString());
  })

  .get('/google/callback', rateLimitMiddleware('oauth_cb', 20, 60_000), async (c) => {
    if (!googleOAuthEnabled) throw errors.notFound('Google sign-in is not configured on this deployment.');

    const code = c.req.query('code');
    const state = c.req.query('state');
    const cookieState = c.req.header('cookie')
      ?.split(';')
      .map((p) => p.trim().split('='))
      .find(([k]) => k === 'suraksha_oauth_state')?.[1];

    if (!code || !state || !cookieState || state !== cookieState) {
      return c.redirect(`${env.APP_URL}/login?error=oauth_state`);
    }
    // One-time state: clear it immediately.
    c.header('Set-Cookie', 'suraksha_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0', { append: true });

    try {
      const redirectUri = `${env.API_URL.replace(/\/$/, '')}/api/v1/auth/google/callback`;
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID!,
          client_secret: env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      if (!tokenRes.ok) return c.redirect(`${env.APP_URL}/login?error=oauth_token`);
      const tokens = (await tokenRes.json()) as { access_token: string };

      const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!profileRes.ok) return c.redirect(`${env.APP_URL}/login?error=oauth_profile`);
      const profile = (await profileRes.json()) as { sub: string; email: string; email_verified: boolean; name?: string; picture?: string };

      if (!profile.email_verified) return c.redirect(`${env.APP_URL}/login?error=oauth_email_unverified`);

      let user = await authService.findByGoogleId(profile.sub);
      if (!user) {
        const byEmail = await authService.findByEmail(profile.email.toLowerCase());
        if (byEmail) {
          // Link Google to the existing account.
          await db.update(users).set({ googleId: profile.sub, updatedAt: new Date() }).where(eq(users.id, byEmail.id));
          user = byEmail;
        } else {
          // Derive a unique username from the email.
          const base = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24) || 'learner';
          let username = base;
          for (let i = 0; i < 20; i++) {
            if (!(await authService.findByUsername(username))) break;
            username = `${base}${Math.floor(Math.random() * 9000) + 1000}`.slice(0, 32);
          }
          user = await authService.createUser({
            name: profile.name?.slice(0, 100) ?? 'Learner',
            username,
            email: profile.email.toLowerCase(),
            passwordHash: null,
            authProvider: 'google',
            googleId: profile.sub,
            emailVerified: true,
          });
          await authService.sendWelcome(user.id, user.email, user.name);
        }
      }
      if (user.status !== 'active') return c.redirect(`${env.APP_URL}/login?error=account_suspended`);

      await createSession(c, user.id);
      await audit({ actorId: user.id, action: 'login', entityType: 'session', metadata: { method: 'google' } });
      const dest = user.onboardedAt ? '/dashboard' : '/onboarding';
      return c.redirect(`${env.APP_URL}${dest}`);
    } catch {
      return c.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }
  })

  /* --------------------- Dev-only flag hash utility ---------------------- */
  .post('/dev/flag-hash', async (c) => {
    if (!isProd) {
      const { flag } = z.object({ flag: z.string().min(1).max(500) }).parse(await c.req.json());
      return c.json({ hmac: flagHmac(flag) });
    }
    throw errors.notFound();
  });
