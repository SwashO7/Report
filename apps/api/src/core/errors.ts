import type { Context } from 'hono';
import { env } from '../config/env';

/** Application error with an HTTP status and a safe, user-facing message. */
export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errors = {
  badRequest: (msg = 'Invalid request', details?: unknown) => new AppError(400, 'BAD_REQUEST', msg, details),
  unauthorized: (msg = 'Authentication required') => new AppError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'You do not have permission to perform this action') => new AppError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Resource not found') => new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Resource already exists') => new AppError(409, 'CONFLICT', msg),
  tooMany: (msg = 'Too many requests. Please slow down.') => new AppError(429, 'RATE_LIMITED', msg),
  internal: (msg = 'Something went wrong on our side. Please try again.') => new AppError(500, 'INTERNAL_ERROR', msg),
};

/** Standard JSON error envelope. */
export function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, ...(details !== undefined ? { details } : {}) } };
}

/** Converts any thrown value into a safe API response without leaking internals. */
export function toSafeErrorResponse(err: unknown): { status: number; body: ReturnType<typeof errorBody> } {
  if (err instanceof AppError) {
    return { status: err.status, body: errorBody(err.code, err.message, err.details) };
  }
  return { status: 500, body: errorBody('INTERNAL_ERROR', errors.internal().message) };
}

/**
 * The client's IP, as trustworthy as the deployment allows.
 *
 * `X-Forwarded-For` is a list that each proxy APPENDS to, so the leftmost entry
 * is whatever the original caller sent - fully attacker-controlled. Reading the
 * left end (as this used to) let anyone defeat every rate limit by sending a
 * different `X-Forwarded-For` on each request, and made the audit log's IP
 * hashes meaningless.
 *
 * The only trustworthy entries are the ones our own infrastructure appended, so
 * we count in from the RIGHT. `TRUSTED_PROXY_HOPS` is how many proxies sit in
 * front of the app:
 *
 *   0 - direct, or a single nginx that appends the real peer (Docker Compose)
 *   1 - Cloud Run behind the global load balancer ("client, lb")
 *
 * Set it too low and you rate-limit your own proxy as one client; too high and
 * you are back to trusting attacker input. It is deliberately explicit.
 */
export function getClientIp(c: Context): string {
  const hops = env.TRUSTED_PROXY_HOPS;
  const forwarded = c.req.header('x-forwarded-for');

  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      // Walk in from the right by the number of proxies we control.
      const index = Math.max(0, parts.length - 1 - hops);
      return parts[index];
    }
  }

  return c.req.header('x-real-ip')?.trim() || '';
}
