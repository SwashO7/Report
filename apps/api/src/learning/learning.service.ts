import { and, asc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  labAttempts,
  labs,
  learningPaths,
  lessonProgress,
  lessonViews,
  lessons,
  modules,
  practiceCompletions,
  practiceExercises,
} from '../db/schema';
import { errors } from '../core/errors';
import { contentBlockSchema, type LessonDetail, type LessonSummary, type PathDetail, type ExercisePublic } from '@suraksha/shared';
import type { AuthedUser } from '../core/auth';

/** Ordered published lessons across all published paths (the "spine"). */
export async function orderedPublishedLessonIds(): Promise<string[]> {
  const rows = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
    .where(and(eq(lessons.status, 'published'), eq(modules.published, true), eq(learningPaths.published, true)))
    .orderBy(asc(learningPaths.sortOrder), asc(learningPaths.levelNumber), asc(modules.sortOrder), asc(lessons.sortOrder));
  return rows.map((r) => r.id);
}

export async function listPaths(user: AuthedUser | null) {
  const paths = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.published, true))
    .orderBy(asc(learningPaths.sortOrder), asc(learningPaths.levelNumber));

  const completedSet = new Set<string>();
  if (user) {
    const done = await db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)));
    for (const d of done) completedSet.add(d.lessonId);
  }

  return paths.map((p) => ({ path: p, lessonCount: 0, completedLessonCount: 0 }));
}

export async function getPathDetail(slug: string, user: AuthedUser | null): Promise<PathDetail> {
  const path = (await db.select().from(learningPaths).where(eq(learningPaths.slug, slug)).limit(1))[0];
  if (!path || !path.published) {
    // Allow staff preview of drafts
    if (!path || (!user || !['content_editor', 'administrator', 'super_admin'].includes(user.role))) throw errors.notFound('Learning path not found.');
  }

  const mods = await db
    .select()
    .from(modules)
    .where(and(eq(modules.pathId, path.id), user?.role === 'learner' || !user ? eq(modules.published, true) : sql`true`))
    .orderBy(asc(modules.sortOrder));

  const modIds = mods.map((m) => m.id);
  const lessonRows = modIds.length
    ? await db
        .select()
        .from(lessons)
        .where(
          and(
            inArray(lessons.moduleId, modIds),
            user && ['content_editor', 'administrator', 'super_admin'].includes(user.role) ? sql`true` : eq(lessons.status, 'published'),
          ),
        )
        .orderBy(asc(lessons.sortOrder))
    : [];

  let completedSet = new Set<string>();
  let startedSet = new Set<string>();
  if (user) {
    const prog = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, user.id));
    completedSet = new Set(prog.filter((p) => p.completedAt).map((p) => p.lessonId));
    startedSet = new Set(prog.map((p) => p.lessonId));
  }

  const lessonsByModule = new Map<string, LessonSummary[]>();
  for (const l of lessonRows) {
    const arr = lessonsByModule.get(l.moduleId) ?? [];
    arr.push({
      id: l.id,
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      estimatedMinutes: l.estimatedMinutes,
      orderIndex: l.sortOrder,
      hasVideo: (l.blocks as { type: string }[]).some((b) => b.type === 'video'),
      hasPractice: false, // filled below
      completed: completedSet.has(l.id),
      started: startedSet.has(l.id) || completedSet.has(l.id),
    });
    lessonsByModule.set(l.moduleId, arr);
  }

  const exerciseRows = lessonRows.length
    ? await db
        .select({ lessonId: practiceExercises.lessonId })
        .from(practiceExercises)
        .where(
          and(
            inArray(practiceExercises.lessonId, lessonRows.map((l) => l.id)),
            user && ['content_editor', 'administrator', 'super_admin'].includes(user.role) ? sql`true` : eq(practiceExercises.status, 'published'),
          ),
        )
    : [];
  const lessonIdsWithPractice = new Set(exerciseRows.map((e) => e.lessonId));
  for (const [mid, arr] of lessonsByModule) {
    lessonsByModule.set(
      mid,
      arr.map((l) => ({ ...l, hasPractice: lessonIdsWithPractice.has(l.id) })),
    );
  }

  return {
    id: path.id,
    slug: path.slug,
    name: path.name,
    levelNumber: path.levelNumber,
    description: path.description,
    published: path.published,
    modules: mods.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      description: m.description,
      orderIndex: m.sortOrder,
      lessons: lessonsByModule.get(m.id) ?? [],
    })),
  };
}

