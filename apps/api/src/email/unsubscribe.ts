import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env';
import { appUrl } from './templates';

/**
 * Stateless, HMAC-signed unsubscribe tokens — NO database table.
 *
 * A token is `<userId>.<signature>`, where the signature is an HMAC-SHA256 over
 * the userId keyed on FLAG_HMAC_SECRET (SESSION_SECRET as a fallback). This lets
 * a one-click unsubscribe link in an email flip `emailOptOut` without the
 * recipient signing in, while remaining unforgeable: only the server can mint a
 * valid signature. Verification uses `crypto.timingSafeEqual` so a wrong token
 * cannot be discovered byte-by-byte through response timing.
 */

const SECRET = env.FLAG_HMAC_SECRET || env.SESSION_SECRET;

function sign(userId: string): string {
  return createHmac('sha256', SECRET).update(userId).digest('base64url');
}

/** Mint an unsubscribe token for a user. */
export function unsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/**
 * Verify a token and return the userId it authorizes, or null when it is
 * malformed or the signature does not match. Constant-time on the signature.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  if (typeof token !== 'string' || token.length === 0 || token.length > 512) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;

  const userId = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = sign(userId);

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) {
    // Keep timing roughly constant even on a length mismatch.
    timingSafeEqual(expectedBuf, expectedBuf);
    return null;
  }
  if (!timingSafeEqual(providedBuf, expectedBuf)) return null;
  return userId;
}

/** Absolute unsubscribe URL for a user, pointing at the public API route. */
export function unsubscribeUrl(userId: string): string {
  return `${env.API_URL.replace(/\/$/, '')}/api/v1/unsubscribe?token=${encodeURIComponent(unsubscribeToken(userId))}`;
}

/**
 * Append a footer with an unsubscribe link to a NON-transactional email body.
 * Transactional mail must never call this — account mail ignores the opt-out.
 * The link is server-generated, so no escaping of external input is required.
 */
export function appendUnsubscribeFooter(html: string, userId: string): string {
  const url = unsubscribeUrl(userId);
  const footer = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr><td align="center" style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748B;padding:16px;">
      You are receiving Suraksha Labs announcements.
      <a href="${url}" style="color:#94A3B8;text-decoration:underline;">Unsubscribe</a>
    </td></tr>
  </table>`;

  // Insert just before </body> when present, otherwise append.
  const idx = html.lastIndexOf('</body>');
  if (idx !== -1) return `${html.slice(0, idx)}${footer}${html.slice(idx)}`;
  return `${html}${footer}`;
}

/** Plain-text unsubscribe line for the text/plain part of an announcement. */
export function unsubscribeTextLine(userId: string): string {
  return `\n\n---\nUnsubscribe: ${unsubscribeUrl(userId)}`;
}

export { appUrl };
