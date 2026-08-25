import { and, asc, count, desc, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { labAttempts, labCategories, labs, seasons, users, xpEvents } from '../db/schema';
import type { LeaderboardEntry, LeaderboardResponse } from '@suraksha/shared';

const PAGE = 25;

export async function globalLeaderboard(page: number, meId?: string): Promise<LeaderboardResponse> {
  const offset = (page - 1) * PAGE;
  const rows = await db
    .select({
      username: users.username,
      name: users.name,
      avatarUrl: users.avatarUrl,
      xp: users.xp,
      labsSolved: sql<number>`(SELECT COUNT(*) FROM lab_attempts la WHERE la.user_id = ${users.id} AND la.solved = true)`,
      achievementCount: sql<number>`(SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = ${users.id})`,
    })
    .from(users)
    .where(and(eq(users.role, 'learner'), eq(users.status, 'active'), eq(users.profileVisibility, 'public'), sql`${users.xp} > 0`))
    .orderBy(desc(users.xp), asc(users.username))
    .limit(PAGE)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.role, 'learner'), eq(users.status, 'active'), eq(users.profileVisibility, 'public'), sql`${users.xp} > 0`));

  const entries: LeaderboardEntry[] = rows.map((r, i) => ({
    rank: offset + i + 1,
    user: { username: r.username, name: r.name, avatarUrl: r.avatarUrl },
    value: r.xp,
    labsSolved: Number(r.labsSolved),
    achievementCount: Number(r.achievementCount),
  }));

  let me: LeaderboardEntry | null = null;
  if (meId) {
    const meRow = await db
      .select({ xp: users.xp, username: users.username, name: users.name, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, meId))
      .limit(1);
    if (meRow[0] && meRow[0].xp > 0) {
      const [{ ahead }] = await db
        .select({ ahead: count() })
        .from(users)
        .where(and(sql`${users.xp} > ${meRow[0].xp}`, eq(users.profileVisibility, 'public'), eq(users.role, 'learner')));
      me = {
        rank: Number(ahead) + 1,
        user: { username: meRow[0].username, name: meRow[0].name, avatarUrl: meRow[0].avatarUrl },
        value: meRow[0].xp,
      };
    }
  }

  return {
    scope: { kind: 'global', label: 'Global' },
    entries,
    me,
    pagination: { page, pageSize: PAGE, total: Number(total), totalPages: Math.ceil(Number(total) / PAGE) },
  };
}

