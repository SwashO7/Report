import { and, count, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  achievements,
  labAttempts,
  labCategories,
  labs,
  learningPaths,
  lessonProgress,
  lessons,
  modules,
  userAchievements,
  users,
  xpEvents,
} from '../db/schema';
import { errors } from '../core/errors';
import type { UserAchievementPublic, XpProgress } from '@suraksha/shared';
import { computeXpProgress, getLevels } from '../gamification/xp';

export async function myAchievements(userId: string): Promise<UserAchievementPublic[]> {
  const rows = await db
    .select({ ua: userAchievements, a: achievements })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt));
  return rows.map(({ ua, a }) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    icon: a.icon,
    category: a.category,
    rarity: a.rarity as UserAchievementPublic['rarity'],
    xpReward: a.xpReward,
    unlockedAt: ua.unlockedAt.toISOString(),
    shareSlug: ua.shareSlug,
  }));
}

export async function achievementCatalog(userId?: string) {
  const rows = await db.select().from(achievements).where(eq(achievements.isVisible, true)).orderBy(achievements.sortOrder, achievements.title);
  let unlockedMap = new Map<string, Date>();
  if (userId) {
    const owned = await db
      .select({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    unlockedMap = new Map(owned.map((o) => [o.achievementId, o.unlockedAt]));
  }
  return rows.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    icon: a.icon,
    category: a.category,
    rarity: a.rarity as UserAchievementPublic['rarity'],
    xpReward: a.xpReward,
    unlockedAt: unlockedMap.get(a.id)?.toISOString() ?? null,
  }));
}

export async function xpProgressFor(userId: string): Promise<XpProgress> {
  const row = (await db.select({ xp: users.xp }).from(users).where(eq(users.id, userId)).limit(1))[0];
  const levels = await getLevels();
  return computeXpProgress(row?.xp ?? 0, levels);
}

export interface DashboardData {
  xp: XpProgress;
  continueLesson: { slug: string; title: string; moduleTitle: string; estimatedMinutes: number } | null;
  stats: { labsSolved: number; lessonsCompleted: number; achievements: number; globalRank: number | null; firstAttemptRate: number | null; avgSolveMinutes: number | null };
  recentAchievements: UserAchievementPublic[];
  recommendedLab: { slug: string; title: string; shortDescription: string; difficultyLabel: string; xpReward: number; estimatedMinutes: number } | null;
  recentActivity: { kind: string; title: string; at: string; link: string }[];
  rankEntries: { username: string; name: string; avatarUrl: string | null; xp: number }[];
}

export async function learnerDashboard(userId: string): Promise<DashboardData> {
  const xp = await xpProgressFor(userId);

  const { getNextUpLesson } = await import('../learning/learning.service');
  const continueLesson = await getNextUpLesson(userId);

  const [solvedRow] = await db.select({ n: count() }).from(labAttempts).where(and(eq(labAttempts.userId, userId), eq(labAttempts.solved, true)));
  const [lessonRow] = await db.select({ n: count() }).from(lessonProgress).where(and(eq(lessonProgress.userId, userId), isNotNull(lessonProgress.completedAt)));
  const [achRow] = await db.select({ n: count() }).from(userAchievements).where(eq(userAchievements.userId, userId));

  const me = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  let globalRank: number | null = null;
  if (me && me.xp > 0) {
    const ahead = await db.execute<{ n: number }>(
      sql`SELECT COUNT(*)::int AS n FROM users WHERE role = 'learner' AND status = 'active' AND profile_visibility = 'public' AND xp > ${me.xp}`,
    );
    globalRank = Number(ahead[0]?.n ?? 0) + 1;
  }

  const perf = await db
    .select({
      firstAttemptSolves: sql<number>`SUM(CASE WHEN first_attempt_solve THEN 1 ELSE 0 END)`,
      avgTime: sql<number>`AVG(solve_time_seconds)`,
    })
    .from(labAttempts)
    .where(and(eq(labAttempts.userId, userId), eq(labAttempts.solved, true)));
  const solvedCount = Number(solvedRow.n);
  const firstAttemptRate = solvedCount > 0 && perf[0]?.firstAttemptSolves !== null ? Math.round((Number(perf[0]?.firstAttemptSolves ?? 0) / solvedCount) * 100) : null;
  const avgSolveMinutes = perf[0]?.avgTime ? Math.round(Number(perf[0].avgTime) / 60) : null;

  const recentAchievements = (await myAchievements(userId)).slice(0, 4);

  // Recommended lab: easiest unsolved published lab matching progress.
  const solvedLabIds = await db.select({ labId: labAttempts.labId }).from(labAttempts).where(and(eq(labAttempts.userId, userId), eq(labAttempts.solved, true)));
  const solvedIds = solvedLabIds.map((s) => s.labId);
  const recRows = await db
    .select({
      slug: labs.slug,
      title: labs.title,
      shortDescription: labs.shortDescription,
      difficultyLabel: difficultyLevelsLabel(),
      xpReward: labs.xpReward,
      estimatedMinutes: labs.estimatedMinutes,
    })
    .from(labs)
    .where(
      solvedIds.length
        ? and(eq(labs.status, 'published'), sql`${labs.id} NOT IN ${solvedIds}`)
        : eq(labs.status, 'published'),
    )
    .orderBy(sql`(SELECT sort_order FROM difficulty_levels d WHERE d.id = ${labs.difficultyId}) ASC`, labs.xpReward)
    .limit(1);
  const recommendedLab = recRows[0] ?? null;

  // Recent activity feed (XP events + solves merged)
  const xpFeed = await db.select().from(xpEvents).where(eq(xpEvents.userId, userId)).orderBy(desc(xpEvents.createdAt)).limit(8);
  const recentActivity = xpFeed.map((e) => {
    const kind = e.source;
    const title =
      kind === 'lab_completion'
        ? e.description.replace('Solved lab: ', 'Solved ')
        : kind === 'lesson_completion'
          ? e.description.replace('Completed lesson: ', 'Completed ')
          : kind === 'practice_completion'
            ? e.description.replace('Completed practice: ', 'Practiced ')
            : e.description || 'Progress recorded';
    const link = kind === 'lab_completion' && e.sourceId ? `/labs/${e.sourceId}` : kind === 'lesson_completion' && e.sourceId ? `/learn/foundations/${e.sourceId}` : '/dashboard';
    return { kind, title, at: e.createdAt.toISOString(), link };
  });

  // Mini leaderboard around the user (top 5 global)
  const topRows = await db
    .select({ username: users.username, name: users.name, avatarUrl: users.avatarUrl, xp: users.xp })
    .from(users)
    .where(and(eq(users.role, 'learner'), eq(users.status, 'active'), eq(users.profileVisibility, 'public'), sql`${users.xp} > 0`))
    .orderBy(desc(users.xp))
    .limit(5);

  return {
    xp,
    continueLesson,
    stats: { labsSolved: solvedCount, lessonsCompleted: Number(lessonRow.n), achievements: Number(achRow.n), globalRank, firstAttemptRate, avgSolveMinutes },
    recentAchievements,
    recommendedLab,
    recentActivity,
    rankEntries: topRows,
  };
}

