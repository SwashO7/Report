import type { ExerciseSeed, ModuleSeed } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'learning-from-real-reports',
    title: 'Learning From Real Reports',
    description:
      "Disclosed bug reports are free training from people who already got paid. This module teaches you to mine them for the thinking, not the payload, and walks the patterns behind IDOR, account takeover and SSRF end to end. By the end you can read any report and pull out a repeatable method, and prove each bug class safely without causing real harm.",
    lessons: [
      {
        slug: 'how-to-read-a-disclosed-report',
        title: 'How to Read a Disclosed Report',
        summary: 'Disclosed reports are free lessons from people who got paid. Here is how to mine them.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A public bug report is the closest thing hacking has to a walkthrough written by someone who won. They found a flaw, wrote it up, got paid, and then a platform published the whole thing. Read for the *thinking*, not the payload, and every report becomes a lesson you can reuse on a target that has nothing to do with the original.',
          },
          {
            type: 'paragraph',
            text:
              'Most beginners skim to the payload, copy the exact string, paste it somewhere else, and get nothing. That is the least valuable part, because the payload only worked on that one app. The reusable skill is in the middle of the report: how did they even find this endpoint, what made them suspicious, and what did they try that failed before the thing that worked?',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Read it in five layers',
          },
          {
            type: 'paragraph',
            text:
              'Every good report, whatever the platform, has the same skeleton. Force yourself to name each layer as you read - if you cannot find one, the report is either thin or you skimmed past it. Take a report about a leaked password reset token as an example. The setup is "the forgot-password flow on a web app". The discovery is "the reset link had a token in the URL and the page reflected it back in the HTML". The bug, in one sentence: the token was predictable and exposed. The escalation: use it to reset another account. The impact: full account takeover. That five-line summary is worth more than the exact URL they used.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**Setup** - what was the target, and which feature were they poking at?',
              '**Discovery** - what made them look *here*? A weird parameter, an old subdomain, a value in a response, a hunch.',
              '**The bug** - the actual flaw, in one sentence you could say out loud to a friend.',
              '**Escalation** - how they turned "huh, interesting" into "this is serious".',
              '**Impact** - what a real attacker could do with it, stated plainly.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'Turn each report into a note you can search',
          },
          {
            type: 'paragraph',
            text:
              "A report you read and forget taught you nothing. Keep a plain-text file - one short entry per report - and you build your own searchable library of bug patterns. Each entry is four lines: the bug class (IDOR, SSRF, auth bypass), the trigger that made the reporter suspicious, the one-line escalation, and a note on what you would have missed. Six months in, when a target shows you a weird parameter, you grep your own notes and find the three reports where that exact smell turned into a finding. That habit is the difference between reading a hundred reports and actually owning a hundred patterns.",
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'report-notes.md',
            code:
              '## Predictable password-reset token\n- **Class:** auth / account takeover\n- **Trigger:** reset link put the token in the URL and the page echoed it in the HTML\n- **Escalation:** used the leaked token to reset a different account\n- **I would have missed:** I never think to read the reset page source for reflected tokens',
          },
          {
            type: 'paragraph',
            text:
              'Read that entry back: the value is not the story, it is the *Trigger* and *I would have missed* lines. Those two are your personal blind spots turned into a checklist. Next time you test any forgot-password flow, "read the reset page source for a reflected token" is now something you actually do, because a report you dissected once put it there.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**HackerOne Hacktivity** - a public feed of disclosed reports across many programs.',
              '**Program disclosure pages** - many bug-bounty programs publish resolved reports with permission.',
              '**Personal blogs and writeups** - researchers often explain findings in more depth than the formal report.',
              '**Your own notes file** - the one library guaranteed to match the bugs *you* keep missing.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the triager comments too',
            text:
              'The back-and-forth below the report is where the real education hides. It shows why the report was accepted, downgraded, or closed as a duplicate - which teaches you what "impact" actually means to the people who pay. A report accepted at high severity and one closed as informational can describe almost the same bug; the difference is usually how well the impact was proven.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can pull a repeatable, five-layer lesson out of any disclosed report, and file it as a searchable note instead of copying a payload that only ever worked once.',
          },
          {
            type: 'quiz',
            question: 'When reading a disclosed report, which part teaches you the most?',
            options: [
              'The exact payload string',
              'The discovery and escalation reasoning',
              "The reporter's username",
              'The bounty amount',
            ],
            correctIndex: 1,
            explanation:
              'The payload is trivial to copy and rarely transfers. The reasoning - why they looked there and how they escalated - is the skill you can reuse on any target.',
          },
        ],
      },
      {
        slug: 'case-study-idor',
        title: 'Case Study: An IDOR Worth Real Money',
        summary: 'Walk through how an IDOR gets found, escalated and reported - the pattern, not one company.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/idor-flow',
            alt: 'Same user requesting their own invoice and then another user record',
            caption: 'One changed number. The ownership check that was never written is the finding.',
          },
          {
            type: 'paragraph',
            text:
              'IDOR - Insecure Direct Object Reference - is the bug that never stops paying, and the diagram above is the whole thing. You ask for your own invoice, then you ask for a different number, and the server hands it over without ever checking whether that invoice is yours. The pattern is always identical: the app trusts an ID in your request and forgets to confirm the ID belongs to you.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How it gets found',
          },
          {
            type: 'paragraph',
            text:
              'Watch a worked example with real values. You are logged in and you open your own invoice. In a proxy you see the request go out as `GET /api/invoices/8842` with your session cookie attached. Two things jump out: the ID `8842` is a plain sequential number, not a long random token, and it sits right there in the path where you can edit it. You change the `8842` to `8841` and forward the request. The server replies `200 OK` with a different name, a different amount, and a different email address - someone else\'s invoice. There was no ownership check at all; the session proved you were *a* user, and the app assumed that was enough.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open a resource that is yours: `GET /api/invoices/8842`.',
              'Notice the ID is short and sequential, not a random token like `inv_9fA2c...`.',
              'Change it by one (`8841`) in a proxy and forward the request.',
              'A `200` with someone else\'s data confirms the missing ownership check.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'How it gets escalated and proven',
          },
          {
            type: 'paragraph',
            text:
              'One leaked invoice is a finding. A finding that you can leak *every* invoice is a serious one, and severity is what sets the payout. But here is the discipline: you prove scale, you do not cause it. You fetch two or three IDs to show the pattern holds, then you *describe* the rest in words - "the IDs are sequential from at least 1 to 8842, so an attacker could enumerate the full customer base". You never write the script that dumps thousands of real records, because that is the difference between a proof and an actual breach.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Prove impact, do not cause it',
            text:
              'Show that ID 8841 leaks by fetching the single record you were authorised to test, then reason about the scale in your writeup. Scraping the whole database is real harm to real people and can turn a valid report into a legal problem for you.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Rules of engagement',
            text: 'Only ever change IDs like this on targets you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You can spot a sequential ID, prove it leaks with a single safe request, and describe the full impact in your report without ever causing it.',
          },
          { type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab' },
          {
            type: 'quiz',
            question: "You find that changing an invoice ID returns other users' data. What is the right way to show impact?",
            options: [
              'Download every invoice in the system',
              'Fetch one or two records as proof and describe the scale in words',
              'Post the IDs publicly to warn users',
              'Delete the invoices to prove write access',
            ],
            correctIndex: 1,
            explanation:
              'Prove the bug with a minimal, safe sample and explain the impact. Mass-dumping or deleting real data causes actual harm and can make your report a liability.',
          },
        ],
      },
      {
        slug: 'case-study-account-takeover',
        title: 'Case Study: Account Takeover',
        summary: "How small, boring flaws chain together into full control of someone else's account.",
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Account takeover (ATO) is the finding that gets a room quiet, and it almost never comes from one dramatic bug. It comes from two or three small, boring ones that nobody bothered to fix because, on their own, each looked harmless. Learning ATO is really learning to *chain* - to see how flaw A makes flaw B possible.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The classic chain, step by step',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. On its own, each of these three would be a shrug. First, the password-reset flow, when you request a reset for `victim@example.com`, returns a response that quietly includes the reset token in the JSON body or in a redirect URL you can see - a token that was supposed to go only to the victim\'s inbox. Second, there is no rate limit, so you can hammer the reset endpoint as many times as you like. Third, the token is not tied to a fresh browser session, so anyone holding it can use it. Chain them: you request the reset for the victim, read the token straight out of the response, and set a new password before the real user ever notices. You now own the account.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              "**Step 1** - request a password reset for the victim's email address.",
              '**Step 2** - notice the reset token is leaked back to you in a response body or redirect URL.',
              '**Step 3** - use that token to set a new password, locking the real owner out.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'None of those three is dramatic. A leaked value, a missing rate limit, a token that is not bound tightly enough - triagers see these filed as low severity every day. The skill is spotting that together they cross the line into full control, and writing the report so the reader sees the chain, not three unrelated shrugs.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Leaked secret** - a token, OTP, or reset code that shows up somewhere the attacker can read it.',
              '**No rate limit** - the endpoint lets you retry or brute-force without ever locking you out.',
              '**Weak binding** - the token is not tied to a session, device, or short expiry, so anyone holding it can use it.',
              '**Missing re-auth** - a sensitive change (email, password) does not re-check who you are.',
              '**Predictable identifiers** - user IDs or tokens you can guess instead of having to steal.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'Write the chain so a triager sees it',
          },
          {
            type: 'paragraph',
            text:
              'How you write it decides the payout. File three separate low findings and each gets triaged as minor in isolation. File one report that walks the reader from request to full takeover, numbered step by step, and the reader feels the severity climb as they read. Lead with the impact in the first line, then show the numbered reproduction, then state what an attacker gains. The numbered steps below are a template you can reuse - the point is that step 3 only reads as serious *because* steps 1 and 2 set it up.',
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'ato-report.md',
            code:
              '**Impact:** full account takeover of any user by email, no interaction from the victim.\n\n**Steps to reproduce:**\n1. POST /auth/reset {"email":"victim@example.com"} - response body includes `resetToken`.\n2. No rate limit: the endpoint can be called repeatedly with no lockout.\n3. POST /auth/reset/confirm {"token":"<leaked>","password":"new"} - sets a new password.\n\n**Result:** the victim is locked out and the attacker controls the account.',
          },
          {
            type: 'paragraph',
            text:
              'Read that template as a triager would. The `**Impact**` line tells them in one breath why they should care, before they have read a single step. The numbered steps let them reproduce it in two minutes. And because step 1 explicitly names the leaked `resetToken` in the response, the reader never has to wonder how you got the token - the chain is airtight. A report written this way gets rated on its true impact, not on the smallest bug in it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The magic word is "chain"',
            text:
              'A single low-severity bug pays little. Show how it *chains* into account takeover and the severity - and the payout - jumps, because impact is what programs price. Reporters who tell the chain story clearly get paid more than reporters who file three separate low findings.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Rules of engagement',
            text: "Only test password-reset flows against accounts you own or are authorised to test - never a real user's.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can see how harmless-looking flaws combine into account takeover, and you know why chaining them - and reporting the chain - is what earns the real money.',
          },
          {
            type: 'quiz',
            question: 'Why is account takeover usually more valuable than the individual bugs behind it?',
            options: [
              'It uses more advanced tools',
              'It chains small flaws into full control, raising the impact',
              'It always triggers a CVE',
              'It is faster to find',
            ],
            correctIndex: 1,
            explanation:
              'ATO is a chain. Each bug alone is minor; combined they give full control of an account, which is high impact - and impact is what sets the payout.',
          },
        ],
      },
      {
        slug: 'case-study-ssrf-to-cloud',
        title: 'Case Study: SSRF to Cloud Keys',
        summary: 'How a "harmless" server-side fetch reaches the cloud metadata service and walks out with credentials.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'SSRF - Server-Side Request Forgery - is where you get the *server* to fetch a URL that *you* choose. On its own that sounds dull: so the server loaded a page, who cares? In the cloud it is one of the scariest bugs there is, because the server can be talked into fetching its own secrets and handing them to you.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Why the cloud makes it deadly',
          },
          {
            type: 'paragraph',
            text:
              'Cloud servers can ask a special internal-only address for information about themselves, including temporary access credentials. That address is not reachable from the internet - only from the server itself. So if you find a feature where the server fetches a URL on your behalf and you point it at that internal address, the server fetches its own credentials and returns them in the response *to you*. That is the entire trick: you never touch the internal address directly, you make the vulnerable server touch it for you.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The pattern, worked through',
          },
          {
            type: 'paragraph',
            text:
              'Here is a realistic example with values. An app has an "import your avatar from a URL" feature: you paste a link, the server downloads it, and shows it. You test the honest case first with `https://example.com/pic.jpg` and it works. Now you change the URL to point at the cloud metadata address instead of a public image. If the app is vulnerable, the response comes back not as an image but as a block of text containing an access key, a secret and a session token - the server\'s temporary credentials. At that point you stop. You have proven the SSRF reaches metadata and that credentials came back; that is a complete, high-severity finding.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Find a feature that fetches a URL - "import from URL", a webhook, a profile-image link, a PDF-from-URL.',
              'Confirm it works with a normal public URL you control.',
              'Point it at an internal-only address instead of a public one.',
              'If a credential-shaped response comes back, report the SSRF and the credential exposure it leads to.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'You do not need to use the keys',
            text:
              'Proving the metadata endpoint is reachable and returns a credential structure is a complete finding. Do NOT actually use those keys to touch cloud resources, list buckets, or spin up anything - that is well past testing and into real, chargeable damage to the target.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Rules of engagement',
            text: 'Only aim server-side fetches at infrastructure you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You understand why a plain URL-fetch feature can leak cloud keys, how the metadata trick works, and exactly where the safe line is when you prove it.',
          },
          { type: 'related_lesson', lessonSlug: 'metadata-service-ssrf', title: 'Deep dive: SSRF to Cloud Metadata' },
          { type: 'practice_ref', title: 'Learning From Real Reports check', exerciseSlug: 'learning-from-real-reports-quiz' },
          {
            type: 'quiz',
            question: 'Why is SSRF especially dangerous on a cloud server?',
            options: [
              'It crashes the server',
              'It can reach the internal metadata endpoint and leak temporary credentials',
              'It encrypts the database',
              'It only affects the client browser',
            ],
            correctIndex: 1,
            explanation:
              'Cloud instances expose credentials via an internal metadata endpoint only they can reach. SSRF that reaches it makes the server hand those credentials back to you.',
          },
        ],
      },
    ],
  },
  {
    slug: 'law-and-india',
    title: 'Law, India Edition',
    description:
      "The exact rules that decide whether your testing is research or a crime in India: the IT Act sections that criminalise unauthorised access, the DPDP Act that governs personal data you might stumble into, and where a serious finding is meant to go. By the end you can name which section covers what, why permission is the whole game, and how to stay lawful on foreign programs too.",
    lessons: [
      {
        slug: 'indian-it-act-and-hacking',
        title: 'The IT Act and You',
        summary: 'The one law that decides whether your testing is research or a crime in India.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'In India, the law that decides whether you are a "security researcher" or an "accused" is the Information Technology Act, 2000 - usually just called the IT Act. Before you touch anything, you should know roughly what it says, because it draws the line you must never cross without permission.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What the sections actually say',
          },
          {
            type: 'paragraph',
            text:
              'The core idea is blunt: accessing a computer or system without the owner\'s permission is an offence. Two sections matter most to you. Section 43 covers unauthorised access - getting into, downloading from, copying, or damaging a computer resource without permission - and attaches civil liability, meaning you can be ordered to pay damages that can run very high. Section 66 takes those same acts and, when they are done dishonestly or fraudulently, turns them into a criminal offence, which can carry imprisonment and a fine. The practical takeaway: it is not the technique that is illegal, it is doing it to a system you had no permission to touch.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Section 43** - unauthorised access, copying data, or causing damage. Civil liability; damages can be heavy.',
              '**Section 66** - the same acts done dishonestly or fraudulently, now a criminal offence that can mean jail.',
              '**Permission is the pivot** - written authorisation, a contract, or a public bug-bounty scope is what makes the exact same testing lawful.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'What it means for you in practice',
          },
          {
            type: 'paragraph',
            text:
              'Practically, this means your safety comes entirely from authorisation, not from your intentions. "I only wanted to see if it was vulnerable" is not a defence - curiosity is not consent. If a system is not yours and no scope or contract permits you to test it, running even a scan against it can fall under Section 43. The flip side is reassuring: the moment you have a signed engagement, an employer\'s instruction, or a public program that lists a target in scope, that same activity is legitimate work. Keep the evidence of that permission; it is what protects you.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'No permission, no test',
            text:
              'Curiosity is not a defence. "I just wanted to check if it was vulnerable" has landed people in real trouble. If it is not yours and no scope allows it, do not touch it - not even a scan.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is education, not legal advice',
            text:
              'This lesson explains the law in plain terms so you can stay safe. It is not legal advice. For anything real - a dispute, a takedown notice, a police complaint - talk to an actual lawyer who practises in this area.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You know permission is what makes hacking legal in India, and that Section 43 (civil) and Section 66 (criminal) are the sections you are staying on the right side of.',
          },
          {
            type: 'quiz',
            question: 'Under the IT Act, what mainly separates lawful security testing from an offence?',
            options: [
              'Whether you used advanced tools',
              "Whether you had the owner's permission or a valid scope",
              'Whether you found a bug or not',
              'Whether you reported it publicly',
            ],
            correctIndex: 1,
            explanation:
              'Authorisation is the deciding factor. Access without permission is an offence under Section 43, and Section 66 makes it criminal when done dishonestly.',
          },
        ],
      },
      {
        slug: 'dpdp-act-basics',
        title: 'DPDP Act Basics',
        summary: "India's data protection law, and why it matters the moment you touch personal data.",
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The Digital Personal Data Protection Act, 2023 - the DPDP Act - is India\'s law about how personal data must be handled. It matters to you the instant a bug you are testing exposes real people\'s information, because it changes both how serious your finding is and how careful you have to be with what you found.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What the law covers',
          },
          {
            type: 'paragraph',
            text:
              'Personal data, under this law, is anything that can identify a person - name, phone number, email, address, or an identifier like an Aadhaar-linked detail. The Act sets out that organisations may collect such data only for a clear, stated purpose and generally with the person\'s consent, and it puts a duty on the organisation holding the data (called a "data fiduciary") to protect it and use it only for that purpose. There are obligations around keeping the data secure and around what happens when it is breached. You do not need every clause; you need the shape of it - personal data is protected, and mishandling it has consequences under the law.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              "**Consent and purpose** - personal data should be collected for a stated reason, generally with the person's consent.",
              '**Data fiduciary** - the organisation holding the data has a legal duty to protect it and use it only for that purpose.',
              '**Your finding** - if a bug leaks personal data, that raises the impact under this law, which makes your report stronger and more urgent.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'What it means for you in practice',
          },
          {
            type: 'paragraph',
            text:
              'Two practical rules follow. First, a bug that exposes personal data is high impact - say so in your report, because "this leaks users\' phone numbers and identity details" lands far harder with a triager than a vague "information disclosure". Second, and this is the part that protects *you*: do not become the breach. If you can see personal data, prove it with the smallest possible sample - one record, redacted where you can - and stop. Copying, keeping, or sharing real personal data can put you on the wrong side of the very law that makes your finding serious.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not hoard what you find',
            text:
              'If a bug exposes personal data, prove it with the smallest sample you can and stop. Downloading, keeping, or sharing real personal data can make *you* the person who mishandled it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is education, not legal advice',
            text:
              'This is a plain-language overview to keep you safe and sharpen your reports. It is not legal advice - for real questions about compliance or a data breach, consult a lawyer.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You understand what personal data is under the DPDP Act, why leaking it makes a finding serious, and why you must prove it minimally and never keep it.',
          },
          {
            type: 'quiz',
            question: "You find a bug that exposes users' phone numbers and identity details. How does the DPDP Act shape your response?",
            options: [
              'It means you can freely download the data as proof',
              'It makes the leak high impact, so prove it with a minimal sample and report it',
              'It does not apply to security testing',
              'It requires you to notify every affected user yourself',
            ],
            correctIndex: 1,
            explanation:
              'Exposed personal data is high impact under the DPDP Act. Prove it minimally, do not hoard it, and report it through the right channel.',
          },
        ],
      },
      {
        slug: 'cert-in-and-incident-reporting',
        title: 'CERT-In and Incident Reporting',
        summary: "Who India's national cyber team is, and where a serious finding is supposed to go.",
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'CERT-In - the Indian Computer Emergency Response Team - is the government body that coordinates responses to cybersecurity incidents in India. Think of it as the national help desk for serious cyber trouble. As a hunter you rarely deal with it directly, but you should know what it is and where it sits in the reporting chain.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What CERT-In actually does',
          },
          {
            type: 'paragraph',
            text:
              'CERT-In has three roles worth knowing. It publishes advisories - public warnings about active threats and newly discovered vulnerabilities. It coordinates the response to large incidents that affect many organisations. And it sets rules requiring organisations to report certain kinds of incidents to it within defined timelines - things like data breaches and specified attacks. That last point is a duty on the *organisation*, not on you: the company that got breached is the one with the obligation to notify CERT-In.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Advisories** - CERT-In publishes warnings about active threats and vulnerabilities.',
              '**Coordination** - it helps orchestrate the response to big, cross-organisation incidents.',
              '**Mandatory reporting** - organisations must report specified incidents (like breaches) to CERT-In within set timelines.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'Where your finding goes',
          },
          {
            type: 'paragraph',
            text:
              'For a normal finding, your channel is the *program or the company*, not CERT-In. You report the bug to the bug-bounty program, the security.txt contact, or the company\'s security email. If the issue is a real incident with legal reporting duties attached, it is then the organisation\'s job to loop in CERT-In within the required time. Going straight to CERT-In yourself for an ordinary vulnerability skips the people who can actually fix it and who usually pay you. Know the chain: you tell the owner, the owner escalates upward if the law requires it.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What the rules actually require',
          },
          {
            type: 'paragraph',
            text:
              "CERT-In's 2022 directions put concrete duties on organisations, not on individual researchers. The headline one: an organisation that suffers a reportable cyber incident must notify CERT-In within six hours of noticing it. That is a tight window, which is why mature companies have an incident runbook ready rather than scrambling. The directions also require organisations to keep system logs for a rolling period (commonly cited as 180 days) so an incident can be investigated after the fact, and they name the categories that must be reported - things like targeted scanning of critical systems, unauthorised access, data breaches, and attacks on servers and network devices.",
          },
          {
            type: 'paragraph',
            text:
              'Read that back as a defender and the reason for each rule is obvious. The six-hour clock exists because the first hours of an incident are when containment still helps; a breach reported a week late is a breach that already spread. The log-retention rule exists because you cannot investigate what you did not record - no logs, no timeline, no idea what the attacker touched. Knowing these duties matters to you even as a hunter: when you report a serious finding, the clock and the paperwork on the other side explain why a company sometimes goes quiet and formal the moment your report crosses from "bug" into "incident".',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Six-hour notification** - organisations report a reportable incident to CERT-In within six hours of noticing it.',
              '**Log retention** - keep system logs for a defined rolling window so incidents can be investigated later.',
              '**Named categories** - unauthorised access, data breaches, targeted scanning of critical systems, and more.',
              '**Your part** - report to the program or company; they own the CERT-In clock, not you.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Report to the owner first',
            text:
              "For a normal finding, your channel is the bug-bounty program or the company's security contact. CERT-In is for the organisation to loop in when the law requires it, not usually your first stop.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is education, not legal advice',
            text:
              'This explains the reporting landscape in plain terms. It is not legal advice - reporting obligations are specific and time-bound, so an organisation with a real incident should get proper legal counsel.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You know what CERT-In is, that organisations have mandatory reporting duties to it, and that your normal path for a finding is through the program or company.',
          },
          {
            type: 'quiz',
            question: 'As an individual hunter, where does a typical finding usually go first?',
            options: [
              'Straight to CERT-In',
              'To the bug-bounty program or company security contact',
              'To the police',
              'To social media',
            ],
            correctIndex: 1,
            explanation:
              'You report to the program or company. They handle any mandatory CERT-In reporting for serious incidents that carry legal duties.',
          },
        ],
      },
      {
        slug: 'global-laws-quick-tour',
        title: 'Global Laws Quick Tour',
        summary: 'A one-lesson map of the big foreign laws you will bump into on international programs.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Bug bounty is global. The moment you test a company based abroad, foreign law can apply on top of Indian law - and where the server physically sits is not the only thing that decides it. You do not need to become a lawyer for every country. You need to know the big names and the one rule that never changes.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The laws you will hear about',
          },
          {
            type: 'paragraph',
            text:
              'A few keep coming up. In the United States, the Computer Fraud and Abuse Act (CFAA) makes accessing a computer "without authorisation" or "exceeding authorised access" a serious offence - and it has been read broadly, so scope matters a lot there. In the European Union, the General Data Protection Regulation (GDPR) sets strict rules on handling the personal data of people in Europe, with large fines, so a data-leaking bug on an EU target carries real weight. In the United Kingdom, the Computer Misuse Act is their version of "no unauthorised access". The names differ; the spine is the same everywhere - access you were not permitted to have is the crime.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**CFAA (USA)** - the Computer Fraud and Abuse Act; unauthorised or excess access is a serious offence, read broadly.',
              '**GDPR (EU)** - strict rules and heavy fines around handling the personal data of people in Europe.',
              "**Computer Misuse Act (UK)** - the UK's version of \"no unauthorised access\".",
              '**The constant** - authorisation and staying in scope keep you legal under all of them.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'The one rule that travels',
          },
          {
            type: 'paragraph',
            text:
              'You do not defend yourself by memorising every jurisdiction\'s statute. You defend yourself by staying strictly inside the program\'s written scope. Scope is the permission slip that makes your testing lawful, whichever flag the server flies under and whichever laws might reach it. If a target, a subdomain, or a technique is not listed as in-scope, treat it as off-limits until you have written confirmation. That single habit is what keeps you on the right side of CFAA, GDPR, the Computer Misuse Act, and the IT Act all at once.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The scope is your passport',
            text:
              "You do not memorise every country's law. You stay inside the program's written scope. Scope is the permission that makes your testing lawful, wherever the target lives.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is education, not legal advice',
            text:
              'A quick tour cannot replace real advice. If you face a cross-border legal question, talk to a lawyer who knows that jurisdiction.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You can name the major international cyber laws and you know that staying inside scope is what keeps you safe across all of them at once.',
          },
          {
            type: 'quiz',
            question: "You are testing a US-based company's app from India. What keeps you on the right side of the law?",
            options: [
              "India's laws do not apply, so anything goes",
              "Staying strictly within the program's written scope and authorisation",
              'Using a VPN to hide your location',
              'Only testing at night',
            ],
            correctIndex: 1,
            explanation:
              'Multiple laws can apply at once, but authorisation and scope are the constant. Stay in scope and you stay lawful everywhere.',
          },
        ],
      },
    ],
  },
  {
    slug: 'career',
    title: 'Career',
    description:
      "Turn what you have learned into a job offer or a self-employed hunting practice. This module gives you the concrete moves: what to put on GitHub so a recruiter believes you, where to get real reps, how to write an honest resume and survive the technical interview, when a certification is worth the money, and how to keep learning for years without burning out.",
    lessons: [
      {
        slug: 'portfolio-and-github-presence',
        title: 'Portfolio and GitHub Presence',
        summary: 'What to put online so a recruiter believes you can actually do the work.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Nobody hires a certificate. They hire proof. A tidy GitHub and a small portfolio say more in the ten seconds a recruiter spends on you than a page of buzzwords on a resume ever will. Your job is to make those ten seconds land.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What to actually put there',
          },
          {
            type: 'paragraph',
            text:
              'You do not need a hundred repositories. You need a few good ones that show you can build, solve, and explain. Concretely: ship one small tool you wrote yourself - even a 60-line port scanner in Python demonstrates you can turn an idea into working code. Add two or three clean writeups of labs or CTF challenges you solved, explaining the reasoning, not just pasting the answer. Pin those repos on your profile so they show first. And give the top repo a real README - what it does, how to run it, one screenshot - because a good README on one project beats ten empty repos with default descriptions.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A tool or two** - even a small port scanner or a script you wrote proves you can build, not just consume.',
              '**Writeups** - lab and CTF solutions explained clearly in your own words, without spoiling live targets.',
              '**A clean README on the top project** - one good README beats ten empty repos.',
              '**Consistency** - a steady trickle of commits reads better than one heroic weekend and then silence.',
              '**A pinned, tidy profile** - put your best three repos where the recruiter sees them first.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The difference this makes is concrete. A hiring manager who sees "web security" on a resume has to take your word for it. A hiring manager who can click a repo, read a clear IDOR writeup you did on a practice lab, and see the tidy code behind it does not have to guess - you have already shown them the exact thing they are hiring for. That is why the portfolio outperforms the resume line every time.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'A README template you can reuse',
          },
          {
            type: 'paragraph',
            text:
              'The single fastest upgrade to any repo is a real README, and most people freeze on what to write. Do not. Use the same five-part skeleton every time - what it does, how to run it, an example, what you learned, and a safety line. Paste this into the top of your best project, fill the blanks, and it already reads better than 90 percent of student repos.',
          },
          {
            type: 'code',
            language: 'markdown',
            filename: 'README.md',
            code:
              '# portscan\n\nA small TCP port scanner I wrote to understand how scanning works.\n\n## Run it\n```\npython portscan.py 127.0.0.1 -p 1-1024\n```\n\n## Example\n```\n[+] 22/tcp open\n[+] 80/tcp open\n```\n\n## What I learned\nHow a TCP connect scan differs from a SYN scan, and why some ports show filtered.\n\n## Note\nOnly scan hosts you own or are authorised to test.',
          },
          {
            type: 'paragraph',
            text:
              'Notice what that README does in ten lines. The first sentence tells a recruiter what the project is *and* that you built it to learn, not to copy. The Run and Example blocks prove it actually works - anyone can run it in one command and see the output. The "What I learned" line signals you understand the concept, not just the code. And the safety note quietly tells a security employer that you know the rules of engagement. Fill it in honestly for each project and your profile stops looking like a dumping ground and starts looking like a portfolio.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Never leak real targets',
            text:
              'Do not post writeups about live, unpatched bugs or private-program details. That breaks disclosure rules and scares off every serious employer - it signals you cannot be trusted with access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You know what a hireable portfolio looks like: a couple of real projects, clear writeups, a pinned tidy profile, and nothing that leaks a live target.',
          },
          {
            type: 'quiz',
            question: 'What makes a security portfolio convincing to a recruiter?',
            options: [
              'The number of repositories, empty or not',
              'A few real projects and clear writeups that show how you think',
              'Listing every tool you have ever installed',
              "Reposting other people's exploits",
            ],
            correctIndex: 1,
            explanation:
              'Depth beats volume. A few real projects and clean writeups prove skill far better than a long, empty repo list.',
          },
        ],
      },
      {
        slug: 'ctfs-and-practice-platforms',
        title: 'CTFs and Practice Platforms',
        summary: 'Where to actually get your reps in, and how to practise without wasting your evenings.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Reading about hacking is like reading about swimming. CTFs and practice labs are the pool - safe, legal targets that are *meant* to be broken, where you can get the reps that turn a lesson into a reflex. The trick is practising in a way that actually compounds instead of just eating your evenings.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Two kinds of practice, and why you want both',
          },
          {
            type: 'paragraph',
            text:
              'There are two flavours. CTF *events* are time-boxed puzzle competitions - fast, competitive, run over a weekend - and they are brilliant for pattern recognition, because under pressure you learn to spot the shape of a bug quickly. Lab *platforms* are always-on, structured challenges you grind at your own pace, and they are where depth comes from, because you can repeat a challenge until the mechanism actually clicks. You want both: events to build speed and nerve, labs to build understanding. Lean only on events and you get shallow and frantic; lean only on labs and you never learn to perform under a clock.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**CTF events** - fast, competitive, weekend-length; great for pattern recognition and speed.',
              '**Lab platforms** - structured, repeatable challenges you can redo until the concept clicks.',
              '**Write it up** - a challenge you cannot explain afterwards is a challenge you did not really solve.',
              '**Suraksha Labs** - the labs here count; treat each one like a real target and write up your solve.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The single habit that turns practice into skill is writing up what you solved, in your own words, right after you solve it. It feels optional and it is the whole game. Forcing yourself to explain the solve exposes the parts you got by luck or copied without understanding, and it doubles as portfolio material. Three challenges solved and clearly written up will teach you more than twenty rushed solves you cannot recall a week later.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'A practice session that actually compounds',
          },
          {
            type: 'paragraph',
            text:
              'Random grinding wastes evenings; a fixed routine does not. Run every session the same way: pick one challenge, give yourself a real time box (say 45 minutes), and only after that box expires are you allowed to open a hint or a writeup. When you do get stuck and look it up, do not just copy the answer - read *why* your approach missed it, then redo the challenge from scratch with your hands to prove the lesson stuck. Finish by writing four lines about what the bug was and what tipped you off. That last step is non-negotiable; a solve you cannot explain is a solve you will not repeat.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Pick ONE challenge and set a 45-minute timer before you look at any hint.',
              'Work it yourself until the timer ends - note every idea you try, even the failed ones.',
              'Stuck? Read the hint or writeup for the *reasoning*, not the payload, then close it.',
              'Redo the whole challenge from scratch with your own hands to lock it in.',
              'Write four lines: what the bug was, what tipped you off, what you would try first next time.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here is why the timer and the redo matter so much. The 45-minute box builds the tolerance for being stuck that real hunting demands - a real target does not come with a hint button. The redo-from-scratch step is the one everybody skips and the one that actually transfers the skill: reading a solution creates the comforting illusion that you could have done it, while typing it yourself, unaided, proves whether you can. Do this for even ten challenges and you will feel the shift from "I have seen this bug" to "I can find this bug".',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Quality over grinding',
            text:
              'Solving three challenges properly and writing them up beats rushing twenty and remembering none. Depth compounds; frantic grinding does not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You know the two kinds of practice, why you want both, and why writing up each solve is what turns a lucky win into a real skill.',
          },
          {
            type: 'quiz',
            question: 'What is the best way to actually learn from a CTF challenge you solved?',
            options: [
              'Move on immediately to the next one',
              'Write up how you solved it in your own words',
              'Copy the official solution without reading it',
              'Only attempt the hardest challenges',
            ],
            correctIndex: 1,
            explanation:
              'Writing it up forces you to understand the solve. If you cannot explain it, you did not really learn it - and the writeup doubles as portfolio proof.',
          },
        ],
      },
      {
        slug: 'resume-and-interviews',
        title: 'Resume and Interviews',
        summary: 'Say what you can do, prove it, and survive the technical interview without bluffing.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A security resume is not a keyword dump. It is a short story: here is what I can do, here is the proof, here is how to reach me. One page, no fluff, every claim backed by something a reader can click. Get that right and the interview is yours to lose.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The resume',
          },
          {
            type: 'paragraph',
            text:
              'Be specific and be honest, because both get tested in the room. "Found and reported an IDOR in a practice lab, wrote it up here" is worth ten lines of "skilled in web application security". Link your GitHub, your writeups, and any labs or CTFs near the top. Every skill you list should map to something you can demonstrate live, because an interviewer will pick a line off your resume and ask you to go deep on it - and a claim you cannot back becomes the thing the whole interview remembers.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The interview',
          },
          {
            type: 'paragraph',
            text:
              'The technical interview is testing how you *think*, not whether you memorised every port number. This is the most important reframe in this lesson: "I do not know that offhand, but here is exactly how I would find out" is a *strong* answer, not a weak one, because it shows the methodology they actually want to hire. Walk through your reasoning out loud. Ask clarifying questions - curiosity reads as competence. And never, ever bluff a fact you do not have; an interviewer who catches one invented answer stops trusting all of them.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Show proof** - link your GitHub, writeups, and any labs or CTFs you have done, near the top.',
              '**Be specific** - "found and reported an IDOR in a practice lab" beats "web security".',
              '**Never bluff** - inventing knowledge in a technical interview ends badly and fast.',
              '**Think out loud** - "here is how I would find out" beats a confident guess.',
              '**Ask questions** - clarifying questions read as competence, not weakness.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'Write bullets that prove, not claim',
          },
          {
            type: 'paragraph',
            text:
              'A weak resume line names a skill; a strong one names a result and links the proof. Use a simple pattern for every bullet - action, target, outcome, link - and each line becomes something the reader can verify in one click. Compare a vague claim with the same work written to the pattern below and you can feel which one an interviewer trusts.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'resume-bullets.txt',
            code:
              'Weak:  Skilled in web application security and penetration testing.\n\nStrong: Found and reported an IDOR in a practice lab by tampering a\n        sequential invoice ID; wrote up the full solve. (github.com/you/idor-writeup)\n\nPattern: <what you did> + <on what> + <the result> + <link to proof>',
          },
          {
            type: 'paragraph',
            text:
              'Fill that pattern in for every real thing you have done - a lab you solved, a tool you built, a CTF you placed in - and put the three strongest at the top. The link is the part that does the work: it turns a claim the reader has to trust into a fact they can check, and it quietly signals that you are not afraid of them checking. A resume where every bullet ends in a clickable proof is rare enough that it stands out on its own.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '"Walk me through a bug you found" - have one solve you can narrate end to end.',
              '"How would you test this login form?" - talk methodology out loud, do not just name tools.',
              '"What is the difference between X and Y?" - a few core concept pairs, honestly known.',
              '"What would you do if you got stuck?" - the answer they most want to hear is a real process.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not pad, do not lie',
            text:
              'One padded claim you cannot back up in the interview sinks the whole resume. Under-promise on paper, over-deliver in the room - the reverse is how strong candidates fail.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can write a tight, honest, one-page security resume and handle a technical interview by showing your thinking instead of bluffing.',
          },
          { type: 'practice_ref', title: 'Career check', exerciseSlug: 'career-quiz' },
          {
            type: 'quiz',
            question: 'In a technical interview, what is the strongest response to a question you do not know?',
            options: [
              'Confidently make up an answer',
              'Explain how you would go about finding the answer',
              'Change the subject',
              'Say security is not really about facts',
            ],
            correctIndex: 1,
            explanation:
              'Interviewers test your thinking. Showing your approach beats bluffing, which almost always gets exposed and costs you their trust.',
          },
        ],
      },
      {
        slug: 'certifications-worth-it-or-not',
        title: 'Certifications: Worth It?',
        summary: 'When a cert actually helps your career, and when it is just an expensive sticker.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Certifications are neither magic nor useless - they are a signal, and a signal is only worth something in the right situation. The skill this lesson gives you is judging which situation you are in before you spend real money, instead of chasing letters because the internet told you to.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Hands-on versus multiple-choice',
          },
          {
            type: 'paragraph',
            text:
              'The biggest split is how a cert is examined. A practical, exam-by-doing cert - where you have to actually break into machines or exploit an app under a time limit to pass - proves you can do the work, and employers weight it accordingly. A pure multiple-choice cert mostly proves you can pass a multiple-choice exam; it can still tick an HR checkbox, but it convinces no engineer that you can hack. Know which kind you are buying, because the price rarely tells you and the value gap between them is enormous.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Helps when** - a specific job posting requires it, or an HR filter screens candidates by it.',
              '**Helps when** - it is hands-on and exam-by-doing, so passing it genuinely proves you can do the work.',
              '**Does not help when** - you have no projects, no writeups, and expect the cert alone to get you hired.',
              '**Order matters** - a cert on top of real proof is powerful; a cert instead of proof is thin.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'How to actually decide',
          },
          {
            type: 'paragraph',
            text:
              'Run three checks before you pay. One: do the jobs you actually want *list* it as required or preferred? Read ten real postings, do not guess. Two: is it hands-on, so passing it means something to an engineer? Three: do you already have a foundation - projects, writeups, lab solves - for it to sit on top of? A cert multiplies an existing base of skill and proof. Multiply zero and you still have zero, so if you have nothing to show yet, build that first and let the cert come later.',
          },
          {
            type: 'paragraph',
            text:
              "Make it concrete by scoring a real decision. Say you are eyeing a hands-on web-security cert. Check one: you open ten job posts for the roles you want and it appears in the requirements of four of them - real demand, not imagined. Check two: it is exam-by-doing, you have to exploit live machines to pass, so an engineer will respect it. Check three: you have already solved a dozen labs and published three writeups - a foundation for it to multiply. Three yeses: buy it, it will amplify what you have. Now flip it: zero writeups, no projects, and you are hoping the cert alone lands the job. That is multiplying zero, and the honest move is to spend the next two months building proof first.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Demand check** - appears in 4+ of 10 real postings for your target role? Point in favour.',
              '**Format check** - exam-by-doing, not pure multiple-choice? Point in favour.',
              '**Foundation check** - you already have projects and writeups for it to sit on? Point in favour.',
              '**All three yes** - buy it. **Foundation missing** - build proof first, cert later.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A cert is a multiplier, not a base',
            text:
              'Certs multiply an existing foundation of skill and proof. Multiply zero and you still have zero - build the demonstrable skill first, add the cert on top.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You can decide whether a specific cert is worth your money and time by checking demand, format, and whether you have a base for it to multiply.',
          },
          {
            type: 'quiz',
            question: 'When is a certification most worth pursuing?',
            options: [
              'When you have no projects and want a shortcut to being hired',
              'When a target job requires it or it is hands-on and proves real skill',
              'When it is the most expensive one available',
              'Always - more certs are always better',
            ],
            correctIndex: 1,
            explanation:
              'Certs help most when a job requires them or when they are practical and exam-by-doing. They multiply real skill; they do not replace it.',
          },
        ],
      },
      {
        slug: 'staying-current-without-burning-out',
        title: 'Staying Current Without Burning Out',
        summary: 'Security never stops moving. Here is how to keep up without frying yourself.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Security moves fast, and the internet will happily convince you every single day that you are falling behind. You are not. Trying to chase every new tool, technique and headline is the fastest route to burning out and quitting - so the real skill is a system that keeps you sharp for years, not a heroic month.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Build a small system',
          },
          {
            type: 'paragraph',
            text:
              'The pros are not reading everything - they have a small, trusted set of sources and a steady rhythm. Copy that. Pick a handful of good newsletters or researchers to follow and deliberately ignore the rest; a curated few beats an unfiltered fifty. Then set a cadence you can actually keep: twenty focused minutes most days compounds far better than a frantic all-nighter once a month, because little-and-often is how memory sticks. And treat rest as part of the job. A rested hunter spots the obvious bug the tired one walks straight past.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Pick a few sources** - a handful of trusted newsletters or researchers, not fifty tabs of FOMO.',
              '**Little and often** - twenty focused minutes most days beats a frantic all-nighter once a month.',
              '**Rest on purpose** - breaks are part of the job, not a failure of it.',
              '**Depth over FOMO** - you cannot learn everything, and you do not need to.',
              '**Go deep on one thing at a time** - one topic understood beats five half-skimmed.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'There is a security angle to all this that is easy to miss: burnout is itself a risk to your work. A tired, resentful, over-scrolled hunter makes sloppy mistakes, misses the boring-but-real finding, and eventually stops showing up. Protecting your energy is not self-indulgence - it is the thing that keeps you finding bugs in year three instead of quitting in month six. The people who last are not the ones who read the most; they are the ones who paced themselves.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'A weekly rhythm you can keep for years',
          },
          {
            type: 'paragraph',
            text:
              'Vague advice to "stay current" is how people burn out; a fixed, small rhythm is how they last. Here is one that fits around a job or college. Most weekdays, spend twenty minutes skimming your handful of trusted sources - just enough to know what happened, not to master it. Once a week, pick exactly one thing that caught your eye and go deep: read the writeup properly, or reproduce it in a lab. And leave one or two evenings genuinely off, no security at all. That is it. The rhythm below is deliberately unambitious, because a plan you can actually repeat beats a heroic one you abandon in three weeks.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Mon-Fri, 20 minutes** - skim your trusted sources; note what happened, do not study it yet.',
              '**Once a week, deep dive** - pick ONE thing from the week and reproduce or fully read it.',
              '**One topic in flight** - never more than one deep dive at a time; finish before you start another.',
              '**One or two evenings off** - fully off, no security. Rest is scheduled, not stolen.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The reason this works is that it separates *awareness* from *mastery*, which most people fatally blur. The daily twenty minutes keeps you aware - you know the name of the new attack, so you are not blindsided. The weekly deep dive is the only place you try to actually learn something, and capping it at one topic means you finish it instead of leaving five browser tabs of half-understood ideas open forever. The scheduled rest is what makes the whole thing survive a bad week. Awareness is cheap and daily; mastery is expensive and weekly; rest is what keeps both going.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Burnout is a security risk',
            text:
              'A tired, resentful hunter makes sloppy mistakes and misses obvious bugs. Protecting your energy is protecting your work - and your longevity in the field.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text:
              'You have a sustainable system for keeping up: a few trusted sources, a steady daily rhythm, real rest, and permission to ignore the FOMO.',
          },
          {
            type: 'quiz',
            question: 'What is the healthiest way to stay current in security long term?',
            options: [
              'Read every new post and tool the day it drops',
              'Follow a few trusted sources with a steady, restful rhythm',
              'Only study during exam season',
              'Ignore new developments entirely',
            ],
            correctIndex: 1,
            explanation:
              'Consistency beats intensity. A small trusted set of sources plus real rest keeps you sharp for years without burning out.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'case-study-ssrf-to-cloud',
    slug: 'learning-from-real-reports-quiz',
    title: 'Learning From Real Reports check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is the most reusable thing to learn from a disclosed report?',
        options: [
          'The exact payload',
          'The discovery and escalation reasoning',
          "The reporter's handle",
          'The date it was filed',
        ],
        correctIndex: 1,
        explanation: 'Payloads are easy to copy and rarely transfer. The reasoning is the transferable skill.',
      },
      {
        prompt: "What is the safe way to prove an IDOR leaks other users' data?",
        options: [
          'Dump the entire database',
          'Fetch one or two records and describe the scale',
          'Delete a record to prove write access',
          'Publish the IDs online',
        ],
        correctIndex: 1,
        explanation: 'Prove it with a minimal sample and reason about the rest. Mass-dumping or deleting real data is real harm.',
      },
      {
        prompt: 'Why is account takeover usually more valuable than its individual bugs?',
        options: [
          'It uses rarer tools',
          'It chains small flaws into full control',
          'It always maps to a CVE',
          'It is quicker to find',
        ],
        correctIndex: 1,
        explanation: 'ATO is a chain of minor bugs that together give full account control - high impact.',
      },
      {
        prompt: 'What makes SSRF so dangerous on a cloud server?',
        options: [
          'It reformats the disk',
          'It can reach the internal metadata endpoint and leak credentials',
          'It only affects the browser',
          'It disables logging',
        ],
        correctIndex: 1,
        explanation: 'SSRF that reaches the cloud metadata endpoint makes the server hand back temporary credentials.',
      },
      {
        prompt: 'When you prove an SSRF reaches cloud metadata, what should you NOT do?',
        options: [
          'Describe the impact in your report',
          'Actually use the leaked keys to touch cloud resources',
          'Show the credential structure came back',
          'Stop after proving reachability',
        ],
        correctIndex: 1,
        explanation: 'Proving reachability is a complete finding. Using stolen keys is real damage, well past testing.',
      },
    ],
  },
  {
    lessonSlug: 'global-laws-quick-tour',
    slug: 'law-and-india-quiz',
    title: 'Law, India Edition check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Under the IT Act, what mainly separates lawful testing from an offence?',
        options: [
          'The tools you used',
          'Whether you had permission or a valid scope',
          'Whether you found a bug',
          'Whether you told anyone',
        ],
        correctIndex: 1,
        explanation: 'Authorisation is the deciding factor under Section 43 (civil) and Section 66 (criminal).',
      },
      {
        prompt: 'What does the DPDP Act mainly govern?',
        options: [
          'How personal data is handled and protected',
          'How fast websites must load',
          'Which programming languages are legal',
          'Export of hardware',
        ],
        correctIndex: 0,
        explanation: "The DPDP Act is India's law on handling personal data.",
      },
      {
        prompt: 'If a bug leaks personal data, what should you do?',
        options: [
          'Download all of it as proof',
          'Prove it with a minimal sample and report it',
          'Keep a copy for later',
          'Share it to warn users',
        ],
        correctIndex: 1,
        explanation: 'Prove minimally, do not hoard personal data, and report through the right channel.',
      },
      {
        prompt: 'What is CERT-In?',
        options: [
          'A certification body',
          "India's national computer emergency response team",
          'A bug bounty platform',
          'A type of firewall',
        ],
        correctIndex: 1,
        explanation: 'CERT-In handles cybersecurity incidents and advisories in India.',
      },
      {
        prompt: "Testing a foreign company's app, what keeps you lawful?",
        options: [
          'Using a VPN',
          "Staying strictly within the program's written scope",
          'Only testing at night',
          'Assuming foreign laws do not apply',
        ],
        correctIndex: 1,
        explanation: 'Scope and authorisation are the constant across every jurisdiction.',
      },
    ],
  },
  {
    lessonSlug: 'staying-current-without-burning-out',
    slug: 'career-quiz',
    title: 'Career check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What makes a security portfolio convincing?',
        options: [
          'A huge number of empty repos',
          'A few real projects and clear writeups',
          "Reposting other people's exploits",
          'Listing every installed tool',
        ],
        correctIndex: 1,
        explanation: 'Depth beats volume - real projects and clean writeups prove skill.',
      },
      {
        prompt: 'How do you actually learn from a CTF challenge?',
        options: [
          'Move on immediately',
          'Write up how you solved it in your own words',
          'Copy the official solution blindly',
          'Only attempt the hardest ones',
        ],
        correctIndex: 1,
        explanation: 'Writing it up forces real understanding and doubles as portfolio proof.',
      },
      {
        prompt: 'In a technical interview, how do you handle a question you cannot answer?',
        options: [
          'Make something up confidently',
          'Explain how you would find the answer',
          'Change the subject',
          'Claim facts do not matter',
        ],
        correctIndex: 1,
        explanation: 'Showing your thinking beats bluffing, which gets exposed and costs you their trust.',
      },
      {
        prompt: 'When is a certification most worth it?',
        options: [
          'As a shortcut when you have no projects',
          'When a job requires it or it proves hands-on skill',
          'When it is the most expensive option',
          'Always - more is better',
        ],
        correctIndex: 1,
        explanation: 'Certs multiply real skill; they help most when required or genuinely hands-on.',
      },
      {
        prompt: 'What is the healthiest way to stay current long term?',
        options: [
          'Read everything the day it drops',
          'A few trusted sources with a steady, restful rhythm',
          'Only study during crunch',
          'Ignore new developments',
        ],
        correctIndex: 1,
        explanation: 'Consistency plus rest keeps you sharp for years without burnout.',
      },
    ],
  },
];
