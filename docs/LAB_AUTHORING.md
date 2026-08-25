# Lab Authoring Guide

Local CTF labs are Docker packages learners download, run on their own machine, and solve for a flag that is verified server-side. This guide explains the package format and the full admin workflow — no code changes required.

## Package format

```
my-lab/
├── manifest.yaml        # Machine-readable metadata (NO flags here)
├── docker-compose.yml   # The intentionally vulnerable application
├── app/                 # Application source served by the compose services
├── setup/               # Optional setup helpers (log generators, seed scripts)
└── README.md            # Mission briefing + how to run + how to submit (NO spoilers)
```

### manifest.yaml

```yaml
id: web-invoice-portal
version: 1.0.0
title: Invoice Portal
category: web-security
difficulty: intermediate
runtime:
  type: docker            # docker today; browser/cloud runtimes are planned
  compose_file: docker-compose.yml
metadata:
  estimated_time: 30
  xp: 250
objectives:
  - Investigate the invoice portal
  - Retrieve the hidden flag
hints:
  - Conceptual nudge
  - Specific direction
  - Strong guidance
```

**Rules**

1. **Never** include the flag in `manifest.yaml` or `README.md`. The flag is configured in the admin panel and stored server-side as an HMAC.
2. Bind ports to `127.0.0.1` only — the lab runs on the learner's machine.
3. Keep packages small and dependency-light (pure Python/Node stdlib is ideal).
4. The app must be **intentionally vulnerable by design** and clearly marked as a teaching artifact in source comments. It must never be deployed anywhere real.
5. Do not spoil the vulnerability class in learner-facing text — describe the mission, not the technique.

## Authoring workflow (admin panel)

1. **Create the lab**: Admin → Labs → New lab. Fill title, slug, category, difficulty, XP, estimated time, description (mission briefing), objectives, skills, hints (progressive: conceptual → specific → strong).
2. **Configure the flag**: enter the plaintext flag in the flag field. The server stores only an HMAC — it cannot be retrieved afterwards. Case sensitivity is configurable.
3. **Upload the package**: zip your package folder (manifest at the zip root) and upload it with a semantic version. Learners always download the exact versioned artifact.
4. **Review workflow**: Draft → Internal Testing → Security Review → Ready → **Publish** (publishing requires a publisher role and an uploaded package; early-stage publishing requires an administrator).
5. **Link to learning**: attach related lessons so the lesson pages recommend your lab and the lab page links back to the preparation material.
6. **Observe**: Admin → Labs → Analytics shows starts, completions, completion rate, average/median solve time, first-attempt success, hint usage, retry rate, and failed submissions — use it to find labs that are too hard, too easy, or confusing.

## Building the example packages

The repository ships four reference labs under `labs/packages/`:

| Lab | Category | Teaches |
|---|---|---|
| Port Discovery | networking | Port scanning, service discovery with nmap |
| HTTP Investigation | web-security | HTTP surface inspection (headers, robots.txt, cookies) |
| Invoice Portal | web-security | Access-control flaws (never named in learner text) |
| Log Hunter | linux | Container access, log analysis with grep |

Zip them into the API's storage (the seed auto-links them when present):

```bash
bun scripts/build-lab-packages.ts
bun run db:seed   # re-links package paths/sizes
```

## Flag conventions

- Format: `SURAKSHA{descriptive_snake_case}` — descriptive, not guessable.
- Flags are compared after whitespace normalization; case-insensitivity is per-lab (recommended ON for beginners).
- Changing a flag in the admin panel takes effect immediately and is audit-logged.

## Testing your lab before review

```bash
cd my-lab
docker compose up -d
# exercise the app like a learner would...
docker compose down -v   # always clean up
```

Then walk the learner flow: download the package from the (internal-testing) lab page, run it, submit the flag, and confirm XP + achievement triggers in a test account.
