import type { MiddlewareHandler } from 'hono';
import { getClientIp } from './errors';
import { env } from '../config/env';

/**
 * Network-level gate for the admin surface.
 *
 * HOW THIS FITS THE LAYERS. The authoritative control is at the EDGE: a Cloud
 * Armor policy (and ideally Identity-Aware Proxy) that refuses non-allowlisted
 * traffic to /api/v1/admin/* before it ever reaches the app. That is what makes
 * an admin surface cheap to defend - blocked requests cost no compute.
 *
 * This middleware is the second layer, and it exists because edge rules are
 * configuration and configuration drifts: a Terraform apply that drops a rule, a
 * new load balancer wired up without the policy, or a staging environment nobody
 * remembered to protect. Then the application itself is the last thing standing.
 * It is cheap, so it runs regardless.
 *
 * FAIL-OPEN IS DELIBERATE, AND NARROW. With ADMIN_IP_ALLOWLIST unset the guard
 * does nothing, because local development and the Docker Compose stack have no
 * stable address to allowlist and the team still needs to log in. Production
 * MUST set it - the deployment guide treats an unset value as a launch blocker,
 * and the API logs a warning on boot so an empty value is never silent.
 */

/** Parses an IPv4 address to a 32-bit integer, or null when it is not IPv4. */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = (value << 8) | octet;
  }
  return value >>> 0;
}

/**
 * True when `ip` falls inside `entry`, which may be a bare address or CIDR.
 *
 * IPv6 is compared literally (normalised case) rather than by prefix: getting
 * IPv6 prefix maths subtly wrong would silently widen the allowlist, which is
 * the one failure this guard must not have. Office egress is IPv4 in practice;
 * an IPv6 range should be handled at the edge where it can be expressed exactly.
 */
export function ipMatchesEntry(ip: string, entry: string): boolean {
  const candidate = ip.trim();
  const rule = entry.trim();
  if (!candidate || !rule) return false;

  if (rule.includes(':') || candidate.includes(':')) {
    return candidate.toLowerCase() === rule.toLowerCase();
  }

  if (!rule.includes('/')) return candidate === rule;

  const [network, bitsRaw] = rule.split('/');
  const bits = Number(bitsRaw);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;

  const netInt = ipv4ToInt(network);
  const ipInt = ipv4ToInt(candidate);
  if (netInt === null || ipInt === null) return false;

  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (netInt & mask) === (ipInt & mask);
}

/** The parsed allowlist. Empty means "not configured". */
export function adminAllowlist(): string[] {
  return (env.ADMIN_IP_ALLOWLIST ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminIpAllowed(ip: string): boolean {
  const list = adminAllowlist();
  if (list.length === 0) return true; // not configured - see fail-open note above
  return list.some((entry) => ipMatchesEntry(ip, entry));
}

/**
 * Rejects admin requests from outside the allowlist.
 *
 * Answers 404, not 403. A 403 confirms "the admin API is here, you are just not
 * welcome", which tells a scanner exactly what to keep hammering; 404 makes the
 * surface look absent. The real reason is logged server-side so a locked-out
 * colleague is diagnosable.
 */
export function adminNetworkGuard(): MiddlewareHandler {
  return async (c, next) => {
    const ip = getClientIp(c);

    if (!isAdminIpAllowed(ip)) {
      console.warn(`[admin] blocked admin request from non-allowlisted IP: ${ip || 'unknown'} ${c.req.method} ${c.req.path}`);
      return c.json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } }, 404);
    }

    await next();
  };
}

/** Logged once at boot so an unprotected production admin surface is never silent. */
export function warnIfAdminSurfaceUnrestricted(): void {
  if (env.NODE_ENV !== 'production') return;
  if (adminAllowlist().length === 0) {
    console.warn(
      '[admin] SECURITY: ADMIN_IP_ALLOWLIST is empty in production - the admin API is reachable from any address. ' +
        'Set it to your VPN/office egress ranges, and put a Cloud Armor policy in front of /api/v1/admin/*.',
    );
  }
}
