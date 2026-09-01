#!/usr/bin/env node
/**
 * Seeds the database only if it's empty (checks the `levels` table, which the
 * seed always populates first). Safe to run on every `bun run up` — a
 * populated database is left untouched. Runs the seed script inside the
 * running `api` container so it shares the container's DATABASE_URL.
 */
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(args) {
  return spawnSync('docker', args, { cwd: repoRoot, encoding: 'utf8', shell: false });
}

function main() {
  const check = run([
    'compose', '-f', 'docker-compose.prod.yml', 'exec', '-T', 'api',
    'bun', '-e',
    "import('./src/db/client.ts').then(async ({ db }) => { const { sql } = await import('drizzle-orm'); const r = await db.execute(sql`SELECT count(*)::int AS n FROM levels`); process.exit(Number(r[0]?.n ?? 0) > 0 ? 0 : 1); }).catch(() => process.exit(1))",
  ]);

  if (check.status === 0) {
    console.log('[seed] Database already has data — skipping seed.');
    return;
  }

  console.log('[seed] Empty database detected — seeding curriculum, labs, and achievements...');
  console.warn('[seed] NOTE: this also creates demo accounts with published default passwords');
  console.warn('[seed] (see README). Fine for local/dev. On a real internet-facing server, sign up');
  console.warn('[seed] your own account instead and skip/remove the demo users before going live.');
  const seed = spawnSync(
    'docker',
    ['compose', '-f', 'docker-compose.prod.yml', 'exec', '-T', 'api', 'bun', 'src/db/seed/index.ts'],
    { cwd: repoRoot, stdio: 'inherit', shell: false },
  );
  process.exit(seed.status ?? 0);
}

main();
