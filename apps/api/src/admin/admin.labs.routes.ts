import { Hono } from 'hono';
import { z } from 'zod';
import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { difficultyLevels, labCategories, labs } from '../db/schema';
import { errors } from '../core/errors';
import { requireLabManager, getAuthUser } from '../core/auth';
import { hasRole } from '../core/rbac';
import { audit } from '../audit/audit.service';
import { labCreateSchema, labUpdateSchema } from '@suraksha/shared';
import { flagHmacFor } from '../core/crypto';
import { saveLabPackage, STORAGE_ROOT } from '../storage/labs.storage';
import { join, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

export const adminLabRoutes = new Hono()
  .use('*', requireLabManager)

  /* -------------------------------- List ----------------------------------- */
  .get('/', async (c) => {
    const url = new URL(c.req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get('pageSize') ?? 20)));
    const q = url.searchParams.get('q');
    const status = url.searchParams.get('status');

    const conditions = [];
    if (q) {
      const like = `%${q.replace(/[%_]/g, '')}%`;
      conditions.push(or(ilike(labs.title, like), ilike(labs.slug, like)));
    }
    if (status) conditions.push(eq(labs.status, status));
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: labs.id,
        slug: labs.slug,
        title: labs.title,
        status: labs.status,
        visibility: labs.visibility,
        version: labs.version,
        packageVersion: labs.packageVersion,
        category: labCategories.name,
        difficulty: difficultyLevels.label,
        xpReward: labs.xpReward,
        estimatedMinutes: labs.estimatedMinutes,
        attemptCount: labs.attemptCount,
        solveCount: labs.solveCount,
        downloadCount: labs.downloadCount,
        hasPackage: sql<boolean>`package_path IS NOT NULL`,
        createdAt: labs.createdAt,
        updatedAt: labs.updatedAt,
        publishedAt: labs.publishedAt,
      })
      .from(labs)
      .innerJoin(labCategories, eq(labs.categoryId, labCategories.id))
      .innerJoin(difficultyLevels, eq(labs.difficultyId, difficultyLevels.id))
      .where(where)
      .orderBy(desc(labs.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const [{ total }] = await db.select({ total: count() }).from(labs).where(where);

    return c.json({
      labs: rows.map((r) => ({
        ...r,
        hasPackage: Boolean(r.hasPackage),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        publishedAt: r.publishedAt?.toISOString() ?? null,
      })),
      pagination: { page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) },
    });
  })

  /* -------------------------------- Create --------------------------------- */
  .post('/', async (c) => {
    const user = getAuthUser(c);
    const input = labCreateSchema.parse(await c.req.json());
    const dup = (await db.select({ id: labs.id }).from(labs).where(eq(labs.slug, input.slug)).limit(1))[0];
    if (dup) throw errors.conflict('A lab with this slug already exists.');

    const [row] = await db
      .insert(labs)
      .values({
        ...input,
        flagHmac: flagHmacFor(input.flagHash, input.flagCaseSensitive), // input.flagHash carries the plaintext flag
        authorId: user.id,
        status: 'draft',
      })
      .returning({ id: labs.id, slug: labs.slug });
    await audit({ actorId: user.id, action: 'lab_created', entityType: 'lab', entityId: row.id, metadata: { slug: row.slug } });
    return c.json({ lab: row }, 201);
  })

  /* -------------------------------- Update --------------------------------- */
  .get('/:id', async (c) => {
    const row = (await db.select().from(labs).where(eq(labs.id, c.req.param('id'))).limit(1))[0];
    if (!row) throw errors.notFound('Lab not found.');
    return c.json({
      lab: {
        ...row,
        // Plaintext flag never leaves the server; client sends it fresh on change.
        flagHmac: undefined,
        hasFlag: true,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        publishedAt: row.publishedAt?.toISOString() ?? null,
      },
    });
  })

  .patch('/:id', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const current = (await db.select().from(labs).where(eq(labs.id, id)).limit(1))[0];
    if (!current) throw errors.notFound('Lab not found.');

    const body = await c.req.json();
    const input = labUpdateSchema.parse(body);

    // Flag updates are sensitive — require explicit flag field and audit them.
    let flagUpdate = {};
    if (typeof body.flag === 'string' && body.flag.length > 0) {
      const flagInput = z.string().min(4).max(500).parse(body.flag);
      flagUpdate = { flagHmac: flagHmacFor(flagInput, current.flagCaseSensitive) };
      await audit({ actorId: user.id, action: 'flag_modified', entityType: 'lab', entityId: id, metadata: { slug: current.slug } });
    }

    const { flagHash, ...rest } = input as Record<string, unknown>;
    const [row] = await db
      .update(labs)
      .set({ ...rest, ...flagUpdate, updatedAt: new Date() })
      .where(eq(labs.id, id))
      .returning({ id: labs.id, slug: labs.slug });

    await audit({ actorId: user.id, action: 'lab_modified', entityType: 'lab', entityId: id, metadata: { slug: current.slug, changes: Object.keys(rest) } });
    return c.json({ lab: row });
  })

  /* ------------------------------ Package upload ---------------------------- */
  .post('/:id/package', hasRole('lab_manager', 'administrator', 'super_admin'), async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const lab = (await db.select().from(labs).where(eq(labs.id, id)).limit(1))[0];
    if (!lab) throw errors.notFound('Lab not found.');

    const body = await c.req.parseBody();
    const file = body['package'];
    const versionInput = z.string().regex(/^\d+\.\d+\.\d+$/).default(lab.packageVersion).parse(body['version'] ?? lab.packageVersion);
    if (!(file instanceof File)) throw errors.badRequest('Attach the lab package as a zip file under the "package" field.');
    if (!file.name.toLowerCase().endsWith('.zip')) throw errors.badRequest('The lab package must be a .zip archive.');
    const MAX = 200 * 1024 * 1024;
    if (file.size > MAX) throw errors.badRequest('Package exceeds the 200 MB limit.');

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await saveLabPackage(lab.slug, versionInput, buffer);

    await db
      .update(labs)
      .set({
        packagePath: stored.absolutePath,
        packageSizeBytes: stored.sizeBytes,
        packageVersion: versionInput,
        updatedAt: new Date(),
      })
      .where(eq(labs.id, id));

    await audit({ actorId: user.id, action: 'lab_package_uploaded', entityType: 'lab', entityId: id, metadata: { slug: lab.slug, version: versionInput, sizeBytes: stored.sizeBytes } });
    return c.json({ ok: true, packageVersion: versionInput, sizeBytes: stored.sizeBytes });
  })

  /* ------------------------------ Status workflow ---------------------------- */
  .post('/:id/status', async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const input = z
      .object({ status: z.enum(['draft', 'internal_testing', 'security_review', 'ready', 'published', 'archived']) })
      .parse(await c.req.json());

    const current = (await db.select().from(labs).where(eq(labs.id, id)).limit(1))[0];
    if (!current) throw errors.notFound('Lab not found.');

    // Publishing gates: must have a package and be reviewed by a publisher role.
    if (input.status === 'published') {
      if (!current.packagePath) throw errors.badRequest('Upload the lab package before publishing.');
      if (!['lab_manager', 'administrator', 'super_admin'].includes(user.role)) throw errors.forbidden();
      if (current.status === 'draft' || current.status === 'internal_testing') {
        // Publishing from early stages requires a publisher role (security gate).
        if (!['administrator', 'super_admin'].includes(user.role)) {
          throw errors.forbidden('Labs must pass security review before publishing. Move the lab to Security Review first.');
        }
      }
    }
    if ((input.status === 'security_review' || input.status === 'ready') && !current.packagePath) {
      throw errors.badRequest('Upload the lab package before requesting review.');
    }

    const [row] = await db
      .update(labs)
      .set({
        status: input.status,
        reviewerId: user.id,
        ...(input.status === 'security_review' ? { securityReviewedAt: new Date() } : {}),
        ...(input.status === 'published' ? { publishedAt: current.publishedAt ?? new Date() } : {}),
        ...(input.status === 'archived' ? { archivedAt: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(labs.id, id))
      .returning({ id: labs.id, slug: labs.slug, status: labs.status });

    await audit({ actorId: user.id, action: `lab_${input.status}`, entityType: 'lab', entityId: id, metadata: { slug: current.slug, from: current.status, to: input.status } });
    return c.json({ lab: row });
  })

  /* -------------------------------- Delete ---------------------------------- */
  .delete('/:id', hasRole('administrator', 'super_admin'), async (c) => {
    const user = getAuthUser(c);
    const id = c.req.param('id');
    const current = (await db.select().from(labs).where(eq(labs.id, id)).limit(1))[0];
    if (!current) throw errors.notFound('Lab not found.');
    if (current.status === 'published') throw errors.badRequest('Archive the lab instead of deleting it — learner progress must be preserved.');
    await db.delete(labs).where(eq(labs.id, id));
    await audit({ actorId: user.id, action: 'lab_deleted', entityType: 'lab', entityId: id, metadata: { slug: current.slug } });
    return c.json({ ok: true });
  })

  /* ------------------------------- Metadata ---------------------------------- */
  .get('/meta/taxonomy', async (c) => {
    const [cats, diffs] = await Promise.all([db.select().from(labCategories).orderBy(labCategories.sortOrder), db.select().from(difficultyLevels).orderBy(difficultyLevels.sortOrder)]);
    return c.json({ categories: cats, difficulties: diffs });
  });
