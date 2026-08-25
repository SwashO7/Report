import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { notificationPreferences, notifications, users } from '../db/schema';
import { errors } from '../core/errors';
import { requireAuth, getAuthUser } from '../core/auth';
import { onboardingSchema, updateProfileSchema } from '@suraksha/shared';
import { audit } from '../audit/audit.service';
import { NOTIFICATION_KEYS } from '../notifications/notifications.service';
import { revokeAllSessions, clearSessionCookie } from '../core/auth';

export const settingsRoutes = new Hono()
  .use('*', requireAuth)

  /* ------------------------------- Profile -------------------------------- */
  .get('/profile', async (c) => {
    const user = getAuthUser(c);
    const row = (await db.select().from(users).where(eq(users.id, user.id)).limit(1))[0];
    return c.json({
      name: row.name,
      username: row.username,
      email: row.email,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      profileVisibility: row.profileVisibility,
      experienceLevel: row.experienceLevel,
      interests: row.interests,
    });
  })

  .patch('/profile', async (c) => {
    const user = getAuthUser(c);
    const input = updateProfileSchema.parse(await c.req.json());

    if (input.username && input.username !== user.username) {
      const taken = (await db.select({ id: users.id }).from(users).where(eq(users.username, input.username)).limit(1))[0];
      if (taken) throw errors.conflict('This username is taken.');
    }

    await db
      .update(users)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.profileVisibility !== undefined ? { profileVisibility: input.profileVisibility } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await audit({ actorId: user.id, action: 'profile_updated', entityType: 'user', entityId: user.id });
    return c.json({ ok: true });
  })

  /* ------------------------------ Onboarding ------------------------------ */
  .post('/onboarding', async (c) => {
    const user = getAuthUser(c);
    const input = onboardingSchema.parse(await c.req.json());
    await db
      .update(users)
      .set({
        experienceLevel: input.experienceLevel,
        interests: input.interests,
        onboardedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    return c.json({ ok: true });
  })

  /* ---------------------------- Notifications ------------------------------ */
  .get('/notifications', async (c) => {
    const user = getAuthUser(c);
    const rows = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(notifications.createdAt).limit(50);
    const unread = rows.filter((r) => !r.readAt).length;
    return c.json({
      notifications: rows
        .slice()
        .reverse()
        .map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          link: n.link,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        })),
      unread,
    });
  })

  .post('/notifications/:id/read', async (c) => {
    const user = getAuthUser(c);
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, c.req.param('id')), eq(notifications.userId, user.id)));
    return c.json({ ok: true });
  })

  .post('/notifications/read-all', async (c) => {
    const user = getAuthUser(c);
    await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, user.id)));
    return c.json({ ok: true });
  })

  .get('/notification-preferences', async (c) => {
    const user = getAuthUser(c);
    const rows = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, user.id));
    const map = new Map(rows.map((r) => [r.key, r]));
    return c.json({
      preferences: NOTIFICATION_KEYS.map((key) => ({
        key,
        inApp: map.get(key)?.inApp ?? true,
        email: map.get(key)?.email ?? false,
      })),
    });
  })

  .patch('/notification-preferences', async (c) => {
    const user = getAuthUser(c);
    const input = z
      .object({
        key: z.string().max(80),
        inApp: z.boolean().optional(),
        email: z.boolean().optional(),
      })
      .parse(await c.req.json());

    await db
      .insert(notificationPreferences)
      .values({
        userId: user.id,
        key: input.key,
        inApp: input.inApp ?? true,
        email: input.email ?? false,
      })
      .onConflictDoUpdate({
        target: [notificationPreferences.userId, notificationPreferences.key],
        set: {
          ...(input.inApp !== undefined ? { inApp: input.inApp } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
        },
      });
    return c.json({ ok: true });
  })

  /* --------------------------- Account deletion ---------------------------- */
  .delete('/account', async (c) => {
    const user = getAuthUser(c);
    // Soft-delete: anonymize identity, revoke sessions, keep platform integrity.
    const anonSuffix = user.id.slice(0, 8);
    await db
      .update(users)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
        name: 'Deleted Learner',
        username: `deleted-${anonSuffix}`,
        email: `deleted-${anonSuffix}@suraksha.invalid`,
        avatarUrl: null,
        bio: null,
        googleId: null,
        profileVisibility: 'private',
      })
      .where(eq(users.id, user.id));
    await revokeAllSessions(user.id);
    clearSessionCookie(c);
    await audit({ action: 'account_deleted', entityType: 'user', entityId: user.id });
    return c.json({ ok: true });
  });
