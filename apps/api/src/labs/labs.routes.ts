import { Hono } from 'hono';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { labDownloads, labs } from '../db/schema';
import { errors } from '../core/errors';
import { rateLimitMiddleware } from '../core/middleware';
import { env } from '../config/env';
import { checkDownloadQuota, checkGlobalDownloadBudget } from './download-quota';
import { requireAuth,  resolveSessionUser, getAuthUser } from '../core/auth';
import { hashIp } from '../core/crypto';
import { flagSubmitSchema, labQuerySchema } from '@suraksha/shared';
import { listPublishedLabs, getLabDetail, startAttempt, revealHint, submitFlag, categoriesWithCounts, difficulties } from './labs.service';
import { getClientIp } from '../core/errors';
import { bytesToFileDownload } from '../storage/storage.service';
import {
  labPackageFilename,
  labPackageKey,
  labPackagePath,
  loadLabPackage,
  usingObjectStorage,
} from '../storage/labs.storage';

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
  // Downloads are the platform's largest cost per request (packages run to
  // 200 MB of metered egress), so they carry three controls, not one:
  //   1. the per-IP rate limiter below - cheap, but per instance only;
  //   2. a DB-backed per-user daily quota, which every instance shares;
  //   3. a platform-wide daily circuit breaker that fails closed.
  // Tightened from 10/min to 4/min: a legitimate learner downloads a package
  // once and runs it, so a high per-minute ceiling bought nothing but exposure.
  .get('/:slug/download', requireAuth, rateLimitMiddleware('lab_download', 4, 60_000), async (c) => {
    const user = getAuthUser(c);

    const budget = await checkGlobalDownloadBudget();
    if (!budget.allowed) {
      console.error(`[labs] GLOBAL download budget exhausted: ${budget.usedToday}/${budget.max} in 24h`);
      c.header('Retry-After', '3600');
      throw errors.tooMany(
        'Lab downloads are temporarily paused while we handle unusually high traffic. Please try again later.',
      );
    }

    const quota = await checkDownloadQuota(user.id);
    if (!quota.allowed) {
      c.header('Retry-After', String(quota.retryAfterSeconds));
      throw errors.tooMany(
        `You have reached the daily lab download limit (${env.LAB_DOWNLOAD_DAILY_MAX}). Packages do not change often - reuse the one you already downloaded, or try again tomorrow.`,
      );
    }

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
    // On Cloud Storage the locator is a gs:// URI instead. loadLabPackage
    // handles both and falls back to the conventional location.
    const packageBytes = await loadLabPackage(lab.slug, lab.packageVersion, lab.packagePath);
    if (!packageBytes) {
      console.error(
        `[labs] package missing for ${lab.slug} v${lab.packageVersion}: stored=${lab.packagePath ?? 'null'} expected=${
          usingObjectStorage ? labPackageKey(lab.slug, lab.packageVersion) : labPackagePath(lab.slug, lab.packageVersion)
        }`,
      );
      throw errors.notFound('The lab package is not available yet. The team is preparing it.');
    }

    // Heal the row when the recorded size or locator drifted, so the detail
    // page's size field stays right without re-reading the object.
    if (lab.packageSizeBytes !== packageBytes.byteLength) {
      await db.update(labs).set({ packageSizeBytes: packageBytes.byteLength }).where(eq(labs.id, lab.id));
    }

    await db.insert(labDownloads).values({
      labId: lab.id,
      packageVersion: lab.packageVersion,
      userId: user.id,
      ipHash: hashIp(getClientIp(c)),
    });
    await db.update(labs).set({ downloadCount: sql`${labs.downloadCount} + 1` }).where(eq(labs.id, lab.id));

    const filename = labPackageFilename(lab.slug, lab.packageVersion);
    return bytesToFileDownload(c, packageBytes, filename);
  });
