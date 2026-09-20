import type { ExerciseSeed, PathSeed } from './types';

/*
 * Every part file described in `_PLAN.md` is now wired in, plus `p4e`/`p4f`
 * (the OWASP Top 10 map and the advanced web attack classes), which were added
 * after the original plan was written. Add an import plus its `...pNx.MODULES`
 * spread here when a new part file lands.
 */
import * as p0a from './p0a';
import * as p0b from './p0b';
import * as p1a from './p1a';
import * as p1b from './p1b';
import * as p2a from './p2a';
import * as p2b from './p2b';
import * as p2c from './p2c';
import * as p3a from './p3a';
import * as p3b from './p3b';
import * as p4a from './p4a';
import * as p4b from './p4b';
import * as p4c from './p4c';
import * as p4d from './p4d';
import * as p4e from './p4e';
import * as p4f from './p4f';
import * as p5a from './p5a';
import * as p5b from './p5b';
import * as p6a from './p6a';
import * as p6b from './p6b';
import * as p7a from './p7a';
import * as p7b from './p7b';
import * as p8a from './p8a';
import * as p8b from './p8b';
import * as p9a from './p9a';
import * as p9b from './p9b';
import * as p9c from './p9c';

export type { ExerciseQuestion, ExerciseSeed, LessonSeed, ModuleSeed, PathSeed } from './types';

/**
 * The curriculum. Path metadata lives here; modules and lessons live in the
 * `pNx.ts` part files (see `_AUTHORING.md` for the house style). Module and
 * lesson order is array order; sortOrder is assigned by the seeder.
 *
 * Levels 0 and 1 are mandatory for everyone. Everything after that is a route
 * the learner picks - see the `choose-your-path` lesson in Foundations.
 */
export const PATH_SEEDS: PathSeed[] = [
  {
    slug: 'foundations',
    name: 'Foundations',
    levelNumber: 0,
    icon: 'shield',
    sortOrder: 0,
    description:
      "Start here even if you know nothing. How computers talk, how the web works, what a hacker actually does all day - and the rules that keep you on the right side of the law. No prior experience, no maths panic.",
    modules: [...p0a.MODULES, ...p0b.MODULES],
  },
  {
    slug: 'linux',
    name: 'Linux and the Command Line',
    levelNumber: 1,
    icon: 'terminal',
    sortOrder: 1,
    description:
      'Almost every server you will ever touch runs Linux. Get comfortable in a terminal, read permissions at a glance, and automate the boring half of your work with bash.',
    modules: [...p1a.MODULES, ...p1b.MODULES],
  },
  {
    slug: 'networking',
    name: 'Networking',
    levelNumber: 2,
    icon: 'network',
    sortOrder: 2,
    description:
      'The layer under everything: models and layers, what happens on the wire before IP shows up, subnetting without the maths panic, then TCP, TLS and SSH in depth. Finish with Wi-Fi, reading a packet capture, and the email records that decide whether a mail is forged.',
    modules: [...p2a.MODULES, ...p2b.MODULES, ...p2c.MODULES],
  },
  {
    slug: 'programming',
    name: 'Programming for Hackers',
    levelNumber: 3,
    icon: 'code',
    sortOrder: 3,
    description:
      'Not a programming course - just enough code to read what you are attacking and build your own small tools. Python for scripting recon, HTML and JavaScript for understanding a page, SQL for knowing what an injected query really does, and git for mining a repository.',
    modules: [...p3a.MODULES, ...p3b.MODULES],
  },
  {
    slug: 'web',
    name: 'Web Security',
    levelNumber: 4,
    icon: 'globe',
    sortOrder: 4,
    description:
      'The main event, and the track most bounties come from. How web apps really work, the OWASP Top 10 as your shared vocabulary, then every major bug class with real payloads: injection, XSS, broken access control, account takeover, SSRF, uploads, logic flaws, misconfiguration - up to request smuggling and cache poisoning.',
    modules: [...p4a.MODULES, ...p4e.MODULES, ...p4b.MODULES, ...p4c.MODULES, ...p4d.MODULES, ...p4f.MODULES],
  },
  {
    slug: 'recon',
    name: 'Recon and OSINT',
    levelNumber: 5,
    icon: 'search',
    sortOrder: 5,
    description:
      'Bugs live on the assets nobody remembered owning. Find everything a target runs - subdomains, certificates, cloud buckets, leaked code - then fingerprint and fuzz it with intent, and automate the whole thing so you wake up to a diff of what changed overnight.',
    modules: [...p5a.MODULES, ...p5b.MODULES],
  },
  {
    slug: 'tools',
    name: 'Tools Mastery',
    levelNumber: 6,
    icon: 'wrench',
    sortOrder: 6,
    description:
      'Drive the tools properly instead of pasting commands. Burp from intercept to Intruder, Nmap and Nuclei, ffuf and the wordlist choices that actually matter, then sqlmap, hashcat, Wireshark and mitmproxy - each with the restraint that keeps you inside scope.',
    modules: [...p6a.MODULES, ...p6b.MODULES],
  },
  {
    slug: 'api-and-cloud',
    name: 'APIs, Cloud and Modern Apps',
    levelNumber: 7,
    icon: 'cloud',
    sortOrder: 7,
    description:
      'Modern apps are APIs plus cloud plus containers. REST and GraphQL attack surface, OAuth and SSO done properly, then buckets, IAM, metadata SSRF, CI/CD and mobile traffic - where most of today\'s real findings live.',
    modules: [...p7a.MODULES, ...p7b.MODULES],
  },
  {
    slug: 'vulnerability-research',
    name: 'Bug Bounty and Vulnerability Research',
    levelNumber: 8,
    icon: 'bug',
    sortOrder: 8,
    description:
      'Turn skill into outcomes: pick targets, hunt with a repeatable process, write reports that get paid, learn from disclosed bugs, and stay legal under Indian law.',
    modules: [...p8a.MODULES, ...p8b.MODULES],
  },
  {
    slug: 'beyond-web',
    name: 'Beyond Web (Side Quests)',
    levelNumber: 9,
    icon: 'compass',
    sortOrder: 9,
    description:
      'Optional expeditions past the web: Active Directory, privilege escalation, cryptography, a first look under the hood at binaries, the defender\'s view of your own traffic, forensics, social engineering and AI/LLM security. Pick what pulls you.',
    modules: [...p9a.MODULES, ...p9b.MODULES, ...p9c.MODULES],
  },
];

export const EXERCISE_SEEDS: ExerciseSeed[] = [
  ...p0a.EXERCISES,
  ...p0b.EXERCISES,
  ...p1a.EXERCISES,
  ...p1b.EXERCISES,
  ...p2a.EXERCISES,
  ...p2b.EXERCISES,
  ...p2c.EXERCISES,
  ...p3a.EXERCISES,
  ...p3b.EXERCISES,
  ...p4a.EXERCISES,
  ...p4b.EXERCISES,
  ...p4c.EXERCISES,
  ...p4d.EXERCISES,
  ...p4e.EXERCISES,
  ...p4f.EXERCISES,
  ...p5a.EXERCISES,
  ...p5b.EXERCISES,
  ...p6a.EXERCISES,
  ...p6b.EXERCISES,
  ...p7a.EXERCISES,
  ...p7b.EXERCISES,
  ...p8a.EXERCISES,
  ...p8b.EXERCISES,
  ...p9a.EXERCISES,
  ...p9b.EXERCISES,
  ...p9c.EXERCISES,
];
