import { Hono } from 'hono';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { labDownloads, labs } from '../db/schema';
import { errors } from '../core/errors';
import { rateLimitMiddleware } from '../core/middleware';
import { requireAuth,  resolveSessionUser, getAuthUser } from '../core/auth';
import { hashIp } from '../core/crypto';
import { flagSubmitSchema, labQuerySchema } from '@suraksha/shared';
import { listPublishedLabs, getLabDetail, startAttempt, revealHint, submitFlag, categoriesWithCounts, difficulties } from './labs.service';
import { getClientIp } from '../core/errors';
import { pathToFileStorage } from '../storage/storage.service';
import { labPackageFilename, labPackagePath, labPackageSize, resolveLabPackage } from '../storage/labs.storage';

export const labRoutes = new Hono()

  /* ------------------------------ Metadata -------------------------------- */
  .get('/meta', async (c) => {
    const [cats, diffs] = await Promise.all([categoriesWithCounts(), difficulties()]);
    return c.json({ categories: cats, difficulties: diffs });
  })

  /* ------------------------------- Browse --------------------------------- */
  .get('/', async (c) => {
    const user = await resolveSessionUser(c);
    const query = labQuerySchema.parse(Object.fromEntries(new URL(c.req.url).searchParams));
    const result = await listPublishedLabs(query, user);
    return c.json({
      labs: result.cards,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      },
    });
  })

  /* ------------------------------- Detail --------------------------------- */
  .get('/:slug', async (c) => {
    const user = await resolveSessionUser(c);
    const detail = await getLabDetail(c.req.param('slug'), user);
    return c.json(detail);
  })

  /* ------------------------------- Attempt -------------------------------- */
  .post('/:slug/start', requireAuth, async (c) => {
    const user = getAuthUser(c);
    const lab = (
      await db
        .select({ id: labs.id })
        .from(labs)
        .where(and(eq(labs.slug, c.req.param('slug')), eq(labs.status, 'published')))
        .limit(1)
    )[0];
    if (!lab) throw errors.notFound('Lab not found.');
    const attempt = await startAttempt(user.id, lab.id);
    return c.json({
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      startedAt: attempt.startedAt.toISOString(),
    });
  })

  /* -------------------------------- Hints --------------------------------- */
  .post('/:slug/hints/:index/reveal', requireAuth, rateLimitMiddleware('hints', 30, 60_000), async (c) => {
    const user = getAuthUser(c);
    const lab = (
      await db
        .select({ id: labs.id })
        .from(labs)
        .where(and(eq(labs.slug, c.req.param('slug')), eq(labs.status, 'published')))
        .limit(1)
    )[0];
    if (!lab) throw errors.notFound('Lab not found.');
    const index = Number(c.req.param('index'));
    if (!Number.isInteger(index)) throw errors.badRequest('Invalid hint index.');
    const hint = await revealHint(user.id, lab.id, index);
    return c.json(hint);
  })

  /* ----------------------------- Flag submit ------------------------------ */
  .post('/:slug/submit-flag', requireAuth, rateLimitMiddleware('flag_submit', 20, 60_000), async (c) => {
    const user = getAuthUser(c);
    const input = flagSubmitSchema.parse(await c.req.json());
    const ipHash = hashIp(getClientIp(c));
    const outcome = await submitFlag(user.id, c.req.param('slug'), input.flag, ipHash);
    return c.json(outcome.result);
  })

  /* ------------------------------ Download -------------------------------- */
  .get('/:slug/download', requireAuth, rateLimitMiddleware('lab_download', 10, 60_000), async (c) => {
    const user = getAuthUser(c);
    const lab = (
      await db
        .select()
        .from(labs)
        .where(and(eq(labs.slug, c.req.param('slug')), eq(labs.status, 'published')))
        .limit(1)
    )[0];
    if (!lab) throw errors.notFound('Lab not found.');

    // package_path can be null (never uploaded) or stale (recorded against a
    // different working directory / STORAGE_DIR than this process runs with).
    // Fall back to the conventional storage location before giving up.
    const packagePath = resolveLabPackage(lab.slug, lab.packageVersion, lab.packagePath);
    if (!packagePath) {
      console.error(
        `[labs] package missing for ${lab.slug} v${lab.packageVersion}: stored=${lab.packagePath ?? 'null'} expected=${labPackagePath(lab.slug, lab.packageVersion)}`,
      );
      throw errors.notFound('The lab package is not available yet. The team is preparing it.');
    }

    // Heal the row when we recovered the file at the conventional path, so the
    // next request (and the detail page's size field) do not need the fallback.
    if (packagePath !== lab.packagePath) {
      const sizeBytes = labPackageSize(packagePath);
      await db
        .update(labs)
        .set({ packagePath, ...(sizeBytes !== null ? { packageSizeBytes: sizeBytes } : {}) })
        .where(eq(labs.id, lab.id));
    }

    await db.insert(labDownloads).values({
      labId: lab.id,
      packageVersion: lab.packageVersion,
      userId: user.id,
      ipHash: hashIp(getClientIp(c)),
    });
    await db.update(labs).set({ downloadCount: sql`${labs.downloadCount} + 1` }).where(eq(labs.id, lab.id));

    const filename = labPackageFilename(lab.slug, lab.packageVersion);
    return pathToFileStorage(c, packagePath, filename);
  });
