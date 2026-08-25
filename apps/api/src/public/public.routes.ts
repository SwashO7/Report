import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { userAchievements, achievements, labs, users } from '../db/schema';
import { errors } from '../core/errors';
import type { ShareCardData } from '@suraksha/shared';

/** Public, unauthenticated endpoints for shared achievement pages. */
export const publicRoutes = new Hono()

  .get('/achievements/:shareSlug', async (c) => {
    const shareSlug = c.req.param('shareSlug');
    const row = (
      await db
        .select({ ua: userAchievements, a: achievements, u: users })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .innerJoin(users, eq(userAchievements.userId, users.id))
        .where(eq(userAchievements.shareSlug, shareSlug))
        .limit(1)
    )[0];
    if (!row || row.u.status !== 'active' || row.u.profileVisibility !== 'public') {
      throw errors.notFound('This achievement page does not exist or is no longer public.');
    }

    const meta = row.ua.meta as { labSlug?: string; solveTimeSeconds?: number; percentile?: number };
    let lab: { slug: string; title: string } | null = null;
    if (meta?.labSlug) {
      const labRow = (await db.select({ slug: labs.slug, title: labs.title }).from(labs).where(eq(labs.slug, meta.labSlug)).limit(1))[0];
      lab = labRow ?? null;
    }

    const data: ShareCardData = {
      shareSlug: row.ua.shareSlug!,
      user: { name: row.u.name, username: row.u.username, avatarUrl: row.u.avatarUrl },
      achievement: {
        slug: row.a.slug,
        title: row.a.title,
        description: row.a.description,
        icon: row.a.icon,
        category: row.a.category,
        rarity: row.a.rarity as ShareCardData['achievement']['rarity'],
        xpReward: row.a.xpReward,
      },
      lab,
      xpAwarded: row.a.xpReward,
      solveTimeSeconds: meta?.solveTimeSeconds ?? null,
      percentile: meta?.percentile ?? null,
      unlockedAt: row.ua.unlockedAt.toISOString(),
    };
    return c.json(data);
  });
