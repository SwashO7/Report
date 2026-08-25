import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { siteSettings } from '../db/schema';

/**
 * Platform configuration stored in the database and editable by admins.
 * Defaults are seeded; values are cached briefly to avoid hot-path queries.
 */

export interface XpConfig {
  lesson_completion: number;
  practice_completion: number;
  first_attempt_bonus: number;
  no_hint_bonus: number;
}

export interface PlatformConfig {
  registration_enabled: boolean;
  leaderboard_visible: boolean;
  flag_submission_cooldown_seconds: number;
  announcement: { enabled: boolean; message: string } | null;
}

const XP_DEFAULTS: XpConfig = {
  lesson_completion: 50,
  practice_completion: 25,
  first_attempt_bonus: 100,
  no_hint_bonus: 50,
};

const PLATFORM_DEFAULTS: PlatformConfig = {
  registration_enabled: true,
  leaderboard_visible: true,
  flag_submission_cooldown_seconds: 10,
  announcement: null,
};

const cache = new Map<string, { value: unknown; at: number }>();
const TTL = 15_000;

export function invalidateSettingsCache() {
  cache.clear();
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const row = (await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1))[0];
  const value = (row?.value as T) ?? fallback;
  cache.set(key, { value, at: Date.now() });
  return value;
}

export async function setSetting(key: string, value: unknown, updatedBy?: string) {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy, updatedAt: new Date() } });
  invalidateSettingsCache();
}

export async function xpSettings(): Promise<XpConfig> {
  return getSetting<XpConfig>('xp_config', XP_DEFAULTS);
}

export async function platformConfig(): Promise<PlatformConfig> {
  return getSetting<PlatformConfig>('platform_config', PLATFORM_DEFAULTS);
}

export async function allSettings(): Promise<Record<string, unknown>> {
  const rows = await db.select().from(siteSettings);
  const out: Record<string, unknown> = {};
  for (const row of rows) out[row.key] = row.value;
  out.xp_config = { ...XP_DEFAULTS, ...((out.xp_config as object) ?? {}) };
  out.platform_config = { ...PLATFORM_DEFAULTS, ...((out.platform_config as object) ?? {}) };
  return out;
}
