# Suraksha Labs — Web production image (static build behind nginx)
# Build from repo root: docker build -f apps/web/Dockerfile -t suraksha-web .

FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
# Re-run install now that full workspace source is present: bun's isolated
# install (.bin symlinks -> node_modules/.bun/<pkg>/node_modules/<pkg>) can
# leave a dangling apps/web/node_modules/typescript symlink when the deps-only
# layer above runs before the workspace's own source tree exists. This second
# pass is a no-op on a healthy install and repairs it when needed.
RUN bun install --frozen-lockfile
WORKDIR /app/apps/web
# API base for the SPA is same-origin /api (served behind the reverse proxy).
RUN bun run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost/ >/dev/null || exit 1
