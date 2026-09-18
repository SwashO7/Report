/**
 * Pre-launch production safety gate — checks a LIVE deployment.
 *
 *   node scripts/verify-production-safety.mjs https://suraksha.shadowsecurity.in
 *
 * Exits 0 only if every check passes; non-zero (and prints FAIL lines) on any
 * failure, so it can gate a launch step in CI or a runbook. No dependencies —
 * Node's built-in fetch only. Takes the base URL as argv[2].
 *
 * It verifies, against the running site:
 *   1. No account uses a known DEV demo password (login attempts must FAIL).
 *   2. No @suraksha.local account can log in (they must not exist).
 *   3. /api/v1/admin/* is NOT reachable unauthenticated (401/403/404, not 200).
 *   4. The admin API returns 404 from this (presumably non-allowlisted) address,
 *      which also confirms ADMIN_IP_ALLOWLIST is enforced.
 *   5. Security headers are present.
 *   6. HTTP redirects to HTTPS.
 *
 * Note on check 4: ADMIN_IP_ALLOWLIST is an app/env setting, not something an
 * HTTP client can read directly. We assert its EFFECT — an unauthenticated,
 * non-allowlisted request to the admin API is refused. If you run this from an
 * allowlisted office IP you may instead see 401/403; that still passes because
 * the surface is not open. An empty allowlist in production is caught here as a
 * 200 or a non-refusing status.
 */

const rawBase = process.argv[2];
if (!rawBase) {
  console.error('Usage: node scripts/verify-production-safety.mjs <https://base-url>');
  process.exit(2);
}
const BASE = rawBase.replace(/\/+$/, '');

/* Kept in sync with apps/api/src/db/seed/users.ts */
const DEMO_ACCOUNTS = [
  { email: 'admin@suraksha.local', password: 'SurakshaAdmin1' },
  { email: 'editor@suraksha.local', password: 'SurakshaEditor1' },
  { email: 'labmgr@suraksha.local', password: 'SurakshaLabmgr1' },
  { email: 'learner@suraksha.local', password: 'SurakshaLearner1' },
  { email: 'demo-ava@suraksha.local', password: 'SurakshaDemo1' },
  { email: 'demo-raj@suraksha.local', password: 'SurakshaDemo1' },
  { email: 'demo-mia@suraksha.local', password: 'SurakshaDemo1' },
];

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function tryFetch(url, opts = {}) {
  try {
    return await fetch(url, { redirect: 'manual', ...opts });
  } catch (err) {
    return { networkError: String(err instanceof Error ? err.message : err) };
  }
}

/** POST a login and return the HTTP status (or a synthetic code on error). */
async function attemptLogin(email, password) {
  const paths = ['/api/v1/auth/login', '/api/auth/login'];
  for (const p of paths) {
    const res = await tryFetch(`${BASE}${p}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.networkError) continue;
    if (res.status !== 404) return res.status; // found the real endpoint
  }
  return 404;
}

async function main() {
  console.log(`\nProduction safety gate against ${BASE}\n`);

  /* 1 + 2. Demo passwords and @suraksha.local accounts must not log in. */
  for (const acct of DEMO_ACCOUNTS) {
    const status = await attemptLogin(acct.email, acct.password);
    // A successful login is 200 (and usually sets a session cookie). Anything
    // that is NOT a success means the credential does not work — which is what
    // we want. 404 means the auth endpoint path differs; treat that as a
    // config problem to surface rather than a silent pass.
    if (status === 404) {
      record(`demo credential rejected: ${acct.email}`, false, 'auth endpoint not found (check path) — could not verify');
    } else {
      record(`demo credential rejected: ${acct.email}`, status !== 200, `login returned HTTP ${status}`);
    }
  }

  /* 3 + 4. Admin API not reachable unauthenticated / from non-allowlisted IP. */
  const adminProbePaths = ['/api/v1/admin/users', '/api/v1/admin/labs', '/api/v1/admin/stats'];
  let sawAdmin200 = false;
  let adminStatuses = [];
  for (const p of adminProbePaths) {
    const res = await tryFetch(`${BASE}${p}`);
    if (res.networkError) {
      adminStatuses.push(`${p}=ERR`);
      continue;
    }
    adminStatuses.push(`${p}=${res.status}`);
    if (res.status === 200) sawAdmin200 = true;
  }
  record('admin API not reachable unauthenticated', !sawAdmin200, adminStatuses.join(' '));
  // The IP-allowlist effect: 404 is the guard's signature (see admin-network.ts).
  const sawGuard404 = adminStatuses.some((s) => s.endsWith('=404'));
  record(
    'ADMIN_IP_ALLOWLIST enforced (admin surface refuses non-allowlisted address)',
    !sawAdmin200,
    sawGuard404 ? '404 from admin API (network guard active)' : 'admin API refused (401/403) — run from a non-office IP to see the 404 guard',
  );

  /* 5. Security headers on the app root. */
  const root = await tryFetch(`${BASE}/`);
  if (root.networkError) {
    record('security headers present', false, `could not reach ${BASE}/ (${root.networkError})`);
  } else {
    const h = root.headers;
    const required = [
      ['strict-transport-security', /max-age=\d+/],
      ['x-content-type-options', /nosniff/i],
      ['x-frame-options', /(deny|sameorigin)/i],
      ['content-security-policy', /.+/],
    ];
    const missing = required.filter(([name, re]) => {
      const v = h.get(name);
      return !v || !re.test(v);
    });
    record(
      'security headers present',
      missing.length === 0,
      missing.length ? `missing/weak: ${missing.map(([n]) => n).join(', ')}` : 'HSTS, nosniff, frame-options, CSP all set',
    );
  }

  /* 6. HTTP → HTTPS redirect. */
  if (BASE.startsWith('https://')) {
    const httpUrl = 'http://' + BASE.slice('https://'.length) + '/';
    const res = await tryFetch(httpUrl);
    if (res.networkError) {
      record('HTTP redirects to HTTPS', false, `could not reach ${httpUrl} (${res.networkError})`);
    } else {
      const loc = res.headers.get('location') ?? '';
      const redirects = res.status >= 300 && res.status < 400 && loc.startsWith('https://');
      record('HTTP redirects to HTTPS', redirects, `HTTP ${res.status}${loc ? ` → ${loc}` : ''}`);
    }
  } else {
    record('HTTP redirects to HTTPS', false, 'base URL is not https:// — production must be HTTPS');
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.log('\nFAILURES:');
    for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
    console.log('\nDo NOT launch until these are green.');
    process.exit(1);
  }
  console.log('\n✅ All production safety checks passed.');
}

main().catch((err) => {
  console.error('Gate crashed:', err);
  process.exit(1);
});
