import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { emailOutbox } from '../db/schema';
import { sendEmail } from './provider';
import { renderTemplate, appUrl, type TemplateKey } from './templates';

/**
 * Queues and dispatches transactional email. Every email is persisted to the
 * outbox table first (auditability + retry), then sent through the configured
 * provider. Failures are recorded and never thrown into the caller.
 */
export async function queueEmail(to: string, templateKey: TemplateKey, payload: Record<string, unknown>) {
  try {
    const rendered = renderTemplate(templateKey, payload);
    const [row] = await db
      .insert(emailOutbox)
      .values({
        toEmail: to,
        templateKey,
        subject: rendered.subject,
        payload: payload as Record<string, unknown>,
      })
      .returning({ id: emailOutbox.id });

    await sendEmail({ to, subject: rendered.subject, html: rendered.html, text: rendered.text });
    await db.update(emailOutbox).set({ status: 'sent', sentAt: new Date(), attempts: 1 }).where(eq(emailOutbox.id, row.id));
    return row.id;
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'email_queue_failed', template: templateKey, err: String(err) }));
    return null;
  }
}

export { appUrl };
