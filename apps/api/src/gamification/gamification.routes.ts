import { Hono } from 'hono';
import { leaderboardQuerySchema } from '@suraksha/shared';
import { requireAuth,  resolveSessionUser, getAuthUser } from '../core/auth';
import { errors } from '../core/errors';
import { globalLeaderboard, categoryLeaderboard, seasonLeaderboard, currentSeasonLeaderboard } from './leaderboard';
import { achievementCatalog, learnerDashboard, myAchievements, publicProfile, xpProgressFor } from './profile-redesign.service';

export const gamificationRoutes = new Hono()

  /* ----------------------------- Leaderboard ------------------------------ */
  .get('/leaderboard', async (c) => {
    const user = await resolveSessionUser(c);
    const query = leaderboardQuerySchema.parse(Object.fromEntries(new URL(c.req.url).searchParams));

    if (query.season) {
      const season = await seasonLeaderboard(query.season, query.page, user?.id);
      return c.json(season);
    }
    if (query.category) {
      const category = await categoryLeaderboard(query.category, query.page, user?.id);
      return c.json(category);
    }
    // Default: current season if one is live, otherwise global.
    const season = await currentSeasonLeaderboard(query.page, user?.id);
    if (season) return c.json(season);
    return c.json(await globalLeaderboard(query.page, user?.id));
  })

  /* ----------------------------- Achievements ----------------------------- */
  .get('/achievements', async (c) => {
    const user = await resolveSessionUser(c);
    return c.json({ achievements: await achievementCatalog(user?.id) });
  })

  .get('/achievements/mine', requireAuth, async (c) => {
    const user = getAuthUser(c);
    return c.json({ achievements: await myAchievements(user.id), xp: await xpProgressFor(user.id) });
  })

  /* ------------------------------ Dashboard -------------------------------- */
  .get('/dashboard', requireAuth, async (c) => {
    const user = getAuthUser(c);
    return c.json(await learnerDashboard(user.id));
  })

  /* -------------------------------- Profile -------------------------------- */
  .get('/profiles/:username', async (c) => {
    const viewer = await resolveSessionUser(c);
    const username = c.req.param('username');
    const viewerIsSelf = viewer?.username === username;
    return c.json(await publicProfile(username, viewerIsSelf));
  });
