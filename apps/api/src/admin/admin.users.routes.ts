import { Hono } from 'hono';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { users } from '../db/schema';
import { errors } from '../core/errors';
import { requireRole, getAuthUser } from '../core/auth';
import { hasRole } from '../core/rbac';
import { audit } from '../audit/audit.service';
import { adminUserQuerySchema, adminUserUpdateSchema, xpAdjustSchema } from '@suraksha/shared';
import { revokeAllSessions } from '../core/auth';
import { awardXp } from '../gamification/xp';
import { notify } from '../notifications/notifications.service';

export const adminUserRoutes = new Hono()
  .use('*', requireRole('administrator', 'super_admin'))

  .get('/', async (c) => {
    const query = adminUserQuerySchema.parse(Object.fromEntries(new URL(c.req.url).searchParams));
    const conditions = [];
    if (query.q) {
      const like = `%${query.q.replace(/[%_]/g, '')}%`;
      conditions.push(or(ilike(users.name, like), ilike(users.email, like), ilike(users.username, like)));
    }
    if (query.role) conditions.push(eq(users.role, query.role));
    if (query.status) conditions.push(eq(users.status, query.status));
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        xp: users.xp,
        emailVerifiedAt: users.emailVerifiedAt,
        authProvider: users.authProvider,
        createdAt: users.createdAt,
        lastActiveAt: users.lastActiveAt,
      })
      .from(users)
      .where(where)
      .orderBy(query.sort === 'xp' ? desc(users.xp) : query.sort === 'name' ? users.name : desc(users.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    const [{ total }] = await db.select({ total: count() }).from(users).where(where);

    return c.json({
      users: rows.map((r) => ({
        ...r,
        emailVerified: Boolean(r.emailVerifiedAt),
        emailVerifiedAt: undefined,
        createdAt: r.createdAt.toISOString(),
        lastActiveAt: r.lastActiveAt.toISOString(),
      })),
      pagination: { page: query.page, pageSize: query.pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / query.pageSize) },
    });
  })

  .patch('/:id', hasRole('super_admin'), async (c) => {
    const actor = getAuthUser(c);
    const input = adminUserUpdateSchema.parse(await c.req.json());
    const targetId = c.req.param('id');
    if (targetId === actor.id && (input.role || input.status)) {
      throw errors.badRequest('You cannot change your own role or status.');
    }
    const target = (await db.select().from(users).where(eq(users.id, targetId)).limit(1))[0];
    if (!target) throw errors.notFound('User not found.');
    if (target.role === 'super_admin' && actor.role !== 'super_admin') throw errors.forbidden();

    await db
      .update(users)
      .set({
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.emailVerified !== undefined ? { emailVerifiedAt: input.emailVerified ? new Date() : null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetId));

    if (input.status === 'suspended') await revokeAllSessions(targetId);

    await audit({
      actorId: actor.id,
      action: 'user_admin_updated',
      entityType: 'user',
      entityId: targetId,
      metadata: { changes: { ...input }, targetUsername: target.username },
    });
    return c.json({ ok: true });
  })

  .post('/xp-adjust', hasRole('super_admin'), async (c) => {
    const actor = getAuthUser(c);
    const input = xpAdjustSchema.parse(await c.req.json());
    const target = (await db.select().from(users).where(eq(users.id, input.userId)).limit(1))[0];
    if (!target) throw errors.notFound('User not found.');

    await awardXp({
      userId: input.userId,
      amount: input.amount,
      source: 'admin_adjustment',
      sourceId: actor.id,
      description: `Manual adjustment by ${actor.username}: ${input.reason}`,
    });
    await audit({
      actorId: actor.id,
      action: 'xp_adjusted',
      entityType: 'user',
      entityId: input.userId,
      metadata: { amount: input.amount, reason: input.reason },
    });
    await notify({
      userId: input.userId,
      type: 'achievement_unlocked',
      title: input.amount > 0 ? `+${input.amount} XP awarded` : `${input.amount} XP adjustment`,
      body: input.reason,
      link: '/dashboard',
    });
    return c.json({ ok: true });
  });
