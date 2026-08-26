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
  SESSION_SECRET: z.string().min(32),
  FLAG_HMAC_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Suraksha Labs <no-reply@surakshalabs.local>'),
  STORAGE_DIR: z.string().default('./storage'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().default(300),
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
