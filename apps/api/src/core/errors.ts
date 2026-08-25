import type { Context } from 'hono';

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

export function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    ''
  );
}
