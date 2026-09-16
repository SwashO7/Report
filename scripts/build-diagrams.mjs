/**
 * Diagram generator for Suraksha Labs lessons.
 *
 *   node scripts/build-diagrams.mjs
 *
 * Writes themed SVGs plus a manifest into apps/api/src/db/seed/diagrams/.
 * The seeder loads that folder into the `diagrams` table, which is what the app
 * actually serves (GET /api/v1/diagrams/:slug). After seeding, the DATABASE is
 * the source of truth: content editors change diagrams in Admin -> Diagrams, and
 * re-running the seed will not overwrite their edits.
 *
 * Use this script to author a new diagram in code, or ignore it entirely and
 * upload one from the admin panel.
 *
 * Colours come from the dark theme in apps/web/src/styles/globals.css.
 * Diagrams are deliberately simple: a handful of labelled boxes and arrows.
 * If a diagram needs a paragraph of explanation to make sense, it is too busy.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'apps', 'api', 'src', 'db', 'seed', 'diagrams');
mkdirSync(OUT, { recursive: true });

const C = {
  surface: '#1b1e19',
  surface2: '#22261f',
  border: '#3d443a',
  text: '#eceae6',
  dim: '#a8a49c',
  faint: '#77746c',
  accent: '#43bd97',
  accentSoft: '#1d2f28',
  warn: '#dbaa3c',
  warnSoft: '#2d2413',
  danger: '#e56767',
  dangerSoft: '#301718',
  ok: '#52b788',
  okSoft: '#17281f',
};

const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" font-family="${FONT}">
<defs>
<marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="${C.dim}"/></marker>
<marker id="aA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="${C.accent}"/></marker>
<marker id="aD" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="${C.danger}"/></marker>
<marker id="aW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="${C.warn}"/></marker>
</defs>
${body}
</svg>`;
}

const MARK = { [C.dim]: 'a', [C.accent]: 'aA', [C.danger]: 'aD', [C.warn]: 'aW' };

/** A rounded box with a bold label and up to two smaller lines under it. */
function box(x, y, w, h, label, opts = {}) {
  const { sub, sub2, color = C.border, fill = C.surface2, mono = false, labelSize = 14 } = opts;
  const lines = [sub, sub2].filter(Boolean);
  const cy = y + h / 2;
  const labelY = lines.length === 0 ? cy + 5 : lines.length === 1 ? cy - 3 : cy - 10;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${color}" stroke-width="1.5"/>`;
  out += `<text x="${x + w / 2}" y="${labelY}" text-anchor="middle" font-size="${labelSize}" font-weight="600" fill="${C.text}"${mono ? ` font-family="${MONO}"` : ''}>${esc(label)}</text>`;
  lines.forEach((l, i) => {
    out += `<text x="${x + w / 2}" y="${labelY + 17 + i * 15}" text-anchor="middle" font-size="11.5" fill="${C.dim}">${esc(l)}</text>`;
  });
  return out;
}

function arrow(x1, y1, x2, y2, opts = {}) {
  const { label, color = C.dim, dashed = false, labelDy = -8, both = false } = opts;
  const m = MARK[color] ?? 'a';
  let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 4"' : ''} marker-end="url(#${m})"${both ? ` marker-start="url(#${m})"` : ''}/>`;
  if (label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    out += `<text x="${mx}" y="${my + labelDy}" text-anchor="middle" font-size="11.5" fill="${color}">${esc(label)}</text>`;
  }
  return out;
}

function label(x, y, text, opts = {}) {
  const { size = 12, color = C.dim, anchor = 'middle', weight = 400, mono = false } = opts;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}"${mono ? ` font-family="${MONO}"` : ''}>${esc(text)}</text>`;
}

function title(x, y, text) {
  return label(x, y, text, { size: 13, color: C.faint, weight: 600 });
}

function zone(x, y, w, h, text, color = C.border) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${color}" stroke-width="1.2" stroke-dasharray="6 5"/>` +
    label(x + 10, y + 18, text, { anchor: 'start', size: 11.5, color, weight: 600 })
  );
}

const D = {};

/* ------------------------------------------------------------------ network */

D['network-basics'] = svg(880, 220, [
  title(440, 24, 'Your data crosses four hops to reach a server'),
  box(20, 60, 150, 80, 'Your laptop', { sub: '192.168.1.10', color: C.accent }),
  box(240, 60, 150, 80, 'Home router', { sub: 'gives out local IPs', sub2: 'one public IP' }),
  box(460, 60, 150, 80, 'Your ISP', { sub: 'routes toward the target' }),
  box(680, 60, 180, 80, 'Web server', { sub: '142.250.72.14', color: C.accent }),
  arrow(170, 100, 240, 100),
  arrow(390, 100, 460, 100),
  arrow(610, 100, 680, 100),
  label(440, 180, 'Every attack in history travelled a path like this one.', { size: 12, color: C.faint }),
].join('\n'));

D['ip-and-ports'] = svg(880, 300, [
  title(440, 24, 'The IP finds the building. The port finds the flat.'),
  `<rect x="40" y="60" width="260" height="190" rx="8" fill="${C.accentSoft}" stroke="${C.accent}" stroke-width="1.5"/>`,
  label(170, 92, '142.250.72.14', { size: 16, color: C.text, weight: 600, mono: true }),
  label(170, 113, 'one machine, one address', { size: 11.5, color: C.dim }),
  box(70, 130, 200, 40, ':443  HTTPS', { mono: true, labelSize: 13 }),
  box(70, 180, 200, 40, ':22  SSH', { mono: true, labelSize: 13 }),
  box(400, 60, 200, 46, 'Port 80', { sub: 'plain HTTP', mono: true }),
  box(400, 118, 200, 46, 'Port 443', { sub: 'encrypted HTTPS', mono: true, color: C.accent }),
  box(400, 176, 200, 46, 'Port 3306', { sub: 'MySQL - should be internal', mono: true, color: C.warn }),
  box(400, 234, 200, 46, 'Port 8080', { sub: 'forgotten dev server', mono: true, color: C.danger }),
  label(740, 130, 'Open port =', { size: 12.5, color: C.text, weight: 600 }),
  label(740, 150, 'software listening', { size: 12, color: C.dim }),
  label(740, 170, 'Software listening =', { size: 12.5, color: C.text, weight: 600 }),
  label(740, 190, 'attack surface', { size: 12, color: C.warn }),
].join('\n'));

