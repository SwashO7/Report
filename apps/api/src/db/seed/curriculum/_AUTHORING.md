# Curriculum authoring contract (Suraksha Labs seed data)

You are writing ONE TypeScript file that seeds part of the learning curriculum.
Follow this document exactly. Consistency across files matters more than flair.

---

## 1. File shape

Every part file lives in `apps/api/src/db/seed/curriculum/` and looks like this:

```ts
import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [ /* modules assigned to this file, in order */ ];

export const EXERCISES: ExerciseSeed[] = [ /* one quiz per module */ ];
```

- Export **exactly** these two names: `MODULES` and `EXERCISES`.
- No other exports, no top-level side effects, no `console.log`.
- Import types with `import type`, import `videoSlot` normally.
- The file is TypeScript compiled by `tsc --noEmit`. It must typecheck.

## 2. Hard rules (breaking these breaks the build or the app)

1. **Slugs are exactly as assigned in the plan.** Lesson slugs are globally
   unique across the whole platform; do not rename, do not invent extras, do not
   skip any. Same for module slugs.
2. **Only these block types exist.** Any other `type` value fails validation:

```ts
{ type: 'heading', level: 3, text: string }                        // level 2|3|4 — use 3
{ type: 'paragraph', text: string }
{ type: 'video', provider: 'youtube', url: string, title?: string } // use videoSlot() instead
{ type: 'image', src: string, alt: string, caption?: string }       // do NOT use (no assets yet)
{ type: 'code', language: string, filename?: string, code: string }
{ type: 'command', description?: string, commands: string[] }       // 1..20 commands
{ type: 'callout', variant: 'info' | 'warning' | 'success' | 'danger', title?: string, text: string }
{ type: 'list', ordered: boolean, items: string[] }                 // 1..50 items
{ type: 'quiz', question: string, options: string[], correctIndex: number, explanation?: string }
{ type: 'practice_ref', title: string, exerciseSlug: string }
{ type: 'lab_ref', labSlug: string, title?: string }
{ type: 'resource', label: string, url: string, kind: 'download' | 'external', description?: string }
{ type: 'related_lesson', lessonSlug: string, title?: string }
```

3. **`lab_ref` may only use these four lab slugs** (nothing else exists):
   `port-discovery`, `http-investigation`, `invoice-portal`, `log-hunter`.
   Use one only where it genuinely fits; most lessons have no `lab_ref`.
4. **`related_lesson` may only point at a lesson slug that exists in the plan**
   (any file). When unsure, skip it.
5. **Never repeat the lesson title as a heading block.** The page already renders
   the title as an `h1`. Use `heading` level 3 only to break a lesson into 2-3
   named chunks, and only when it genuinely helps.
6. Rich text in `paragraph` / `list` / `callout` supports a small markdown subset:
   `**bold**`, `*italic*`, `` `inline code` ``, and `[text](url)` links. No raw
   HTML, no tables, no images.
7. Every lesson object needs all six fields: `slug`, `title`, `summary`,
   `estimatedMinutes`, `importance`, `blocks`.
8. Use plain ASCII apostrophes (`'`) in TypeScript strings — escape as `\'` or
   prefer double quotes for strings containing apostrophes. No smart quotes, no
   em dashes; use a normal hyphen `-`.

## 3. Voice — this is the part people get wrong

The audience: Indian beginners, many of whom think hacking is a movie montage.
They are on their phone. They have 6 minutes. They want a win.

**Write like a smart friend explaining over chai, not like a textbook.**

- Short sentences. Second person ("you"). Contractions are good.
- Lead with the point. No "In this lesson we will explore...".
- One concrete analogy per concept, max. Make it Indian/everyday where natural
  (Swiggy order, Aadhaar OTP, apartment flat numbers, railway ticket, IRCTC,
  society gate register). Do not force it.
- Light humour is welcome. Dry, throwaway, one line. Never a stand-up routine,
  never cringe, never sarcasm at the learner's expense.
