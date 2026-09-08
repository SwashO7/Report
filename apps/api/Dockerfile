# Suraksha Labs — API production image
# Build from repo root: docker build -f apps/api/Dockerfile -t suraksha-api .

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

# Runtime
FROM base AS runtime
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/bun.lock ./
COPY packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/drizzle ./apps/api/drizzle
COPY apps/api/drizzle.config.ts ./apps/api/drizzle.config.ts
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY scripts ./scripts
COPY labs ./labs

# Re-run install now that full API source is present: bun's isolated install
# (.bin/exports -> node_modules/.bun/<pkg>/node_modules/<pkg> symlinks) can
# leave dangling package subpath resolution when the deps-only layer above
# runs before the workspace's own source tree exists. This second pass is a
# no-op on a healthy install and repairs it when needed.
RUN bun install --frozen-lockfile

WORKDIR /app/apps/api

# Lab packages storage volume. The volume can pre-exist and mask image content,
# so packages are baked into a staging dir and synced in by the entrypoint.
RUN mkdir -p storage/labs
VOLUME ["/app/apps/api/storage"]

ENV LAB_PACKAGE_STAGE=/app/lab-packages-dist
RUN cd /app && LAB_PACKAGE_OUT=/app/lab-packages-dist bun scripts/build-lab-packages.ts

COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Sync baked lab packages into the storage volume, apply migrations, then start.
CMD ["/usr/local/bin/docker-entrypoint.sh"]
