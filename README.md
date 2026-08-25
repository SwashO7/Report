# Suraksha Labs

**by Shadow Security**

A free cybersecurity learning and practical training platform. Suraksha Labs takes learners from absolute zero — "what is an IP address?" — to practical, hands-on security skills through a structured journey:

**Learn → Practice → Labs → Progression → Community → Cybersecurity competency**

---

## What's inside

| Surface | Description |
|---|---|
| **Learning paths** | Level 0–5 curriculum (Foundations → Linux → Networking → Web → Recon → Vulnerability Research) with video, rich text, command examples, quizzes and practice exercises |
| **Local CTF labs** | Downloadable Docker-based vulnerable applications. Run locally, find the flag, submit for server-side verification |
| **Progression** | Configurable XP engine, levels, achievements, streaks, percentiles, global/category/seasonal leaderboards |
| **Profiles & sharing** | Public profiles, polished achievement share cards with public verification pages |
| **Admin panel** | Full CMS (no code changes needed for content), lab management with package uploads, user/role administration, analytics, audit log, platform settings |

## Tech stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query, Zod, React Hook Form, Lucide icons, Motion
- **Backend**: Bun, Hono (typed REST API), modular domain architecture
- **Database**: PostgreSQL with Drizzle ORM (typed schema + SQL migrations)
- **Auth**: Argon2id password hashing, DB-backed sessions, secure httpOnly cookies, Google OAuth, email verification & password reset
- **Email**: Template registry + provider abstraction (SMTP via env, console transport for dev)
- **Tests**: Bun test — unit suites + full API integration suites

## Repository layout

```
surakshaLabs/
├── apps/
│   ├── web/               React SPA (learner + public + admin)
│   └── api/               Bun/Hono REST API
│       ├── src/
│       │   ├── auth/          signup, login, OAuth, sessions, tokens
│       │   ├── learning/      paths, lessons, progress, exercises
│       │   ├── labs/          browse, attempts, flags, hints, downloads
│       │   ├── gamification/  XP, levels, achievements, leaderboard, profiles
│       │   ├── admin/         CMS, labs admin, users, analytics, audit, settings
│       │   ├── notifications/ in-app notifications
│       │   ├── email/         templates + provider abstraction
│       │   ├── storage/       lab package storage abstraction
│       │   ├── core/          app factory, middleware, crypto, rate limiting, RBAC
│       │   └── db/            schema, migrations, seed data
│       └── drizzle/           generated SQL migrations
├── packages/shared/       Zod schemas + shared types (used by both apps)
├── labs/packages/         Example local CTF lab packages (Docker)
├── scripts/               Brand pipeline, lab zip builder, e2e journey test
└── docs/                  Deployment, architecture, lab authoring guides
```

## Quick start (local development)

**Prerequisites**: [Bun](https://bun.sh) 1.1+, Docker (for PostgreSQL and labs)

```bash
# 1. Install dependencies
bun install

# 2. Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
#    -> set SESSION_SECRET and FLAG_HMAC_SECRET to random values
#    -> bun -e "console.log(crypto.randomUUID() + crypto.randomUUID())"

# 4. Apply database migrations
bun run db:migrate

# 5. Seed development data (curriculum, labs, achievements, demo users)
bun run db:seed

# 6. Build the downloadable lab packages (zips into apps/api/storage/labs)
bun scripts/build-lab-packages.ts
bun run db:seed   # re-links packages to labs

# 7. Run backend + frontend (two terminals, or use the combined script)
bun run dev:api     # http://localhost:3000
bun run dev:web     # http://localhost:5173
```

Open **http://localhost:5173**.

### Demo accounts (seeded, development only)

| Account | Password | Role |
|---|---|---|
| `admin@suraksha.local` | `SurakshaAdmin1` | super_admin |
| `editor@suraksha.local` | `SurakshaEditor1` | content_editor |
| `labmgr@suraksha.local` | `SurakshaLabmgr1` | lab_manager |
| `learner@suraksha.local` | `SurakshaLearner1` | learner |

Plus three demo leaderboard learners (`demo-ava`, `demo-raj`, `demo-mia`, password `SurakshaDemo1`).

> **Never seed demo accounts in production.** The seed is intended for development/demo environments.

### Solving a lab locally

1. Sign up in the app and open **Labs → Port Discovery → Download lab package**
2. Unzip, then inside the folder: `docker compose up -d`
3. Investigate (the lab README gives the mission — not the solution)
4. Submit the flag on the lab page. The server verifies it and awards XP.

## Scripts

| Command | Description |
|---|---|
| `bun run dev:api` / `bun run dev:web` | Start backend / frontend in dev mode |
| `bun run build` | Production build (both apps) |
| `bun test` | Unit + integration test suites |
| `bun run db:generate` | Generate SQL migrations from schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:seed` | Seed development data (idempotent) |
| `bun run typecheck` | TypeScript checks (both apps) |
| `bun scripts/build-lab-packages.ts` | Zip lab packages into `apps/api/storage/labs/` |
| `bun scripts/e2e-journey.ts` | End-to-end journey smoke test (API must be running) |

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full production guide (Docker Compose stack, environment variables, Google OAuth setup, SMTP, hardening checklist).

## Security posture

Security-first engineering is a core requirement:

- Argon2id password hashing; flags stored **only** as keyed HMACs — plaintext flags never touch the database
- DB-backed sessions with httpOnly SameSite cookies, origin-checked mutations, revocation support
- Server-side authorization on every endpoint (roles: learner → super_admin); no frontend-trusted checks
- Rate limiting on auth, flag submissions, downloads and admin surfaces; account-enumeration-safe responses
- Parameterized queries throughout (Drizzle), strict Zod validation on all inputs, no raw HTML rendering
- Audit log for all security-relevant and administrative actions; IPs stored only as hashes
- Lab packages are untrusted archives: stored outside the app runtime, never extracted or executed server-side

Full details in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Creating content & labs (no code required)

- **Lessons**: Admin → Learning content → Lessons. Modular blocks (text, video, code, commands, callouts, quizzes, practice, lab links) with draft → review → publish workflow and full version history.
- **Labs**: Admin → Labs → New lab. Configure metadata, hints, the flag (stored as HMAC), upload the Docker package zip, then move it through the review workflow to publish.

See **[docs/LAB_AUTHORING.md](docs/LAB_AUTHORING.md)** for the lab package format and authoring guide.

## License

Proprietary — © Shadow Security. All rights reserved.
