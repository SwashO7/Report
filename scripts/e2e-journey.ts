/**
 * End-to-end journey smoke test against a running API.
 * Verifies the core learner + admin journeys work end to end.
 * Run: bun scripts/e2e-journey.ts
 */
const BASE = 'http://localhost:3000/api/v1';

let cookie = '';
let failures = 0;

async function call(method: string, path: string, body?: unknown, expectStatus = 200) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status !== expectStatus) {
    failures++;
    console.error(`FAIL ${method} ${path} -> ${res.status} (expected ${expectStatus})`, JSON.stringify(data).slice(0, 200));
    return data as never;
  }
  console.log(`ok   ${method} ${path} -> ${res.status}`);
  return data as never;
}

function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail).slice(0, 300) : '');
  }
}

async function main() {
  console.log('=== Suraksha Labs E2E journey ===\n');

  /* ------------------------------ Health --------------------------------- */
  const health = await call('GET', '/health');
  check('health ok', (health as { status: string }).status === 'ok');

  /* --------------------------- Visitor surface --------------------------- */
  const paths = await call('GET', '/learn/paths');
  check('visitor can browse paths', (paths as { paths: unknown[] }).paths.length >= 4, paths);

  const labs = await call('GET', '/labs');
  check('visitor can browse labs', (labs as { labs: unknown[] }).labs.length >= 4, labs);

  const anonLesson = await call('GET', '/learn/lessons/ports');
  check('lesson detail resolves', (anonLesson as { title: string }).title === 'Ports: Many Services, One Machine');

  /* ------------------------------- Signup -------------------------------- */
  const email = `e2e-${Date.now()}@suraksha.test`;
  const signup = await call(
    'POST',
    '/auth/signup',
    { name: 'E2E Tester', username: `e2e${Date.now() % 100000}`, email, password: 'Str0ngPassphrase1' },
    201,
  );
  check('signup returns user', Boolean((signup as { user?: { id: string } }).user?.id));

  const me = await call('GET', '/auth/me');
  check('session cookie works', (me as { user: { email: string } }).user.email === email);

  /* ------------------------------ Onboarding ----------------------------- */
  await call('POST', '/me/onboarding', { experienceLevel: 'none', interests: ['Web Security'] });
  const me2 = await call('GET', '/auth/me');
  check('onboarding persisted', (me2 as { user: { onboarded: boolean } }).user.onboarded === true);

  /* ---------------------------- Learning flow ---------------------------- */
  const lesson = await call('GET', '/learn/lessons/what-is-a-computer-network');
  check('lesson has blocks', ((lesson as { blocks: unknown[] }).blocks ?? []).length > 0);

  await call('POST', '/learn/lessons/what-is-a-computer-network/start');
  const complete = await call('POST', '/learn/lessons/what-is-a-computer-network/complete');
  check('lesson completion awards XP', (complete as { xpAwarded: number }).xpAwarded > 0, complete);
  const firstXp = (complete as { xpAwarded: number }).xpAwarded;

  const completeAgain = await call('POST', '/learn/lessons/what-is-a-computer-network/complete');
  check('re-completion awards no XP', (completeAgain as { xpAwarded: number }).xpAwarded === 0);

  // Exercise submission (fetch questions from lesson, answer all index 0 — may fail; just verify endpoint contract)
  const ex = await call('GET', '/learn/lessons/network-basics-quiz-exists', undefined, 404); // negative test
  check('unknown lesson 404s', ex !== null);

  const continueRes = await call('GET', '/learn/continue');
  check('continue returns next lesson', Boolean((continueRes as { next?: { slug: string } }).next?.slug), continueRes);

  const practice = await call('GET', '/learn/exercises');
  check('practice hub lists exercises', ((practice as { exercises: unknown[] }).exercises ?? []).length > 0, practice);

  /* ------------------------------- Lab flow ------------------------------ */
  const labDetail = await call('GET', '/labs/port-discovery');
  check('lab detail hides flag value', !JSON.stringify(labDetail).includes('p0rt_sc4nn1ng_101'));
  check('lab has hints', (labDetail as { hintsTotal: number }).hintsTotal >= 3);

  await call('POST', '/labs/port-discovery/start');

  const wrong = await call('POST', '/labs/port-discovery/submit-flag', { flag: 'SURAKSHA{wrong}' });
  check('wrong flag rejected', (wrong as { correct: boolean }).correct === false);

  const hint0 = await call('POST', '/labs/port-discovery/hints/0/reveal');
  check('hint 1 reveals', typeof (hint0 as { content: string }).content === 'string');
  const hint2 = await call('POST', '/labs/port-discovery/hints/2/reveal', undefined, 400);
  check('hint order enforced', (hint2 as { error?: { code: string } }) !== null);

  const right = await call('POST', '/labs/port-discovery/submit-flag', { flag: 'SURAKSHA{p0rt_sc4nn1ng_101}' });
  const rr = right as unknown as { correct: boolean; xpAwarded: number; percentile: number | null; newAchievements: unknown[]; firstAttemptSolve: boolean };
  check('correct flag accepted', rr.correct === true);
  check('XP awarded for solve', rr.xpAwarded >= 150, rr);
  check('first-attempt solve detected', rr.firstAttemptSolve === false); // we submitted a wrong flag first
  check('achievement unlocked', rr.newAchievements.length > 0, rr.newAchievements);

  const resubmit = await call('POST', '/labs/port-discovery/submit-flag', { flag: 'SURAKSHA{p0rt_sc4nn1ng_101}' });
  check('re-submit is idempotent', (resubmit as { alreadySolved: boolean }).alreadySolved === true && (resubmit as { xpAwarded: number }).xpAwarded === 0);

  const dash = await call('GET', '/dashboard');
  const dashData = dash as { stats: { labsSolved: number; lessonsCompleted: number }; xp: { xp: number } };
  check('dashboard reflects solve', dashData.stats.labsSolved === 1);
  check('dashboard xp includes lesson + lab', dashData.xp.xp >= firstXp + 150, dashData.xp);

  /* ----------------------------- Download -------------------------------- */
  const dl = await fetch(`${BASE}/labs/port-discovery/download`, { headers: { Cookie: cookie } });
  check('lab download authorized', dl.status === 200 && dl.headers.get('content-type') === 'application/zip');
  const buf = await dl.arrayBuffer();
  check('lab download is a zip', buf.byteLength > 1000 && new Uint8Array(buf)[0] === 0x50);

  /* ---------------------------- Leaderboard ------------------------------ */
  const lb = await call('GET', '/leaderboard');
  check('leaderboard has entries', ((lb as { entries: unknown[] }).entries ?? []).length > 0);

  /* ------------------------------ Profile -------------------------------- */
  const myUsername = (me as { user: { username: string } }).user.username;
  const profile = await call('GET', `/profiles/${myUsername}`);
  check('profile renders', (profile as { user: { username: string } }).user.username === myUsername);

  /* --------------------------- Notifications ----------------------------- */
  const notifs = await call('GET', '/me/notifications');
  check('notifications generated', ((notifs as { notifications: unknown[] }).notifications ?? []).length > 0, notifs);

  /* ------------------------------ Security ------------------------------- */
  const adminAttempt = await call('GET', '/admin/stats', undefined, 403);
  check('learner blocked from admin', (adminAttempt as { error?: { code: string } }).error?.code === 'FORBIDDEN');

  const anonAttempt = await fetch(`${BASE}/me/dashboard`);
  check('anonymous blocked from dashboard API', anonAttempt.status === 401);

  /* ------------------------------- Admin --------------------------------- */
  cookie = '';
  await call('POST', '/auth/login', { email: 'admin@suraksha.local', password: 'SurakshaAdmin1' });
  const stats = await call('GET', '/admin/stats');
  check('admin stats load', (stats as { users: { total: number } }).users.total > 0);

  const audit = await call('GET', '/admin/audit');
  check('audit log populated', ((audit as { entries: unknown[] }).entries ?? []).length > 0);

  const adminLabs = await call('GET', '/admin/labs');
  check('admin lab list loads', ((adminLabs as { labs: unknown[] }).labs ?? []).length >= 4);

  cookie = '';
  await call('POST', '/auth/login', { email: 'editor@suraksha.local', password: 'SurakshaEditor1' });
  // Editors may not publish — server must reject with 403 (existence not leaked).
  const editorPublish = await call('POST', '/admin/content/lessons/00000000-0000-0000-0000-000000000000/status', { status: 'published' }, 403);
  check('editor cannot publish', (editorPublish as { error?: { code: string } }).error?.code === 'FORBIDDEN');

  console.log(`\n=== ${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECKS FAILED'} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
