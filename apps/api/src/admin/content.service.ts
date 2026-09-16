import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { learningPaths, lessonVersions, lessons, modules, practiceExercises } from '../db/schema';
import { errors } from '../core/errors';
import { auditFromContext } from '../audit/audit.service';
import type { Context } from 'hono';
import type { AuthedUser } from '../core/auth';

/* ------------------------------- Paths ----------------------------------- */

export async function adminListPaths() {
  const rows = await db.select().from(learningPaths).orderBy(asc(learningPaths.sortOrder), asc(learningPaths.levelNumber));
  const lessonCounts = await db
    .select({ moduleId: lessons.moduleId, n: count() })
    .from(lessons)
    .groupBy(lessons.moduleId);
  const mods = await db.select().from(modules);
  const lessonsByModule = new Map(lessonCounts.map((l) => [l.moduleId, Number(l.n)]));
  const modsByPath = new Map<string, number>();
  for (const m of mods) modsByPath.set(m.pathId, (modsByPath.get(m.pathId) ?? 0) + 1);

  return rows.map((p) => ({
    ...p,
    moduleCount: modsByPath.get(p.id) ?? 0,
    lessonCount: mods.filter((m) => m.pathId === p.id).reduce((acc, m) => acc + (lessonsByModule.get(m.id) ?? 0), 0),
  }));
}

export async function adminCreatePath(c: Context, user: AuthedUser, input: { name: string; slug: string; levelNumber: number; description: string; icon?: string }) {
  const exists = (await db.select({ id: learningPaths.id }).from(learningPaths).where(eq(learningPaths.slug, input.slug)).limit(1))[0];
  if (exists) throw errors.conflict('A path with this slug already exists.');
  const [row] = await db
    .insert(learningPaths)
    .values({ ...input, icon: input.icon ?? 'book-open', sortOrder: input.levelNumber })
    .returning();
  await auditFromContext(c, { actorId: user.id, action: 'path_created', entityType: 'learning_path', entityId: row.id, metadata: { slug: row.slug } });
  return row;
}

export async function adminUpdatePath(c: Context, user: AuthedUser, id: string, input: Partial<{ name: string; description: string; icon: string; published: boolean; levelNumber: number; sortOrder: number }>) {
  const row = (await db.update(learningPaths).set({ ...input, updatedAt: new Date() }).where(eq(learningPaths.id, id)).returning())[0];
  if (!row) throw errors.notFound('Path not found.');
  await auditFromContext(c, { actorId: user.id, action: 'path_updated', entityType: 'learning_path', entityId: id, metadata: { changes: Object.keys(input) } });
  return row;
}

/* ------------------------------- Modules --------------------------------- */

export async function adminCreateModule(c: Context, user: AuthedUser, input: { pathId: string; title: string; slug: string; description: string }) {
  const path = (await db.select().from(learningPaths).where(eq(learningPaths.id, input.pathId)).limit(1))[0];
  if (!path) throw errors.notFound('Path not found.');
  const dup = (await db.select({ id: modules.id }).from(modules).where(and(eq(modules.pathId, input.pathId), eq(modules.slug, input.slug))).limit(1))[0];
  if (dup) throw errors.conflict('A module with this slug already exists in the path.');
  const [{ n }] = await db.select({ n: count() }).from(modules).where(eq(modules.pathId, input.pathId));
  const [row] = await db.insert(modules).values({ ...input, sortOrder: Number(n) }).returning();
  await auditFromContext(c, { actorId: user.id, action: 'module_created', entityType: 'module', entityId: row.id, metadata: { slug: row.slug } });
  return row;
}

export async function adminUpdateModule(c: Context, user: AuthedUser, id: string, input: Partial<{ title: string; description: string; published: boolean; sortOrder: number }>) {
  const row = (await db.update(modules).set({ ...input, updatedAt: new Date() }).where(eq(modules.id, id)).returning())[0];
  if (!row) throw errors.notFound('Module not found.');
  await auditFromContext(c, { actorId: user.id, action: 'module_updated', entityType: 'module', entityId: id, metadata: { changes: Object.keys(input) } });
  return row;
}

/* ------------------------------- Lessons --------------------------------- */

