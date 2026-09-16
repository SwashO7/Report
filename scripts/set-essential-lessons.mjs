/**
 * Promotes the curriculum's backbone lessons to importance 'essential'.
 *
 *   node scripts/set-essential-lessons.mjs
 *
 * Three tiers exist so the badge carries signal: 'essential' is badged "Must
 * know", 'core' is unbadged, 'optional' is badged "Optional". Badging everything
 * is the same as badging nothing, so this list stays deliberately short - the
 * topics a learner genuinely cannot skip without later lessons breaking.
 *
 * Idempotent. Editors can override any lesson afterwards in Admin -> Lessons.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join('apps', 'api', 'src', 'db', 'seed', 'curriculum');

const ESSENTIAL = new Set([
  // Foundations - how the internet actually works
  'what-is-a-computer-network',
  'ip-addresses',
  'ports',
  'tcp-and-udp',
  'packets-and-encapsulation',
  'dns',
  'http',
  'requests-and-responses',
  'headers',
  'https',
  'cookies',
  'sessions',
  'authentication-vs-authorization',
  'encoding-vs-encryption-vs-hashing',
  'command-line-basics',
  'rules-of-the-game',

  // Linux - the parts you use every single day
  'terminal-basics',
  'files-and-permissions',
  'ssh-basics',

  // Networking - the models and the handshakes
  'osi-model',
  'tcp-ip-model',
  'arp-deep-dive',
  'ipv4-addressing-deep',
  'subnetting-for-real',

  // Web security - the bug classes that pay
  'anatomy-of-a-web-app',
  'client-vs-server-trust',
  'where-bugs-come-from',
  'mapping-an-application',
  'sql-injection',
  'xss-cross-site-scripting',
  'access-control-basics',
  'idor',
  'session-hijacking-and-fixation',
  'jwt-attacks',

  // Crypto literacy
  'symmetric-vs-asymmetric',

  // Bug bounty - scope and reporting are not optional
  'reading-scope-like-a-lawyer',
  'responsible-disclosure',
  'writing-a-report-that-gets-paid',
]);

let promoted = 0;
let alreadyEssential = 0;
const seen = new Set();

for (const file of readdirSync(DIR).filter((f) => /^p\d[a-d]\.ts$/.test(f))) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');
  const lines = src.split(/\r?\n/);
  let currentSlug = null;
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const slugMatch = /^        slug: '([a-z0-9-]+)',$/.exec(lines[i]);
    if (slugMatch) {
      currentSlug = slugMatch[1];
      continue;
    }
    const impMatch = /^(\s*)importance: '(essential|core|optional)',$/.exec(lines[i]);
    if (impMatch && currentSlug && ESSENTIAL.has(currentSlug)) {
      seen.add(currentSlug);
      if (impMatch[2] === 'essential') {
        alreadyEssential++;
      } else {
        lines[i] = `${impMatch[1]}importance: 'essential',`;
        promoted++;
        changed = true;
      }
      currentSlug = null;
    }
  }

  if (changed) writeFileSync(path, lines.join('\n'), 'utf8');
}

const notFound = [...ESSENTIAL].filter((s) => !seen.has(s));
console.log(`promoted ${promoted} lesson(s) to essential (${alreadyEssential} already were)`);
if (notFound.length) {
  console.log(`not in the curriculum yet (will apply when authored): ${notFound.join(', ')}`);
}
