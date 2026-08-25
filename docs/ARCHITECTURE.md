# Architecture

Suraksha Labs is a modular monolith: one Bun API process organized by domain, one React SPA, one PostgreSQL database. This shape was chosen deliberately — it keeps operational cost near zero for V1 while enforcing the module boundaries needed to grow (VDP assessments, cloud labs, organizations) without a rewrite.

## System overview

```
┌──────────────────────────┐        ┌────────────────────────────────┐
│  React SPA (Vite build)  │  /api  │  Bun + Hono REST API           │
│  learner / public / admin│◄──────►│  ┌──────────────────────────┐  │
└──────────────────────────┘        │  │ core: auth, RBAC, rate   │  │
        static via nginx            │  │ limiting, validation     │  │
                                    │  ├──────────────────────────┤  │
                                    │  │ domains: auth, learning, │  │
                                    │  │ labs, gamification,      │  │
                                    │  │ admin, notifications,    │  │
                                    │  │ email, storage, audit    │  │
                                    │  └───────────┬──────────────┘  │
                                    └──────────────┼─────────────────┘
                                                   │ Drizzle ORM
                                            ┌──────▼──────┐    ┌─────────────┐
                                            │  PostgreSQL │    │ Lab packages│
                                            └─────────────┘    │ (files, zip)│
                                                               └─────────────┘
```

## Backend domains (`apps/api/src`)

| Domain | Responsibility |
|---|---|
| `core/` | App factory, security headers, CSRF origin checks, rate limiting, session auth, RBAC helpers, crypto (Argon2id via `Bun.password`, HMAC flags), error envelope |
| `auth/` | Signup, login, logout, email verification, password reset/change, Google OAuth (authorization-code + state cookie), session management, audit hooks |
| `learning/` | Paths → modules → lessons (modular content blocks), progress tracking, practice exercises with server-side answer validation, recommendations |
| `labs/` | Discovery/filters, lab detail (spoiler-safe), attempts, progressive hints, **server-side flag verification**, authorized package downloads |
| `gamification/` | XP ledger + denormalized counters, DB-driven levels, achievement engine (criteria evaluator), leaderboards (global/category/season windows), public profiles |
| `admin/` | Content CMS (versioned), lab management (workflow + package upload), user administration, analytics, audit viewer, platform settings |
| `notifications/` | In-app notifications honoring per-user preferences |
| `email/` | Template registry + provider abstraction (SMTP / console) with a persisted outbox |
| `storage/` | Lab package storage abstraction (filesystem V1; S3-compatible swap-in later) |
| `audit/` | Structured audit trail for security-relevant actions |
| `db/` | Drizzle schema (25 tables), SQL migrations, idempotent seed |

## Data model highlights

- **Users & auth**: `users` (roles: learner → super_admin), `sessions` (hashed tokens), `verification_tokens`, `oauth_accounts` (provider-agnostic for future providers)
- **Learning**: `learning_paths` → `modules` → `lessons` (jsonb content blocks) with `lesson_versions` (full snapshots: who/when/what) and `lesson_progress`
- **Practice**: `practice_exercises` (correct answers stored server-side only), `practice_completions`
- **Labs**: `labs` (metadata, `flag_hmac`, hints, workflow status, package pointer), `lab_attempts` (first attempt / first solve / personal best kept separate), `flag_submissions`, `hint_reveals`, `lab_downloads`
- **Gamification**: `xp_events` (append-only ledger), `levels` (DB thresholds), `achievements` (criteria jsonb), `user_achievements` (share slugs), `seasons` (date-windowed, never hardcoded)
- **Platform**: `notifications` + preferences, `email_outbox`, `audit_logs`, `site_settings` (XP + platform config editable by admins)

### Scoring integrity

- XP is awarded through a single `awardXp()` path that writes the ledger and updates the user counter atomically.
- Solving a lab again never re-awards XP; it can only improve the **personal best** time.
- `first_attempt_solve` means the very first flag submission of the learner's first attempt was correct — failed submissions and hint usage are tracked separately so percentile statistics stay honest.

## Security model

1. **Authentication**: Argon2id (memory 64 MB), DB-backed opaque session tokens (SHA-256 hashed at rest), httpOnly + SameSite=Lax + Secure cookies, 30-day TTL with revocation.
2. **Authorization**: every `/admin` route gated server-side; sub-routers enforce stricter roles (`content_editor` for content, `lab_manager` for labs, publisher roles for publishing, `super_admin` for role changes and flag/XP adjustments). Learner endpoints verify ownership implicitly through session scoping.
3. **CSRF**: SameSite=Lax cookies + Origin/Referer allow-list on mutating requests.
4. **Input**: every request body/query parsed by Zod; validation failures return structured 400s.
5. **Output**: no raw HTML rendering (safe rich-text tokenizer), no stack traces (global error envelope), flags/HMACs and emails never exposed cross-account.
6. **Rate limiting**: per-bucket fixed windows (login 15/min, signup 10/min, flag submits 20/min, downloads 10/min, admin surfaces gated). Interface is Redis-swappable.
7. **Abuse telemetry**: IPs only stored as HMAC hashes; audit log records actor/action/entity/metadata for admin actions, auth events, content and flag changes.
8. **Lab packages**: untrusted by design — uploaded zips are stored outside the app runtime, never extracted or executed on the server, and served only to authenticated learners via safe content-disposition downloads.

## Frontend architecture (`apps/web/src`)

- `app.tsx` route table with lazy route chunks (code splitting per page), auth/onboarding/staff route guards
- `layouts/` public chrome, learner shell (notifications + user menu), admin sidebar
- `components/ui/` design system primitives (buttons, inputs, cards, overlays, tables, toasts) built on Tailwind 4 CSS-first tokens (dark navy default, full light theme)
- `features/` domain components (content block renderer, exercise cards, lab cards, admin charts)
- `lib/` typed API client, TanStack Query key factory, auth context, SEO hook
- Pages are domain-organized under `pages/` mirroring the route table in the spec

## Extensibility points (deliberate)

- **Lab runtimes**: `labs.runtime_type` + package abstraction — browser/cloud/standalone runtimes plug in without schema rewrites
- **Seasons**: date-windowed `seasons` table; leaderboards compute windows from the XP ledger
- **VDP readiness**: the attempt/flag/assessment primitives are separated from "learning" scoring; a future controlled-assessment mode layers on top (timed attempts, report submission) without touching the learning model
- **OAuth providers**: `oauth_accounts` is provider-generic
- **Search**: content is relational and slug-addressable; a modular search layer can index lessons/labs without schema changes
