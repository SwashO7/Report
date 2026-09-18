/**
 * Test environment defaults, preloaded before any test file (see bunfig.toml).
 *
 * WHY THIS EXISTS: config/env.ts validates the whole environment at import time
 * and throws when anything required is missing. That is the right behaviour for a
 * server - fail fast rather than boot half-configured - but it meant `bun test`
 * could only run on a machine with a full .env, so the unit suite failed in CI
 * and on a fresh clone.
 *
 * These are obviously-fake values, set with ??= so a real local .env or a CI
 * secret always wins. Nothing here is a credential.
 */

process.env.NODE_ENV ??= 'test';

// Pure-unit tests never open a connection; postgres-js connects lazily, so a
// syntactically valid URL is enough to get past validation. Integration tests
// that do talk to a database override this with a real one.
process.env.DATABASE_URL ??= 'postgres://suraksha:suraksha@127.0.0.1:5432/suraksha_test';

process.env.SESSION_SECRET ??= 'test-only-session-secret-not-used-in-any-real-environment';
process.env.FLAG_HMAC_SECRET ??= 'test-only-flag-hmac-secret-not-used-in-any-real-environment';

process.env.APP_URL ??= 'http://localhost:5173';
process.env.API_URL ??= 'http://localhost:3000';

// Keep the test run from attempting real network sends.
process.env.MAIL_TRANSPORT ??= 'console';