export async function getLessonDetail(slug: string, user: AuthedUser | null): Promise<LessonDetail> {
  const lesson = (await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1))[0];
  if (!lesson) throw errors.notFound('Lesson not found.');
  const isStaff = user && ['content_editor', 'administrator', 'super_admin'].includes(user.role);
  if (lesson.status !== 'published' && !isStaff) throw errors.notFound('Lesson not found.');

  const mod = (await db.select().from(modules).where(eq(modules.id, lesson.moduleId)).limit(1))[0];
  const path = (await db.select().from(learningPaths).where(eq(learningPaths.id, mod.pathId)).limit(1))[0];
  if (!path.published && !isStaff) throw errors.notFound('Lesson not found.');

  // Sibling ordering for prev/next across the whole published curriculum.
  const spine = await orderedPublishedLessonIds();
  const idx = spine.indexOf(lesson.id);
  const prevId = idx > 0 ? spine[idx - 1] : null;
  const nextId = idx >= 0 && idx < spine.length - 1 ? spine[idx + 1] : null;
  const neighbors = [prevId, nextId].filter(Boolean) as string[];
  const neighborRows = neighbors.length ? await db.select({ id: lessons.id, slug: lessons.slug, title: lessons.title }).from(lessons).where(inArray(lessons.id, neighbors)) : [];
  const prevRow = prevId ? neighborRows.find((n) => n.id === prevId) : null;
  const nextRow = nextId ? neighborRows.find((n) => n.id === nextId) : null;

  // Exercises
  const exRows = await db
    .select()
    .from(practiceExercises)
    .where(and(eq(practiceExercises.lessonId, lesson.id), isStaff ? sql`true` : eq(practiceExercises.status, 'published')))
    .orderBy(asc(practiceExercises.createdAt));
  const doneEx = user
    ? new Set(
        (
          await db
            .select({ exerciseId: practiceCompletions.exerciseId })
            .from(practiceCompletions)
            .where(eq(practiceCompletions.userId, user.id))
        ).map((d) => d.exerciseId),
      )
    : new Set<string>();

  const exercises: ExercisePublic[] = exRows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    instructions: e.instructions,
    kind: 'quiz',
    questions: (e.questions ?? []).map((q) => ({ prompt: q.prompt, options: q.options })),
    xpReward: e.xpReward,
    completed: doneEx.has(e.id),
  }));

  // Related labs (published only), with solve state
  const relatedIds = (lesson as { relatedLessonIds?: string[] }).relatedLessonIds ?? [];
  let relatedLabs: LessonDetail['relatedLabs'] = [];
  const labsByLessonRef = await db
    .select({
      slug: labs.slug,
      title: labs.title,
      shortDescription: labs.shortDescription,
      xpReward: labs.xpReward,
      relatedLessonIds: labs.relatedLessonIds,
      difficultyLabel: sql<string>`(SELECT label FROM difficulty_levels d WHERE d.id = ${labs.difficultyId})`,
    })
    .from(labs)
    .where(and(eq(labs.status, 'published'), sql`${labs.relatedLessonIds} ? ${lesson.id}`));
  let solvedSet = new Set<string>();
  if (user && labsByLessonRef.length) {
    const solved = await db
      .select({ labId: labAttempts.labId })
      .from(labAttempts)
      .where(and(eq(labAttempts.userId, user.id), eq(labAttempts.solved, true)));
    solvedSet = new Set(solved.map((s) => s.labId));
  }
  const labSlugToId = new Map<string, string>();
  if (labsByLessonRef.length) {
    const labIds = await db.select({ id: labs.id, slug: labs.slug }).from(labs).where(eq(labs.status, 'published'));
    for (const r of labIds) labSlugToId.set(r.slug, r.id);
  }
  relatedLabs = labsByLessonRef.map((l) => ({
    slug: l.slug,
    title: l.title,
    shortDescription: l.shortDescription,
    difficulty: l.difficultyLabel,
    xpReward: l.xpReward,
    solved: labSlugToId.has(l.slug) && solvedSet.has(labSlugToId.get(l.slug)!),
  }));

  // Progress
  let progress = { started: false, completed: false, completedAt: null as string | null };
  if (user) {
    const p = (await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lesson.id)))
      .limit(1))[0];
    if (p) progress = { started: true, completed: Boolean(p.completedAt), completedAt: p.completedAt?.toISOString() ?? null };
  }

  const blocks = contentBlockSchema.array().safeParse(lesson.blocks ?? []);
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    estimatedMinutes: lesson.estimatedMinutes,
    blocks: blocks.success ? blocks.data : [],
    moduleSlug: mod.slug,
    moduleTitle: mod.title,
    pathSlug: path.slug,
    pathName: path.name,
    levelNumber: path.levelNumber,
    prevLesson: prevRow ? { slug: prevRow.slug, title: prevRow.title } : null,
    nextLesson: nextRow ? { slug: nextRow.slug, title: nextRow.title } : null,
    progress,
    relatedLabs,
    exercises,
  };
}

