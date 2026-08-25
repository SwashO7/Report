import { env, smtpEnabled, isDev } from '../config/env';

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

export function getMailProvider(): MailProvider {
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
