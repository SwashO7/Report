import { createApp } from './core/app';
import { env, isDev } from './config/env';

const app = createApp();

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
  development: isDev,
});

if (isDev) {
  console.info(`[suraksha-api] listening on http://localhost:${server.port}`);
}

export default server;
