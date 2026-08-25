import { and, count, desc, eq, gte, isNotNull, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { labAttempts, labs, lessonProgress, lessons, users, xpEvents, flagSubmissions, hintReveals } from '../db/schema';
import type { AdminStats, LabAnalytics } from '@suraksha/shared';

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400_000);
}

export async function adminStats(): Promise<AdminStats> {
  const [totalUsers] = await db.select({ n: count() }).from(users).where(eq(users.role, 'learner'));
  const [active7] = await db.select({ n: count() }).from(users).where(and(eq(users.role, 'learner'), gte(users.lastActiveAt, daysAgo(7))));
  const [active30] = await db.select({ n: count() }).from(users).where(and(eq(users.role, 'learner'), gte(users.lastActiveAt, daysAgo(30))));
  const [new30] = await db.select({ n: count() }).from(users).where(and(eq(users.role, 'learner'), gte(users.createdAt, daysAgo(30))));

  const [lessonsStarted] = await db.select({ n: count() }).from(lessonProgress);
  const [lessonsCompleted] = await db.select({ n: count() }).from(lessonProgress).where(isNotNull(lessonProgress.completedAt));

  const [attempts] = await db.select({ n: count() }).from(labAttempts);
  const [solves] = await db.select({ n: count() }).from(labAttempts).where(eq(labAttempts.solved, true));
  const [avgSolve] = await db
    .select({ avg: sql<number>`AVG(solve_time_seconds)` })
    .from(labAttempts)
    .where(eq(labAttempts.solved, true));

  const dau = await db.execute<{ n: number }>(sql`SELECT COUNT(DISTINCT user_id)::int AS n FROM sessions WHERE last_seen_at > now() - interval '1 day'`);
  const wau = await db.execute<{ n: number }>(sql`SELECT COUNT(DISTINCT user_id)::int AS n FROM sessions WHERE last_seen_at > now() - interval '7 days'`);
  const mau = await db.execute<{ n: number }>(sql`SELECT COUNT(DISTINCT user_id)::int AS n FROM sessions WHERE last_seen_at > now() - interval '30 days'`);
  const [streak] = await db.select({ avg: sql<number>`AVG(streak_count)` }).from(users).where(eq(users.role, 'learner'));

  const [pubLessons] = await db.select({ n: count() }).from(lessons).where(eq(lessons.status, 'published'));
  const [draftLessons] = await db.select({ n: count() }).from(lessons).where(eq(lessons.status, 'draft'));
  const [pubLabs] = await db.select({ n: count() }).from(labs).where(eq(labs.status, 'published'));
  const [draftLabs] = await db.select({ n: count() }).from(labs).where(eq(labs.status, 'draft'));

  const signupTrend = await db
    .select({ date: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`, count: count() })
    .from(users)
    .where(gte(users.createdAt, daysAgo(30)))
    .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`);

  const activityTrend = await db
    .select({ date: sql<string>`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`, count: count() })
    .from(xpEvents)
    .where(gte(xpEvents.createdAt, daysAgo(30)))
    .groupBy(sql`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`);

  const popularLabs = await db
    .select({ slug: labs.slug, title: labs.title, attempts: labs.attemptCount, solves: labs.solveCount })
    .from(labs)
    .where(eq(labs.status, 'published'))
    .orderBy(desc(labs.attemptCount))
    .limit(5);

  const hardestLabs = await db
    .select({
      slug: labs.slug,
      title: labs.title,
      solveRatePct: sql<number>`CASE WHEN ${labs.attemptCount} > 0 THEN ROUND((${labs.solveCount}::numeric / ${labs.attemptCount}) * 100) ELSE 0 END`,
    })
    .from(labs)
    .where(and(eq(labs.status, 'published'), sql`${labs.attemptCount} >= 3`))
    .orderBy(sql`CASE WHEN ${labs.attemptCount} > 0 THEN (${labs.solveCount}::numeric / ${labs.attemptCount}) ELSE 1 END ASC`)
    .limit(5);

  const totalLearners = Number(totalUsers.n);
  return {
    users: { total: totalLearners, active7d: Number(active7.n), active30d: Number(active30.n), new30d: Number(new30.n) },
    learning: {
      lessonsStarted: Number(lessonsStarted.n),
      lessonsCompleted: Number(lessonsCompleted.n),
      avgPerUser: totalLearners > 0 ? Math.round((Number(lessonsCompleted.n) / totalLearners) * 10) / 10 : 0,
    },
    labs: {
      attempts: Number(attempts.n),
      solves: Number(solves.n),
      completionRate: Number(attempts.n) > 0 ? Math.round((Number(solves.n) / Number(attempts.n)) * 100) : 0,
      avgHoursToSolve: avgSolve?.avg ? Math.round((Number(avgSolve.avg) / 3600) * 10) / 10 : null,
    },
    engagement: {
      dau: Number(dau[0]?.n ?? 0),
      wau: Number(wau[0]?.n ?? 0),
      mau: Number(mau[0]?.n ?? 0),
      avgStreak: Math.round((Number(streak?.avg ?? 0)) * 10) / 10,
    },
    content: { publishedLessons: Number(pubLessons.n), draftLessons: Number(draftLessons.n), publishedLabs: Number(pubLabs.n), draftLabs: Number(draftLabs.n) },
    signupTrend: signupTrend.map((r) => ({ date: r.date, count: Number(r.count) })),
    activityTrend: activityTrend.map((r) => ({ date: r.date, count: Number(r.count) })),
    popularLabs: popularLabs.map((r) => ({ ...r, attempts: Number(r.attempts), solves: Number(r.solves) })),
    hardestLabs: hardestLabs.map((r) => ({ ...r, solveRatePct: Number(r.solveRatePct) })),
  };
}

export async function labAnalytics(labId: string): Promise<LabAnalytics> {
  const lab = (await db.select().from(labs).where(eq(labs.id, labId)).limit(1))[0];
  const [starts] = await db.select({ n: count() }).from(labAttempts).where(eq(labAttempts.labId, labId));
  const [completions] = await db.select({ n: count() }).from(labAttempts).where(and(eq(labAttempts.labId, labId), eq(labAttempts.solved, true)));
  const [times] = await db
    .select({
      avg: sql<number>`AVG(solve_time_seconds)`,
      median: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY solve_time_seconds)`,
    })
    .from(labAttempts)
    .where(and(eq(labAttempts.labId, labId), eq(labAttempts.solved, true)));
  const [firstAttempt] = await db
    .select({ n: count() })
    .from(labAttempts)
    .where(and(eq(labAttempts.labId, labId), eq(labAttempts.solved, true), eq(labAttempts.firstAttemptSolve, true)));
  const [hints] = await db.select({ avg: sql<number>`AVG(hints_used)` }).from(labAttempts).where(eq(labAttempts.labId, labId));
  const [retried] = await db.select({ n: count() }).from(labAttempts).where(and(eq(labAttempts.labId, labId), sql`${labAttempts.attemptNumber} > 1`));
  const [failed] = await db.select({ n: count() }).from(flagSubmissions).where(and(eq(flagSubmissions.labId, labId), eq(flagSubmissions.correct, false)));

  const recent = await db
    .select({
      username: users.username,
      startedAt: labAttempts.startedAt,
      completedAt: labAttempts.completedAt,
      submissionCount: labAttempts.submissionCount,
      hintsUsed: labAttempts.hintsUsed,
    })
    .from(labAttempts)
    .innerJoin(users, eq(labAttempts.userId, users.id))
    .where(eq(labAttempts.labId, labId))
    .orderBy(desc(labAttempts.startedAt))
    .limit(15);

  const startsN = Number(starts.n);
  const completionsN = Number(completions.n);
  const toMin = (s: number | null) => (s === null || s === undefined ? null : Math.round((Number(s) / 60) * 10) / 10);

  return {
    lab: { slug: lab?.slug ?? '', title: lab?.title ?? '' },
    starts: startsN,
    completions: completionsN,
    completionRatePct: startsN > 0 ? Math.round((completionsN / startsN) * 100) : 0,
    avgMinutes: toMin(times?.avg as number | null),
    medianMinutes: toMin(times?.median as number | null),
    firstAttemptSuccessPct: completionsN > 0 ? Math.round((Number(firstAttempt.n) / completionsN) * 100) : null,
    hintUsageAvg: hints?.avg !== null && hints?.avg !== undefined ? Math.round(Number(hints.avg) * 10) / 10 : null,
    retryRatePct: startsN > 0 ? Math.round((Number(retried.n) / startsN) * 100) : null,
    failedSubmissions: Number(failed.n),
    dropOffStage: completionsN === 0 && startsN > 0 ? 'No successful solves yet' : null,
    recentAttempts: recent.map((r) => ({
      username: r.username,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      submissionCount: r.submissionCount,
      hintsUsed: r.hintsUsed,
    })),
  };
}

export async function lessonAnalytics() {
  const rows = await db
    .select({
      slug: lessons.slug,
      title: lessons.title,
      status: lessons.status,
      views: lessons.viewCount,
      completions: lessons.completionCount,
    })
    .from(lessons)
    .orderBy(desc(lessons.viewCount))
    .limit(50);
  return rows.map((r) => ({
    ...r,
    views: Number(r.views),
    completions: Number(r.completions),
    completionRatePct: Number(r.views) > 0 ? Math.round((Number(r.completions) / Number(r.views)) * 100) : 0,
  }));
}
