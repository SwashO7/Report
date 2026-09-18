/**
 * Production seed entry point.
 *
 *   bun scripts/seed-production.ts
 *
 * WHY THIS IS A THIN WRAPPER, NOT ITS OWN SEEDER. Production must get byte-for-byte
 * the same curriculum as development: 7 paths, 34 modules, 162 lessons, 37
 * exercises, the diagrams, the labs, the achievements. A second seeder that
 * re-implements the inserts would drift from the real one the first time either
 * side changed - and this project has already had curriculum content silently
 * diverge twice, which is exactly the failure mode that costs a day to find.
 *
 * So there is ONE seeder (apps/api/src/db/seed/index.ts) and this script only
 * sets the environment that tells it not to create demo humans. The difference
 * between a dev seed and a production seed is people, not content.
 *
 * What is excluded, and why: the dev seed creates staff accounts
 * (admin@ / editor@ / labmgr@ / learner@suraksha.local) and demo leaderboard
 * accounts (demo-ava, demo-raj, demo-mia) whose passwords are PUBLISHED in the
 * README. Any one of them surviving into production is a full compromise, so the
 * seeder refuses to create them whenever NODE_ENV=production - a default that
 * cannot be defeated by forgetting to set a flag.
 *
 * Create the first real administrator afterwards with:
 *   bun scripts/bootstrap-production-admin.ts
 */

// Set BEFORE importing the seeder: it reads these at module scope.
process.env.NODE_ENV = 'production';
process.env.SEED_DEMO_USERS = 'false';

console.log('=== Suraksha Labs production seed ===');
console.log('Seeding reference content only (curriculum, labs, diagrams, achievements).');
console.log('Demo accounts are DISABLED for this run.\n');

// Importing runs the seeder's own main(), which handles its own exit code.
await import('../apps/api/src/db/seed/index');
