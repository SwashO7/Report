import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { labDownloads } from '../db/schema';
import { env } from '../config/env';

/**
 * Egress cost control for lab package downloads.
 *
 * WHY THIS IS NOT JUST A RATE LIMIT: lab packages are large (up to 200 MB) and
 * bandwidth is metered. The in-memory rate limiter counts PER INSTANCE, so on a
 * scale-out runtime the real ceiling is the limit times the instance count - at
 * 10 instances x 10/min x 200 MB that is 20 GB per minute, roughly $144/hour of
 * egress from a single account. A per-instance counter cannot bound a bill.
 *
 * So the authoritative quota is counted in the DATABASE, which every instance
 * shares. The rate limiter still sits in front as cheap first-line defence; this
 * is the backstop that actually caps the spend.
 *
 * Downloads are already recorded in `lab_downloads` for analytics, so the quota
 * reads the same rows rather than introducing new state.
 */

export type QuotaVerdict =
  | { allowed: true; usedToday: number; remaining: number }
  | { allowed: false; usedToday: number; retryAfterSeconds: number };

/**
 * Checks a user's rolling 24-hour download count.
 *
 * A rolling window is used rather than a calendar day so the quota cannot be
 * doubled by waiting for local midnight.
 */
export async function checkDownloadQuota(userId: string): Promise<QuotaVerdict> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(labDownloads)
    .where(and(eq(labDownloads.userId, userId), gte(labDownloads.createdAt, since)));

  const usedToday = row?.count ?? 0;
  const max = env.LAB_DOWNLOAD_DAILY_MAX;

  if (usedToday >= max) {
    // Tell them when the oldest download in the window ages out, so the message
    // is actionable instead of a flat "come back later".
    const [oldest] = await db
      .select({ createdAt: labDownloads.createdAt })
      .from(labDownloads)
      .where(and(eq(labDownloads.userId, userId), gte(labDownloads.createdAt, since)))
      .orderBy(labDownloads.createdAt)
      .limit(1);

    const freesAt = oldest ? oldest.createdAt.getTime() + 24 * 60 * 60 * 1000 : Date.now() + 3600_000;
    return {
      allowed: false,
      usedToday,
      retryAfterSeconds: Math.max(60, Math.ceil((freesAt - Date.now()) / 1000)),
    };
  }

  return { allowed: true, usedToday, remaining: max - usedToday };
}

/**
 * Platform-wide daily egress circuit breaker.
 *
 * The per-user quota bounds one account. It does not bound a thousand accounts,
 * and signup is free - so a botnet that registers cheaply could still run the
 * bill up. This caps total downloads per rolling day across everyone and fails
 * CLOSED, turning a potential five-figure surprise into a visible outage that
 * can be raised deliberately.
 *
 * Set LAB_DOWNLOAD_GLOBAL_DAILY_MAX from real traffic once it is known: it
 * should sit comfortably above a good day and well below what the budget can
 * absorb.
 */
export async function checkGlobalDownloadBudget(): Promise<{ allowed: boolean; usedToday: number; max: number }> {
  const max = env.LAB_DOWNLOAD_GLOBAL_DAILY_MAX;
  if (max <= 0) return { allowed: true, usedToday: 0, max: 0 }; // disabled

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(labDownloads)
    .where(gte(labDownloads.createdAt, since));

  const usedToday = row?.count ?? 0;
  return { allowed: usedToday < max, usedToday, max };
}
