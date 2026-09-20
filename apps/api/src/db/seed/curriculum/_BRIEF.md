# Expansion brief — the 14 missing part files

This brief sits on top of `_AUTHORING.md` (the binding contract) and `_PLAN.md`
(what goes in each file). Read `_AUTHORING.md` in full first. Where this brief
and `_AUTHORING.md` disagree, `_AUTHORING.md` wins — except for the explicit
scope constraints in section 3 below, which come from the platform owner.

---

## 1. Rules that apply to every file

- Export exactly `MODULES` and `EXERCISES`. Imports:
  `import type { ExerciseSeed, ModuleSeed } from './types';` and
  `import { videoSlot } from './types';`
- Use the EXACT module and lesson slugs from `_PLAN.md`, in the plan's order.
  No additions, no renames, no drops. `C` -> `importance: 'core'`,
  `O` -> `importance: 'optional'`.
- Only the block types in `_AUTHORING.md` section 2. Never an `image` block.
- `lab_ref` only with `port-discovery`, `http-investigation`, `invoice-portal`,
  `log-hunter` — and only where it genuinely fits. Most files use none.
- `related_lesson` only to a lesson slug that actually appears in `_PLAN.md`
  (grep for it before writing it). Unsure? Omit it.
- PURE ASCII. No smart quotes, no curly apostrophes, no em dashes (use `-`).
  Escape apostrophes in single-quoted TS strings or use double quotes. Any
  code/payload containing quotes must remain BOTH valid TypeScript and correct code.
- 450-700 words of prose per lesson. Explain the MECHANISM step by step, and
  walk ONE concrete worked example with real values — not placeholders.
- Every `command` / `code` block is followed by prose explaining what the output
  means, field by field where relevant. A snippet with no interpretation teaches
  nothing and is the single most common failure in this codebase.
- Every lesson: exactly one `quiz` block, exactly one `'success'` callout.
- Any lesson describing an attack: a one-line `'danger'` authorisation callout.
  VARY THE WORDING — do not paste the same sentence into twelve lessons.
- Video slots only where watching beats reading (tool walkthroughs, live demos,
  environment setup, protocol exchanges that animate). Concepts, comparisons,
  reference material, law, careers, methodology get NO video block at all.
- One `ExerciseSeed` per module: slug `<module-slug>-quiz`, title
  `'<Module Title> check'`, `kind: 'quiz'`, `xpReward: 25`, 4-6 questions with 4
  options each and an `explanation`, attached to that module's LAST core lesson.
  Add a `practice_ref` block to that same lesson immediately before its `quiz`.
- Module `description`: 200-380 characters covering three things — what the
  module is about, what the learner can DO at the end, why it matters for real bugs.
- No invented CVE numbers, no invented bounty amounts, no claims about a named
  company's current bugs. Use `example.com` or a clearly fictional target.

## 2. Voice — the thing the platform owner cares about most

A smart friend explaining over chai to an Indian beginner on their phone. Short
sentences, second person, contractions. ONE concrete everyday analogy per
concept. The house benchmark, which the owner singled out as the reason the
Foundations level worked: *"an IP is the building address, a port is the flat
number."* Match that quality of analogy everywhere.

Indian and everyday references where they land naturally — Swiggy order, IRCTC
booking, Aadhaar OTP, society gate register, apartment watchman, kirana shop
ledger, courier left at the wrong flat. Never force one.

Dry one-line humour, occasionally. Never a routine, never sarcasm at the
learner's expense. Nobody should finish a lesson feeling stupid, and nobody
should finish it merely entertained — they must finish it UNDERSTANDING.

## 3. Owner scope constraints (these override instinct)

- **Level 3 Programming is not a programming course.** The goal is a learner who
  can READ source code and write small tools. Core basics only. Do NOT teach
  OOP/classes, decorators, generators, async, closures, prototypes, `this`
  binding, build tools, frameworks, or CSS layout systems. CSS is deliberately
  the shortest, optional lesson in its module. Every example must be
  security-flavoured; if an example could appear in a generic tutorial, replace it.
