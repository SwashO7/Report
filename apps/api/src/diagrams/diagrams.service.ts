import { asc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { diagrams } from '../db/schema';
import { errors } from '../core/errors';

export const DIAGRAM_MIME_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
export type DiagramMime = (typeof DIAGRAM_MIME_TYPES)[number];

/** Hard ceiling on stored diagram size. Diagrams are illustrations, not assets. */
export const MAX_DIAGRAM_BYTES = 512 * 1024;

export const DIAGRAM_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Conservative SVG sanitiser.
 *
 * Diagrams render through `<img src>`, where browsers already refuse to run
 * script, and the API serves them under `Content-Security-Policy: default-src
 * 'none'` with `nosniff`. This strips the dangerous constructs anyway, so a
 * stored diagram is safe even if it is ever inlined or opened directly.
 *
 * Uploads come from authenticated content editors, so this is defence in depth
 * against a compromised editor account or a copy-pasted file from the internet -
 * not the only control.
 */
export function sanitizeSvg(input: string): string {
  let svg = input.trim();

  if (!/<svg[\s>]/i.test(svg)) {
    throw errors.badRequest('That does not look like an SVG. It must contain an <svg> element.');
  }

  svg = svg
    // Executable content.
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '')
    // foreignObject can embed arbitrary HTML.
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/<foreignObject\b[^>]*\/>/gi, '')
    // Entity declarations / DTDs (billion laughs, external entities).
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!ENTITY[\s\S]*?>/gi, '')
    // Inline event handlers: on*="..." / on*='...' / on*=bare
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    // javascript: / data: URLs in any attribute.
    .replace(/(href|xlink:href|src)\s*=\s*"\s*(javascript|data)\s*:[^"]*"/gi, '')
    .replace(/(href|xlink:href|src)\s*=\s*'\s*(javascript|data)\s*:[^']*'/gi, '')
    // External references - a diagram must be self-contained.
    .replace(/(href|xlink:href|src)\s*=\s*"\s*https?:[^"]*"/gi, '')
    .replace(/(href|xlink:href|src)\s*=\s*'\s*https?:[^']*'/gi, '')
    // <set>/<animate> attributeName="onload" style tricks.
    .replace(/<(set|animate)\b[^>]*attributeName\s*=\s*["']?on[a-z]+["']?[^>]*>/gi, '');

  if (/<script|javascript:|<foreignObject/i.test(svg)) {
    throw errors.badRequest('This SVG contains active content that cannot be stored.');
  }

  return svg;
}

export type DiagramInput = {
  slug: string;
  title: string;
  description?: string;
  mimeType: DiagramMime;
  /** SVG markup, or base64 for raster types. */
  content: string;
  category?: string;
};

function normalize(input: DiagramInput): {
  slug: string;
  title: string;
  description: string;
  mimeType: string;
  encoding: 'utf8' | 'base64';
  content: string;
  sizeBytes: number;
  category: string;
} {
  if (!DIAGRAM_SLUG_RE.test(input.slug)) {
    throw errors.badRequest('Slug must be lowercase letters, numbers and hyphens.');
  }
  if (!DIAGRAM_MIME_TYPES.includes(input.mimeType)) {
    throw errors.badRequest('Unsupported image type. Use SVG, PNG, JPEG, WebP or GIF.');
  }

  const isSvg = input.mimeType === 'image/svg+xml';
  const content = isSvg ? sanitizeSvg(input.content) : input.content.replace(/^data:[^,]+,/, '').trim();
  const encoding: 'utf8' | 'base64' = isSvg ? 'utf8' : 'base64';

  if (!isSvg && !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
    throw errors.badRequest('Raster diagrams must be base64 encoded.');
  }

  const sizeBytes = isSvg ? Buffer.byteLength(content, 'utf8') : Buffer.from(content, 'base64').byteLength;
  if (sizeBytes > MAX_DIAGRAM_BYTES) {
    throw errors.badRequest(`Diagram is too large (${Math.round(sizeBytes / 1024)}KB). Limit is ${MAX_DIAGRAM_BYTES / 1024}KB.`);
  }
  if (sizeBytes === 0) throw errors.badRequest('Diagram content is empty.');

  return {
    slug: input.slug,
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    mimeType: input.mimeType,
    encoding,
    content,
    sizeBytes,
    category: (input.category ?? 'general').trim() || 'general',
  };
}

/** Admin list. Omits content so the payload stays small. */
export async function listDiagrams() {
  const rows = await db
    .select({
      id: diagrams.id,
      slug: diagrams.slug,
      title: diagrams.title,
      description: diagrams.description,
      mimeType: diagrams.mimeType,
      sizeBytes: diagrams.sizeBytes,
      category: diagrams.category,
      updatedAt: diagrams.updatedAt,
    })
    .from(diagrams)
    .orderBy(asc(diagrams.category), asc(diagrams.slug));
  return rows.map((r) => ({
    ...r,
    updatedAt: r.updatedAt.toISOString(),
    url: `/api/v1/diagrams/${r.slug}`,
  }));
}

/** Full record including editable source, for the admin editor. */
export async function getDiagram(slug: string) {
  const row = (await db.select().from(diagrams).where(eq(diagrams.slug, slug)).limit(1))[0];
  if (!row) throw errors.notFound('Diagram not found.');
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    mimeType: row.mimeType,
    encoding: row.encoding,
    content: row.content,
    sizeBytes: row.sizeBytes,
    category: row.category,
    updatedAt: row.updatedAt.toISOString(),
    url: `/api/v1/diagrams/${row.slug}`,
  };
}