- Slang: sparingly. A little is chill; three per paragraph is trying too hard.
- Emoji: at most one or two in a whole lesson, and only in a callout title.
- **Length: 450 to 700 words of prose per lesson.** A learner who skips the
  video must finish the lesson genuinely understanding the topic - the text is
  the primary material, not a caption for a video. Under 400 words is too thin.
  Over 800 and you are writing a textbook. Depth means *explaining the
  mechanism*, not padding with adjectives.
- Never say "as we discussed earlier" or reference other lessons vaguely.
- No fake statistics, no invented CVE numbers, no invented bounty amounts, no
  claims about specific companies' current bugs.
- **Nothing decorative.** Every block must carry information. If a diagram is
  present, the prose must explain what the diagram shows. If a command is
  present, the prose must say what its output means. A block nobody needs is
  clutter, and clutter is what makes a lesson feel like filler.

**Bad:** "A computer network is a collection of interconnected computing devices
that facilitate the exchange of data through standardized communication
protocols, forming the fundamental substrate of modern digital infrastructure."

**Good:** "A network is just computers that can talk to each other. That's it.
Your phone talking to the Wi-Fi router is a network. Add the whole planet and
you get the internet."

## 4. Lesson recipe

9 to 14 blocks. `estimatedMinutes` between 7 and 12. The shape:

1. **Video slot - ONLY IF THE LESSON NEEDS ONE.** See section 4a. When it does,
   `videoSlot('<the video you would actually film>')` is the first block. When it
   does not, the lesson simply starts at step 2 and has no video block at all.
2. `paragraph` - the hook. 2-3 sentences. What this is, in plain words, and why
   the reader should care.
3. **How it actually works.** 2-3 `paragraph` blocks, or a `heading`(3) plus
   paragraphs. This is the part that was missing when lessons were too short:
   explain the mechanism step by step. Name the moving parts. Walk one concrete
   worked example end to end with real values, not placeholders.
4. `list` - the reference facts worth keeping (ports, flags, record types,
   payload variants). Not a summary of the prose - new information.
5. **Hands-on.** A `command` or `code` block the reader can actually run, then a
   `paragraph` explaining *what they will see and how to read it*. A snippet with
   no interpretation teaches nothing. Commands must be real, correct and
   non-destructive.
6. **Why it matters to a hacker / defender.** One `paragraph` connecting the
   mechanism to a real finding: what breaks, what you would test, what the impact
   is.
7. `callout` `'info'` or `'warning'` - the gotcha people trip on.
8. `callout` `'success'` - the dopamine hit. Title like `'You just unlocked'` /
   `'Level up'` / `'Locked in'`, one line naming the new skill in plain words.
9. `quiz` - exactly one, 3-4 options, `correctIndex` correct, short
   `explanation`. Wrong options plausible, not silly.

Legal/safety `callout` `'danger'`: required in any lesson describing an attack -
one line, "only on targets you own or are authorised to test", no lecture.

## 4a. Which lessons get a video

A video slot is a promise to film something. Only reserve one where **watching
beats reading**:

- **Yes:** tool walkthroughs (Burp, nmap, Wireshark, ffuf, sqlmap), live attack
  demos, protocol exchanges that animate well (handshakes, DNS resolution, OAuth
  redirects), environment setup, anything where the reader must follow a screen.
- **No:** concepts and reference material, law and ethics, career and reporting
  advice, methodology and mindset, "how to read X" lessons, comparisons and
  trade-offs. These are better read than watched, and a placeholder video card on
  them is dead weight.

When in doubt, leave the video out. An empty promise on every lesson is worse
than a video on the third of lessons that genuinely need one.

## 5. Module rules

```ts
{
  slug: 'assigned-slug',
  title: 'Assigned Title',
  description: '2-3 sentences, 200-380 characters.',
  lessons: [ /* in the plan's order */ ],
}
```

The description is what a learner reads before deciding to start the module, so
a single clause does not earn the click. Cover three things: what the module is
about, what they will actually be able to DO at the end, and why it matters for
finding real bugs. Concrete over grand - name the specific skills, not "master
the fundamentals of networking".

**Too short:** `'Networks, IP addresses, ports, and the two transport protocols.'`