D['tcp-handshake'] = svg(880, 300, [
  title(440, 24, 'TCP three-way handshake: agree before you talk'),
  box(60, 50, 160, 44, 'Client', { color: C.accent }),
  box(660, 50, 160, 44, 'Server', { color: C.accent }),
  `<line x1="140" y1="94" x2="140" y2="270" stroke="${C.border}" stroke-width="1.2" stroke-dasharray="4 4"/>`,
  `<line x1="740" y1="94" x2="740" y2="270" stroke="${C.border}" stroke-width="1.2" stroke-dasharray="4 4"/>`,
  arrow(140, 130, 740, 130, { label: '1. SYN  - "can we talk?"', color: C.accent }),
  arrow(740, 180, 140, 180, { label: '2. SYN-ACK  - "yes, and you?"', color: C.accent }),
  arrow(140, 230, 740, 230, { label: '3. ACK  - "confirmed"', color: C.accent }),
  label(440, 268, 'Connection established. Now data flows.', { size: 12, color: C.faint }),
].join('\n'));

D['tcp-vs-udp'] = svg(880, 320, [
  title(440, 24, 'TCP checks every letter arrived. UDP just shouts.'),
  zone(20, 40, 410, 260, 'TCP - reliable, ordered, slower', C.accent),
  box(50, 80, 140, 44, 'Sender', { color: C.accent }),
  box(260, 80, 140, 44, 'Receiver', { color: C.accent }),
  arrow(190, 102, 260, 102, { color: C.accent }),
  label(225, 140, 'packet 1', { size: 11, color: C.dim }),
  arrow(260, 165, 190, 165, { label: 'got it', color: C.accent, labelDy: -6 }),
  label(225, 205, 'packet 2 lost?', { size: 11, color: C.warn }),
  arrow(50, 235, 400, 235, { label: 'resend until confirmed', color: C.accent }),
  label(225, 275, 'Web pages, logins, file transfers', { size: 11.5, color: C.dim }),
  zone(450, 40, 410, 260, 'UDP - fast, no guarantees', C.warn),
  box(480, 80, 140, 44, 'Sender', { color: C.warn }),
  box(690, 80, 140, 44, 'Receiver', { color: C.warn }),
  arrow(620, 102, 690, 102, { color: C.warn }),
  arrow(620, 145, 690, 145, { color: C.warn }),
  arrow(620, 188, 690, 188, { color: C.warn }),
  label(655, 122, 'no ACK', { size: 10.5, color: C.faint }),
  label(655, 232, 'dropped packets stay dropped', { size: 11, color: C.danger }),
  label(655, 275, 'Video calls, games, DNS', { size: 11.5, color: C.dim }),
].join('\n'));

/** Nested "envelope" frame: label sits top-left inside, so nesting never collides. */
function shell(x, y, w, h, name, meta, color) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${color}" stroke-width="1.5"/>` +
    label(x + 12, y + 20, name, { anchor: 'start', size: 12.5, color, weight: 600 }) +
    label(x + 12, y + 38, meta, { anchor: 'start', size: 11, color: C.faint, mono: true })
  );
}

D['encapsulation'] = svg(880, 330, [
  title(440, 24, 'Each layer wraps the one above it, like envelopes'),
  shell(30, 44, 820, 250, 'Ethernet frame', 'MAC source + destination', C.faint),
  shell(80, 96, 720, 186, 'IP packet', 'IP source + destination', C.dim),
  shell(130, 148, 620, 122, 'TCP segment', 'ports, sequence numbers', C.accent),
  box(180, 200, 520, 52, 'Your actual data', { sub: 'GET /login HTTP/1.1', color: C.accent, fill: C.accentSoft, labelSize: 13 }),
  label(440, 316, 'Routers read the outside. Only the server opens the inside.', { size: 12, color: C.faint }),
].join('\n'));

D['arp-request'] = svg(880, 260, [
  title(440, 24, 'ARP: shouting across the room to find a MAC address'),
  box(40, 70, 170, 70, 'You', { sub: '192.168.1.10', color: C.accent }),
  box(360, 60, 170, 44, 'Laptop B', { sub: '192.168.1.11' }),
  box(360, 118, 170, 44, 'Printer', { sub: '192.168.1.12' }),
  box(360, 176, 170, 44, 'Router', { sub: '192.168.1.1', color: C.accent }),
  arrow(210, 105, 355, 82, { label: 'who has .1.1?', color: C.dim, labelDy: -6 }),
  arrow(210, 105, 355, 140, { color: C.dim }),
  arrow(210, 105, 355, 198, { color: C.dim }),
  arrow(530, 198, 695, 198, { color: C.accent }),
  box(700, 176, 150, 44, 'I do!', { sub: 'aa:bb:cc:11:22:33', color: C.accent, fill: C.accentSoft }),
  label(440, 245, 'Nothing verifies the answer - which is why ARP spoofing works.', { size: 12, color: C.warn }),
].join('\n'));

D['nat'] = svg(880, 300, [
  title(440, 24, 'NAT: many private devices, one public address'),
  zone(20, 45, 360, 210, 'Your home network - private, not routable', C.accent),
  box(50, 80, 150, 40, 'Laptop', { sub: '192.168.1.10', mono: false }),
  box(50, 135, 150, 40, 'Phone', { sub: '192.168.1.11' }),
  box(50, 190, 150, 40, 'Smart TV', { sub: '192.168.1.12' }),
  box(240, 120, 120, 70, 'Router', { sub: 'rewrites', sub2: 'addresses', color: C.accent }),
  arrow(200, 100, 240, 140),
  arrow(200, 155, 240, 155),
  arrow(200, 210, 240, 172),
  arrow(390, 155, 470, 155, { label: 'all traffic looks like', color: C.accent, labelDy: -12 }),
  box(470, 120, 190, 70, '203.0.113.45', { sub: 'one public IP', mono: true, color: C.accent, fill: C.accentSoft }),
  arrow(660, 155, 720, 155),
  box(720, 120, 140, 70, 'Internet', { color: C.faint }),
  label(440, 288, 'The whole internet sees one address. The router remembers who asked.', { size: 12, color: C.faint }),
].join('\n'));

