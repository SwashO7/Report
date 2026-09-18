import { and, asc, count, desc, eq, gt, isNull, isNotNull, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { emailCampaigns, emailOutbox, users } from '../db/schema';
import { errors } from '../core/errors';
import { appendUnsubscribeFooter, unsubscribeTextLine } from './unsubscribe';

/**
 * Email campaigns — one editorial announcement sent to many recipients.
 *
 * Sending expands the campaign into per-recipient `email_outbox` rows in BATCHES
 * using keyset pagination on `users.id`, persisting `lastCursor` after each
 * batch. A crash mid-send therefore resumes from the last committed cursor
 * instead of re-mailing everyone, and re-running `sendCampaign` is idempotent.
 */

const BATCH_SIZE = 100;

export type CampaignAudience = 'all' | 'verified' | 'active_30d';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';

/**
 * Shared audience predicate: never mail opted-out, non-active, or soft-deleted
 * users. `verified` additionally requires a confirmed email; `active_30d`
 * requires recent activity.
 */
function audienceWhere(audience: CampaignAudience) {
  const base = [eq(users.emailOptOut, false), eq(users.status, 'active'), isNull(users.deletedAt)];
  if (audience === 'verified') base.push(isNotNull(users.emailVerifiedAt));
  if (audience === 'active_30d') {
    base.push(isNotNull(users.emailVerifiedAt));
    base.push(sql`${users.lastActiveAt} >= now() - interval '30 days'`);
  }
  return and(...base);
}

/**
 * Resolve an audience to the list of recipient email addresses.
 * Excludes opted-out, non-active, soft-deleted, and (for 'verified'/'active_30d')
 * unverified users. Intended for previews/tests; sends stream in batches.
 */
export async function resolveAudience(audience: CampaignAudience): Promise<string[]> {
  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(audienceWhere(audience))
    .orderBy(asc(users.id));
  return rows.map((r) => r.email);
}

/** Count of recipients an audience would reach, without materializing emails. */
export async function audienceCount(audience: CampaignAudience): Promise<number> {
  const [{ total }] = await db.select({ total: count() }).from(users).where(audienceWhere(audience));
  return Number(total);
}

/* --------------------------------- CRUD ---------------------------------- */

export interface CampaignInput {
  subject: string;
  htmlBody: string;
  textBody?: string | null;
  audience: CampaignAudience;
  scheduledFor?: Date | null;
  triggerKind?: string | null;
  triggerEntityId?: string | null;
}

export async function createCampaign(input: CampaignInput, createdBy: string) {
  const [row] = await db
    .insert(emailCampaigns)
    .values({
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody ?? null,
      audience: input.audience,
      status: input.scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: input.scheduledFor ?? null,
      triggerKind: input.triggerKind ?? null,
      triggerEntityId: input.triggerEntityId ?? null,
      createdBy,
    })
    .returning();
  return row;
}

export async function listCampaigns(opts: { status?: string; page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, opts.pageSize ?? 20));
  const where = opts.status ? eq(emailCampaigns.status, opts.status) : undefined;
  const rows = await db
    .select()
    .from(emailCampaigns)
    .where(where)
    .orderBy(desc(emailCampaigns.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total }] = await db.select({ total: count() }).from(emailCampaigns).where(where);
  return { campaigns: rows, page, pageSize, total: Number(total) };
}

export async function getCampaign(id: string) {
  return (await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1))[0] ?? null;
}

/**
 * Update an editable campaign. Only draft/scheduled campaigns may change; once a
 * campaign is sending/sent/cancelled its content is frozen for auditability.
 */
export async function updateCampaign(id: string, input: Partial<CampaignInput>) {
  const current = await getCampaign(id);
  if (!current) throw errors.notFound('Campaign not found.');
  if (!['draft', 'scheduled'].includes(current.status)) {
    throw errors.badRequest('Only draft or scheduled campaigns can be edited.');
  }
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (input.subject !== undefined) patch.subject = input.subject;
  if (input.htmlBody !== undefined) patch.htmlBody = input.htmlBody;
  if (input.textBody !== undefined) patch.textBody = input.textBody;
  if (input.audience !== undefined) patch.audience = input.audience;
  if (input.scheduledFor !== undefined) {
    patch.scheduledFor = input.scheduledFor;
    patch.status = input.scheduledFor ? 'scheduled' : 'draft';
  }
  const [row] = await db.update(emailCampaigns).set(patch).where(eq(emailCampaigns.id, id)).returning();
  return row;
}