export async function recordLessonView(lessonId: string, userId: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  await db.insert(lessonViews).values({ lessonId, userId, day: today });
  await db.update(lessons).set({ viewCount: sql`${lessons.viewCount} + 1` }).where(eq(lessons.id, lessonId));
}

export async function startLesson(userId: string, lessonId: string) {
  await db.insert(lessonProgress).values({ userId, lessonId }).onConflictDoNothing();
}

/** Marks a lesson complete; awards XP only on first completion. */
export async function completeLesson(userId: string, lessonId: string): Promise<{ firstCompletion: boolean; xpAwarded: number }> {
  const existing = (
    await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
      .limit(1)
  )[0];
  if (existing?.completedAt) return { firstCompletion: false, xpAwarded: 0 };

  const lesson = (await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1))[0];
  if (!lesson) throw errors.notFound();

  const { xpSettings } = await import('../admin/settings.service');
  const config = await xpSettings();
  const xpAmount = config.lesson_completion;

  if (existing) {
    await db.update(lessonProgress).set({ completedAt: new Date() }).where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({ userId, lessonId, completedAt: new Date() });
  }

  await db.update(lessons).set({ completionCount: sql`${lessons.completionCount} + 1` }).where(eq(lessons.id, lessonId));

  if (xpAmount > 0) {
    const { awardXp } = await import('../gamification/xp');
    await awardXp({ userId, amount: xpAmount, source: 'lesson_completion', sourceId: lesson.slug, description: `Completed lesson: ${lesson.title}` });
  }

  const { evaluateAchievements } = await import('../gamification/achievements');
  await evaluateAchievements({ userId, event: 'lesson_completed' });

  return { firstCompletion: true, xpAwarded: xpAmount };
}

/** Next incomplete lesson for the "continue learning" recommendation. */
export async function getNextUpLesson(userId: string) {
  const spine = await orderedPublishedLessonIds();
  const completed = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), isNotNull(lessonProgress.completedAt)));
  const doneSet = new Set(completed.map((c) => c.lessonId));
  const nextId = spine.find((id) => !doneSet.has(id));
  if (!nextId) return null;
  const row = (
    await db
      .select({ slug: lessons.slug, title: lessons.title, moduleTitle: modules.title, estimatedMinutes: lessons.estimatedMinutes })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(lessons.id, nextId))
      .limit(1)
  )[0];
  return row ?? null;
}