D['dns-resolution'] = svg(880, 300, [
  title(440, 24, 'DNS: turning a name into an address, in four questions'),
  box(30, 110, 130, 60, 'Browser', { sub: 'wants site.com', color: C.accent }),
  box(210, 110, 140, 60, 'Resolver', { sub: 'your ISP or 1.1.1.1' }),
  box(410, 40, 140, 52, 'Root server', { sub: 'ask .com' }),
  box(410, 118, 140, 52, '.com server', { sub: 'ask site.com' }),
  box(410, 196, 140, 52, 'site.com NS', { sub: 'the answer', color: C.accent }),
  box(650, 110, 200, 60, '93.184.216.34', { mono: true, color: C.accent, fill: C.accentSoft }),
  arrow(160, 140, 210, 140),
  arrow(350, 130, 405, 70, { color: C.dim }),
  arrow(350, 140, 405, 144, { color: C.dim }),
  arrow(350, 152, 405, 218, { color: C.accent }),
  arrow(550, 222, 620, 175, { color: C.accent }),
  arrow(650, 140, 600, 140, { color: C.accent, label: '' }),
  label(440, 285, 'Answers get cached, which is why a DNS change takes time to spread.', { size: 12, color: C.faint }),
].join('\n'));

D['traceroute-hops'] = svg(880, 200, [
  title(440, 24, 'Traceroute: each hop reports itself by expiring on purpose'),
  box(20, 70, 130, 60, 'You', { color: C.accent }),
  box(190, 70, 130, 60, 'Hop 1', { sub: 'home router' }),
  box(360, 70, 130, 60, 'Hop 2', { sub: 'ISP edge' }),
  box(530, 70, 130, 60, 'Hop 3', { sub: 'backbone' }),
  box(700, 70, 160, 60, 'Target', { color: C.accent }),
  arrow(150, 100, 190, 100),
  arrow(320, 100, 360, 100),
  arrow(490, 100, 530, 100),
  arrow(660, 100, 700, 100),
  label(255, 155, 'TTL=1', { size: 11, color: C.warn, mono: true }),
  label(425, 155, 'TTL=2', { size: 11, color: C.warn, mono: true }),
  label(595, 155, 'TTL=3', { size: 11, color: C.warn, mono: true }),
  label(440, 185, 'A hop that times out is usually a firewall, not a broken network.', { size: 12, color: C.faint }),
].join('\n'));

D['subnet-mask'] = svg(880, 260, [
  title(440, 24, 'A mask just says where the network ends and hosts begin'),
  label(60, 70, '192.168.1.10 / 24', { anchor: 'start', size: 16, color: C.text, weight: 600, mono: true }),
  box(60, 95, 480, 50, '', { color: C.accent, fill: C.accentSoft }),
  label(300, 126, '192.168.1  =  the network', { size: 14, color: C.accent, weight: 600, mono: true }),
  box(560, 95, 260, 50, '', { color: C.warn, fill: C.warnSoft }),
  label(690, 126, '.10  =  this host', { size: 14, color: C.warn, weight: 600, mono: true }),
  label(300, 170, '24 bits locked', { size: 11.5, color: C.dim }),
  label(690, 170, '8 bits free = 254 usable hosts', { size: 11.5, color: C.dim }),
  box(60, 195, 360, 44, '/16  =  65,534 hosts', { sub: 'big corporate network', mono: true, labelSize: 13 }),
  box(460, 195, 360, 44, '/32  =  exactly one host', { sub: 'a single machine', mono: true, labelSize: 13 }),
].join('\n'));

/* -------------------------------------------------------------------- linux */

D['linux-permissions'] = svg(880, 290, [
  title(440, 24, 'Read -rwxr-xr-- once and you can read them all'),
  label(120, 78, '-', { size: 30, color: C.faint, mono: true }),
  label(240, 78, 'rwx', { size: 30, color: C.accent, mono: true }),
  label(420, 78, 'r-x', { size: 30, color: C.warn, mono: true }),
  label(600, 78, 'r--', { size: 30, color: C.dim, mono: true }),
  box(70, 100, 100, 62, 'type', { sub: '- file', sub2: 'd directory', color: C.faint, labelSize: 12 }),
  box(190, 100, 100, 62, 'owner', { sub: 'read write', sub2: 'execute', color: C.accent, labelSize: 12 }),
  box(370, 100, 100, 62, 'group', { sub: 'read', sub2: 'execute', color: C.warn, labelSize: 12 }),
  box(550, 100, 100, 62, 'everyone', { sub: 'read only', color: C.dim, labelSize: 12 }),
  box(700, 100, 150, 62, 'Numeric', { sub: 'r=4 w=2 x=1', sub2: 'rwxr-xr-- = 754', labelSize: 12 }),
  label(440, 205, 'On a directory, x means "may enter", not "may run".', { size: 12.5, color: C.text }),
  label(440, 232, 'World-writable files and stray SUID bits are how a low user becomes root.', { size: 12, color: C.warn }),
  label(440, 262, 'chmod 640 secrets.txt   ->   owner reads and writes, group reads, others nothing', { size: 11.5, color: C.dim, mono: true }),
].join('\n'));

D['linux-filesystem'] = svg(880, 300, [
  title(440, 24, 'The folders that actually matter to you'),
  box(360, 45, 160, 40, '/', { sub: 'the root of everything', mono: true, color: C.accent }),
  box(30, 120, 150, 52, '/etc', { sub: 'config + passwd', mono: true, color: C.warn }),
  box(200, 120, 150, 52, '/home', { sub: 'user files, keys', mono: true, color: C.warn }),
  box(370, 120, 150, 52, '/var', { sub: 'logs live here', mono: true }),
  box(540, 120, 150, 52, '/tmp', { sub: 'world-writable', mono: true, color: C.danger }),
  box(710, 120, 140, 52, '/usr/bin', { sub: 'programs', mono: true }),
  arrow(400, 85, 120, 118, { color: C.border }),
  arrow(420, 85, 270, 118, { color: C.border }),
  arrow(440, 85, 445, 118, { color: C.border }),
  arrow(460, 85, 600, 118, { color: C.border }),
  arrow(480, 85, 770, 118, { color: C.border }),
  box(30, 210, 400, 60, 'First places to look on a new box', { sub: '/etc/passwd  /home/*/.ssh  /var/log/auth.log', mono: false, color: C.accent, labelSize: 13 }),
  box(460, 210, 390, 60, 'No drive letters', { sub: 'everything hangs off one tree, including USB sticks', labelSize: 13 }),
].join('\n'));

