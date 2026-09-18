/**
 * Reports the lesson slugs each part file contains, and flags any slug that the
 * plan lists but no file provides. Used to catch a lesson silently dropped by a
 * rewrite.
 *
 *   node scripts/audit-lesson-coverage.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join('apps', 'api', 'src', 'db', 'seed', 'curriculum');

const files = readdirSync(DIR).filter((f) => /^p\d[a-d]\.ts$/.test(f)).sort();
const inFiles = new Map();

for (const f of files) {
  const src = readFileSync(join(DIR, f), 'utf8');
  const slugs = [...src.matchAll(/^        slug: '([a-z0-9-]+)',$/gm)].map((m) => m[1]);
  inFiles.set(f, slugs);
  console.log(`${f}: ${slugs.length} lessons`);
}

const all = [...inFiles.values()].flat();
console.log(`\ntotal lessons in files: ${all.length}`);

const dupes = all.filter((s, i) => all.indexOf(s) !== i);
if (dupes.length) console.log(`DUPLICATE slugs: ${[...new Set(dupes)].join(', ')}`);

/* Cross-check against the plan: every "- `slug` -" bullet in _PLAN.md. */
const plan = readFileSync(join(DIR, '_PLAN.md'), 'utf8');
const planned = new Map();
let currentFile = null;
for (const line of plan.split(/\r?\n/)) {
  const h = /^## (p\d[a-d])\.ts/.exec(line);
  if (h) currentFile = `${h[1]}.ts`;
  const b = /^- `([a-z0-9-]+)`/.exec(line);
  // Plan bullets also list exercise slugs; those are not lessons.
  if (b && currentFile && !b[1].endsWith('-quiz')) {
    const arr = planned.get(currentFile) ?? [];
    arr.push(b[1]);
    planned.set(currentFile, arr);
  }
}

let problems = 0;
for (const [f, slugs] of inFiles) {
  const want = planned.get(f);
  if (!want) continue;
  const have = new Set(slugs);
  const missing = want.filter((s) => !have.has(s));
  const extra = slugs.filter((s) => !want.includes(s));
  if (missing.length) {
    console.log(`\n${f} MISSING from the plan: ${missing.join(', ')}`);
    problems++;
  }
  if (extra.length) {
    console.log(`\n${f} NOT in the plan: ${extra.join(', ')}`);
    problems++;
  }
}

console.log(problems ? `\n${problems} coverage problem(s)` : '\nCoverage matches the plan for every authored file.');
