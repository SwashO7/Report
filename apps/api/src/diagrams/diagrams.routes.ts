import { Hono } from 'hono';
import { renderDiagram } from './diagrams.service';
import { DIAGRAM_SLUG_RE } from './diagrams.service';

/**
 * Public read-only diagram delivery. Lessons embed these via `<img src>`, so the
 * route must be reachable without a JSON envelope and without auth (diagrams are
 * educational illustrations, not user data).
 *
 * A trailing `.svg`/`.png` extension is accepted and ignored so authored content
 * can use a natural-looking URL.
 */
export const diagramRoutes = new Hono().get('/:slug', async (c) => {
  const raw = c.req.param('slug');
  const slug = raw.replace(/\.(svg|png|jpe?g|webp|gif)$/i, '');
  if (!DIAGRAM_SLUG_RE.test(slug)) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Diagram not found.' } }, 404);
  }

  const found = await renderDiagram(slug);
  if (!found) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Diagram not found.' } }, 404);
  }

  // Editors can change a diagram at any time, so revalidate rather than cache hard.
  const etag = `W/"${slug}-${found.updatedAt.getTime()}"`;
  if (c.req.header('if-none-match') === etag) return new Response(null, { status: 304 });

  return new Response(found.body, {
    status: 200,
    headers: {
      'Content-Type': found.contentType,
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      ETag: etag,
      // Belt and braces: even opened directly, a stored SVG can load and run nothing.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
