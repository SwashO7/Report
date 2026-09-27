import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import type { Context } from 'hono';
import { z } from 'zod';
import { REPORT_STATUSES, type AdminReportDetail, type AdminReportRow, type ReportCard, type ReportDetail } from '@suraksha/shared';
import { db } from '../db/client';
import { reports } from '../db/schema';
import { errors } from '../core/errors';
import {
  deleteReportMedia,
  saveReportMedia,
  validateReportMedia,
  type ValidatedMedia,
} from '../storage/reports.storage';

type ReportRow = typeof reports.$inferSelect;

export const REPORT_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EXCERPT_LENGTH = 280;

/* -------------------------------- Helpers --------------------------------- */

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '');
}

/**
 * Plain-text preview for cards and meta descriptions. Strips the platform's
 * inline markup (**bold**, *italic*, `code`, [text](url)) so the feed never shows
 * raw syntax, and cuts on a word boundary.
 */
export function makeExcerpt(description: string, length = EXCERPT_LENGTH): string {
  const plain = description
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= length) return plain;
  const cut = plain.slice(0, length);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > length * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
}

export const mediaUrl = (file: string) => `/api/v1/reports/media/${file}`;

function imageOf(r: ReportRow) {
  return r.imageKey && r.imageMime
    ? { url: mediaUrl(r.imageKey), mimeType: r.imageMime, sizeBytes: r.imageSizeBytes ?? 0, alt: r.imageAlt || r.title }
    : null;
}

function videoOf(r: ReportRow) {
  return r.videoKey && r.videoMime ? { url: mediaUrl(r.videoKey), mimeType: r.videoMime, sizeBytes: r.videoSizeBytes ?? 0 } : null;
}

function toCard(r: ReportRow): ReportCard {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: makeExcerpt(r.description),
    image: imageOf(r),
    video: videoOf(r),
    publishedAt: r.publishedAt?.toISOString() ?? null,
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toAdminRow(r: ReportRow): AdminReportRow {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    status: r.status as AdminReportRow['status'],
    hasImage: Boolean(r.imageKey),
    hasVideo: Boolean(r.videoKey),
    publishedAt: r.publishedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === '23505' || e?.cause?.code === '23505';
}

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = (await db.select({ id: reports.id }).from(reports).where(eq(reports.slug, slug)).limit(1))[0];
  return Boolean(row && row.id !== excludeId);
}