function difficultyLevelsLabel(): any {
  return sql<string>`(SELECT label FROM difficulty_levels d WHERE d.id = ${labs.difficultyId})`;
}

export interface PublicProfile {
  user: { name: string; username: string; avatarUrl: string | null; bio: string | null; levelTitle: string | null; levelOrder: number };
  xp: number;
  globalRank: number | null;
  percentile: number | null;
  stats: { labsSolved: number; lessonsCompleted: number; achievements: number; firstAttemptRate: number | null; avgSolveMinutes: number | null };
  achievements: UserAchievementPublic[];
  skills: { category: string; solved: number }[];
  recentActivity: { kind: string; title: string; at: string }[];
  joinedAt: string;
}

export async function publicProfile(username: string, viewerIsSelf: boolean): Promise<PublicProfile> {
  const user = (
    await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.status, 'active')))
      .limit(1)
  )[0];
  if (!user) throw errors.notFound('Profile not found.');
  if (user.profileVisibility === 'private' && !viewerIsSelf) {
    throw errors.forbidden('This profile is private.');
  }

  const levels = await getLevels();
  const level = computeXpProgress(user.xp, levels).level;

  const [solvedRow] = await db.select({ n: count() }).from(labAttempts).where(and(eq(labAttempts.userId, user.id), eq(labAttempts.solved, true)));
  const [lessonRow] = await db.select({ n: count() }).from(lessonProgress).where(and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)));
  const [achRow] = await db.select({ n: count() }).from(userAchievements).where(eq(userAchievements.userId, user.id));

  let globalRank: number | null = null;
  let percentile: number | null = null;
  if (user.xp > 0) {
    const ahead = await db.execute<{ n: number }>(
      sql`SELECT COUNT(*)::int AS n FROM users WHERE role = 'learner' AND status = 'active' AND profile_visibility = 'public' AND xp > ${user.xp}`,
    );
    const total = await db.execute<{ n: number }>(
      sql`SELECT COUNT(*)::int AS n FROM users WHERE role = 'learner' AND status = 'active' AND profile_visibility = 'public' AND xp > 0`,
    );
    globalRank = Number(ahead[0]?.n ?? 0) + 1;
    const totalN = Number(total[0]?.n ?? 0);
    percentile = totalN > 0 ? Math.max(1, Math.round((globalRank / totalN) * 100)) : null;
  }

  const perf = await db
    .select({
      firstAttemptSolves: sql<number>`SUM(CASE WHEN first_attempt_solve THEN 1 ELSE 0 END)`,
      avgTime: sql<number>`AVG(solve_time_seconds)`,
    })
    .from(labAttempts)
    .where(and(eq(labAttempts.userId, user.id), eq(labAttempts.solved, true)));
  const solvedCount = Number(solvedRow.n);

  const skills = await db
    .select({
      category: labCategories.name,
      solved: count(labAttempts.id),
    })
    .from(labAttempts)
    .innerJoin(labs, eq(labAttempts.labId, labs.id))
    .innerJoin(labCategories, eq(labs.categoryId, labCategories.id))
    .where(and(eq(labAttempts.userId, user.id), eq(labAttempts.solved, true)))
    .groupBy(labCategories.name);

  const xpFeed = await db.select().from(xpEvents).where(eq(xpEvents.userId, user.id)).orderBy(desc(xpEvents.createdAt)).limit(10);
  const recentActivity = xpFeed.map((e) => ({
    kind: e.source,
    title: e.description,
    at: e.createdAt.toISOString(),
  }));

  return {
    user: {
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      levelTitle: level?.title ?? null,
      levelOrder: level?.order ?? 0,
    },
    xp: user.xp,
    globalRank,
    percentile,
    stats: {
      labsSolved: solvedCount,
      lessonsCompleted: Number(lessonRow.n),
      achievements: Number(achRow.n),
      firstAttemptRate: solvedCount > 0 ? Math.round((Number(perf[0]?.firstAttemptSolves ?? 0) / solvedCount) * 100) : null,
      avgSolveMinutes: perf[0]?.avgTime ? Math.round(Number(perf[0].avgTime) / 60) : null,
    },
    achievements: await myAchievements(user.id),
    skills: skills.map((s) => ({ category: s.category, solved: Number(s.solved) })),
    recentActivity,
    joinedAt: user.createdAt.toISOString(),
  };
}