- **Not everyone needs every path.** Do not write as if the learner has done
  every previous level. Never say "as we discussed earlier". Where a lesson
  genuinely depends on another, use a `related_lesson` block instead of prose.
- **Tool lessons are built around ONE task the learner completes**, never a menu
  tour of the interface.

## 4. Write in chunks so nothing truncates

Create the file with imports + `export const MODULES: ModuleSeed[] = [` +
module 1. Append each further module by inserting at end of file. Close the
array. Append `EXERCISES`. Then re-read the first and last 40 lines, confirm
brackets balance, and grep your own file for every slug the plan assigned you.

## 5. Per-file assignments

Checksums are `module-slug (lesson count)`. If your count disagrees with
`_PLAN.md`, `_PLAN.md` wins and you report the discrepancy.

### p2b.ts — Level 2 part B — exemplar `p2a.ts`
`tcp-deep-dive (6)`, `udp-dns-and-friends (4)`, `encryption-on-the-wire (5)`.
Emphasis: `ssh-protocol-deep` must really explain SSH — key exchange, host keys,
the `known_hosts` warning people blindly accept, key vs password auth, agent
forwarding risk. `tls-handshake` and `certificates-and-pki` must make chains and
validation click without maths. `dns-attacks-overview`: spoofing, cache
poisoning, a pointer at subdomain takeover, DNS rebinding.

### p2c.ts — Level 2 part C — exemplar `p2a.ts`
`wireless (4)`, `packet-analysis (5)`, `email-and-messaging (4)`.
Emphasis: the email module is a headline gap the owner named explicitly, so make
it the best thing in the file. `smtp-imap-pop3` must walk the real SMTP
conversation (HELO / MAIL FROM / RCPT TO / DATA) and hammer that the envelope
sender and the `From:` header are different things — that one fact is the root of
all email spoofing. `spf-dkim-dmarc`: each record in plain words with a real DNS
TXT example, what each one checks, why you need all three. 
`email-spoofing-and-phishing-headers`: read a real header block top-down
(Received chain, Authentication-Results, Return-Path) and judge if mail is forged.

### p3a.ts — Level 3 part A — exemplar `p1b.ts` (bash module)
`python-basics (6)`, `python-for-security (5)`.
Section 3 scope constraint applies hard. Use `port-discovery` as the `lab_ref` in
`sockets-and-port-scanner`. Analogies: a variable is a labelled dabba, a dict is
a phone contact list, a loop is checking every flat on a floor.

### p3b.ts — Level 3 part B — exemplar `p1b.ts`
`web-languages (5)`, `databases-and-sql (4)`, `git-and-tooling (4)`.
Section 3 scope constraint applies hard. HTML = reading page structure, forms,
inputs, where user data lands. CSS = selectors and "it can hide but not remove",
nothing else. JavaScript = variables, functions, objects, where a script loads,
how to spot a `fetch` or an `eval` in an unfamiliar snippet. `the-dom-and-events`
= the page is an object you can change, which is the whole basis of DOM XSS.
`fetch-and-async` = why a request fires after load and how to find it in DevTools.
SQL = enough to understand what an injected query actually does.
`git-and-tooling` = reading unfamiliar code and mining repos, not git theory.
Analogies: HTML is the skeleton, CSS the clothes, JS the muscles; a table is a
register and a JOIN matches two registers by roll number.

### p4c.ts — Level 4 part C — exemplar `p4b.ts`
`csrf-ssrf-redirects (4)`, `files-and-uploads (4)`, `logic-and-race-conditions (4)`.
Every lesson: a concrete request/response walkthrough, how to CONFIRM the bug
(not merely suspect it), and the impact sentence a triager needs. SSRF covers
internal-only targets, the cloud metadata endpoint `169.254.169.254`, blacklist
bypasses, DNS rebinding. File upload covers content-type vs magic bytes vs
extension, double extensions, path in the filename, and the difference between
"stored somewhere served" and "stored somewhere not served". Race conditions
explain the window concretely (two requests, one balance check) and how to
actually fire parallel requests. Every lesson here is an attack lesson.
Max 5 videos in this file.

