import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'bug-bounty-101',
    title: 'Bug Bounty 101',
    description:
      'What the job really is, minus the movie montage: how programs pay for real bugs, the difference between a platform and a program, how to read a scope page like a contract, and why most reports come back as duplicates. By the end you can tell a public program from a private one, decode the words in a triage status, and set money expectations honest enough that you do not quit in month two.',
    lessons: [
      {
        slug: 'what-bug-bounty-really-is',
        title: 'What Bug Bounty Really Is',
        summary: 'Companies pay you to find their bugs before the bad guys do. That is the whole deal.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Bug bounty is a simple trade. A company publishes "here is our website, find security holes, and we will pay you for the real ones". You hunt on your own time, you report what you find, they fix it and pay you. No employment, no salary, no boss telling you which hours to work.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, because "find bugs, get paid" hides the actual loop. First the company writes a program: a scope (what you may test), rules (what techniques are allowed), and a reward table (what it pays for each severity). You pick a target inside that scope and test it. When you find a genuine security flaw, you write a report with exact steps to reproduce it. A person called a triager reads your report, tries to reproduce it, and confirms or rejects it. If it is real and nobody reported it first, the company fixes it and pays the reward tied to its severity. Miss any step - test out of scope, skip the reproduction steps, or report something that is not actually a bug - and you get nothing, however hard you worked.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete example end to end. You join a program whose scope lists `app.example.com`. You notice an invoice page loads at `/invoices/1042`. You change the number to `1041` and see someone else\'s invoice - an access-control bug. You write it up: log in as yourself, open your own invoice, change the number, observe another user\'s data. The triager follows those exact steps, sees the same leak, marks it Triaged, and the company pays out the reward its table lists for that severity. The bug was real, in scope, unique, and reproducible - that is all four boxes ticked.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like being a freelance safety inspector for buildings. You only get paid when you spot a genuine crack, only for cracks the owner did not already know about, and only for buildings the owner asked you to inspect. Inspect a building nobody hired you for and you are trespassing, not helping.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Scope** - the exact assets you are allowed to test, listed on the program page.',
              '**Report** - your write-up with steps clear enough that a stranger can reproduce the bug.',
              '**Triager** - the person who reads your report and confirms or rejects it.',
              '**Severity** - how bad the bug is, which decides the size of the reward.',
              '**Unique** - you were the first to report it; the second person to find it gets nothing.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'It is a skill, not a lottery',
            text:
              'Payouts feel random at first. They are not. Consistent hunters have a repeatable process for recon, testing and reporting. The luck part shrinks as your skill grows, and the dry months get shorter.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know exactly what bug bounty is - the report-triage-reward loop, and the four things a finding needs to get paid.',
          },
          {
            type: 'quiz',
            question: 'A finding must tick four boxes to get paid. Which set is correct?',
            options: [
              'Real, in scope, unique, and reproducible',
              'Critical, fast, public, and automated',
              'Long, formatted, screenshotted, and polite',
              'Found at night, on a weekend, alone, and quietly',
            ],
            correctIndex: 0,
            explanation: 'A finding pays only if it is a genuine bug, inside the program scope, the first such report, and reproducible from your steps.',
          },
        ],
      },
      {
        slug: 'platforms-and-programs',
        title: 'Platforms and Programs',
        summary: 'Where the programs live, and the difference between a platform and a program.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Two words get used interchangeably by beginners and they should not be. A platform is the marketplace. A program is one company listing on that marketplace. Get the split straight now and program pages stop being confusing.',
          },
          {
            type: 'paragraph',
            text:
              'The platform is the middleman that runs the plumbing. It hosts many companies, gives each a standard page for its scope and rules, routes your reports to the right team, tracks the status of each report, and handles the payout when a bug is resolved. It also keeps a record of your track record - how many valid bugs you have found, your accuracy, your reputation score. A program is the actual target: one company saying "test us, here is exactly what is in scope, here is what we pay". You do all your hunting against programs; the platform is just the building they rent an office in.',
          },
          {
            type: 'paragraph',
            text:
              'Programs come in a few flavours, and the difference decides whether you can even start. A public program is open - anyone with an account can read the scope and begin hunting today. A private program is invite-only, and the invites usually go to hunters who have already built a track record of good reports and professional behaviour. A vulnerability disclosure program (a VDP) is a "we accept security reports" channel that often rewards reputation and thanks rather than cash - great for learning and building a name, less so for paying rent.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Platform** - the marketplace hosting many programs; handles reports, status and payouts.',
              '**Program** - one company listing its scope, rules and reward table. Your actual target.',
              '**Public program** - open to anyone; where beginners start.',
              '**Private program** - invite-only, usually earned after a solid public track record.',
              '**VDP** - a disclosure channel that often pays reputation, not money.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here is the practical path, walked concretely. You make an account on a platform and see a list of public programs. You pick one, read its scope, and start hunting - no invitation needed. Over weeks you file a few clean, valid reports. The platform notices your accuracy is high and your reports are professional, so private program invites start appearing. Those private programs are less crowded, because far fewer hunters can see them - which is exactly why the invites are worth working toward.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A VDP is not a payday',
            text:
              'Vulnerability disclosure programs often reward reputation and a thank-you, not cash. They are excellent for practice and for building a name that earns private invites, but do not treat one as income.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell a platform from a program, and public from private from VDP, and you know the path from open programs to earned invites.',
          },
          {
            type: 'quiz',
            question: 'What is the difference between a platform and a program?',
            options: [
              'They are the same thing',
              'A platform is the marketplace hosting many programs; a program is one company target',
              'A program hosts many platforms',
              'A platform is only for private invites',
            ],
            correctIndex: 1,
            explanation: 'The platform is the marketplace that hosts many company programs and handles reports and payouts. A program is a single company target you hunt against.',
          },
        ],
      },
      {
        slug: 'reading-scope-like-a-lawyer',
        title: 'Reading Scope Like a Lawyer',
        summary: 'Scope is the line you do not cross. Read it slowly, twice, before you touch anything.',
        estimatedMinutes: 9,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Every program has a scope page, and it is the single most important thing you read before testing. It lists what you are allowed to touch and what is off limits. Testing something out of scope is not just wasted effort - it can get you banned from the program and, on a system you had no permission for, it is unauthorised access under the law.',
          },
          {
            type: 'paragraph',
            text:
              'A scope page has a predictable shape, and reading it like a contract means reading every clause, not just the headline. There is an in-scope list (the domains, apps, and assets you may test), an out-of-scope list (assets you must leave alone even if a bug is obvious), an allowed-techniques section (what you may do), and a forbidden-actions section (things like heavy automated scanning, social engineering staff, denial-of-service testing, or touching real user data). The trap for beginners is reading the first list and stopping. The exclusions further down are where you get burned.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real scope clause and what it does and does not permit. Suppose the scope reads: "In scope: `*.example.com`. Out of scope: `blog.example.com`, `status.example.com`, and any third-party service. Allowed: manual testing of web application vulnerabilities. Not allowed: automated scanners, physical or social engineering, testing that degrades service for real users." Read carefully, that permits you to manually test `app.example.com` and `api.example.com` because they match the wildcard. It does NOT permit `blog.example.com` even though the wildcard seems to cover it - the exclusion overrides the wildcard. It does NOT permit running a loud automated scanner against anything. And it does NOT permit testing a payment provider the site uses, because that is a third party. The wildcard looked like a blank cheque; the clauses underneath cashed most of it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**In scope** - the domains, apps and assets you may test. Anything not listed is not implied.',
              '**Out of scope** - hands off, no matter how juicy the bug looks. Exclusions override wildcards.',
              '**Allowed testing** - the techniques you are permitted to use.',
              '**Forbidden actions** - common bans include automated scanning, DoS, social engineering, and touching real user data.',
              '**Third parties** - services the target uses but does not own are almost never in scope.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Before you send a single request, run this checklist against the page. Is the exact host I am about to test in the in-scope list? Is it also missing from the out-of-scope list? Is the technique I am about to use allowed? Am I sure this asset is owned by the target and not a third party? If any answer is "not sure", the answer is stop and re-read, not "probably fine".',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Wildcards are a trap for the careless',
            text:
              'A scope like `*.example.com` sounds huge, but the out-of-scope list below it usually carves specific subdomains back out. An exclusion always beats a wildcard. Read the whole page, not just the top line.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test targets and techniques the program explicitly authorises. Out of scope means no permission, which means the law is not on your side.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a scope page clause by clause, know that exclusions override wildcards, and run the pre-test checklist before touching anything.',
          },
          {
            type: 'quiz',
            question: 'A scope says "In scope: *.example.com. Out of scope: blog.example.com". Can you test blog.example.com?',
            options: [
              'Yes, the wildcard covers every subdomain',
              'No, the explicit exclusion overrides the wildcard',
              'Yes, but only if you find a serious bug',
              'Only after asking in a public forum',
            ],
            correctIndex: 1,
            explanation: 'An out-of-scope exclusion always beats an in-scope wildcard. blog.example.com is off limits despite matching *.example.com.',
          },
        ],
      },
      {
        slug: 'duplicates-and-triage-reality',
        title: 'Duplicates, N/A and Triage Reality',
        summary: 'Most reports are duplicates or rejected. Knowing why keeps you sane.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You find a bug, write it up, feel great, and get back a single word: "Duplicate". It stings. It also happens constantly, and it is not a sign you did something wrong. Popular targets get tested by hundreds of hunters, so the common bugs get found again and again. Understanding the status words the triager uses is what stops each one from feeling like a personal insult.',
          },
          {
            type: 'paragraph',
            text:
              'Here is what actually happens on the other side. Your report lands in a queue. A triager opens it, reads your steps, and tries to reproduce the bug on the live system. Then they assign a status, and each status means something specific. Duplicate means the bug is real but someone reported it before you. Not applicable (N/A) means it is not actually a security issue - it works as designed. Informative means you observed something real but it has no security impact worth fixing. Triaged means a human confirmed the bug and it is now queued for a fix. Resolved means the fix shipped, and this is usually where the payout lands. Reading these correctly tells you whether to feel encouraged, adjust, or move on.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one triage exchange so the words feel concrete. You report: "IDOR on /api/invoices - changing the id shows other users\' invoices." The triager replies: "Confirmed reproducing with a second test account, marking Triaged, severity High." A week later: "Fix deployed, please retest." You retest, the bug is gone, and the status flips to Resolved with the reward. Contrast the unhappy version: you report "the server discloses its version in a header." The triager replies "This is informative - version disclosure alone has no direct impact - closing as Informative." No payout, but no crime either; you just learned where this program draws its impact line.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Duplicate** - someone reported the same bug first. No pay, but your finding was real.',
              '**Not applicable (N/A)** - it is not actually a security issue; it works as intended.',
              '**Informative** - a real observation with no meaningful impact.',
              '**Triaged** - a human confirmed it; now you wait for a fix and the payout.',
              '**Resolved** - fixed, and where the reward usually lands.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The fix for a wall of duplicates is not to work faster or file sloppier reports quicker. It is to hunt where fewer eyes are looking - newer or private programs - or to find the deeper bugs the crowd skims past. A duplicate on a chained, multi-step bug is far rarer than a duplicate on the obvious one everyone tries first.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Duplicates are proof you are close',
            text:
              'A duplicate means your finding was real and someone just beat you to it. That is a much better signal than an N/A - you are hunting in the right place, you just need to be earlier or dig deeper.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You understand the triage states, can read a triage reply without taking it personally, and know duplicates mean adjust rather than quit.',
          },
          { type: 'practice_ref', title: 'Bug Bounty 101 check', exerciseSlug: 'bug-bounty-101-quiz' },
          {
            type: 'quiz',
            question: 'Your report comes back as "Duplicate". What does that tell you?',
            options: [
              'The bug was fake',
              'The bug was real but someone reported it first',
              'You broke the rules',
              'The program is closed',
            ],
            correctIndex: 1,
            explanation: 'A duplicate confirms your finding was valid - another hunter simply reported it before you. It means adjust where or how you hunt, not quit.',
          },
        ],
      },
      {
        slug: 'money-and-expectations',
        title: 'Money and Expectations',
        summary: 'Set honest expectations about income so you do not quit in month two.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The fastest way to quit bug bounty is to start with the wrong money expectations. Income here is spiky and unpredictable, especially early on. Some hunters do earn well, many earn a little, and most beginners earn nothing for months while their skill catches up. That is normal, not a sign you are failing.',
          },
          {
            type: 'paragraph',
            text:
              'Here is why the money is lumpy rather than steady. You are not paid per hour or per report - you are paid per valid, unique bug, and the size scales with severity. A low-severity finding pays a small reward; a critical one pays far more. But whether you find anything at all in a given week is genuinely variable: some weeks you find nothing, then one good session produces a real bug. So the income arrives in bursts - a dry stretch, then a payout, then another dry stretch. Averaged over a year it may look reasonable, but week to week it is nothing like a salary, and budgeting as if it were one is how people get into trouble.',
          },
          {
            type: 'paragraph',
            text:
              'The healthiest frame for the first several months is "paid in skill, not paid in cash". Every hour you spend on recon, testing, and writing reports is building the ability that will later produce paid bugs - the payout just arrives with a delay. Treat early hunting like an apprenticeship you are doing on the side, keep whatever stable income you already have, and let the bounties be the upside rather than the plan. Hunters who quit their job on the promise of bounties, before they have a track record, are the ones who burn out fastest.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Rewards scale with severity - low bugs pay small, critical bugs pay far more.',
              'You are paid per valid unique bug, never per hour or per report filed.',
              'Income arrives in bursts: a dry stretch, then a payout, then another gap.',
              'Do not quit a stable job on the promise of bounties before you have a track record.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'A budget that survives the dry months',
          },
          {
            type: 'paragraph',
            text:
              'The mistake is not "earning little" - it is building your life on money that has not arrived yet. So separate the two clearly. Your rent, food and bills come from stable income you already have: a job, a stipend, family support. Bounties are extra - they go into savings or something fun, never into next month\'s rent. Then let the timeline be honest: expect roughly the first three to six months to be mostly learning, where a couple of small findings would be a good result, not a bad one. When you frame it that way, an empty week is a normal week, not a crisis, and you stay in the game long enough for the skill to compound.',
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'my-first-year-plan.md',
            code:
              '# my bug bounty plan\n\n## money rules\n- rent + bills + food  -> from my day job / stipend (NOT bounties)\n- any bounty earned     -> savings, treated as a bonus\n- I will NOT quit my job until: 6+ months of steady valid reports\n\n## time budget\n- ~1 focused hour a day, one target for weeks at a time\n\n## honest milestones (skill, not cash)\n- month 1-2: finish the labs, understand the common bug classes\n- month 3-4: file my first VALID report (even a duplicate counts as a win)\n- month 5-6: a few valid reports, maybe a first small payout\n- rule: I judge myself on valid reports filed, not rupees earned',
          },
          {
            type: 'paragraph',
            text:
              'Copy that template into a real file and fill in your own numbers before you hunt a single target. The "money rules" section is the important half - it fixes in writing that bounties never touch your essential expenses, which is the single habit that stops a bad month from becoming a reason to quit. The "honest milestones" section deliberately measures the first six months in valid reports rather than money, because that is what you actually control: you cannot force a payout, but you can control whether you filed a clean, valid report this month. Revisit the file every month and update it - it turns "am I failing?" into a checklist you can answer honestly.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A duplicate is not a wasted month',
            text:
              'In the early months, a valid report that comes back as a duplicate still counts as a win on your plan. It proves you hunted in the right place and found a real bug - the money part is just timing you will fix later by hunting earlier or deeper.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Beware the highlight reel',
            text:
              'The huge payouts you see on social media are the rare wins people choose to post, not the daily average. Nobody tweets their empty weeks. Plan around the average, not the jackpot.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You have realistic money expectations - lumpy, skill-first, delayed - and a written plan that keeps bounties off your rent so a slow month cannot push you out of the game.',
          },
          {
            type: 'quiz',
            question: 'What is a healthy expectation for a beginner hunter?',
            options: [
              'A steady salary from week one',
              'Guaranteed critical bugs every month',
              'Little to no income at first while skill builds',
              'Instant riches from one report',
            ],
            correctIndex: 2,
            explanation: 'Early bug bounty income is usually low or zero and arrives in bursts. Treat the first months as paid-in-skill; the money follows, with a delay.',
          },
        ],
      },
    ],
  },
  {
    slug: 'hunting-methodology',
    title: 'Hunting Methodology',
    description:
      'A repeatable process for finding bugs beats clicking around at random. You will pick targets that fit your skills, run the same recon-to-report loop on every one, keep notes good enough to rebuild a report, and learn when a lead is worth another hour versus a dead end to drop. By the end you can hunt methodically around a busy life instead of waiting for luck or a free weekend.',
    lessons: [
      {
        slug: 'picking-a-target',
        title: 'Picking a Target',
        summary: 'The right target for you is not the biggest one. It is the one you can actually dig into.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Beginners rush to the biggest, most famous programs, because those are the names they recognise. Those are also the most crowded programs on the platform, which means every easy bug was found and reported long ago. A smaller, newer, or less glamorous target is usually the smarter pick, and choosing well is half of your success before you send a single request.',
          },
          {
            type: 'paragraph',
            text:
              'Judge a target against a few concrete criteria rather than by its logo. Look at scope size first: a program with a broad scope - many domains, a wildcard, several apps - gives you more surface to explore, so you are not fighting the whole crowd over one login page. Look at age next: a program that launched recently has less picked-over ground than one that has been public for years. Match the technology to what you actually understand: if you know how APIs and JSON work, hunt an API-heavy app where that knowledge is an edge; if you understand web sessions, pick something with rich account features. And check the noise: a target everyone is currently swarming (because it just paid a famous bounty) is the worst time to arrive.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one comparison. Program A is a household-name site, public for four years, scope of one main domain, and it is trending because someone just posted a big payout. Program B launched last month, has a wildcard scope across a dozen subdomains, and runs the kind of API-heavy app you happen to understand. Program A will be swarmed and swept; almost everything obvious is gone. Program B has more surface, fewer hunters, and plays to your strength. The famous name feels safer, but Program B is where a beginner actually finds something.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Prefer a broad scope - more surface means less crowding on any one feature.',
              'Newer programs have less picked-over ground than long-public ones.',
              'Match the tech to your skills. If you know APIs, hunt API-heavy apps.',
              'Avoid a target everyone is currently swarming after a public payout.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'It is like fishing. A crowded, famous spot has ten anglers per fish and the water is churned. A quieter pond nobody talks about, that happens to suit your bait, can be far more generous - and you actually get room to work.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Depth beats breadth',
            text:
              'One target you know deeply will out-earn ten targets you skim. Commit to a target before you hunt it, and give it enough time to learn how it really works.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can pick a target by scope, age, tech-fit and crowding instead of chasing the loudest name.',
          },
          {
            type: 'quiz',
            question: 'Why might a smaller or newer program be a smart pick for a beginner?',
            options: [
              'It pays more per bug automatically',
              'It has less picked-over surface than crowded famous programs',
              'It has no rules',
              'It never marks duplicates',
            ],
            correctIndex: 1,
            explanation: 'Less crowded targets have more unfound bugs. Famous programs have already been swept by many hunters, so the easy findings are gone.',
          },
        ],
      },
      {
        slug: 'a-repeatable-hunting-workflow',
        title: 'A Repeatable Hunting Workflow',
        summary: 'Same steps, every target. A workflow turns luck into a system.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/bug-bounty-lifecycle',
            alt: 'Recon, test, prove, report, triage, bounty as a six step flow',
            caption: 'Most people optimise the first two steps. The money is in the middle.',
          },
          {
            type: 'paragraph',
            text:
              'The diagram above shows a hunt as a loop: recon, understand, test, verify, report, and then triage and bounty on the platform\'s side. Good hunters are not smarter on every single bug. They follow the same steps every time, so nothing gets skipped. That consistency is what separates them from people who poke around at random and rely on stumbling into something.',
          },
          {
            type: 'paragraph',
            text:
              'Read the loop stage by stage, because each stage does a distinct job. Recon is mapping: you enumerate every asset, subdomain, endpoint and feature so you know the full surface before you attack any of it. Understand is the step everyone skips and should not: you use the app the way a normal user would, so you learn how it is meant to behave - you cannot spot the abnormal until you know the normal. Test is where you probe each feature for the common bug classes. Verify is confirming the bug reproduces and figuring out its real impact, not just its existence. Report is writing it up clearly enough that a triager reproduces it without asking you anything. The last two boxes - triage and bounty - happen on the other side, but your report quality decides how they go.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Recon - map every asset, subdomain, endpoint and feature of the target.',
              'Understand - use the app normally and learn how it is meant to work.',
              'Test - probe each feature for the common bug classes.',
              'Verify - confirm the bug reproduces and work out its real impact.',
              'Report - write it up so a triager can reproduce it with no questions.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete pass through the loop on a photo-sharing app. Recon: you map `/login`, `/profile`, `/upload`, `/api/posts`, and an `/api/admin` you were not meant to find. Understand: you create an account, upload a photo, edit your profile, and watch the requests in your proxy so you know the normal flow. Test: on `/api/posts/123` you change the id to another number. Verify: it returns a private post that is not yours, and you confirm it works from a fresh second account too - so the impact is "any user can read any private post". Report: you write the exact steps. Skip the Understand stage and you would never have known that post was supposed to be private, so you would not have recognised the bug when it appeared.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a pilot checklist. Even experts run the checklist every flight, because memory misses one item on a tired day and the checklist never does. Your workflow is that checklist - it is what makes a good day repeatable instead of a fluke.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Understand before you attack',
            text:
              'You cannot break logic you do not understand. Spend real time using the app normally, watching its requests, before you try to abuse it - the abnormal only stands out against the normal.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You have a repeatable recon-to-report loop you can run on any target, so you stop relying on luck and start relying on process.',
          },
          {
            type: 'quiz',
            question: 'Why do experienced hunters follow a fixed workflow?',
            options: [
              'It guarantees a bug every time',
              'So they never skip a step and can repeat their successes',
              'Because the platform requires it',
              'To slow down on purpose',
            ],
            correctIndex: 1,
            explanation: 'A repeatable workflow stops you skipping steps like understanding the app, and turns one-off wins into a reliable, repeatable process.',
          },
        ],
      },
      {
        slug: 'taking-notes-and-tracking-tests',
        title: 'Notes and Test Tracking',
        summary: 'If you did not write it down, you will test the same thing twice and forget the good stuff.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Hunting a real app means running hundreds of small tests across dozens of endpoints. Without notes you forget what you already tried, lose half-found leads, and cannot write a clean report when you finally confirm a bug. Note-taking is the least glamorous skill in hunting and it is not optional - it is the thing that turns scattered poking into a report that gets paid.',
          },
          {
            type: 'paragraph',
            text:
              'A good notes system tracks four things as you go, not from memory afterwards: every endpoint you touched and what you tested on it, the interesting responses (saved, not remembered), the leads worth returning to, and enough detail to rebuild the whole report from scratch. The trick is to write the note the moment something happens, because "I will remember that" is a lie your tired brain tells you an hour before it forgets.',
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'findings.md',
            code:
              '# example-target notes\n\n## endpoints tested\n- GET /api/posts/:id   -> tried id swap, LEAK (see below)\n- POST /api/upload     -> tried oversized file, rejected cleanly\n- GET /api/profile     -> tried missing cookie, redirects to login (ok)\n\n## leads to revisit\n- /api/admin returns 403 not 404 - something is there, come back\n\n## finding: IDOR on /api/posts/:id\n- request: GET /api/posts/501  (logged in as me, user A)\n- expected: 403, post 501 is user B\'s private post\n- got: 200 + full private post for user B\n- repro: log in, open own post, change id in URL to 501\n- evidence: screenshot posts-501-leak.png',
          },
          {
            type: 'paragraph',
            text:
              'Use that structure as a template. The "endpoints tested" section stops you retesting the same thing next session - a glance tells you `/api/upload` already rejected oversized files, so you do not waste your limited time repeating it. The "leads to revisit" section is where you park anything odd, like a `403` where you expected a `404`, so a promising thread is not lost when your hour runs out. And the "finding" section is written in the exact shape a report needs - request, expected, got, repro, evidence - so when the bug is confirmed you copy it almost straight into the platform. The note is not extra work; it is the report, written early.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Track every endpoint and what you tested on it, so you never retest blindly.',
              'Save interesting responses and screenshots the moment you see them.',
              'Park leads to revisit, so an odd result is not lost when your session ends.',
              'Write findings in report shape - request, expected, got, repro, evidence.',
            ],
          },
          {
            type: 'command',
            description: 'Start a simple notes folder for a target from your terminal:',
            commands: ['mkdir -p notes/example-target', 'touch notes/example-target/findings.md'],
          },
          {
            type: 'paragraph',
            text:
              'Those two commands create a folder for the target and an empty `findings.md` inside it. `mkdir -p` makes the folder (and any missing parent) without complaining if it already exists, and `touch` creates the empty file so you have somewhere to write immediately. One folder per target keeps different hunts from bleeding into each other; open the file at the start of every session and it becomes the running record you build the report from.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Future you is forgetful',
            text:
              'Come back after a week and your untracked leads are simply gone - you will not remember the odd 403 or which payload behaved strangely. Write the note now, not "later".',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'Your notes now capture what you tested, what to revisit, and findings in report shape - which makes the final report almost write itself.',
          },
          {
            type: 'quiz',
            question: 'Why are notes essential during a hunt?',
            options: [
              'They are required by law',
              'They stop you retesting the same thing and let you write the report from real records',
              'They increase your payout automatically',
              'They replace the need to test',
            ],
            correctIndex: 1,
            explanation: 'Notes track what you covered, preserve half-found leads, and hold findings in report shape, so writing a clean, reproducible report becomes far easier.',
          },
        ],
      },
      {
        slug: 'when-to-dig-and-when-to-move-on',
        title: 'When to Dig, When to Move On',
        summary: 'Knowing when to abandon a lead is as valuable as finding one.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Every hunter has burned a full day on a "bug" that was never there. The skill that separates efficient hunters from stuck ones is knowing when a lead is worth another hour and when it is a dead end to drop. Both directions are decisions you make on purpose, not moods you drift into.',
          },
          {
            type: 'paragraph',
            text:
              'Dig deeper when the signals point somewhere. A response that looks unusual - a different length, an error that leaks a file path, a status code you did not expect - is worth chasing, because something is behaving differently and difference is where bugs live. A feature that clearly trusts input it should not - a price sent from the client, an id you can change, a role in a token - is worth real time. Conversely, move on when you are out of fresh angles and only hope is left, or when the best possible outcome is tiny - if a lead, even if it works, would only be an informative-severity finding, your limited hours are better spent elsewhere.',
          },
          {
            type: 'paragraph',
            text:
              'Make it concrete with a soft rule you can actually apply. Set a mental timer per lead - say thirty focused minutes. If in that window the lead has moved (a new odd response, a partial result, a narrowing of what is happening), it has earned another block of time. If it has not moved at all - same wall, no new information, you are just retrying variations of the same failed idea - park it in your notes and switch to something else. You are not giving up on it forever; you are choosing to spend the next hour where the odds are better, and you can return to a parked lead later with fresh eyes.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Dig when a response looks unusual - odd length, a leaked path, an unexpected code.',
              'Dig when a feature clearly trusts user input it should not.',
              'Move on when you have no new angle and only hope is left.',
              'Move on when the best possible impact is tiny even if the lead works.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'The 30-minute lead check',
          },
          {
            type: 'paragraph',
            text:
              'Turn the judgement into a routine you run out loud (or in your notes) so it does not depend on mood. When a lead has eaten thirty focused minutes, stop and ask four questions in order: did anything change in the last half hour, do I have a genuinely new angle to try, and if this works what is the realistic best-case impact. If the honest answers are "nothing moved, no new angle, small impact", you park it. If even one answer is strong - it moved, or the impact would be large - it earns another block. Writing the answers down matters, because a vague feeling of "maybe there is something here" is exactly the trap that eats a whole afternoon.',
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'lead-check.md',
            code:
              '## lead: 403 on /api/admin (30 min in)\n\n1. Did anything move in the last 30 min?   -> no, still a flat 403\n2. Do I have a NEW angle to try?           -> no, tried all headers/verbs I know\n3. Best-case impact if it works?           -> unknown, but admin = potentially high\n4. Verdict                                 -> PARK (no movement, no angle)\n   note to revisit: 403 not 404 means it exists - come back with auth ideas\n\n## lead: odd length on /api/posts/:id (30 min in)\n\n1. Did anything move?    -> YES, id 501 returned a longer body than mine\n2. New angle to try?     -> YES, test a second account, confirm it is user B\'s\n3. Best-case impact?     -> HIGH, looks like any user can read any post\n4. Verdict               -> DIG (moved + high impact)',
          },
          {
            type: 'paragraph',
            text:
              'Use that as a literal template - two worked leads, filled in. Notice how the same "30 minutes, no answer yet" situation resolves differently: the admin `403` gets parked because nothing moved and you are out of ideas, but it is parked WITH a note ("403 not 404 means it exists") so it is not lost - a parked lead is saved, not deleted. The posts lead gets more time because it moved and the impact is high, so the next thirty minutes are clearly worth spending. The point of writing it down is that the verdict comes from the answers, not from how stubborn or bored you feel in the moment.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Park it, do not bin it',
            text:
              'Moving on does not mean deleting the lead. Write a one-line note on where you got stuck and what to try next, so a fresh session (or a new idea) can pick it straight back up instead of starting over.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Sunk cost is not a strategy',
            text:
              'The time you already spent on a lead is gone whether you continue or not. The only real question is whether the NEXT hour is worth more spent here or somewhere better. "But I already spent all afternoon on it" is not a reason to spend the evening too.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can judge when a lead deserves more time and when to park it, using signals and a written 30-minute check instead of stubbornness.',
          },
          {
            type: 'quiz',
            question: 'When is it usually right to move on from a lead?',
            options: [
              'The moment it gets slightly hard',
              'When you have no new angle and any impact would be tiny',
              'Never - always finish what you start',
              'Only after a full week on it',
            ],
            correctIndex: 1,
            explanation: 'Drop a lead when you are out of fresh angles and the best possible payoff would be small. Chasing it further is sunk cost, not strategy.',
          },
        ],
      },
      {
        slug: 'hunting-with-limited-time',
        title: 'Hunting With 1 Hour a Day',
        summary: 'A job and a life do not rule out bug bounty. You just hunt differently.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Most beginners have a day job or college and maybe one hour to hunt. That is completely fine - plenty of good hunters work this way. What you cannot do is sprawling recon across new targets every night, so you play a tighter game built around one target and small, focused sessions that each finish something.',
          },
          {
            type: 'paragraph',
            text:
              'The strategy has four parts, and each one exists to protect your scarce time. First, pick one target and stay on it for weeks - switching targets wastes your hour on re-learning instead of testing. Second, do the slow, one-time recon once (map the assets, endpoints and features into your notes) and then reuse that map every session, so you never pay the recon cost twice. Third, scope each session to one thing - one feature, or one bug class across the app - so you actually finish it instead of leaving ten half-tested threads. Fourth, and most important, end every session with a written resume note: exactly where you stopped and what to do next. That note is what lets tomorrow\'s hour start with testing instead of remembering.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete week. Monday you do recon once and map the app into your notes. Tuesday you test the login and account features and write "next: test the upload endpoint for id tampering". Wednesday you open your notes, read that line, and go straight to the upload endpoint - no time lost re-orienting. Thursday you follow a lead the upload test opened. Each night is a small, complete step, and the resume note stitches them into one continuous hunt even though you were never at it for more than an hour. Compare that to switching targets nightly, where every session is spent re-learning and nothing ever gets tested to completion.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Pick one target and stay on it for weeks, not one per night.',
              'Do slow recon once, then reuse that map every session.',
              'Each session, test one feature or one bug class fully.',
              'End every session with a note on exactly where to resume.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'It is like learning an instrument. One focused hour a day, every day, beats a chaotic ten-hour binge once a month - the daily reps compound, and you never have to relearn what you forgot in the three weeks between binges.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not restart cold each night',
            text:
              'Without a resume note you spend your one hour just remembering where you were and what you already tried. Write down where you stopped and the next step, so tomorrow you hit the ground running instead of warming up.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You have a realistic plan to hunt around a busy life - one target, recon reused, one thing per session, and a resume note that links your hours together.',
          },
          { type: 'practice_ref', title: 'Hunting Methodology check', exerciseSlug: 'hunting-methodology-quiz' },
          {
            type: 'quiz',
            question: 'With only an hour a day, what is the smartest approach?',
            options: [
              'Jump to a new target every night',
              'Do full recon from scratch each session',
              'Stick to one target, reuse recon, and test one thing per session',
              'Wait for a free weekend instead',
            ],
            correctIndex: 2,
            explanation: 'Limited time rewards focus - one target, recon done once and reused, a single feature or bug class per short session, and a resume note to link the hours.',
          },
        ],
      },
    ],
  },
  {
    slug: 'reporting',
    title: 'Reporting',
    description:
      'The skill that turns a raw finding into a fixed bug and a payout. You will learn to disclose responsibly and legally, structure a report a triager can reproduce on the first read, build a harmless proof of concept, tell the impact story that earns severity, and handle pushback and retests without losing your reputation. By the end your findings actually get paid instead of closed.',
    lessons: [
      {
        slug: 'responsible-disclosure',
        title: 'Responsible Disclosure',
        summary: 'Finding a bug is half the job. Handling it responsibly is the other half.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Finding a bug gives you power, and how you use it decides whether you are a helper or a threat. Responsible disclosure means you tell the right people privately, give them reasonable time to fix it, and do not leak or abuse the bug in the meantime. It is not a courtesy - it is the line between security research and a crime.',
          },
          {
            type: 'paragraph',
            text:
              'The rules are concrete, and each one has a reason. Report through the official channel - the program on the platform, or a published security contact - never a public tweet, because a public bug is a gift to every criminal watching before the fix ships. Give the team reasonable time to fix before you say anything publicly, because a live unpatched bug you have announced is actively dangerous to real users. Never access or exfiltrate real user data to "prove" impact - a proof does not require you to actually read other people\'s information, and doing so is itself unauthorised access. And never demand payment as a threat ("pay me or I release it"), because that stops being research and becomes extortion, which is a serious crime regardless of how the bug was found.',
          },
          {
            type: 'paragraph',
            text:
              'Picture finding a spare key that opens your neighbours\' flats. The responsible move is to quietly hand it to the building manager and let them change the locks. The irresponsible moves are all obvious once you use the analogy: opening every door to "see how bad it is" (accessing real data), posting a photo of the key online before the locks change (public disclosure), or telling the manager "pay me or I start letting people in" (extortion). The technique - noticing the key works - is the same in every case; only what you do next decides which side of the law you are on.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Report through the official channel, not a public post.',
              'Give the team reasonable time to fix before disclosing anything publicly.',
              'Never access or exfiltrate real user data to "prove" impact.',
              'Do not demand payment as a threat - that crosses into extortion.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'The path from finding to fixed',
          },
          {
            type: 'paragraph',
            text:
              'Responsible disclosure is a sequence, not a single moment. Walk it end to end. You find the bug and stop - you do exactly enough to confirm it is real, on your own test accounts, and no more. You report it through the official channel with clear steps. You wait while the team reproduces, confirms, and fixes it, keeping the details private the whole time. When they say it is fixed, you retest to confirm the hole is actually closed. Only after it is fixed - and usually only with the team\'s agreement - does anything become public. Each step protects real users: the bug stays secret from criminals until the moment it can no longer hurt anyone.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Confirm the bug on your own test accounts, minimally - do not exploit further.',
              'Report privately through the official channel with clear reproduction steps.',
              'Wait while the team reproduces and fixes it; keep the details private.',
              'Retest once they say it is fixed, to confirm the hole is truly closed.',
              'Only go public after the fix, and usually only with the team\'s agreement.',
            ],
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'first-contact.md',
            code:
              'Subject: Security issue on app.example.com - access control on invoices\n\nHello team,\n\nI found a security bug and I am reporting it privately so it can be fixed\nbefore anyone can misuse it.\n\nWhat: a logged-in user can view another user\'s invoice by changing the id\nin the URL.\n\nSteps: (full numbered steps + screenshot attached)\n\nI tested only with my own two test accounts and did not access any real\nuser data. I am happy to help verify the fix whenever it is ready.\n\nThanks,\n<your handle>',
          },
          {
            type: 'paragraph',
            text:
              'Use that message as a template for first contact when a program has an email or form rather than a slick platform inbox. Three lines in it are doing quiet, important work. "I am reporting it privately so it can be fixed before anyone can misuse it" signals you understand disclosure - you are a helper, not a threat. "I tested only with my own two test accounts and did not access any real user data" protects you legally and reassures the team you did not cross a line to get the proof. And "happy to help verify the fix" opens the door to the retest step. Notice what the template does NOT contain: no deadline ultimatum, no mention of payment, no hint that you might go public. That tone is what gets a report taken seriously instead of treated as a threat.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Silence is not a green light',
            text:
              'If a team is slow or quiet, that still does not authorise you to go public or to dig further into real data. Follow the program\'s stated disclosure timeline, and if there is none, ask - politely - rather than deciding for yourself.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test what you are authorised to, and never touch real user data. Proving impact does not justify breaking the rules or the law - a demonstration on your own test accounts is enough.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the full responsible-disclosure path - confirm, report privately, wait, retest, then go public - and how to word a first-contact message that reads as a helper, not a threat.',
          },
          {
            type: 'quiz',
            question: 'Which of these is responsible disclosure?',
            options: [
              'Tweeting the bug for clout before it is fixed',
              'Reporting privately and giving time to fix before going public',
              'Downloading real user data to prove impact',
              'Threatening to leak unless they pay',
            ],
            correctIndex: 1,
            explanation: 'Report privately through the official channel and allow time to fix. Public disclosure before a fix, touching real data, and payment threats are all unsafe or illegal.',
          },
        ],
      },
      {
        slug: 'writing-a-report-that-gets-paid',
        title: 'Writing a Report That Gets Paid',
        summary: 'A great bug with a bad report gets closed. A clear report gets fixed and paid.',
        estimatedMinutes: 9,
        importance: 'essential',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/report-anatomy',
            alt: 'The six sections of a good vulnerability report in order',
            caption: 'This shape gets read. A wall of text gets queued.',
          },
          {
            type: 'paragraph',
            text:
              'A triager reads dozens of reports a day. The diagram above shows the shape they are hoping to see: title, summary, steps, impact, proof. If your report is a confusing wall of text, they cannot reproduce the bug, and a bug they cannot reproduce gets marked N/A no matter how real it was. A clear report that reproduces on the first read is what actually earns the bounty - the writing is not a formality, it is the deliverable.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The shape of a good report',
          },
          {
            type: 'paragraph',
            text:
              'Every strong report has the same sections, and each one answers a question the triager is about to ask. The title says what the bug is and where, in one line. The summary says what it is and why it matters in two sentences, so a busy reader gets the gist before the details. The steps to reproduce are numbered, exact, and gap-free - this is the section that gets you paid or gets you closed. The impact says what an attacker could actually do. The proof - a request and response, a screenshot, or a short clip - is the evidence that you did not just describe the bug, you demonstrated it.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Title - the bug and the asset, in one line.',
              'Summary - what it is and why it matters, in two sentences.',
              'Steps to reproduce - numbered, exact, no gaps.',
              'Impact - what an attacker could actually do.',
              'Proof - request and response, a screenshot, or a short clip.',
            ],
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'report.md',
            code:
              '## Title\nIDOR - any user can read another user\'s invoice on app.example.com\n\n## Summary\nAn attacker can view another user\'s invoice by changing the id in the URL. Any logged-in user can read every user\'s private invoice.\n\n## Steps to reproduce\n1. Log in as your own account (user A).\n2. Open GET /api/invoices/1042 - this is your own invoice.\n3. Change 1042 to 1041 - you now see user B\'s invoice, which is not yours.\n\n## Impact\nAny logged-in user can read every other user\'s private invoices, exposing names, amounts and addresses.\n\n## Proof\nScreenshot invoice-1041-leak.png shows user B\'s invoice loaded from user A\'s session.',
          },
          {
            type: 'paragraph',
            text:
              'Use that template literally - fill each heading and keep the order. Notice what the steps do: they start from a clean state ("log in as your own account"), they establish the baseline ("this is your own invoice"), and then they make the one change that triggers the bug ("change 1042 to 1041"). A triager can paste those steps and reach the same result without messaging you a single question. That is the whole target: a report that reproduces itself. Vague steps like "change the id and it leaks" force the triager to guess, and a guessing triager closes the report and moves on.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Write for a tired stranger',
            text:
              'Assume the reader has no context about your finding and little patience for a wall of text. If they can reproduce the bug from your steps without asking you a single question, you nailed it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can structure a report a triager reproduces on the first try - title, summary, exact steps, impact, proof - which is the thing that actually gets you paid.',
          },
          {
            type: 'quiz',
            question: 'What is the most important quality of a bug report?',
            options: [
              'Long paragraphs of theory',
              'Clear, exact steps a triager can reproduce without asking questions',
              'Fancy formatting and colours',
              'A big list of every tool you used',
            ],
            correctIndex: 1,
            explanation: 'If the triager can reproduce the bug from your steps alone, the report succeeds. Reproducibility beats everything else, including length and formatting.',
          },
        ],
      },
      {
        slug: 'proof-of-concept-craft',
        title: 'Proof-of-Concept Craft',
        summary: 'A clean proof shows the bug is real without doing any actual harm.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Proof of concept craft - proving a bug without causing damage'),
          {
            type: 'paragraph',
            text:
              'A proof of concept, or PoC, is the minimum demonstration that your bug is real. The craft is in the word minimum: it should be exactly enough to convince the team, and no more. A PoC that actually causes damage is not impressive - it is a second problem you created on top of the bug, and it can turn a valid report into a rules violation.',
          },
          {
            type: 'paragraph',
            text:
              'The rules of a clean PoC follow from that principle. Show the bug with the smallest possible example - one request, one changed value, one screenshot. Use a harmless marker instead of a real destructive payload, so you prove the mechanism without triggering the harm. Never touch real user data; do the whole thing between your own test accounts so nobody real is affected. And keep it repeatable, so the person fixing it can run your PoC, apply their patch, and confirm the patch closed the hole.',
          },
          {
            type: 'paragraph',
            text:
              'Walk two concrete cases so "harmless marker" is clear. For a cross-site scripting bug, you need to prove that script you injected actually runs. The harmless proof is a payload like `alert(1)` (or printing a fixed string) - if the alert box pops, script executes, point made. You do NOT need to write a payload that steals real users\' cookies to demonstrate the bug; the alert already proves code runs. For an access-control bug, the clean proof is to create two of your own test accounts, and show account A reading account B\'s data by changing an id. You have proven "one user can read another\'s data" without ever opening a real customer\'s record. In both cases the demonstration is complete and nobody real was harmed.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Show the bug with the smallest possible example - one request, one change.',
              'Use a harmless marker (like alert(1) or a fixed string), not a destructive payload.',
              'Never touch real user data - use your own test accounts on both sides.',
              'Keep it repeatable, so the fixer can confirm their patch actually closes it.',
            ],
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Build and run your PoC only on systems you own or are explicitly authorised to test, and only against your own test accounts. Proving impact never justifies touching real users\' data.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A PoC can go too far',
            text:
              'Deleting data, mass-scanning, or accessing other people\'s accounts to "prove" impact can break the program rules and the law. Prove it, do not exploit it - a demonstration is not an attack.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can build a proof that is convincing and completely harmless at the same time - minimal, marker-based, on your own accounts, and repeatable.',
          },
          {
            type: 'quiz',
            question: 'What makes a good proof of concept?',
            options: [
              'It causes maximum damage to prove severity',
              'It is the smallest harmless demonstration that the bug is real',
              'It uses real user data',
              'It is as complex as possible',
            ],
            correctIndex: 1,
            explanation: 'A good PoC is minimal and harmless - just enough to convince the team, using a harmless marker and your own test accounts, and repeatable so the fix can be verified.',
          },
        ],
      },
      {
        slug: 'impact-storytelling-and-severity',
        title: 'Impact Storytelling',
        summary: 'The same bug pays more when you clearly explain what an attacker could do with it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/severity-matrix',
            alt: 'Impact plotted against ease of exploitation with example findings',
            caption: 'Severity is impact times how easily anyone can do it.',
          },
          {
            type: 'paragraph',
            text:
              'Two hunters find the identical bug. One writes "there is an IDOR here". The other writes "any logged-in user can read every other user\'s private invoices, including names, amounts and addresses". Same bug, but the second report shows real impact - and impact drives severity, severity drives the reward. The diagram above is the mental model: severity is roughly how bad the outcome is, multiplied by how easily anyone could pull it off.',
          },
          {
            type: 'paragraph',
            text:
              'Telling the impact story well means answering specific questions in your report. Who is affected - just you, one specific user, or every user of the app? What is exposed or changed - personal data, money, account access, admin control? Can it be chained - a small bug on its own might be low severity, but combined with another it can escalate to critical, and saying so lifts the whole finding. And crucially, be honest - inflating impact you cannot actually demonstrate gets your report downgraded and hurts your credibility with that team, which costs you far more than the one report.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the severity ladder with concrete examples so the levels feel real. Reading one public, already-visible setting via an unusual request is low - the data was not secret. Reading another user\'s private profile data is medium - real exposure of information that should have been protected. Being able to read every user\'s data, or take over any account, is critical - the impact is total and it affects everyone. Your report should make the reader land on the right rung themselves. Do not just write "high severity"; walk them through the realistic worst case step by step - "an attacker enumerates ids from 1 upward and downloads every invoice in the system" - so they reach the severity conclusion from your evidence rather than your adjective.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Say who is affected - one user, or everyone.',
              'Say what is exposed or changed - data, money, access, admin control.',
              'Chain it - a small bug plus another can escalate to critical; say so.',
              'Be honest - inflating impact you cannot back up gets you downgraded.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Show, do not just claim',
            text:
              'Do not just assert "high impact". Walk the reader through the realistic worst case, step by step, so they reach that conclusion themselves from your evidence. A claim is arguable; a demonstrated worst case is not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can turn a dry finding into a clear, honest impact story - who, what, chaining, worst case - that earns the severity it deserves.',
          },
          {
            type: 'quiz',
            question: 'Why does impact storytelling matter for your payout?',
            options: [
              'It does not - only the bug type matters',
              'Clear impact raises severity, and severity drives the reward',
              'Longer reports always pay more',
              'It replaces the need for steps to reproduce',
            ],
            correctIndex: 1,
            explanation: 'Payouts track severity, and severity tracks demonstrated impact. Explaining honestly what an attacker could do, and walking the worst case, lifts both.',
          },
        ],
      },
      {
        slug: 'handling-pushback-and-retests',
        title: 'Pushback and Retests',
        summary: 'Sometimes the team disagrees or the fix is weak. Handle it calmly and professionally.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Not every report is accepted smoothly. A triager may downgrade your severity, question whether the impact is real, or mark the bug fixed when it is not actually closed. How you respond in those moments decides whether you keep your reputation and your place in the program - and reputation is what earns you private invites and gets your future reports taken seriously.',
          },
          {
            type: 'paragraph',
            text:
              'The approach is the same whatever the disagreement: stay polite and factual, and answer with evidence rather than volume. If they downgrade the severity, do not argue that they are wrong - add a demonstration of the worse impact they missed. If they question the impact, walk them through the worst case with a concrete PoC. If they claim it is fixed, that is your cue to retest. A retest is simply re-running your original steps against the patched system: if the bug is gone, confirm it and move on graciously; if it still works, you show the exact bypass, calmly, and note that the fix is incomplete - which is often treated as a fresh finding in its own right.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one triage exchange so the tone is clear. Triager: "We have downgraded this to Low - it only exposes a user\'s display name." You (calm, evidence-first): "Thanks for looking. To clarify the impact: the same endpoint also returns the email and phone in the JSON body, which are not shown in the UI. Steps: [1, 2, 3], screenshot attached showing user B\'s email from user A\'s session. That is why I believe this is Medium rather than Low." Notice what that reply does - it does not accuse, it does not raise its voice, it just supplies the fact the triager did not have. Contrast the version that gets you removed: "This is obviously High, are you even reading it? I\'ll go public if you don\'t fix this." Same disagreement, but one keeps the relationship and one ends it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Stay polite and factual, even when you strongly disagree.',
              'Add evidence rather than raising your voice or repeating yourself louder.',
              'On a retest, re-run your original steps to confirm the fix actually closes the bug.',
              'If a fix is incomplete, show the exact bypass calmly - often a fresh finding.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Reputation is your real currency',
            text:
              'Arguing rudely can get you removed from a program and drag down your standing across the whole platform. Being calm and correct is worth far more than being loud and right - one report is never worth your reputation.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can handle disagreement and retests professionally - evidence over volume, calm bypass demonstrations - protecting both the fix and your reputation.',
          },
          { type: 'practice_ref', title: 'Reporting check', exerciseSlug: 'reporting-quiz' },
          {
            type: 'quiz',
            question: 'A triager downgrades your report and you disagree. Best move?',
            options: [
              'Argue rudely and threaten to go public',
              'Give up and never report again',
              'Respond calmly with extra evidence supporting the impact',
              'Report the same bug ten more times',
            ],
            correctIndex: 2,
            explanation: 'Stay professional and add the evidence they missed. Rudeness and threats cost you reputation and program access; calm facts win the disagreement.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'money-and-expectations',
    slug: 'bug-bounty-101-quiz',
    title: 'Bug Bounty 101 check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'When does a bug bounty hunter get paid?',
        options: [
          'Per hour worked',
          'A fixed monthly salary',
          'For each valid, unique bug',
          'Just for joining a program',
        ],
        correctIndex: 2,
        explanation: 'Payment is per valid, unique finding. No bug, no money.',
      },
      {
        prompt: 'What is a program, in bug bounty terms?',
        options: [
          'The marketplace hosting many companies',
          'One company listing a target and its scope',
          'A type of scanning tool',
          'A payout method',
        ],
        correctIndex: 1,
        explanation: 'A program is a single company target. The platform is the marketplace that hosts many programs.',
      },
      {
        prompt: 'You find a great bug on an out-of-scope asset. What now?',
        options: [
          'Stop - you have no permission there',
          'Report it and demand a bounty',
          'Keep exploiting to show impact',
          'Post it publicly',
        ],
        correctIndex: 0,
        explanation: 'Out of scope means no authorisation. Testing it further has no legal cover.',
      },
      {
        prompt: 'What does a "Duplicate" status mean?',
        options: [
          'Your bug was fake',
          'You broke a rule',
          'The bug was real but reported by someone first',
          'The program is closed',
        ],
        correctIndex: 2,
        explanation: 'A duplicate confirms your finding was valid - another hunter simply got there before you.',
      },
      {
        prompt: 'What is a realistic income expectation for a beginner?',
        options: [
          'A guaranteed salary',
          'Little to no income at first while skill builds',
          'Instant riches from one report',
          'A critical bug every week',
        ],
        correctIndex: 1,
        explanation: 'Early income is usually low or zero and arrives in bursts. The money follows the skill, with a delay.',
      },
    ],
  },
  {
    lessonSlug: 'hunting-with-limited-time',
    slug: 'hunting-methodology-quiz',
    title: 'Hunting Methodology check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why can a smaller or newer program be a smart pick?',
        options: [
          'It always pays more',
          'It has less picked-over surface than crowded programs',
          'It has no rules',
          'It never marks duplicates',
        ],
        correctIndex: 1,
        explanation: 'Less crowded targets have more unfound bugs. Famous programs are already swept by many hunters.',
      },
      {
        prompt: 'Why follow a fixed hunting workflow?',
        options: [
          'It guarantees a bug every time',
          'So you never skip a step and can repeat success',
          'The platform requires it',
          'To slow yourself down',
        ],
        correctIndex: 1,
        explanation: 'A repeatable workflow stops you skipping steps and turns one-off wins into a reliable process.',
      },
      {
        prompt: 'Why keep notes during a hunt?',
        options: [
          'They are legally required',
          'They stop retesting and make reports easier to write',
          'They boost your payout automatically',
          'They replace testing',
        ],
        correctIndex: 1,
        explanation: 'Notes track what you covered, preserve leads, and make writing a clean report far easier.',
      },
      {
        prompt: 'When is it usually right to move on from a lead?',
        options: [
          'The moment it gets hard',
          'When you have no new angle and impact would be tiny',
          'Never - always finish',
          'Only after a full week',
        ],
        correctIndex: 1,
        explanation: 'Drop a lead when you are out of fresh angles and the payoff would be small.',
      },
      {
        prompt: 'With only an hour a day, what is the smartest approach?',
        options: [
          'New target every night',
          'Full recon from scratch each session',
          'One target, reuse recon, test one thing per session',
          'Wait for a free weekend',
        ],
        correctIndex: 2,
        explanation: 'Limited time rewards focus - one target, recon done once, and a single feature per short session.',
      },
    ],
  },
  {
    lessonSlug: 'handling-pushback-and-retests',
    slug: 'reporting-quiz',
    title: 'Reporting check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which of these is responsible disclosure?',
        options: [
          'Tweeting the bug before it is fixed',
          'Reporting privately and allowing time to fix',
          'Downloading real user data to prove impact',
          'Threatening to leak unless paid',
        ],
        correctIndex: 1,
        explanation: 'Report privately through the official channel and give time to fix. The rest are unsafe or illegal.',
      },
      {
        prompt: 'What is the most important quality of a report?',
        options: [
          'Long theory sections',
          'Clear, exact steps a triager can reproduce alone',
          'Fancy colours',
          'A list of every tool used',
        ],
        correctIndex: 1,
        explanation: 'If the triager reproduces the bug from your steps alone, the report succeeds.',
      },
      {
        prompt: 'What makes a good proof of concept?',
        options: [
          'It causes maximum damage',
          'It is the smallest harmless demonstration the bug is real',
          'It uses real user data',
          'It is as complex as possible',
        ],
        correctIndex: 1,
        explanation: 'A good PoC is minimal and harmless, using your own test accounts.',
      },
      {
        prompt: 'Why does impact storytelling matter?',
        options: [
          'It does not - only bug type matters',
          'Clear impact raises severity, which drives the reward',
          'Longer reports always pay more',
          'It replaces reproduction steps',
        ],
        correctIndex: 1,
        explanation: 'Payouts track severity, and severity tracks demonstrated impact.',
      },
      {
        prompt: 'A triager downgrades your report and you disagree. Best move?',
        options: [
          'Argue rudely and threaten to go public',
          'Give up forever',
          'Respond calmly with extra supporting evidence',
          'Report it ten more times',
        ],
        correctIndex: 2,
        explanation: 'Stay professional and add evidence. Rudeness costs reputation and program access.',
      },
    ],
  },
];
