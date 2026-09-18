/**
 * Locates structural breaks in a curriculum part file by tracking bracket depth
 * outside string literals, then reporting the depth at every slug line.
 *
 *   node scripts/check-seed-structure.mjs apps/api/src/db/seed/curriculum/p4a.ts
 *
 * Expected depths inside `export const MODULES = [ ... ]`:
 *   module slug -> 2, lesson slug -> 4, block -> 5+
 * A slug reported at the wrong depth is at or just after the break.
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/check-seed-structure.mjs <file>');
  process.exit(2);
}

const src = readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);

let depth = 0;
let inBlockComment = false;
const report = [];
const trace = [];
let minDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const startDepth = depth;

  let quote = null;
  let escaped = false;

  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    const next = line[j + 1];

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        j++;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') break; // line comment
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      j++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    if (ch === '}' || ch === ']' || ch === ')') depth--;

    if (depth < minDepth) minDepth = depth;
  }

  const slug = /^\s*slug: '([a-z0-9-]+)',/.exec(line);
  if (slug) report.push({ line: i + 1, slug: slug[1], depth: startDepth });
  if (quote) report.push({ line: i + 1, slug: '(unterminated string)', depth: startDepth });

  const from = Number(process.argv[3]);
  const to = Number(process.argv[4]);
  if (from && to && i + 1 >= from && i + 1 <= to) {
    trace.push(`${String(i + 1).padStart(5)}  ${String(startDepth).padStart(2)} -> ${String(depth).padStart(2)}  ${line.slice(0, 70)}`);
  }
}

if (trace.length) {
  console.log('line-by-line depth trace:');
  console.log(trace.join('\n'));
  console.log('');
}

console.log(`final depth: ${depth} (should be 0)`);
if (minDepth < 0) console.log(`depth went NEGATIVE (${minDepth}) - there is an extra closing bracket`);

let expectedModule = null;
console.log('\nslug depths (module=2, lesson=4):');
for (const r of report) {
  const kind = r.depth === 2 ? 'module' : r.depth === 4 ? 'lesson' : `?? depth ${r.depth}`;
  const flag = r.depth === 2 || r.depth === 4 ? '   ' : '>> ';
  if (r.depth === 2) expectedModule = r.slug;
  console.log(`${flag}${String(r.line).padStart(5)}  ${kind.padEnd(12)} ${r.slug}`);
}
if (expectedModule === null) console.log('(no module-level slugs found at depth 2)');
