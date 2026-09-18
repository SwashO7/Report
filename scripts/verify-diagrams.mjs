/**
 * End-to-end check of the diagram system against a running stack.
 *
 *   node scripts/verify-diagrams.mjs [baseUrl]
 *
 * Exercises the public image route and the full admin CRUD loop, so "an editor
 * can add and change diagrams from the admin page" is a verified claim rather
 * than an assumption. Cleans up after itself.
 */
const BASE = process.argv[2] ?? 'http://localhost';
const results = [];
let failed = 0;

function check(name, ok, detail = '') {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
  return ok;
}

/* The session cookie is Secure; browsers resend it on localhost but plain HTTP
   clients will not, so capture it and set the header explicitly. */
async function login(email, password) {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email, password }),
  });
  const raw = res.headers.getSetCookie?.() ?? [];
  const cookie = raw.map((c) => c.split(';')[0]).join('; ');
  return { ok: res.ok, cookie, status: res.status };
}

const authed = (cookie, extra = {}) => ({ Cookie: cookie, Origin: BASE, ...extra });

const TEST_SLUG = 'zz-verify-temp-diagram';
const TEST_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect width="100" height="40" fill="#1b1e19"/><text x="50" y="24" text-anchor="middle" fill="#43bd97" font-size="10">verify</text></svg>';

const run = async () => {
  /* 1. Public image delivery, no auth. */
  const img = await fetch(`${BASE}/api/v1/diagrams/tcp-handshake`);
  const body = await img.text();
  check('public GET /diagrams/tcp-handshake', img.ok, `${img.status} ${img.headers.get('content-type')}`);
  check('served body is SVG', body.includes('<svg'), `${body.length} bytes`);
  check('has ETag for revalidation', Boolean(img.headers.get('etag')));

  /* 2. Extension form is accepted too. */
  const withExt = await fetch(`${BASE}/api/v1/diagrams/tcp-handshake.svg`);
  check('.svg extension form works', withExt.ok, String(withExt.status));

  /* 3. Unknown slug is a clean 404. */
  const missing = await fetch(`${BASE}/api/v1/diagrams/definitely-not-real`);
  check('unknown diagram returns 404', missing.status === 404, String(missing.status));

  /* 4. Admin surface requires auth. */
  const anon = await fetch(`${BASE}/api/v1/admin/diagrams`);
  check('admin list rejects anonymous', anon.status === 401 || anon.status === 403, String(anon.status));

  /* 5. Learner must not reach the editor surface. */
  const learner = await login('learner@suraksha.local', 'SurakshaLearner1');
  if (learner.ok) {
    const asLearner = await fetch(`${BASE}/api/v1/admin/diagrams`, { headers: authed(learner.cookie) });
    check('admin list rejects a learner', asLearner.status === 403, String(asLearner.status));
  } else {
    check('learner login', false, `status ${learner.status}`);
  }

  /* 6. Content editor CRUD loop. */
  const editor = await login('editor@suraksha.local', 'SurakshaEditor1');
  if (!check('content editor login', editor.ok, `status ${editor.status}`)) return;

  const list = await fetch(`${BASE}/api/v1/admin/diagrams`, { headers: authed(editor.cookie) });
  const listJson = await list.json().catch(() => null);
  check('editor lists diagrams', list.ok && Array.isArray(listJson?.diagrams), `${listJson?.diagrams?.length ?? 0} diagrams`);
  check('list entries carry an embeddable url', listJson?.diagrams?.[0]?.url?.startsWith('/api/v1/diagrams/') === true);

  const created = await fetch(`${BASE}/api/v1/admin/diagrams`, {
    method: 'POST',
    headers: authed(editor.cookie, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ slug: TEST_SLUG, title: 'Verify temp', category: 'verify', mimeType: 'image/svg+xml', content: TEST_SVG }),
  });
  check('editor creates a diagram', created.status === 201, String(created.status));

  const fetchedNew = await fetch(`${BASE}/api/v1/diagrams/${TEST_SLUG}`);
  const newBody = await fetchedNew.text();
  check('new diagram is served immediately', fetchedNew.ok && newBody.includes('verify'));

  const updated = await fetch(`${BASE}/api/v1/admin/diagrams/${TEST_SLUG}`, {
    method: 'PATCH',
    headers: authed(editor.cookie, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title: 'Verify temp edited', content: TEST_SVG.replace('verify', 'edited') }),
  });
  check('editor edits a diagram', updated.ok, String(updated.status));
  const afterEdit = await (await fetch(`${BASE}/api/v1/diagrams/${TEST_SLUG}`)).text();
  check('edit is live with no deploy', afterEdit.includes('edited'));

  /* 7. Active content is stripped, not stored. */
  const nasty = await fetch(`${BASE}/api/v1/admin/diagrams/${TEST_SLUG}`, {
    method: 'PATCH',
    headers: authed(editor.cookie, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      content: '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><rect width="10" height="10"/></svg>',
    }),
  });
  const stored = await (await fetch(`${BASE}/api/v1/diagrams/${TEST_SLUG}`)).text();
  check('svg upload accepted after sanitising', nasty.ok, String(nasty.status));
  check('script tag stripped', !stored.includes('<script'), stored.slice(0, 80));
  check('onload handler stripped', !/onload/i.test(stored));

  /* 8. A non-SVG payload is rejected outright. */
  const notSvg = await fetch(`${BASE}/api/v1/admin/diagrams`, {
    method: 'POST',
    headers: authed(editor.cookie, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ slug: 'zz-not-svg', title: 'Not svg', mimeType: 'image/svg+xml', content: 'just some text' }),
  });
  check('non-SVG content rejected', notSvg.status === 400, String(notSvg.status));

  /* 9. Cleanup. */
  const del = await fetch(`${BASE}/api/v1/admin/diagrams/${TEST_SLUG}`, { method: 'DELETE', headers: authed(editor.cookie) });
  check('editor deletes a diagram', del.ok, String(del.status));
  const gone = await fetch(`${BASE}/api/v1/diagrams/${TEST_SLUG}`);
  check('deleted diagram 404s', gone.status === 404, String(gone.status));

  /* 10. Lessons actually carry diagrams and importance from the DB. */
  const lesson = await fetch(`${BASE}/api/v1/learn/lessons/tcp-and-udp`, { headers: authed(editor.cookie) });
  const lessonJson = await lesson.json().catch(() => null);
  const blocks = lessonJson?.lesson?.blocks ?? lessonJson?.blocks ?? [];
  const images = blocks.filter((b) => b.type === 'image');
  check('lesson served from DB', lesson.ok, String(lesson.status));
  check('lesson carries diagram image blocks', images.length > 0, `${images.length} image block(s)`);
  check(
    'image blocks point at the DB endpoint',
    images.every((b) => String(b.src).startsWith('/api/v1/diagrams/')),
    images.map((b) => b.src).join(', '),
  );
  const imp = lessonJson?.lesson?.importance ?? lessonJson?.importance;
  // Three tiers exist: essential ("Must know"), core (unbadged), optional. This
  // assertion originally predated the `essential` tier and failed once a lesson
  // was promoted into it - accept any valid tier, and reject only a missing or
  // unrecognised one.
  check(
    'lesson exposes importance tag',
    imp === 'essential' || imp === 'core' || imp === 'optional',
    String(imp),
  );
};

await run().catch((e) => {
  check('script completed', false, e instanceof Error ? e.message : String(e));
});

console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed > 0 ? 1 : 0);
