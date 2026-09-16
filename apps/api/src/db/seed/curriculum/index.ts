import type { ExerciseSeed, PathSeed } from './types';

/*
 * Only the part files that currently exist are wired in. The full 10-path map
 * lives in `_PLAN.md`; it is the growth roadmap, not the launch scope. Add an
 * import plus its `...pXx.MODULES` spread here when a part file lands.
 */
import * as p0a from './p0a';
import * as p0b from './p0b';
import * as p1a from './p1a';
import * as p1b from './p1b';
import * as p2a from './p2a';
import * as p4a from './p4a';
import * as p4b from './p4b';
import * as p7b from './p7b';
import * as p8a from './p8a';
import * as p8b from './p8b';
import * as p9a from './p9a';

export type { ExerciseQuestion, ExerciseSeed, LessonSeed, ModuleSeed, PathSeed } from './types';

/**
 * The curriculum. Path metadata lives here; modules and lessons live in the
 * `pNx.ts` part files (see `_AUTHORING.md` for the house style). Module and
 * lesson order is array order; sortOrder is assigned by the seeder.
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
      'The layer under everything. Models and layers, what happens on the wire before IP shows up, and subnetting explained without the maths panic. This is what separates people who guess from people who know.',
    modules: [...p2a.MODULES],
  },
  {
    slug: 'web',
    name: 'Web Security',
    levelNumber: 4,
    icon: 'globe',
    sortOrder: 4,
    description:
      'The main event, and the track most bounties come from. How web apps really work, how to map one, then the big bug classes: injection, XSS, broken access control and account takeover - with real payloads and how to confirm a finding.',
    modules: [...p4a.MODULES, ...p4b.MODULES],
  },
  {
    slug: 'api-and-cloud',
    name: 'APIs, Cloud and Modern Apps',
    levelNumber: 7,
    icon: 'cloud',
    sortOrder: 7,
    description:
      'Modern apps are APIs plus cloud plus containers. Buckets, IAM, metadata SSRF, CI/CD and mobile traffic - where most of today\'s real findings live.',
    modules: [...p7b.MODULES],
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
      'Optional expeditions past the web: Active Directory, privilege escalation and cryptography. Pick what pulls you.',
    modules: [...p9a.MODULES],
  },
];

export const EXERCISE_SEEDS: ExerciseSeed[] = [
  ...p0a.EXERCISES,
  ...p0b.EXERCISES,
  ...p1a.EXERCISES,
  ...p1b.EXERCISES,
  ...p2a.EXERCISES,
  ...p4a.EXERCISES,
  ...p4b.EXERCISES,
  ...p7b.EXERCISES,
  ...p8a.EXERCISES,
  ...p8b.EXERCISES,
  ...p9a.EXERCISES,
];
