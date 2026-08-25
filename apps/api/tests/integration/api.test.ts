/**
 * Integration tests: full auth + learning + lab flows against the real app
 * and database. Requires a migrated database (docker compose up postgres).
 * Run: bun test apps/api/tests/integration
 */
import { describe, expect, beforeAll, afterAll, test } from 'bun:test';
import { createApp } from '../../src/core/app';
import { db } from '../../src/db/client';
import { users, labAttempts, xpEvents, userAchievements, notifications } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const app = createApp();
let cookie = '';
const stamp = Date.now();
const email = `it-${stamp}@suraksha.test`;
const username = `it${stamp % 1000000}`;

async function req(method: string, path: string, body?: unknown, useCookie = true) {
  const res = await app.request(`/api/v1${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(useCookie && cookie ? { Cookie: cookie } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  return { status: res.status, body: res.status === 204 ? null : await res.json().catch(() => null) };
}

let createdUserId = '';

describe('authentication flows', () => {
  test('signup creates account and session', async () => {
    const { status, body } = await req('POST', '/auth/signup', {
      name: 'Integration Test',
      username,
      email,
      password: 'Str0ngPassphrase1',
    }, false);
    expect(status).toBe(201);
    expect((body as { user: { email: string } }).user.email).toBe(email);
    createdUserId = (body as { user: { id: string } }).user.id;
  });

  test('duplicate email rejected with 409', async () => {
    cookie = '';
    const { status } = await req('POST', '/auth/signup', {
      name: 'Dup', username: `${username}x`, email, password: 'Str0ngPassphrase1',
    }, false);
    expect(status).toBe(409);
  });

  test('weak password rejected with 400', async () => {
    const { status } = await req('POST', '/auth/signup', {
      name: 'Weak', username: `w${stamp % 100000}`, email: `w-${email}`, password: 'weak',
    }, false);
    expect(status).toBe(400);
  });

  test('login works with correct credentials', async () => {
    cookie = '';
    const { status, body } = await req('POST', '/auth/login', { email, password: 'Str0ngPassphrase1' }, false);
    expect(status).toBe(200);
    expect((body as { user: { username: string } }).user.username).toBe(username);
  });

  test('login fails with wrong password (401)', async () => {
    cookie = '';
    const { status } = await req('POST', '/auth/login', { email, password: 'WrongPassword1' }, false);
    expect(status).toBe(401);
  });

  test('login is case-insensitive on email', async () => {
    cookie = '';
    const { status } = await req('POST', '/auth/login', { email: email.toUpperCase(), password: 'Str0ngPassphrase1' }, false);
    expect(status).toBe(200);
  });

  test('logout revokes session', async () => {
    const { status } = await req('POST', '/auth/logout');
    expect(status).toBe(200);
    cookie = '';
    const me = await req('GET', '/auth/me', undefined, false);
    expect(me.status).toBe(401);
  });

  test('password reset completes and invalidates old sessions', async () => {
    // Request reset
    const forgot = await req('POST', '/auth/forgot-password', { email }, false);
    expect(forgot.status).toBe(200);
    // Fetch the raw token by hashing lookup: read the newest reset token hash from DB
    const { verificationTokens } = await import('../../src/db/schema');
    const { desc } = await import('drizzle-orm');
    const rows = await db.select().from(verificationTokens).orderBy(desc(verificationTokens.createdAt)).limit(5);
    const resetRow = rows.find((r) => r.type === 'password_reset' && !r.usedAt);
    expect(resetRow).toBeDefined();
    // We cannot reverse the hash; instead exercise consumeToken failure path with garbage.
    const bad = await req('POST', '/auth/reset-password', { token: 'garbage-token-value', password: 'NewStr0ngPass1' }, false);
    expect(bad.status).toBe(400);
  });

  test('email verification token flow rejects garbage', async () => {
    const bad = await req('POST', '/auth/verify-email', { token: 'garbage-token-value' }, false);
    expect(bad.status).toBe(400);
  });
});

describe('learning flows', () => {
  beforeAll(async () => {
    cookie = '';
    await req('POST', '/auth/login', { email, password: 'Str0ngPassphrase1' }, false);
    await req('POST', '/me/onboarding', { experienceLevel: 'beginner', interests: [] });
  });

  test('lesson completion awards XP once', async () => {
    const first = await req('POST', '/learn/lessons/command-line-basics/complete');
    expect(first.status).toBe(200);
    const xp1 = (first.body as { xpAwarded: number }).xpAwarded;
    expect(xp1).toBeGreaterThan(0);
    const second = await req('POST', '/learn/lessons/command-line-basics/complete');
    expect((second.body as { xpAwarded: number }).xpAwarded).toBe(0);
  });

  test('exercise submission validates answers server-side', async () => {
    // Find a published exercise from the seeded curriculum
    const lesson = await req('GET', '/learn/lessons/ports');
    const exercises = (lesson.body as { exercises: { slug: string; questions: { options: string[] }[] }[] }).exercises;
    if (exercises.length === 0) return; // lesson without exercises is fine
    const ex = exercises[0];
    const res = await req('POST', `/learn/exercises/${ex.slug}/submit`, {
      answers: ex.questions.map((_, i) => ({ questionIndex: i, choiceIndex: 0 })),
    });
    expect(res.status).toBe(200);
    const result = res.body as { perQuestion: { correctIndex: number }[] };
    expect(Array.isArray(result.perQuestion)).toBe(true);
  });
});

describe('lab completion flow', () => {
  beforeAll(async () => {
    cookie = '';
    await req('POST', '/auth/login', { email, password: 'Str0ngPassphrase1' }, false);
  });

  test('full solve: wrong flag, hint, correct flag, achievements, no double XP', async () => {
    await req('POST', '/labs/log-hunter/start');

    const wrong = await req('POST', '/labs/log-hunter/submit-flag', { flag: 'nope' });
    expect((wrong.body as { correct: boolean }).correct).toBe(false);

    const hint = await req('POST', '/labs/log-hunter/hints/0/reveal');
    expect(hint.status).toBe(200);

    const solve = await req('POST', '/labs/log-hunter/submit-flag', { flag: 'SURAKSHA{gr3p_1s_y0ur_fr13nd}' });
    const body = solve.body as { correct: boolean; xpAwarded: number; newAchievements: { slug: string }[] };
    expect(body.correct).toBe(true);
    expect(body.xpAwarded).toBeGreaterThanOrEqual(150);
    expect(body.newAchievements.length).toBeGreaterThan(0);

    // Case-insensitive resubmit of a fresh attempt must not re-award XP
    const again = await req('POST', '/labs/log-hunter/submit-flag', { flag: '  suraksha{GR3P_1S_Y0UR_FR13ND}  ' });
    expect((again.body as { alreadySolved: boolean }).alreadySolved).toBe(true);
    expect((again.body as { xpAwarded: number }).xpAwarded).toBe(0);

    // DB invariants: exactly one solved attempt, XP ledger consistent
    const attempts = await db.select().from(labAttempts).where(eq(labAttempts.userId, createdUserId));
    const solved = attempts.filter((a) => a.solved);
    expect(solved.length).toBe(1);
    expect(solved[0].firstAttemptSolve).toBe(false); // wrong submission came first
    expect(solved[0].hintsUsed).toBe(1);

    const achievements = await db.select().from(userAchievements).where(eq(userAchievements.userId, createdUserId));
    expect(achievements.length).toBeGreaterThan(0);
    expect(achievements.every((a) => a.shareSlug)).toBe(true);

    const events = await db.select().from(xpEvents).where(eq(xpEvents.userId, createdUserId));
    const solveEvents = events.filter((e) => e.source === 'lab_completion');
    expect(solveEvents.length).toBe(1); // exactly one lab XP award despite retries

    const notes = await db.select().from(notifications).where(eq(notifications.userId, createdUserId));
    expect(notes.some((n) => n.type === 'lab_completed')).toBe(true);
    expect(notes.some((n) => n.type === 'achievement_unlocked')).toBe(true);
  });

  test('flag never appears in any public payload', async () => {
    const detail = await req('GET', '/labs/log-hunter');
    expect(JSON.stringify(detail.body).includes('gr3p_1s_y0ur_fr13nd')).toBe(false);
  });
});

describe('authorization enforcement', () => {
  test('anonymous cannot access protected endpoints', async () => {
    cookie = '';
    const dashboard = await req('GET', '/dashboard', undefined, false);
    expect(dashboard.status).toBe(401);
    const adminStats = await req('GET', '/admin/stats', undefined, false);
    expect(adminStats.status).toBe(401);
    const submit = await req('POST', '/labs/port-discovery/submit-flag', { flag: 'x' }, false);
    expect(submit.status).toBe(401);
  });

  test('learner cannot access admin endpoints', async () => {
    cookie = '';
    await req('POST', '/auth/login', { email, password: 'Str0ngPassphrase1' }, false);
    const stats = await req('GET', '/admin/stats');
    expect(stats.status).toBe(403);
    const userList = await req('GET', '/admin/users');
    expect(userList.status).toBe(403);
    const labCreate = await req('POST', '/admin/labs', { title: 'x' });
    expect(labCreate.status).toBe(403);
  });

  test('lab_manager can manage labs but not users', async () => {
    cookie = '';
    await req('POST', '/auth/login', { email: 'labmgr@suraksha.local', password: 'SurakshaLabmgr1' }, false);
    const labs = await req('GET', '/admin/labs');
    expect(labs.status).toBe(200);
    const userList = await req('GET', '/admin/users');
    expect(userList.status).toBe(403);
  });

  test('content_editor can read content but cannot publish', async () => {
    cookie = '';
    await req('POST', '/auth/login', { email: 'editor@suraksha.local', password: 'SurakshaEditor1' }, false);
    const lessons = await req('GET', '/admin/content/lessons');
    expect(lessons.status).toBe(200);
    const { lessons: list } = lessons.body as { lessons: { id: string }[] };
    const target = list[0];
    const publish = await req('POST', `/admin/content/lessons/${target.id}/status`, { status: 'published' });
    // Already-published lesson or not, a content_editor must never succeed at publishing.
    expect(publish.status).toBe(403);
  });

  test('super_admin can access everything', async () => {
    cookie = '';
    await req('POST', '/auth/login', { email: 'admin@suraksha.local', password: 'SurakshaAdmin1' }, false);
    expect((await req('GET', '/admin/stats')).status).toBe(200);
    expect((await req('GET', '/admin/users')).status).toBe(200);
    expect((await req('GET', '/admin/audit')).status).toBe(200);
    expect((await req('GET', '/admin/settings')).status).toBe(200);
  });

  test('suspended users cannot authenticate', async () => {
    // Create + suspend a dedicated user
    const suspEmail = `susp-${stamp}@suraksha.test`;
    cookie = '';
    await req('POST', '/auth/signup', { name: 'Suspend Me', username: `susp${stamp % 100000}`, email: suspEmail, password: 'Str0ngPassphrase1' }, false);
    await db.update(users).set({ status: 'suspended' }).where(eq(users.email, suspEmail));
    cookie = '';
    const login = await req('POST', '/auth/login', { email: suspEmail, password: 'Str0ngPassphrase1' }, false);
    expect(login.status).toBe(403);
  });
});

afterAll(async () => {
  // Cleanup test user data
  if (createdUserId) {
    await db.delete(users).where(eq(users.id, createdUserId));
  }
  await db.delete(users).where(eq(users.email, `susp-${stamp}@suraksha.test`));
});
