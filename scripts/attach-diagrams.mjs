/**
 * Inserts a diagram image block into each mapped lesson, immediately after the
 * lesson's video slot. Idempotent: a lesson that already has an image block for
 * that diagram is skipped, so this is safe to re-run.
 *
 *   node scripts/attach-diagrams.mjs
 *
 * Image blocks point at /api/v1/diagrams/<slug>, which the API serves from the
 * `diagrams` table. That means a content editor can swap the picture later in
 * Admin -> Diagrams without touching seed data or redeploying.
 *
 * Diagrams whose lesson does not exist yet are reported as pending rather than
 * silently dropped.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'apps', 'api', 'src', 'db', 'seed', 'curriculum');
const DIAGRAM_DIR = join(process.cwd(), 'apps', 'api', 'src', 'db', 'seed', 'diagrams');
const urlFor = (slug) => `/api/v1/diagrams/${slug}`;

/** lessonSlug -> [{ file, alt, caption }] */
const MAP = {
  'what-is-a-computer-network': [
    { file: 'network-basics', alt: 'Laptop to home router to ISP to web server, four hops', caption: 'Your data takes the same path an attacker would use.' },
  ],
  ports: [
    { file: 'ip-and-ports', alt: 'One IP address with numbered ports listed beside it', caption: 'The IP finds the machine. The port finds the service.' },
  ],
  'tcp-and-udp': [
    { file: 'tcp-vs-udp', alt: 'TCP confirming each packet beside UDP sending without confirmation', caption: 'TCP checks every packet arrived. UDP does not look back.' },
    { file: 'tcp-handshake', alt: 'SYN, SYN-ACK, ACK exchanged between client and server', caption: 'The three-way handshake - and the reason port scans work.' },
  ],
  'packets-and-encapsulation': [
    { file: 'encapsulation', alt: 'Your data nested inside TCP, IP and Ethernet layers', caption: 'Each layer is an envelope around the one above it.' },
  ],
  'mac-addresses-and-arp': [
    { file: 'arp-request', alt: 'A machine broadcasting who has this IP and one device replying', caption: 'ARP is a shout with no verification - which is the whole problem.' },
  ],
  'dhcp-and-nat': [
    { file: 'nat', alt: 'Three private devices behind a router sharing one public IP', caption: 'Many private addresses hide behind one public one.' },
  ],
  dns: [
    { file: 'dns-resolution', alt: 'Browser asking a resolver, which asks root, then .com, then the site nameserver', caption: 'A name becomes an address in about four questions.' },
  ],
  'traceroute-and-ping': [
    { file: 'traceroute-hops', alt: 'Packets with increasing TTL revealing each router along the path', caption: 'Each hop reveals itself by letting the packet expire.' },
  ],
  'subnetting-lite': [
    { file: 'subnet-mask', alt: 'An IP split into a network part and a host part', caption: 'The mask just marks where the network stops and hosts begin.' },
  ],
  'navigating-the-filesystem': [
    { file: 'linux-filesystem', alt: 'The Linux directory tree with etc, home, var, tmp and usr/bin', caption: 'One tree, no drive letters. These are the folders worth knowing.' },
  ],
  'files-and-permissions': [
    { file: 'linux-permissions', alt: 'The permission string broken into type, owner, group and everyone', caption: 'Learn to read this once and every Linux box gets easier.' },
  ],
  'pipes-and-redirection': [
    { file: 'pipes-redirection', alt: 'Output of one command flowing into the next through pipes', caption: 'Small tools chained together beat one big tool.' },
  ],
  'ssh-basics': [
    { file: 'ssh-key-auth', alt: 'Server challenging the client, which signs it with a private key', caption: 'Your private key never leaves your machine.' },
  ],
  'cloud-basics-for-hackers': [
    { file: 'cloud-shared-responsibility', alt: 'Customer responsibilities beside provider responsibilities', caption: 'The provider secures the building. You still secure your flat.' },
  ],
  'iam-and-privilege-issues': [
    { file: 'iam-privilege-chain', alt: 'A read-only key escalating step by step to full admin', caption: 'Every link looks minor. The chain is critical.' },
  ],
  'metadata-service-ssrf': [
    { file: 'metadata-ssrf', alt: 'An app tricked into fetching the cloud metadata address and returning credentials', caption: 'The server has access you do not - so you make it fetch for you.' },
  ],
  'case-study-idor': [
    { file: 'idor-flow', alt: 'Same user requesting their own invoice and then another user record', caption: 'One changed number. The check that was missing is the finding.' },
  ],
  'symmetric-vs-asymmetric': [
    { file: 'symmetric-vs-asymmetric', alt: 'One shared key beside a public and private key pair', caption: 'One shared secret, or a pair where only half is secret.' },
  ],
  'common-crypto-mistakes': [
    { file: 'hashing-vs-encryption', alt: 'Encoding, encryption and hashing compared side by side', caption: 'Mixing these three up is the most common crypto bug there is.' },
  ],
  'linux-privesc-basics': [
    { file: 'privesc-ladder', alt: 'A low privilege shell climbing through misconfigurations to root', caption: 'Nobody hands you root. You climb small mistakes.' },
  ],
  'a-repeatable-hunting-workflow': [
    { file: 'bug-bounty-lifecycle', alt: 'Recon, test, prove, report, triage, bounty as a six step flow', caption: 'Most people optimise the first two steps. The money is in the middle.' },
  ],

  /* ---- The Web / identity (Foundations part B) ---- */
  http: [
    { file: 'http-request-response', alt: 'A request with method, path and headers beside a response with status and headers', caption: 'One request, one response. Everything on the web is this.' },
  ],
  cookies: [
    { file: 'cookies-and-sessions', alt: 'Login exchanging a password for a session cookie the browser reuses', caption: 'The cookie is your wristband. HTTP itself remembers nothing.' },
  ],
  'jwt-basics': [
    { file: 'jwt-anatomy', alt: 'A JWT split into header, payload and signature with decoded contents', caption: 'Base64, not encryption. Anyone can read the payload.' },
  ],
  'oauth-and-social-login': [
    { file: 'oauth-flow', alt: 'User, app and Google exchanging a redirect, a code and then a token', caption: 'Your password never reaches the app. A code does.' },
  ],

  /* ---- Networking ---- */
  'osi-model': [
    { file: 'osi-layers', alt: 'The seven OSI layers with the protocols and attacks at each', caption: 'Use it to ask which layer a bug lives on.' },
  ],
  'subnetting-for-real': [
    { file: 'subnet-mask', alt: 'An IP split into a network part and a host part', caption: 'The mask marks where the network stops and hosts begin.' },
  ],

  /* ---- Web security ---- */
  'sql-injection': [
    { file: 'sqli-flow', alt: 'A safe query beside the same query broken by an injected quote', caption: 'Close the quote and your input becomes logic.' },
  ],
  'xss-cross-site-scripting': [
    { file: 'xss-types', alt: 'Reflected, stored and DOM XSS compared by where the payload lives', caption: 'Same root cause, three delivery routes.' },
  ],
  idor: [
    { file: 'idor-flow', alt: 'Same user requesting their own record and then another user record', caption: 'One number changed. The missing check is the finding.' },
  ],
  'jwt-attacks': [
    { file: 'jwt-anatomy', alt: 'A JWT split into header, payload and signature with decoded contents', caption: 'Attack the header and the signature check, not the base64.' },
  ],
  'writing-a-report-that-gets-paid': [
    { file: 'report-anatomy', alt: 'The six sections of a good vulnerability report in order', caption: 'This shape gets read. A wall of text gets queued.' },
  ],
  'impact-storytelling-and-severity': [
    { file: 'severity-matrix', alt: 'Impact plotted against ease of exploitation with example findings', caption: 'Severity is impact times how easily anyone can do it.' },
  ],
};