D['pipes-redirection'] = svg(880, 250, [
  title(440, 24, 'A pipe feeds one command\u2019s output into the next one\u2019s input'),
  box(30, 70, 170, 56, 'cat access.log', { mono: true, color: C.accent, labelSize: 13 }),
  box(250, 70, 170, 56, 'grep 500', { sub: 'keep error lines', mono: true, labelSize: 13 }),
  box(470, 70, 170, 56, 'wc -l', { sub: 'count them', mono: true, labelSize: 13 }),
  box(690, 70, 160, 56, '42', { sub: 'your answer', color: C.accent, fill: C.accentSoft, labelSize: 13 }),
  arrow(200, 98, 250, 98, { label: '|', color: C.accent, labelDy: -10 }),
  arrow(420, 98, 470, 98, { label: '|', color: C.accent, labelDy: -10 }),
  arrow(640, 98, 690, 98, { color: C.accent }),
  box(30, 160, 390, 60, '>  overwrites a file', { sub: 'cmd > out.txt   destroys what was there', mono: false, color: C.warn, labelSize: 13 }),
  box(460, 160, 390, 60, '>>  appends to a file', { sub: 'cmd >> out.txt   adds to the end', color: C.ok, labelSize: 13 }),
].join('\n'));

D['ssh-key-auth'] = svg(880, 280, [
  title(440, 24, 'Key auth: the private key never leaves your laptop'),
  box(40, 70, 200, 80, 'Your laptop', { sub: '~/.ssh/id_ed25519', sub2: 'PRIVATE - never share', color: C.accent }),
  box(640, 70, 200, 80, 'Server', { sub: '~/.ssh/authorized_keys', sub2: 'holds your PUBLIC key', color: C.accent }),
  arrow(240, 95, 640, 95, { label: '1. I am this public key', color: C.dim }),
  arrow(640, 130, 240, 130, { label: '2. sign this random challenge', color: C.dim }),
  arrow(240, 190, 640, 190, { label: '3. signature (proves you hold the private key)', color: C.accent }),
  box(300, 215, 280, 46, 'Logged in', { sub: 'no password ever sent', color: C.ok, fill: C.okSoft, labelSize: 13 }),
  label(440, 55, 'Passwords can be guessed. A 256-bit key cannot.', { size: 11.5, color: C.faint }),
].join('\n'));

/* -------------------------------------------------------------------- cloud */

D['cloud-shared-responsibility'] = svg(880, 260, [
  title(440, 24, 'The cloud secures itself. Your side is still yours.'),
  box(30, 50, 400, 190, '', { color: C.accent, fill: 'none' }),
  label(230, 75, 'YOUR responsibility', { size: 13, color: C.accent, weight: 600 }),
  box(55, 90, 350, 34, 'Who can access what (IAM)', { labelSize: 12.5 }),
  box(55, 132, 350, 34, 'Bucket and database permissions', { labelSize: 12.5 }),
  box(55, 174, 350, 34, 'Your application code and secrets', { labelSize: 12.5 }),
  box(450, 50, 400, 190, '', { color: C.faint, fill: 'none' }),
  label(650, 75, 'THE PROVIDER\u2019S responsibility', { size: 13, color: C.faint, weight: 600 }),
  box(475, 90, 350, 34, 'Physical data centres', { labelSize: 12.5, color: C.faint }),
  box(475, 132, 350, 34, 'Hypervisor and host patching', { labelSize: 12.5, color: C.faint }),
  box(475, 174, 350, 34, 'Network hardware', { labelSize: 12.5, color: C.faint }),
  label(230, 228, 'Nearly every cloud breach happens here', { size: 11.5, color: C.warn }),
].join('\n'));

D['metadata-ssrf'] = svg(880, 300, [
  title(440, 24, 'SSRF to cloud keys: the server fetches a URL you chose'),
  box(20, 90, 150, 66, 'Attacker', { sub: 'no cloud access', color: C.danger }),
  box(250, 90, 210, 66, 'Vulnerable app', { sub: 'fetches any URL you give it', color: C.warn }),
  box(560, 40, 290, 66, '169.254.169.254', { sub: 'cloud metadata service', mono: true, color: C.danger, fill: C.dangerSoft }),
  box(560, 145, 290, 66, 'Normal website', { sub: 'what the feature was for' }),
  arrow(170, 123, 250, 123, { label: 'url=...', color: C.danger, labelDy: -8 }),
  arrow(460, 110, 555, 75, { color: C.danger }),
  arrow(460, 140, 555, 175, { color: C.faint, dashed: true }),
  arrow(700, 106, 700, 140, { color: C.border, dashed: true }),
  box(250, 230, 600, 54, 'Response: temporary IAM credentials for the whole instance', { color: C.danger, fill: C.dangerSoft, labelSize: 13 }),
  arrow(560, 73, 360, 228, { color: C.danger, dashed: true }),
  label(140, 262, 'Only test apps you', { size: 11.5, color: C.faint }),
  label(140, 280, 'own or are authorised on.', { size: 11.5, color: C.faint }),
].join('\n'));

D['iam-privilege-chain'] = svg(880, 250, [
  title(440, 24, 'One over-permissive role is the whole account'),
  box(20, 80, 150, 60, 'Leaked key', { sub: 'read-only, "harmless"', color: C.warn }),
  box(220, 80, 170, 60, 'Can list roles', { sub: 'iam:ListRoles' , mono: false}),
  box(440, 80, 180, 60, 'Can assume a role', { sub: 'sts:AssumeRole', color: C.warn }),
  box(670, 80, 180, 60, 'Admin', { sub: 'full account', color: C.danger, fill: C.dangerSoft }),
  arrow(170, 110, 220, 110, { color: C.warn }),
  arrow(390, 110, 440, 110, { color: C.warn }),
  arrow(620, 110, 670, 110, { color: C.danger }),
  label(440, 180, 'Each step alone looks low severity. The chain is critical.', { size: 12.5, color: C.text }),
  label(440, 208, 'This is why you always report the chain, not the first link.', { size: 12, color: C.accent }),
].join('\n'));

