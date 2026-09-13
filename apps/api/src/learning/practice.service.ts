import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { learningPaths, lessons, modules, practiceCompletions, practiceExercises, users } from '../db/schema';
import { errors } from '../core/errors';
import type { ExercisePublic, ExerciseResult } from '@suraksha/shared';

/** Practice hub: all published exercises with location + completion state. */
export async function listPublishedExercises(userId: string | null) {
  const rows = await db
    .select({
      id: practiceExercises.id,
      slug: practiceExercises.slug,
      title: practiceExercises.title,
      instructions: practiceExercises.instructions,
      questionCount: sql<number>`jsonb_array_length(${practiceExercises.questions})`,
      xpReward: practiceExercises.xpReward,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
      moduleTitle: modules.title,
      pathSlug: learningPaths.slug,
      pathName: learningPaths.name,
      levelNumber: learningPaths.levelNumber,
    })
    .from(practiceExercises)
    .innerJoin(lessons, eq(practiceExercises.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
    .where(and(eq(practiceExercises.status, 'published'), eq(lessons.status, 'published'), eq(learningPaths.published, true)))
    .orderBy(asc(learningPaths.sortOrder), asc(lessons.sortOrder), asc(practiceExercises.createdAt));

  const doneSet = new Set<string>();
  if (userId) {
    const done = await db
      .select({ exerciseId: practiceCompletions.exerciseId })
      .from(practiceCompletions)
      .where(eq(practiceCompletions.userId, userId));
    for (const d of done) doneSet.add(d.exerciseId);
  }

  return {
    exercises: rows.map((r) => ({
      ...r,
      questionCount: Number(r.questionCount),
      completed: doneSet.has(r.id),
    })),
  };
}

/**
 * Single exercise, ready to attempt from the practice hub. Same public shape
 * as the exercises embedded in a lesson (no answer keys) — lets the hub open
 * the exercise directly instead of only deep-linking into the lesson page.
 */
export async function getExerciseDetail(slug: string, userId: string | null): Promise<ExercisePublic> {
  const row = (
    await db
      .select({
        ex: practiceExercises,
        lessonSlug: lessons.slug,
        lessonTitle: lessons.title,
        pathSlug: learningPaths.slug,
      })
      .from(practiceExercises)
      .innerJoin(lessons, eq(practiceExercises.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
      .where(and(eq(practiceExercises.slug, slug), eq(practiceExercises.status, 'published')))
      .limit(1)
  )[0];
  if (!row) throw errors.notFound('Practice exercise not found.');
  const { ex, lessonSlug, lessonTitle, pathSlug } = row;

  const completed = userId
    ? Boolean(
        (
          await db
            .select({ exerciseId: practiceCompletions.exerciseId })
            .from(practiceCompletions)
            .where(and(eq(practiceCompletions.userId, userId), eq(practiceCompletions.exerciseId, ex.id)))
            .limit(1)
        )[0],
      )
    : false;

  return {
    id: ex.id,
    slug: ex.slug,
    title: ex.title,
    instructions: ex.instructions,
    kind: 'quiz',
    questions: (ex.questions ?? []).map((q) => ({ prompt: q.prompt, options: q.options })),
    xpReward: ex.xpReward,
    completed,
    lesson: { slug: lessonSlug, title: lessonTitle, pathSlug },
  };
}

/**
 * Server-side exercise validation. Correct answers never leave the backend —
 * the public API only exposes prompts and options.
 */
export async function submitExercise(
  userId: string,
  exerciseSlug: string,
  answers: { questionIndex: number; choiceIndex: number }[],
): Promise<ExerciseResult> {
  const ex = (
    await db
      .select()
      .from(practiceExercises)
      .where(and(eq(practiceExercises.slug, exerciseSlug), eq(practiceExercises.status, 'published')))
      .limit(1)
  )[0];
  if (!ex) throw errors.notFound('Practice exercise not found.');

  const questions = ex.questions ?? [];
  const answerMap = new Map(answers.map((a) => [a.questionIndex, a.choiceIndex]));

  const perQuestion = questions.map((q, i) => ({
    index: i,
    correct: answerMap.get(i) === q.correctIndex,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));
  const total = questions.length || 1;
  const score = perQuestion.filter((p) => p.correct).length;
  const passed = score === questions.length && questions.length > 0;

  const existing = (
    await db
      .select()
      .from(practiceCompletions)
      .where(and(eq(practiceCompletions.userId, userId), eq(practiceCompletions.exerciseId, ex.id)))
      .limit(1)
  )[0];

  let xpAwarded = 0;
  let firstCompletion = false;

  if (passed && !existing) {
    firstCompletion = true;
    const { xpSettings } = await import('../admin/settings.service');
    const config = await xpSettings();
    xpAwarded = ex.xpReward > 0 ? ex.xpReward : config.practice_completion;

    await db.insert(practiceCompletions).values({
      userId,
      exerciseId: ex.id,
      scorePct: Math.round((score / total) * 100),
    });
    if (xpAwarded > 0) {
      const { awardXp } = await import('../gamification/xp');
      await awardXp({ userId, amount: xpAwarded, source: 'practice_completion', sourceId: ex.slug, description: `Completed practice: ${ex.title}` });
    }
    const { evaluateAchievements } = await import('../gamification/achievements');
    await evaluateAchievements({ userId, event: 'practice_completed' });
  }

  return { passed, score, total: questions.length, perQuestion, xpAwarded, firstCompletion };
}

/** Records a practice attempt score without completion (for analytics later). */
export async function touchExerciseUser(userId: string) {
  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, userId));
}