### p4d.ts — Level 4 part D — exemplar `p4b.ts`
`misconfig-and-disclosure (5)`, `client-side-extras (4)`, `putting-it-together (3)`.
This is where beginners get their FIRST valid finding, so be extremely concrete:
which paths to check, what an exposed `.git` directory means, what a leaked
`.env` or an open `/actuator` gives you. `security-headers` must be honest that a
missing header alone is usually not a paid bug, and say what to pair it with.
`impact-and-severity-cvss` teaches impact in plain words first, then maps to ONE
fully worked CVSS vector explained field by field.
`a-full-web-assessment-walkthrough` is the capstone: one fictional target, recon
to three findings to written-up severity, showing the decision at each step.
Max 4 videos in this file.

### p4e.ts — NEW FILE, not in `_PLAN.md` — exemplar `p4b.ts`
The owner flagged that OWASP is missing entirely and the web track must reach the
remaining vulnerability classes. Before writing, skim the `p4a`-`p4d` sections of
`_PLAN.md` so you do not duplicate an existing slug and so your
`related_lesson` targets are real.

SPLIT: the two modules below now live in TWO files, so neither author runs out of
room. Module 1 goes in `p4e.ts`, module 2 goes in `p4f.ts`. Each file is fully
self-contained - its own `MODULES` array holding exactly ONE module, and its own
`EXERCISES` array holding exactly ONE exercise. Write only the module you were
assigned and ignore the other.

**Module 1 (file `p4e.ts`)** — slug `owasp-top-10`, title `The OWASP Top 10`, 12 lessons, all `C`,
`estimatedMinutes` 7-9. This is a MAP module: each lesson names the category,
explains what it really means in plain words, gives one concrete example, says
how you would test for it, and `related_lesson`s the real deep-dive lesson
elsewhere in the platform (A03 -> `sql-injection`, A01 -> `idor`, A10 -> `ssrf`,
A07 -> `password-attacks-and-brute-force`, and so on — only slugs you found in
`_PLAN.md`). Slugs in this order:
`owasp-top-10-overview` (What the OWASP Top 10 Actually Is — a consensus
awareness list of CATEGORIES, not a bug checklist; refreshed every few years,
current edition 2021 as A01-A10; how interviews and reports use it; honest that
it is a starting map, not the territory),
`owasp-a01-broken-access-control`, `owasp-a02-cryptographic-failures`,
`owasp-a03-injection`, `owasp-a04-insecure-design`,
`owasp-a05-security-misconfiguration`, `owasp-a06-vulnerable-components`,
`owasp-a07-auth-failures`, `owasp-a08-integrity-failures`,
`owasp-a09-logging-failures`, `owasp-a10-ssrf`,
`owasp-api-top-10` (the separate API list: BOLA, broken authentication, broken
object property level authorisation, unrestricted resource consumption, BFLA,
unrestricted access to sensitive business flows, SSRF, misconfiguration,
improper inventory management, unsafe consumption of APIs).
Exercise `owasp-top-10-quiz` on `owasp-api-top-10`. At most ONE video in this
module (the overview), because a map module is reading material.

