import type { MiddlewareHandler } from 'hono';
import { resolveSessionUser } from './auth';
import { errors } from './errors';
import type { Role } from '@suraksha/shared';

/**
 * Inline role gate for routes that already have an authenticated context
 * (e.g. inside a router mounted after a broader staff gate).
 */
export function hasRole(...roles: readonly Role[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('authUser');
    if (!user) {
      const resolved = await resolveSessionUser(c);
      if (!resolved) throw errors.unauthorized();
      c.set('authUser', resolved);
      if (!roles.includes(resolved.role)) throw errors.forbidden();
    } else if (!roles.includes(user.role)) {
      throw errors.forbidden();
    }
    await next();
  };
}
