import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { notificationPreferences, notifications } from '../db/schema';

export const NOTIFICATION_KEYS = [
  'lab_completed',
  'achievement_unlocked',
  'rank_milestone',
  'new_lab',
  'new_lesson',
  'streak_reminder',
] as const;

/** Creates an in-app notification, honoring per-user preferences. */
export async function notify(opts: {
  userId: string;
  type: (typeof NOTIFICATION_KEYS)[number] | string;
  title: string;
  body?: string;
  link?: string | null;
}): Promise<void> {
  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(and(eq(notificationPreferences.userId, opts.userId), eq(notificationPreferences.key, opts.type)))
    .limit(1);
  // Default: in-app on, email off (no spam).
  const inApp = prefs[0] ? prefs[0].inApp : true;
  if (!inApp) return;

  await db.insert(notifications).values({
    userId: opts.userId,
    type: opts.type,
    title: opts.title,
    body: opts.body ?? '',
    link: opts.link ?? null,
  });
}
