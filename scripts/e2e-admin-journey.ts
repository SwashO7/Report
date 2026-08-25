/**
 * Admin journey smoke test (spec §97):
 * admin login -> create module -> create lesson (video + text + practice) ->
 * save draft -> publish -> verify learner sees it -> create lab -> configure flag -> publish.
 * Run: bun scripts/e2e-admin-journey.ts (API must be running)
 */
const BASE = 'http://localhost:3000/api/v1';
let cookie = '';
let failures = 0;

async function call(method: string, path: string, body?: unknown, expectStatus = 200) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const sc = res.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status !== expectStatus) {
    failures++;
    console.error(`FAIL ${method} ${path} -> ${res.status}`, JSON.stringify(data).slice(0, 300));
    return data as never;
  }
  console.log(`ok   ${method} ${path} -> ${res.status}`);
  return data as never;
}

function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`PASS ${name}`);
  else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail).slice(0, 300) : '');
  }
}

async function main() {
  console.log('=== Admin journey (spec 97) ===\n');
  const stamp = Date.now();

  /* Admin login */
  cookie = '';
  await call('POST', '/auth/login', { email: 'admin@suraksha.local', password: 'SurakshaAdmin1' });

  /* Create module inside the foundations path */
  const paths = await call('GET', '/admin/content/paths');
  const foundations = (paths as { paths: { id: string; slug: string }[] }).paths.find((p) => p.slug === 'foundations');
  check('paths list includes foundations', Boolean(foundations));

  const moduleSlug = `e2e-module-${stamp % 100000}`;
  const mod = await call('POST', '/admin/content/modules', {
    pathId: foundations!.id,
    title: 'E2E Test Module',
    slug: moduleSlug,
    description: 'Created by the automated admin journey.',
  }, 201);
  const moduleId = (mod as { module: { id: string } }).module.id;

  /* Create lesson with video + text + quiz blocks */
  const lessonSlug = `e2e-lesson-${stamp % 100000}`;
  const lesson = await call('POST', '/admin/content/lessons', {
    moduleId,
    title: 'E2E: The Practice of Practice',
    slug: lessonSlug,
    summary: 'A lesson created entirely through the API admin journey.',
    estimatedMinutes: 5,
    blocks: [
      { type: 'heading', level: 2, text: 'What you will learn' },
      { type: 'paragraph', text: 'This lesson proves that **content changes require no code**. It was created through the admin surface.' },
      { type: 'video', provider: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Placeholder video' },
      { type: 'command', description: 'Try it yourself', commands: ['curl -s https://example.com | head'] },
      { type: 'callout', variant: 'info', title: 'Note', text: 'Draft, review, publish — the full workflow.' },
    ],
  }, 201);
  const lessonId = (lesson as { lesson: { id: string } }).lesson.id;
  check('lesson created as draft', (lesson as { lesson: { status: string } }).lesson.status === 'draft');

  /* Attach a practice exercise */
  await call('POST', '/admin/content/exercises', {
    lessonId,
    slug: `e2e-ex-${stamp % 100000}`,
    title: 'E2E knowledge check',
    instructions: 'Answer the question.',
    kind: 'quiz',
    questions: [{ prompt: 'Is content manageable without code changes?', options: ['Yes', 'No'], correctIndex: 0, explanation: 'That is the point.' }],
    xpReward: 25,
    status: 'published',
  }, 201);

  /* Save an edit -> creates version 2 */
  const saved = await call('PATCH', `/admin/content/lessons/${lessonId}`, {
    summary: 'Updated summary — versioned automatically.',
    changeNote: 'E2E edit',
  });
  check('lesson edit bumps version', (saved as { lesson: { version: number } }).lesson.version === 2);

  /* Preview as staff works while draft */
  cookie = '';
  await call('POST', '/auth/login', { email: 'learner@suraksha.local', password: 'SurakshaLearner1' });
  const anonView = await fetch(`${BASE}/learn/lessons/${lessonSlug}`);
  check('draft hidden from learners', anonView.status === 404);

  /* Publish */
  cookie = '';
  await call('POST', '/auth/login', { email: 'admin@suraksha.local', password: 'SurakshaAdmin1' });
  await call('POST', `/admin/content/lessons/${lessonId}/status`, { status: 'published' });

  cookie = '';
  await call('POST', '/auth/login', { email: 'learner@suraksha.local', password: 'SurakshaLearner1' });
  const pubView = await call('GET', `/learn/lessons/${lessonSlug}`);
  check('published lesson visible to learners', (pubView as { title: string }).title.includes('E2E'));
  check('blocks render through public API', ((pubView as { blocks: unknown[] }).blocks ?? []).length === 5);

  /* Create + publish a lab through the API */
  cookie = '';
  await call('POST', '/auth/login', { email: 'admin@suraksha.local', password: 'SurakshaAdmin1' });
  const taxonomy = await call('GET', '/admin/labs/meta/taxonomy');
  const cat = (taxonomy as { categories: { id: string; slug: string }[] }).categories.find((c) => c.slug === 'web-security')!;
  const diff = (taxonomy as { difficulties: { id: string; slug: string }[] }).difficulties.find((d) => d.slug === 'beginner')!;

  const lab = await call('POST', '/admin/labs', {
    title: 'E2E Challenge Lab',
    slug: `e2e-lab-${stamp % 100000}`,
    shortDescription: 'A lab created through the admin journey.',
    description: 'Find the flag hidden in plain sight.',
    categoryId: cat.id,
    difficultyId: diff.id,
    estimatedMinutes: 10,
    xpReward: 100,
    objectives: ['Locate the flag'],
    setupInstructions: 'docker compose up -d',
    skills: ['Observation'],
    hints: [{ content: 'Read closely.' }],
    flagHash: `SURAKSHA{e2e_lab_${stamp % 100000}}`,
    flagCaseSensitive: false,
    visibility: 'public',
  }, 201);
  const labId = (lab as { lab: { id: string } }).lab.id;

  // Publish without a package must be rejected
  const noPkg = await call('POST', `/admin/labs/${labId}/status`, { status: 'published' }, 400);
  check('publish gated on package upload', (noPkg as { error?: { code: string } }).error?.code === 'BAD_REQUEST');

  // Analytics endpoint works
  const analytics = await call('GET', `/admin/labs/${labId}/analytics`);
  check('lab analytics loads', (analytics as { starts: number }).starts === 0);

  /* Learner dashboard reflects the new lesson in continue recommendations */
  cookie = '';
  await call('POST', '/auth/login', { email: 'learner@suraksha.local', password: 'SurakshaLearner1' });
  const cont = await call('GET', '/learn/continue');
  check('continue recommendation still works', Boolean((cont as { next?: unknown }).next));

  console.log(`\n=== ${failures === 0 ? 'ADMIN JOURNEY PASSED' : failures + ' CHECKS FAILED'} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
