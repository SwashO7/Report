import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { levels, users, xpEvents } from '../db/schema';

export interface LevelRow {
  id: number;
  order: number;
  name: string;
  title: string;
  xpThreshold: number;
}

/** All configured levels ordered by XP threshold (cached briefly). */
let cache: { rows: LevelRow[]; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getLevels(): Promise<LevelRow[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.rows;
  const rows = await db.select().from(levels).orderBy(levels.xpThreshold);
  const mapped = rows.map((r) => ({
    id: r.id,
    order: r.order,
    name: r.name,
    title: r.title,
    xpThreshold: r.xpThreshold,
  }));
  cache = { rows: mapped, at: Date.now() };
  return mapped;
}

export function invalidateLevelsCache() {
  cache = null;
}

/** Pure: resolve the level for a given XP amount against ordered thresholds. */
export function resolveLevel(xp: number, ordered: LevelRow[]): LevelRow | null {
  let current: LevelRow | null = null;
  for (const lvl of ordered) {
    if (xp >= lvl.xpThreshold) current = lvl;
    else break;
  }
  return current;
}

/** Pure: compute progress toward the next level. */
export function computeXpProgress(xp: number, ordered: LevelRow[]) {
  const level = resolveLevel(xp, ordered);
  const next = ordered.find((l) => !level || l.xpThreshold > level.xpThreshold) ?? null;
  const levelStartXp = level?.xpThreshold ?? 0;
  const nextLevelXp = next?.xpThreshold ?? null;
  const progressPercent =
    next && nextLevelXp! > levelStartXp ? Math.min(100, Math.round(((xp - levelStartXp) / (nextLevelXp! - levelStartXp)) * 100)) : next ? 0 : 100;
  return {
    xp,
    level,
    nextLevel: next,
    levelStartXp,
    nextLevelXp,
    progressPercent,
    xpToNextLevel: next ? Math.max(0, nextLevelXp! - xp) : null,
  };
}

/**
 * Awards XP inside an existing transaction (or standalone when `tx` omitted).
 * Records the ledger event and updates the user's denormalized counter +
 * level in one place so callers stay simple.
 */
export async function awardXp(opts: {
  userId: string;
  amount: number;
  source: string;
  sourceId?: string | null;
  description?: string;
  categorySlug?: string | null;
}): Promise<{ newXp: number; newLevelOrder: number }> {
  const [row] = await db
    .insert(xpEvents)
    .values({
      userId: opts.userId,
      amount: opts.amount,
      source: opts.source,
      sourceId: opts.sourceId ?? null,
      description: opts.description ?? '',
      categorySlug: opts.categorySlug ?? null,
    })
    .returning({ id: xpEvents.id });
  void row;

  const updated = await db
    .update(users)
    .set({
      xp: sql`${users.xp} + ${opts.amount}`,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, opts.userId)))
    .returning({ xp: users.xp });
  const newXp = updated[0]?.xp ?? 0;

  const ordered = await getLevels();
  const level = resolveLevel(newXp, ordered);
  const newLevelOrder = level?.order ?? 0;
  await db.update(users).set({ levelOrder: newLevelOrder }).where(eq(users.id, opts.userId));

  return { newXp, newLevelOrder };
}
