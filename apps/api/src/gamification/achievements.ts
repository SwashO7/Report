import { and, count, eq, gte, isNotNull, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  achievements,
  labAttempts,
  labCategories,
  labs,
  lessonProgress,
  lessons,
  notifications,
  practiceCompletions,
  userAchievements,
  users,
} from '../db/schema';
import { awardXp } from './xp';

export interface AchievementCriteria {
  event: string;
  metric: string;
  threshold: number;
  categorySlug?: string;
  maxHints?: number;
  withinMinutes?: number;
}

export type AchievementRow = typeof achievements.$inferSelect;

export interface UnlockContext {
  userId: string;
  event: string;
  /** e.g. lab category slug for category-scoped criteria */
  categorySlug?: string;
  /** hints used in the triggering action */
  hintsUsed?: number;
  /** solve time in seconds for the triggering action */
  durationSeconds?: number;
  /** first attempt solve for the triggering action */
  firstAttemptSolve?: boolean;
}

/** Pure evaluator: does a single criterion match the given context? */
export function criteriaMatches(criteria: AchievementCriteria, ctx: UnlockContext): boolean {
  if (criteria.event !== ctx.event) return false;
  if (criteria.categorySlug && criteria.categorySlug !== ctx.categorySlug) return false;
  if (criteria.maxHints !== undefined && (ctx.hintsUsed ?? 0) > criteria.maxHints) return false;
  if (criteria.withinMinutes !== undefined && (ctx.durationSeconds ?? Infinity) > criteria.withinMinutes * 60) return false;
  if (criteria.metric === 'first_attempt_solve' && !ctx.firstAttemptSolve) return false;
  return true;
}

function generateShareSlug(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 16);
}

/** Metrics that can be satisfied by a simple count query per event. */
async function metricValue(userId: string, criteria: AchievementCriteria): Promise<number | null> {
  switch (criteria.metric) {
    case 'count':
    case 'first_attempt_solve': {
      if (criteria.event === 'lab_solved') {
        const rows = await db
          .select({ n: count() })
          .from(labAttempts)
          .innerJoin(labs, eq(labAttempts.labId, labs.id))
          .innerJoin(labCategories, eq(labs.categoryId, labCategories.id))
          .where(
            and(
              eq(labAttempts.userId, userId),
              eq(labAttempts.solved, true),
              criteria.categorySlug ? eq(labCategories.slug, criteria.categorySlug) : undefined,
              criteria.maxHints !== undefined ? sql`${labAttempts.hintsUsed} <= ${criteria.maxHints}` : undefined,
              criteria.metric === 'first_attempt_solve' ? eq(labAttempts.firstAttemptSolve, true) : undefined,
            ),
          );
        return rows[0]?.n ?? 0;
      }
      if (criteria.event === 'lesson_completed') {
        const rows = await db
          .select({ n: count() })
          .from(lessonProgress)
          .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
          .where(and(eq(lessonProgress.userId, userId), isNotNull(lessonProgress.completedAt)));
        return rows[0]?.n ?? 0;
      }
      if (criteria.event === 'practice_completed') {
        const rows = await db.select({ n: count() }).from(practiceCompletions).where(eq(practiceCompletions.userId, userId));
        return rows[0]?.n ?? 0;
      }
      if (criteria.event === 'streak_day') {
        const rows = await db.select({ streak: users.streakCount }).from(users).where(eq(users.id, userId));
        return rows[0]?.streak ?? 0;
      }
      return null;
    }
    case 'speed_solve': {
      // Fastest solve time among solved labs (with hint constraint if set).
      const rows = await db
        .select({ t: labAttempts.solveTimeSeconds })
        .from(labAttempts)
        .where(
          and(
            eq(labAttempts.userId, userId),
            eq(labAttempts.solved, true),
            isNotNull(labAttempts.solveTimeSeconds),
            criteria.maxHints !== undefined ? sql`${labAttempts.hintsUsed} <= ${criteria.maxHints}` : undefined,
          ),
        )
        .orderBy(labAttempts.solveTimeSeconds)
        .limit(1);
      const best = rows[0]?.t;
      if (best === null || best === undefined) return null;
      return criteria.withinMinutes !== undefined && best > criteria.withinMinutes * 60 ? null : best;
    }
    default:
      return null;
  }
}

/**
 * Evaluates all visible achievements for an event and unlocks any newly
 * satisfied ones. Returns the unlocked achievement rows (for UI celebration).
 */
export async function evaluateAchievements(ctx: UnlockContext): Promise<AchievementRow[]> {
  const candidates = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.isVisible, true), sql`${achievements.criteria} ->> 'event' = ${ctx.event}`));
  if (candidates.length === 0) return [];

  const owned = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, ctx.userId));
  const ownedIds = new Set(owned.map((o) => o.achievementId));

  const unlocked: AchievementRow[] = [];
  for (const ach of candidates) {
    if (ownedIds.has(ach.id)) continue;
    const criteria = ach.criteria as AchievementCriteria;
    if (!criteriaMatches(criteria, ctx)) continue;

    const value = await metricValue(ctx.userId, criteria);
    if (value === null) continue;

    // For count metrics the threshold is "at least N"; for speed metrics the
    // threshold is "at most N seconds" handled via withinMinutes above.
    const satisfied = criteria.metric === 'speed_solve' ? true : value >= criteria.threshold;
    if (!satisfied) continue;

    const inserted = await db
      .insert(userAchievements)
      .values({
        userId: ctx.userId,
        achievementId: ach.id,
        shareSlug: generateShareSlug(),
        meta: ctx.categorySlug ? { categorySlug: ctx.categorySlug } : {},
      })
      .onConflictDoNothing()
      .returning({ id: userAchievements.id });
    if (inserted.length === 0) continue;

    unlocked.push(ach);

    if (ach.xpReward > 0) {
      await awardXp({
        userId: ctx.userId,
        amount: ach.xpReward,
        source: 'achievement',
        sourceId: ach.slug,
        description: `Achievement: ${ach.title}`,
      });
    }
    await db.insert(notifications).values({
      userId: ctx.userId,
      type: 'achievement_unlocked',
      title: `Achievement unlocked: ${ach.title}`,
      body: ach.description,
      link: `/profile/me`,
    });
  }
  return unlocked;
}
