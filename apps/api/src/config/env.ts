import { z } from 'zod';

/**
 * Bun auto-loads `.env` from the current working directory. Tests and tools
 * may run from the repo root, so fall back to this package's own `.env`.
 */
async function loadPackageEnv() {
  const needed = ['DATABASE_URL', 'SESSION_SECRET', 'FLAG_HMAC_SECRET'];
  if (needed.every((k) => process.env[k])) return;
  const candidates = [
    new URL('../../.env', import.meta.url),
    new URL('../../../.env', import.meta.url),
  ];
  for (const url of candidates) {
    try {
      const file = Bun.file(url);
      if (!(await file.exists())) continue;
      const text = await file.text();
      for (const line of text.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const key = m[1];
        let value = m[2];
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!(key in process.env) && needed.includes(key)) process.env[key] = value;
      }
      if (needed.every((k) => process.env[k])) return;
    } catch {
      /* ignore unreadable candidate */
    }
  }
}

await loadPackageEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  API_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  /**
   * Postgres connections PER INSTANCE. See apps/api/src/db/client.ts for the
   * sizing rule - this multiplied by Cloud Run max-instances must stay under
   * the Cloud SQL connection limit.
   */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
  SESSION_SECRET: z.string().min(32),
  FLAG_HMAC_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /**
   * ZeptoMail (Zoho) transactional API. Preferred over SMTP in production:
   * one HTTPS call, no connection pool to babysit on a scale-to-zero runtime.
   * Get the token from ZeptoMail console > Mail Agents > SMTP/API info.
   * The value is the raw key; the 'Zoho-enczapikey ' prefix is added for you.
   */
  ZEPTOMAIL_TOKEN: z.string().optional(),
  /** api.zeptomail.in for India-region accounts, api.zeptomail.com elsewhere. */
  ZEPTOMAIL_HOST: z.string().default('api.zeptomail.in'),
  /** Optional ZeptoMail bounce-tracking address shown in the Reply-To header. */
  ZEPTOMAIL_REPLY_TO: z.string().optional(),
  EMAIL_FROM: z.string().default('Suraksha Labs <no-reply@surakshalabs.local>'),
  STORAGE_DIR: z.string().default('./storage'),
  /**
   * When set, lab packages live in this Cloud Storage bucket instead of on the
   * container filesystem. Required in production: Cloud Run instances are
   * ephemeral, so a locally written package disappears on the next deploy.
   */
  GCS_BUCKET: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(60_000),
  /**
   * Sitewide per-IP request ceiling (the global safety net in core/app.ts).
   *
   * Deliberately GENEROUS, because this keys on IP and a college or office NATs
   * every student behind one address - a tight sitewide number throttles a whole
   * classroom, which for a learning platform is a self-inflicted outage. At 1200
   * a single host sustains ~20 req/s, which is far too little to drive Cloud Run
   * autoscaling but still stops a naive flood.
   *
   * Cost protection does NOT rely on this number. It lives on the expensive
   * paths: the lab-download limiter, the DB-backed daily quotas, and the Cloud
   * Armor rules at the edge. Cheap reads are CDN-cacheable and near-free, so
   * squeezing them buys little and costs real users.
   */
  RATE_LIMIT_MAX: z.coerce.number().int().default(1200),
  /**
   * How many proxies we control sit in front of the app. Decides which
   * X-Forwarded-For entry is trustworthy - see getClientIp in core/errors.ts.
   * 0 = direct or single nginx (Compose). 1 = Cloud Run behind the load balancer.
   * Getting this wrong either breaks rate limiting or trusts attacker input.
   */
  TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),

  /* ------------------------- Egress cost controls -------------------------- */
  /**
   * Lab package downloads per user per rolling 24h. Packages are up to 200 MB of
   * metered egress, so this - not the per-minute rate limit - is what bounds the
   * bandwidth bill, because it is counted in the DB and therefore shared across
   * instances. A real learner downloads a package once per lab.
   */
  LAB_DOWNLOAD_DAILY_MAX: z.coerce.number().int().min(1).default(25),
  /**
   * Platform-wide downloads per rolling 24h; 0 disables. A circuit breaker for
   * the case the per-user quota cannot cover: many cheap accounts. Fails closed,
   * turning a runaway bill into a visible, fixable outage.
   */
  LAB_DOWNLOAD_GLOBAL_DAILY_MAX: z.coerce.number().int().min(0).default(2000),

  /* ------------------------- Admin surface hardening ----------------------- */
  /**
   * Comma-separated IPs/CIDRs allowed to reach /api/v1/admin/*. Empty disables
   * the check, which local development needs. Production must set it - see
   * core/admin-network.ts for why this is defence in depth behind Cloud Armor.
   */
  ADMIN_IP_ALLOWLIST: z.string().optional(),
  /**
   * Admin/staff session lifetime in minutes. Deliberately much shorter than a
   * learner session: a stolen staff cookie is the worst case on the platform, so
   * the window in which it is useful is kept small.
   */
  ADMIN_SESSION_MINUTES: z.coerce.number().int().min(5).default(120),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast with a clear message; never log secret values.
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid environment configuration -> ${issues}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const googleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const smtpEnabled = Boolean(env.SMTP_HOST && env.SMTP_PORT);
export const zeptoMailEnabled = Boolean(env.ZEPTOMAIL_TOKEN);
export const gcsEnabled = Boolean(env.GCS_BUCKET);

/**
 * Which mail transport will actually be used, for the admin health panel and
 * boot log. Order matters: ZeptoMail wins over SMTP, SMTP over the dev console.
 */
export const mailTransport: 'zeptomail' | 'smtp' | 'console' = zeptoMailEnabled
  ? 'zeptomail'
  : smtpEnabled
    ? 'smtp'
    : 'console';
