import { Hono } from 'hono';
import { z } from 'zod';
import { requireContentEditor, getAuthUser } from '../core/auth';
import { hasRole } from '../core/rbac';
import {
  adminListPaths,
  adminCreatePath,
  adminUpdatePath,
  adminCreateModule,
  adminDeleteModule,
  adminDeletePath,
  adminListModules,
  adminUpdateModule,
  adminListLessons,
  adminGetLesson,
  adminCreateLesson,
  adminSaveLesson,
  adminSetLessonStatus,
  adminGetLessonVersion,
  adminReorderLessons,
  adminUpsertExercise,
  adminDeleteExercise,
  adminListExercises,
  adminListLessonsForPicker,
  adminGetExercise,
} from './content.service';
import { lessonCreateSchema, lessonSaveSchema, moduleCreateSchema } from '@suraksha/shared';

const pathCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  levelNumber: z.number().int().min(0).max(50),
  description: z.string().max(2000).default(''),
  icon: z.string().max(60).optional(),
});

/**
 * Editable path fields.
 *
 * This is deliberately NOT `pathCreateSchema.partial()`: that shape has no
 * `published` key, and because Zod strips unknown keys the publish toggle was
 * silently discarded, so the API answered "updated" while changing nothing.
 * The slug stays immutable - it is referenced by seed data and lab links.
 */
const pathUpdateSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  levelNumber: z.number().int().min(0).max(50).optional(),
  description: z.string().max(2000).optional(),
  icon: z.string().max(60).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const adminContentRoutes = new Hono()
  .use('*', requireContentEditor)

  /* -------------------------------- Paths ---------------------------------- */
  .get('/paths', async (c) => c.json({ paths: await adminListPaths() }))

  .post('/paths', async (c) => {
    const user = getAuthUser(c);
    const input = pathCreateSchema.parse(await c.req.json());
    return c.json({ path: await adminCreatePath(c, user, input) }, 201);
  })

  .patch('/paths/:id', async (c) => {
    const user = getAuthUser(c);
    const input = pathUpdateSchema.parse(await c.req.json());
    return c.json({ path: await adminUpdatePath(c, user, c.req.param('id'), input) });
  })

  /**
   * Deleting a path cascades to its modules, lessons and learner progress, so
   * it refuses by default when the path still holds lessons. The caller must
   * pass ?force=true to confirm, which the admin UI only sends after showing
   * exactly how much content would go.
   */
  .delete('/paths/:id', async (c) => {
    const user = getAuthUser(c);
    const force = new URL(c.req.url).searchParams.get('force') === 'true';
    return c.json(await adminDeletePath(c, user, c.req.param('id'), force));
  })

  /* ------------------------------- Modules --------------------------------- */
  .get('/modules', async (c) => {
    const pathId = new URL(c.req.url).searchParams.get('pathId') ?? undefined;
    return c.json({ modules: await adminListModules(pathId) });
  })

  .post('/modules', async (c) => {
    const user = getAuthUser(c);
    const input = moduleCreateSchema.parse(await c.req.json());
    return c.json({ module: await adminCreateModule(c, user, input) }, 201);
  })

  .patch('/modules/:id', async (c) => {
    const user = getAuthUser(c);
    const input = z
      .object({
        title: z.string().min(2).max(200).optional(),
        description: z.string().max(2000).optional(),
        published: z.boolean().optional(),
        sortOrder: z.number().int().min(0).max(999).optional(),
      })
      .parse(await c.req.json());
    return c.json({ module: await adminUpdateModule(c, user, c.req.param('id'), input) });
  })

  /** Same guard as paths: refuses while the module still holds lessons. */
  .delete('/modules/:id', async (c) => {
    const user = getAuthUser(c);
    const force = new URL(c.req.url).searchParams.get('force') === 'true';
    return c.json(await adminDeleteModule(c, user, c.req.param('id'), force));
  })

  /* -------------------------------- Lessons -------------------------------- */
  .get('/lessons', async (c) => {
    const url = new URL(c.req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get('pageSize') ?? 20)));
    const result = await adminListLessons({
      q: url.searchParams.get('q') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      moduleId: url.searchParams.get('moduleId') ?? undefined,
      page,
      pageSize,
    });
    return c.json({
      lessons: result.lessons.map((l) => ({ ...l, updatedAt: l.updatedAt.toISOString(), publishedAt: l.publishedAt?.toISOString() ?? null })),
      pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: Math.ceil(result.total / result.pageSize) },
    });
  })

  .get('/lessons/:id', async (c) => {
    const data = await adminGetLesson(c.req.param('id'));
    return c.json({
      lesson: {
        ...data.lesson,
        createdAt: data.lesson.createdAt.toISOString(),
        updatedAt: data.lesson.updatedAt.toISOString(),
        publishedAt: data.lesson.publishedAt?.toISOString() ?? null,
      },
      module: data.module,
      exercises: data.exercises.map((e) => ({ ...e, createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString() })),
      versions: data.versions.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })),
    });
  })

  .post('/lessons', async (c) => {
    const user = getAuthUser(c);
    const input = lessonCreateSchema.parse(await c.req.json());
    const lesson = await adminCreateLesson(c, user, input);
    return c.json({ lesson }, 201);
  })

  .patch('/lessons/:id', async (c) => {
    const user = getAuthUser(c);
    const input = lessonSaveSchema.parse(await c.req.json());
    const lesson = await adminSaveLesson(c, user, c.req.param('id'), input);
    return c.json({ lesson });
  })

  .post('/lessons/:id/status', async (c) => {
    const user = getAuthUser(c);
    const input = z.object({ status: z.enum(['draft', 'published', 'archived']) }).parse(await c.req.json());
    const canPublish = ['administrator', 'super_admin'].includes(user.role);
    const lesson = await adminSetLessonStatus(c, user, c.req.param('id'), input.status, canPublish);
    return c.json({ lesson });
  })

  .post('/lessons/:id/reorder', async (c) => {
    const user = getAuthUser(c);
    const input = z.object({ orderedIds: z.array(z.string().uuid()).min(1).max(500) }).parse(await c.req.json());
    return c.json(await adminReorderLessons(c, user, input.orderedIds));
  })

  .get('/lessons/:id/versions/:version', async (c) => {
    const version = Number(c.req.param('version'));
    if (!Number.isInteger(version)) throw new (await import('../core/errors')).AppError(400, 'BAD_REQUEST', 'Invalid version.');
    const row = await adminGetLessonVersion(c.req.param('id'), version);
    return c.json({ version: { ...row, createdAt: row.createdAt.toISOString() } });
  })

  /* ------------------------------- Exercises -------------------------------- */
  .get('/exercises', async (c) => {
    return c.json({
      exercises: (await adminListExercises()).map((e) => ({ ...e, updatedAt: e.updatedAt.toISOString() })),
    });
  })

  .get('/exercises/lessons', async (c) => {
    return c.json({ lessons: await adminListLessonsForPicker() });
  })

  .get('/exercises/:id', async (c) => {
    const row = await adminGetExercise(c.req.param('id'));
    return c.json({ exercise: { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() } });
  })

  .post('/exercises', async (c) => {
    const user = getAuthUser(c);
    const { exerciseUpsertSchema } = await import('@suraksha/shared');
    const input = exerciseUpsertSchema.parse(await c.req.json());
    const row = await adminUpsertExercise(c, user, {
      lessonId: input.lessonId,
      slug: input.slug,
      title: input.title,
      instructions: input.instructions,
      questions: input.questions,
      xpReward: input.xpReward,
      status: input.status,
    });
    return c.json({ exercise: row }, 201);
  })

  .patch('/exercises/:id', async (c) => {
    const user = getAuthUser(c);
    const { exerciseUpsertSchema } = await import('@suraksha/shared');
    const input = exerciseUpsertSchema.parse(await c.req.json());
    const row = await adminUpsertExercise(c, user, {
      id: c.req.param('id'),
      lessonId: input.lessonId,
      slug: input.slug,
      title: input.title,
      instructions: input.instructions,
      questions: input.questions,
      xpReward: input.xpReward,
      status: input.status,
    });
    return c.json({ exercise: row });
  })

  .delete('/exercises/:id', async (c) => {
    const user = getAuthUser(c);
    return c.json(await adminDeleteExercise(c, user, c.req.param('id')));
  });
