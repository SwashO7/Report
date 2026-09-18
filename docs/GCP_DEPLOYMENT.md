# Suraksha Labs on Google Cloud — architecture and deployment guide

Written for a team doing this for the first time. Every command is copy-paste
ready. Read Part 0, then work top to bottom. Nothing here breaks local
development: `bun run up` keeps working exactly as it does today.

**Target:** `https://suraksha.shadowsecurity.in`

---

## Part 0 — What we are building, and why these choices

```
                         users (mostly India)
                                  |
                                  v
                    ┌─────────────────────────────┐
                    │  Cloud Armor (WAF)          │  blocks bots, floods, bad IPs
                    └─────────────────────────────┘
                                  |
                    ┌─────────────────────────────┐
                    │  Global HTTPS Load Balancer │  one domain, free TLS cert
                    │  + Cloud CDN                │  caches JS/CSS/images worldwide
                    └─────────────────────────────┘
                         |                    |
              /api/*     |                    |  everything else
                         v                    v
              ┌──────────────────┐   ┌──────────────────┐
              │ Cloud Run: api   │   │ Cloud Run: web   │
              │ Bun + Hono       │   │ nginx + built SPA│
              │ scales 1..10     │   │ scales 0..10     │
              └──────────────────┘   └──────────────────┘
                    |        |
      ┌─────────────┘        └──────────────┐
      v                                     v
┌──────────────────┐              ┌────────────────────┐
│ Cloud SQL        │              │ Cloud Storage      │
│ PostgreSQL 16    │              │ lab package .zips  │
│ daily backup     │              │ versioned          │
│ 7-day PITR       │              └────────────────────┘
└──────────────────┘
      |                                     
      v  weekly export                      
┌──────────────────┐     ┌──────────────────────┐
│ Backup bucket    │     │ Secret Manager       │
│ 90-day retention │     │ all secrets, no .env │
└──────────────────┘     └──────────────────────┘
```

**Region: `asia-south1` (Mumbai).** Closest to your users; roughly 30-60 ms
instead of 250 ms from the US. Use it for every resource so nothing pays a
cross-region toll.

Why each piece:

| Choice | Why not the alternative |
|---|---|
| **Cloud Run** | A VM (Compute Engine) means you patch the OS, manage systemd, and pay 24/7. Cloud Run charges per request, scales itself, and deploys the exact Docker images you already build. GKE is Kubernetes — far too much for a team of your size. |
| **Cloud SQL** | Running Postgres yourself means you own backups, failover and patching. Cloud SQL does automated backups and point-in-time recovery, which you explicitly asked for. |
| **Load Balancer + CDN** | Cloud Run can serve a custom domain directly, but then you get no WAF and no CDN. The load balancer is what makes Cloud Armor and caching possible. |
| **Secret Manager** | A `.env` file on a server is the single most common way startups leak credentials. Secrets are injected at runtime and never sit in the image or the repo. |
| **Cloud Storage for labs** | Cloud Run instances are destroyed constantly. A `.zip` written to the container filesystem is gone on the next deploy — so lab packages must live in a bucket. |

**Rough monthly cost at launch** (low traffic, Mumbai):

| Item | Approx INR/month |
|---|---|
| Cloud SQL `db-g1-small`, 10 GB SSD | 2,000 – 2,600 |
| Cloud Run (api + web, light traffic) | 0 – 800 |
| Load Balancer (forwarding rule) | ~1,600 |
| Cloud Storage + egress | 100 – 400 |
| Cloud Armor policy | ~450 + per-request |
| Artifact Registry, logs, Secret Manager | 100 – 300 |
| **Total** | **≈ 4,500 – 6,000** |

The load balancer has a fixed monthly charge whether you get 10 visitors or
10,000, so it dominates at launch. Staging and dev do **not** get a load
balancer (see Part 8) which keeps them nearly free.