/** Bytes + content type for the public image route. */
export async function renderDiagram(slug: string): Promise<{ body: Uint8Array; contentType: string; updatedAt: Date } | null> {
  const row = (
    await db
      .select({ content: diagrams.content, encoding: diagrams.encoding, mimeType: diagrams.mimeType, updatedAt: diagrams.updatedAt })
      .from(diagrams)
      .where(eq(diagrams.slug, slug))
      .limit(1)
  )[0];
  if (!row) return null;
  const body = row.encoding === 'base64' ? Buffer.from(row.content, 'base64') : Buffer.from(row.content, 'utf8');
  return { body: new Uint8Array(body), contentType: row.mimeType, updatedAt: row.updatedAt };
}

export async function createDiagram(input: DiagramInput, userId: string) {
  const v = normalize(input);
  const dup = (await db.select({ id: diagrams.id }).from(diagrams).where(eq(diagrams.slug, v.slug)).limit(1))[0];
  if (dup) throw errors.conflict('A diagram with this slug already exists.');
  const [row] = await db
    .insert(diagrams)
    .values({ ...v, updatedById: userId })
    .returning({ id: diagrams.id, slug: diagrams.slug });
  return row;
}

export async function updateDiagram(
  slug: string,
  patch: Partial<Omit<DiagramInput, 'slug'>>,
  userId: string,
) {
  const existing = (await db.select().from(diagrams).where(eq(diagrams.slug, slug)).limit(1))[0];
  if (!existing) throw errors.notFound('Diagram not found.');

  const merged = normalize({
    slug,
    title: patch.title ?? existing.title,
    description: patch.description ?? existing.description,
    mimeType: (patch.mimeType ?? existing.mimeType) as DiagramMime,
    content: patch.content ?? existing.content,
    category: patch.category ?? existing.category,
  });

  const [row] = await db
    .update(diagrams)
    .set({ ...merged, updatedById: userId, updatedAt: new Date() })
    .where(eq(diagrams.slug, slug))
    .returning({ id: diagrams.id, slug: diagrams.slug });
  return row;
}

export async function deleteDiagram(slug: string) {
  const existing = (await db.select({ id: diagrams.id }).from(diagrams).where(eq(diagrams.slug, slug)).limit(1))[0];
  if (!existing) throw errors.notFound('Diagram not found.');
  await db.delete(diagrams).where(eq(diagrams.slug, slug));
  return { id: existing.id };
}
