import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '../config/env';

/**
 * Postgres connection pool.
 *
 * `max` is PER PROCESS, and on Cloud Run every instance is its own process, so
 * the real ceiling is `max * maxInstances`. Cloud SQL enforces a hard
 * `max_connections` (roughly 25 on db-f1-micro, 100 on db-g1-small), and
 * exceeding it fails requests with "too many clients" rather than queueing.
 *
 * Keep this product under the instance limit:
 *     DB_POOL_MAX * Cloud Run max-instances  <  Cloud SQL max_connections - 5
 *
 * The default of 5 leaves room for 10 Cloud Run instances plus migrations and
 * an admin psql session. Raise it only after raising the Cloud SQL tier.
 */
const client = postgres(env.DATABASE_URL, {
  max: env.DB_POOL_MAX,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;
export { schema };
