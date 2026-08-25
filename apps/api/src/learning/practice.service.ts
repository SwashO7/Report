import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { lessons, practiceCompletions, practiceExercises, users } from '../db/schema';
import { errors } from '../core/errors';
import type { ExerciseResult } from '@suraksha/shared';

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