const files = readdirSync(DIR).filter((f) => /^p\d[a-d]\.ts$/.test(f));
const found = new Set();
let inserted = 0;
let skipped = 0;
const missingAssets = [];

for (const f of files) {
  const path = join(DIR, f);
  let src = readFileSync(path, 'utf8');
  let changed = false;

  // Migrate any legacy static-file references to the DB-backed endpoint.
  const migrated = src.replace(/'\/diagrams\/([a-z0-9-]+)\.svg'/g, (_m, slug) => `'${urlFor(slug)}'`);
  if (migrated !== src) {
    src = migrated;
    changed = true;
  }

  for (const [slug, diagrams] of Object.entries(MAP)) {
    const slugIdx = src.indexOf(`slug: '${slug}',`);
    if (slugIdx === -1) continue;
    found.add(slug);

    const vsIdx = src.indexOf('videoSlot(', slugIdx);
    if (vsIdx === -1) {
      console.log(`  ! ${slug}: no videoSlot found, skipped`);
      continue;
    }
    const lineEnd = src.indexOf('\n', vsIdx);
    if (lineEnd === -1) continue;

    // Already attached? Look only inside this lesson's immediate block window.
    const window = src.slice(lineEnd, lineEnd + 1200);
    const toAdd = diagrams.filter((d) => !window.includes(urlFor(d.file)));
    skipped += diagrams.length - toAdd.length;
    if (toAdd.length === 0) continue;

    for (const d of toAdd) {
      if (!existsSync(join(DIAGRAM_DIR, `${d.file}.svg`))) {
        missingAssets.push(d.file);
        continue;
      }
    }
    const usable = toAdd.filter((d) => existsSync(join(DIAGRAM_DIR, `${d.file}.svg`)));
    if (usable.length === 0) continue;

    const blocks = usable
      .map(
        (d) =>
          `\n          {\n            type: 'image',\n            src: '${urlFor(d.file)}',\n            alt: '${d.alt.replace(/'/g, "\\'")}',\n            caption: '${d.caption.replace(/'/g, "\\'")}',\n          },`,
      )
      .join('');

    src = src.slice(0, lineEnd) + blocks + src.slice(lineEnd);
    inserted += usable.length;
    changed = true;
  }

  if (changed) writeFileSync(path, src, 'utf8');
}

const pending = Object.keys(MAP).filter((s) => !found.has(s));
const allDiagrams = readdirSync(DIAGRAM_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', ''));
const usedDiagrams = new Set(Object.values(MAP).flat().map((d) => d.file));
const unused = allDiagrams.filter((d) => !usedDiagrams.has(d));

console.log(`inserted ${inserted} diagram block(s), ${skipped} already present`);
if (pending.length) console.log(`lessons not written yet (diagram waits for them): ${pending.join(', ')}`);
if (missingAssets.length) console.log(`missing SVG assets: ${[...new Set(missingAssets)].join(', ')}`);
if (unused.length) console.log(`diagrams ready but unattached: ${unused.join(', ')}`);
