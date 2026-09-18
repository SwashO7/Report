import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { verifyUnsubscribeToken } from './unsubscribe';

/**
 * Public one-click unsubscribe. Reachable without a session so a recipient can
 * opt out straight from an email. The token is HMAC-signed and verified in
 * constant time; a bad token yields a neutral page and changes nothing.
 *
 * Only `emailOptOut` (marketing/announcements) is flipped — transactional mail
 * ignores this flag, so unsubscribing never locks anyone out of their account.
 */

function page(title: string, message: string, ok: boolean): string {
  const accent = ok ? '#3E7BFA' : '#64748B';
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;background:#0B1220;font-family:Inter,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:64px 16px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <tr><td align="center" style="padding-bottom:20px;">
          <span style="font-size:18px;font-weight:700;color:#F1F5F9;letter-spacing:0.02em;">SURAKSHA LABS</span>
        </td></tr>
        <tr><td style="background:#111B2E;border:1px solid #1E2A40;border-radius:12px;padding:36px;text-align:center;">
          <h1 style="margin:0 0 12px 0;font-size:20px;color:#F1F5F9;font-weight:600;">${title}</h1>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#B6C2D6;">${message}</p>
          <div style="height:3px;width:48px;background:${accent};border-radius:2px;margin:24px auto 0;"></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export const unsubscribeRoutes = new Hono().get('/', async (c) => {
  const token = c.req.query('token') ?? '';
  const userId = verifyUnsubscribeToken(token);

  if (!userId) {
    return c.html(
      page(
        'Link not recognized',
        'This unsubscribe link is invalid or has expired. If you keep receiving announcements, update your email preferences from your account settings.',
        false,
      ),
      400,
    );
  }

  // Parameterised update; idempotent — already opted-out stays opted-out.
  await db.update(users).set({ emailOptOut: true, updatedAt: new Date() }).where(eq(users.id, userId));

  return c.html(
    page(
      'You have been unsubscribed',
      'You will no longer receive announcement emails from Suraksha Labs. Account emails such as password resets are still delivered. You can re-enable announcements anytime from your account settings.',
      true,
    ),
  );
});
