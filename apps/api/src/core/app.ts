import { Hono } from 'hono';
import { ZodError } from 'zod';
import { env, isProd, googleOAuthEnabled } from '../config/env';
import { csrfOriginCheck, rateLimitMiddleware } from './middleware';
import { warnIfAdminSurfaceUnrestricted } from './admin-network';
import { toSafeErrorResponse } from './errors';
import { healthRoutes } from '../routes/health';
import { authRoutes } from '../auth/auth.routes';
import { learnRoutes } from '../learning/learning.routes';
import { diagramRoutes } from '../diagrams/diagrams.routes';
import { labRoutes } from '../labs/labs.routes';
import { gamificationRoutes } from '../gamification/gamification.routes';
import { settingsRoutes } from '../users/settings.routes';
import { adminRoutes } from '../admin/admin.routes';
import { publicRoutes } from '../public/public.routes';
import { unsubscribeRoutes } from '../email/unsubscribe.routes';
import { reportRoutes } from '../reports/reports.routes';

export function createApp() {
  const app = new Hono();

  // Shouts at boot if production is running with an unrestricted admin surface.
  warnIfAdminSurfaceUnrestricted();

  /* ---------------------------- Security headers --------------------------- */
  app.use('*', async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('X-XSS-Protection', '0');
    if (isProd) {
      c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
    // Minimal CSP for the API itself (serves JSON + zip downloads only).
    c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  });

  /* --------------------- Global request ceiling (cost) --------------------- */
  /**
   * A blanket per-IP limit across EVERY endpoint, including reads.
   *
   * The per-route limits protect specific abuse paths (credential stuffing, flag
   * guessing). They left every ordinary GET - the path list, lesson bodies, the
   * leaderboard - completely unbudgeted, and on a pay-per-use autoscaler an
   * unbudgeted read is a billing vector: hammering a cheap endpoint scales
   * instances up and the invoice with them.
   *
   * Generous enough that a real learner never sees it (a page view is a handful
   * of requests), low enough that a single host cannot drive autoscaling.
   *
   * Health checks are exempt so the platform can always probe liveness, and
   * because a 429 there would cause the very restarts it is meant to prevent.
   */
  app.use('*', async (c, next) => {
    if (c.req.path.startsWith('/api/v1/health')) return next();
    return rateLimitMiddleware('global', env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS)(c, next);
  });

  /* ------------------------------- CSRF ----------------------------------- */
  const trusted = [env.APP_URL, env.API_URL];
  app.use('*', csrfOriginCheck(trusted));

  /* ------------------------------ Routes ---------------------------------- */
  app.route('/api/v1/health', healthRoutes);
  app.route('/api/v1/auth', authRoutes);
  app.route('/api/v1/learn', learnRoutes);
  app.route('/api/v1/diagrams', diagramRoutes);
  app.route('/api/v1/labs', labRoutes);
  app.route('/api/v1', gamificationRoutes);
  app.route('/api/v1/me', settingsRoutes);
  app.route('/api/v1/public', publicRoutes);
  app.route('/api/v1/reports', reportRoutes);
  app.route('/api/v1/unsubscribe', unsubscribeRoutes);
  app.route('/api/v1/admin', adminRoutes);

  /* ---------------------------- 404 + errors ------------------------------ */
  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' } }, 404));

  app.onError((err, c) => {
    // Validation errors: safe, client-facing 400 with field details.
    if (err instanceof ZodError) {
      const details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return c.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please check the highlighted fields.', details } },
        400,
      );
    }
    const { status, body } = toSafeErrorResponse(err);
    if (status >= 500) {
      // Structured application log — no stack traces to clients, full detail to server logs.
      console.error(
        JSON.stringify({
          level: 'error',
          method: c.req.method,
          path: c.req.path,
          status,
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5).join('\n') : undefined,
          time: new Date().toISOString(),
        }),
      );
    }
    return c.json(body, status as 400);
  });

  return app;
}

export const oauthConfigured = googleOAuthEnabled;
