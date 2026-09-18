import type { MiddlewareHandler } from 'hono';
import { getClientIp } from './errors';
import { rateLimit } from './rate-limit';

/**
 * Rate limiting middleware factory.
 * Keyed by bucket name + client IP so different surfaces have independent
 * budgets (auth endpoints get strict limits; learning interactions stay open).
 *
 * NOTE ON SCOPE: the counter is in-memory and therefore PER INSTANCE. On a
 * scale-out runtime like Cloud Run the effective limit is this number times the
 * instance count, so treat it as defence in depth and put the authoritative
 * global limit at the edge (Cloud Armor). See docs/GCP_DEPLOYMENT.md Part 7.
 */
export function rateLimitMiddleware(bucket: string, max: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const ip = getClientIp(c) || 'unknown';
    const key = `${bucket}:${ip}`;
    const result = rateLimit(key, max, windowMs);
    if (!result.allowed) {
      c.header('Retry-After', String(result.retryAfterSeconds));
      c.header('X-RateLimit-Remaining', '0');
      return c.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down and try again shortly.' } },
        429,
      );
    }
    c.header('X-RateLimit-Remaining', String(result.remaining));
    await next();
  };
}

/**
 * Rate limits by authenticated user rather than by IP.
 *
 * IP limits are weak against someone on mobile data or a VPN who can rotate
 * addresses cheaply. For actions that require a session and grant something
 * valuable - XP from practice, admin writes - the account is the stable
 * identity worth budgeting. Falls back to IP when no session is present so the
 * limit can never be dodged by simply not logging in.
 */
export function userRateLimitMiddleware(bucket: string, max: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('authUser') as { id?: string } | undefined;
    const identity = user?.id ? `u:${user.id}` : `ip:${getClientIp(c) || 'unknown'}`;
    const result = rateLimit(`${bucket}:${identity}`, max, windowMs);
    if (!result.allowed) {
      c.header('Retry-After', String(result.retryAfterSeconds));
      c.header('X-RateLimit-Remaining', '0');
      return c.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down and try again shortly.' } },
        429,
      );
    }
    c.header('X-RateLimit-Remaining', String(result.remaining));
    await next();
  };
}

/**
 * CSRF protection for cookie-authenticated, state-changing requests:
 * verifies the Origin/Referer header against trusted origins.
 * Safe because cookies are SameSite=Lax and this blocks cross-site POSTs.
 */
export function csrfOriginCheck(trustedOrigins: string[]): MiddlewareHandler {
  return async (c, next) => {
    const method = c.req.method;
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

    const origin = c.req.header('origin') ?? '';
    const referer = c.req.header('referer') ?? '';

    if (!origin && !referer) {
      // Non-browser clients (curl, tests) with no ambient credentials surface;
      // session cookie still required for authed routes.
      return next();
    }
    const check = origin || referer;
    let host = '';
    try {
      host = new URL(check).host;
    } catch {
      return c.json({ error: { code: 'CSRF_REJECTED', message: 'Invalid request origin.' } }, 403);
    }
    const allowed = trustedOrigins.some((o) => {
      try {
        return new URL(o).host === host;
      } catch {
        return false;
      }
    });
    if (!allowed) {
      return c.json({ error: { code: 'CSRF_REJECTED', message: 'Request origin is not allowed.' } }, 403);
    }
    await next();
  };
}
