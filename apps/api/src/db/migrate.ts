/**
 * Migration runner — applies pending SQL migrations from ./drizzle in order.
 * Uses drizzle's migrations table for idempotency. Safe to run repeatedly.
 */
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './client';
import postgres from 'postgres';
import { env } from '../config/env';

async function run() {
  console.info('[db] applying migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.info('[db] migrations complete.');
  const raw = postgres(env.DATABASE_URL, { max: 1 });
  await raw.end();
}

run().catch((err) => {
  console.error('[db] migration failed:', err);
  process.exit(1);
});
