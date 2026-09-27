import { Hono, type Context } from 'hono';
import { REPORT_MANAGE_ROLES } from '@suraksha/shared';
import { env } from '../config/env';
import { resolveSessionUser } from '../core/auth';
import { errors } from '../core/errors';
import { parseRange, readReportMediaRange, REPORT_MEDIA_KEY_RE } from '../storage/reports.storage';
import { findMediaOwner, getReportBySlug, listPublishedReports, publishedReportSlugs } from './reports.service';

/**
 * Public, read-only report surface. Anyone may read PUBLISHED reports and their
 * media. Drafts are invisible (404, not 403, so their existence is not leaked)
 * unless the caller holds a report-management role, which lets administrators
 * preview a draft exactly as it will appear.
 *
 * There is intentionally no write endpoint here: creation, editing and deletion
 * live only under /api/v1/admin/reports behind the admin gates.
 */

async function canManageReports(c: Context): Promise<boolean> {
  const user = c.get('authUser') ?? (await resolveSessionUser(c));
  return Boolean(user && REPORT_MANAGE_ROLES.includes(user.role));
}

export const reportRoutes = new Hono()

  /* --------------------------------- Feed ---------------------------------- */
  .get('/', async (c) => {
    const url = new URL(c.req.url);
    const page = Math.max(1, Math.trunc(Number(url.searchParams.get('page'))) || 1);
    const pageSize = Math.min(50, Math.max(1, Math.trunc(Number(url.searchParams.get('pageSize'))) || 12));
    return c.json(await listPublishedReports(page, pageSize));
  })

  /* ------------------------------- Sitemap --------------------------------- */
  // Lets search engines discover every published report URL without a deploy.
  .get('/sitemap.xml', async () => {
    const base = env.APP_URL.replace(/\/+$/, '');
    const rows = await publishedReportSlugs();
    const urls = [
      `  <url><loc>${base}/reports</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
      // Slugs are constrained to [a-z0-9-], so they need no XML escaping.
      ...rows.map((r) => `  <url><loc>${base}/reports/${r.slug}</loc><lastmod>${r.updatedAt.toISOString()}</lastmod></url>`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  })

  /* -------------------------------- Media ---------------------------------- */
  /**
   * Streams an attached image or video. Supports single-range requests so the
   * browser video player can seek (Safari will not play video without them).
   *
   * Media is served with the MIME type verified at upload, `nosniff`, and a
   * sandboxing CSP, so even a crafted polyglot file cannot run as a document.
   */
  .get('/media/:file', async (c) => {
    const file = c.req.param('file');
    if (!REPORT_MEDIA_KEY_RE.test(file)) throw errors.notFound('Media not found.');

    const owner = await findMediaOwner(file);
    if (!owner || owner.sizeBytes <= 0) throw errors.notFound('Media not found.');
    if (!owner.published && !(await canManageReports(c))) throw errors.notFound('Media not found.');

    // Stored names are never reused, so the name itself is a strong validator.
    const etag = `"${file}"`;
    const cacheControl = owner.published ? 'public, max-age=86400' : 'private, no-store';
    if (c.req.header('if-none-match') === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': cacheControl } });
    }

    const size = owner.sizeBytes;
    const range = parseRange(c.req.header('range'), size);
    if (range === 'unsatisfiable') {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
    }
    const start = range?.start ?? 0;
    const end = range?.end ?? size - 1;

    const body = await readReportMediaRange(file, start, end);
    if (!body) throw errors.notFound('Media not found.');

    const headers: Record<string, string> = {
      'Content-Type': owner.mime,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheControl,
      ETag: etag,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    };
    if (range) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    return new Response(body, { status: range ? 206 : 200, headers });
  })

  /* ------------------------------- Detail ---------------------------------- */
  .get('/:slug', async (c) => {
    const report = await getReportBySlug(c.req.param('slug'), () => canManageReports(c));
    if (report.status !== 'published') c.header('Cache-Control', 'private, no-store');
    return c.json({ report });
  });