/* --------------------------------------------------------------------- web */

D['http-request-response'] = svg(880, 340, [
  title(440, 24, 'Every web interaction is one request and one response'),
  box(20, 60, 400, 250, '', { color: C.accent, fill: 'none' }),
  label(220, 84, 'REQUEST  (you -> server)', { size: 12.5, color: C.accent, weight: 600 }),
  label(45, 112, 'GET /account?id=7 HTTP/1.1', { anchor: 'start', size: 12.5, color: C.text, mono: true }),
  label(45, 138, 'Host: shop.example.com', { anchor: 'start', size: 12, color: C.dim, mono: true }),
  label(45, 160, 'Cookie: session=abc123', { anchor: 'start', size: 12, color: C.warn, mono: true }),
  label(45, 182, 'User-Agent: Mozilla/5.0', { anchor: 'start', size: 12, color: C.dim, mono: true }),
  box(45, 205, 350, 42, 'method + path + headers', { sub: 'anything here is attacker-controlled', color: C.warn, labelSize: 12.5 }),
  label(220, 280, 'Change ?id=7 to ?id=8 and you have tested an IDOR.', { size: 11.5, color: C.accent }),
  box(460, 60, 400, 250, '', { color: C.faint, fill: 'none' }),
  label(660, 84, 'RESPONSE  (server -> you)', { size: 12.5, color: C.faint, weight: 600 }),
  label(485, 112, 'HTTP/1.1 200 OK', { anchor: 'start', size: 12.5, color: C.ok, mono: true }),
  label(485, 138, 'Content-Type: text/html', { anchor: 'start', size: 12, color: C.dim, mono: true }),
  label(485, 160, 'Set-Cookie: session=abc123', { anchor: 'start', size: 12, color: C.warn, mono: true }),
  label(485, 182, 'Server: nginx/1.24.0', { anchor: 'start', size: 12, color: C.danger, mono: true }),
  box(485, 205, 350, 42, 'status + headers + body', { sub: 'leaky headers are free findings', color: C.danger, labelSize: 12.5 }),
  label(660, 280, '2xx worked  3xx moved  4xx your fault  5xx their fault', { size: 11.5, color: C.dim }),
].join('\n'));

D['cookies-and-sessions'] = svg(880, 300, [
  title(440, 24, 'HTTP forgets you instantly. A cookie is the wristband.'),
  box(30, 70, 170, 60, 'You log in', { sub: 'email + password', color: C.accent }),
  box(280, 70, 200, 60, 'Server checks it', { sub: 'stores a session row' }),
  box(560, 70, 290, 60, 'Set-Cookie: session=abc123', { mono: true, color: C.accent, fill: C.accentSoft, labelSize: 12.5 }),
  arrow(200, 100, 280, 100),
  arrow(480, 100, 560, 100, { color: C.accent }),
  box(30, 175, 170, 60, 'Next request', { sub: 'browser attaches it', color: C.accent }),
  box(280, 175, 200, 60, 'Server looks it up', { sub: 'abc123 = user 42' }),
  box(560, 175, 290, 60, 'You are still logged in', { sub: 'no password re-sent', color: C.ok, fill: C.okSoft, labelSize: 12.5 }),
  arrow(200, 205, 280, 205),
  arrow(480, 205, 560, 205, { color: C.accent }),
  label(440, 272, 'Steal that cookie and you ARE the user - which is what HttpOnly and Secure exist to stop.', { size: 12, color: C.warn }),
].join('\n'));

D['jwt-anatomy'] = svg(880, 280, [
  title(440, 24, 'A JWT is not encrypted. Anyone can read it.'),
  box(30, 60, 250, 50, 'eyJhbGciOiJIUzI1NiJ9', { mono: true, color: C.danger, fill: C.dangerSoft, labelSize: 12 }),
  box(300, 60, 280, 50, 'eyJzdWIiOiI0MiIsInJvbGUi...', { mono: true, color: C.warn, fill: C.warnSoft, labelSize: 12 }),
  box(600, 60, 250, 50, 'SflKxwRJSMeKKF2QT4f...', { mono: true, color: C.accent, fill: C.accentSoft, labelSize: 12 }),
  label(155, 128, 'HEADER', { size: 12, color: C.danger, weight: 600 }),
  label(440, 128, 'PAYLOAD', { size: 12, color: C.warn, weight: 600 }),
  label(725, 128, 'SIGNATURE', { size: 12, color: C.accent, weight: 600 }),
  box(30, 145, 250, 76, '{ "alg": "HS256" }', { sub: 'change alg to none?', sub2: 'that is attack #1', mono: true, labelSize: 12 }),
  box(300, 145, 280, 76, '{ "sub": "42", "role": "user" }', { sub: 'base64, not secret', sub2: 'change role to admin?', mono: true, labelSize: 11.5 }),
  box(600, 145, 250, 76, 'Keyed hash', { sub: 'the only thing', sub2: 'stopping you', mono: false, labelSize: 12 }),
  label(440, 252, 'Never put secrets in the payload. Always verify the signature server-side.', { size: 12, color: C.text }),
].join('\n'));

D['oauth-flow'] = svg(880, 300, [
  title(440, 24, '"Login with Google" - nobody hands over a password'),
  box(20, 80, 150, 60, 'You', { color: C.accent }),
  box(250, 80, 180, 60, 'The app', { sub: 'wants your identity' }),
  box(520, 80, 180, 60, 'Google', { sub: 'already knows you', color: C.accent }),
  box(760, 80, 100, 60, 'Logged in', { color: C.ok, fill: C.okSoft, labelSize: 12 }),
  arrow(170, 100, 250, 100, { label: '1. sign in', color: C.dim, labelDy: -8 }),
  arrow(430, 95, 520, 95, { label: '2. redirect', color: C.dim, labelDy: -8 }),
  arrow(520, 128, 430, 128, { label: '3. code', color: C.accent, labelDy: 16 }),
  arrow(700, 100, 760, 100, { color: C.ok }),
  box(250, 185, 450, 50, '4. app swaps the code for a token, server to server', { color: C.accent, labelSize: 12.5 }),
  arrow(340, 140, 340, 183, { color: C.accent }),
  label(440, 268, 'Bugs live in the redirect: a sloppy redirect_uri check hands your code to an attacker.', { size: 12, color: C.warn }),
].join('\n'));