/** Derives a free slug from a title: `title`, `title-2`, `title-3`, … */
async function uniqueSlugFor(title: string): Promise<string> {
  const base = slugifyTitle(title) || `report-${crypto.randomUUID().slice(0, 8)}`;
  if (!(await slugTaken(base))) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base.slice(0, 150)}-${n}`;
    if (!(await slugTaken(candidate))) return candidate;
  }
  return `${base.slice(0, 140)}-${crypto.randomUUID().slice(0, 8)}`;
}

/* ------------------------------ Public reads ------------------------------ */

export async function listPublishedReports(page: number, pageSize: number) {
  const where = eq(reports.status, 'published');
  const rows = await db
    .select()
    .from(reports)
    .where(where)
    .orderBy(desc(reports.publishedAt), desc(reports.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total }] = await db.select({ total: count() }).from(reports).where(where);
  return {
    reports: rows.map(toCard),
    pagination: { page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) },
  };
}

/** A published report, or a draft when the caller may preview drafts. */
export async function getReportBySlug(slug: string, canPreviewDrafts: () => Promise<boolean>): Promise<ReportDetail> {
  if (!REPORT_SLUG_RE.test(slug)) throw errors.notFound('Report not found.');
  const row = (await db.select().from(reports).where(eq(reports.slug, slug)).limit(1))[0];
  if (!row) throw errors.notFound('Report not found.');
  // Drafts 404 (not 403) for everyone else, so their existence is not leaked.
  if (row.status !== 'published' && !(await canPreviewDrafts())) throw errors.notFound('Report not found.');
  return { ...toCard(row), description: row.description, status: row.status as ReportDetail['status'] };
}

/** Resolves which report owns a media file, for the public media route's visibility check. */
export async function findMediaOwner(file: string) {
  const row = (
    await db
      .select({
        status: reports.status,
        imageKey: reports.imageKey,
        imageMime: reports.imageMime,
        imageSizeBytes: reports.imageSizeBytes,
        videoMime: reports.videoMime,
        videoSizeBytes: reports.videoSizeBytes,
      })
      .from(reports)
      .where(or(eq(reports.imageKey, file), eq(reports.videoKey, file)))
      .limit(1)
  )[0];
  if (!row) return null;
  const isImage = row.imageKey === file;
  return {
    published: row.status === 'published',
    mime: (isImage ? row.imageMime : row.videoMime) ?? 'application/octet-stream',
    sizeBytes: Number((isImage ? row.imageSizeBytes : row.videoSizeBytes) ?? 0),
  };
}

export async function publishedReportSlugs() {
  return db
    .select({ slug: reports.slug, updatedAt: reports.updatedAt })
    .from(reports)
    .where(eq(reports.status, 'published'))
    .orderBy(desc(reports.publishedAt))
    .limit(5000);
}

/* --------------------------------- Admin ---------------------------------- */

const slugField = z
  .string()
  .trim()
  .max(160)
  .regex(REPORT_SLUG_RE, 'Use lowercase letters, numbers and hyphens only.');

const createFieldsSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200),
  slug: z.union([slugField, z.literal('')]).optional(),
  description: z.string().trim().min(1, 'Add the report information.').max(50_000),
  imageAlt: z.string().trim().max(300).default(''),
  status: z.enum(REPORT_STATUSES).default('draft'),
});

const updateFieldsSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200).optional(),
  slug: slugField.optional(),
  description: z.string().trim().min(1, 'Add the report information.').max(50_000).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  status: z.enum(REPORT_STATUSES).optional(),
  removeImage: z.boolean().default(false),
  removeVideo: z.boolean().default(false),
});

/** Normalized admin form input: text fields plus optional uploaded files. */
export type ReportFormInput = {
  fields: Record<string, unknown>;
  image?: File;
  video?: File;
};

/**
 * Reads a create/update body. Multipart is the normal path (files attached);
 * JSON is accepted for text-only edits. Booleans arrive as strings in multipart.
 */
export async function readReportForm(c: Context): Promise<ReportFormInput> {
  const req = c.req;
  const type = req.header('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') throw errors.badRequest('Invalid request body.');
    return { fields: body };
  }
  if (!type.includes('multipart/form-data') && !type.includes('application/x-www-form-urlencoded')) {
    throw errors.badRequest('Send the report as multipart/form-data.');
  }

  let body: Record<string, string | File | (string | File)[]>;
  try {
    body = await req.parseBody({ all: true });
  } catch {
    throw errors.badRequest('The upload could not be read. Please try again.');
  }

  const fields: Record<string, unknown> = {};
  let image: File | undefined;
  let video: File | undefined;
  for (const [key, raw] of Object.entries(body)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (key === 'image' || key === 'video') {
      if (value instanceof File) {
        if (value.size > 0 || value.name) {
          if (key === 'image') image = value;
          else video = value;
        }
      } else if (typeof value === 'string' && value !== '') {
        throw errors.badRequest(`Attach the ${key} as a file.`);
      }
      continue;
    }
    if (value instanceof File) throw errors.badRequest(`Unexpected file in field "${key}".`);
    fields[key] = key === 'removeImage' || key === 'removeVideo' ? value === 'true' || value === '1' : value;
  }
  return { fields, image, video };
}

export async function adminListReports(opts: { q?: string | null; status?: string | null; page: number; pageSize: number }) {
  const conditions: SQL[] = [];
  if (opts.q) {
    const like = `%${opts.q.replace(/[%_\\]/g, '')}%`;
    conditions.push(or(ilike(reports.title, like), ilike(reports.slug, like))!);
  }
  if (opts.status && (REPORT_STATUSES as readonly string[]).includes(opts.status)) conditions.push(eq(reports.status, opts.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(reports)
    .where(where)
    .orderBy(desc(reports.updatedAt))
    .limit(opts.pageSize)
    .offset((opts.page - 1) * opts.pageSize);
  const [{ total }] = await db.select({ total: count() }).from(reports).where(where);
  return {
    reports: rows.map(toAdminRow),
    pagination: { page: opts.page, pageSize: opts.pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / opts.pageSize) },
  };
}

async function loadRow(id: string): Promise<ReportRow> {
  if (!z.string().uuid().safeParse(id).success) throw errors.notFound('Report not found.');
  const row = (await db.select().from(reports).where(eq(reports.id, id)).limit(1))[0];
  if (!row) throw errors.notFound('Report not found.');
  return row;
}

export async function adminGetReport(id: string): Promise<AdminReportDetail> {
  const row = await loadRow(id);
  return { ...toAdminRow(row), description: row.description, image: imageOf(row), video: videoOf(row) };
}

/** Validates both files before anything is written, so a bad video never leaves an orphaned image. */
async function validateFiles(input: ReportFormInput) {
  const image = input.image ? await validateReportMedia(input.image, 'image') : undefined;
  const video = input.video ? await validateReportMedia(input.video, 'video') : undefined;
  return { image, video };
}

async function storeFiles(files: { image?: ValidatedMedia; video?: ValidatedMedia }) {
  const saved: { image?: string; video?: string } = {};
  try {
    if (files.image) saved.image = await saveReportMedia(files.image);
    if (files.video) saved.video = await saveReportMedia(files.video);
  } catch (err) {
    await deleteReportMedia(saved.image);
    console.error(JSON.stringify({ level: 'error', msg: 'report_media_store_failed', err: String(err) }));
    throw errors.internal('The media upload failed while saving. Nothing was changed - please try again.');
  }
  return saved;
}

export async function adminCreateReport(input: ReportFormInput, userId: string) {
  const fields = createFieldsSchema.parse(input.fields);
  const files = await validateFiles(input);

  let slug: string;
  if (fields.slug) {
    if (await slugTaken(fields.slug)) throw errors.conflict('Another report already uses this URL slug.');
    slug = fields.slug;
  } else {
    slug = await uniqueSlugFor(fields.title);
  }

  const saved = await storeFiles(files);
  try {
    const [row] = await db
      .insert(reports)
      .values({
        slug,
        title: fields.title,
        description: fields.description,
        imageAlt: fields.imageAlt,
        imageKey: saved.image ?? null,
        imageMime: files.image?.mime ?? null,
        imageSizeBytes: files.image?.sizeBytes ?? null,
        videoKey: saved.video ?? null,
        videoMime: files.video?.mime ?? null,
        videoSizeBytes: files.video?.sizeBytes ?? null,
        status: fields.status,
        publishedAt: fields.status === 'published' ? new Date() : null,
        authorId: userId,
      })
      .returning();
    return row;
  } catch (err) {
    await deleteReportMedia(saved.image);
    await deleteReportMedia(saved.video);
    if (isUniqueViolation(err)) throw errors.conflict('Another report already uses this URL slug.');
    throw err;
  }
}

export async function adminUpdateReport(id: string, input: ReportFormInput) {
  const current = await loadRow(id);
  const fields = updateFieldsSchema.parse(input.fields);
  if (input.image && fields.removeImage) throw errors.badRequest('Choose either a new image or removing the image, not both.');
  if (input.video && fields.removeVideo) throw errors.badRequest('Choose either a new video or removing the video, not both.');
  const files = await validateFiles(input);

  if (fields.slug && fields.slug !== current.slug && (await slugTaken(fields.slug, id))) {
    throw errors.conflict('Another report already uses this URL slug.');
  }

  const saved = await storeFiles(files);
  const patch: Partial<typeof reports.$inferInsert> = { updatedAt: new Date() };
  if (fields.title !== undefined) patch.title = fields.title;
  if (fields.slug !== undefined) patch.slug = fields.slug;
  if (fields.description !== undefined) patch.description = fields.description;
  if (fields.imageAlt !== undefined) patch.imageAlt = fields.imageAlt;
  if (fields.status !== undefined) {
    patch.status = fields.status;
    if (fields.status === 'published' && !current.publishedAt) patch.publishedAt = new Date();
  }
  if (saved.image) Object.assign(patch, { imageKey: saved.image, imageMime: files.image!.mime, imageSizeBytes: files.image!.sizeBytes });
  else if (fields.removeImage) Object.assign(patch, { imageKey: null, imageMime: null, imageSizeBytes: null, imageAlt: '' });
  if (saved.video) Object.assign(patch, { videoKey: saved.video, videoMime: files.video!.mime, videoSizeBytes: files.video!.sizeBytes });
  else if (fields.removeVideo) Object.assign(patch, { videoKey: null, videoMime: null, videoSizeBytes: null });

  let row: ReportRow;
  try {
    [row] = await db.update(reports).set(patch).where(eq(reports.id, id)).returning();
  } catch (err) {
    await deleteReportMedia(saved.image);
    await deleteReportMedia(saved.video);
    if (isUniqueViolation(err)) throw errors.conflict('Another report already uses this URL slug.');
    throw err;
  }

  // Only now that the row no longer references them are the old files removed.
  if (saved.image || fields.removeImage) await deleteReportMedia(current.imageKey);
  if (saved.video || fields.removeVideo) await deleteReportMedia(current.videoKey);

  const changes = Object.keys(patch).filter((k) => k !== 'updatedAt');
  return { row, changes, previousSlug: current.slug };
}

export async function adminSetReportStatus(id: string, status: (typeof REPORT_STATUSES)[number]) {
  const current = await loadRow(id);
  const [row] = await db
    .update(reports)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === 'published' && !current.publishedAt ? { publishedAt: new Date() } : {}),
    })
    .where(eq(reports.id, id))
    .returning();
  return { row, from: current.status };
}

export async function adminDeleteReport(id: string) {
  const current = await loadRow(id);
  await db.delete(reports).where(eq(reports.id, id));
  await deleteReportMedia(current.imageKey);
  await deleteReportMedia(current.videoKey);
  return current;
}

/** Body schema for the publish/unpublish endpoint. */
export const reportStatusSchema = z.object({ status: z.enum(REPORT_STATUSES) });