> Prices change. Check the
> [GCP pricing calculator](https://cloud.google.com/products/calculator) for a
> current quote before you commit.

---

## Part 1 — Accounts, projects and who can do what

### 1.1 Install the CLI

```bash
# https://cloud.google.com/sdk/docs/install
gcloud version
gcloud auth login
```

### 1.2 Three projects, not one

One project per environment. This is the single most important decision for
"don't destroy production": an accident in `dev` cannot reach `prod`, because
they are different projects with different permissions.

```bash
# Replace ORG_BILLING_ACCOUNT with your billing account id (gcloud billing accounts list)
export BILLING=ORG_BILLING_ACCOUNT

for ENVIRONMENT in prod staging dev; do
  gcloud projects create suraksha-$ENVIRONMENT --name="Suraksha Labs $ENVIRONMENT"
  gcloud billing projects link suraksha-$ENVIRONMENT --billing-account=$BILLING
done
```

Work on production deliberately:

```bash
gcloud config set project suraksha-prod
gcloud config set run/region asia-south1
gcloud config set compute/region asia-south1
```

### 1.3 Enable the services

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com \
  certificatemanager.googleapis.com \
  storage.googleapis.com \
  cloudscheduler.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  iap.googleapis.com
```

### 1.4 Who gets which role

Create a Google Group per role (in Google Workspace) and grant the group, never
individual emails — then adding a teammate is one click and removing them
actually removes their access everywhere.

| Group | Production role | Why |
|---|---|---|
| `suraksha-owners@` | `roles/owner` | You only. Two people maximum. |
| `suraksha-devs@` | `roles/run.viewer`, `roles/logging.viewer` | Read logs and status. **No deploy rights in prod** — deploys go through CI (Part 9). |
| `suraksha-deployers@` | `roles/run.developer` on staging only | Manual staging deploys while you are learning. |

```bash
gcloud projects add-iam-policy-binding suraksha-prod \
  --member="group:suraksha-devs@shadowsecurity.in" \
  --role="roles/run.viewer"
gcloud projects add-iam-policy-binding suraksha-prod \
  --member="group:suraksha-devs@shadowsecurity.in" \
  --role="roles/logging.viewer"
```

**Turn on MFA for every Google account with any access.** This is the account
that can delete your database; a password alone is not enough.

---

## Part 2 — Database (Cloud SQL) with backups

### 2.1 Create the instance

```bash
gcloud sql instances create suraksha-pg \
  --database-version=POSTGRES_16 \
  --tier=db-g1-small \
  --region=asia-south1 \
  --storage-size=10GB \
  --storage-type=SSD \
  --storage-auto-increase \
  --backup-start-time=19:30 \
  --retained-backups-count=14 \
  --enable-point-in-time-recovery \
  --retained-transaction-log-days=7 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=20 \
  --database-flags=max_connections=100
```

What those flags buy you:

- `--backup-start-time=19:30` is **UTC** = 01:00 IST, a quiet hour.
- `--retained-backups-count=14` — two weeks of daily restore points.
- `--enable-point-in-time-recovery` — restore to *any second* in the last 7
  days. This is what saves you when someone runs a bad `UPDATE` at 3pm: you
  recover to 2:59pm, not to last night.
- `--storage-auto-increase` — the disk grows instead of the site going down.

### 2.2 Database and user

```bash
gcloud sql databases create suraksha --instance=suraksha-pg

# Generate a strong password and store it straight into Secret Manager.
DB_PASS="$(openssl rand -base64 32)"
gcloud sql users create suraksha_app --instance=suraksha-pg --password="$DB_PASS"
printf '%s' "$DB_PASS" | gcloud secrets create db-password --data-file=-
unset DB_PASS
```

### 2.3 Lock it down

```bash
# No public network may reach the instance. Cloud Run connects through the
# Cloud SQL connector using IAM + TLS, not through an open port.
gcloud sql instances patch suraksha-pg --clear-authorized-networks
gcloud sql instances patch suraksha-pg --require-ssl
```

Confirm there are no authorized networks:

```bash
gcloud sql instances describe suraksha-pg --format="value(settings.ipConfiguration.authorizedNetworks)"
# expect empty output
```

### 2.4 The connection string

Cloud Run reaches Cloud SQL over a **Unix socket**, not TCP. The
`DATABASE_URL` for production looks like this — note the empty host and the
`host=` query parameter:

```
postgresql://suraksha_app:PASSWORD@/suraksha?host=/cloudsql/suraksha-prod:asia-south1:suraksha-pg
```

`postgres.js` (what the API uses) understands this form directly. No code change.

---

## Part 3 — Secrets

Never put these in the repo, in a Dockerfile, or in a `.env` that gets committed.

```bash
# Session and flag signing secrets - generate fresh, never reuse dev values
bun -e "console.log(crypto.randomUUID()+crypto.randomUUID())" | tr -d '\n' \
  | gcloud secrets create session-secret --data-file=-
bun -e "console.log(crypto.randomUUID())" | tr -d '\n' \
  | gcloud secrets create flag-hmac-secret --data-file=-

# ZeptoMail token (Part 10 explains where to get it)
printf '%s' 'PASTE_ZEPTOMAIL_TOKEN' | gcloud secrets create zeptomail-token --data-file=-

# Google OAuth
printf '%s' 'PASTE_CLIENT_ID'     | gcloud secrets create google-client-id --data-file=-
printf '%s' 'PASTE_CLIENT_SECRET' | gcloud secrets create google-client-secret --data-file=-

# Full DATABASE_URL, assembled once
printf '%s' "postgresql://suraksha_app:$(gcloud secrets versions access latest --secret=db-password)@/suraksha?host=/cloudsql/suraksha-prod:asia-south1:suraksha-pg" \
  | gcloud secrets create database-url --data-file=-
```

> **`FLAG_HMAC_SECRET` is special.** Lab flags are stored only as keyed hashes
> of this secret. Change it and **every existing flag stops validating** —
> nobody can solve a lab. Set it once, back it up somewhere safe offline, and
> never rotate it without a migration plan.

### 3.1 A dedicated service account

Cloud Run should not run as the default account, which has broad permissions.

```bash
gcloud iam service-accounts create suraksha-api \
  --display-name="Suraksha Labs API runtime"

SA="suraksha-api@suraksha-prod.iam.gserviceaccount.com"

# Only what it actually needs
gcloud projects add-iam-policy-binding suraksha-prod \
  --member="serviceAccount:$SA" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding suraksha-prod \
  --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding suraksha-prod \
  --member="serviceAccount:$SA" --role="roles/storage.objectAdmin"
```

---

## Part 4 — Lab package storage

```bash
# Private bucket, versioned so a bad overwrite is recoverable
gcloud storage buckets create gs://suraksha-prod-labs \
  --location=asia-south1 \
  --uniform-bucket-level-access \
  --public-access-prevention

gcloud storage buckets update gs://suraksha-prod-labs --versioning

# Keep old versions 90 days, then clean up
cat > /tmp/lifecycle.json <<'JSON'
{"rule":[{"action":{"type":"Delete"},"condition":{"numNewerVersions":5,"daysSinceNoncurrentTime":90}}]}
JSON
gcloud storage buckets update gs://suraksha-prod-labs --lifecycle-file=/tmp/lifecycle.json
```

Upload the packages you already build locally:

```bash
bun scripts/build-lab-packages.ts
gcloud storage rsync apps/api/storage/labs gs://suraksha-prod-labs/labs --recursive
```

Set `GCS_BUCKET=suraksha-prod-labs` on the service (Part 5). The code reads that
variable and falls back to the local filesystem when it is absent, which is why
local development is unaffected.

---

## Part 5 — Deploy the containers

### 5.1 Image registry

```bash
gcloud artifacts repositories create suraksha \
  --repository-format=docker --location=asia-south1
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

### 5.2 Build and push

Uses the Dockerfiles already in the repo.

```bash
REG=asia-south1-docker.pkg.dev/suraksha-prod/suraksha
TAG=$(git rev-parse --short HEAD)   # tag by commit, never only :latest

gcloud builds submit --tag $REG/api:$TAG --file apps/api/Dockerfile .
gcloud builds submit --tag $REG/web:$TAG --file apps/web/Dockerfile .
```

Tagging by commit is what makes rollback possible: you can always redeploy the
previous tag.

### 5.3 Run database migrations as a job

Migrations must run **before** the new code takes traffic, and exactly once —
not on every container start.

```bash
gcloud run jobs create suraksha-migrate \
  --image $REG/api:$TAG \
  --region asia-south1 \
  --service-account $SA \
  --set-cloudsql-instances suraksha-prod:asia-south1:suraksha-pg \
  --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest,FLAG_HMAC_SECRET=flag-hmac-secret:latest \
  --command bun --args src/db/migrate.ts \
  --max-retries 1

gcloud run jobs execute suraksha-migrate --region asia-south1 --wait
```

### 5.4 Deploy the API

```bash
gcloud run deploy suraksha-api \
  --image $REG/api:$TAG \
  --region asia-south1 \
  --service-account $SA \
  --no-allow-unauthenticated \
  --set-cloudsql-instances suraksha-prod:asia-south1:suraksha-pg \
  --set-env-vars NODE_ENV=production,APP_URL=https://suraksha.shadowsecurity.in,API_URL=https://suraksha.shadowsecurity.in,GCS_BUCKET=suraksha-prod-labs,DB_POOL_MAX=5 \
  --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest,FLAG_HMAC_SECRET=flag-hmac-secret:latest,ZEPTOMAIL_TOKEN=zeptomail-token:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --cpu 1 --memory 512Mi \
  --timeout 60
```

Why these numbers:

- `--min-instances 1` — one instance always warm. Without it the first visitor
  after a quiet spell waits several seconds for a cold start. This is the single
  best rupee-for-rupee UX improvement you can buy.
- `--max-instances 10` with `DB_POOL_MAX=5` = at most 50 database connections,
  comfortably under the 100 limit set in Part 2.1. **If you raise one, do the
  arithmetic on the other.**
- `--concurrency 80` — each instance handles 80 simultaneous requests. Bun is
  async; it does not need one instance per user.
- `--no-allow-unauthenticated` — only the load balancer may call it. Nobody can
  hit the raw `run.app` URL and bypass your WAF.

### 5.5 Deploy the web front end

```bash
gcloud run deploy suraksha-web \
  --image $REG/web:$TAG \
  --region asia-south1 \
  --no-allow-unauthenticated \
  --min-instances 0 --max-instances 10 \
  --cpu 1 --memory 256Mi
```

> The `web` container's nginx currently proxies `/api` to `http://api:3000`,
> which is a Docker Compose hostname that does not exist on Cloud Run. On Cloud
> Run the **load balancer** does that routing instead (Part 6), so nginx only
> serves static files. See "Code changes still required" at the end.

---

## Part 6 — Domain: suraksha.shadowsecurity.in

### 6.1 Reserve an IP

```bash
gcloud compute addresses create suraksha-ip --global
gcloud compute addresses describe suraksha-ip --global --format="value(address)"
```

### 6.2 Point DNS at it

In whatever DNS host serves `shadowsecurity.in`, add **one** record:

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `suraksha` | the IP from above | 300 |

Verify before continuing — the TLS certificate cannot issue until DNS resolves:

```bash
dig +short suraksha.shadowsecurity.in
```

> Your main site had a www-vs-apex mismatch before. This is a separate subdomain
> and does not touch those records. Do not add a CNAME as well as the A record.

### 6.3 Serverless network endpoint groups

These let the load balancer talk to Cloud Run.

```bash
gcloud compute network-endpoint-groups create suraksha-api-neg \
  --region=asia-south1 --network-endpoint-type=serverless \
  --cloud-run-service=suraksha-api
gcloud compute network-endpoint-groups create suraksha-web-neg \
  --region=asia-south1 --network-endpoint-type=serverless \
  --cloud-run-service=suraksha-web
```

### 6.4 Backends, with CDN on the static one

```bash
# API: no CDN. Responses are per-user; caching them would serve one learner's
# data to another. This is a real risk, not a theoretical one.
gcloud compute backend-services create suraksha-api-backend \
  --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend suraksha-api-backend \
  --global --network-endpoint-group=suraksha-api-neg \
  --network-endpoint-group-region=asia-south1

# Web: CDN on. Hashed asset filenames make this safe and fast.
gcloud compute backend-services create suraksha-web-backend \
  --global --load-balancing-scheme=EXTERNAL_MANAGED \
  --enable-cdn --cache-mode=CACHE_ALL_STATIC \
  --default-ttl=3600 --max-ttl=86400 --client-ttl=3600
gcloud compute backend-services add-backend suraksha-web-backend \
  --global --network-endpoint-group=suraksha-web-neg \
  --network-endpoint-group-region=asia-south1
```

### 6.5 Routing and TLS

```bash
gcloud compute url-maps create suraksha-lb --default-service suraksha-web-backend
gcloud compute url-maps add-path-matcher suraksha-lb \
  --path-matcher-name=api-matcher \
  --default-service=suraksha-web-backend \
  --path-rules="/api/*=suraksha-api-backend"

gcloud compute ssl-certificates create suraksha-cert \
  --domains=suraksha.shadowsecurity.in --global

gcloud compute target-https-proxies create suraksha-https-proxy \
  --url-map=suraksha-lb --ssl-certificates=suraksha-cert
gcloud compute forwarding-rules create suraksha-https-rule \
  --global --target-https-proxy=suraksha-https-proxy \
  --address=suraksha-ip --ports=443

# Redirect plain HTTP to HTTPS
cat > /tmp/redirect.yaml <<'YAML'
kind: compute#urlMap
name: suraksha-redirect
defaultUrlRedirect:
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
  httpsRedirect: true
YAML
gcloud compute url-maps import suraksha-redirect --source=/tmp/redirect.yaml --global
gcloud compute target-http-proxies create suraksha-http-proxy --url-map=suraksha-redirect
gcloud compute forwarding-rules create suraksha-http-rule \
  --global --target-http-proxy=suraksha-http-proxy \
  --address=suraksha-ip --ports=80
```

The certificate takes **15-60 minutes** to go ACTIVE. Watch it:

```bash
gcloud compute ssl-certificates describe suraksha-cert --global \
  --format="value(managed.status)"
```

`FAILED_NOT_VISIBLE` means DNS is not resolving yet. Fix DNS and wait.

---

## Part 7 — Security hardening

### 7.1 Cloud Armor (WAF and rate limiting)

```bash
gcloud compute security-policies create suraksha-waf \
  --description="Suraksha Labs edge protection"

# Per-IP rate limit: 100 requests/minute, then a 10-minute ban
gcloud compute security-policies rules create 1000 \
  --security-policy=suraksha-waf \
  --expression="true" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60 \
  --ban-duration-sec=600 \
  --conform-action=allow --exceed-action=deny-429 \
  --enforce-on-key=IP

# Tighter limit on login: 10 attempts/minute per IP
gcloud compute security-policies rules create 900 \
  --security-policy=suraksha-waf \
  --expression="request.path.matches('/api/v1/auth/login')" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=10 \
  --rate-limit-threshold-interval-sec=60 \
  --ban-duration-sec=900 \
  --conform-action=allow --exceed-action=deny-429 \
  --enforce-on-key=IP

# Managed rules for SQLi and XSS - start in preview so you can watch for
# false positives before they start blocking real learners
gcloud compute security-policies rules create 800 \
  --security-policy=suraksha-waf \
  --expression="evaluatePreconfiguredWaf('sqli-v33-stable', {'sensitivity': 1})" \
  --action=deny-403 --preview
gcloud compute security-policies rules create 810 \
  --security-policy=suraksha-waf \
  --expression="evaluatePreconfiguredWaf('xss-v33-stable', {'sensitivity': 1})" \
  --action=deny-403 --preview

gcloud compute backend-services update suraksha-api-backend \
  --global --security-policy=suraksha-waf
gcloud compute backend-services update suraksha-web-backend \
  --global --security-policy=suraksha-waf
```

> **A WAF on a hacking-education site needs judgement.** Your learners legitimately
> type `' OR 1=1--` into *your* labs. Keep the SQLi/XSS rules in `--preview` for
> two weeks, read the logs, and only enforce them on paths that should never
> carry payloads (`/api/v1/auth/*`, `/api/v1/admin/*`). Never enforce them on
> flag submission. Run:
> ```bash
> gcloud logging read 'jsonPayload.enforcedSecurityPolicy.name="suraksha-waf"' --limit 50
> ```

### 7.2 What the application already does well

Verified in the codebase — do not undo these:

- Argon2id password hashing; flags stored only as keyed HMACs.
- DB-backed sessions, `HttpOnly` + `Secure` + `SameSite` cookies, origin-checked mutations.
- Server-side authorization on every endpoint; no frontend-trusted role checks.
- Parameterized queries throughout (Drizzle), strict Zod validation on all input.
- Lab packages are never extracted or executed server-side.
- SVG diagram uploads are sanitised (`<script>`, `onload`, external refs stripped).
- Audit log for every security-relevant admin action; IPs stored only as hashes.

### 7.3 Remaining gaps to close before launch

1. **Delete the seeded demo accounts.** `admin@suraksha.local` with a published
   password must not exist in production. See the launch checklist.
2. **Never run `db:seed` against production** after first launch. It is
   idempotent for content but it also creates demo users.
3. **Turn on Cloud SQL deletion protection:**
   ```bash
   gcloud sql instances patch suraksha-pg --deletion-protection
   ```
4. **Enable audit logging** for admin activity in Cloud Logging, and set a log
   retention bucket of 400 days for the audit log.

---

## Part 8 — Staging and dev, visible only to your team

Repeat Parts 2-5 in `suraksha-staging` with two differences: a `db-f1-micro`
tier, and **no load balancer** (saves the fixed monthly cost). Instead, keep the
Cloud Run URL private and put Identity-Aware Proxy in front of it, so only your
Google accounts can open it.

```bash
gcloud config set project suraksha-staging

# Only your team may invoke the service - everyone else gets 403 before
# a single line of app code runs
gcloud run services add-iam-policy-binding suraksha-web \
  --region=asia-south1 \
  --member="group:suraksha-devs@shadowsecurity.in" \
  --role="roles/run.invoker"
```

Your team then reaches it with an authenticated proxy on their own machine:

```bash
gcloud run services proxy suraksha-web --region=asia-south1 --port=8080
# open http://localhost:8080
```

This is genuinely private — no password to leak, no URL to guess, and access is
revoked the moment you remove someone from the group.

**Staging must use its own database and its own secrets.** Never point staging at
the production database "just to test with real data": one bad migration then
destroys production. To test with realistic data, restore a production backup
into staging (Part 11.4), which also rehearses your restore procedure.

---

## Part 9 — How changes reach production without breaking it

This is the workflow professional teams use, sized for a small team.

### 9.1 Branch and review flow

```
feature/xyz ──PR──> main ──auto──> STAGING ──tag v1.2.0──> approval ──> PRODUCTION
```

Rules that matter:

1. **Nobody pushes to `main`.** All changes arrive by pull request. Protect the
   branch in GitHub: require one approving review, require checks to pass, and
   disallow force pushes.
2. **`main` deploys to staging automatically.** Every merge is live on staging
   within minutes, so problems surface before a release.
3. **Production deploys from a git tag, with a human approving.** Use a GitHub
   Environment named `production` with yourself as a required reviewer.
4. **Migrations are forward-compatible.** Never rename or drop a column in the
   same release that stops using it. Deploy in two steps: (a) add the new
   column and write to both, (b) a release later, drop the old one. Otherwise a
   rollback hits a schema the old code cannot read.
5. **Every PR must pass** `bun run typecheck`, `bun test`,
   `bun scripts/validate-curriculum.ts`, and the structure checks. These already
   exist in the repo.

### 9.2 Authenticate CI without a key file

Use **Workload Identity Federation**. A downloaded service-account JSON key is
a permanent credential that leaks through laptops and CI logs; federation gives
GitHub a short-lived token instead.

```bash
gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global --workload-identity-pool=github \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='shadowsecurity/surakshaLabs'"

gcloud iam service-accounts create github-deployer
gcloud projects add-iam-policy-binding suraksha-prod \
  --member="serviceAccount:github-deployer@suraksha-prod.iam.gserviceaccount.com" \
  --role="roles/run.developer"
```

The `--attribute-condition` is important: without it, *any* GitHub repository
could request a token for your project.

### 9.3 Rolling back

Cloud Run keeps every revision. Rollback is instant and needs no rebuild:

```bash
gcloud run revisions list --service suraksha-api --region asia-south1
gcloud run services update-traffic suraksha-api \
  --region asia-south1 --to-revisions=suraksha-api-00042-abc=100
```

Practise this once before launch, so the first time is not during an incident.

### 9.4 Gradual releases

For a risky change, send 10% of traffic to the new revision first:

```bash
gcloud run services update-traffic suraksha-api --region asia-south1 \
  --to-revisions=NEW=10,CURRENT=90
```

Watch errors for ten minutes, then go to 100 or back to 0.

---

## Part 10 — ZeptoMail (Zoho)

### 10.1 In the ZeptoMail console

1. Sign in at [zeptomail.zoho.in](https://www.zoho.com/zeptomail/) and add the
   domain `shadowsecurity.in`.
2. ZeptoMail shows DNS records to add. Add **all** of them at your DNS host:

| Purpose | Type | Notes |
|---|---|---|
| Domain verification | `TXT` | Proves you own the domain |
| **SPF** | `TXT` on `@` | Authorises ZeptoMail to send as you |
| **DKIM** | `TXT` on the selector ZeptoMail gives | Cryptographically signs your mail |

3. Add a **DMARC** record yourself — ZeptoMail does not create it and without it
   your mail lands in spam far more often:

| Type | Name | Value |
|---|---|---|
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@shadowsecurity.in; pct=100; adkim=s; aspf=s` |

Start with `p=quarantine`, read the reports for a few weeks, then move to
`p=reject`.

4. Create a **Mail Agent** named "Suraksha Labs", then open **SMTP / API info**
   and copy the **Send Mail Token**.

> If you already send company mail from `shadowsecurity.in`, adding a second SPF
> record will **break both**. A domain may have only one SPF record — merge the
> ZeptoMail include into the existing one instead.

### 10.2 Wire it up

Already implemented in `apps/api/src/email/provider.ts`. Set:

```bash
printf '%s' 'YOUR_SEND_MAIL_TOKEN' | gcloud secrets create zeptomail-token --data-file=-

gcloud run services update suraksha-api --region asia-south1 \
  --set-secrets ZEPTOMAIL_TOKEN=zeptomail-token:latest \
  --set-env-vars 'EMAIL_FROM=Suraksha Labs <no-reply@shadowsecurity.in>,ZEPTOMAIL_HOST=api.zeptomail.in'
```

The API picks ZeptoMail automatically when the token is present, SMTP if only
SMTP is configured, and otherwise logs mail to the console in development. Use
`api.zeptomail.in` for an India-region Zoho account and `api.zeptomail.com`
otherwise — the wrong one returns 401.

### 10.3 Sender address

Send from `no-reply@shadowsecurity.in` and set a real `ZEPTOMAIL_REPLY_TO` such
as `support@shadowsecurity.in`. Mail from a `no-reply` address that also refuses
replies annoys users and hurts deliverability.

---

## Part 11 — Backups, and actually restoring them

A backup you have never restored is a hope, not a backup.

### 11.1 What is protected

| Data | Mechanism | Retention |
|---|---|---|
| Database (users, progress, XP, labs, lessons, diagrams) | Cloud SQL automated backup | 14 daily |
| Database, any point in time | Point-in-time recovery | 7 days |
| Database, long term | Weekly export to GCS | 90 days |
| Lab package zips | GCS object versioning | 5 versions / 90 days |
| Secrets | Secret Manager versions | forever |
| Code | GitHub | forever |

### 11.2 Weekly off-instance export

Automated backups live with the instance; if the instance is deleted they can go
with it. Keep an independent copy.

```bash
gcloud storage buckets create gs://suraksha-prod-backups \
  --location=asia-south1 --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update gs://suraksha-prod-backups \
  --retention-period=90d   # objects cannot be deleted before 90 days

gcloud scheduler jobs create http suraksha-weekly-export \
  --location=asia-south1 \
  --schedule="0 20 * * 0" --time-zone="Asia/Kolkata" \
  --uri="https://sqladmin.googleapis.com/v1/projects/suraksha-prod/instances/suraksha-pg/export" \
  --http-method=POST \
  --oauth-service-account-email="$SA" \
  --message-body='{"exportContext":{"fileType":"SQL","uri":"gs://suraksha-prod-backups/weekly/suraksha.sql.gz","databases":["suraksha"]}}'
```

The retention policy means even a compromised admin account cannot delete your
backups — which is precisely the scenario ransomware relies on.

### 11.3 Restore the whole instance

```bash
gcloud sql backups list --instance=suraksha-pg
gcloud sql backups restore BACKUP_ID --restore-instance=suraksha-pg
```

### 11.4 Point-in-time restore (the one you will actually want)

Someone ran a bad query at 15:04. Recover to 15:03 into a **new** instance so
production keeps serving while you check:

```bash
gcloud sql instances clone suraksha-pg suraksha-pg-recovered \
  --point-in-time='2026-09-18T15:03:00.000Z'   # UTC
```

Inspect `suraksha-pg-recovered`, copy out the good rows, then delete the clone.

### 11.5 Do this every quarter

Restore last week's backup into staging and confirm the site works against it.
Put a recurring calendar invite on it. This is the difference between having
backups and having recovery.

---

## Part 12 — Monitoring and alerts

Set up alerts *before* launch — you want to hear about problems from a phone
notification, not a user.

```bash
gcloud monitoring uptime create suraksha-health \
  --resource-type=uptime-url \
  --resource-labels=host=suraksha.shadowsecurity.in \
  --path=/api/v1/health --period=5 --timeout=10
```

Create alert policies in the console for:

| Alert | Threshold | Why |
|---|---|---|
| Uptime check failing | 2 consecutive failures | The site is down |
| 5xx rate | > 2% over 5 min | Something broke in a release |
| p95 latency | > 2 s over 10 min | Database or cold-start trouble |
| Cloud SQL CPU | > 80% for 15 min | Time to raise the tier |
| Cloud SQL disk | > 80% | Running out of space |
| Cloud SQL connections | > 80 | The pool arithmetic is wrong |
| **Billing** | > ₹8,000/month | Catches a runaway loop or an attack |

The billing alert is not optional. A misconfigured retry loop can cost more in a
weekend than the site earns in a year.

---

## Part 13 — Performance and load

### 13.1 Already handled by this architecture

- **Cloud CDN** serves JS, CSS and diagrams from an edge near the user; the SPA's
  hashed filenames make long cache lifetimes safe.
- **Cloud Run autoscaling** adds instances under load; `--concurrency 80` means
  one instance serves many users.
- **`--min-instances 1`** removes cold starts for the common case.
- **Diagrams are served with ETags**, so repeat visits get `304 Not Modified`.

### 13.2 Do these before you promote the launch

1. **Verify the indexes.** The schema already indexes the hot paths (lesson
   slugs, module ordering, lab attempts). Confirm nothing regressed:
   ```sql
   SELECT relname, seq_scan, idx_scan FROM pg_stat_user_tables
   WHERE seq_scan > idx_scan AND seq_scan > 1000 ORDER BY seq_scan DESC;
   ```
   Any table high on that list is missing an index for a query you run often.

2. **Load test before launch day, against staging, never production:**
   ```bash
   bunx autocannon -c 50 -d 30 https://staging-url/api/v1/learn/paths
   ```
   Watch instance count and DB connections while it runs. If connections hit the
   ceiling, revisit the `DB_POOL_MAX` arithmetic rather than raising the tier.

3. **Cache the curriculum.** Paths, modules and lessons change rarely but are
   fetched constantly. Adding a short `Cache-Control: public, max-age=60` to the
   public learning endpoints would remove most database reads at launch. Not yet
   implemented — see below.

### 13.3 When you outgrow this

In rough order: raise Cloud SQL tier → add a read replica for public content →
add Memorystore (Redis) for sessions and the curriculum → split the API. You are
a long way from needing any of it.

---

## Part 14 — Launch checklist

Work through this in order on launch day.

**Infrastructure**
- [ ] SSL certificate status is `ACTIVE`
- [ ] `https://suraksha.shadowsecurity.in` loads; `http://` redirects to it
- [ ] Cloud SQL has no authorized networks and deletion protection on
- [ ] Both Cloud Run services are `--no-allow-unauthenticated`
- [ ] Cloud Armor attached to both backends
- [ ] Uptime check and all alerts firing to a phone you carry
- [ ] Billing alert set

**Data and access**
- [ ] Migrations applied; `/api/v1/health` reports the database reachable
- [ ] **Every seeded demo account deleted or disabled** —
      `admin@suraksha.local`, `editor@`, `labmgr@`, `learner@`, `demo-*`
- [ ] A real super-admin account created with a strong unique password and MFA
- [ ] Lab package zips present in the bucket and a download tested end to end
- [ ] A lab flag submitted successfully (proves `FLAG_HMAC_SECRET` is right)
- [ ] `FLAG_HMAC_SECRET` backed up offline

**Email**
- [ ] SPF, DKIM, DMARC all verifying (test at [mail-tester.com](https://www.mail-tester.com/))
- [ ] Signup verification mail arrives in Gmail **inbox**, not spam
- [ ] Password reset mail arrives

**Process**
- [ ] `main` is branch-protected; nobody can push directly
- [ ] A rollback rehearsed successfully
- [ ] A backup restored into staging successfully

---

## Part 15 — Runbook

| Symptom | First thing to check | Fix |
|---|---|---|
| Site returns 502 | `gcloud run services logs read suraksha-api --limit 50` | Usually a failed migration or a missing secret. Roll back (9.3). |
| "too many clients" in logs | Cloud SQL connections metric | `DB_POOL_MAX` × max-instances exceeds the limit. Lower the pool. |
| Login works, next request is 401 | Cookie flags and `APP_URL` | `APP_URL` must be the exact public HTTPS origin. |
| Cert stuck `FAILED_NOT_VISIBLE` | `dig +short suraksha.shadowsecurity.in` | DNS is not pointing at the reserved IP yet. |
| Email not arriving | ZeptoMail console bounce log | Usually SPF/DKIM, or `api.zeptomail.com` vs `.in`. |
| Learners cannot solve any lab | `FLAG_HMAC_SECRET` | It changed. Restore the original value. |
| Costs spiked | Billing report by service | Usually Cloud Run max-instances during an attack; tighten Cloud Armor. |
| Suspected breach | Audit log, then rotate | Rotate `SESSION_SECRET` (logs everyone out), DB password, ZeptoMail token. **Not** `FLAG_HMAC_SECRET`. |

---

## Part 16 — Securing the admin panel

The admin surface (`/api/v1/admin/*`) can create users, publish labs, and read
the audit log. A stolen staff session here is the worst thing that can happen to
the platform, so the admin surface gets its own layers of protection on top of
the login. Do them in this order — each one is independent, and doing more of
them is strictly better.

> **If you only do three things:** turn on **(a) IAP** so only your Google
> Workspace group can reach the admin surface, set **(c) `ADMIN_IP_ALLOWLIST`**
> to your office/VPN egress ranges as a backstop, and require **(e) TOTP 2FA**
> for every staff account. Those three cover the edge, the app, and the human.

Everywhere below, replace the `CAPS_PLACEHOLDER` values with your own.

### 16a — Identity-Aware Proxy (IAP) — the primary recommendation

*Why:* IAP puts Google's own login in front of the admin surface. A request has
to prove it belongs to a named person in an IAM group **before** it reaches the
app at all. This is how large companies gate internal tools.

*Why it beats a bastion VM with SSH port-forwarding:* a bastion is a VM you have
to patch, its SSH keys are shared and hard to revoke per-person, and it only
works from a machine that has the key. IAP has **no VM to patch, no shared keys,
a per-person audit trail, works from any laptop with a browser, and is cheaper**
(you pay for the load balancer you already have, not a 24/7 VM).

The cleanest shape is a **separate admin hostname** (see 16d) with IAP enabled on
its backend. Enable IAP on the backend service that serves the admin surface:

```bash
# 1. Create an IAP-authorized IAM group in Google Workspace, e.g.
#    suraksha-admins@YOUR_DOMAIN  — add staff to this group, remove leavers.

# 2. Configure the OAuth consent screen once (console: APIs & Services → OAuth
#    consent screen), then turn IAP on for the admin backend service:
gcloud iap web enable \
  --resource-type=backend-services \
  --service=BACKEND_SERVICE_NAME_FOR_ADMIN

# 3. Grant the group access (only members can pass IAP):
gcloud iap web add-iam-policy-binding \
  --resource-type=backend-services \
  --service=BACKEND_SERVICE_NAME_FOR_ADMIN \
  --member="group:suraksha-admins@YOUR_DOMAIN" \
  --role="roles/iap.httpsResourceAccessor"
```

*Trade-off:* IAP fronts a **load-balancer backend**, so the admin surface must be
reachable through its own backend service (16d makes that clean). Staff sign in
with their Google account; there is no separate admin password to phish at the
edge — the app password + 2FA then becomes the *second* gate behind IAP.

### 16b — Cloud Armor allowlist for `/api/v1/admin/*`

*Why:* even with IAP, a Cloud Armor rule that only lets your office/VPN egress
ranges hit the admin path means a blocked request is rejected at Google's edge —
it never costs you any compute, and it is a second independent control if an IAP
binding is ever misconfigured.

```bash
# Create (or reuse) a Cloud Armor policy, then add an allow-then-deny pair
# scoped to the admin path. Replace the CIDRs with YOUR egress ranges.
gcloud compute security-policies create suraksha-admin-policy \
  --description="Restrict admin API to office/VPN egress"

# Allow your ranges to the admin path (priority lower number = evaluated first):
gcloud compute security-policies rules create 1000 \
  --security-policy=suraksha-admin-policy \
  --expression="request.path.matches('/api/v1/admin/') && inIpRange(origin.ip, 'OFFICE_CIDR_1')" \
  --action=allow

# Deny everyone else on the admin path:
gcloud compute security-policies rules create 2000 \
  --security-policy=suraksha-admin-policy \
  --expression="request.path.matches('/api/v1/admin/')" \
  --action="deny-404"

# Attach the policy to the backend serving the API:
gcloud compute backend-services update BACKEND_SERVICE_NAME_FOR_API \
  --security-policy=suraksha-admin-policy --global
```

*Trade-off:* office IPs change; keep the CIDR list somewhere version-controlled
so a new VPN range is a one-line edit, not a 2 a.m. mystery lockout.

### 16c — The app-level `ADMIN_IP_ALLOWLIST` (defence in depth)

*Why:* configuration at the edge drifts — a Terraform apply drops a rule, a new
load balancer is wired up without the policy. This env var makes the **app
itself** refuse non-allowlisted addresses, so it is the last thing standing when
the edge fails. It is implemented in `apps/api/src/core/admin-network.ts`, which
answers **404** (not 403) to a blocked request so a scanner cannot even confirm
the admin API is there.

```bash
gcloud run services update suraksha-api --region asia-south1 \
  --set-env-vars 'ADMIN_IP_ALLOWLIST=OFFICE_CIDR_1,OFFICE_CIDR_2,VPN_CIDR'
```

> **Launch blocker:** an **empty** `ADMIN_IP_ALLOWLIST` in production means the
> app-level guard does nothing — the admin API is reachable from any address.
> The API logs a boot warning when it is empty in production, and the
> pre-launch gate (`scripts/verify-production-safety.mjs`) fails on it. Do not
> launch with it unset.

*Trade-off:* it only understands IPv4 addresses and CIDRs (office egress is IPv4
in practice); express any IPv6 range at the edge in 16b instead.

### 16d — A separate admin hostname / serverless NEG

*Why:* the safest surface is one that is not on the public host at all. Route the
admin API through its own hostname (e.g. `admin.suraksha.shadowsecurity.in`) on
its own backend service, so the public site cannot even name the admin path.
This is also what lets IAP (16a) sit cleanly in front of only the admin backend.

```bash
# A serverless NEG points a load-balancer backend at the Cloud Run service.
gcloud compute network-endpoint-groups create suraksha-admin-neg \
  --region=asia-south1 --network-endpoint-type=serverless \
  --cloud-run-service=suraksha-api

gcloud compute backend-services create BACKEND_SERVICE_NAME_FOR_ADMIN \
  --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend BACKEND_SERVICE_NAME_FOR_ADMIN \
  --global --network-endpoint-group=suraksha-admin-neg \
  --network-endpoint-group-region=asia-south1
# Then add a host rule for admin.suraksha.shadowsecurity.in to your URL map,
# enable IAP (16a) and attach the Cloud Armor policy (16b) to THIS backend.
```

*Trade-off:* one more hostname, one more managed TLS cert, one more URL-map host
rule. Worth it: the admin surface stops being a path on the site everyone knows.

### 16e — Mandatory TOTP 2FA and short admin sessions

*Why:* every layer above protects the network path; this protects the human. A
password alone is one phish away from a takeover. The schema already carries
`totpSecret` / `totpEnrolledAt` / `totpRecoveryHashes` per user, and admin/staff
sessions use a deliberately short lifetime so a stolen cookie is useful only
briefly.

```bash
gcloud run services update suraksha-api --region asia-south1 \
  --set-env-vars 'ADMIN_SESSION_MINUTES=30'
```

Then, as policy: **no staff account operates without TOTP enrolled.** The first
super-admin enrols immediately after bootstrap (Part 17); every account created
afterwards enrols before it is used.

*Trade-off:* staff must carry an authenticator app and their recovery codes.
That is the point — the friction is what a stolen password now has to overcome.

---

## Part 17 — Creating production admin accounts

**The seeded dev credentials do not — and must not — exist in production.** The
development seed (`bun run db:seed`) creates demo humans with *published, weak*
passwords: `admin@suraksha.local` / `SurakshaAdmin1`, plus `editor@`, `labmgr@`,
`learner@`, and three `demo-*` leaderboard accounts. Anyone can read those
passwords in the repo. In production the curriculum still gets seeded, but those
accounts are never created, and one real super-admin is made by hand.

### 17.1 The exact sequence

Run these in order. Steps 1–2 you have already met in Part 9; the new pieces are
the two production scripts.

```bash
# 1. Deploy the images (Part 9).
# 2. Apply database migrations.
gcloud run jobs execute suraksha-migrate --region asia-south1 --wait

# 3. Seed CURRICULUM ONLY — no demo users. Idempotent; safe to re-run.
#    scripts/seed-production.ts seeds an explicit allowlist of reference tables
#    (paths, modules, lessons, exercises, diagrams, labs, achievements, config)
#    and never touches the users or xp_events tables.
gcloud run jobs execute suraksha-seed-prod --region asia-south1 --wait
#    (Or, from Cloud Shell with DATABASE_URL set: bun scripts/seed-production.ts)

# 4. Create the ONE real super-admin. The password is read from a prompt or an
#    env var — NEVER from argv, which would leak into logs and shell history.
#    scripts/bootstrap-production-admin.ts refuses to run if a super_admin
#    already exists (pass --force only to add a deliberate second one).
gcloud run jobs execute suraksha-bootstrap-admin --region asia-south1 --wait \
  --update-env-vars 'BOOTSTRAP_ADMIN_EMAIL=you@YOUR_DOMAIN'
#    Provide the password out-of-band via a Secret Manager-backed env var:
#      BOOTSTRAP_ADMIN_PASSWORD  (min 16 chars, mixed classes, not a demo password)
#    Or run interactively in Cloud Shell and type it at the hidden prompt:
#      bun scripts/bootstrap-production-admin.ts
```

> **Defining the Cloud Run jobs once.** Each `gcloud run jobs execute` above
> assumes a one-off job wrapping the same API image with a different command,
> e.g.
> ```bash
> gcloud run jobs create suraksha-seed-prod --region asia-south1 \
>   --image REGION-docker.pkg.dev/PROJECT/REPO/suraksha-api:TAG \
>   --command bun --args scripts/seed-production.ts \
>   --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest,FLAG_HMAC_SECRET=flag-hmac:latest
> ```
> Create `suraksha-bootstrap-admin` the same way with
> `--args scripts/bootstrap-production-admin.ts`, and add the
> `BOOTSTRAP_ADMIN_PASSWORD` secret to it.

```bash
# 5. Log in as the new super-admin at the admin hostname (Part 16d).
# 6. Enrol 2FA immediately: Admin → Security → Two-factor. Store the recovery
#    codes in a password manager, NOT on the server.
# 7. Create the remaining staff from inside the admin panel, least privilege:
#      content_editor  — writes lessons/labs, cannot manage users
#      lab_manager     — ships lab containers
#      moderator       — handles reports/leaderboard, no content or user admin
#    Give super_admin to as few people as possible.
# 8. Run the pre-launch safety gate against the live site:
node scripts/verify-production-safety.mjs https://suraksha.shadowsecurity.in
#    It exits non-zero if any @suraksha.local account exists, any demo password
#    still logs in, ADMIN_IP_ALLOWLIST is not enforced, the admin API is
#    reachable, security headers are missing, or HTTP does not redirect to HTTPS.
```

### 17.2 Rotate or recover a lost admin credential

**Lost password (device still enrolled):** trigger a password reset from the
login page — reset mail is transactional and ignores the email opt-out. If email
is down, run the bootstrap script with `--force` and a fresh email to mint a new
super-admin, then disable the stranded account from the admin panel.

**Lost 2FA device:** use one of the printed recovery codes to sign in, then
re-enrol under Admin → Security. If the recovery codes are also lost, a second
super-admin (or a fresh `--force` bootstrap) can clear the `totpSecret` /
`totpEnrolledAt` for the locked-out user so they can re-enrol.

**Suspected compromise:** rotate `SESSION_SECRET` (logs everyone out instantly),
rotate the DB password and ZeptoMail token, review the `audit_logs` table
(the bootstrap writes an `admin_bootstrap` row there), and reset the affected
passwords. Do **not** rotate `FLAG_HMAC_SECRET` — that would break every lab
flag (see Part 15).

---

## Code changes still required

Implemented already:

- **ZeptoMail provider** — `apps/api/src/email/provider.ts`, selected
  automatically when `ZEPTOMAIL_TOKEN` is set.
- **Configurable DB pool** — `DB_POOL_MAX`, with the sizing rule documented in
  `apps/api/src/db/client.ts`.
- **`GCS_BUCKET` setting** recognised by the env schema.
- **Production bootstrap + safety scripts** — `scripts/seed-production.ts`
  (curriculum/reference only, no demo users),
  `scripts/bootstrap-production-admin.ts` (one real super-admin, no argv
  password), and `scripts/verify-production-safety.mjs` (live pre-launch gate).
  See Parts 16–17.

Still to do, in priority order:

1. **Cloud Storage driver for lab packages.** `apps/api/src/storage/` is
   filesystem-only. Until this lands, a lab package uploaded through the admin
   panel is lost on the next deploy. **This blocks launch.**
2. **nginx config for Cloud Run.** `apps/web` proxies `/api` to the Compose
   hostname `api:3000`, which does not resolve on Cloud Run. The load balancer
   handles routing, so that proxy block must be removed for the production image.
3. **Admin-managed email templates and announcements.** Templates are currently
   code (`apps/api/src/email/templates.ts`). You asked to edit them in the admin
   panel and to mail learners when a lab is published — that needs an
   `email_templates` table, an admin editor, a send-on-publish hook, and a
   batched broadcast worker with unsubscribe handling.
4. **Cache headers on public learning endpoints** (Part 13.2).
5. **CI/CD workflow files** for the flow in Part 9.

Local development is untouched by all of the above: `bun run up`, `bun run
db:seed` and the Compose stack behave exactly as they do today, because every
new setting falls back to the current behaviour when unset.


---

## Part 18 — Cost containment: making a bill impossible, not just unlikely

> **Read this part before going live.** Everything else in this guide can be
> fixed after launch. An uncapped autoscaler cannot: by the time you notice, the
> money is spent. Suraksha Labs runs on fixed runway, so the goal here is not
> "cheap" — it is **a hard ceiling that a hostile stranger cannot raise.**

### 18.1 Where the money actually leaks

Three vectors, in order of how fast they drain:

| Vector | Why it is dangerous | What bounds it |
|---|---|---|
| **Lab package egress** | Packages are up to **200 MB** each and bandwidth is metered (~$0.12/GB from `asia-south1`). | Per-user DB quota + global circuit breaker + Cloud Armor |
| **Cloud Run autoscaling** | Every request can start an instance. Cheap endpoints hammered in a loop scale you out and bill per instance-second. | `--max-instances` + global rate limit |
| **Cloud SQL / logging** | Fixed tier, but log volume from an attack is billable and noisy. | Log exclusion filters, Armor blocking before the app |

The egress number is worth internalising. **Before** the controls in this guide:

```
10 instances × 10 downloads/min × 200 MB  = 20 GB/min
20 GB/min × $0.12/GB                      ≈ $2.40/min
                                          ≈ $144/hour  ≈ $3,456/day
```

That is one logged-in account with a `for` loop. It is why the download path has
three independent limits rather than one, and why the per-instance rate limiter
alone was never sufficient — see 18.5.

### 18.2 Layer 1 — Cap compute (do this first)

`--max-instances` is the single most important flag in this guide. Without it,
Cloud Run's default ceiling is high enough to be, in practice, unbounded.

```bash
# Set on BOTH services. 10 instances is sized against the DB connection budget:
#   DB_POOL_MAX (5) × max-instances (10) = 50 connections < Cloud SQL limit (100).
gcloud run services update suraksha-api \
  --region=asia-south1 \
  --max-instances=10 \
  --concurrency=80 \
  --cpu=1 --memory=512Mi

gcloud run services update suraksha-web \
  --region=asia-south1 \
  --max-instances=10 \
  --concurrency=200
```

**What this trades away:** under a genuine traffic spike you will queue and some
users will see slow pages or 503s, rather than being served at any cost. That is
the correct trade for you — a slow site recovers, a spent runway does not. Raise
the cap deliberately when you have revenue, not pre-emptively.

### 18.3 Layer 2 — Make the edge impossible to bypass (easy to miss, critical)

By default a Cloud Run service is **also** reachable at its own
`https://suraksha-api-xxxx-el.a.run.app` URL. That URL does **not** pass through
your load balancer, which means it bypasses **Cloud Armor, the rate limiting, the
CDN and the admin IP allowlist** — every protection in this part. Anyone who finds
it (they are enumerable) attacks you directly.

```bash
# Accept traffic ONLY from the load balancer. Do this on both services.
gcloud run services update suraksha-api \
  --region=asia-south1 \
  --ingress=internal-and-cloud-load-balancing

gcloud run services update suraksha-web \
  --region=asia-south1 \
  --ingress=internal-and-cloud-load-balancing

# Verify: the direct run.app URL must now fail, the domain must still work.
curl -s -o /dev/null -w '%{http_code}\n' https://suraksha-api-xxxx-el.a.run.app/api/v1/health   # expect 403/404
curl -s -o /dev/null -w '%{http_code}\n' https://suraksha.shadowsecurity.in/api/v1/health       # expect 200
```

> If you only remember one command from Part 18, it is this one. Every other
> control assumes traffic arrives through the load balancer.

### 18.4 Layer 3 — Cloud Armor: rate limiting and banning at the edge

This is the answer to "do we even need a WAF?" **Yes — but for rate limiting, not
for payload inspection.** Reasoning in 18.8.

Edge blocking is the only layer that costs you *nothing* when it triggers: a
request rejected by Cloud Armor never reaches Cloud Run, so it consumes no
instance time. The app's own limiter always costs a container to say "no".

```bash
POLICY=suraksha-armor
gcloud compute security-policies create $POLICY \
  --description "Rate limiting and abuse controls for Suraksha Labs"

# --- Baseline: per-IP request ceiling across the whole site -----------------
# 1800/min is deliberately generous: this keys on IP, and a college or office
# NATs hundreds of learners behind ONE address. A tight sitewide number throttles
# a whole classroom - a self-inflicted outage for a learning platform.
#
# Cost protection does not depend on this rule. It lives on the expensive paths
# below (downloads) plus the DB-backed quotas. Cheap reads are CDN-cached and
# near-free, so squeezing them buys little and hurts real users. This rule exists
# to stop a naive flood, not to price-protect.
gcloud compute security-policies rules create 1000 \
  --security-policy $POLICY \
  --expression "true" \
  --action throttle \
  --rate-limit-threshold-count 1800 \
  --rate-limit-threshold-interval-sec 60 \
  --conform-action allow \
  --exceed-action deny-429 \
  --enforce-on-key IP

# --- Lab downloads: the expensive path, tightened hard ----------------------
gcloud compute security-policies rules create 900 \
  --security-policy $POLICY \
  --expression "request.path.matches('/api/v1/labs/.*/download')" \
  --action throttle \
  --rate-limit-threshold-count 10 \
  --rate-limit-threshold-interval-sec 60 \
  --conform-action allow \
  --exceed-action deny-429 \
  --enforce-on-key IP

# --- Auth endpoints: credential stuffing, with an automatic BAN ------------
# rate_based_ban does what throttle cannot: a persistent attacker is dropped for
# 10 minutes instead of being allowed to keep probing at the threshold rate.
gcloud compute security-policies rules create 800 \
  --security-policy $POLICY \
  --expression "request.path.matches('/api/v1/auth/(login|signup|forgot-password)')" \
  --action rate-based-ban \
  --rate-limit-threshold-count 30 \
  --rate-limit-threshold-interval-sec 60 \
  --ban-duration-sec 600 \
  --conform-action allow \
  --exceed-action deny-429 \
  --enforce-on-key IP

# --- Admin surface: allowlist only (see Part 16) ---------------------------
gcloud compute security-policies rules create 500 \
  --security-policy $POLICY \
  --expression "request.path.matches('/api/v1/admin/') && !(origin.ip in ['203.0.113.10/32','198.51.100.0/24'])" \
  --action deny-404
#                                    ^^^^ REPLACE with your office/VPN egress CIDRs

# Attach to the backend services.
gcloud compute backend-services update suraksha-api-backend \
  --global --security-policy $POLICY
gcloud compute backend-services update suraksha-web-backend \
  --global --security-policy $POLICY
```

**Always deploy a new rule in preview first** — a bad expression can lock out
real users, and `--preview` logs what *would* have been blocked without blocking
it:

```bash
gcloud compute security-policies rules update 1000 --security-policy $POLICY --preview
# Watch for a day, then enforce:
gcloud compute security-policies rules update 1000 --security-policy $POLICY --no-preview
```

### 18.5 Layer 4 — Why the application's own limiter is not enough

`apps/api/src/core/rate-limit.ts` is an in-memory fixed-window counter. It is
genuinely useful — it is the only layer that understands *user accounts* — but it
has one property you must design around:

> **The counter lives in one container's memory.** With `--max-instances=10`, a
> limit of "15 per minute" is really *up to* 150 per minute platform-wide,
> because each instance counts independently and Cloud Run picks instances freely.

So the responsibilities split like this:

| Control | Where it counts | What it is good at |
|---|---|---|
| Cloud Armor | Edge, globally | Volumetric abuse. Costs nothing when it blocks. |
| App rate limiter | Per instance | Per-account fairness, cheap first line. **Never** a spend bound. |
| DB download quota | Database, shared | The actual egress ceiling. Survives scale-out. |

The download path's real bound is therefore
`LAB_DOWNLOAD_DAILY_MAX` (per account) and `LAB_DOWNLOAD_GLOBAL_DAILY_MAX`
(platform-wide, fails closed), both counted in PostgreSQL — see
`apps/api/src/labs/download-quota.ts`. Set them in the Cloud Run environment:

```bash
gcloud run services update suraksha-api --region=asia-south1 \
  --update-env-vars \
LAB_DOWNLOAD_DAILY_MAX=25,\
LAB_DOWNLOAD_GLOBAL_DAILY_MAX=2000,\
RATE_LIMIT_MAX=300,\
RATE_LIMIT_WINDOW_MS=60000,\
TRUSTED_PROXY_HOPS=1
```

> **`TRUSTED_PROXY_HOPS=1` is mandatory in production.** Behind the load balancer
> `X-Forwarded-For` reads `<client>, <lb>`, so the app must count in from the
> right to find the real client. Leave it at `0` and every rate limit keys off the
> load balancer's address instead — one bucket for the entire internet.

`LAB_DOWNLOAD_GLOBAL_DAILY_MAX=2000` at 200 MB is a **~400 GB/day worst case
(~$48)**. Lower it until you have real traffic data; it is a circuit breaker, and
an outage you can end with one command is cheaper than an invoice you cannot.

### 18.6 Layer 5 — Serve bytes you are not billed much for

```bash
# CDN on the static tier: cache hits are served from Google's edge, not your
# container, so repeat traffic stops costing instance time.
gcloud compute backend-services update suraksha-web-backend --global \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC \
  --default-ttl=3600 --max-ttl=86400 --client-ttl=3600
```

The web image already sends `immutable, max-age=31536000` for `/assets/` (hashed
filenames) and `no-store` for `index.html` — that split is deliberate: caching
`index.html` would pin users to asset hashes that no longer exist after a deploy,
producing a blank screen. Do not "simplify" it.

**Do not put lab packages behind the CDN.** They are large, rarely repeated, and
authorization is checked per request by the API; caching them at the edge would
both waste cache and risk serving a package to an unauthorized user.

### 18.7 Layer 6 — Budget alerts and the kill switch

Alerts tell you it is happening. A kill switch stops it while you are asleep.

```bash
BILLING_ACCOUNT=$(gcloud beta billing accounts list --format='value(name)' | head -1)

# Alert at 50/80/100% of a ₹8,000 month, and FORECAST 100% so you hear about a
# spike on day 3 rather than on day 28.
gcloud billing budgets create \
  --billing-account="$BILLING_ACCOUNT" \
  --display-name="Suraksha Labs production" \
  --budget-amount=8000INR \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.8 \
  --threshold-rule=percent=1.0 \
  --threshold-rule=percent=1.0,basis=forecasted-spend \
  --all-updates-rule-pubsub-topic="projects/suraksha-prod/topics/budget-alerts"
```

**The kill switch.** Point that Pub/Sub topic at a Cloud Function that detaches
the billing account when actual spend crosses a hard ceiling. Be clear-eyed about
what it does:

- It **takes the site down.** Cloud Run stops serving; the domain goes dark.
- It **does not delete data.** Cloud SQL data and GCS objects survive; billing is
  re-attachable and service resumes.
- It is a **last resort** — the layers above should mean it never fires. Its value
  is that the worst case becomes "we were offline for six hours" instead of
  "we lost two months of runway".

Set its ceiling meaningfully above the budget (e.g. 3×) so a normal busy month
never trips it. Also keep a **manual** version of the same action written down, so
whoever is awake can run it without reading code:

```bash
# MANUAL EMERGENCY STOP - stops all serving immediately, data is untouched.
gcloud run services update suraksha-api --region=asia-south1 --max-instances=0
gcloud run services update suraksha-web --region=asia-south1 --max-instances=0
# Reverse it with --max-instances=10 once the abuse is blocked.
```

`--max-instances=0` is gentler than detaching billing and usually enough: it stops
the spend without touching the billing account.

### 18.8 The WAF decision, and its reasoning

The question was whether a WAF is necessary at all, since labs run **offline on
the learner's own machine** and learners only submit flag strings to the site.
That reasoning is half right, and the half that is wrong matters.

**What it gets right:** the vulnerable applications are never exposed on your
infrastructure. Nobody can SQL-inject *your* database through a lab, because the
lab is a container on their laptop. So **payload-inspection rules earn their keep
mostly on the auth and admin paths**, not sitewide.

**What it misses:** the platform itself is a target, independent of the labs.

1. **Your audience is people learning to attack web applications.** Some fraction
   will point their new skills at the nearest available target — the site that
   taught them. This is not hypothetical; it is the predictable result of your
   own product working.
2. **Cost is the attack surface.** You do not need to be breached to be hurt. A
   stranger with a loop can cost you runway (18.1), and edge rate limiting is the
   only layer that rejects traffic without paying for a container to say no.
3. **The app's limiter cannot bound spend** (18.5). Something global is required,
   and Cloud Armor is that something.

**The decision:**

| Rule class | Setting | Why |
|---|---|---|
| Rate limiting + `rate_based_ban` | **Enforce** | The real control. Bounds both abuse and cost. |
| Admin path allowlist | **Enforce** | Smallest, highest-value surface. |
| Managed SQLi/XSS rules on `/auth/*`, `/admin/*` | **Enforce** | Genuine injection surface, low false-positive risk. |
| Managed rules elsewhere | **Preview only** | Watch first; a false positive that blocks a lesson is a real cost. |
| Managed rules on flag submission | **Never** | Flags legitimately contain `' OR 1=1`, `<script>`, and shell fragments. A WAF here would block correct answers and teach learners the platform is broken. |

That last row is the important one. Security controls that fight the product get
disabled by whoever is on call at 2am — so do not create them. Flags are verified
as **HMACs of a secret**, never interpolated into SQL or HTML, so payload
inspection there adds no protection and subtracts usability.

### 18.9 Pre-launch cost checklist

- [ ] `--max-instances` set on **both** Cloud Run services (18.2)
- [ ] `--ingress=internal-and-cloud-load-balancing` on both, and the direct
      `run.app` URL verified to fail (18.3)
- [ ] Cloud Armor policy attached to both backend services (18.4)
- [ ] `rate-based-ban` rule live on auth endpoints (18.4)
- [ ] `TRUSTED_PROXY_HOPS=1` set — otherwise every limit keys off the load
      balancer and rate limiting silently does nothing (18.5)
- [ ] `LAB_DOWNLOAD_DAILY_MAX` and `LAB_DOWNLOAD_GLOBAL_DAILY_MAX` set (18.5)
- [ ] Cloud CDN enabled on the web backend (18.6)
- [ ] Budget with **forecasted** threshold + Pub/Sub topic (18.7)
- [ ] Manual emergency stop command saved somewhere the whole team can reach it,
      not only in this file (18.7)
- [ ] `scripts/verify-rate-limits.mjs` run against production and passing,
      including the forged-`X-Forwarded-For` bypass check

Run the last one deliberately. It is the check that proves rate limiting is
**actually** enforced rather than merely configured:

```bash
node scripts/verify-rate-limits.mjs https://suraksha.shadowsecurity.in
```
