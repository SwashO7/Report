import { Hono } from 'hono';
import { env, isProd, googleOAuthEnabled } from '../config/env';
import { csrfOriginCheck } from './middleware';
import { toSafeErrorResponse } from './errors';
import { healthRoutes } from '../routes/health';
import { authRoutes } from '../auth/auth.routes';
import { learnRoutes } from '../learning/learning.routes';
import { labRoutes } from '../labs/labs.routes';
import { gamificationRoutes } from '../gamification/gamification.routes';
import { settingsRoutes } from '../users/settings.routes';
import { adminRoutes } from '../admin/admin.routes';
import { publicRoutes } from '../public/public.routes';

export function createApp() {
  const app = new Hono();

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

  /* ------------------------------- CSRF ----------------------------------- */
  const trusted = [env.APP_URL, env.API_URL];
  app.use('*', csrfOriginCheck(trusted));

  /* ------------------------------ Routes ---------------------------------- */
  app.route('/api/v1/health', healthRoutes);
  app.route('/api/v1/auth', authRoutes);
  app.route('/api/v1/learn', learnRoutes);
  app.route('/api/v1/labs', labRoutes);
  app.route('/api/v1', gamificationRoutes);
  app.route('/api/v1/me', settingsRoutes);
  app.route('/api/v1/public', publicRoutes);
  app.route('/api/v1/admin', adminRoutes);

  /* ---------------------------- 404 + errors ------------------------------ */
  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' } }, 404));

  app.onError((err, c) => {
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
