# Deploying Suraksha Labs

This guide covers a production deployment using the provided Docker Compose stack (nginx + static frontend, Bun API, PostgreSQL).

## 1. Prerequisites

- A Linux server (2 vCPU / 4 GB RAM is comfortable for the V1 scale) with Docker + Compose v2
- A domain with DNS pointing at the server (TLS terminated by your proxy/load balancer, or add a certbot sidecar)
- Outbound email (SMTP) for verification/reset emails — any transactional provider works

## 2. Configure environment

Create a `.env` file at the repository root (used by `docker-compose.prod.yml`):

```env
# Public URLs (no trailing slash)
APP_URL=https://labs.example.com
API_URL=https://labs.example.com

# Postgres
POSTGRES_USER=suraksha
POSTGRES_PASSWORD=<long random password>
POSTGRES_DB=suraksha

# Secrets — generate with: openssl rand -base64 48
SESSION_SECRET=<random 48+ bytes>
FLAG_HMAC_SECRET=<random 32+ bytes>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# SMTP (optional; falls back to console transport)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=Suraksha Labs <no-reply@example.com>

WEB_PORT=80
```

> **Secret hygiene**: never commit `.env`. Rotate `SESSION_SECRET` only with a plan to invalidate sessions; rotating `FLAG_HMAC_SECRET` invalidates all stored flag hashes (labs must be re-saved with their flags).

## 3. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The API container applies pending migrations automatically on start (`bun src/db/migrate.ts && bun src/index.ts`).

Verify:

```bash
curl https://labs.example.com/api/v1/health        # -> {"status":"ok",...}
curl https://labs.example.com/api/v1/health/ready  # -> {"status":"ready","database":"connected"}
```

## 4. First-run checklist

1. Visit the site and **create your administrator account** (or temporarily run the seed on a staging copy and change passwords).
2. Promote yourself: connect to the DB and set your role
   ```sql
   UPDATE users SET role='super_admin', email_verified_at=now() WHERE email='you@example.com';
   ```
   (Or seed in a private environment and reuse the admin account after changing its password.)
3. Confirm email delivery: request a password reset for a test address.
4. Configure Google OAuth (optional) — see below.
5. Upload lab packages via Admin → Labs (or run `bun scripts/build-lab-packages.ts` locally and upload the zips).
6. Update `apps/web/public/sitemap.xml` and the `Sitemap:` lines in `apps/web/public/robots.txt` with the production domain. Published report pages are listed automatically by `/api/v1/reports/sitemap.xml` (built from `APP_URL`).
7. Review Admin → Settings (XP config, registration toggle, announcement).

## 5. Google OAuth setup

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an OAuth 2.0 Client (Web application).
2. Authorized redirect URI: `https://labs.example.com/api/v1/auth/google/callback`
3. Put the client ID/secret into `.env` and restart the `api` service.
4. The "Continue with Google" button appears automatically once configured (`GET /api/v1/auth/providers` reports availability).

## 6. TLS

Put the stack behind your TLS terminator (Caddy, Traefik, nginx, or a cloud LB). Requirements:

- Terminate HTTPS and forward to `web:80` (the nginx container also proxies `/api/` to the API).
- Forward `X-Forwarded-For` so rate limiting sees real client IPs.
- HSTS is sent by the API in production; enable it on the static host too.

## 7. Operations

| Task | How |
|---|---|
| Logs | `docker compose logs -f api web` (structured JSON on the API) |
| Migrations | Automatic on API start; manual: `docker compose exec api bun src/db/migrate.ts` |
| Database backup | `docker compose exec db pg_dump -U suraksha suraksha > backup.sql` |
| Restore | `cat backup.sql | docker compose exec -T db psql -U suraksha suraksha` |
| Lab packages | Stored in the `labpackages` volume — include it in backups |
| Scaling | The API is stateless (sessions in Postgres) — run multiple replicas behind the proxy. Rate limiting is per-instance in V1; move to a shared store (e.g. Redis) if you scale beyond one API node |

## 8. Production hardening checklist

- [ ] Strong, unique `SESSION_SECRET` and `FLAG_HMAC_SECRET`
- [ ] `NODE_ENV=production` (secure cookies + HSTS enabled automatically)
- [ ] TLS enforced; HSTS preload at the proxy
- [ ] Database not exposed publicly (compose network only — default)
- [ ] Demo seed data **not** present; all staff accounts use unique strong passwords
- [ ] SMTP configured so verification/reset emails actually deliver
- [ ] Backups scheduled (database + labpackages volume) and restore tested
- [ ] Log shipping/monitoring wired to the API's structured logs
- [ ] `registration_enabled` reviewed in Admin → Settings if you need an invite-only phase

## 9. Upgrading

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Migrations run automatically and are backward-compatible with the previous release's schema where possible. Check release notes before major version bumps.
