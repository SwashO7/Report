import { Hono } from 'hono';
import { z } from 'zod';
import { getAuthUser } from '../core/auth';
import { hasRole } from '../core/rbac';
import { errors } from '../core/errors';
import { audit } from '../audit/audit.service';
import {
  listTemplates,
  getTemplate,
  upsertTemplate,
  resolveTemplate,
  sampleVarsFor,
} from '../email/templates.service';
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  cancelCampaign,
  sendCampaign,
  audienceCount,
  type CampaignAudience,
} from '../email/campaigns.service';

/**
 * Admin email surface. Mounted under /api/v1/admin/email, which already sits
 * behind the network guard and admin write rate limiter in admin.routes.ts.
 *
 * Templates require a content-editor role and up; campaigns require an
 * administrator role and up (they mail thousands of people). Every mutation is
 * written to the audit log. Email addresses and tokens are never logged.
 */

const templateGate = hasRole('content_editor', 'administrator', 'super_admin');
const campaignGate = hasRole('administrator', 'super_admin');

const audienceSchema = z.enum(['all', 'verified', 'active_30d']);

const templateUpsertSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().max(2000).nullish(),
  subject: z.string().trim().min(1).max(500),
  htmlBody: z.string().min(1).max(200_000),
  textBody: z.string().max(200_000).nullish(),
  enabled: z.boolean().optional(),
  transactional: z.boolean().optional(),
});

const previewSchema = z.object({ vars: z.record(z.string(), z.unknown()).optional() });

const campaignCreateSchema = z.object({
  subject: z.string().trim().min(1).max(500),
  htmlBody: z.string().min(1).max(500_000),
  textBody: z.string().max(500_000).nullish(),
  audience: audienceSchema.default('verified'),
  scheduledFor: z.coerce.date().nullish(),
});

const campaignUpdateSchema = campaignCreateSchema.partial();

export const adminEmailRoutes = new Hono()

  /* ------------------------------- Templates ------------------------------- */
  .get('/templates', templateGate, async (c) => {
    const rows = await listTemplates();
    return c.json({
      templates: rows.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  })

  .get('/templates/:key', templateGate, async (c) => {
    const row = await getTemplate(c.req.param('key'));
    if (!row) throw errors.notFound('Template not found.');
    return c.json({ template: { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() } });
  })

  .patch('/templates/:key', templateGate, async (c) => {
    const user = getAuthUser(c);
    const key = c.req.param('key');
    const input = templateUpsertSchema.parse(await c.req.json());
    const row = await upsertTemplate(key, input, user.id);
    await audit({ actorId: user.id, action: 'email_template_updated', entityType: 'email_template', entityId: key, metadata: { transactional: row.transactional } });
    return c.json({ template: { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() } });
  })

  /** Render a template with sample (or supplied) vars. Sends NOTHING. */
  .post('/templates/:key/preview', templateGate, async (c) => {
    const key = c.req.param('key');
    const body = await c.req.json().catch(() => ({}));
    const { vars } = previewSchema.parse(body ?? {});
    const merged = { ...sampleVarsFor(key), ...(vars ?? {}) };
    const resolved = await resolveTemplate(key, merged);
    if (!resolved) throw errors.notFound('Template not found.');
    return c.json({ subject: resolved.subject, html: resolved.html, text: resolved.text, fromDb: resolved.fromDb, transactional: resolved.transactional });
  })

  /* ------------------------------- Campaigns ------------------------------- */
  .get('/campaigns', campaignGate, async (c) => {
    const url = new URL(c.req.url);
    const result = await listCampaigns({
      status: url.searchParams.get('status') ?? undefined,
      page: Number(url.searchParams.get('page') ?? 1),
      pageSize: Number(url.searchParams.get('pageSize') ?? 20),
    });
    return c.json({
      campaigns: result.campaigns.map((c2) => ({
        ...c2,
        scheduledFor: c2.scheduledFor?.toISOString() ?? null,
        sentAt: c2.sentAt?.toISOString() ?? null,
        createdAt: c2.createdAt.toISOString(),
        updatedAt: c2.updatedAt.toISOString(),
      })),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    });
  })

  .post('/campaigns', campaignGate, async (c) => {
    const user = getAuthUser(c);
    const input = campaignCreateSchema.parse(await c.req.json());
    const row = await createCampaign(
      {
        subject: input.subject,
        htmlBody: input.htmlBody,
        textBody: input.textBody ?? null,
        audience: input.audience as CampaignAudience,
        scheduledFor: input.scheduledFor ?? null,
      },
      user.id,
    );
    await audit({ actorId: user.id, action: 'email_campaign_created', entityType: 'email_campaign', entityId: row.id, metadata: { audience: row.audience } });
    return c.json({ campaign: { ...row } }, 201);
  })

  .get('/campaigns/:id', campaignGate, async (c) => {
    const row = await getCampaign(c.req.param('id'));
    if (!row) throw errors.notFound('Campaign not found.');
    return c.json({
      campaign: {
        ...row,
        scheduledFor: row.scheduledFor?.toISOString() ?? null,
        sentAt: row.sentAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  })

  .patch('/campaigns/:id', campaignGate, async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const input = campaignUpdateSchema.parse(await c.req.json());
    const row = await updateCampaign(id, {
      ...input,
      audience: input.audience as CampaignAudience | undefined,
      textBody: input.textBody ?? undefined,
      scheduledFor: input.scheduledFor ?? undefined,
    });
    await audit({ actorId: user.id, action: 'email_campaign_updated', entityType: 'email_campaign', entityId: id });
    return c.json({ campaign: { ...row } });
  })

  .post('/campaigns/:id/send', campaignGate, async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    await audit({ actorId: user.id, action: 'email_campaign_send', entityType: 'email_campaign', entityId: id });
    const result = await sendCampaign(id);
    return c.json(result);
  })

  .post('/campaigns/:id/cancel', campaignGate, async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const row = await cancelCampaign(id);
    await audit({ actorId: user.id, action: 'email_campaign_cancelled', entityType: 'email_campaign', entityId: id });
    return c.json({ campaign: { ...row } });
  })

  .get('/campaigns/:id/recipients/count', campaignGate, async (c) => {
    const row = await getCampaign(c.req.param('id'));
    if (!row) throw errors.notFound('Campaign not found.');
    const total = await audienceCount(row.audience as CampaignAudience);
    return c.json({ audience: row.audience, count: total });
  });
