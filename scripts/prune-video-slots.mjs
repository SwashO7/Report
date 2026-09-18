/**
 * Removes the reserved video slot from lessons that do not need a video.
 *
 *   node scripts/prune-video-slots.mjs          # report only
 *   node scripts/prune-video-slots.mjs --apply  # edit the seed files
 *
 * A video slot is a promise to film something. Reserving one on all 162 lessons
 * meant a placeholder card on lessons where reading is simply better - law and
 * ethics, career advice, methodology, comparisons. This keeps the slot only where
 * watching beats reading (tool walkthroughs, live attack demos, protocol
 * exchanges, environment setup) and deletes the rest.
 *
 * The allowlist below is the policy. Editing it and re-running is how the policy
 * changes; an editor can also add or remove a video per lesson in Admin -> Lessons.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join('apps', 'api', 'src', 'db', 'seed', 'curriculum');
const APPLY = process.argv.includes('--apply');

/** Lessons where watching genuinely beats reading. Everything else loses its slot. */
const KEEP_VIDEO = new Set([
  /* Setup and first contact with the tools */
  'your-hacking-setup',
  'command-line-basics',
  'curl-basics',
  'nmap-first-scan',
  'burp-suite-first-launch',
  'browser-devtools',

  /* Protocol exchanges that animate well */
  'what-is-a-computer-network',
  'ports',
  'tcp-and-udp',
  'packets-and-encapsulation',
  'mac-addresses-and-arp',
  'dhcp-and-nat',
  'dns',
  'traceroute-and-ping',
  'http',
  'requests-and-responses',
  'https',
  'cookies',
  'sessions',
  'jwt-basics',
  'oauth-and-social-login',
  'base64-hex-url-encoding',

  /* Networking deep dive - the visual ones */
  'osi-model',
  'tcp-ip-model',
  'how-a-packet-travels',
  'ethernet-and-frames',
  'arp-deep-dive',
  'subnetting-for-real',
  'icmp-and-diagnostics',

  /* Linux - hands on a terminal */
  'terminal-basics',
  'navigating-the-filesystem',
  'reading-and-editing-files',
  'finding-files-and-text',
  'pipes-and-redirection',
  'files-and-permissions',
  'owners-groups-chmod',
  'processes-and-signals',
  'logs-and-journalctl',
  'ss-netstat-and-lsof',
  'ssh-basics',
  'transferring-files',
  'dns-tools-dig-nslookup',
  'your-first-bash-script',
  'loops-and-conditions',
  'bash-one-liners-for-hackers',
  'grep-sed-awk-crash-course',
  'windows-command-line',
  'powershell-basics',

  /* Web - live attack demos */
  'anatomy-of-a-web-app',
  'mapping-an-application',
  'spidering-and-content-discovery',
  'finding-hidden-parameters',
  'sql-injection',
  'sqli-hands-on',
  'blind-sql-injection',
  'command-injection',
  'template-injection-ssti',
  'xss-cross-site-scripting',
  'reflected-vs-stored-xss',
  'dom-xss',
  'xss-payloads-and-filters',
  'idor',
  'path-traversal',
  'forced-browsing',
  'password-attacks-and-brute-force',
  'session-hijacking-and-fixation',
  'jwt-attacks',
  'password-reset-flaws',
  'mfa-bypass',

  /* Cloud and containers - screen-following */
  's3-and-storage-misconfigs',
  'metadata-service-ssrf',
  'docker-basics-for-hackers',
  'intercepting-mobile-traffic',

  /* Proof craft is a demo */
  'proof-of-concept-craft',
]);

const files = readdirSync(DIR).filter((f) => /^p\d[a-d]\.ts$/.test(f));

let kept = 0;
let removed = 0;
const removedByFile = new Map();
const keptSlugs = new Set();

for (const file of files) {
  const path = join(DIR, file);
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const out = [];
  let currentSlug = null;
  let fileRemoved = 0;

  for (const line of lines) {
    const slugMatch = /^        slug: '([a-z0-9-]+)',$/.exec(line);
    if (slugMatch) currentSlug = slugMatch[1];

    if (/^\s*videoSlot\(/.test(line)) {
      if (currentSlug && KEEP_VIDEO.has(currentSlug)) {
        kept++;
        keptSlugs.add(currentSlug);
        out.push(line);
      } else {
        removed++;
        fileRemoved++;
        // Drop the line entirely - no video block for this lesson.
      }
      continue;
    }
    out.push(line);
  }

  if (fileRemoved) {
    removedByFile.set(file, fileRemoved);
    if (APPLY) {
      let src = out.join('\n');
      // The videoSlot import becomes unused once every slot in a file is gone.
      if (!/videoSlot\(/.test(src)) {
        src = src
          .replace(/^import \{ videoSlot \} from '\.\/types';\r?\n/m, '')
          .replace(/^(import \{[^}]*), videoSlot(\s*\} from '\.\/types';)$/m, '$1$2');
      }
      writeFileSync(path, src, 'utf8');
    }
  }
}

console.log(APPLY ? '=== APPLIED ===' : '=== DRY RUN (pass --apply to write) ===');
for (const [file, n] of [...removedByFile].sort()) console.log(`  ${file}: removed ${n}`);
console.log(`\nvideo slots kept:    ${kept}`);
console.log(`video slots removed: ${removed}`);

const missing = [...KEEP_VIDEO].filter((s) => !keptSlugs.has(s));
if (missing.length) {
  console.log(`\nallowlisted but not in the curriculum yet: ${missing.join(', ')}`);
}
