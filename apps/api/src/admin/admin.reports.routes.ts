import { Hono } from 'hono';
import { REPORT_MANAGE_ROLES } from '@suraksha/shared';
import { getAuthUser } from '../core/auth';
import { hasRole } from '../core/rbac';
import { audit } from '../audit/audit.service';
import {
  adminCreateReport,
  adminDeleteReport,
  adminGetReport,
  adminListReports,
  adminSetReportStatus,
  adminUpdateReport,
  readReportForm,
  reportStatusSchema,
} from '../reports/reports.service';

/**
 * Report management. Mounted under /api/v1/admin, so the admin network guard,
 * the staff gate and the admin write rate limit already apply; this router then
 * narrows access to administrators only. Every write is audited.
 */
export const adminReportRoutes = new Hono()
  .use('*', hasRole(...REPORT_MANAGE_ROLES))

  .get('/', async (c) => {
    const url = new URL(c.req.url);
    const page = Math.max(1, Math.trunc(Number(url.searchParams.get('page'))) || 1);
    const pageSize = Math.min(100, Math.max(5, Math.trunc(Number(url.searchParams.get('pageSize'))) || 20));
    return c.json(
      await adminListReports({ q: url.searchParams.get('q'), status: url.searchParams.get('status'), page, pageSize }),
    );
  })

  .get('/:id', async (c) => c.json({ report: await adminGetReport(c.req.param('id')) }))

  .post('/', async (c) => {
    const user = getAuthUser(c);
    const row = await adminCreateReport(await readReportForm(c), user.id);
    await audit({
      actorId: user.id,
      action: 'report_created',
      entityType: 'report',
      entityId: row.id,
      metadata: { slug: row.slug, status: row.status, hasImage: Boolean(row.imageKey), hasVideo: Boolean(row.videoKey) },
    });
    return c.json({ report: await adminGetReport(row.id) }, 201);
  })

  .patch('/:id', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const { row, changes, previousSlug } = await adminUpdateReport(id, await readReportForm(c));
    await audit({
      actorId: user.id,
      action: 'report_modified',
      entityType: 'report',
      entityId: id,
      metadata: { slug: row.slug, ...(previousSlug !== row.slug ? { previousSlug } : {}), changes },
    });
    return c.json({ report: await adminGetReport(id) });
  })

  .post('/:id/status', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const { status } = reportStatusSchema.parse(await c.req.json().catch(() => ({})));
    const { row, from } = await adminSetReportStatus(id, status);
    await audit({
      actorId: user.id,
      action: status === 'published' ? 'report_published' : 'report_unpublished',
      entityType: 'report',
      entityId: id,
      metadata: { slug: row.slug, from, to: status },
    });
    return c.json({ report: await adminGetReport(id) });
  })

  .delete('/:id', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const removed = await adminDeleteReport(id);
    await audit({ actorId: user.id, action: 'report_deleted', entityType: 'report', entityId: id, metadata: { slug: removed.slug, title: removed.title } });
    return c.json({ ok: true });
  });
