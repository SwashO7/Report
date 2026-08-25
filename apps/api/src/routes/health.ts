import { Hono } from 'hono';

export const healthRoutes = new Hono()
  .get('/', (c) =>
    c.json({
      status: 'ok',
      service: 'suraksha-labs-api',
      time: new Date().toISOString(),
    }),
  )
  .get('/ready', async (c) => {
    try {
      const { db } = await import('../db/client');
      const { sql } = await import('drizzle-orm');
      await db.execute(sql`SELECT 1`);
      return c.json({ status: 'ready', database: 'connected' });
    } catch {
      return c.json({ status: 'degraded', database: 'unavailable' }, 503);
    }
  });
