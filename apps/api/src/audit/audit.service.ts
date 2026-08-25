import { db } from '../db/client';
import { auditLogs } from '../db/schema';
import { hashIp } from '../core/crypto';
import { getClientIp } from '../core/errors';
import type { Context } from 'hono';

/**
 * Audit trail for security-relevant and administrative actions.
 * Never stores secrets; metadata is caller-curated.
 */
export async function audit(opts: {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorId: opts.actorId ?? null,
      action: opts.action,
      entityType: opts.entityType ?? '',
      entityId: opts.entityId ?? null,
      metadata: opts.metadata ?? {},
      ipHash: opts.ip ? hashIp(opts.ip) : null,
    });
  } catch (err) {
    // Audit failures must never break the request; log to server instead.
    console.error(JSON.stringify({ level: 'error', msg: 'audit_write_failed', action: opts.action, err: String(err) }));
  }
}

export function auditFromContext(c: Context, opts: { actorId?: string | null; action: string; entityType?: string; entityId?: string | null; metadata?: Record<string, unknown> }) {
  return audit({ ...opts, ip: getClientIp(c) });
}