export async function adminListLessons(opts: { q?: string; status?: string; moduleId?: string; page: number; pageSize: number }) {
  const conditions = [];
  if (opts.q) {
    const like = `%${opts.q.replace(/[%_]/g, '')}%`;
    conditions.push(or(ilike(lessons.title, like), ilike(lessons.slug, like)));
  }
  if (opts.status) conditions.push(eq(lessons.status, opts.status));
  if (opts.moduleId) conditions.push(eq(lessons.moduleId, opts.moduleId));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      status: lessons.status,
      version: lessons.version,
      moduleId: lessons.moduleId,
      moduleTitle: modules.title,
      pathName: learningPaths.name,
      estimatedMinutes: lessons.estimatedMinutes,
      importance: lessons.importance,
      updatedAt: lessons.updatedAt,
      publishedAt: lessons.publishedAt,
      viewCount: lessons.viewCount,
      completionCount: lessons.completionCount,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
    .where(where)
    .orderBy(desc(lessons.updatedAt))
    .limit(opts.pageSize)
    .offset((opts.page - 1) * opts.pageSize);

  const [{ total }] = await db.select({ total: count() }).from(lessons).where(where);
  return { lessons: rows, total: Number(total), page: opts.page, pageSize: opts.pageSize };
}

export async function adminGetLesson(id: string) {
  const row = (
    await db
      .select({ lesson: lessons, module: modules })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(lessons.id, id))
      .limit(1)
  )[0];
  if (!row) throw errors.notFound('Lesson not found.');
  const exercises = await db.select().from(practiceExercises).where(eq(practiceExercises.lessonId, id)).orderBy(asc(practiceExercises.createdAt));
  const versions = await db
    .select({
      id: lessonVersions.id,
      version: lessonVersions.version,
      changeNote: lessonVersions.changeNote,
      changedByName: lessonVersions.changedByName,
      createdAt: lessonVersions.createdAt,
    })
    .from(lessonVersions)
    .where(eq(lessonVersions.lessonId, id))
    .orderBy(desc(lessonVersions.version))
    .limit(30);
  return { ...row, exercises, versions };
}

export async function adminCreateLesson(c: Context, user: AuthedUser, input: { moduleId: string; title: string; slug: string; summary: string; estimatedMinutes: number; importance?: 'essential' | 'core' | 'optional'; blocks: unknown[] }) {
  const dup = (await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.slug, input.slug)).limit(1))[0];
  if (dup) throw errors.conflict('A lesson with this slug already exists.');
  const [{ n }] = await db.select({ n: count() }).from(lessons).where(eq(lessons.moduleId, input.moduleId));
  const [row] = await db
    .insert(lessons)
    .values({ ...input, authorId: user.id, sortOrder: Number(n), status: 'draft' })
    .returning();
  await db.insert(lessonVersions).values({
    lessonId: row.id,
    version: 1,
    title: row.title,
    summary: row.summary,
    blocks: row.blocks ?? [],
    changeNote: 'Initial draft',
    changedById: user.id,
    changedByName: user.name,
  });
  await auditFromContext(c, { actorId: user.id, action: 'lesson_created', entityType: 'lesson', entityId: row.id, metadata: { slug: row.slug } });
  return row;
}

export async function adminSaveLesson(c: Context, user: AuthedUser, id: string, input: { title?: string; summary?: string; estimatedMinutes?: number; importance?: 'essential' | 'core' | 'optional'; blocks?: unknown[]; changeNote?: string }) {
  const current = (await db.select().from(lessons).where(eq(lessons.id, id)).limit(1))[0];
  if (!current) throw errors.notFound('Lesson not found.');

  const nextVersion = current.version + 1;
  const [row] = await db
    .update(lessons)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
      ...(input.importance !== undefined ? { importance: input.importance } : {}),
      ...(input.blocks !== undefined ? { blocks: input.blocks } : {}),
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, id))
    .returning();

  await db.insert(lessonVersions).values({
    lessonId: id,
    version: nextVersion,
    title: row.title,
    summary: row.summary,
    blocks: row.blocks ?? [],
    changeNote: input.changeNote ?? 'Updated content',
    changedById: user.id,
    changedByName: user.name,
  });
  await auditFromContext(c, { actorId: user.id, action: 'lesson_updated', entityType: 'lesson', entityId: id, metadata: { version: nextVersion } });
  return row;
}