D['idor-flow'] = svg(880, 280, [
  title(440, 24, 'IDOR: the app checks you are logged in, not that it is yours'),
  box(30, 70, 190, 56, 'Logged in as user 42', { color: C.accent, labelSize: 12.5 }),
  box(310, 60, 260, 40, 'GET /invoice/1042', { sub: '', mono: true, color: C.ok, labelSize: 13 }),
  box(660, 55, 190, 50, 'Your invoice', { sub: 'correct', color: C.ok, fill: C.okSoft, labelSize: 12.5 }),
  arrow(220, 85, 310, 80, { color: C.ok }),
  arrow(570, 80, 660, 80, { color: C.ok }),
  box(310, 150, 260, 40, 'GET /invoice/1043', { mono: true, color: C.danger, labelSize: 13 }),
  box(660, 145, 190, 50, 'Someone else\u2019s', { sub: 'that is the bug', color: C.danger, fill: C.dangerSoft, labelSize: 12.5 }),
  arrow(220, 105, 310, 170, { color: C.danger }),
  arrow(570, 170, 660, 170, { color: C.danger }),
  label(440, 230, 'Missing check:  "does invoice 1043 belong to user 42?"', { size: 13, color: C.text, weight: 600 }),
  label(440, 258, 'One number changed. No tools needed. Still one of the best-paying bug classes.', { size: 12, color: C.accent }),
].join('\n'));

/* ------------------------------------------------------------------- crypto */

D['symmetric-vs-asymmetric'] = svg(880, 300, [
  title(440, 24, 'One shared key, or a matched pair'),
  zone(20, 45, 410, 235, 'SYMMETRIC - same key both ends', C.accent),
  box(50, 90, 130, 50, 'Sender', { color: C.accent }),
  box(270, 90, 130, 50, 'Receiver', { color: C.accent }),
  arrow(180, 115, 270, 115, { color: C.accent }),
  box(140, 165, 170, 44, 'ONE shared key', { mono: false, color: C.warn, fill: C.warnSoft, labelSize: 12.5 }),
  label(225, 235, 'Fast. Great for bulk data.', { size: 11.5, color: C.dim }),
  label(225, 258, 'Problem: how do you share the key?', { size: 11.5, color: C.warn }),
  zone(450, 45, 410, 235, 'ASYMMETRIC - public locks, private unlocks', C.ok),
  box(480, 90, 130, 50, 'Anyone', { color: C.dim }),
  box(700, 90, 130, 50, 'You', { color: C.ok }),
  arrow(610, 115, 700, 115, { color: C.ok }),
  box(470, 165, 150, 44, 'PUBLIC key', { sub: 'share freely', color: C.ok, labelSize: 12.5 }),
  box(690, 165, 150, 44, 'PRIVATE key', { sub: 'never share', color: C.danger, labelSize: 12.5 }),
  label(655, 258, 'Slower. Used to agree on a symmetric key.', { size: 11.5, color: C.dim }),
].join('\n'));

D['hashing-vs-encryption'] = svg(880, 260, [
  title(440, 24, 'Encoding, encryption, hashing - three different jobs'),
  box(20, 60, 270, 160, '', { color: C.warn, fill: 'none' }),
  label(155, 86, 'ENCODING', { size: 13, color: C.warn, weight: 600 }),
  label(155, 112, 'base64, URL, hex', { size: 12, color: C.dim }),
  box(45, 128, 220, 40, 'reversible by anyone', { color: C.warn, labelSize: 12 }),
  label(155, 196, 'NOT security. Just formatting.', { size: 11.5, color: C.warn }),
  box(305, 60, 270, 160, '', { color: C.accent, fill: 'none' }),
  label(440, 86, 'ENCRYPTION', { size: 13, color: C.accent, weight: 600 }),
  label(440, 112, 'AES, RSA, TLS', { size: 12, color: C.dim }),
  box(330, 128, 220, 40, 'reversible with a key', { color: C.accent, labelSize: 12 }),
  label(440, 196, 'For data you need back later.', { size: 11.5, color: C.accent }),
  box(590, 60, 270, 160, '', { color: C.ok, fill: 'none' }),
  label(725, 86, 'HASHING', { size: 13, color: C.ok, weight: 600 }),
  label(725, 112, 'argon2, bcrypt, SHA-256', { size: 12, color: C.dim }),
  box(615, 128, 220, 40, 'one way, never reversible', { color: C.ok, labelSize: 12 }),
  label(725, 196, 'For passwords and integrity.', { size: 11.5, color: C.ok }),
  label(440, 242, 'A site that can email you your old password is storing it wrong.', { size: 12, color: C.danger }),
].join('\n'));

/* ------------------------------------------------------- linux privilege esc */

D['privesc-ladder'] = svg(880, 280, [
  title(440, 24, 'Privilege escalation is a ladder of small misconfigurations'),
  box(30, 195, 200, 56, 'You: low-priv shell', { sub: 'www-data', color: C.dim }),
  box(255, 145, 200, 56, 'Readable secret', { sub: 'config file, .env, history', color: C.warn }),
  box(480, 95, 200, 56, 'Reusable credential', { sub: 'password reused for a user', color: C.warn }),
  box(660, 40, 190, 56, 'root', { sub: 'game over', color: C.danger, fill: C.dangerSoft }),
  arrow(230, 205, 255, 180, { color: C.warn }),
  arrow(455, 155, 480, 130, { color: C.warn }),
  arrow(680, 105, 720, 90, { color: C.danger }),
  box(30, 60, 200, 56, 'Usual first checks', { sub: 'sudo -l, SUID, cron, caps', color: C.accent, labelSize: 12.5 }),
  label(440, 268, 'No single step is dramatic. The chain is the finding - report it as one.', { size: 12, color: C.accent }),
].join('\n'));