/** Cancel a campaign that has not finished sending. */
export async function cancelCampaign(id: string) {
  const current = await getCampaign(id);
  if (!current) throw errors.notFound('Campaign not found.');
  if (['sent', 'cancelled'].includes(current.status)) {
    throw errors.badRequest(`Campaign is already ${current.status}.`);
  }
  const [row] = await db
    .update(emailCampaigns)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(emailCampaigns.id, id))
    .returning();
  return row;
}

/* ------------------------------- Sending --------------------------------- */

/**
 * Expand a campaign into `email_outbox` rows, resumably and idempotently.
 *
 * - Keyset pagination on `users.id` with the campaign's `lastCursor` as the
 *   resume point, so a crash resumes rather than re-mailing.
 * - Non-transactional body, so every recipient's copy carries an unsubscribe
 *   link keyed to their own id.
 * - Idempotent per recipient: a unique guard on (recipient, template, this
 *   campaign) prevents a re-run from double-queuing anyone already expanded.
 * - Counters and status are updated after each batch; a delivery worker/provider
 *   drains the outbox — this function does the safe expansion, not the SMTP call.
 */
export async function sendCampaign(id: string): Promise<{ status: CampaignStatus; recipientCount: number; sentCount: number; failedCount: number }> {
  const campaign = await getCampaign(id);
  if (!campaign) throw errors.notFound('Campaign not found.');
  if (campaign.status === 'cancelled') throw errors.badRequest('Campaign was cancelled.');
  if (campaign.status === 'sent') {
    return { status: 'sent', recipientCount: campaign.recipientCount, sentCount: campaign.sentCount, failedCount: campaign.failedCount };
  }

  const audience = campaign.audience as CampaignAudience;
  const templateKey = `campaign:${campaign.id}`;

  // Mark as sending (from draft/scheduled/failed/sending — all resumable).
  await db.update(emailCampaigns).set({ status: 'sending', error: null, updatedAt: new Date() }).where(eq(emailCampaigns.id, id));

  let cursor = campaign.lastCursor ?? '';
  let recipientCount = campaign.recipientCount ?? 0;
  let sentCount = campaign.sentCount ?? 0;
  let failedCount = campaign.failedCount ?? 0;

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Re-read status each batch so a concurrent cancel stops the expansion.
      const live = await getCampaign(id);
      if (!live || live.status === 'cancelled') {
        return { status: 'cancelled', recipientCount, sentCount, failedCount };
      }

      const conds = [audienceWhere(audience)];
      if (cursor) conds.push(gt(users.id, cursor));
      const batch = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(and(...conds))
        .orderBy(asc(users.id))
        .limit(BATCH_SIZE);

      if (batch.length === 0) break;

      for (const recipient of batch) {
        recipientCount += 1;

        // Idempotency guard: skip anyone already queued for THIS campaign.
        const already = (
          await db
            .select({ id: emailOutbox.id })
            .from(emailOutbox)
            .where(and(eq(emailOutbox.toEmail, recipient.email), eq(emailOutbox.templateKey, templateKey)))
            .limit(1)
        )[0];
        if (already) {
          sentCount += 1;
          continue;
        }

        const html = appendUnsubscribeFooter(campaign.htmlBody, recipient.id);
        const text =
          (campaign.textBody ?? campaign.htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) +
          unsubscribeTextLine(recipient.id);

        try {
          await db.insert(emailOutbox).values({
            toEmail: recipient.email,
            templateKey,
            subject: campaign.subject,
            // Store the rendered body so the delivery worker sends exactly this.
            payload: { campaignId: campaign.id, html, text } as Record<string, unknown>,
          });
          sentCount += 1;
        } catch (err) {
          failedCount += 1;
          console.error(JSON.stringify({ level: 'error', msg: 'campaign_outbox_insert_failed', campaignId: campaign.id }));
        }
      }

      cursor = batch[batch.length - 1].id;
      // Persist the cursor + counters after each batch so a crash resumes here.
      await db
        .update(emailCampaigns)
        .set({ lastCursor: cursor, recipientCount, sentCount, failedCount, updatedAt: new Date() })
        .where(eq(emailCampaigns.id, id));

      if (batch.length < BATCH_SIZE) break;
    }

    const [row] = await db
      .update(emailCampaigns)
      .set({ status: 'sent', recipientCount, sentCount, failedCount, sentAt: new Date(), updatedAt: new Date() })
      .where(eq(emailCampaigns.id, id))
      .returning();
    return { status: row.status as CampaignStatus, recipientCount, sentCount, failedCount };
  } catch (err) {
    await db
      .update(emailCampaigns)
      .set({ status: 'failed', error: 'Send interrupted; safe to retry.', recipientCount, sentCount, failedCount, updatedAt: new Date() })
      .where(eq(emailCampaigns.id, id));
    throw errors.internal('Campaign send failed; it can be safely re-run to resume.');
  }
}
