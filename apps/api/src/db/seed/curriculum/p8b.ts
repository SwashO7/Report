import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'learning-from-real-reports',
    title: 'Learning From Real Reports',
    description: 'Read disclosed bug reports like a pro and steal the thinking behind every finding.',
    lessons: [
      {
        slug: 'how-to-read-a-disclosed-report',
        title: 'How to Read a Disclosed Report',
        summary: 'Disclosed reports are free lessons from people who got paid. Here is how to mine them.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('How to read a disclosed bug report and actually learn something'),
          {
            type: 'paragraph',
            text:
              'Public bug reports are a cheat sheet. Someone found a bug, wrote it up, got paid, and then let the whole world read it. Your job is to read it for the *thinking*, not just the payload.',
          },
          {
            type: 'paragraph',
            text:
              'Most people skim the payload and move on. The gold is in the middle: how did they even find the endpoint? What made them suspicious? What did they try that did not work?',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**Setup** - what was the target and what part were they testing?',
              '**Discovery** - what made them look here? A weird parameter, an old subdomain, a hunch?',
              '**The bug** - the actual flaw, in one sentence you could explain to a friend.',
              '**Escalation** - how they turned "interesting" into "serious".',
              '**Impact** - what an attacker could actually do with it.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the comments too',
            text:
              'The triager comments often reveal why a report was accepted, downgraded, or marked duplicate. That is the difference between a report that pays and one that does not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can pull a repeatable lesson out of any disclosed report instead of just copying its payload.',
          },
          {
            type: 'quiz',
            question: 'When reading a disclosed report, which part teaches you the most?',
            options: [
              'The exact payload string',
              'The discovery and escalation reasoning',
              'The reporter\'s username',
              'The bounty amount',
            ],
            correctIndex: 1,
            explanation: 'The payload is easy to copy. The reasoning - why they looked there and how they escalated - is the reusable skill.',
          },
        ],
      },
      {
        slug: 'case-study-idor',
        title: 'Case Study: An IDOR Worth Real Money',
        summary: 'Walk through how an IDOR gets found, escalated and reported - the pattern, not one company.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('IDOR case study - from one changed number to a serious finding'),
          {
            type: 'image',
            src: '/api/v1/diagrams/idor-flow',
            alt: 'Same user requesting their own invoice and then another user record',
            caption: 'One changed number. The check that was missing is the finding.',
          },
          {
            type: 'paragraph',
            text:
              'IDOR is the bug that never stops paying. The pattern is always the same: the app trusts an ID in your request and forgets to check whether the ID is yours. Here is how a hunter typically works one.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How it gets found',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'The hunter opens their own invoice: `GET /api/invoices/8842`.',
              'They notice the ID is a plain sequential number, not a random token.',
              'They change it to `8841` in a proxy and forward the request.',
              'The server returns someone else\'s invoice. No ownership check.',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'How it gets escalated',
          },
          {
            type: 'paragraph',
            text:
              'One leaked invoice is a finding. A script that walks every ID and dumps thousands of them is a *serious* finding. The hunter proves scale on a tiny sample (two or three IDs) and describes the rest - never actually mass-dumping real user data.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Prove impact, do not cause it',
            text:
              'Show that ID 8841 leaks by fetching one record you were told to test. Do not scrape the whole database - that is real harm, and it can turn a valid report into a legal problem.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Rules of engagement',
            text: 'Only ever test IDs on targets you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot a sequential ID, prove it leaks with a single safe request, and describe the full impact without causing it.',
          },
          { type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab' },
          {
            type: 'quiz',
            question: 'You find that changing an invoice ID returns other users\' data. What is the right way to show impact?',
            options: [
              'Download every invoice in the system',
              'Fetch one or two records as proof and describe the scale',
              'Post the IDs publicly to warn users',
              'Delete the invoices to prove write access',
            ],
            correctIndex: 1,
            explanation: 'Prove the bug with a minimal safe sample and explain the impact. Mass-dumping or deleting real data causes actual harm.',
          },
        ],
      },
      {
        slug: 'case-study-account-takeover',
        title: 'Case Study: Account Takeover',
        summary: 'How small, boring flaws chain together into full control of someone else\'s account.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Account takeover case study - chaining three small bugs into one big one'),
          {
            type: 'paragraph',
            text:
              'Account takeover (ATO) rarely comes from one dramatic bug. It usually comes from two or three small ones that nobody fixed because, alone, each looked harmless.',
          },
          {
            type: 'paragraph',
            text:
              'The classic chain: a password reset that leaks a token, plus a response that reflects that token back, plus no rate limit on the attempt. Individually, meh. Together, game over.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**Step 1** - request a reset for the victim\'s email.',
              '**Step 2** - notice the reset token appears in a response or a redirect URL the attacker can see.',
              '**Step 3** - use the token to set a new password before the victim reacts.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The magic word is "chain"',
            text:
              'A single low-severity bug pays little. Show how it *chains* into account takeover and the severity - and the payout - jumps. Reporters who tell the chain story get paid more.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Rules of engagement',
            text: 'Only test password reset flows against accounts you own or are authorised to test - never a real user\'s.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can see how harmless-looking flaws combine, and you know why chaining them is what earns the real money.',
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
            explanation: 'ATO is a chain. Each bug alone is minor; combined they give full control of an account, which is high impact.',
          },
        ],
      },
      {
        slug: 'case-study-ssrf-to-cloud',
        title: 'Case Study: SSRF to Cloud Keys',
        summary: 'How a "harmless" server-side fetch reaches the cloud metadata service and walks out with credentials.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('SSRF case study - from an image-URL field to cloud credentials'),
          {
            type: 'paragraph',
            text:
              'SSRF (Server-Side Request Forgery) is where you make the server fetch a URL *you* choose. Sounds boring. In the cloud it is one of the scariest bugs there is.',
          },
          {
            type: 'paragraph',
            text:
              'Cloud servers can ask a special internal address for their own credentials. If you can make the app fetch that address for you, the credentials come back in the response. That is the whole trick.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The pattern',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Find a feature that fetches a URL - an "import from URL", a webhook, a profile-image link.',
              'Point it at an internal address instead of a public one.',
              'If the app fetches the cloud metadata endpoint, it may hand back temporary keys.',
              'Report the SSRF and the credential exposure it leads to.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'You do not need to use the keys',
            text:
              'Proving the metadata endpoint is reachable and returns a credential structure is enough. Do not actually use stolen keys to touch cloud resources - that is well past testing and into real damage.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Rules of engagement',
            text: 'Only send server-side fetches at infrastructure you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You understand why a simple URL-fetch feature can leak cloud keys, and where the safe line is when you prove it.',
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
            explanation: 'Cloud instances expose credentials via an internal metadata endpoint. SSRF that reaches it can pull those credentials out.',
          },
        ],
      },
    ],
  },
  {
    slug: 'law-and-india',
    title: 'Law, India Edition',
    description: 'The specific rules that apply to you as a security learner and hunter in India.',
    lessons: [
      {
        slug: 'indian-it-act-and-hacking',
        title: 'The IT Act and You',
        summary: 'The one law that decides whether your testing is research or a crime in India.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('The IT Act explained for security learners in India'),
          {
            type: 'paragraph',
            text:
              'In India, the main law covering computers is the Information Technology Act, 2000 (the IT Act). It is the line between "security researcher" and "accused".',
          },
          {
            type: 'paragraph',
            text:
              'The core idea is simple: accessing a computer or system without the owner\'s permission is an offence. Section 43 covers unauthorised access, downloading, and damage; Section 66 makes doing it dishonestly or fraudulently a criminal offence with possible jail time.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Section 43** - unauthorised access, copying data, or causing damage (civil liability, can be heavy).',
              '**Section 66** - the same acts done dishonestly or fraudulently, now criminal.',
              '**Permission is everything** - written authorisation or a public bug bounty scope is what makes your testing lawful.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'No permission, no test',
            text:
              'Curiosity is not a defence. "I just wanted to see if it was vulnerable" has landed people in serious trouble. If it is not yours and there is no scope allowing it, do not touch it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is education, not legal advice',
            text:
              'This lesson explains the law in plain terms so you can stay safe. It is not legal advice. For anything real - a dispute, a takedown, a police notice - talk to an actual lawyer.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know that permission is what makes hacking legal in India, and which sections of the IT Act you are staying on the right side of.',
          },
          {
            type: 'quiz',
            question: 'Under the IT Act, what mainly separates lawful security testing from an offence?',
            options: [
              'Whether you used advanced tools',
              'Whether you had the owner\'s permission or a valid scope',
              'Whether you found a bug or not',
              'Whether you reported it publicly',
            ],
            correctIndex: 1,
            explanation: 'Authorisation is the deciding factor. Access without permission is an offence under Section 43 and, if dishonest, Section 66.',
          },
        ],
      },
      {
        slug: 'dpdp-act-basics',
        title: 'DPDP Act Basics',
        summary: 'India\'s data protection law, and why it matters the moment you touch personal data.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('The DPDP Act in plain English for hackers and hunters'),
          {
            type: 'paragraph',
            text:
              'The Digital Personal Data Protection Act, 2023 (DPDP Act) is India\'s law about how personal data must be handled. As a hunter, it changes how you treat any data you stumble into.',
          },
          {
            type: 'paragraph',
            text:
              'Personal data is anything that identifies a person - name, phone number, Aadhaar, email, address. The law says organisations must protect it and only use it for clear, consented purposes.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Consent and purpose** - data should be collected for a stated reason, with the person\'s consent.',
              '**Data fiduciary** - the org holding your data has duties to protect it.',
              '**Your finding** - if a bug leaks personal data, that is high impact under this law, which strengthens your report.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not hoard what you find',
            text:
              'If a bug exposes personal data, prove it with the smallest possible sample and stop. Copying, keeping, or sharing real personal data can put *you* on the wrong side of the DPDP Act.',
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
            text: 'You understand what personal data is under the DPDP Act and why leaking it makes a finding serious - and why you must not keep it.',
          },
          {
            type: 'quiz',
            question: 'You find a bug that exposes users\' phone numbers and Aadhaar-linked details. How does the DPDP Act shape your response?',
            options: [
              'It means you can freely download the data as proof',
              'It makes the leak high impact, so prove it with a minimal sample and report it',
              'It does not apply to security testing',
              'It requires you to notify every affected user yourself',
            ],
            correctIndex: 1,
            explanation: 'Exposed personal data is high impact under the DPDP Act. Prove it minimally, do not hoard it, and report through the right channel.',
          },
        ],
      },
      {
        slug: 'cert-in-and-incident-reporting',
        title: 'CERT-In and Incident Reporting',
        summary: 'Who India\'s national cyber team is, and where a serious finding is supposed to go.',
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('CERT-In explained - India\'s cyber emergency team and how reporting works'),
          {
            type: 'paragraph',
            text:
              'CERT-In (the Indian Computer Emergency Response Team) is the government body that handles cybersecurity incidents in India. Think of it as the national help desk for serious cyber trouble.',
          },
          {
            type: 'paragraph',
            text:
              'CERT-In issues advisories, coordinates responses to big incidents, and has rules requiring organisations to report certain incidents within a set time. As a hunter you rarely file with CERT-In directly, but you should know it exists and who is meant to report to it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Advisories** - CERT-In publishes warnings about active threats and vulnerabilities.',
              '**Mandatory reporting** - orgs must report specified incidents (like breaches) to CERT-In quickly.',
              '**Your route** - usually you report to the *program* or *company*; they escalate to CERT-In if required.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Report to the owner first',
            text:
              'For a normal finding, your channel is the bug bounty program or the company\'s security contact. CERT-In is for the organisation to loop in, not usually your first stop.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is education, not legal advice',
            text:
              'This explains the reporting landscape in plain terms. It is not legal advice - reporting obligations can be specific and time-bound, so an organisation with a real incident should get proper legal counsel.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know what CERT-In is, that organisations have reporting duties, and that your normal path is through the program or company.',
          },
          {
            type: 'quiz',
            question: 'As an individual hunter, where does a typical finding usually go first?',
            options: [
              'Straight to CERT-In',
              'To the bug bounty program or company security contact',
              'To the police',
              'To social media',
            ],
            correctIndex: 1,
            explanation: 'You report to the program or company. They handle any mandatory CERT-In reporting for serious incidents.',
          },
        ],
      },
      {
        slug: 'global-laws-quick-tour',
        title: 'Global Laws Quick Tour',
        summary: 'A one-lesson map of the big foreign laws you will bump into on international programs.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('Global cyber laws in one lesson - CFAA, GDPR and why scope still rules'),
          {
            type: 'paragraph',
            text:
              'Bug bounty is global. The moment you test a company based abroad, foreign law can apply too. You do not need to be a lawyer - you just need to know the big names and the one rule that never changes.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**CFAA (USA)** - the Computer Fraud and Abuse Act; unauthorised access is a serious offence there.',
              '**GDPR (EU)** - strict rules on handling personal data of people in Europe.',
              '**Computer Misuse Act (UK)** - the UK\'s version of "no unauthorised access".',
              '**The constant** - authorisation and scope keep you legal everywhere.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The scope is your passport',
            text:
              'You do not memorise every country\'s law. You stay inside the program\'s written scope. Scope is the permission that makes your testing lawful, whichever flag the server flies under.',
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
            text: 'You can name the major international cyber laws and you know that staying inside scope is what keeps you safe across all of them.',
          },
          {
            type: 'quiz',
            question: 'You are testing a US-based company\'s app from India. What keeps you on the right side of the law?',
            options: [
              'India\'s laws do not apply, so anything goes',
              'Staying strictly within the program\'s written scope and authorisation',
              'Using a VPN to hide your location',
              'Only testing at night',
            ],
            correctIndex: 1,
            explanation: 'Multiple laws can apply, but authorisation and scope are the constant. Stay in scope and you stay lawful.',
          },
        ],
      },
    ],
  },
  {
    slug: 'career',
    title: 'Career',
    description: 'Turn what you have learned into a job offer or a self-employed hunting practice.',
    lessons: [
      {
        slug: 'portfolio-and-github-presence',
        title: 'Portfolio and GitHub Presence',
        summary: 'What to put online so a recruiter believes you can actually do the work.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Building a security portfolio that gets you noticed'),
          {
            type: 'paragraph',
            text:
              'Nobody hires a certificate. They hire proof. A tidy GitHub and a small portfolio say more in ten seconds than a page of buzzwords on a resume.',
          },
          {
            type: 'paragraph',
            text:
              'You do not need a hundred repos. You need a few good ones: a tool you wrote, clean writeups of labs you solved, notes that show how you think.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A tool or two** - even a small port scanner in Python shows you can build.',
              '**Writeups** - lab and CTF solutions explained clearly, without spoiling live targets.',
              '**A clean README** - one good README beats ten empty repos.',
              '**Consistency** - a steady trickle of commits beats one heroic weekend.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Never leak real targets',
            text:
              'Do not post writeups about live, unpatched bugs or private program details. That breaks disclosure rules and scares off every serious employer.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know what a hireable portfolio looks like: a few real projects, clear writeups, and nothing that leaks a live target.',
          },
          {
            type: 'quiz',
            question: 'What makes a security portfolio convincing to a recruiter?',
            options: [
              'The number of repositories, empty or not',
              'A few real projects and clear writeups that show how you think',
              'Listing every tool you have ever installed',
              'Reposting other people\'s exploits',
            ],
            correctIndex: 1,
            explanation: 'Depth beats volume. A few real projects and clean writeups prove skill far better than a long, empty repo list.',
          },
        ],
      },
      {
        slug: 'ctfs-and-practice-platforms',
        title: 'CTFs and Practice Platforms',
        summary: 'Where to actually get your reps in, and how to practise without wasting your evenings.',
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('CTFs and practice platforms - how to train without burning out'),
          {
            type: 'paragraph',
            text:
              'Reading about hacking is like reading about swimming. CTFs and practice labs are the pool. They give you safe, legal targets that are *meant* to be broken.',
          },
          {
            type: 'paragraph',
            text:
              'There are two flavours: CTF events (time-boxed puzzle competitions) and always-on lab platforms where you grind at your own pace. You want both - events for pressure, labs for depth.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**CTF events** - fast, competitive, great for pattern recognition.',
              '**Lab platforms** - structured challenges you can repeat until it clicks.',
              '**Write it up** - a challenge you cannot explain is a challenge you did not really solve.',
              '**Suraksha Labs** - your own labs here count; treat them like real targets.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Quality over grinding',
            text:
              'Solving three challenges properly and writing them up beats rushing twenty and remembering none. Depth compounds.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know the two kinds of practice and why writing up what you solve is what turns a lucky solve into a real skill.',
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
            explanation: 'Writing it up forces you to understand the solve. If you cannot explain it, you did not really learn it.',
          },
        ],
      },
      {
        slug: 'resume-and-interviews',
        title: 'Resume and Interviews',
        summary: 'Say what you can do, prove it, and survive the technical interview without bluffing.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Security resume and interview tips that actually land the offer'),
          {
            type: 'paragraph',
            text:
              'A security resume is not a keyword dump. It is a short story: here is what I can do, here is proof, here is how to reach me. One page, no fluff.',
          },
          {
            type: 'paragraph',
            text:
              'In the interview, they are testing how you *think*, not whether you memorised every port number. "I do not know, but here is how I would find out" is a strong answer, not a weak one.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Show proof** - link your GitHub, writeups, and any labs or CTFs you have done.',
              '**Be specific** - "found and reported an IDOR in a practice lab" beats "web security".',
              '**Never bluff** - inventing knowledge in a technical interview ends badly and fast.',
              '**Ask questions** - curiosity reads as competence.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not pad, do not lie',
            text:
              'One padded claim you cannot back up in the interview sinks the whole resume. Under-promise on paper, over-deliver in the room.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can write a tight, honest security resume and handle a technical interview by showing your thinking instead of bluffing.',
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
            explanation: 'Interviewers test your thinking. Showing your approach beats bluffing, which almost always gets exposed.',
          },
        ],
      },
      {
        slug: 'certifications-worth-it-or-not',
        title: 'Certifications: Worth It?',
        summary: 'When a cert actually helps your career, and when it is just an expensive sticker.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('Are security certifications worth it? An honest breakdown'),
          {
            type: 'paragraph',
            text:
              'Certifications are neither magic nor useless. They are a signal - useful in some situations, a waste of money in others. The trick is knowing which situation you are in.',
          },
          {
            type: 'paragraph',
            text:
              'A hands-on, exam-by-doing cert can prove practical skill. A pure multiple-choice cert mostly proves you can pass a multiple-choice exam. Employers know the difference too.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Helps when** - a job posting explicitly requires it, or HR filters by it.',
              '**Helps when** - it is practical and hands-on, so passing it means you can actually do the work.',
              '**Does not help when** - you have no projects, no writeups, and think a cert alone will get you hired.',
              '**Skill first** - a cert on top of real proof is great; a cert instead of proof is thin.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A cert is a multiplier, not a base',
            text:
              'Certs multiply an existing foundation of skill and proof. Multiply zero and you still have zero. Build the skill first.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can decide whether a specific cert is worth your money and time, instead of chasing letters for their own sake.',
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
            explanation: 'Certs help most when a job requires them or when they are practical. They multiply real skill; they do not replace it.',
          },
        ],
      },
      {
        slug: 'staying-current-without-burning-out',
        title: 'Staying Current Without Burning Out',
        summary: 'Security never stops moving. Here is how to keep up without frying yourself.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('How to stay current in security without burning out'),
          {
            type: 'paragraph',
            text:
              'Security moves fast, and the internet will happily convince you that you are falling behind every single day. You are not. Chasing every new thing is the fastest way to burn out and quit.',
          },
          {
            type: 'paragraph',
            text:
              'The pros are not reading everything. They have a small, trusted set of sources and a steady rhythm. Consistency beats intensity, every time.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Pick a few sources** - a handful of good newsletters or researchers, not fifty.',
              '**Little and often** - twenty minutes daily beats a frantic all-nighter once a month.',
              '**Rest on purpose** - breaks are part of the job, not a failure of it.',
              '**Depth over FOMO** - you cannot learn everything, and you do not need to.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Burnout is a security risk',
            text:
              'A tired, resentful hunter makes sloppy mistakes and misses obvious bugs. Protecting your energy is protecting your work.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You have a sustainable way to keep learning: a few good sources, a steady rhythm, and permission to rest.',
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
            explanation: 'Consistency beats intensity. A small trusted set of sources plus real rest keeps you sharp without burning out.',
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
          'The reporter\'s handle',
          'The date it was filed',
        ],
        correctIndex: 1,
        explanation: 'Payloads are easy to copy. The reasoning is the transferable skill.',
      },
      {
        prompt: 'What is the safe way to prove an IDOR leaks other users\' data?',
        options: [
          'Dump the entire database',
          'Fetch one or two records and describe the scale',
          'Delete a record to prove write access',
          'Publish the IDs online',
        ],
        correctIndex: 1,
        explanation: 'Prove it with a minimal sample. Mass-dumping or deleting real data is real harm.',
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
        explanation: 'SSRF that reaches the cloud metadata endpoint can pull temporary credentials.',
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
        explanation: 'Proving reachability is enough. Using stolen keys is real damage, well past testing.',
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
        explanation: 'Authorisation is the deciding factor under Sections 43 and 66.',
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
        explanation: 'The DPDP Act is India\'s law on handling personal data.',
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
          'India\'s national computer emergency response team',
          'A bug bounty platform',
          'A type of firewall',
        ],
        correctIndex: 1,
        explanation: 'CERT-In handles cybersecurity incidents and advisories in India.',
      },
      {
        prompt: 'Testing a foreign company\'s app, what keeps you lawful?',
        options: [
          'Using a VPN',
          'Staying strictly within the program\'s written scope',
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
          'Reposting other people\'s exploits',
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
        explanation: 'Writing it up forces real understanding.',
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
        explanation: 'Showing your thinking beats bluffing, which gets exposed.',
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
        explanation: 'Certs multiply real skill; they help most when required or genuinely practical.',
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
        explanation: 'Consistency plus rest keeps you sharp without burnout.',
      },
    ],
  },
];