export async function adminSetLessonStatus(c: Context, user: AuthedUser, id: string, status: 'draft' | 'published' | 'archived', canPublish: boolean) {
  if (status === 'published' && !canPublish) {
    throw errors.forbidden('Only administrators can publish content. Save it as a draft and request review.');
  }
  const current = (await db.select().from(lessons).where(eq(lessons.id, id)).limit(1))[0];
  if (!current) throw errors.notFound('Lesson not found.');

  const [row] = await db
    .update(lessons)
    .set({
      status,
      ...(status === 'published' ? { publishedAt: current.publishedAt ?? new Date() } : {}),
      ...(status === 'archived' ? { archivedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, id))
    .returning();

  await auditFromContext(c, { actorId: user.id, action: `lesson_${status}`, entityType: 'lesson', entityId: id, metadata: { from: current.status, to: status } });
  return row;
}

export async function adminGetLessonVersion(lessonId: string, version: number) {
  const row = (
    await db
      .select()
      .from(lessonVersions)
      .where(and(eq(lessonVersions.lessonId, lessonId), eq(lessonVersions.version, version)))
      .limit(1)
  )[0];
  if (!row) throw errors.notFound('Version not found.');
  return row;
}

export async function adminReorderLessons(c: Context, user: AuthedUser, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(lessons).set({ sortOrder: i }).where(eq(lessons.id, orderedIds[i]));
  }
  await auditFromContext(c, { actorId: user.id, action: 'lessons_reordered', entityType: 'lesson', metadata: { count: orderedIds.length } });
  return { ok: true };
}

/* ------------------------------ Exercises -------------------------------- */

/** All exercises across every lesson, for the admin Practice hub — unlike the
 *  learner-facing list this includes drafts/archived so editors can manage
 *  everything, not just what's already published. */
export async function adminListExercises() {
  const rows = await db
    .select({
      id: practiceExercises.id,
      slug: practiceExercises.slug,
      title: practiceExercises.title,
      status: practiceExercises.status,
      xpReward: practiceExercises.xpReward,
      questionCount: sql<number>`jsonb_array_length(${practiceExercises.questions})`,
      updatedAt: practiceExercises.updatedAt,
      lessonId: practiceExercises.lessonId,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
      pathName: learningPaths.name,
    })
    .from(practiceExercises)
    .innerJoin(lessons, eq(practiceExercises.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
    .orderBy(desc(practiceExercises.updatedAt));

  return rows.map((r) => ({ ...r, questionCount: Number(r.questionCount) }));
}

/** Lesson picker for the exercise form — id/title/path, published or not. */
export async function adminListLessonsForPicker() {
  return db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      pathName: learningPaths.name,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
    .orderBy(asc(learningPaths.sortOrder), asc(lessons.sortOrder));
}

/** Single exercise with full question bodies (incl. answer keys) for the admin editor. */
export async function adminGetExercise(id: string) {
  const row = (
    await db
      .select({
        ex: practiceExercises,
        lessonSlug: lessons.slug,
        lessonTitle: lessons.title,
        pathName: learningPaths.name,
      })
      .from(practiceExercises)
      .innerJoin(lessons, eq(practiceExercises.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(learningPaths, eq(modules.pathId, learningPaths.id))
      .where(eq(practiceExercises.id, id))
      .limit(1)
  )[0];
  if (!row) throw errors.notFound('Exercise not found.');
  return { ...row.ex, lessonSlug: row.lessonSlug, lessonTitle: row.lessonTitle, pathName: row.pathName };
}

export async function adminUpsertExercise(c: Context, user: AuthedUser, input: { id?: string; lessonId: string; slug: string; title: string; instructions: string; questions: unknown[]; xpReward: number; status: string }) {
  if (input.id) {
    const [row] = await db
      .update(practiceExercises)
      .set({ title: input.title, instructions: input.instructions, questions: input.questions as never, xpReward: input.xpReward, status: input.status, updatedAt: new Date() })
      .where(eq(practiceExercises.id, input.id))
      .returning();
    if (!row) throw errors.notFound('Exercise not found.');
    await auditFromContext(c, { actorId: user.id, action: 'exercise_updated', entityType: 'exercise', entityId: row.id });
    return row;
  }
  const dup = (await db.select({ id: practiceExercises.id }).from(practiceExercises).where(eq(practiceExercises.slug, input.slug)).limit(1))[0];
  if (dup) throw errors.conflict('An exercise with this slug already exists.');
  const [row] = await db
    .insert(practiceExercises)
    .values({ lessonId: input.lessonId, slug: input.slug, title: input.title, instructions: input.instructions, questions: input.questions as never, xpReward: input.xpReward, status: input.status })
    .returning();
  await auditFromContext(c, { actorId: user.id, action: 'exercise_created', entityType: 'exercise', entityId: row.id });
  return row;
}

export async function adminDeleteExercise(c: Context, user: AuthedUser, id: string) {
  await db.delete(practiceExercises).where(eq(practiceExercises.id, id));
  await auditFromContext(c, { actorId: user.id, action: 'exercise_deleted', entityType: 'exercise', entityId: id });
  return { ok: true };
}