**Right:** `'How machines find each other and hold a conversation: addresses, ports, and the two transport protocols that carry almost all traffic. By the end you can read an IP:port pair and say what is probably running there, explain a TCP handshake, and understand why a UDP scan is slower and less certain than a TCP one.'`

## 6. Exercise rules

One `ExerciseSeed` per module (plus any extra slugs the plan names explicitly).

```ts
{
  lessonSlug: '<the LAST core lesson of that module>',
  slug: '<module-slug>-quiz',       // or the exact slug the plan names
  title: '<Module Title> check',
  instructions: 'One friendly line. e.g. "Five quick ones. Get 4 right and the module is yours."',
  kind: 'quiz',
  xpReward: 25,
  questions: [ /* 4-6 questions, 4 options each, with explanation */ ],
}
```

Also add a `practice_ref` block to that same lesson, just before its `quiz`
block: `{ type: 'practice_ref', title: '<Module Title> check', exerciseSlug: '<same slug>' }`.

## 7. Complete worked example (copy this style exactly)

```ts
import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'example-module',
    title: 'Example Module',
    description: 'What the learner can do by the end, in one line.',
    lessons: [
      {
        slug: 'ports',
        title: 'Ports: One Machine, Many Doors',
        summary: 'An IP gets you to the building. A port gets you to the right flat.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Ports explained in 5 minutes - and why hackers scan them first'),
          {
            type: 'paragraph',
            text:
              'One server can run a website, a database and a mail service at the same time. Same address, different doors. Those doors are ports - numbers from 0 to 65535.',
          },
          {
            type: 'paragraph',
            text:
              'Think of the IP as the building address and the port as the flat number. `142.250.72.14:443` means "that building, flat 443" - and flat 443 is where HTTPS lives.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**22** - SSH, remote shell',
              '**53** - DNS, name lookups',
              '**80** - HTTP, plain web',
              '**443** - HTTPS, encrypted web',
              '**3306** - MySQL',
              '**3389** - Windows remote desktop',
            ],
          },
          {
            type: 'command',
            description: 'See which doors are open on your own machine right now:',
            commands: ['ss -tuln', 'netstat -an'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Every open port is a promise',
            text:
              'An open port means software is listening. Software listens, software has bugs. That forgotten debug service on 8080 has ruined more than one weekend.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read `IP:port` and say what is probably running there. That is step one of every scan you will ever do.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'quiz',
            question: 'You see a service on port 443. What is it most likely?',
            options: ['A MySQL database', 'An HTTPS web server', 'An SSH shell', 'A DNS resolver'],
            correctIndex: 1,
            explanation: '443 is the standard HTTPS port. MySQL is 3306, SSH is 22, DNS is 53.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'ports',
    slug: 'example-module-quiz',
    title: 'Example Module check',
    instructions: 'Four quick ones. Get three right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is the port range?',
        options: ['0-255', '0-1023', '0-65535', '1-1000000'],
        correctIndex: 2,
        explanation: 'Ports are 16-bit numbers, so 0 through 65535.',
      },
      {
        prompt: 'Which port does SSH use by default?',
        options: ['21', '22', '23', '25'],
        correctIndex: 1,
        explanation: '22 is SSH. 21 is FTP, 23 is Telnet, 25 is SMTP.',
      },
    ],
  },
];
```

## 8. Before you finish

- Count your lessons against the plan. Every assigned lesson slug present, in
  order, nothing extra.
- Every lesson reads as complete WITHOUT a video: 450-700 words, the mechanism
  explained, one worked example with real values.
- Every lesson that has a video slot genuinely needs one (section 4a). Lessons
  that do not have no video block at all.
- Every `command` / `code` block is followed by prose explaining the output.
- Every lesson has a `'success'` callout and exactly one `quiz` block.
- Attack lessons have a `'danger'` authorisation callout.
- Every module has its exercise, and that exercise's `lessonSlug` exists in
  YOUR file.
- No smart quotes, no em dashes, no unescaped apostrophes in single-quoted
  strings.
- Balanced brackets; trailing commas are fine.
