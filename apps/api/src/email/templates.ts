import { env } from '../config/env';

/**
 * Branded transactional email templates.
 * Managed in code as a template registry; the admin can configure provider
 * and sender via environment, and future template overrides can plug in here.
 */

function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }): { html: string; text: string } {
  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px auto;"><tr><td style="border-radius:8px;background:#3E7BFA;">
         <a href="${cta.url}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;">${cta.label}</a>
       </td></tr></table>
       <p style="text-align:center;font-size:12px;color:#64748B;margin:12px 0 0 0;">Or copy this link: <span style="color:#94A3B8;">${cta.url}</span></p>`
    : '';

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B1220;font-family:Inter,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B1220;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:24px;" align="center">
          <span style="font-size:18px;font-weight:700;color:#F1F5F9;letter-spacing:0.02em;">SURAKSHA LABS</span>
          <div style="font-size:11px;color:#64748B;letter-spacing:0.14em;text-transform:uppercase;margin-top:2px;">by Shadow Security</div>
        </td></tr>
        <tr><td style="background:#111B2E;border:1px solid #1E2A40;border-radius:12px;padding:36px 36px 32px 36px;">
          <h1 style="margin:0 0 16px 0;font-size:20px;color:#F1F5F9;font-weight:600;">${title}</h1>
          <div style="font-size:14px;line-height:1.7;color:#B6C2D6;">${bodyHtml}</div>
          ${ctaHtml}
        </td></tr>
        <tr><td style="padding-top:20px;" align="center">
          <span style="font-size:12px;color:#475569;">You are receiving this because of activity on your Suraksha Labs account.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${title}\n\n${bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`;
  return { html, text };
}

export interface TemplatePayload {
  [key: string]: unknown;
}

export const templates = {
  verify_email(payload: { url: string; name: string }) {
    const { html, text } = layout(
      'Verify your email address',
      `<p>Hi ${escapeHtml(payload.name)},</p><p>Welcome to Suraksha Labs. Confirm your email address to activate your account and start your cybersecurity journey.</p><p>This link expires in 24 hours.</p>`,
      { label: 'Verify Email', url: payload.url },
    );
    return { subject: 'Verify your email — Suraksha Labs', html, text };
  },

  reset_password(payload: { url: string; name: string }) {
    const { html, text } = layout(
      'Reset your password',
      `<p>Hi ${escapeHtml(payload.name)},</p><p>We received a request to reset your password. Click the button below to choose a new one.</p><p>This link expires in 1 hour and can be used once. If you did not request this, you can safely ignore this email.</p>`,
      { label: 'Reset Password', url: payload.url },
    );
    return { subject: 'Reset your password — Suraksha Labs', html, text };
  },

  welcome(payload: { name: string; url: string }) {
    const { html, text } = layout(
      'Welcome to Suraksha Labs',
      `<p>Hi ${escapeHtml(payload.name)},</p><p>Your account is ready. Start with <strong>Level 0 — Foundations</strong> and work your way from internet basics to practical security skills.</p><p>Learn the concepts. Practice them. Then prove it in the labs.</p>`,
      { label: 'Start Learning', url: payload.url },
    );
    return { subject: 'Welcome to Suraksha Labs', html, text };
  },

  lab_completed(payload: { name: string; labTitle: string; xp: number; url: string }) {
    const { html, text } = layout(
      'Lab completed',
      `<p>Well done, ${escapeHtml(payload.name)}.</p><p>You solved <strong>${escapeHtml(payload.labTitle)}</strong> and earned <strong>+${payload.xp} XP</strong>.</p>`,
      { label: 'View Achievement', url: payload.url },
    );
    return { subject: `Lab completed: ${payload.labTitle} — Suraksha Labs`, html, text };
  },

  achievement_unlocked(payload: { name: string; title: string; description: string; xp: number; url: string }) {
    const { html, text } = layout(
      `Achievement unlocked: ${escapeHtml(payload.title)}`,
      `<p>${escapeHtml(payload.description)}</p><p>Reward: <strong>+${payload.xp} XP</strong></p>`,
      { label: 'View Profile', url: payload.url },
    );
    return { subject: `Achievement unlocked: ${payload.title} — Suraksha Labs`, html, text };
  },

  rank_milestone(payload: { name: string; rank: number; url: string }) {
    const { html, text } = layout(
      'You reached a new rank',
      `<p>Impressive progress, ${escapeHtml(payload.name)}.</p><p>You are now ranked <strong>#${payload.rank}</strong> on the global leaderboard.</p>`,
      { label: 'View Leaderboard', url: payload.url },
    );
    return { subject: 'New rank milestone — Suraksha Labs', html, text };
  },

  new_content(payload: { title: string; kind: string; url: string }) {
    const { html, text } = layout(
      `New ${payload.kind} available`,
      `<p><strong>${escapeHtml(payload.title)}</strong> was just published on Suraksha Labs.</p>`,
      { label: 'Open', url: payload.url },
    );
    return { subject: `New ${payload.kind}: ${payload.title} — Suraksha Labs`, html, text };
  },
};

export type TemplateKey = keyof typeof templates;

export function renderTemplate(key: TemplateKey, payload: TemplatePayload) {
  const fn = templates[key];
  if (!fn) throw new Error(`Unknown email template: ${key}`);
  return fn(payload as never);
}

export function appUrl(path: string): string {
  return `${env.APP_URL.replace(/\/$/, '')}${path}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch);
}
