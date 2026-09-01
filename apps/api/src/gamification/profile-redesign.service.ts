import { and, eq, gte } from 'drizzle-orm';
import { db } from '../db/client';
import { users, xpEvents } from '../db/schema';
import { evaluateAchievements } from './achievements';
import {
  achievementCatalog,
  learnerDashboard as baseLearnerDashboard,
  myAchievements,
  publicProfile as basePublicProfile,
  xpProgressFor,
} from './profile.service';

export { achievementCatalog, myAchievements, xpProgressFor };

export async function learnerDashboard(userId: string) {
  await evaluateAchievements({ userId, event: 'streak_day' });
  const dashboard = await baseLearnerDashboard(userId);
  const [user] = await db
    .select({ streakCount: users.streakCount, lastActiveDate: users.lastActiveDate })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 6);
  const recent = await db
    .select({ amount: xpEvents.amount, createdAt: xpEvents.createdAt })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, start)));

  const today = new Date().toISOString().slice(0, 10);
  const activeDays = [...new Set(recent.map((event) => event.createdAt.toISOString().slice(0, 10)))];
  if (user?.lastActiveDate === today && !activeDays.includes(today)) activeDays.push(today);
  const todayXp = recent
    .filter((event) => event.createdAt.toISOString().slice(0, 10) === today)
    .reduce((sum, event) => sum + event.amount, 0);

  return {
    ...dashboard,
    momentum: {
      streakDays: user?.streakCount ?? 0,
      todayXp,
      dailyGoalXp: 20,
      activeDays,
    },
  };
}

export async function publicProfile(username: string, viewerIsSelf: boolean) {
  const profile = await basePublicProfile(username, viewerIsSelf);
  const [user] = await db
    .select({ streakCount: users.streakCount })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return { ...profile, streakDays: user?.streakCount ?? 0 };
}
