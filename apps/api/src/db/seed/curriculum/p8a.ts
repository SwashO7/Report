import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'bug-bounty-101',
    title: 'Bug Bounty 101',
    description: 'What the job really is, so you go in with eyes open instead of dreams.',
    lessons: [
      {
        slug: 'what-bug-bounty-really-is',
        title: 'What Bug Bounty Really Is',
        summary: 'Companies pay you to find their bugs before the bad guys do. That is the whole deal.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Bug bounty explained honestly - what it is and what nobody tells beginners'),
          {
            type: 'paragraph',
            text:
              'Bug bounty is simple. A company says "here is our website, find security holes, and we will pay you for the real ones." You hunt, you report, they fix and pay. No employment, no salary, no boss.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like being a freelance safety inspector for buildings. You only get paid when you spot a genuine crack, and only for cracks the owner did not already know about.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'You test only what the program allows. Nothing else.',
              'You report clearly, with steps to reproduce.',
              'You get paid per valid, unique bug - not per hour.',
              'No bug, no money. Some months that is zero.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'It is a skill, not a lottery',
            text:
              'Payouts feel random at first. They are not. Consistent hunters have a process. The luck part shrinks as your skill grows.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know exactly what bug bounty is and is not. No movie fantasy, just the real job.',
          },
          {
            type: 'quiz',
            question: 'In bug bounty, when do you get paid?',
            options: [
              'For every hour you spend testing',
              'A fixed monthly salary',
              'Only for valid, unique bugs you report',
              'Just for signing up to a program',
            ],
            correctIndex: 2,
            explanation: 'You earn per valid, unique finding. No bug means no payout, no matter how long you worked.',
          },
        ],
      },
      {
        slug: 'platforms-and-programs',
        title: 'Platforms and Programs',
        summary: 'Where the programs live, and the difference between a platform and a program.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Bug bounty platforms and programs - where hunters actually find work'),
          {
            type: 'paragraph',
            text:
              'A platform is the marketplace. A program is one company listing on it. The platform handles payments, communication and rules. The program is the target you actually test.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Platform** - hosts many programs, handles payouts and reports.',
              '**Program** - one company saying "test us, here is the scope".',
              '**Public program** - anyone can join and start hunting.',
              '**Private program** - invite only, usually after you build a track record.',
              '**VDP** - vulnerability disclosure, often no money, just thanks and reputation.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Start on public programs. Private invites come later, once the platform sees you file good reports and behave professionally.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A VDP is not a payday',
            text:
              'Vulnerability disclosure programs often reward reputation, not cash. Great for learning and building a name, not for paying rent.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell a platform from a program, and public from private, without getting confused.',
          },
          {
            type: 'quiz',
            question: 'What is the difference between a platform and a program?',
            options: [
              'They are the same thing',
              'A platform hosts many programs; a program is one company target',
              'A program hosts many platforms',
              'A platform is only for private invites',
            ],
            correctIndex: 1,
            explanation: 'The platform is the marketplace that hosts many company programs and handles the plumbing.',
          },
        ],
      },
      {
        slug: 'reading-scope-like-a-lawyer',
        title: 'Reading Scope Like a Lawyer',
        summary: 'Scope is the line you do not cross. Read it slowly, twice, before you touch anything.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('Reading bug bounty scope - the page that keeps you out of legal trouble'),
          {
            type: 'paragraph',
            text:
              'Every program has a scope page. It lists what you are allowed to test and what is off limits. Testing something out of scope is not just wasted work - it can get you banned or reported.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**In scope** - the domains, apps and assets you may test.',
              '**Out of scope** - hands off, no matter how juicy the bug looks.',
              '**Allowed testing** - what techniques are permitted.',
              '**Forbidden actions** - things like heavy automated scanning, social engineering, or hitting real user data.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Treat the scope like a rental agreement. If it says "do not enter flat 3B", you do not enter flat 3B, even if the door is unlocked.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Wildcards are a trap for the careless',
            text:
              'A scope like `*.example.com` sounds huge, but often carves out specific subdomains as out of scope further down. Read the whole page, not just the top line.',
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
            text: 'You read a scope page carefully and know exactly where the line is before you start.',
          },
          {
            type: 'quiz',
            question: 'You find a serious bug on an asset marked out of scope. What do you do?',
            options: [
              'Report it anyway and demand a bounty',
              'Keep testing it harder to prove impact',
              'Stop - it is out of scope, so you have no permission there',
              'Sell it elsewhere',
            ],
            correctIndex: 2,
            explanation: 'Out of scope means no authorisation. Testing it further has no legal cover and breaks the program rules.',
          },
        ],
      },
      {
        slug: 'duplicates-and-triage-reality',
        title: 'Duplicates, N/A and Triage Reality',
        summary: 'Most reports are duplicates or rejected. Knowing why keeps you sane.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Bug bounty triage - why so many reports get marked duplicate or not applicable'),
          {
            type: 'paragraph',
            text:
              'You find a bug, write it up, feel great, and get back "Duplicate". It stings. It also happens constantly. Popular targets get hit by hundreds of hunters, so common bugs are found again and again.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Duplicate** - someone reported the same bug first. No pay.',
              '**Not applicable (N/A)** - it is not actually a security issue.',
              '**Informative** - real observation, but no real impact.',
              '**Triaged** - a human confirmed it. Now you wait for a fix and a payout.',
              '**Resolved** - fixed. Payout usually lands here.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The fix for duplicates is not to work faster. It is to hunt where fewer eyes are looking, or to find deeper bugs the crowd skips.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Duplicates are proof you are close',
            text:
              'A duplicate means your finding was real - someone just beat you to it. That is a much better signal than an N/A.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You understand the triage states and will not rage-quit at your first Duplicate.',
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
            explanation: 'A duplicate confirms your finding was valid - another hunter simply got there before you.',
          },
        ],
      },
      {
        slug: 'money-and-expectations',
        title: 'Money and Expectations',
        summary: 'Set honest expectations about income so you do not quit in month two.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('Bug bounty income reality - what beginners should actually expect'),
          {
            type: 'paragraph',
            text:
              'Bug bounty income is spiky and unpredictable, especially early on. Some hunters earn well, many earn little, and beginners often earn nothing for months while they build skill.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Payouts vary widely by severity and by program.',
              'Low severity bugs pay small; critical bugs pay far more.',
              'Income is lumpy - a dry stretch, then a good week.',
              'Do not quit a stable job on the promise of bounties.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Treat the first several months as paid-in-skill, not paid-in-cash. The money follows the skill, usually with a delay.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Beware the highlight reel',
            text:
              'The huge payouts you see on social media are the rare wins, not the daily average. Plan around the average, not the jackpot.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You have realistic money expectations, which is exactly what keeps beginners in the game long enough to win.',
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
            explanation: 'Early bug bounty income is usually low or zero. The payoff arrives later, once your skill grows.',
          },
        ],
      },
    ],
  },
  {
    slug: 'hunting-methodology',
    title: 'Hunting Methodology',
    description: 'A repeatable process for finding bugs beats clicking around at random.',
    lessons: [
      {
        slug: 'picking-a-target',
        title: 'Picking a Target',
        summary: 'The right target for you is not the biggest one. It is the one you can actually dig into.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('How to pick a bug bounty target - the choice most beginners get wrong'),
          {
            type: 'paragraph',
            text:
              'Beginners rush to the biggest, most famous programs. Those are also the most crowded, so everything easy is already found. A smaller, newer, or less glamorous target is often the smarter pick.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Prefer targets with a broad scope - more surface to explore.',
              'Newer programs have less picked-over ground.',
              'Pick tech you understand. If you know APIs, hunt API-heavy apps.',
              'Avoid a target everyone is currently swarming.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'It is like fishing. A crowded, famous spot has ten anglers per fish. A quieter pond nobody talks about can be far more generous.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Depth beats breadth',
            text:
              'One target you know deeply will out-earn ten targets you skim. Commit before you hunt.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can pick a target that fits your skills instead of chasing the loudest name.',
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
            explanation: 'Less crowded targets have more unfound bugs. Famous programs have already been swept by many hunters.',
          },
        ],
      },
      {
        slug: 'a-repeatable-hunting-workflow',
        title: 'A Repeatable Hunting Workflow',
        summary: 'Same steps, every target. A workflow turns luck into a system.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('A repeatable bug bounty workflow - the loop pros run on every target'),
          {
            type: 'image',
            src: '/api/v1/diagrams/bug-bounty-lifecycle',
            alt: 'Recon, test, prove, report, triage, bounty as a six step flow',
            caption: 'Most people optimise the first two steps. The money is in the middle.',
          },
          {
            type: 'paragraph',
            text:
              'Good hunters are not smarter on every bug. They follow the same steps every time, so nothing gets skipped. That consistency is what separates them from people who poke around randomly.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Recon - map every asset, endpoint and feature.',
              'Understand - learn how the app is meant to work.',
              'Test - probe each feature for common bug classes.',
              'Verify - confirm the bug and its impact.',
              'Report - write it up clearly and submit.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a pilot checklist. Even experts run the checklist, because memory misses one item on a bad day and the checklist never does.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Understand before you attack',
            text:
              'You cannot break logic you do not understand. Spend real time using the app normally before you try to abuse it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You have a repeatable loop you can run on any target, so you stop relying on luck.',
          },
          {
            type: 'quiz',
            question: 'Why do experienced hunters follow a fixed workflow?',
            options: [
              'It guarantees a bug every time',
              'So they never skip a step and can repeat success',
              'Because the platform requires it',
              'To slow down on purpose',
            ],
            correctIndex: 1,
            explanation: 'A repeatable workflow stops you skipping steps and turns one-off wins into a reliable process.',
          },
        ],
      },
      {
        slug: 'taking-notes-and-tracking-tests',
        title: 'Notes and Test Tracking',
        summary: 'If you did not write it down, you will test the same thing twice and forget the good stuff.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Note-taking for bug hunters - how good notes turn into paid reports'),
          {
            type: 'paragraph',
            text:
              'Hunting a real app means hundreds of little tests. Without notes you forget what you already tried, lose half-found bugs, and cannot write a clean report later. Notes are not optional.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Track every endpoint and what you tested on it.',
              'Save interesting responses and screenshots as you go.',
              'Mark leads to come back to, so nothing slips.',
              'Keep enough detail to rebuild the report from scratch.',
            ],
          },
          {
            type: 'command',
            description: 'Start a simple notes file for a target from your terminal:',
            commands: ['mkdir -p notes/example-target', 'touch notes/example-target/findings.md'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Future you is forgetful',
            text:
              'Come back after a week and your untracked leads are gone. Write the note now, not "later".',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'Your notes now capture what you tested and what to revisit, which makes reports easy to write.',
          },
          {
            type: 'quiz',
            question: 'Why are notes essential during a hunt?',
            options: [
              'They are required by law',
              'They stop you retesting the same thing and help you write the report',
              'They increase your payout automatically',
              'They replace the need to test',
            ],
            correctIndex: 1,
            explanation: 'Notes track what you covered, preserve half-found leads, and make writing a clean report far easier.',
          },
        ],
      },
      {
        slug: 'when-to-dig-and-when-to-move-on',
        title: 'When to Dig, When to Move On',
        summary: 'Knowing when to abandon a lead is as valuable as finding one.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('When to keep digging and when to walk away - the bug hunter judgement call'),
          {
            type: 'paragraph',
            text:
              'Every hunter has burned a full day on a "bug" that was never there. The skill is knowing when a lead is worth more time and when it is a dead end you should drop.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Dig when a response looks unusual or leaks something.',
              'Dig when a feature clearly trusts user input it should not.',
              'Move on when you have no new angle and only hope is left.',
              'Move on when the potential impact is tiny even if it works.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Set a soft timer in your head. If a lead has not moved in a set block of time, park it in your notes and switch. You can always return with fresh eyes.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Sunk cost is not a strategy',
            text:
              'Time already spent is gone. The only question is whether the next hour is worth spending here or somewhere better.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can judge when a lead deserves more time and when to walk away without guilt.',
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
            explanation: 'Drop a lead when you are out of fresh angles and the payoff would be small. Chasing it further is sunk cost.',
          },
        ],
      },
      {
        slug: 'hunting-with-limited-time',
        title: 'Hunting With 1 Hour a Day',
        summary: 'A job and a life do not rule out bug bounty. You just hunt differently.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Bug bounty with 1 hour a day - how busy people still find bugs'),
          {
            type: 'paragraph',
            text:
              'Most beginners have a day job or college and maybe an hour to hunt. That is fine. You cannot do sprawling recon every night, so you play a tighter game built around one target and small, focused sessions.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Pick one target and stay on it for weeks.',
              'Do slow recon once, then reuse it every session.',
              'Each session, test one feature or one bug class fully.',
              'End every session with a note on where to resume.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'It is like learning an instrument. One focused hour a day, every day, beats a chaotic ten-hour binge once a month.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not restart cold each night',
            text:
              'Without a resume note you spend your one hour just remembering where you were. Write it down and hit the ground running.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You have a realistic plan to hunt around a busy life instead of waiting for a free weekend that never comes.',
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
            explanation: 'Limited time rewards focus - one target, recon done once, and a single feature or bug class per short session.',
          },
        ],
      },
    ],
  },
  {
    slug: 'reporting',
    title: 'Reporting',
    description: 'The skill that turns a raw finding into a fixed bug and a payout.',
    lessons: [
      {
        slug: 'responsible-disclosure',
        title: 'Responsible Disclosure',
        summary: 'Finding a bug is half the job. Handling it responsibly is the other half.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Responsible disclosure explained - reporting bugs the right way'),
          {
            type: 'paragraph',
            text:
              'Responsible disclosure means you tell the right people privately, give them time to fix it, and do not leak or abuse the bug in the meantime. It is the difference between a helper and a threat.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Report through the official channel, not a public tweet.',
              'Give the team reasonable time to fix before saying anything.',
              'Never access or exfiltrate real user data to "prove" impact.',
              'Do not demand payment as a threat - that crosses into extortion.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Picture finding a spare key that opens your neighbour flats. The responsible move is to quietly hand it to the building manager, not to open every door or post the photo online.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test what you are authorised to, and never touch real user data. Proving impact does not justify breaking the rules.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know how to handle a live bug responsibly, which protects both the users and you.',
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
            explanation: 'Report privately through the official channel and allow time to fix. The other options are unsafe or illegal.',
          },
        ],
      },
      {
        slug: 'writing-a-report-that-gets-paid',
        title: 'Writing a Report That Gets Paid',
        summary: 'A great bug with a bad report gets closed. A clear report gets fixed and paid.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('How to write a bug bounty report that actually gets paid'),
          {
            type: 'image',
            src: '/api/v1/diagrams/report-anatomy',
            alt: 'The six sections of a good vulnerability report in order',
            caption: 'This shape gets read. A wall of text gets queued.',
          },
          {
            type: 'paragraph',
            text:
              'The triager reads dozens of reports a day. If yours is confusing, they cannot reproduce it, and it gets marked N/A. A clear report that reproduces in one read is what earns the bounty.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The shape of a good report',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Title - the bug and the asset, in one line.',
              'Summary - what it is and why it matters, in two sentences.',
              'Steps to reproduce - numbered, exact, no gaps.',
              'Impact - what an attacker could actually do.',
              'Proof - request/response, screenshot or short clip.',
            ],
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'report.md',
            code:
              '## Summary\nAn attacker can view another user\'s invoice by changing the id in the URL.\n\n## Steps to reproduce\n1. Log in as your own account.\n2. Open GET /api/invoices/1042.\n3. Change 1042 to 1041 - you now see another user\'s invoice.\n\n## Impact\nAny logged-in user can read every user\'s private invoice.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Write for a tired stranger',
            text:
              'Assume the reader has no context and little patience. If they can reproduce it without asking you a single question, you nailed it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can structure a report that a triager reproduces on the first try - the thing that actually gets you paid.',
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
            explanation: 'If the triager can reproduce the bug from your steps alone, the report succeeds. Reproducibility beats everything else.',
          },
        ],
      },
      {
        slug: 'proof-of-concept-craft',
        title: 'Proof-of-Concept Craft',
        summary: 'A clean proof shows the bug is real without doing any actual harm.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Proof of concept craft - proving a bug without causing damage'),
          {
            type: 'paragraph',
            text:
              'A proof of concept, or PoC, is the minimum demonstration that your bug is real. It should be just enough to convince the team, and no more. A PoC that causes real damage is not clever - it is a problem.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Show the bug with the smallest possible example.',
              'Use a harmless marker, not a real destructive payload.',
              'Never touch real user data - use your own test accounts.',
              'Keep it repeatable, so the fixer can confirm the patch works.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For an XSS, a simple `alert(1)` proves script runs. You do not need to steal cookies from real users to make the point - the alert is enough.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A PoC can go too far',
            text:
              'Deleting data, mass-scanning, or accessing other people accounts to "prove" impact can break the rules and the law. Prove it, do not exploit it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can build a proof that is convincing and completely harmless at the same time.',
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
            explanation: 'A good PoC is minimal and harmless - just enough to convince the team, using your own test accounts.',
          },
        ],
      },
      {
        slug: 'impact-storytelling-and-severity',
        title: 'Impact Storytelling',
        summary: 'The same bug pays more when you clearly explain what an attacker could do with it.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Impact storytelling in bug reports - why the same bug can pay very differently'),
          {
            type: 'image',
            src: '/api/v1/diagrams/severity-matrix',
            alt: 'Impact plotted against ease of exploitation with example findings',
            caption: 'Severity is impact times how easily anyone can do it.',
          },
          {
            type: 'paragraph',
            text:
              'Two hunters find the same bug. One writes "there is an IDOR here". The other writes "any user can read every other user private invoices". Same bug, but the second report shows real impact - and impact drives severity, and severity drives the payout.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Say who is affected - one user, or everyone.',
              'Say what is exposed or changed - data, money, access.',
              'Chain it - a small bug plus another can become critical.',
              'Be honest - do not inflate impact you cannot back up.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Severity is roughly how bad it is if abused. Reading one public setting is low. Taking over any account is critical. Your report should make that level obvious.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Show, do not just claim',
            text:
              'Do not just say "high impact". Walk the reader through the realistic worst case, step by step, so they reach that conclusion themselves.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can turn a dry finding into a clear impact story that earns the severity it deserves.',
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
            explanation: 'Payouts track severity, and severity tracks demonstrated impact. Explaining what an attacker could do lifts both.',
          },
        ],
      },
      {
        slug: 'handling-pushback-and-retests',
        title: 'Pushback and Retests',
        summary: 'Sometimes the team disagrees or the fix is weak. Handle it calmly and professionally.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Handling pushback and retests in bug bounty - staying professional when they disagree'),
          {
            type: 'paragraph',
            text:
              'Not every report is accepted smoothly. A triager may downgrade your severity, question the impact, or say the fix is done when it is not. How you respond decides whether you keep your reputation and your invite.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Stay polite and factual, even when you disagree.',
              'Add evidence rather than raising your voice.',
              'On a retest, confirm the fix actually closes the bug.',
              'If a fix is incomplete, show the exact bypass, calmly.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'A retest is simply re-running your steps after they patch. If the bug is gone, great. If it still works, you report the bypass - politely - and often that is a fresh finding.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Reputation is your real currency',
            text:
              'Arguing rudely can get you removed from a program and hurt your standing on the platform. Being calm and correct is worth more than being loud.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can handle disagreement and retests professionally, protecting both the fix and your reputation.',
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
            explanation: 'Stay professional and add evidence. Rudeness costs you reputation and program access; calm facts win.',
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
        explanation: 'A duplicate confirms your finding was valid - another hunter simply reported it earlier.',
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
        explanation: 'Early income is usually low or zero. The money follows the skill, with a delay.',
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
