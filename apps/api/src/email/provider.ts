import { env, smtpEnabled, zeptoMailEnabled, isDev } from '../config/env';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface MailProvider {
  name: string;
  send(message: EmailMessage): Promise<void>;
}

/** Development provider — logs the email to the server console. */
const consoleProvider: MailProvider = {
  name: 'console',
  async send(message) {
    console.info(
      JSON.stringify({
        level: 'info',
        msg: 'email_dev_transport',
        to: message.to,
        subject: message.subject,
        // Never log full HTML in prod; dev convenience only.
        preview: message.text.slice(0, 300),
      }),
    );
  },
};

/** SMTP provider via nodemailer — configured through environment variables. */
const smtpProvider: MailProvider = {
  name: 'smtp',
  async send(message) {
    const nodemailer = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  },
};

/**
 * ZeptoMail (Zoho) transactional API provider.
 *
 * Chosen over SMTP for production because Cloud Run scales to zero: a single
 * HTTPS request has no connection to establish, pool, or leak, and ZeptoMail
 * returns a request id we can log for support tickets.
 *
 * Failures are surfaced to the caller as a thrown error; `sendEmail` decides
 * whether to swallow them so a mail outage never blocks a signup.
 */
const zeptoMailProvider: MailProvider = {
  name: 'zeptomail',
  async send(message) {
    const { address, name } = parseFrom(env.EMAIL_FROM);

    const res = await fetch(`https://${env.ZEPTOMAIL_HOST}/v1.1/email`, {
      method: 'POST',
      headers: {
        // ZeptoMail expects this exact scheme, not a Bearer token.
        Authorization: `Zoho-enczapikey ${env.ZEPTOMAIL_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: { address, name },
        to: [{ email_address: { address: message.to } }],
        subject: message.subject,
        htmlbody: message.html,
        textbody: message.text,
        ...(env.ZEPTOMAIL_REPLY_TO ? { reply_to: [{ address: env.ZEPTOMAIL_REPLY_TO }] } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      // ZeptoMail puts the real reason in the body; keep it out of user-facing errors.
      const detail = await res.text().catch(() => '');
      throw new Error(`zeptomail ${res.status}: ${detail.slice(0, 500)}`);
    }
  },
};

/** Splits `Name <addr@example.com>` into its parts; tolerates a bare address. */
function parseFrom(from: string): { address: string; name: string } {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  if (m) return { name: m[1].replace(/^"|"$/g, ''), address: m[2] };
  return { name: 'Suraksha Labs', address: from.trim() };
}

export function getMailProvider(): MailProvider {
  if (zeptoMailEnabled) return zeptoMailProvider;
  return smtpEnabled ? smtpProvider : consoleProvider;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = getMailProvider();
  try {
    await provider.send(message);
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'email_send_failed', provider: provider.name, to: message.to, err: String(err) }));
    if (isDev) throw err;
    // In prod we swallow: email failures must not break auth flows.
  }
}