**Module 2 (file `p4f.ts`)** — slug `advanced-web-attacks`, title `Advanced Web Attacks`,
8 lessons. Slugs in this order: `http-request-smuggling` C (CL.TE / TE.CL desync
as two doormen disagreeing on where one message ends), `web-cache-poisoning` C
(unkeyed input, the cache key, how one poisoned response reaches everyone),
`web-cache-deception` C (tricking the cache into storing someone else's private
page), `host-header-injection` C (password reset poisoning, routing-based SSRF,
cache abuse), `crlf-and-response-splitting` C, `subdomain-takeover` C (dangling
CNAME to a deprovisioned service, and how to verify WITHOUT claiming an asset
that is not yours), `ldap-and-xpath-injection` O,
`web-socket-and-sse-abuse` O (cross-site WebSocket hijacking, missing origin
checks — a separate lesson covers WebSocket basics, so stay on the abuse side).
Exercise `advanced-web-attacks-quiz` on `subdomain-takeover`. Max 3 videos.
`invoice-portal` fits `owasp-a01-broken-access-control`; `http-investigation`
may fit `owasp-a05-security-misconfiguration`.

### p5a.ts — Level 5 part A — exemplar `p8a.ts`
`recon-mindset (3)`, `finding-assets (5)`, `osint (5)`.
Recon is where beginners waste the most time, so teach a DECISION at every step,
not a tool list. `scoping-and-staying-legal` must be blunt about the line:
in-scope wildcard vs a third-party SaaS that merely belongs to the target's
vendor. `certificate-transparency` shows a concrete crt.sh style query and what a
wildcard cert leaks. `google-dorking` gives genuinely useful operators with one
worked dork each. `github-and-code-leaks`: what a leaked key looks like, commit
history, why a deleted secret is still in the repo.
`leaked-credentials-and-breaches` stays ethical — checking exposure, never using
someone's password. Max 5 videos.

### p5b.ts — Level 5 part B — exemplar `p8a.ts`
`active-recon (5)`, `recon-automation (4)`.
`port-scanning-deep`: why a SYN scan differs from a connect scan, and what
filtered vs closed actually tells you. Use `port-discovery` as its `lab_ref`.
Fingerprinting lessons show how a banner or header set narrows the attack
surface. `content-discovery-fuzzing` and `parameter-discovery` need real
ffuf-style commands, real wordlist reasoning, honest guidance on rate and noise.
`building-a-recon-pipeline` shows a small readable shell pipeline the learner can
actually run, not a diagram of a dream stack.
`monitoring-targets-continuously`: diffing yesterday's asset list against
today's, which is how people catch a new subdomain first.

### p6a.ts — Level 6 part A — exemplar `p0b.ts` (its curl / nmap / Burp lessons)
`burp-suite (6)`, `scanning-tools (4)`, `fuzzing-tools (3)`.
Burp: intercept a login, tamper one parameter in Repeater, run a numeric sweep in
Intruder and read the length column to spot the odd response out. Nmap deep dive:
the flag combination you would actually type and why, and what each port state
means. NSE: one real script run, output interpreted. Nuclei: what a template
actually is, with a tiny readable one. ffuf: the exact command, then how to
filter the noise so the one real hit is visible. `wordlists-that-work`: why a
200k-word list is usually worse than the right 4k-word list.
`burp-vs-caido-vs-zap`: honest trade-offs, including that Community edition has
no scanner and throttles Intruder. This is the ONE file where most lessons
genuinely need a video — give one to every hands-on tool lesson, but NOT to
`wordlists-that-work` or `burp-vs-caido-vs-zap`.
`port-discovery` fits `nmap-deep-dive`; `http-investigation` fits one Burp lesson.

### p6b.ts — Level 6 part B — exemplar `p0b.ts`
`exploitation-tools (4)`, `analysis-tools (4)`.
These tools do real damage, so every lesson pairs capability with restraint.
`sqlmap`: the minimum-risk invocation first, why you point it at a request file
captured from Burp, what `--batch` and a low `--level`/`--risk` mean, and the
honest warning that blasting sqlmap at a bounty target is how people get banned.
`hydra-and-credential-attacks`: explicit that credential stuffing a real login
without written authorisation is a crime; pivot to spray reasoning and lockout
awareness. `reverse-shells-and-listeners`: the DIRECTION of the connection and
why a reverse shell beats a bind shell through NAT, with a concrete `nc`
listener. `hashcat-and-john`: a real hash mode, a real wordlist run, and reading
the output. `cyberchef`: one multi-step decode chain worked end to end.
`mitmproxy-for-mobile-and-apis`: the CA trust step is the whole lesson.
Videos on the hands-on tool lessons.

