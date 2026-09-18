/**
 * Rate limiting verification.
 *
 *   node scripts/verify-rate-limits.mjs [baseUrl]
 *
 * Checks that every budgeted surface actually returns 429, that the response
 * carries Retry-After, and - the important one - that the limit cannot be
 * bypassed by forging X-Forwarded-For.
 *
 * Run it against a stack whose limiter has been reset (restart the API) because
 * buckets are in-memory and a previous run leaves them partly consumed.
 */
const BASE = process.argv[2] ?? 'http://localhost';
const results = [];
let failed = 0;

function check(name, ok, detail = '') {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failed++;
  return ok;
}

/** Fires `n` sequential requests, returns the status codes seen. */
async function burst(n, makeRequest) {
  const codes = [];
  for (let i = 0; i < n; i++) {
    const res = await makeRequest(i);
    codes.push(res.status);
    if (res.status === 429) {
      return { codes, limited: true, retryAfter: res.headers.get('retry-after') };
    }
  }
  return { codes, limited: false, retryAfter: null };
}

const post = (path, body, headers = {}) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE, ...headers },
    body: JSON.stringify(body),
  });

const run = async () => {
  /* Sessions FIRST. The IP bursts below deliberately exhaust the login budget,
     so authenticating afterwards would just collect a 429 and report a false
     failure - which is exactly what an earlier version of this script did. */
  const loginAs = async (email, password) => {
    const res = await fetch(`${BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE },
      body: JSON.stringify({ email, password }),
    });
    return {
      ok: res.ok,
      status: res.status,
      cookie: (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; '),
    };
  };
  const learner = await loginAs('learner@suraksha.local', 'SurakshaLearner1');
  const editor = await loginAs('editor@suraksha.local', 'SurakshaEditor1');
  check('learner session obtained', learner.ok, `status ${learner.status}`);
  check('editor session obtained', editor.ok, `status ${editor.status}`);

  /* Admin READS must stay unthrottled, checked BEFORE the bursts below.
     The sitewide ceiling is per-IP and this whole script runs from one address,
     so running this check afterwards would measure the global limit rather than
     the admin read path - which is what an earlier version wrongly reported as a
     failure. Since forging X-Forwarded-For no longer works (by design), the only
     way to test this honestly is to test it first. */
  if (editor.ok) {
    const reads = await burst(40, () =>
      fetch(`${BASE}/api/v1/admin/content/paths`, { headers: { Cookie: editor.cookie, Origin: BASE } }),
    );
    check('admin READS are not limited', !reads.limited, reads.limited ? 'reads got limited - dashboard would break' : '40 reads fine');
  }

  /* 1. Login is budgeted at 15/min per IP. */
  const login = await burst(25, () => post('/api/v1/auth/login', { email: 'nobody@example.com', password: 'wrong-password' }));
  check('login endpoint rate limits', login.limited, login.limited ? `429 after ${login.codes.length} requests` : `no 429 in 25 requests`);
  check('429 carries Retry-After', Boolean(login.retryAfter), `Retry-After: ${login.retryAfter}`);

  /* 2. Signup is budgeted at 10/min per IP. */
  const signup = await burst(20, (i) =>
    post('/api/v1/auth/signup', { name: 'T', username: `zzrl${Date.now()}${i}`, email: `zzrl${Date.now()}${i}@example.com`, password: 'Abcdef123!' }),
  );
  check('signup endpoint rate limits', signup.limited, signup.limited ? `429 after ${signup.codes.length}` : 'no 429 in 20 requests');

  /* 3. Password reset is budgeted at 5 per 10 min. */
  const forgot = await burst(12, () => post('/api/v1/auth/forgot-password', { email: 'nobody@example.com' }));
  check('forgot-password rate limits', forgot.limited, forgot.limited ? `429 after ${forgot.codes.length}` : 'no 429 in 12 requests');

  /* 4. THE BYPASS. A forged X-Forwarded-For must NOT earn a fresh budget.
   *    Reading the leftmost XFF value makes every request look like a new
   *    client, which defeats every limit above. */
  const spoofed = await burst(40, (i) =>
    post('/api/v1/auth/login', { email: 'nobody@example.com', password: 'wrong-password' }, { 'X-Forwarded-For': `203.0.113.${i % 250}` }),
  );
  check(
    'forged X-Forwarded-For cannot bypass the limit',
    spoofed.limited,
    spoofed.limited
      ? `still limited after ${spoofed.codes.length}`
      : 'BYPASSED - 40 requests with rotating X-Forwarded-For all accepted',
  );

  /* 5. Unauthenticated endpoints that write a row. */
  const view = await burst(150, () => post('/api/v1/learn/lessons/tcp-and-udp/view', {}));
  check('lesson view counter rate limits', view.limited, view.limited ? `429 after ${view.codes.length}` : 'no 429 in 150 requests');

  /* 6. Authenticated surfaces, using the session captured before the bursts. */
  if (learner.ok) {
    const cookie = learner.cookie;

    const flag = await burst(30, () =>
      fetch(`${BASE}/api/v1/labs/port-discovery/submit-flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: BASE, Cookie: cookie },
        body: JSON.stringify({ flag: 'SURAKSHA{wrong}' }),
      }),
    );
    check('flag submission rate limits', flag.limited, flag.limited ? `429 after ${flag.codes.length}` : 'no 429 in 30 requests');

    const dl = await burst(20, () =>
      fetch(`${BASE}/api/v1/labs/port-discovery/download`, { headers: { Cookie: cookie, Origin: BASE } }),
    );
    check('lab download rate limits', dl.limited, dl.limited ? `429 after ${dl.codes.length}` : 'no 429 in 20 requests');

    const quiz = await burst(40, () =>
      fetch(`${BASE}/api/v1/learn/exercises/network-basics-quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: BASE, Cookie: cookie },
        body: JSON.stringify({ answers: [0] }),
      }),
    );
    check('quiz submission rate limits', quiz.limited, quiz.limited ? `429 after ${quiz.codes.length}` : 'no 429 in 40 requests');
  } else {
    check('authed checks skipped', false, 'no learner session - see above');
  }

  /* 7. Admin writes. */
  if (editor.ok) {
    const cookie = editor.cookie;
    const writes = await burst(160, () =>
      fetch(`${BASE}/api/v1/admin/content/paths/00000000-0000-0000-0000-000000000000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Origin: BASE, Cookie: cookie },
        body: JSON.stringify({ name: 'rate limit probe' }),
      }),
    );
    check('admin writes rate limit', writes.limited, writes.limited ? `429 after ${writes.codes.length}` : 'no 429 in 160 requests');
  } else {
    check('admin checks skipped', false, 'no editor session - see above');
  }
};

await run().catch((e) => check('script completed', false, e instanceof Error ? e.message : String(e)));

console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed > 0 ? 1 : 0);
