import type { ExerciseSeed, ModuleSeed } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'windows-and-ad',
    title: 'Windows and Active Directory',
    description:
      'The domain-joined Windows world most Indian companies actually run on. You will learn what a domain, a domain controller and high-value groups really are, why any logged-in user can read most of the directory, how Kerberos tickets and NTLM hashes prove identity, and what the named attacks (Kerberoasting, Pass-the-Hash, ticket abuse) actually abuse - so you can enumerate a domain, read the map, and reason about defence.',
    lessons: [
      {
        slug: 'active-directory-basics',
        title: 'Active Directory Basics',
        summary: 'AD is the phonebook and the bouncer for a whole company of Windows machines.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Most offices do not set up 500 laptops one by one. They join them all to one central system called Active Directory (AD). You log in once, and AD decides what you can touch on every machine in the building. Understand AD and you understand how a whole company of Windows boxes is actually controlled.',
          },
          {
            type: 'paragraph',
            text:
              'Think of your apartment society. There is one gate register (the domain), each flat has an owner (a user), families are grouped (groups), and the secretary decides who gets which key (permissions). The secretary is the domain controller. Break into the secretary\'s office and you get every key in the building - which is exactly why attackers hunt the domain controller.',
          },
          { type: 'heading', level: 3, text: 'The moving parts' },
          {
            type: 'paragraph',
            text:
              'Walk one concrete login. Priya sits at a laptop named `HR-LAPTOP-07` and types her username `priya` and password. The laptop does not check the password itself. It asks the domain controller for `corp.local`, a server named `DC01`. `DC01` holds the AD database, checks Priya\'s account object, sees she is a member of the group `HR-Staff`, and issues her proof of identity. From then on, when Priya opens the shared HR folder on a different server, that server trusts the proof `DC01` gave her. One central authority, trusted everywhere.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Domain** - the whole managed network, named like `corp.local`',
              '**Domain Controller (DC)** - the server that holds the AD database and answers "can this person do this?"',
              '**User / Computer objects** - every account and every machine is an object stored in AD',
              '**Groups** - bundles of users, e.g. `Domain Admins`, `HR-Staff`',
              '**OU (Organisational Unit)** - folders that organise objects and let admins apply policy to a whole set at once',
            ],
          },
          {
            type: 'command',
            description: 'On a domain-joined Windows machine, ask who you are and which domain you belong to (read-only, safe on your own box):',
            commands: ['whoami', 'echo %USERDNSDOMAIN%', 'nltest /dsgetdc:%USERDNSDOMAIN%'],
          },
          {
            type: 'paragraph',
            text:
              '`whoami` prints your account as `domain\\username` - if you see `corp\\priya` rather than `hr-laptop-07\\priya`, you are logged in against the domain, not just the local machine. `%USERDNSDOMAIN%` echoes the domain name (`corp.local`). `nltest /dsgetdc:` returns the name and address of the domain controller currently serving you - that `DC:` line is naming the exact machine that holds AD. Reading these three tells you instantly whether you are in a domain and where its brain lives.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to both sides: for an attacker, the DC is the single highest-value target on the network, because one misconfigured permission can be a path from a normal user all the way to *Domain Admin* - which means every machine in the company at once. For a defender, that same centralisation is the win: tightly guard the DC and the high-value groups, and one control protects hundreds of machines. AD is a whole career precisely because that concentration of power cuts both ways.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why attackers love AD',
            text:
              'You do not need to hack 500 laptops. You need one path to the domain controller, and the whole estate falls at once. That concentration is AD\'s strength for admins and its danger when a single permission is wrong.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can explain what a domain, a domain controller and Domain Admins are, and read your own machine to see which domain and DC you are talking to - the map you need before you enumerate anything.',
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
            explanation: 'The DC hosts the AD database and decides who is who and what they can access. Compromise it and you effectively own the domain.',
          },
        ],
      },
      {
        slug: 'ad-enumeration',
        title: 'AD Enumeration',
        summary: 'Before you attack a domain, you map it - users, groups, and who can reach what.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Enumeration is careful reading, not breaking. Once you have any valid domain account - even the lowest-privileged one - you can ask AD polite questions and it answers: who are the admins, which machines exist, which accounts are old and forgotten. No exploit yet. Just listing what the directory is willing to tell you.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the key mechanism people miss: AD is *designed* to be readable by any authenticated user. Apps and people need to find each other - Priya\'s Outlook needs to look up her manager\'s address - so the directory hands out most object details to anyone who has logged in. That built-in readability is the enumeration surface. You are not exploiting a bug; you are using AD exactly as intended, just for reconnaissance.',
          },
          { type: 'heading', level: 3, text: 'A worked example' },
          {
            type: 'paragraph',
            text:
              'Say you have Priya\'s low-privilege account. You ask AD to list the members of `Domain Admins` and it returns three names: `svc-backup`, `admin-raj` and `Administrator`. Now you know your three highest-value targets by name. You ask for all computer objects and get `DC01`, `FILE01`, `SQL01` and forty laptops - now you have the map. You ask for service accounts and find `svc-backup` has not changed its password in 400 days. None of that required admin rights; you just read the directory. That list of names and machines is the plan for everything that comes next.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'List all users and groups in the domain',
              'Find who is in high-value groups like `Domain Admins`',
              'Spot service accounts and old, forgotten accounts (stale passwords, never-expiring)',
              'Map trust relationships between domains',
              'Note which users can log in to which machines',
            ],
          },
          {
            type: 'command',
            description: 'Read-only directory queries from a domain-joined Windows box - these list, they do not change anything:',
            commands: ['net user /domain', 'net group "Domain Admins" /domain', 'net group "Domain Computers" /domain'],
          },
          {
            type: 'paragraph',
            text:
              'The first command dumps every user account name in the domain. The second lists exactly who belongs to `Domain Admins` - the output is your shortlist of accounts worth compromising, because owning any one of them owns the domain. The third lists the machines. Read together, these give you the same picture a tool like `BloodHound` draws automatically: `BloodHound` just collects all these answers and turns them into a graph that literally draws the shortest path from your foothold to Domain Admin. The tool is fast; the understanding of *what it is reading* is the actual skill.',
          },
          {
            type: 'paragraph',
            text:
              'What a defender does with the same knowledge: because enumeration is normal-looking traffic, you cannot simply block it. Instead defenders reduce what there is to find - fewer members in `Domain Admins`, no passwords in account descriptions, stale accounts disabled - and they watch for the *loud* queries. Bulk directory scraping and BloodHound-style collection leave a pattern, so mature environments alert on it.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Loud vs quiet',
            text:
              'Some queries are indistinguishable from normal traffic; others (mass collection, hammering the DC) light up defenders instantly. In a lab it does not matter. On a real engagement, knowing which is which decides whether you get caught.',
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
            text: 'You understand that enumeration is reading, not breaking, that AD hands out most of its map to any logged-in user, and how to turn that map into a target list.',
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
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'When you log into a Windows domain, something has to prove it is really you without sending your password across the network in the open. Windows has two systems for that: the old one (NTLM) and the modern one (Kerberos). Almost every AD attack you will hear about is really an abuse of one of these two, so it pays to know how each one works.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'NTLM: the old challenge-response',
          },
          {
            type: 'paragraph',
            text:
              'NTLM never sends your password. It uses a hash of it in a challenge-response dance. The server sends a random challenge, your machine encrypts that challenge using your password hash, and sends the result back. The server (or the DC) does the same calculation and checks they match. Your password stays local. The catch is that the *hash itself* becomes as good as the password: if an attacker steals the hash, they can complete this dance without ever knowing the plaintext. NTLM lives on only for backwards compatibility, and old protocols carry old weaknesses.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Kerberos: tickets, not passwords',
          },
          {
            type: 'paragraph',
            text:
              'Kerberos is like the ticket counter at a railway station. Walk it end to end: you show your ID once at the counter (you authenticate to the DC) and receive a master ticket called a **TGT** (Ticket Granting Ticket). When you later want to board a specific train - say the SQL server - you show your TGT to the counter again and get a **service ticket** for just that train. You hand the service ticket to the SQL server, and it lets you in. You never show your password to the SQL server, and you never re-enter it: tickets do the proving.',
          },
          {
            type: 'command',
            description: 'On a domain-joined Windows box, list the Kerberos tickets your session is holding right now (read-only):',
            commands: ['klist'],
          },
          {
            type: 'paragraph',
            text:
              '`klist` prints the tickets cached for your session. The entry with server `krbtgt/CORP.LOCAL` is your TGT - your master railway pass. Any other entries (like `cifs/FILE01` or `MSSQLSvc/SQL01`) are service tickets you have already collected for specific services. Seeing this list makes the abstract concrete: you are literally looking at the tickets that let you reach things without retyping your password. Attack tooling reads and manipulates exactly these.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters for you: a huge chunk of AD attacks are "abuse the way tickets are issued, stored or requested" - Kerberoasting requests service tickets to crack offline, Pass-the-Hash reuses an NTLM hash, ticket abuse forges or replays the pass itself. You cannot understand, let alone detect, any of those attacks without first knowing what a TGT and a service ticket are. Defenders lean on this too: unusually many service-ticket requests from one account is a classic Kerberoasting signal.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why it matters for you',
            text:
              'Nearly every named AD attack is really "abuse the way tickets or hashes are handled". Learn what a ticket is now, and those attacks stop being magic words.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell NTLM (hash-based challenge-response) apart from Kerberos (ticket-based), explain the TGT-to-service-ticket flow, and read your own cached tickets with klist.',
          },
          {
            type: 'quiz',
            question: 'In Kerberos, what is the point of a ticket (TGT)?',
            options: [
              'It stores your password in plaintext',
              'It lets you request access to services without re-entering your password each time',
              'It encrypts the whole network',
              'It replaces the domain controller',
            ],
            correctIndex: 1,
            explanation: 'You authenticate once, get a TGT, and use it to request per-service tickets - like a railway pass you show to board specific trains.',
          },
        ],
      },
      {
        slug: 'common-ad-attacks',
        title: 'Common AD Attacks',
        summary: 'The named attacks you keep hearing about - what each one abuses, in plain words.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'AD attacks have scary names - Kerberoasting, Pass-the-Hash, ticket abuse. Underneath, most of them are one idea: a credential or a ticket ends up somewhere it should not, and you reuse it. Learn the shared pattern and each named attack becomes an obvious variation, not a spell you have to memorise.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Kerberoasting, walked through',
          },
          {
            type: 'paragraph',
            text:
              'Take Kerberoasting as the worked example, because it shows the pattern cleanly. Service accounts (like `svc-sql`) have a Service Principal Name registered in AD. Any authenticated user is allowed to request a Kerberos service ticket for such an account - that is normal Kerberos. But part of that ticket is encrypted with a key *derived from the service account\'s password*. So you request the ticket, take it offline to your own machine, and try password after password until one decrypts it. Nothing broke on the network. You just asked for something you were allowed to ask for, then cracked it quietly at home. If `svc-sql` used `Summer2023!`, you now have its password - and service accounts are often over-privileged.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Kerberoasting** - request service tickets for service accounts, then crack their passwords offline',
              '**Pass-the-Hash** - reuse a stolen NTLM password *hash* to authenticate without knowing the plaintext',
              '**Ticket abuse** - replay or forge Kerberos tickets to move around as someone else',
              '**Weak permissions** - one group can reset another group\'s passwords, so you chain low access up to admin',
            ],
          },
          {
            type: 'command',
            description: 'A read-only detection query a defender runs - list accounts that have a Service Principal Name (the Kerberoasting candidates):',
            commands: ['setspn -Q */*'],
          },
          {
            type: 'paragraph',
            text:
              '`setspn -Q */*` lists every registered Service Principal Name in the domain. Each line pairs a service (like `MSSQLSvc/SQL01`) with the account that runs it. As a defender, this output *is* your Kerberoasting exposure: every account here is a target whose password could be cracked from a ticket, so each one should have a long, random, machine-generated password. As a learner, reading this shows you why the attack exists - these accounts are advertised in the directory for anyone to request tickets against.',
          },
          {
            type: 'paragraph',
            text:
              'Notice the theme across all four: none of them are "hack the encryption". They abuse how credentials are stored, cached and handed out. That is why defenders fix them with hygiene, not better maths - long random service-account passwords defeat Kerberoasting, disabling NTLM where possible blunts Pass-the-Hash, and tight group permissions kill the chain-to-admin path. If you can name what each attack abuses, you can name the fix.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Concept over recipe',
            text:
              'You will meet the exact tooling later in a hands-on lab. Right now, focus on *what each attack abuses* - that is the understanding that lets you both find the weakness and, as a defender, detect it.',
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
            text: 'You can name the common AD attacks and say, for each, which credential or ticket weakness it abuses - and therefore what the fix is.',
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
    description:
      'Turning a low-level foothold into full control of the box you landed on, on both Linux and Windows. You will learn the read-only checks that reveal a path to root or SYSTEM, why most escalation is spotting a misconfiguration rather than writing an exploit, where credentials hide, and what post-exploitation actually aims for - demonstrating real impact, not just getting a shell.',
    lessons: [
      {
        slug: 'linux-privesc-basics',
        title: 'Linux Privilege Escalation',
        summary: 'You got a normal shell. Now you want root - and Linux often leaves the door ajar.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/privesc-ladder',
            alt: 'A low privilege shell climbing through misconfigurations to root',
            caption: 'Nobody hands you root. You climb small mistakes.',
          },
          {
            type: 'paragraph',
            text:
              'You broke in and got a shell, but as a low-privilege user like `www-data`. Privilege escalation is going from "can barely look around" to `root` - the account that owns the box. The diagram above is the honest picture: you rarely leap straight to root. You climb a ladder of small mistakes the admin left behind. And most of the time you do not need a fancy exploit at all; you need to *notice* something that trusts you more than it should.',
          },
          { type: 'heading', level: 3, text: 'A worked example: a sudo misstep' },
          {
            type: 'paragraph',
            text:
              'Say you run `sudo -l` and it prints: `(root) NOPASSWD: /usr/bin/find`. That one line is a full path to root. `find` has a feature that runs a command for each file it matches (`-exec`). Because the admin let you run `find` *as root* without a password, you can tell it to execute a shell - and that shell inherits root. The misconfiguration was not a bug in `find`; it was giving your account permission to run a powerful tool as root. You spotted it by reading one line of output, and that is the whole job.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Misconfigured `sudo` rights that let you run one command as root',
              'Files or scripts owned by root but writable by you (edit it, root runs your edit)',
              'SUID binaries, which run as their owner (often root) regardless of who launches them',
              'Passwords sitting in config files, shell history or backups',
              'An old, unpatched kernel with a known local bug',
            ],
          },
          {
            type: 'command',
            description: 'Read-only checks you can safely run to understand your own privileges on a box you control:',
            commands: ['id', 'sudo -l', 'find / -perm -4000 -type f 2>/dev/null'],
          },
          {
            type: 'paragraph',
            text:
              '`id` shows your user and groups - being in `sudo`, `docker` or `lxd` is itself often a path up. `sudo -l` lists exactly what you may run with sudo; read every line and ask "can this command be twisted to run a shell?" (a shocking number can). The `find` command lists SUID binaries: files with the SUID bit run as their *owner*, so a SUID binary owned by root that lets you spawn a shell hands you root. The `2>/dev/null` just hides permission-denied noise. Reading these three outputs is 90% of Linux privesc.',
          },
          {
            type: 'paragraph',
            text:
              'What each side does with this: an attacker reads the outputs above looking for the one line that trusts them too much, then follows it to root and, from there, to the data or the next machine. A defender runs the *same* checks as an audit - unexpected NOPASSWD sudo rules, world-writable root-owned scripts, and non-standard SUID binaries are the exact findings to remove. Tools like `linpeas` simply automate the checks; the value is in reading the output and asking "what here trusts me more than it should?"',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Enumeration wins here too',
            text:
              'Privesc is mostly careful looking, not clever exploiting. Automated scripts save time, but the finding is always a human noticing something over-trusting in the output.',
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
            text: 'You know the main things to check on a Linux box for a path to root, can read the output of the core checks, and understand that most privesc is spotting a misconfiguration, not writing an exploit.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'On Windows the top local account is called SYSTEM. The idea is identical to Linux: you land as a normal user and look for something the setup got wrong. Windows just hides its mess in different places - services, scheduled tasks, the registry - so the checks look different even though the mindset is the same.',
          },
          { type: 'heading', level: 3, text: 'A worked example: an unquoted service path' },
          {
            type: 'paragraph',
            text:
              'Here is a classic Windows misconfiguration made concrete. A service is configured to run the program `C:\\Program Files\\My App\\service.exe` as SYSTEM, but the path was written without quotes. When Windows reads an unquoted path with spaces, it tries each stopping point in turn: first `C:\\Program.exe`, then `C:\\Program Files\\My.exe`, then the real file. If you can write a file to `C:\\Program Files\\My.exe`, Windows runs *your* file as SYSTEM the next time the service starts. You did not exploit any code - you took advantage of missing quotation marks and a writable folder. That is the flavour of most Windows privesc.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Services whose executable file you can overwrite, running as SYSTEM',
              'Unquoted service paths that let Windows run *your* file by mistake',
              'Scheduled tasks running as a higher-privileged user',
              'Passwords in the registry, saved credentials, or leftover scripts',
              'Missing patches for known local elevation bugs',
            ],
          },
          {
            type: 'command',
            description: 'Read-only checks to understand your Windows privileges on your own machine:',
            commands: ['whoami /priv', 'whoami /groups'],
          },
          {
            type: 'paragraph',
            text:
              '`whoami /priv` lists the privileges your token holds and whether each is Enabled. A few of these are effectively a shortcut to SYSTEM if enabled - `SeImpersonatePrivilege` and `SeAssignPrimaryTokenPrivilege` are the famous ones, and service accounts often have them. `whoami /groups` shows your group memberships; sitting in `Administrators` or a service group changes what is reachable. Reading these two outputs tells you, before you touch anything else, whether you already hold a privilege that is basically a free win - which beats blindly trying every technique.',
          },
          {
            type: 'paragraph',
            text:
              'The two sides again: an attacker scans `whoami /priv`, service configs and scheduled tasks for the one over-trusting setting, then rides it to SYSTEM and onward across the network. A defender treats those same items as an audit checklist - quote every service path, lock down folder permissions so service binaries are not user-writable, and be deliberate about which accounts get impersonation privileges. The finding and the fix are two views of the same misconfiguration.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Privileges are gold',
            text:
              'Read `whoami /priv` first. Certain enabled privileges (the ones ending in `Privilege`) are practically a shortcut to SYSTEM. Knowing which ones matter beats memorising every technique.',
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
            text: 'You can map the Linux privesc mindset onto Windows: land low, read your privileges, hunt misconfigured services, tasks and stored credentials, and aim for SYSTEM.',
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
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Why crack a password when someone saved it in a text file? Once you are on a machine, hunting for credentials is often quicker than any exploit. People stash passwords everywhere - config files, scripts, backups, their own shell history - and then forget they did. Your job is to look in the usual spots faster than the admin cleaned them up.',
          },
          { type: 'heading', level: 3, text: 'A worked example: the config file' },
          {
            type: 'paragraph',
            text:
              'Concrete case. You land as `www-data` on a web server and read the app\'s config at `/var/www/app/.env`. It contains `DB_PASSWORD=Pr0dDb!2023`. That is the database password, but here is the real prize: you try that same password for the `deploy` user over SSH, and it works. The admin reused it. One file gave you a credential; reuse turned it into a shell on a *second* machine. This is why credential hunting so often beats a clever exploit - the door was left unlocked and the key was under the mat.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Config files (`.env`, `config.php`, `settings.py`) with database or API passwords',
              'Shell history (`.bash_history`) where someone typed a password on the command line',
              'Backup files and `.old` / `.bak` copies that outlived their cleanup',
              'Scripts with hardcoded credentials for cron jobs or deploys',
              'Saved passwords in browsers and OS credential stores',
            ],
          },
          {
            type: 'command',
            description: 'Search files you have access to for password-looking strings (read-only, on a box you control):',
            commands: ['grep -riE \'password|passwd|secret|api[_-]?key\' /etc /var/www 2>/dev/null | head -n 20'],
          },
          {
            type: 'paragraph',
            text:
              'This searches (`-r` recursively, `-i` case-insensitively) for common secret keywords under `/etc` and `/var/www`, hides permission errors, and shows the first 20 hits. Each hit prints as `filename:the matching line`, so you read straight across: the file that leaked it, and the value itself. Most lines will be harmless (comments, variable names), so the skill is scanning for the one line that is an actual credential - `DB_PASSWORD=...` with a real value, not `PASSWORD=` with a placeholder. Then you test that value elsewhere.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to both sides: for an attacker, a password found on one machine very often works on another, and that reuse is how a single foothold becomes *lateral movement* across a whole network - the exact step that turns one hacked laptop into a company-wide incident. For a defender, the lesson is brutal and simple: never store plaintext secrets in files or history, use a secrets manager, and never reuse a password across systems. The same `grep` an attacker runs is the audit a defender should run first.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Reuse is the real prize',
            text:
              'A password found on one machine very often works on another. That single reuse is how one foothold becomes lateral movement across an entire network.',
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
            text: 'You know the usual hiding spots for credentials, can grep for them and read the hits, and understand why a reused password turns one box into many.',
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
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Getting root is not the finish line - in a real assessment it is the start of the interesting part. Post-exploitation is everything you do once you have control: prove impact, look around, and (in an authorised test) document it all so the organisation can actually fix what you found. Beginners think the shell is the trophy; professionals know the *report of what the shell could reach* is.',
          },
          { type: 'heading', level: 3, text: 'The phases, and the traces each one leaves' },
          {
            type: 'paragraph',
            text:
              'Post-exploitation is usually described as a handful of goals, and the useful thing to notice is that every one of them touches the system in a way a defender can see. **Situational awareness** is just looking around - who am I, what can this box reach, where is the interesting data - and it is the quietest phase, though bursts of enumeration commands still show up in process and command logs. **Credential access** means grabbing passwords, hashes or tokens from memory, files or config, and reading protected credential stores is exactly the kind of access that good monitoring alerts on.',
          },
          {
            type: 'paragraph',
            text:
              '**Lateral movement** is hopping to the next machine using what you found, and it is loud by nature: new logins from an account or a source that has never logged in there before are one of the clearest signals a defender has. **Persistence** means keeping your access if the box reboots or your session drops - a new scheduled task, a new service, an extra account, a changed startup entry. Each of those is a change to the system, and every change is a trace: persistence is the phase most likely to get you caught, precisely because you are writing something durable that a defender can find later. **Cleanup** is trying to undo those traces, but cleanup itself leaves marks - a suddenly empty or gap-riddled log is itself suspicious, and on an authorised test you should never be quietly wiping logs at all.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Situational awareness** - what is this machine, and what can it reach? Quiet, but enumeration bursts still log',
              '**Credential access** - pulling passwords, hashes and tokens from memory and files; reading credential stores alerts defenders',
              '**Lateral movement** - hopping to the next machine; new logins from a new source are a loud, obvious signal',
              '**Persistence** - a task, service or account added to survive a reboot; a durable change and the easiest thing to catch',
              '**Collection and reporting** - gathering the evidence that proves impact, and on an authorised test, reporting it honestly',
            ],
          },
          { type: 'heading', level: 3, text: 'A worked example, and why scope decides where you stop' },
          {
            type: 'paragraph',
            text:
              'Walk it through. You get root on a web server. On its own that is a weak finding - "I got a shell" fixes nothing. So you do situational awareness: the box can reach an internal database server on port 3306. You do credential access: the DB password is sitting in a config file, so you take it and connect. The database holds a `customers` table with 50,000 rows of names and phone numbers. Now your finding reads: "From an unauthenticated web bug I reached root, and from there the customer database with 50,000 records." *That* is what gets prioritised and fixed. The root shell was a step; the demonstrated reach was the point.',
          },
          {
            type: 'paragraph',
            text:
              'Notice where a professional stops. You proved you *could* read the customer table - you do not download all 50,000 rows, you screenshot a couple of masked sample rows and the row count as evidence. And if that database server was not on the authorised list, you do not touch it at all: you write down "this foothold can reach an out-of-scope database" and let the client decide. Scope is not red tape. It is the line between a paid, welcomed assessment and unauthorised access to systems - possibly systems the client does not even own, like a shared cloud tenant. The skill in post-exploitation is demonstrating maximum impact while causing minimum actual harm and staying inside the agreed boundary.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Loud and durable = catchable',
            text:
              'The phases that create real impact - lateral movement and persistence - are also the ones that leave the clearest traces, because they add logins and durable system changes. Quiet looking-around is safe; writing a backdoor is what gets you noticed.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Impact is the point',
            text:
              'A finding that says "I got a shell" is weak. A finding that says "from that shell I reached the customer database" is what actually gets fixed - and, in a bug bounty, what gets paid.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Post-exploitation activity is only ever performed on systems you own or are explicitly authorised to test, and strictly within the agreed scope.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand that owning a box is a means to demonstrating real impact, not the end goal - can name the phases that turn a shell into a finding, say what each one leaves for a defender to see, and explain why scope limits decide where you stop.',
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
    description:
      'Just enough crypto to spot where developers get it dangerously wrong - which is almost always the real bug, not the maths. You will tell symmetric from asymmetric and know why HTTPS uses both, recognise the classic misuse patterns (hardcoded keys, MD5, reused IVs), understand why weak randomness makes tokens guessable, and see how ECB and padding-oracle behaviour leaks secrets without ever breaking the key.',
    lessons: [
      {
        slug: 'symmetric-vs-asymmetric',
        title: 'Symmetric vs Asymmetric',
        summary: 'Two families of encryption: one shared key, or a public/private pair.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/symmetric-vs-asymmetric',
            alt: 'One shared key beside a public and private key pair',
            caption: 'One shared secret, or a pair where only half is secret.',
          },
          {
            type: 'paragraph',
            text:
              'Almost all of encryption splits into two families, and the diagram above shows them side by side: on the left, one shared key that both locks and unlocks; on the right, a pair where one key locks and its partner unlocks. Get this one split straight and most of crypto stops being scary.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Symmetric: one shared key',
          },
          {
            type: 'paragraph',
            text:
              'Symmetric encryption uses the *same* key to lock and to unlock. It is fast and great for bulk data - AES, the standard, encrypts gigabytes without breaking a sweat. Think of a padlock where you and your friend both hold copies of the one key. The catch is right there in the setup: both sides need that identical secret key, so how do you get the key to your friend safely in the first place, over a network a stranger might be watching? That key-distribution problem is exactly what the other family solves.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Asymmetric: a public/private pair',
          },
          {
            type: 'paragraph',
            text:
              'Asymmetric encryption uses two matched keys. The public key locks; only the matching private key unlocks. Walk a concrete exchange: you want to send your bank a secret. The bank publishes its public key to the whole world - safe, because a public key can only *lock*. You encrypt your message with the bank\'s public key and send it. Even if a stranger copies the message in transit, they cannot open it, because only the bank\'s private key can. You never had to share a secret in advance. It is slower than symmetric, but it solves the problem symmetric could not, and it is what makes HTTPS possible.',
          },
          {
            type: 'command',
            description: 'Generate a real key pair on your own machine to see both halves (writes two files in the current folder):',
            commands: ['openssl genrsa -out private.pem 2048', 'openssl rsa -in private.pem -pubout -out public.pem'],
          },
          {
            type: 'paragraph',
            text:
              'The first command creates a 2048-bit RSA private key and saves it as `private.pem` - this is the secret half you would guard with your life. The second reads that private key and extracts the matching public half into `public.pem` - the part you can hand out freely. Open both files and you will see the public one is short and shareable while the private one is longer and marked `PRIVATE KEY`. That the public key is *derived from* the private key (never the other way round) is the whole idea made tangible: you can always publish the public half, and the private half never leaves you.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The real world uses both',
            text:
              'HTTPS uses slow asymmetric crypto once, just to safely agree on a shared symmetric key, then switches to fast symmetric encryption for the actual data. Best of both - key exchange from one family, bulk speed from the other.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell symmetric (one shared key) from asymmetric (public/private pair), explain the key-distribution problem each solves, and say why HTTPS uses both.',
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
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/hashing-vs-encryption',
            alt: 'Encoding, encryption and hashing compared side by side',
            caption: 'Mixing these three up is the most common crypto bug there is.',
          },
          {
            type: 'paragraph',
            text:
              'Good news: you almost never need to break encryption itself. Developers hand you the win by using it wrong. The diagram above sets up the single most common confusion - encoding, encryption and hashing look similar but are not interchangeable, and mixing them up is a genuine, findable bug class. Encoding (like Base64) is reversible by anyone and provides *zero* protection; encryption needs a key to reverse; hashing is one-way on purpose. Treating Base64 as "encryption" is a mistake you will actually meet.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'A worked example: the hardcoded key',
          },
          {
            type: 'paragraph',
            text:
              'Concrete case. You read an app\'s source and find `const AES_KEY = "s3cr3t-key-2021"` sitting in the code. The developer used strong AES encryption - the maths is perfect. But the key is written right there in a file anyone with the source can read, and that source is in a public repository. So you take the key, grab any encrypted data the app produced, and decrypt all of it. The lock was flawless; the key was taped to the door. Nothing about AES was broken - the *usage* was. This is the shape of nearly every real crypto finding.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Rolling their own encryption instead of using a vetted library',
              'Hardcoding keys or secrets directly in the source code',
              'Using old, broken algorithms like MD5 or DES for security',
              'Reusing the same nonce or IV, which leaks patterns between messages',
              'Storing passwords with fast hashes (or no salt), so cracking is trivial',
            ],
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'insecure.js',
            code:
              '// Two red flags in three lines\nconst crypto = require("crypto");\nconst KEY = "hardcoded-secret-key"; // flag 1: key in source\nconst hash = crypto.createHash("md5").update(password).digest("hex"); // flag 2: MD5 for a password',
          },
          {
            type: 'paragraph',
            text:
              'Read this snippet the way a reviewer would. Line by line: importing a crypto library is fine. The next line hardcodes a key in the source - anyone who reads the file (or the git history) has the key, so any data it protects is effectively public. The last line hashes a password with MD5, which is fast and broken for this purpose: attackers can try billions of guesses per second against MD5, so the "protection" barely slows them. Neither line has a syntax error and both "work" - which is exactly why these bugs ship. Spotting them is reading for *misuse*, not for crashes.',
          },
          {
            type: 'paragraph',
            text:
              'The theme, for both attacker and defender: the cryptography is fine, the usage is not. A perfect lock is useless if the key is taped to the door. An attacker greps the codebase for `key =`, `secret`, `md5` and `custom encryption` comments, because those are where the wins are. A defender does the identical review - use vetted libraries, keep keys out of source and in a secrets manager, retire MD5/DES, and hash passwords with a slow algorithm like bcrypt or Argon2. Same reading, opposite intent.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The golden rule',
            text:
              'If you ever see a comment like "custom encryption" or a key sitting in a repo, slow down - you probably found something. And never write your own crypto; use libraries experts already reviewed.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can name the classic crypto misuse patterns, read a snippet and point at the flaws, and know the bug is almost always the usage, not the algorithm.',
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
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Session IDs, password reset links, API keys - they all lean on one thing being genuinely unpredictable: randomness. Get the randomness wrong and an attacker can guess the next value, walk straight into someone else\'s account, and never touch a password. This is one of the highest-impact, lowest-glamour bug classes there is.',
          },
          {
            type: 'paragraph',
            text:
              'There are two kinds of "random", and confusing them is the whole bug. Ordinary random (like JavaScript\'s `Math.random()` or a plain `rand()`) is built to be *fast and evenly spread*, not unguessable - it comes from a simple formula seeded by something like the current time, so if you know the seed you can reproduce the entire sequence. Cryptographically secure random (Node\'s `crypto.randomBytes`, Python\'s `secrets`) is built to be *unpredictable even to someone who has seen previous outputs*. Using the fast-but-predictable kind for a security token is a real, exploitable mistake.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'A worked example: the timestamp token',
          },
          {
            type: 'paragraph',
            text:
              'Say a site builds password-reset tokens as `token = md5(current_time_in_seconds)`. You request a reset for the victim\'s account. You know roughly when the server generated the token - it is right now, give or take a few seconds. So you compute `md5` of each second across a small window, maybe 20 values, and try each reset link. One of them works, and you have taken over the account. The token *looked* random - a long hex string - but it was derived from a value you can guess, so its real strength was near zero. Predictability, not length, was the flaw.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Tokens based on the current time - guess the time, guess the token',
              'Sequential IDs where the next value is just the previous one plus one',
              'Ordinary (non-secure) random used for security tokens',
              'Short tokens that are simply brute-forceable by trying them all',
            ],
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'tokens.js',
            code:
              'const crypto = require("crypto");\n// BAD: predictable, seeded from time\nconst weak = Math.random().toString(36).slice(2);\n// GOOD: cryptographically secure, unguessable\nconst strong = crypto.randomBytes(32).toString("hex");\nconsole.log(weak, strong);',
          },
          {
            type: 'paragraph',
            text:
              'Run this and both lines print a long random-looking string - and that is the trap: on screen they look equally "random". The difference is invisible in the output and lives entirely in *how they were generated*. The `weak` value comes from `Math.random()`, whose sequence can be reconstructed if you learn its internal state; the `strong` value comes from `crypto.randomBytes`, which draws from the operating system\'s secure randomness and cannot be predicted from earlier outputs. The lesson: you cannot judge token safety by looking at it - you have to know the source.',
          },
          {
            type: 'paragraph',
            text:
              'What each side does: an attacker who suspects weak randomness collects several tokens, looks for structure (do they increment? do they track time? are two issued close together similar?), and if so predicts the next one to hijack an account or session. A defender never uses `Math.random()`, `rand()` or timestamps for anything security-relevant, reaches for a cryptographically secure generator, and makes tokens long enough (128+ bits) that brute force is hopeless. It is a one-line fix that closes an account-takeover hole.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Smell test',
            text:
              'If a reset token or session ID looks short, looks like a timestamp, or two of them look suspiciously similar, poke at it. Predictable tokens have caused full account takeovers.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can tell ordinary randomness from cryptographically secure randomness, know you cannot judge a token by looking at it, and understand why the difference decides whether tokens are guessable.',
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
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'These two sound advanced, but they teach the same single lesson: encryption done a certain way leaks information, even though nobody ever recovers the key. Once you internalise that "leak without breaking the key" idea, a whole family of attacks makes sense at once.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'ECB: the same block looks the same',
          },
          {
            type: 'paragraph',
            text:
              'AES works on fixed-size blocks (16 bytes). ECB mode is the naive way to use it: encrypt each 16-byte block completely independently. The problem falls straight out of that - if two input blocks are identical, their encrypted output blocks are identical too. Worked example: encrypt a simple image of a logo in ECB. Every region of the same colour is the same repeated block, so it encrypts to the same repeated ciphertext, and the outline of the logo is still clearly visible in the "encrypted" image. It is properly encrypted in that nobody has the key, yet the structure leaked completely. For a database of records that share fields, that repetition alone can reveal which rows match.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Padding oracle: the server tells on itself',
          },
          {
            type: 'paragraph',
            text:
              'Encryption pads data to fill the last block, and after decrypting, a system checks whether that padding is valid. A padding oracle exists when the system *reacts differently* to valid vs invalid padding - say a `200 OK` versus a `500 error`, or even a slightly different response time. Walk it: you send tampered ciphertext, watch which response you get, and that single bit ("padding OK / not OK") leaks one guess about the plaintext. Ask enough carefully crafted questions - a few hundred per byte - and you decrypt the data one byte at a time, start to finish, without ever having the key. The server did the decrypting; its different responses did the leaking.',
          },
          {
            type: 'command',
            description: 'See ECB leak for yourself: encrypt repeated data and look for repeated ciphertext blocks (writes to your own terminal only):',
            commands: ['printf \'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\' | openssl enc -aes-128-ecb -K 00112233445566778899aabbccddeeff -nosalt | xxd'],
          },
          {
            type: 'paragraph',
            text:
              'That command encrypts 32 identical `A` bytes - two full 16-byte blocks of the same content - with AES in ECB mode and dumps the result as hex with `xxd`. Look at the two rows of output: the first 16 bytes of ciphertext are *identical* to the next 16. Same input block, same output block, exactly the weakness described above, visible on your own screen. Now imagine that repetition showing the shape of a logo or flagging which encrypted records are equal, and you can see why ECB is unsafe for real data even though the key is never exposed.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The pattern to internalise',
            text:
              'Any time a system reacts *differently* to valid vs invalid data - a different status, a different length, a different response time - that difference is information. That is the seed of a whole family of attacks.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Probe a live system\'s encryption behaviour only on targets you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand that ECB leaks patterns and a padding oracle leaks via different responses - both revealing secrets without ever breaking the key.',
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
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'CTF crypto challenges scare beginners off, but most are not "invent new mathematics". They are "spot the deliberate mistake the author planted". Once you know the common mistakes - the same misuse patterns from earlier lessons - the challenges turn into puzzles you can actually solve with the tools on your laptop.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Encoding disguised as encryption - it is just Base64 or hex, so decode it',
              'A weak or tiny key you can brute-force in seconds',
              'A known algorithm used with a known flaw (ECB, a reused nonce, a padding oracle)',
              'A padding oracle service you are meant to interact with',
              'A classic cipher (Caesar, XOR, ROT13) hiding under a fancy name',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'A worked example: the mystery blob',
          },
          {
            type: 'paragraph',
            text:
              'You are handed `U1VSQUtTSEF7ZzBfZDBfZW5jMGQxbmd9` and told it is "encrypted". Before assuming anything hard, you notice the shape: only letters, digits, `+` and `/`, length a multiple of four, ending in a pattern typical of Base64. That is a strong hint it is not encrypted at all - just *encoded*. You run it through a Base64 decoder and out pops readable text with a flag inside. No key, no maths, thirty seconds. The trap the challenge set was making you assume "encrypted" meant "hard". Always test the boring explanation first.',
          },
          {
            type: 'command',
            description: 'A first move for any mystery blob - is it just Base64 encoding?',
            commands: ['echo \'U1VSQUtTSEF7ZzBfZDBfZW5jMGQxbmd9\' | base64 -d'],
          },
          {
            type: 'paragraph',
            text:
              'This pipes the suspicious string into `base64 -d`, which reverses Base64 encoding. If the blob was merely encoded, you get readable text straight away - here, a `SURAKSHA{...}`-style flag. If instead you get unprintable garbage, that is also useful information: it tells you the data is *not* plain Base64, so you move to the next cheap test (hex? a tiny XOR key? a known-broken mode?). Either way, one command either solved it or ruled out the easiest explanation. That triage - cheapest tests first - is the entire early-game of CTF crypto.',
          },
          {
            type: 'paragraph',
            text:
              'Why this approach wins: challenge authors and, honestly, real developers reach for the easy-but-wrong option far more often than they build something genuinely novel. So the efficient path - in a competition or a real review - is to rule out encoding, then a weak/tiny key, then a known-broken mode, *before* you ever consider serious mathematics. Tools like `CyberChef` let you throw a stack of decoders at a blob in seconds, so the boring checks cost you almost nothing and solve most challenges outright.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Always try the boring thing first',
            text:
              'Before assuming hard maths, check if it is just encoding, a tiny brute-forceable key, or a known-broken mode. `CyberChef` is your friend for throwing decoders at a blob quickly.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can approach an unknown crypto CTF blob methodically - rule out encoding, weak keys and known-broken modes before reaching for heavy maths.',
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