export async function categoryLeaderboard(categorySlug: string, page: number, meId?: string): Promise<LeaderboardResponse> {
  const cat = await db.select().from(labCategories).where(eq(labCategories.slug, categorySlug)).limit(1);
  if (!cat[0]) {
    return { scope: { kind: 'category', label: categorySlug }, entries: [], me: null, pagination: { page, pageSize: PAGE, total: 0, totalPages: 0 } };
  }

  const baseWhere = and(
    eq(labAttempts.solved, true),
    eq(labs.categoryId, cat[0].id),
    eq(users.role, 'learner'),
    eq(users.status, 'active'),
    eq(users.profileVisibility, 'public'),
  );

  const rows = await db
    .select({
      username: users.username,
      name: users.name,
      avatarUrl: users.avatarUrl,
      value: sql<number>`SUM(${labs.xpReward})`,
      labsSolved: sql<number>`COUNT(*)`,
    })
    .from(labAttempts)
    .innerJoin(labs, eq(labAttempts.labId, labs.id))
    .innerJoin(users, eq(labAttempts.userId, users.id))
    .where(baseWhere)
    .groupBy(users.id, users.username, users.name, users.avatarUrl)
    .orderBy(desc(sql`SUM(${labs.xpReward})`))
    .limit(PAGE)
    .offset((page - 1) * PAGE);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${users.id})` })
    .from(labAttempts)
    .innerJoin(labs, eq(labAttempts.labId, labs.id))
    .innerJoin(users, eq(labAttempts.userId, users.id))
    .where(baseWhere);

  const entries: LeaderboardEntry[] = rows.map((r, i) => ({
    rank: (page - 1) * PAGE + i + 1,
    user: { username: r.username, name: r.name, avatarUrl: r.avatarUrl },
    value: Number(r.value),
    labsSolved: Number(r.labsSolved),
  }));

  let me: LeaderboardEntry | null = null;
  if (meId) {
    const meRow = await db
      .select({
        username: users.username,
        name: users.name,
        avatarUrl: users.avatarUrl,
        value: sql<number>`COALESCE(SUM(${labs.xpReward}), 0)`,
        labsSolved: sql<number>`COUNT(*)`,
      })
      .from(labAttempts)
      .innerJoin(labs, eq(labAttempts.labId, labs.id))
      .innerJoin(users, eq(labAttempts.userId, users.id))
      .where(and(baseWhere, eq(users.id, meId)))
      .groupBy(users.id, users.username, users.name, users.avatarUrl);
    if (meRow[0] && Number(meRow[0].value) > 0) {
      const [{ aheadRows }] = await db
        .select({
          aheadRows: sql<number>`COUNT(*) FROM (
            SELECT la.user_id FROM lab_attempts la
            JOIN labs l ON l.id = la.lab_id
            JOIN users u ON u.id = la.user_id
            WHERE la.solved = true AND l.category_id = ${cat[0].id}
              AND u.profile_visibility = 'public' AND u.role = 'learner' AND u.status = 'active'
            GROUP BY la.user_id
            HAVING SUM(l.xp_reward) > ${Number(meRow[0].value)}
          ) sub`,
        })
        .from(sql`(SELECT 1) AS x`);
      me = {
        rank: Number(aheadRows) + 1,
        user: { username: meRow[0].username, name: meRow[0].name, avatarUrl: meRow[0].avatarUrl },
        value: Number(meRow[0].value),
        labsSolved: Number(meRow[0].labsSolved),
      };
    }
  }

  return {
    scope: { kind: 'category', label: cat[0].name },
    entries,
    me,
    pagination: { page, pageSize: PAGE, total: Number(total), totalPages: Math.ceil(Number(total) / PAGE) },
  };
}

export async function seasonLeaderboard(seasonName: string, page: number, meId?: string): Promise<LeaderboardResponse> {
  const season = await db.select().from(seasons).where(eq(seasons.name, seasonName)).limit(1);
  if (!season[0]) {
    return { scope: { kind: 'season', label: seasonName }, entries: [], me: null, pagination: { page, pageSize: PAGE, total: 0, totalPages: 0 } };
  }
  return windowLeaderboard(season[0].startsAt, season[0].endsAt, season[0].name, page, meId);
}

export async function currentSeasonLeaderboard(page: number, meId?: string): Promise<LeaderboardResponse | null> {
  const now = new Date();
  const season = await db
    .select()
    .from(seasons)
    .where(and(lte(seasons.startsAt, now), gte(seasons.endsAt, now)))
    .orderBy(desc(seasons.startsAt))
    .limit(1);
  if (!season[0]) return null;
  return windowLeaderboard(season[0].startsAt, season[0].endsAt, season[0].name, page, meId);
}

async function windowLeaderboard(
  startsAt: Date,
  endsAt: Date,
  label: string,
  page: number,
  meId?: string,
): Promise<LeaderboardResponse> {
  const baseWhere = and(
    gte(xpEvents.createdAt, startsAt),
    lte(xpEvents.createdAt, endsAt),
    sql`${xpEvents.amount} > 0`,
    eq(users.role, 'learner'),
    eq(users.status, 'active'),
    eq(users.profileVisibility, 'public'),
  );

  const rows = await db
    .select({
      username: users.username,
      name: users.name,
      avatarUrl: users.avatarUrl,
      value: sql<number>`SUM(${xpEvents.amount})`,
    })
    .from(xpEvents)
    .innerJoin(users, eq(xpEvents.userId, users.id))
    .where(baseWhere)
    .groupBy(users.id, users.username, users.name, users.avatarUrl)
    .orderBy(desc(sql`SUM(${xpEvents.amount})`))
    .limit(PAGE)
    .offset((page - 1) * PAGE);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${users.id})` })
    .from(xpEvents)
    .innerJoin(users, eq(xpEvents.userId, users.id))
    .where(baseWhere);

  const entries: LeaderboardEntry[] = rows.map((r, i) => ({
    rank: (page - 1) * PAGE + i + 1,
    user: { username: r.username, name: r.name, avatarUrl: r.avatarUrl },
    value: Number(r.value),
  }));

  return {
    scope: { kind: 'season', label },
    entries,
    me: null,
    pagination: { page, pageSize: PAGE, total: Number(total), totalPages: Math.ceil(Number(total) / PAGE) },
  };
}
