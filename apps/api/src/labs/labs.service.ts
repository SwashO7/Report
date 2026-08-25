import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, lte, or, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  difficultyLevels,
  hintReveals,
  labAttempts,
  labCategories,
  labDownloads,
  labs,
  flagSubmissions,
  lessons,
} from '../db/schema';
import { errors } from '../core/errors';
import { flagHmacFor, normalizeFlagFor, safeEqual } from '../core/crypto';import type { LabCard, LabDetail, FlagSubmitResult, AchievementPublic } from '@suraksha/shared';
import type { AuthedUser } from '../core/auth';

const STAFF_LAB_ROLES = ['lab_manager', 'administrator', 'super_admin'];

export interface LabFilters {
  q?: string;
  category?: string;
  difficulty?: string;
  skill?: string;
  maxMinutes?: number;
  status: 'all' | 'solved' | 'unsolved' | 'in_progress';
  sort: 'newest' | 'popular' | 'xp' | 'difficulty';
  page: number;
  pageSize: number;
}

export async function listPublishedLabs(filters: LabFilters, user: AuthedUser | null) {
  const conditions = [eq(labs.status, 'published')];
  if (filters.category) conditions.push(sql`${labs.categoryId} IN (SELECT id FROM lab_categories WHERE slug = ${filters.category})`);
  if (filters.difficulty) conditions.push(sql`${labs.difficultyId} IN (SELECT id FROM difficulty_levels WHERE slug = ${filters.difficulty})`);
  if (filters.maxMinutes) conditions.push(lte(labs.estimatedMinutes, filters.maxMinutes));
  if (filters.q) {
    const like = `%${filters.q.replace(/[%_]/g, '')}%`;
    conditions.push(or(ilike(labs.title, like), ilike(labs.shortDescription, like))!);
  }
  if (filters.skill) conditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(${labs.skills}) s WHERE s = ${filters.skill})`);

  const base = and(...conditions);

  const rows = await db
    .select({
      id: labs.id,
      slug: labs.slug,
      title: labs.title,
      shortDescription: labs.shortDescription,
      categorySlug: labCategories.slug,
      categoryName: labCategories.name,
      difficultySlug: difficultyLevels.slug,
      difficultyLabel: difficultyLevels.label,
      difficultyOrder: difficultyLevels.sortOrder,
      estimatedMinutes: labs.estimatedMinutes,
      xpReward: labs.xpReward,
      skills: labs.skills,
      solveCount: labs.solveCount,
      publishedAt: labs.publishedAt,
    })
    .from(labs)
    .innerJoin(labCategories, eq(labs.categoryId, labCategories.id))
    .innerJoin(difficultyLevels, eq(labs.difficultyId, difficultyLevels.id))
    .where(base)
    .orderBy(
      filters.sort === 'popular'
        ? desc(labs.solveCount)
        : filters.sort === 'xp'
          ? desc(labs.xpReward)
          : filters.sort === 'difficulty'
            ? asc(difficultyLevels.sortOrder)
            : desc(labs.publishedAt),
    )
    .limit(filters.pageSize)
    .offset((filters.page - 1) * filters.pageSize);

  const [{ total }] = await db.select({ total: count() }).from(labs).where(base);

  let solvedSet = new Set<string>();
  let progressSet = new Set<string>();
  if (user && rows.length) {
    const ids = rows.map((r) => r.id);
    const attempts = await db
      .select({ labId: labAttempts.labId, solved: labAttempts.solved })
      .from(labAttempts)
      .where(and(eq(labAttempts.userId, user.id), inArray(labAttempts.labId, ids)));
    for (const a of attempts) {
      if (a.solved) solvedSet.add(a.labId);
      else progressSet.add(a.labId);
    }
  }

  let cards: LabCard[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.shortDescription,
    category: { slug: r.categorySlug, name: r.categoryName },
    difficulty: { slug: r.difficultySlug, label: r.difficultyLabel, orderIndex: r.difficultyOrder },
    estimatedMinutes: r.estimatedMinutes,
    xpReward: r.xpReward,
    skills: r.skills ?? [],
    solvedByCount: r.solveCount,
    solved: solvedSet.has(r.id),
    inProgress: progressSet.has(r.id),
    publishedAt: r.publishedAt?.toISOString() ?? null,
  }));

  if (filters.status === 'solved') cards = cards.filter((c) => c.solved);
  if (filters.status === 'unsolved') cards = cards.filter((c) => !c.solved);
  if (filters.status === 'in_progress') cards = cards.filter((c) => c.inProgress && !c.solved);

  return { cards, total: Number(total), page: filters.page, pageSize: filters.pageSize };
}

export async function getLabDetail(slug: string, user: AuthedUser | null): Promise<LabDetail> {
  const isStaff = user && STAFF_LAB_ROLES.includes(user.role);
  const lab = (
    await db
      .select()
      .from(labs)
      .where(and(eq(labs.slug, slug), isStaff ? sql`true` : eq(labs.status, 'published')))
      .limit(1)
  )[0];
  if (!lab) throw errors.notFound('Lab not found.');

  const category = (await db.select().from(labCategories).where(eq(labCategories.id, lab.categoryId)).limit(1))[0];
  const difficulty = (await db.select().from(difficultyLevels).where(eq(difficultyLevels.id, lab.difficultyId)).limit(1))[0];

  // Prerequisites
  const prereqIds = lab.prerequisiteLabIds ?? [];
  let prerequisites: LabDetail['prerequisites'] = [];
  let solvedPrereqSet = new Set<string>();
  if (prereqIds.length) {
    const prereqRows = await db
      .select({ id: labs.id, slug: labs.slug, title: labs.title })
      .from(labs)
      .where(inArray(labs.id, prereqIds));
    if (user) {
      const solved = await db
        .select({ labId: labAttempts.labId })
        .from(labAttempts)
        .where(and(eq(labAttempts.userId, user.id), eq(labAttempts.solved, true), inArray(labAttempts.labId, prereqIds)));
      solvedPrereqSet = new Set(solved.map((s) => s.labId));
    }
    prerequisites = prereqRows.map((p) => ({ slug: p.slug, title: p.title, solved: solvedPrereqSet.has(p.id) }));
  }

  // Related lessons
  const relatedIds = lab.relatedLessonIds ?? [];
  let relatedLessons: LabDetail['relatedLessons'] = [];
  let completedLessonSet = new Set<string>();
  if (relatedIds.length) {
    const lessonRows = await db
      .select({ id: lessons.id, slug: lessons.slug, title: lessons.title })
      .from(lessons)
      .where(and(inArray(lessons.id, relatedIds), eq(lessons.status, 'published')));
    if (user) {
      const { lessonProgress } = await import('../db/schema');
      const done = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt), inArray(lessonProgress.lessonId, relatedIds)));
      completedLessonSet = new Set(done.map((d) => d.lessonId));
    }
    relatedLessons = lessonRows.map((l) => ({ slug: l.slug, title: l.title, completed: completedLessonSet.has(l.id) }));
  }

  // Current attempt
  let attempt: LabDetail['attempt'] = null;
  let hintsRevealed: LabDetail['hintsRevealed'] = [];
  let solved = false;
  if (user) {
    const rows = await db
      .select()
      .from(labAttempts)
      .where(and(eq(labAttempts.userId, user.id), eq(labAttempts.labId, lab.id)))
      .orderBy(desc(labAttempts.startedAt))
      .limit(1);
    if (rows[0]) {
      const a = rows[0];
      attempt = {
        id: a.id,
        startedAt: a.startedAt.toISOString(),
        submissionCount: a.submissionCount,
        hintsUsed: a.hintsUsed,
        solved: a.solved,
        completedAt: a.completedAt?.toISOString() ?? null,
      };
    }
    const revealed = await db
      .select()
      .from(hintReveals)
      .where(and(eq(hintReveals.userId, user.id), eq(hintReveals.labId, lab.id)));
    hintsRevealed = revealed
      .map((r) => ({ index: r.hintIndex, content: lab.hints?.[r.hintIndex]?.content ?? '' }))
      .sort((a, b) => a.index - b.index);
    solved = attempt?.solved ?? false;
  }

  return {
    id: lab.id,
    slug: lab.slug,
    title: lab.title,
    shortDescription: lab.shortDescription,
    description: lab.description,
    category: { slug: category.slug, name: category.name },
    difficulty: { slug: difficulty.slug, label: difficulty.label, orderIndex: difficulty.sortOrder },
    estimatedMinutes: lab.estimatedMinutes,
    xpReward: lab.xpReward,
    skills: lab.skills ?? [],
    solvedByCount: lab.solveCount,
    solved,
    inProgress: Boolean(attempt && !solved),
    objectives: lab.objectives ?? [],
    setupInstructions: lab.setupInstructions,
    prerequisites,
    hintsTotal: (lab.hints ?? []).length,
    hintsRevealed,
    attempt,
    relatedLessons,
    packageVersion: lab.packageVersion,
    packageSizeBytes: lab.packageSizeBytes ?? 0,
    publishedAt: lab.publishedAt?.toISOString() ?? null,
  };
}

/** Opens (or resumes) an attempt. Returns the active attempt id. */
export async function startAttempt(userId: string, labId: string) {
  const open = (
    await db
      .select()
      .from(labAttempts)
      .where(and(eq(labAttempts.userId, userId), eq(labAttempts.labId, labId), eq(labAttempts.solved, false)))
      .orderBy(desc(labAttempts.startedAt))
      .limit(1)
  )[0];
  if (open) return open;

  const [{ n }] = await db
    .select({ n: count() })
    .from(labAttempts)
    .where(and(eq(labAttempts.userId, userId), eq(labAttempts.labId, labId)));

  const [attempt] = await db
    .insert(labAttempts)
    .values({
      userId,
      labId,
      attemptNumber: Number(n) + 1,
      isFirstAttempt: Number(n) === 0,
    })
    .returning();

  await db.update(labs).set({ attemptCount: sql`${labs.attemptCount} + 1` }).where(eq(labs.id, labId));
  return attempt;
}

export async function revealHint(userId: string, labId: string, index: number): Promise<{ content: string; total: number }> {
  const lab = (await db.select().from(labs).where(eq(labs.id, labId)).limit(1))[0];
  if (!lab) throw errors.notFound();
  const hints = lab.hints ?? [];
  if (index < 0 || index >= hints.length) throw errors.badRequest('Invalid hint index.');
  // Progressive: cannot reveal hint N without revealing N-1.
  if (index > 0) {
    const prev = await db
      .select()
      .from(hintReveals)
      .where(and(eq(hintReveals.userId, userId), eq(hintReveals.labId, labId), eq(hintReveals.hintIndex, index - 1)))
      .limit(1);
    if (!prev[0]) throw errors.badRequest('Reveal the previous hint first.');
  }
  const existing = (
    await db
      .select()
      .from(hintReveals)
      .where(and(eq(hintReveals.userId, userId), eq(hintReveals.labId, labId), eq(hintReveals.hintIndex, index)))
      .limit(1)
  )[0];
  if (!existing) {
    await db.insert(hintReveals).values({ userId, labId, hintIndex: index });
    // Update the open attempt's hint count.
    await db
      .update(labAttempts)
      .set({ hintsUsed: sql`${labAttempts.hintsUsed} + 1` })
      .where(and(eq(labAttempts.userId, userId), eq(labAttempts.labId, labId), eq(labAttempts.solved, false)));
  }
  return { content: hints[index].content, total: hints.length };
}

export interface SubmitFlagOutcome {
  result: FlagSubmitResult;
  unlockedAchievements: { slug: string; title: string; description: string; icon: string; category: string; rarity: string; xpReward: number }[];
  rankMilestone: number | null;
}

/**
 * Validates a submitted flag server-side and completes the lab on success.
 * Handles: first-solve bookkeeping, XP, bonuses, achievements, notifications.
 */
export async function submitFlag(userId: string, labSlug: string, rawFlag: string, ipHash: string | null): Promise<SubmitFlagOutcome> {
  const lab = (
    await db
      .select()
      .from(labs)
      .where(and(eq(labs.slug, labSlug), eq(labs.status, 'published')))
      .limit(1)
  )[0];
  if (!lab) throw errors.notFound('Lab not found.');

  const submitted = normalizeFlagFor(rawFlag, lab.flagCaseSensitive);
  const correct = safeEqual(flagHmacFor(submitted, true), lab.flagHmac);

  /* --------------------- Prior solve check (idempotency) ------------------ */
  // A previously solved lab never re-awards XP or creates new attempts.
  // Retries only refine the personal-best solve time.
  const priorSolve = (
    await db
      .select()
      .from(labAttempts)
      .where(and(eq(labAttempts.userId, userId), eq(labAttempts.labId, lab.id), eq(labAttempts.solved, true)))
      .orderBy(desc(labAttempts.completedAt))
      .limit(1)
  )[0];

  if (priorSolve && correct) {
    const now = new Date();
    const solveTimeSeconds = Math.max(1, Math.round((now.getTime() - priorSolve.startedAt.getTime()) / 1000));
    if (priorSolve.solveTimeSeconds === null || solveTimeSeconds < priorSolve.solveTimeSeconds) {
      await db.update(labAttempts).set({ solveTimeSeconds }).where(eq(labAttempts.id, priorSolve.id));
    }
    return {
      result: {
        correct: true,
        alreadySolved: true,
        xpAwarded: 0,
        solveTimeSeconds,
        firstAttemptSolve: false,
        percentile: priorSolve.percentileOnFirstSolve,
        newAchievements: [],
        shareSlug: null,
      },
      unlockedAchievements: [],
      rankMilestone: null,
    };
  }

  // Ensure an attempt exists (defensive — client should have started one).
  const attempt = await startAttempt(userId, lab.id);

  await db.insert(flagSubmissions).values({ userId, labId: lab.id, attemptId: attempt.id, correct, ipHash });
  await db
    .update(labAttempts)
    .set({
      submissionCount: sql`${labAttempts.submissionCount} + 1`,
      ...(correct ? {} : { failedSubmissionCount: sql`${labAttempts.failedSubmissionCount} + 1` }),
    })
    .where(eq(labAttempts.id, attempt.id));

  const alreadySolved = attempt.solved;
  if (!correct) {
    return {
      result: {
        correct: false,
        alreadySolved,
        xpAwarded: 0,
        solveTimeSeconds: null,
        firstAttemptSolve: false,
        percentile: null,
        newAchievements: [],
        shareSlug: null,
      },
      unlockedAchievements: [],
      rankMilestone: null,
    };
  }

  /* -------------------------- Successful solve --------------------------- */
  const now = new Date();
  const solveTimeSeconds = Math.max(1, Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000));
  const hintsUsed = attempt.hintsUsed;

  if (alreadySolved) {
    // Personal-best improvement only; no XP, no re-completion.
    const best = attempt.solveTimeSeconds ?? Infinity;
    if (solveTimeSeconds < best) {
      await db.update(labAttempts).set({ solveTimeSeconds }).where(eq(labAttempts.id, attempt.id));
    }
    return {
      result: {
        correct: true,
        alreadySolved: true,
        xpAwarded: 0,
        solveTimeSeconds,
        firstAttemptSolve: false,
        percentile: null,
        newAchievements: [],
        shareSlug: null,
      },
      unlockedAchievements: [],
      rankMilestone: null,
    };
  }

  const { xpSettings } = await import('../admin/settings.service');
  const config = await xpSettings();
  const { awardXp } = await import('../gamification/xp');
  const { evaluateAchievements } = await import('../gamification/achievements');
  const { notify } = await import('../notifications/notifications.service');
  const category = (await db.select().from(labCategories).where(eq(labCategories.id, lab.categoryId)).limit(1))[0];

  let xpAwarded = lab.xpReward;
  const bonuses: string[] = [];
  if (attempt.attemptNumber === 1 && attempt.isFirstAttempt) {
    if (config.first_attempt_bonus > 0) {
      xpAwarded += config.first_attempt_bonus;
      bonuses.push('first attempt');
    }
  }
  if (hintsUsed === 0 && config.no_hint_bonus > 0) {
    xpAwarded += config.no_hint_bonus;
    bonuses.push('no hints');
  }

  await db
    .update(labAttempts)
    .set({
      solved: true,
      completedAt: now,
      solveTimeSeconds,
      firstAttemptSolve: attempt.attemptNumber === 1 && attempt.submissionCount === 0,
      percentileOnFirstSolve: null,
    })
    .where(eq(labAttempts.id, attempt.id));

  await db.update(labs).set({ solveCount: sql`${labs.solveCount} + 1` }).where(eq(labs.id, lab.id));

  const { newXp } = await awardXp({
    userId,
    amount: xpAwarded,
    source: 'lab_completion',
    sourceId: lab.slug,
    description: `Solved lab: ${lab.title}${bonuses.length ? ` (${bonuses.join(', ')})` : ''}`,
    categorySlug: category.slug,
  });

  /* ------------------------- First-solve percentile ----------------------- */
  // Percentile among all first successful solves of this lab.
  const [{ faster }] = await db
    .select({ faster: count() })
    .from(labAttempts)
    .where(and(eq(labAttempts.labId, lab.id), eq(labAttempts.solved, true), lte(labAttempts.solveTimeSeconds, solveTimeSeconds)));
  const [{ totalSolves }] = await db.select({ totalSolves: count() }).from(labAttempts).where(and(eq(labAttempts.labId, lab.id), eq(labAttempts.solved, true)));
  const percentile = totalSolves > 0 ? Math.max(1, Math.min(99, Math.round((Number(faster) / Number(totalSolves)) * 100))) : null;
  if (percentile !== null) {
    await db.update(labAttempts).set({ percentileOnFirstSolve: percentile }).where(eq(labAttempts.id, attempt.id));
  }

  /* ---------------------------- Achievements ------------------------------ */
  const unlocked = await evaluateAchievements({
    userId,
    event: 'lab_solved',
    categorySlug: category.slug,
    hintsUsed,
    durationSeconds: solveTimeSeconds,
    firstAttemptSolve: attempt.attemptNumber === 1 && attempt.submissionCount === 0,
  });

  /* ---------------------------- Notifications ----------------------------- */
  await notify({
    userId,
    type: 'lab_completed',
    title: `Lab completed: ${lab.title}`,
    body: `You earned +${xpAwarded} XP.`,
    link: `/labs/${lab.slug}`,
  });
  const { queueEmail, appUrl } = await import('../email/send');
  const userRes = await db.execute<{ email: string; name: string }>(sql`SELECT email, name FROM users WHERE id = ${userId}`);
  const userRow = userRes[0];
  if (userRow) {
    await queueEmail(userRow.email, 'lab_completed', {
      name: userRow.name,
      labTitle: lab.title,
      xp: xpAwarded,
      url: appUrl(`/labs/${lab.slug}`),
    });
  }

  // Rank milestone: notify when the learner enters the global top 10 / 50 / 100.
  let rankMilestone: number | null = null;
  const aheadRes = await db.execute<{ ahead: number }>(
    sql`SELECT COUNT(*)::int AS ahead FROM users WHERE role = 'learner' AND status = 'active' AND profile_visibility = 'public' AND xp > ${newXp}`,
  );
  const rank = Number(aheadRes[0]?.ahead ?? 0) + 1;
  for (const milestone of [10, 50, 100]) {
    if (rank <= milestone) {
      rankMilestone = milestone;
      break;
    }
  }
  if (rankMilestone) {
    const { notify } = await import('../notifications/notifications.service');
    const seen = await db.execute<{ n: number }>(
      sql`SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = ${userId} AND type = 'rank_milestone' AND title LIKE ${'%top ' + rankMilestone + '%'}`,
    );
    if (Number(seen[0]?.n ?? 0) === 0) {
      await notify({
        userId,
        type: 'rank_milestone',
        title: `You reached the top ${rankMilestone}`,
        body: `You are now ranked #${rank} on the global leaderboard. Keep going.`,
        link: '/leaderboard',
      });
    }
  }

  const achievementDtos: AchievementPublic[] = unlocked.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    icon: a.icon,
    category: a.category,
    rarity: a.rarity as AchievementPublic['rarity'],
    xpReward: a.xpReward,
  }));

  return {
    result: {
      correct: true,
      alreadySolved: false,
      xpAwarded,
      solveTimeSeconds,
      firstAttemptSolve: attempt.attemptNumber === 1 && attempt.submissionCount === 0,
      percentile,
      newAchievements: achievementDtos,
      shareSlug: null,
    },
    unlockedAchievements: achievementDtos,
    rankMilestone,
  };
}

export async function categoriesWithCounts() {
  const rows = await db
    .select({
      slug: labCategories.slug,
      name: labCategories.name,
      description: labCategories.description,
      labCount: count(labs.id),
    })
    .from(labCategories)
    .leftJoin(labs, and(eq(labs.categoryId, labCategories.id), eq(labs.status, 'published')))
    .groupBy(labCategories.id, labCategories.slug, labCategories.name, labCategories.description, labCategories.sortOrder)
    .orderBy(asc(labCategories.sortOrder));
  return rows.map((r) => ({ ...r, labCount: Number(r.labCount) }));
}

export async function difficulties() {
  return db.select().from(difficultyLevels).orderBy(asc(difficultyLevels.sortOrder));
}