/* -------------------------------------------------------------- bug bounty */

D['bug-bounty-lifecycle'] = svg(880, 250, [
  title(440, 24, 'What actually happens between finding and getting paid'),
  box(15, 75, 120, 58, '1. Recon', { sub: 'map assets' , labelSize: 12.5}),
  box(155, 75, 120, 58, '2. Test', { sub: 'find the bug', labelSize: 12.5 }),
  box(295, 75, 130, 58, '3. Prove it', { sub: 'clean PoC', color: C.accent, labelSize: 12.5 }),
  box(445, 75, 130, 58, '4. Report', { sub: 'impact first', color: C.accent, labelSize: 12.5 }),
  box(595, 75, 120, 58, '5. Triage', { sub: 'they verify', labelSize: 12.5 }),
  box(735, 75, 130, 58, '6. Bounty', { sub: 'or duplicate', color: C.ok, labelSize: 12.5 }),
  arrow(135, 104, 155, 104),
  arrow(275, 104, 295, 104),
  arrow(425, 104, 445, 104, { color: C.accent }),
  arrow(575, 104, 595, 104, { color: C.accent }),
  arrow(715, 104, 735, 104),
  label(210, 168, 'Most beginners live here', { size: 11.5, color: C.dim }),
  label(510, 168, 'Money is actually made here', { size: 11.5, color: C.accent, weight: 600 }),
  label(440, 210, 'Two hunters find the same bug. The one who explained the impact gets paid more.', { size: 12, color: C.text }),
].join('\n'));

D['severity-matrix'] = svg(880, 320, [
  title(440, 24, 'Severity is impact times how easily it can be done'),
  label(50, 60, 'Impact', { anchor: 'start', size: 12, color: C.faint, weight: 600 }),
  label(440, 305, 'How easy to exploit  ->', { size: 12, color: C.faint, weight: 600 }),
  box(120, 75, 220, 70, 'HIGH', { sub: 'needs rare conditions', color: C.warn, fill: C.warnSoft, labelSize: 13 }),
  box(360, 75, 220, 70, 'CRITICAL', { sub: 'anyone, any account', color: C.danger, fill: C.dangerSoft, labelSize: 13 }),
  box(120, 155, 220, 70, 'LOW', { sub: 'hard and harmless', color: C.dim, labelSize: 13 }),
  box(360, 155, 220, 70, 'MEDIUM', { sub: 'easy but limited', color: C.warn, labelSize: 13 }),
  box(620, 75, 240, 70, 'Examples', { sub: 'account takeover, RCE,', sub2: 'other users\u2019 data', color: C.danger, labelSize: 12.5 }),
  box(620, 155, 240, 70, 'Examples', { sub: 'missing header, self-XSS,', sub2: 'verbose error page', color: C.dim, labelSize: 12.5 }),
  label(440, 258, 'Ask one question: what can an attacker DO with it, and who to?', { size: 12.5, color: C.text, weight: 600 }),
  label(440, 282, 'A bug with no answer to that is a note, not a report.', { size: 12, color: C.dim }),
].join('\n'));

D['report-anatomy'] = svg(880, 320, [
  title(440, 24, 'The report shape triagers wish everyone used'),
  box(60, 50, 760, 44, '1. Title - the bug and the impact in one line', { color: C.accent, labelSize: 13 }),
  box(60, 102, 760, 44, '2. Summary - what it is and why it matters, three sentences', { color: C.accent, labelSize: 13 }),
  box(60, 154, 760, 44, '3. Steps to reproduce - numbered, no missing step, works cold', { color: C.accent, labelSize: 13 }),
  box(60, 206, 760, 44, '4. Impact - what an attacker gains, in business terms', { color: C.warn, labelSize: 13 }),
  box(60, 258, 370, 44, '5. Proof - short clip or screenshots', { labelSize: 13 }),
  box(450, 258, 370, 44, '6. Fix suggestion - earns goodwill', { labelSize: 13 }),
  label(870, 74, '', {}),
].join('\n'));

D['osi-layers'] = svg(880, 380, [
  title(440, 24, 'Seven layers, and what actually breaks at each one'),
  ...[
    ['7  Application', 'HTTP, DNS, SMTP', 'XSS, SQLi, logic bugs', C.accent],
    ['6  Presentation', 'TLS, encoding', 'weak ciphers, cert issues', C.accent],
    ['5  Session', 'session setup', 'session hijacking', C.accent],
    ['4  Transport', 'TCP, UDP, ports', 'port scans, SYN floods', C.warn],
    ['3  Network', 'IP, routing, ICMP', 'spoofing, routing tricks', C.warn],
    ['2  Data link', 'Ethernet, MAC, ARP', 'ARP spoofing, VLAN hopping', C.dim],
    ['1  Physical', 'cables, radio', 'tapping, jamming', C.dim],
  ].flatMap(([name, what, breaks, color], i) => {
    const y = 44 + i * 44;
    return [
      box(30, y, 250, 38, String(name), { color, labelSize: 13 }),
      label(300, y + 24, String(what), { anchor: 'start', size: 12, color: C.dim, mono: true }),
      label(560, y + 24, String(breaks), { anchor: 'start', size: 12, color }),
    ];
  }),
  label(440, 368, 'You do not memorise this. You use it to ask "which layer is this bug on?"', { size: 12, color: C.faint }),
].join('\n'));

