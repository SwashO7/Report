# Suraksha Labs — API production image
# Build from repo root: docker build -f apps/api/Dockerfile -t suraksha-api .

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

# Runtime
FROM base AS runtime
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/drizzle ./apps/api/drizzle
COPY apps/api/drizzle.config.ts ./apps/api/drizzle.config.ts
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json

WORKDIR /app/apps/api

# Lab packages storage volume
RUN mkdir -p storage/labs
VOLUME ["/app/apps/api/storage"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Apply migrations, then start.
CMD ["sh", "-c", "bun src/db/migrate.ts && bun src/index.ts"]
