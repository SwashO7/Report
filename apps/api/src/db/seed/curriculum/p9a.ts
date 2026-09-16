import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'windows-and-ad',
    title: 'Windows and Active Directory',
    description: 'Understand the domain-joined Windows world most companies actually run on.',
    lessons: [
      {
        slug: 'active-directory-basics',
        title: 'Active Directory Basics',
        summary: 'AD is the phonebook and the bouncer for a whole company of Windows machines.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Active Directory explained for beginners - what it is and why hackers care'),
          {
            type: 'paragraph',
            text:
              'Most offices do not manage 500 laptops one by one. They join them all to one central system called Active Directory (AD). Log in once, and AD decides what you can touch everywhere.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like your apartment society. There is one gate register (the domain), each flat has an owner (a user), families are grouped (groups), and the secretary decides who gets which key (permissions). Break into the secretary\'s office and you get every key.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Domain** - the whole managed network, e.g. `corp.local`',
              '**Domain Controller (DC)** - the server that holds AD and answers "can this person do this?"',
              '**User / Computer objects** - every account and machine is an object in AD',
              '**Groups** - bundles of users, like `Domain Admins`',
              '**OU (Organisational Unit)** - folders to organise objects and apply policy',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why attackers love AD',
            text:
              'One misconfigured permission can be a path from a normal user to *Domain Admin* - which means every machine in the company. That is why AD is a whole career on its own.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain what a domain, a domain controller and Domain Admins are - the map you need before you enumerate anything.',
          },
          {
            type: 'quiz',
            question: 'What does a Domain Controller do?',
            options: [
              'Runs the company website',
              'Holds Active Directory and answers authentication and permission questions',
              'Stores everyone\'s email',
              'Acts as the office firewall',
            ],
            correctIndex: 1,
            explanation: 'The DC hosts AD and decides who is who and what they can access. Compromise it and you effectively own the domain.',
          },
        ],
      },
      {
        slug: 'ad-enumeration',
        title: 'AD Enumeration',
        summary: 'Before you attack a domain, you map it - users, groups, and who can reach what.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('AD enumeration basics - reading a domain before you touch it'),
          {
            type: 'paragraph',
            text:
              'Enumeration is just careful reading. Once you have any valid domain account, you can ask AD polite questions and it answers: who are the admins, which machines exist, which accounts are stale. No exploit yet - just listing.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'List all users and groups in the domain',
              'Find who is in high-value groups like `Domain Admins`',
              'Spot service accounts and old, forgotten accounts',
              'Map trust relationships between domains',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The key idea: AD is designed to be readable by any authenticated user. That readability is the enumeration surface. Tools like `BloodHound` turn all these answers into a graph that literally draws the shortest path to Domain Admin.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Loud vs quiet',
            text:
              'Some queries are normal traffic; others light up defenders instantly. Understanding which is which is half the skill. On a lab it does not matter - on a real engagement it decides whether you get caught.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Only enumerate a domain you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You understand that enumeration is reading, not breaking - and that AD hands out most of its map to any logged-in user.',
          },
          {
            type: 'quiz',
            question: 'Why can a normal, non-admin domain user still enumerate a lot of AD?',
            options: [
              'Because AD has a public API on the internet',
              'Because AD is designed so authenticated users can read most directory objects',
              'Because every user is secretly an admin',
              'Because enumeration always requires exploiting a bug first',
            ],
            correctIndex: 1,
            explanation: 'AD is meant to be queryable by authenticated users so apps and people can find each other. That readability is exactly what enumeration uses.',
          },
        ],
      },
      {
        slug: 'kerberos-and-ntlm',
        title: 'Kerberos and NTLM',
        summary: 'The two ways Windows proves who you are - and why one is a museum piece.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          videoSlot('Kerberos vs NTLM - how Windows logins actually work'),
          {
            type: 'paragraph',
            text:
              'When you log into a Windows domain, something has to prove it is really you without sending your password around. Windows has two systems for that: the old one (NTLM) and the modern one (Kerberos).',
          },
          {
            type: 'heading',
            level: 3,
            text: 'NTLM: the old challenge-response',
          },
          {
            type: 'paragraph',
            text:
              'NTLM works with a hash of your password and a challenge-response dance. It still exists for backwards compatibility, and that is exactly the problem - old protocols carry old weaknesses.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Kerberos: tickets, not passwords',
          },
          {
            type: 'paragraph',
            text:
              'Kerberos is like the ticket counter at a railway station. You show ID once and get a ticket (a TGT). After that, you flash tickets to board specific trains (services) without proving your identity again each time.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why it matters for you',
            text:
              'A huge chunk of AD attacks are really "abuse the way tickets are issued or stored". You cannot understand those attacks without first understanding what a ticket is.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell NTLM (old challenge-response) apart from Kerberos (ticket-based) and say why tickets exist.',
          },
          {
            type: 'quiz',
            question: 'In Kerberos, what is the point of a ticket (TGT)?',
            options: [
              'It stores your password in plaintext',
              'It lets you access services without re-proving your identity each time',
              'It encrypts the whole network',
              'It replaces the domain controller',
            ],
            correctIndex: 1,
            explanation: 'You authenticate once and get a ticket; you then present tickets to reach services, like a railway ticket after buying it at the counter.',
          },
        ],
      },
      {
        slug: 'common-ad-attacks',
        title: 'Common AD Attacks',
        summary: 'The named attacks you keep hearing about - what each one abuses, in plain words.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          videoSlot('Common Active Directory attacks explained without the jargon'),
          {
            type: 'paragraph',
            text:
              'AD attacks have scary names - Kerberoasting, Pass-the-Hash, ticket abuse. Underneath, most of them are one idea: a credential or a ticket ends up somewhere it should not, and you reuse it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Kerberoasting** - request tickets for service accounts, then crack their passwords offline',
              '**Pass-the-Hash** - reuse a stolen password *hash* to log in without knowing the password',
              '**Ticket abuse** - reuse or forge Kerberos tickets to move around',
              '**Weak permissions** - one group can reset another group\'s password, so you chain to admin',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Notice the pattern: none of these are "hack the encryption". They abuse how credentials are stored, cached and handed out. Defenders fix them with better hygiene, not better maths.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Concept over recipe',
            text:
              'You will meet the exact commands later in a hands-on lab. Right now, focus on *what each attack abuses* - that understanding is what lets you spot the weakness and, later, detect it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'These techniques belong only on a domain you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can name the common AD attacks and say, for each, which credential or ticket weakness it abuses.',
          },
          {
            type: 'practice_ref',
            title: 'Windows and AD check',
            exerciseSlug: 'windows-and-ad-quiz',
          },
          {
            type: 'quiz',
            question: 'What do Kerberoasting, Pass-the-Hash and ticket abuse have in common?',
            options: [
              'They all break the encryption AD uses',
              'They all abuse how credentials or tickets are stored, cached or handed out',
              'They only work over the public internet',
              'They require Domain Admin before you start',
            ],
            correctIndex: 1,
            explanation: 'The common thread is reusing or requesting a credential/ticket that is exposed - not defeating the cryptography itself.',
          },
        ],
      },
    ],
  },
  {
    slug: 'privilege-escalation',
    title: 'Privilege Escalation',
    description: 'Turn a low-level foothold into full control of the machine you landed on.',
    lessons: [
      {
        slug: 'linux-privesc-basics',
        title: 'Linux Privilege Escalation',
        summary: 'You got a normal shell. Now you want root - and Linux often leaves the door ajar.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Linux privilege escalation basics - from a normal user to root'),
          {
            type: 'image',
            src: '/api/v1/diagrams/privesc-ladder',
            alt: 'A low privilege shell climbing through misconfigurations to root',
            caption: 'Nobody hands you root. You climb small mistakes.',
          },
          {
            type: 'paragraph',
            text:
              'You broke in and got a shell, but as a low-privilege user. Privilege escalation is going from "can barely look around" to "root" - the account that owns the box. Most of the time you do not need a fancy exploit. You need to notice something the admin left messy.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Misconfigured `sudo` rights that let you run one thing as root',
              'Files or scripts owned by root but writable by you',
              'SUID binaries that run as their owner',
              'Passwords sitting in config files, history or backups',
              'Old, unpatched kernel with a known bug',
            ],
          },
          {
            type: 'command',
            description: 'Read-only checks you can safely run to understand your own privileges:',
            commands: ['id', 'sudo -l', 'find / -perm -4000 -type f 2>/dev/null'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Enumeration wins here too',
            text:
              'Privesc is 90% careful looking. Tools like `linpeas` just automate the checks above. The skill is reading the output and asking "what here trusts me more than it should?"',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Only escalate privileges on a machine you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the main things to check on a Linux box for a path to root, and that most privesc is spotting a misconfiguration, not writing an exploit.',
          },
          {
            type: 'quiz',
            question: 'What does `sudo -l` show you?',
            options: [
              'A list of all users on the system',
              'Which commands you are allowed to run with sudo',
              'The root password',
              'Every open network port',
            ],
            correctIndex: 1,
            explanation: '`sudo -l` lists what your account can run via sudo. A too-generous entry is often the whole path to root.',
          },
        ],
      },
      {
        slug: 'windows-privesc-basics',
        title: 'Windows Privilege Escalation',
        summary: 'Same goal, different box: get from a normal Windows account to SYSTEM.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Windows privilege escalation basics - reaching SYSTEM'),
          {
            type: 'paragraph',
            text:
              'On Windows the top account is called SYSTEM. The idea is identical to Linux: you land as a normal user and look for something the setup got wrong. Windows just hides its mess in different places.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Services whose files you can overwrite, running as SYSTEM',
              'Unquoted service paths that let Windows run *your* file by mistake',
              'Scheduled tasks running as a higher-privileged user',
              'Passwords in the registry, saved credentials, or scripts',
              'Missing patches for known local bugs',
            ],
          },
          {
            type: 'command',
            description: 'Read-only checks to understand your Windows privileges:',
            commands: ['whoami /priv', 'whoami /groups'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Privileges are gold',
            text:
              'Look closely at `whoami /priv`. Certain enabled privileges (the ones ending in `Privilege`) are basically a shortcut to SYSTEM. Knowing which ones matter beats memorising every technique.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Only escalate privileges on a machine you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can map the Linux privesc mindset onto Windows: land low, hunt misconfigured services, tasks and stored credentials, aim for SYSTEM.',
          },
          {
            type: 'quiz',
            question: 'What is the Windows equivalent of Linux root?',
            options: ['Administrator only', 'Guest', 'SYSTEM', 'The domain user'],
            correctIndex: 2,
            explanation: 'SYSTEM is the highest local account on Windows. Reaching it means you fully own that machine.',
          },
        ],
      },
      {
        slug: 'credential-hunting',
        title: 'Credential Hunting',
        summary: 'The fastest privesc is finding a password someone already left lying around.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Credential hunting - where passwords hide on a compromised box'),
          {
            type: 'paragraph',
            text:
              'Why crack a password when someone saved it in a text file? Once you are on a machine, hunting for credentials is often quicker than any exploit. People stash passwords everywhere and forget.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Config files with database or API passwords',
              'Shell history (`.bash_history`) where someone typed a password on the command line',
              'Backup files and `.old` copies',
              'Scripts with hardcoded credentials',
              'Saved passwords in browsers and credential stores',
            ],
          },
          {
            type: 'command',
            description: 'Example of grepping your own files for password-looking strings:',
            commands: ['grep -riE \'password|passwd|secret\' /etc/ 2>/dev/null'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Reuse is the real prize',
            text:
              'A password found on one machine very often works on another. That is how a single foothold becomes lateral movement across a whole network.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Only search for credentials on systems you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know the usual hiding spots for credentials and why a reused password turns one box into many.',
          },
          {
            type: 'quiz',
            question: 'Why is credential reuse so valuable to an attacker?',
            options: [
              'It encrypts the target for you',
              'A password found on one machine often unlocks others, enabling lateral movement',
              'It automatically grants Domain Admin',
              'It hides your activity from all logs',
            ],
            correctIndex: 1,
            explanation: 'People reuse passwords across systems, so one recovered credential frequently opens more doors elsewhere.',
          },
        ],
      },
      {
        slug: 'post-exploitation-concepts',
        title: 'Post-Exploitation Concepts',
        summary: 'You are in and you are root. Now what? The goals that come after the breach.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Post-exploitation explained - what attackers do after they get in'),
          {
            type: 'paragraph',
            text:
              'Getting root is not the finish line - in a real assessment it is the start of the interesting part. Post-exploitation is everything you do once you have control: prove impact, look around, and (in an authorised test) document it all.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Persistence** - keeping access if the box reboots or your session drops',
              '**Situational awareness** - what is this machine, what can it reach?',
              '**Lateral movement** - hopping to the next machine with what you found',
              '**Collection** - gathering the evidence that proves the impact',
              '**Cleanup** - on an authorised test, restoring things and reporting honestly',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Impact is the point',
            text:
              'A finding that says "I got a shell" is weak. A finding that says "from that shell I reached the customer database" is what actually gets fixed - and paid.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Post-exploitation activity is only ever performed on systems you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand that owning a box is a means to demonstrating real impact, not the end goal itself.',
          },
          {
            type: 'quiz',
            question: 'In an authorised assessment, what makes a post-exploitation finding strong?',
            options: [
              'It shows you got a shell',
              'It demonstrates concrete impact, like reaching sensitive data',
              'It leaves as many backdoors as possible',
              'It deletes the logs',
            ],
            correctIndex: 1,
            explanation: 'Demonstrated impact - what an attacker could actually reach or do - is what convinces an organisation to fix the issue.',
          },
        ],
      },
    ],
  },
  {
    slug: 'cryptography',
    title: 'Cryptography',
    description: 'Learn just enough crypto to spot where developers get it dangerously wrong.',
    lessons: [
      {
        slug: 'symmetric-vs-asymmetric',
        title: 'Symmetric vs Asymmetric',
        summary: 'Two families of encryption: one shared key, or a public/private pair.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('Symmetric vs asymmetric encryption in 6 minutes'),
          {
            type: 'image',
            src: '/api/v1/diagrams/symmetric-vs-asymmetric',
            alt: 'One shared key beside a public and private key pair',
            caption: 'One shared secret, or a pair where only half is secret.',
          },
          {
            type: 'paragraph',
            text:
              'All of encryption splits into two families. Get this split and most of crypto stops being scary.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Symmetric: one shared key',
          },
          {
            type: 'paragraph',
            text:
              'Same key locks and unlocks. Fast, great for bulk data. The catch: both sides need the same secret key, so how do you share it safely in the first place? Like a padlock where you and your friend both hold copies of the one key.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Asymmetric: a public/private pair',
          },
          {
            type: 'paragraph',
            text:
              'Two matched keys. The public key locks; only the matching private key unlocks. You can hand your public key to the whole world. Slower, but it solves the key-sharing problem. This is what makes HTTPS possible.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The real world uses both',
            text:
              'HTTPS uses asymmetric crypto to safely agree on a shared symmetric key, then switches to fast symmetric encryption for the actual data. Best of both.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell symmetric (one shared key) from asymmetric (public/private pair) and say why HTTPS uses both.',
          },
          {
            type: 'quiz',
            question: 'Which describes asymmetric encryption?',
            options: [
              'One shared secret key for both locking and unlocking',
              'A public key locks and a matching private key unlocks',
              'No keys at all',
              'A key that changes every second',
            ],
            correctIndex: 1,
            explanation: 'Asymmetric uses a key pair: anyone can encrypt with the public key, but only the private key holder can decrypt.',
          },
        ],
      },
      {
        slug: 'common-crypto-mistakes',
        title: 'Common Crypto Mistakes',
        summary: 'Attackers rarely break the maths. They break the way developers used it.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Common cryptography mistakes developers make'),
          {
            type: 'image',
            src: '/api/v1/diagrams/hashing-vs-encryption',
            alt: 'Encoding, encryption and hashing compared side by side',
            caption: 'Mixing these three up is the most common crypto bug there is.',
          },
          {
            type: 'paragraph',
            text:
              'Good news: you almost never need to break encryption itself. Developers hand you the win by using it wrong. Spotting these mistakes is a genuine, findable bug class.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Rolling their own encryption instead of using a vetted library',
              'Hardcoding keys or secrets in the source code',
              'Using old, broken algorithms like MD5 or DES for security',
              'Reusing the same nonce or IV, which leaks patterns',
              'Storing passwords with fast hashes, or no salt',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The theme: the cryptography is fine, the *usage* is not. A perfect lock is useless if the key is taped to the door - and hardcoded keys are exactly that.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The golden rule',
            text:
              'If you ever see a comment like "custom encryption" or a key sitting in a repo, slow down - you probably found something. Never write your own crypto; use libraries experts already reviewed.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can name the classic crypto misuse patterns and know that the bug is almost always the usage, not the algorithm.',
          },
          {
            type: 'quiz',
            question: 'Where do most real-world crypto weaknesses come from?',
            options: [
              'Breaking the underlying mathematics of AES',
              'Developers using crypto incorrectly - hardcoded keys, old algorithms, reused IVs',
              'Quantum computers',
              'The encryption being too strong',
            ],
            correctIndex: 1,
            explanation: 'The algorithms are usually solid. The findable bugs are in how developers configure and apply them.',
          },
        ],
      },
      {
        slug: 'random-numbers-and-tokens',
        title: 'Random Numbers and Tokens',
        summary: 'If your "random" is predictable, your session tokens and resets are guessable.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Why weak randomness breaks security - tokens you can guess'),
          {
            type: 'paragraph',
            text:
              'Session IDs, password reset links, API keys - they all lean on one thing being truly unpredictable: randomness. Get the randomness wrong and an attacker can guess the next value.',
          },
          {
            type: 'paragraph',
            text:
              'There are two kinds of random. Normal random (like `Math.random()`) is fine for shuffling a playlist but *predictable* enough to attack. Cryptographically secure random is built to be unguessable. Using the wrong one for a token is a real, exploitable bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Tokens based on the current time - guess the time, guess the token',
              'Sequential IDs where the next one is just +1',
              'Ordinary (non-secure) random used for security tokens',
              'Short tokens that are simply brute-forceable',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Smell test',
            text:
              'If a reset token or session ID looks short, looks like a timestamp, or two of them look suspiciously close together, poke at it. Predictable tokens have caused full account takeovers.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can tell ordinary randomness from cryptographically secure randomness and why the difference matters for tokens.',
          },
          {
            type: 'quiz',
            question: 'Why is using `Math.random()` for a password reset token dangerous?',
            options: [
              'It is too slow',
              'It is not cryptographically secure, so tokens can be predictable and guessable',
              'It only generates even numbers',
              'It requires an internet connection',
            ],
            correctIndex: 1,
            explanation: 'Ordinary random is predictable enough to attack. Security tokens need a cryptographically secure random source.',
          },
        ],
      },
      {
        slug: 'padding-oracle-and-ecb',
        title: 'Padding Oracle and ECB Patterns',
        summary: 'Two classic ways encryption leaks its secrets without the key being broken.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          videoSlot('Padding oracle and ECB - how encryption leaks without breaking the key'),
          {
            type: 'paragraph',
            text:
              'These sound advanced, but both are the same lesson: encryption done a certain way leaks information, even though nobody ever recovers the key.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'ECB: the same block looks the same',
          },
          {
            type: 'paragraph',
            text:
              'ECB mode encrypts each chunk independently, so identical input chunks produce identical output chunks. Encrypt a picture in ECB and you can still see the picture. Patterns survive - that alone leaks structure.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Padding oracle: the server tells on itself',
          },
          {
            type: 'paragraph',
            text:
              'If a server responds differently when the padding of decrypted data is valid vs invalid, that tiny difference is a leak. Ask enough carefully crafted questions and you can decrypt data one byte at a time - without ever having the key.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The pattern to internalise',
            text:
              'Any time a system reacts *differently* to valid vs invalid data, that difference is information. That is the seed of a whole family of attacks.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Probe encryption behaviour only on systems you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand that ECB leaks patterns and a padding oracle leaks via different responses - both without breaking the key.',
          },
          {
            type: 'quiz',
            question: 'Why is ECB mode a problem?',
            options: [
              'It is far too slow to use',
              'Identical plaintext blocks produce identical ciphertext blocks, so patterns leak',
              'It cannot encrypt text, only numbers',
              'It shares the key publicly',
            ],
            correctIndex: 1,
            explanation: 'ECB encrypts each block independently, so repeated input shows up as repeated output - the structure of the data leaks through.',
          },
        ],
      },
      {
        slug: 'crypto-in-ctfs',
        title: 'Crypto in CTFs',
        summary: 'How crypto challenges actually show up in competitions - and how to approach them.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Crypto CTF challenges - how to approach them without a maths degree'),
          {
            type: 'paragraph',
            text:
              'CTF crypto challenges scare beginners off, but most are not "invent new maths". They are "spot the deliberate mistake the author planted". Once you know the common mistakes, they turn into puzzles you can actually solve.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Encoding disguised as encryption - it is just Base64 or hex, decode it',
              'A weak or tiny key you can brute-force',
              'A known algorithm used with a known flaw (like ECB or a reused nonce)',
              'A padding oracle you interact with',
              'A classic cipher (Caesar, XOR) hiding under a fancy name',
            ],
          },
          {
            type: 'command',
            description: 'A first move for any mystery blob - is it just encoding?',
            commands: ['echo \'SGVsbG8=\' | base64 -d'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Always try the boring thing first',
            text:
              'Before assuming hard maths, check if it is just encoding, a tiny key, or a known-broken mode. `CyberChef` is your friend for throwing decoders at a blob quickly.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can approach a crypto CTF challenge by first ruling out encoding, weak keys and known-broken modes.',
          },
          {
            type: 'quiz',
            question: 'What is a smart first step on an unknown crypto CTF blob?',
            options: [
              'Assume it needs advanced number theory and give up',
              'Check whether it is just encoding (Base64/hex) or uses a weak/known-broken scheme',
              'Immediately try to factor a 2048-bit number by hand',
              'Report it as unsolvable',
            ],
            correctIndex: 1,
            explanation: 'Most CTF crypto hinges on a planted weakness or plain encoding. Rule out the easy explanations before reaching for heavy maths.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'common-ad-attacks',
    slug: 'windows-and-ad-quiz',
    title: 'Windows and AD check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is a Domain Controller?',
        options: [
          'The company web server',
          'The server that hosts Active Directory and handles authentication',
          'A backup disk',
          'The office router',
        ],
        correctIndex: 1,
        explanation: 'The DC holds AD and answers who-is-who and who-can-do-what. Own it and you effectively own the domain.',
      },
      {
        prompt: 'Why can a normal domain user enumerate much of AD?',
        options: [
          'Because AD is exposed on the public internet',
          'Because AD is designed so authenticated users can read most directory objects',
          'Because all users are admins',
          'Because you must exploit a bug first',
        ],
        correctIndex: 1,
        explanation: 'AD is meant to be queryable by authenticated users, which is exactly what enumeration relies on.',
      },
      {
        prompt: 'In Kerberos, what is a ticket used for?',
        options: [
          'Storing your password in plaintext',
          'Accessing services without re-authenticating each time',
          'Encrypting the entire network',
          'Replacing the domain controller',
        ],
        correctIndex: 1,
        explanation: 'You authenticate once and then present tickets to reach services, like a railway ticket after buying it.',
      },
      {
        prompt: 'What do most named AD attacks abuse?',
        options: [
          'The mathematics of the encryption',
          'How credentials and tickets are stored, cached or handed out',
          'A public API on the DC',
          'Physical access to the server room',
        ],
        correctIndex: 1,
        explanation: 'The common thread is reusing or requesting an exposed credential or ticket, not breaking cryptography.',
      },
      {
        prompt: 'What is the highest-value group name to look for during enumeration?',
        options: ['Guests', 'Domain Users', 'Domain Admins', 'Everyone'],
        correctIndex: 2,
        explanation: 'Domain Admins effectively control the whole domain, so membership in it is a prime target.',
      },
    ],
  },
  {
    lessonSlug: 'credential-hunting',
    slug: 'privilege-escalation-quiz',
    title: 'Privilege Escalation check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does `sudo -l` tell you?',
        options: [
          'Every user on the system',
          'Which commands you can run with sudo',
          'The root password',
          'All listening ports',
        ],
        correctIndex: 1,
        explanation: 'It lists your sudo rights. An overly broad entry is often the whole path to root.',
      },
      {
        prompt: 'What is the Windows equivalent of Linux root?',
        options: ['Administrator only', 'Guest', 'SYSTEM', 'The domain user'],
        correctIndex: 2,
        explanation: 'SYSTEM is the highest local account on Windows.',
      },
      {
        prompt: 'Why is credential reuse valuable to an attacker?',
        options: [
          'It encrypts the target',
          'A password from one machine often unlocks others, enabling lateral movement',
          'It grants Domain Admin automatically',
          'It hides you from all logs',
        ],
        correctIndex: 1,
        explanation: 'Reused passwords turn a single foothold into access across many systems.',
      },
      {
        prompt: 'Most privilege escalation comes down to what skill?',
        options: [
          'Writing custom kernel exploits every time',
          'Careful enumeration to spot a misconfiguration',
          'Guessing passwords blindly',
          'Physically opening the machine',
        ],
        correctIndex: 1,
        explanation: 'The bulk of privesc is noticing something that trusts you more than it should.',
      },
      {
        prompt: 'In an authorised test, what makes a post-exploitation finding strong?',
        options: [
          'Showing you got any shell',
          'Demonstrating concrete impact, like reaching sensitive data',
          'Leaving many backdoors',
          'Deleting the logs',
        ],
        correctIndex: 1,
        explanation: 'Demonstrated impact is what convinces an organisation to fix the issue.',
      },
    ],
  },
  {
    lessonSlug: 'crypto-in-ctfs',
    slug: 'cryptography-quiz',
    title: 'Cryptography check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which describes asymmetric encryption?',
        options: [
          'One shared key for locking and unlocking',
          'A public key locks and a matching private key unlocks',
          'No keys at all',
          'A key that changes every second',
        ],
        correctIndex: 1,
        explanation: 'Asymmetric uses a key pair: public to encrypt, private to decrypt.',
      },
      {
        prompt: 'Where do most real-world crypto weaknesses come from?',
        options: [
          'Breaking the maths of AES',
          'Developers misusing crypto - hardcoded keys, old algorithms, reused IVs',
          'Quantum computers',
          'Encryption being too strong',
        ],
        correctIndex: 1,
        explanation: 'The algorithms are usually solid; the findable bugs are in how they are used.',
      },
      {
        prompt: 'Why is `Math.random()` unsafe for a reset token?',
        options: [
          'It is too slow',
          'It is not cryptographically secure, so tokens can be predictable',
          'It only makes even numbers',
          'It needs the internet',
        ],
        correctIndex: 1,
        explanation: 'Security tokens need a cryptographically secure random source, not ordinary random.',
      },
      {
        prompt: 'Why is ECB mode a problem?',
        options: [
          'It is too slow',
          'Identical plaintext blocks produce identical ciphertext blocks, leaking patterns',
          'It cannot encrypt text',
          'It shares the key publicly',
        ],
        correctIndex: 1,
        explanation: 'ECB encrypts each block independently, so repeated data shows up as repeated ciphertext.',
      },
      {
        prompt: 'What is a smart first move on an unknown crypto CTF blob?',
        options: [
          'Assume it needs advanced number theory',
          'Check if it is just encoding or uses a weak/known-broken scheme',
          'Try to factor a huge number by hand',
          'Report it as unsolvable',
        ],
        correctIndex: 1,
        explanation: 'Rule out plain encoding and known weaknesses before reaching for heavy maths.',
      },
    ],
  },
];