D['sqli-flow'] = svg(880, 330, [
  title(440, 24, 'SQL injection: your input stops being data and becomes code'),
  box(30, 55, 380, 110, 'What the developer meant', { color: C.ok, fill: 'none', labelSize: 13 }),
  label(220, 100, "SELECT * FROM users", { size: 12.5, color: C.text, mono: true }),
  label(220, 122, "WHERE name = 'ravi'", { size: 12.5, color: C.ok, mono: true }),
  label(220, 148, 'input stayed inside the quotes', { size: 11, color: C.dim }),
  box(470, 55, 380, 110, 'What the attacker sends', { color: C.danger, fill: 'none', labelSize: 13 }),
  label(660, 100, "SELECT * FROM users", { size: 12.5, color: C.text, mono: true }),
  label(660, 122, "WHERE name = '' OR 1=1 --'", { size: 12.5, color: C.danger, mono: true }),
  label(660, 148, 'the quote closed early - now it is logic', { size: 11, color: C.danger }),
  arrow(410, 110, 470, 110, { color: C.danger }),
  box(150, 190, 580, 46, "Input:  ' OR 1=1 --", { mono: true, color: C.danger, fill: C.dangerSoft, labelSize: 14 }),
  box(150, 250, 280, 46, 'Result: every row returns', { color: C.danger, labelSize: 12.5 }),
  box(450, 250, 280, 46, 'Fix: parameterised queries', { color: C.ok, labelSize: 12.5 }),
  label(440, 318, 'The database never sees your quote as text. It sees a new instruction.', { size: 12, color: C.faint }),
].join('\n'));

D['xss-types'] = svg(880, 300, [
  title(440, 24, 'Three flavours of XSS, told apart by where the payload lives'),
  box(20, 50, 270, 200, '', { color: C.warn, fill: 'none' }),
  label(155, 76, 'REFLECTED', { size: 13, color: C.warn, weight: 600 }),
  label(155, 100, 'payload rides in the URL', { size: 11.5, color: C.dim }),
  box(45, 115, 220, 40, '?q=<script>...', { mono: true, labelSize: 12 }),
  label(155, 180, 'Needs the victim to click', { size: 11.5, color: C.dim }),
  label(155, 200, 'your link', { size: 11.5, color: C.dim }),
  label(155, 232, 'Medium impact', { size: 11.5, color: C.warn, weight: 600 }),
  box(305, 50, 270, 200, '', { color: C.danger, fill: 'none' }),
  label(440, 76, 'STORED', { size: 13, color: C.danger, weight: 600 }),
  label(440, 100, 'payload saved in the database', { size: 11.5, color: C.dim }),
  box(330, 115, 220, 40, 'comment / profile bio', { labelSize: 12 }),
  label(440, 180, 'Fires for every visitor,', { size: 11.5, color: C.dim }),
  label(440, 200, 'no clicking needed', { size: 11.5, color: C.dim }),
  label(440, 232, 'Highest impact', { size: 11.5, color: C.danger, weight: 600 }),
  box(590, 50, 270, 200, '', { color: C.accent, fill: 'none' }),
  label(725, 76, 'DOM', { size: 13, color: C.accent, weight: 600 }),
  label(725, 100, 'never touches the server', { size: 11.5, color: C.dim }),
  box(615, 115, 220, 40, 'location.hash -> innerHTML', { mono: true, labelSize: 11 }),
  label(725, 180, 'Server logs show nothing.', { size: 11.5, color: C.dim }),
  label(725, 200, 'Read the JavaScript.', { size: 11.5, color: C.dim }),
  label(725, 232, 'Easy to miss', { size: 11.5, color: C.accent, weight: 600 }),
  label(440, 285, 'Same root cause every time: input reached the page without being escaped.', { size: 12, color: C.faint }),
].join('\n'));

/* Written on first run; more diagrams are appended by the second spec block. */
export { D, svg, box, arrow, label, title, zone, C, MONO, esc };

/**
 * Per-diagram metadata used by the seeder and shown in Admin -> Diagrams.
 * A diagram missing from here still seeds, with a title derived from its slug.
 */
const META = {
  'network-basics': ['How data reaches a server', 'networking'],
  'ip-and-ports': ['IP address vs port', 'networking'],
  'tcp-handshake': ['TCP three-way handshake', 'networking'],
  'tcp-vs-udp': ['TCP vs UDP', 'networking'],
  encapsulation: ['Packet encapsulation layers', 'networking'],
  'arp-request': ['ARP request and reply', 'networking'],
  nat: ['NAT and private addressing', 'networking'],
  'dns-resolution': ['DNS resolution chain', 'networking'],
  'traceroute-hops': ['How traceroute reveals hops', 'networking'],
  'subnet-mask': ['Subnet mask: network vs host', 'networking'],
  'osi-layers': ['The seven OSI layers', 'networking'],
  'sqli-flow': ['How SQL injection works', 'web'],
  'xss-types': ['Reflected, stored and DOM XSS', 'web'],
  'linux-permissions': ['Reading Linux permissions', 'linux'],
  'linux-filesystem': ['Linux filesystem tree', 'linux'],
  'pipes-redirection': ['Pipes and redirection', 'linux'],
  'ssh-key-auth': ['SSH key authentication', 'linux'],
  'privesc-ladder': ['Privilege escalation chain', 'linux'],
  'cloud-shared-responsibility': ['Cloud shared responsibility', 'cloud'],
  'metadata-ssrf': ['SSRF to cloud metadata', 'cloud'],
  'iam-privilege-chain': ['IAM privilege escalation chain', 'cloud'],
  'http-request-response': ['HTTP request and response', 'web'],
  'cookies-and-sessions': ['Cookies and sessions', 'web'],
  'jwt-anatomy': ['Anatomy of a JWT', 'web'],
  'oauth-flow': ['OAuth login flow', 'web'],
  'idor-flow': ['How an IDOR works', 'web'],
  'symmetric-vs-asymmetric': ['Symmetric vs asymmetric keys', 'crypto'],
  'hashing-vs-encryption': ['Encoding vs encryption vs hashing', 'crypto'],
  'bug-bounty-lifecycle': ['Bug bounty lifecycle', 'bug-bounty'],
  'severity-matrix': ['Severity: impact vs ease', 'bug-bounty'],
  'report-anatomy': ['Anatomy of a good report', 'bug-bounty'],
};

function titleFromSlug(slug) {
  const s = slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let written = 0;
const manifest = [];
for (const [name, body] of Object.entries(D)) {
  writeFileSync(join(OUT, `${name}.svg`), body, 'utf8');
  const [title, category] = META[name] ?? [titleFromSlug(name), 'general'];
  manifest.push({ slug: name, title, category, file: `${name}.svg` });
  written++;
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`wrote ${written} diagrams + manifest.json to apps/api/src/db/seed/diagrams/`);
