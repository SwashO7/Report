import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { lessons } from '../db/schema';
import { errors } from '../core/errors';
import { requireAuth,  resolveSessionUser,  type AuthedUser, getAuthUser } from '../core/auth';
import { getPathDetail, getLessonDetail, startLesson, completeLesson, recordLessonView, getNextUpLesson } from './learning.service';
import { submitExercise } from './practice.service';
import { exerciseSubmitSchema } from '@suraksha/shared';

async function optionalUser(c: Parameters<typeof resolveSessionUser>[0]): Promise<AuthedUser | null> {
  return resolveSessionUser(c);
}

async function lessonIdBySlug(slug: string): Promise<string> {
  const row = (await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.slug, slug)).limit(1))[0];
  if (!row) throw errors.notFound('Lesson not found.');
  return row.id;
}

export const learnRoutes = new Hono()

  /* ------------------------------ Paths ----------------------------------- */
  .get('/paths', async (c) => {
    const user = await optionalUser(c);
    const { listPaths } = await import('./learning.service');
    const paths = await listPaths(user);
    return c.json({
      paths: paths.map((p) => ({
        id: p.path.id,
        slug: p.path.slug,
        name: p.path.name,
        levelNumber: p.path.levelNumber,
        description: p.path.description,
        published: p.path.published,
      })),
    });
  })

  .get('/paths/:slug', async (c) => {
    const user = await optionalUser(c);
    const detail = await getPathDetail(c.req.param('slug'), user);
    return c.json(detail);
  })

  /* ----------------------------- Lessons ---------------------------------- */
  .get('/lessons/:slug', async (c) => {
    const user = await optionalUser(c);
    const detail = await getLessonDetail(c.req.param('slug'), user);
    return c.json(detail);
  })

  .post('/lessons/:slug/view', async (c) => {
    const user = await optionalUser(c);
    const lessonId = await lessonIdBySlug(c.req.param('slug'));
    await recordLessonView(lessonId, user?.id ?? null);
    return c.json({ ok: true });
  })

  .post('/lessons/:slug/start', requireAuth, async (c) => {
    const user = getAuthUser(c);
    const lessonId = await lessonIdBySlug(c.req.param('slug'));
    await startLesson(user.id, lessonId);
    return c.json({ ok: true });
  })

  .post('/lessons/:slug/complete', requireAuth, async (c) => {
    const user = getAuthUser(c);
    const lessonId = await lessonIdBySlug(c.req.param('slug'));
    const result = await completeLesson(user.id, lessonId);
    return c.json(result);
  })

  /* --------------------------- Exercises ---------------------------------- */
  .get('/exercises', async (c) => {
    const user = await optionalUser(c);
    const { listPublishedExercises } = await import('./practice.service');
    return c.json(await listPublishedExercises(user?.id ?? null));
  })

  .get('/exercises/:slug', async (c) => {
    const user = await optionalUser(c);
    const { getExerciseDetail } = await import('./practice.service');
    const exercise = await getExerciseDetail(c.req.param('slug'), user?.id ?? null);
    return c.json({ exercise });
  })

  .post('/exercises/:slug/submit', requireAuth, async (c) => {
    const user = getAuthUser(c);
    const input = exerciseSubmitSchema.parse(await c.req.json());
    const result = await submitExercise(user.id, c.req.param('slug'), input.answers);
    return c.json(result);
  })

  /* -------------------------- Recommendations ------------------------------ */
  .get('/continue', requireAuth, async (c) => {
    const user = getAuthUser(c);
    const next = await getNextUpLesson(user.id);
    return c.json({ next });
  });
