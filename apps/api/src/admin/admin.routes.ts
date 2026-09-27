import { Hono } from 'hono';
import { requireRole, getAuthUser } from '../core/auth';
import { userRateLimitMiddleware } from '../core/middleware';
import { adminNetworkGuard } from '../core/admin-network';
import { hasRole } from '../core/rbac';
import { adminStats, labAnalytics, lessonAnalytics } from './analytics.service';
import { allSettings, setSetting } from './settings.service';
import { audit } from '../audit/audit.service';
import { z } from 'zod';
import { errors } from '../core/errors';
import { eq, desc, count, ilike, or, and } from 'drizzle-orm';
import { db } from '../db/client';
import { auditLogs, users } from '../db/schema';
import { adminUserRoutes } from './admin.users.routes';
import { adminContentRoutes } from './admin.content.routes';
import { adminDiagramRoutes } from './admin.diagrams.routes';
import { adminLabRoutes } from './admin.labs.routes';
import { adminAchievementRoutes } from './admin.achievements.routes';
import { adminEmailRoutes } from './admin.email.routes';
import { adminReportRoutes } from './admin.reports.routes';

export const adminRoutes = new Hono()

  /* ----------------------------- Network gate ------------------------------ */
  // Runs BEFORE authentication on purpose: an attacker outside the allowlist
  // should not even be able to submit credentials here, so stolen staff
  // passwords and session-fixation attempts never reach the login path.
  .use('*', adminNetworkGuard())

  /* --------------------------- Authorization gate -------------------------- */
  // Coarse gate: any staff role may enter /admin. Each sub-router then enforces
  // its own stricter role requirements server-side.
  .use('*', requireRole('moderator', 'content_editor', 'lab_manager', 'administrator', 'super_admin'))

  /**
   * Budget every admin WRITE by account.
   *
   * The README claimed admin surfaces were rate limited; they were not. A staff
   * session is the most valuable credential on the platform, so if one is stolen
   * this caps how fast it can be used to rewrite content or exfiltrate through
   * pagination. Reads are left alone so the dashboard stays responsive.
   */
  .use('*', async (c, next) => {
    if (c.req.method === 'GET' || c.req.method === 'HEAD' || c.req.method === 'OPTIONS') return next();
    return userRateLimitMiddleware('admin_write', 120, 60_000)(c, next);
  })

  /* ------------------------------- Stats ----------------------------------- */
  .get('/stats', async (c) => c.json(await adminStats()))

  .get('/analytics/lessons', async (c) => c.json({ lessons: await lessonAnalytics() }))

  .get('/labs/:id/analytics', hasRole('lab_manager', 'administrator', 'super_admin'), async (c) => {
    return c.json(await labAnalytics(c.req.param('id')));
  })

  /* ------------------------------ Settings --------------------------------- */
  .get('/settings', hasRole('administrator', 'super_admin'), async (c) => {
    return c.json({ settings: await allSettings() });
  })

  .patch('/settings', hasRole('administrator', 'super_admin'), async (c) => {
    const user = getAuthUser(c);
    const input = z
      .object({
        key: z.string().min(1).max(100),
        value: z.unknown(),
      })
      .parse(await c.req.json());
    if (!['xp_config', 'platform_config'].includes(input.key)) {
      throw errors.badRequest('Unknown settings key.');
    }
    await setSetting(input.key, input.value, user.id);
    await audit({ actorId: user.id, action: 'settings_updated', entityType: 'setting', entityId: input.key });
    return c.json({ ok: true });
  })

  /* -------------------------------- Audit ---------------------------------- */
  .get('/audit', async (c) => {
    const url = new URL(c.req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get('pageSize') ?? 30)));
    const q = url.searchParams.get('q');

    const where = q ? and(or(ilike(auditLogs.action, `%${q}%`), ilike(auditLogs.entityType, `%${q}%`))) : undefined;
    const rows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        ipHash: auditLogs.ipHash,
        createdAt: auditLogs.createdAt,
        actorName: users.name,
        actorUsername: users.username,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const [{ total }] = await db.select({ total: count() }).from(auditLogs).where(where);

    return c.json({
      entries: rows.map((r) => ({
        id: r.id,
        actor: r.actorUsername ? { username: r.actorUsername, name: r.actorName ?? '' } : null,
        action: r.action,
        entityType: r.entityType,
        entityId: r.entityId,
        metadata: r.metadata,
        ipHash: r.ipHash,
        createdAt: r.createdAt.toISOString(),
      })),
      pagination: { page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) },
    });
  })

  /* ----------------------------- Sub-domains -------------------------------- */
  .route('/users', adminUserRoutes)
  .route('/content', adminContentRoutes)
  .route('/diagrams', adminDiagramRoutes)
  .route('/labs', adminLabRoutes)
  .route('/achievements', adminAchievementRoutes)
  .route('/email', adminEmailRoutes)
  .route('/reports', adminReportRoutes);