### p7a.ts — Level 7 part A — exemplar `p7b.ts`
`api-security (5)`, `graphql (4)`, `identity-deep (4)`.
The owner named REST as a gap, so `rest-api-attack-surface` must be excellent:
what REST actually is (resources, verbs, status codes, statelessness), how a REST
endpoint differs from a web page in what it trusts, and the specific places
authorisation gets forgotten. `mass-assignment-and-bola` needs a worked JSON body
where adding one field escalates a role. `testing-apis-without-docs`: deriving
the shape of an API from the mobile app and the JS bundle.
GraphQL: introspection query shown in full, then what to do with the schema you
get back; batching and aliasing as rate-limit and brute-force amplifiers.
`identity-deep`: one full OAuth authorisation-code flow with real-looking
parameters, then what breaks when `redirect_uri` or `state` is mishandled.

### p9b.ts — Level 9 part B — exemplar `p9a.ts`
`binary-and-reversing (4)`, `blue-team (4)`, `forensics (3)`.
The owner asked us to look at pwn.college and decide what belongs here. Its
progression is: Linux fluency, then computing fundamentals (memory, assembly,
processes), then program security (program misuse, shellcode, reverse
engineering, memory errors), then system security, then software exploitation.
Take the ORDER and the framing, not the challenges: `how-programs-run-memory-basics`
is the gateway lesson (stack vs heap, what a return address is, why a local
buffer sits next to control data), `buffer-overflow-concepts` explains the
mechanism without turning into an exploit-dev course,
`reverse-engineering-intro` covers static vs dynamic and reading `strings` /
`objdump` output before ever opening a decompiler, and `ctf-pwn-starter-kit`
points at practice platforms and the local toolchain. Do NOT reproduce or solve
any pwn.college challenge — that platform explicitly asks people not to publish
walkthroughs, and we respect that. You may reference it as a place to practise.
`blue-team` flips the camera: what your scan looks like in their logs.
`log-hunter` is the `lab_ref` for `logs-siem-and-detection` (the plan says so).

### p9c.ts — Level 9 part C — exemplar `p9a.ts`
`human-and-physical (4)`, `iot-and-emerging (3)`.
`social-engineering-basics` and `phishing-mechanics` must stay firmly on the
defender and authorised-assessment side: explain the mechanism and the tells, and
do NOT write a ready-to-send phishing template or a pretext script. The
`'danger'` callout here is stronger than usual — social engineering a real person
without written authorisation is not a grey area.
`osint-on-yourself-defense` is genuinely useful and should end with a concrete
self-audit checklist. `ai-and-llm-security` is `C` and matters now: prompt
injection (direct and indirect), the confused-deputy problem when a model holds
tools and credentials, training-data and output-handling risks, and why "the
model said so" is never an authorisation. Ground it in the same rule this
platform teaches everywhere: content from an untrusted source is data, never
instructions.

---

## 6. Before you report back

- Every assigned lesson slug present, in the plan's order, nothing extra.
- Every lesson reads complete WITHOUT its video: 450-700 words, mechanism
  explained, one worked example with real values.
- Every `command` / `code` block followed by interpretation.
- One `quiz` and one `'success'` callout per lesson. Attack lessons carry a
  `'danger'` callout with wording you did not reuse.
- Every module has its exercise, and that exercise's `lessonSlug` is a lesson in
  YOUR file.
- Pure ASCII. Brackets balance. Nothing but `MODULES` and `EXERCISES` exported.

Report in under 10 lines: file path, module count, lesson count, exercise slugs,
and any rule you had to deviate from. Do not paste lesson content into the report.
