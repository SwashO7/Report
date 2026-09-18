/**
 * End-to-end check of the admin path/module management fixes.
 *
 *   node scripts/verify-admin-content.mjs [baseUrl]
 *
 * Covers the three reported bugs: modules reported as absent for a path that has
 * them, the publish toggle silently doing nothing, and no way to edit or delete
 * a path. Creates a scratch path, exercises everything on it, then deletes it.
 */
const BASE = process.argv[2] ?? 'http://localhost';
const results = [];
let failed = 0;

function check(name, ok, detail = '') {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failed++;
  return ok;
}

async function login(email, password) {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email, password }),
  });
  const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  return { ok: res.ok, cookie, status: res.status };
}

const SLUG = 'zz-verify-temp-path';

const run = async () => {
  const editor = await login('editor@suraksha.local', 'SurakshaEditor1');
  if (!check('content editor login', editor.ok, `status ${editor.status}`)) return;
  const h = (extra = {}) => ({ Cookie: editor.cookie, Origin: BASE, ...extra });
  const json = (extra = {}) => h({ 'Content-Type': 'application/json', ...extra });

  /* 1. The modules endpoint that never existed. */
  const paths = await (await fetch(`${BASE}/api/v1/admin/content/paths`, { headers: h() })).json();
  const seeded = (paths.paths ?? []).find((p) => p.moduleCount > 0);
  check('a seeded path reports modules', Boolean(seeded), seeded ? `${seeded.slug} has ${seeded.moduleCount}` : 'none found');

  if (seeded) {
    const res = await fetch(`${BASE}/api/v1/admin/content/modules?pathId=${seeded.id}`, { headers: h() });
    const body = await res.json().catch(() => null);
    check('GET /admin/content/modules exists', res.ok, `status ${res.status}`);
    check(
      'it returns the modules the path actually has',
      Array.isArray(body?.modules) && body.modules.length === seeded.moduleCount,
      `${body?.modules?.length ?? 0} of ${seeded.moduleCount}`,
    );
    check('modules carry lesson counts', typeof body?.modules?.[0]?.lessonCount === 'number');
  }

  /* 2. Create a scratch path to exercise edit / publish / delete. */
  const created = await fetch(`${BASE}/api/v1/admin/content/paths`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify({ name: 'Verify Temp Path', slug: SLUG, levelNumber: 42, description: 'temp' }),
  });
  const createdBody = await created.json().catch(() => null);
  if (!check('editor creates a path', created.status === 201, `status ${created.status}`)) return;
  const id = createdBody.path.id;
  check('a new path starts unpublished', createdBody.path.published === false, String(createdBody.path.published));

  /* 3. The publish toggle - the bug was that `published` got stripped. */
  const pub = await fetch(`${BASE}/api/v1/admin/content/paths/${id}`, {
    method: 'PATCH',
    headers: json(),
    body: JSON.stringify({ published: true }),
  });
  const pubBody = await pub.json().catch(() => null);
  check('PATCH published returns ok', pub.ok, `status ${pub.status}`);
  check('the response says published', pubBody?.path?.published === true, String(pubBody?.path?.published));

  const after = await (await fetch(`${BASE}/api/v1/admin/content/paths`, { headers: h() })).json();
  const reread = (after.paths ?? []).find((p) => p.id === id);
  check('publish PERSISTED (the reported bug)', reread?.published === true, `published=${reread?.published}`);

  /* 4. Editing the other fields. */
  const edit = await fetch(`${BASE}/api/v1/admin/content/paths/${id}`, {
    method: 'PATCH',
    headers: json(),
    body: JSON.stringify({ name: 'Verify Renamed', description: 'edited description', levelNumber: 7, icon: 'shield' }),
  });
  const editBody = await edit.json().catch(() => null);
  check('editor renames a path', edit.ok && editBody?.path?.name === 'Verify Renamed', editBody?.path?.name);
  check('description and level are editable', editBody?.path?.description === 'edited description' && editBody?.path?.levelNumber === 7);

  /* 5. Unpublish works too (not just publish). */
  const unpub = await fetch(`${BASE}/api/v1/admin/content/paths/${id}`, {
    method: 'PATCH',
    headers: json(),
    body: JSON.stringify({ published: false }),
  });
  const unpubBody = await unpub.json().catch(() => null);
  check('unpublish works', unpubBody?.path?.published === false, String(unpubBody?.path?.published));

  /* 6. Slug stays immutable. */
  const slugTry = await fetch(`${BASE}/api/v1/admin/content/paths/${id}`, {
    method: 'PATCH',
    headers: json(),
    body: JSON.stringify({ slug: 'hacked-slug' }),
  });
  const slugBody = await slugTry.json().catch(() => null);
  check('slug cannot be changed', slugBody?.path?.slug === SLUG, slugBody?.path?.slug);

  /* 7. A module under it, then the delete guard. */
  const mod = await fetch(`${BASE}/api/v1/admin/content/modules`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify({ pathId: id, title: 'Verify Module', slug: 'verify-module', description: 'temp' }),
  });
  const modBody = await mod.json().catch(() => null);
  check('editor creates a module', mod.status === 201, `status ${mod.status}`);

  if (modBody?.module?.id) {
    const delMod = await fetch(`${BASE}/api/v1/admin/content/modules/${modBody.module.id}`, {
      method: 'DELETE',
      headers: h(),
    });
    check('empty module deletes without force', delMod.ok, `status ${delMod.status}`);
  }

  /* 8. Delete the path. */
  const del = await fetch(`${BASE}/api/v1/admin/content/paths/${id}`, { method: 'DELETE', headers: h() });
  check('editor deletes an empty path', del.ok, `status ${del.status}`);

  const final = await (await fetch(`${BASE}/api/v1/admin/content/paths`, { headers: h() })).json();
  check('deleted path is gone', !(final.paths ?? []).some((p) => p.id === id));

  /* 9. A path holding lessons refuses deletion without force. */
  if (seeded) {
    const guard = await fetch(`${BASE}/api/v1/admin/content/paths/${seeded.id}`, { method: 'DELETE', headers: h() });
    check('path with lessons refuses delete without force', guard.status === 409, `status ${guard.status}`);
    const stillThere = await (await fetch(`${BASE}/api/v1/admin/content/paths`, { headers: h() })).json();
    check('that path is untouched', (stillThere.paths ?? []).some((p) => p.id === seeded.id));
  }

  /* 10. A learner cannot reach any of it. */
  const learner = await login('learner@suraksha.local', 'SurakshaLearner1');
  if (learner.ok) {
    const res = await fetch(`${BASE}/api/v1/admin/content/paths`, { headers: { Cookie: learner.cookie, Origin: BASE } });
    check('learner is refused', res.status === 403, `status ${res.status}`);
  }
};

await run().catch((e) => check('script completed', false, e instanceof Error ? e.message : String(e)));

console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed > 0 ? 1 : 0);
