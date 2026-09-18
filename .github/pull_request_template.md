## What changed
<!-- One or two sentences. What does this PR do and why? -->

## How it was verified
<!-- Tick what you actually ran. -->
- [ ] `bun run typecheck`
- [ ] `bun test`
- [ ] `bun scripts/validate-curriculum.ts`
- [ ] `node scripts/audit-lesson-coverage.mjs` + `check-seed-structure.mjs` (if curriculum touched)
- [ ] Manual check / screenshot (describe below)

## Security & cost impact
<!-- New input handled? Auth/authorization touched? New secret or env var?
     New always-on resource or a raised --max-instances (bill impact)?
     Write "none" if genuinely none. -->

## Rollback plan
<!-- How to undo this if it goes wrong. For a schema change, confirm it is
     forward-compatible (add-then-drop across two releases). For a deploy,
     the previous Cloud Run revision is the rollback. -->

## Migrations
- [ ] No DB migration
- [ ] Includes a migration, and it is forward-compatible (old code still runs against the new schema)
