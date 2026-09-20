import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'exploitation-tools',
    title: 'Exploitation Tools',
    description:
      'The tools that turn a suspicion into proof: sqlmap for injection, hydra for credential attacks, netcat for a shell, and Metasploit for the rest. By the end you can point sqlmap at a captured request without wrecking a database, reason about lockouts before you ever run hydra, catch a reverse shell through NAT, and know exactly where the legal line sits on each one.',
    lessons: [
      {
        slug: 'sqlmap',
        title: 'sqlmap Without Shooting Yourself',
        summary: 'sqlmap can dump a whole database, or get you banned in one command. The skill is running it quietly.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('sqlmap on a captured Burp request - the safe, low-and-slow invocation'),
          {
            type: 'paragraph',
            text:
              'sqlmap automates SQL injection. You feed it a request, it fires dozens of test payloads, works out how the database responds, and if it finds a hole it can list the tables and dump the data. It is brilliant. It is also the fastest way to get kicked off a bug bounty program, because the default settings hammer the target like a battering ram.',
          },
          { type: 'heading', level: 3, text: 'Feed it a request, not a guess' },
          {
            type: 'paragraph',
            text:
              'The clean way to run sqlmap is never to type a URL and hope. You capture the real request in Burp first - the exact one your logged-in browser sent, cookies and all - save it to a file, and hand that file to sqlmap. Now sqlmap tests the same authenticated request your session already makes, so it is not guessing at parameters or losing your login. In Burp you right-click the request and "Save item", giving you a plain text file like `req.txt` holding the full `POST /search HTTP/1.1` with its headers and body.',
          },
          {
            type: 'paragraph',
            text:
              'Then you tell sqlmap which parameter to poke and how gently. Walk one real run. Say the request has a `q` parameter. You point sqlmap at the file, name that parameter, and cap how hard it tries. `--level` controls how many places it tests (1 is just the obvious parameters, 5 tests headers and cookies too). `--risk` controls how dangerous the payloads are (1 is safe read-only tests, 3 includes payloads that can change data). Low numbers on a live target are not timidity - they are how you avoid a `DROP`-shaped accident.',
          },
          {
            type: 'command',
            description: 'The minimum-risk invocation against a request you captured yourself:',
            commands: [
              'sqlmap -r req.txt -p q --level 1 --risk 1 --batch',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read that output slowly. `--batch` answers every prompt with the safe default so it does not stop and ask you twelve questions - useful, but it means you must already understand the flags. If the `q` parameter is injectable, sqlmap prints a block naming the injection type ("boolean-based blind", "time-based blind", "UNION query") and the back-end database ("the back-end DBMS is MySQL"). That block IS the finding. You do not need to dump a single row to prove the bug - the confirmed injection point and DBMS is already your evidence. Stop there on a live target.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**-r req.txt** - use a saved request file (keeps your session and headers)',
              '**-p q** - only test the `q` parameter, not everything',
              '**--level 1 / --risk 1** - the gentlest test set; raise only on targets you fully own',
              '**--batch** - non-interactive, take safe defaults for every prompt',
              '**--dbs / --tables / --dump** - escalating data extraction; each is louder and more intrusive than the last',
              '**--threads 1** - one request at a time; the opposite of subtle is a swarm of parallel requests',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why the restraint matters to a hunter: `--dump` on a production database can pull millions of rows, spike the server load, and light up every alert the defenders have. A triager who sees you exfiltrated real customer data to "prove" an injection may treat it as the incident, not the report. The professional move is to confirm the injection, grab the database version and maybe one harmless value like the current user, and write it up. The bug is the injectable parameter - proving you COULD dump it is enough.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Default settings are a fire hose',
            text:
              'sqlmap with no flags tests aggressively and can send thousands of requests. On a real target that is noise, load, and a fast route to a ban. Always start with `--level 1 --risk 1 --threads 1` and turn it up only when you own the box.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Only run sqlmap against a system you own or are explicitly authorised in writing to test. Injecting a stranger\'s database is a crime, not research.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can point sqlmap at a captured request, confirm an injection at low risk, and know when to stop before you become the incident.',
          },
          {
            type: 'quiz',
            question: 'Why feed sqlmap a request saved from Burp instead of just a URL?',
            options: [
              'It runs faster with a file',
              'It reuses your real session and headers, so it tests the authenticated request',
              'sqlmap cannot accept a URL directly',
              'It automatically lowers the risk level',
            ],
            correctIndex: 1,
            explanation: 'A saved request carries your cookies and headers, so sqlmap tests the exact authenticated request your browser sent rather than an unauthenticated guess.',
          },
        ],
      },
      {
        slug: 'hydra-and-credential-attacks',
        title: 'Hydra and Credential Attacks',
        summary: 'Hydra tries passwords fast. The hard part is knowing which attack is legal, which is smart, and which locks you out.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Hydra throws username and password guesses at a login service - SSH, FTP, a web form - as fast as the target allows. It is the classic credential-attack tool. Before you touch it, get one thing straight: firing it at a login you do not own is not hacking, it is a computer crime, and it is loud enough that you will be caught.',
          },
          { type: 'heading', level: 3, text: 'Three attacks that look the same and are not' },
          {
            type: 'paragraph',
            text:
              'The word "brute force" hides three very different things. A **brute-force** attack tries every possible password against one account - almost never works against a modern login and always trips lockouts. A **dictionary** attack tries a list of likely passwords against one account - better, but still hammers a single username. A **password spray** flips it around: try ONE common password (say `Winter2025!`) against MANY accounts, slowly. Spraying matters because most lockout rules count failures per account, so one attempt each stays under the radar where twenty attempts on one account gets that account frozen.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example so the mechanism is clear. You have a list of five usernames from recon and you suspect the company enforces a weak default password. A spray tries `Company@123` against user 1, waits, tries it against user 2, waits, and so on - five attempts total, one per account, spread over minutes. Compare that to a dictionary attack: 5,000 passwords against user 1 alone, which locks user 1 out after the third wrong guess and teaches you nothing. Same tool, opposite outcome.',
          },
          {
            type: 'command',
            description: 'The SHAPE of a hydra command against a lab SSH box you own (do not run against anything else):',
            commands: [
              'hydra -l admin -P passwords.txt -t 4 ssh://192.168.56.10',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here `-l admin` sets a single username, `-P passwords.txt` gives the password list, `-t 4` limits it to 4 parallel tries (turning this up is what triggers alarms and lockouts), and `ssh://192.168.56.10` is the target service and address - a private lab IP, never a public one. If a pair works, hydra prints a green line reading `[22][ssh] host: 192.168.56.10 login: admin password: ...`. That single line is the whole result: valid credentials for that service. No hit means either the password was not in your list or the service throttled you.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Brute force** - every combination, one account. Slow, noisy, blocked by lockouts.',
              '**Dictionary** - a wordlist, one account. Locks that account fast.',
              '**Spray** - one password, many accounts, slowly. Evades per-account lockout.',
              '**Credential stuffing** - real username:password pairs from a breach, reused on a new site. Effective and squarely illegal without authorisation.',
              '**Lockout policy** - most logins freeze an account after N failures; know N before you start.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why a defender-minded hunter studies this: the finding is often not "I guessed a password" but "this login has no rate limit and no lockout, so an attacker could spray it". You can demonstrate that with a handful of authorised attempts and a note - you never need to actually break in to report that the door has no lock. Credential stuffing in particular - taking leaked `email:password` pairs and replaying them - works precisely because people reuse passwords, and doing it to a real login without written permission is a crime, full stop.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Lockout is a trap for you too',
            text:
              'Run a dictionary attack against a real account and you will lock out the legitimate user long before you find the password. That is a denial-of-service you caused, and it is reportable as damage.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'This one is not a grey area',
            text: 'Credential stuffing or brute-forcing a login you are not authorised to test is a criminal offence. Only ever run credential attacks against your own lab or a target with explicit written permission.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell brute force, dictionary, spray and stuffing apart, reason about lockout before you act, and report a missing rate limit without breaking in.',
          },
          {
            type: 'quiz',
            question: 'Why does a password spray often evade account lockout when a dictionary attack does not?',
            options: [
              'Spraying uses a faster tool',
              'Lockout usually counts failures per account, and a spray makes only one attempt per account',
              'Spraying only works on SSH',
              'Dictionary attacks are always encrypted',
            ],
            correctIndex: 1,
            explanation: 'Lockout rules typically count failed attempts per account. A spray tries one password across many accounts, so each account sees a single failure and stays under the threshold.',
          },
        ],
      },
      {
        slug: 'reverse-shells-and-listeners',
        title: 'Reverse Shells and Listeners',
        summary: 'A reverse shell calls you. Understanding which way the connection goes is the whole trick.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Reverse shell vs bind shell - catching a netcat connection through NAT, live'),
          {
            type: 'paragraph',
            text:
              'Once you get code running on a target, you want a shell - a command prompt on that machine. There are two ways to get one, and they differ only in which side dials the phone. Get the direction right and it works through firewalls; get it wrong and nothing connects.',
          },
          { type: 'heading', level: 3, text: 'Bind shell vs reverse shell' },
          {
            type: 'paragraph',
            text:
              'A **bind shell** opens a port ON the target and waits for you to connect IN. Simple, until you remember that the target almost always sits behind a firewall or a NAT router that blocks incoming connections. It is like asking a courier to walk into a locked apartment building - the outer door stops them. A **reverse shell** flips it: the target reaches OUT and connects to YOU. You run a listener on your own machine, the target dials home, and the shell rides back over that connection. Outbound connections are usually allowed (the target makes them all day to load web pages), so the reverse shell slips out where the bind shell got stuck at the door.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the whole exchange. On your machine you start a listener on port 4444 with netcat. On the target, code runs that connects back to your IP on 4444 and pipes a shell through it. The moment it connects, your netcat window becomes a prompt on the target - you type `whoami` and the target answers. The key insight: your machine LISTENS, the target CONNECTS. That is why it works from a home network you could never reach directly.',
          },
          {
            type: 'command',
            description: 'On YOUR machine, start the listener that catches the connection:',
            commands: [
              'nc -lvnp 4444',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Reading the flags: `-l` means listen (wait for a connection instead of making one), `-v` is verbose so you see when someone connects, `-n` skips slow DNS lookups, and `-p 4444` sets the port. When the target connects back you will see a line like `connect to [your-ip] from [target-ip]` and then a blinking cursor - that cursor is a shell on the target. Anything you type now runs THERE, not on your box, which is exactly why you must be certain the target is one you are authorised to control.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Bind shell** - target opens a port, you connect in. Dies at the target\'s firewall.',
              '**Reverse shell** - target connects out to your listener. Works through NAT.',
              '**Listener** - the waiting end (`nc -lvnp PORT`), always on the attacker side for a reverse shell',
              '**Port 4444** - a common convention, not magic; any allowed outbound port works, 443 blends in best',
              '**Stabilising** - a raw shell is fragile; upgrading it to a proper TTY is the usual next step',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this is core knowledge for both sides: for an attacker, the reverse shell is how remote code execution becomes real control, and choosing an outbound port like 443 that looks like normal HTTPS traffic is how it evades a firewall. For a defender, the tell is the reverse of that - a server that should only ever RECEIVE connections suddenly making an OUTBOUND one to a strange IP is one of the loudest signals in any log. Knowing the connection direction is knowing what to watch for.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Outbound is the loophole',
            text:
              'Firewalls obsess over blocking incoming connections and often wave outgoing ones straight through. The reverse shell exists entirely to exploit that asymmetry - the target reaching out is what makes it work.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'A shell is control - own it or leave it',
            text: 'Only ever catch a shell from a machine you own or are authorised in writing to test. A reverse shell is full command execution on someone else\'s computer, and running one uninvited is unlawful access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain why a reverse shell beats a bind shell through NAT, and set up a netcat listener to catch one.',
          },
          { type: 'practice_ref', title: 'Exploitation Tools check', exerciseSlug: 'exploitation-tools-quiz' },
          {
            type: 'quiz',
            question: 'Why does a reverse shell usually work when a bind shell fails?',
            options: [
              'Reverse shells are encrypted and bind shells are not',
              'The target connects OUT to you, and firewalls usually allow outbound connections',
              'Bind shells only work on Windows',
              'Reverse shells use a faster protocol',
            ],
            correctIndex: 1,
            explanation: 'A bind shell needs an inbound connection, which firewalls and NAT usually block. A reverse shell has the target connect outbound to your listener, and outbound traffic is generally allowed.',
          },
        ],
      },
      {
        slug: 'metasploit-basics',
        title: 'Metasploit Basics',
        summary: 'Metasploit is a search engine for exploits with the trigger built in. Powerful, and easy to misfire.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          videoSlot('Metasploit console basics - search, use, set options, and why you check the exploit first'),
          {
            type: 'paragraph',
            text:
              'Metasploit is a giant library of ready-made exploits with a common control panel. Instead of writing an attack from scratch, you search for a known weakness, load the matching module, fill in a few options, and run it. It is the tool that makes "there is a public exploit for that" into a five-line session - which is exactly why you must understand what each module actually does before you fire it.',
          },
          { type: 'heading', level: 3, text: 'The four-step rhythm' },
          {
            type: 'paragraph',
            text:
              'Almost every Metasploit session is the same four moves. You **search** for a module by software name or CVE. You **use** it to load it. You **set** the required options - at minimum the target address (`RHOSTS`) and often your own address for a reverse connection (`LHOST`). You **run** it. Think of it as a microwave with presets: pick the dish, set the time, press start. The danger is the same as a microwave - press start without checking what is inside and you make a mess.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a lab example. You found an outdated service on a machine you own. In `msfconsole` you type `search` for that software, get a list of modules with a rank ("excellent", "good", "normal") that hints how reliable each is, `use` the one that matches, then `show options` to see what it needs. You set `RHOSTS` to your lab target and `LHOST` to your own IP, and `run`. If it works you land a session - often a Meterpreter shell, Metasploit\'s enhanced remote shell. The `rank` matters: a "normal" or lower exploit can crash the service instead of exploiting it, which on a real target is a denial of service you caused.',
          },
          {
            type: 'command',
            description: 'The core commands inside msfconsole (run against your own lab only):',
            commands: [
              'msfconsole -q',
              'search type:exploit name:vsftpd',
              'use exploit/unix/ftp/vsftpd_234_backdoor',
              'set RHOSTS 192.168.56.10',
              'run',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Reading this: `search type:exploit name:vsftpd` narrows the huge module list to FTP-server exploits, `use` loads one by its full path, `set RHOSTS` points it at your lab box, and `run` fires it. Metasploit prints each stage - "Sending backdoor command", then "Command shell session 1 opened" if it worked. That "session opened" line means you now have a shell; no line, and the target either was not vulnerable or the module misfired. Always read the module description (`info`) first so you know whether it merely reports the bug or actively exploits it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**search** - find a module by name, CVE or type',
              '**use** - load a module',
              '**show options** - list what the module needs before it will run',
              '**RHOSTS** - the target; **LHOST** - your address for the connection back',
              '**run / exploit** - fire it',
              '**rank** - reliability hint; low-ranked exploits may crash rather than pop the target',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why treat this optional tool with care: on a bug bounty, launching a Metasploit exploit at a live target is rarely the right call - it can crash the service, it is extremely loud in logs, and many programs forbid automated exploitation outright. Metasploit shines in your own lab and in authorised penetration tests with a defined scope. Knowing it exists and how the search-use-set-run rhythm works is useful; blasting it at production is how a report becomes an incident.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Read the module before you run it',
            text:
              'Some modules only check for a bug; others actively exploit it and can crash the service. Run `info` and check the rank first - a low-ranked exploit against a live box can take it down instead of popping a shell.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Lab and authorised scope only',
            text: 'Only run Metasploit exploits against systems you own or that a signed engagement puts in scope. Firing a live exploit at a target without permission is unlawful access, and many bounty programs ban it outright.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know the search-use-set-run rhythm, why the module rank matters, and why Metasploit belongs in the lab far more than in a bounty.',
          },
          {
            type: 'quiz',
            question: 'What is the risk of running a low-ranked Metasploit exploit against a live target?',
            options: [
              'It costs money to run',
              'It may crash the service instead of exploiting it, causing a denial of service',
              'It only works on Linux',
              'It automatically reports you to the vendor',
            ],
            correctIndex: 1,
            explanation: 'A low reliability rank means the exploit is not dependable and can crash the target service rather than gaining access - an outage you caused, and reportable as damage.',
          },
        ],
      },
    ],
  },
  {
    slug: 'analysis-tools',
    title: 'Analysis Tools',
    description:
      'The decode-and-inspect half of the toolkit: read a live capture in Wireshark, crack captured hashes with Hashcat and John, untangle layered encoding in CyberChef, and see mobile and API traffic through mitmproxy. By the end you can follow a TCP stream to its cleartext password, pick the right hash mode for a wordlist run, chain a multi-step decode, and trust a phone\'s HTTPS through your own proxy.',
    lessons: [
      {
        slug: 'wireshark-in-practice',
        title: 'Wireshark in Practice',
        summary: 'A capture is thousands of packets. Wireshark is how you find the three that matter.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Wireshark: capture a login, follow the TCP stream, and read the cleartext password'),
          {
            type: 'paragraph',
            text:
              'Wireshark shows you every packet crossing a network interface, in real time. The problem is never getting data - it is drowning in it. A busy machine produces thousands of packets a minute, and the skill is filtering that flood down to the one conversation you care about, then reading it.',
          },
          { type: 'heading', level: 3, text: 'Filter first, then follow the stream' },
          {
            type: 'paragraph',
            text:
              'The workflow that turns noise into a finding is two steps. First, a **display filter** to hide everything irrelevant - type an expression in the bar at the top and only matching packets remain. Second, **Follow TCP Stream** - right-click one packet in a conversation and Wireshark stitches every packet of that back-and-forth into one readable transcript, your side in one colour and the server\'s in another. Suddenly a scattered mess of packets becomes a plain-text chat you can read top to bottom.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete case. You captured traffic while a device logged into an old site that uses plain HTTP. In Wireshark you type the filter `http.request.method == "POST"` to show only form submissions. You spot a `POST /login`, right-click it, choose Follow TCP Stream, and there in the transcript is the request body: `username=ravi&password=hunter2`, in the clear. Because the site never used HTTPS, the password travelled across the network as readable text, and anyone capturing that segment - you, on your own network - can read it. That is the entire lesson of why plain HTTP is dangerous, shown in one stream.',
          },
          {
            type: 'command',
            description: 'The display filters you will type most often (into the filter bar, not a terminal):',
            commands: [
              'http.request.method == "POST"',
              'ip.addr == 192.168.1.50',
              'tcp.port == 80',
              'dns',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Each of these narrows the view. `http.request.method == "POST"` shows only form and login submissions - where credentials live. `ip.addr == 192.168.1.50` shows only traffic to or from one machine. `tcp.port == 80` isolates plain web traffic, and `dns` shows only name lookups, which reveal every domain a device tried to reach. Combine them with `and` (for example `dns and ip.addr == 192.168.1.50`) to zero in fast. The count at the bottom of the window tells you how many packets survived the filter - watch it drop from thousands to a handful.',
          },
          {
            type: 'paragraph',
            text:
              'Why this earns its place in the toolkit: capturing traffic proves what actually crossed the wire, not what an app claims it sent. A "secure" app that quietly posts your session token over plain HTTP is caught here in seconds. On an authorised assessment of a device or an internal network, following a stream to cleartext credentials or an unencrypted API key is a genuine, demonstrable finding - the capture is the proof.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The packet count is your progress bar',
            text:
              'A good filter drops the packet count from thousands to a handful. If your filter still shows a wall of packets, tighten it - add an IP or a port with `and` - until only the conversation you want is left.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Capture only your own traffic',
            text: 'Only capture on a network you own or are authorised to monitor. Sniffing traffic on a network you do not control - office, cafe, someone else\'s Wi-Fi - is interception and is unlawful.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can filter a capture down to one conversation and follow a TCP stream to read what really crossed the wire.',
          },
          {
            type: 'quiz',
            question: 'What does "Follow TCP Stream" do in Wireshark?',
            options: [
              'It blocks the connection',
              'It stitches every packet of one conversation into a single readable transcript',
              'It decrypts HTTPS automatically',
              'It captures packets faster',
            ],
            correctIndex: 1,
            explanation: 'Follow TCP Stream reassembles all the packets of one back-and-forth into one transcript, so a scattered conversation becomes readable text top to bottom.',
          },
        ],
      },
      {
        slug: 'hashcat-and-john',
        title: 'Hashcat and John',
        summary: 'A hash is a locked box you cannot open - but you can guess the key and check if it fits.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Hashcat: identify a hash, pick the mode, run a wordlist, and read the cracked line'),
          {
            type: 'paragraph',
            text:
              'When you find password hashes - in a database dump, a config file, a captured handshake - you cannot reverse them back into passwords. A hash is a one-way function. What you CAN do is guess a password, hash your guess, and check if it matches. Hashcat and John the Ripper do exactly that, millions of times a second. Same idea, two tools; Hashcat uses your graphics card for raw speed, John is friendlier at auto-detecting formats.',
          },
          { type: 'heading', level: 3, text: 'Identify the mode, then run the list' },
          {
            type: 'paragraph',
            text:
              'The step everyone gets wrong first is the hash type. Hashcat needs to know WHAT kind of hash it is looking at, because MD5, SHA-256 and bcrypt are computed completely differently. You tell it with a mode number: `-m 0` for MD5, `-m 100` for SHA-1, `-m 1400` for SHA-256, `-m 3200` for bcrypt. Pick the wrong mode and it will churn forever finding nothing, because it is hashing your guesses the wrong way. A hash-identifier tool, or just the length and shape of the hash, tells you which mode to use.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one run end to end. You have a file `hashes.txt` with one MD5 hash per line, and `rockyou.txt`, the famous wordlist of real leaked passwords. You run Hashcat in mode 0 (MD5), attack mode 0 (straight wordlist), pointing it at your hashes and the wordlist. Hashcat hashes every word in the list, compares each to your hashes, and when one matches it prints the hash followed by the plaintext that produced it. A weak password like `password123` falls in under a second; a strong random one may never fall, which is the whole point of a strong password.',
          },
          {
            type: 'command',
            description: 'Crack MD5 hashes with a wordlist (on hashes you are authorised to hold):',
            commands: [
              'hashcat -m 0 -a 0 hashes.txt rockyou.txt',
              'hashcat -m 0 hashes.txt --show',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command does the work: `-m 0` says MD5, `-a 0` says straight wordlist attack, then your hash file and the wordlist. As it finishes it prints lines like `5f4dcc3b5aa765d61d8327deb882cf99:password` - the hash, a colon, and the recovered password. The second command, `--show`, just reprints everything already cracked from that file without redoing the work, which is how you collect results after a long run. If nothing shows, either the password was not in your wordlist or you chose the wrong mode - re-check the hash type before blaming the list.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**-m 0** MD5, **-m 100** SHA-1, **-m 1400** SHA-256, **-m 3200** bcrypt - the mode must match the hash',
              '**-a 0** straight wordlist; **-a 3** brute-force mask (every combination of a pattern)',
              '**rockyou.txt** - the standard real-world password wordlist to start with',
              '**--show** - reprint already-cracked results without re-running',
              '**bcrypt is deliberately slow** - it is designed to resist exactly this, so a bcrypt run is far slower than MD5',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters beyond the lab: cracking a hash you legitimately captured demonstrates the real impact of a bug. "The database leaks password hashes" is a medium finding on its own; "and here are ten of them cracked in a minute because they are unsalted MD5" shows a triager the true severity. It also teaches defence from the inside - once you have watched `password123` fall instantly and a bcrypt hash resist for hours, you understand exactly why storage choice is the difference between a survivable breach and a catastrophic one.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Wrong mode, wasted hours',
            text:
              'The single most common Hashcat mistake is the wrong `-m` mode. It will run happily and crack nothing, because it is hashing your guesses in a format that will never match. Confirm the hash type before you start.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only hashes you are authorised to hold',
            text: 'Only crack hashes from a system you own or are authorised in writing to test. Cracking passwords you obtained without permission is unlawful, whatever the source.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can identify a hash, pick the matching Hashcat mode, run a wordlist attack, and read the cracked plaintext.',
          },
          {
            type: 'quiz',
            question: 'Why must you set the correct -m mode in Hashcat?',
            options: [
              'It sets how fast the GPU runs',
              'Different hash types are computed differently, so the wrong mode hashes your guesses in a format that will never match',
              'It chooses the wordlist automatically',
              'It is only needed for bcrypt',
            ],
            correctIndex: 1,
            explanation: 'The mode tells Hashcat which hashing algorithm to use. If it does not match the target hash type, every comparison fails and nothing cracks, no matter how good the wordlist.',
          },
        ],
      },
      {
        slug: 'cyberchef',
        title: 'CyberChef: The Swiss Army Knife',
        summary: 'Weird-looking data is usually just data wearing a costume. CyberChef takes the costume off, layer by layer.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('CyberChef: build a multi-step recipe to peel URL-encoding, Base64 and hex off one blob'),
          {
            type: 'paragraph',
            text:
              'You will constantly run into data that looks like gibberish - a long string of letters and numbers in a cookie, a token, a URL parameter. Most of the time it is not encrypted, just encoded: readable data wrapped in one or more reversible transformations. CyberChef is a browser tool that unwraps it. You drag operations into a "recipe", it runs them top to bottom on your input, and shows the result live.',
          },
          { type: 'heading', level: 3, text: 'A recipe is a pipeline' },
          {
            type: 'paragraph',
            text:
              'The mental model is an assembly line. Your encoded blob goes in the top. Each operation you add is a station that transforms it, and the output of one feeds straight into the next. This matters because real data is often encoded in LAYERS - someone Base64-encoded something, then URL-encoded the result to make it safe in a link. To read it you must peel the layers in reverse order: URL-decode first, then Base64-decode. CyberChef lets you stack those steps and watch the gibberish resolve into plain text one station at a time.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real chain. Suppose a parameter reads `JTdCJTIydXNlciUyMiUzQSUyMmFkbWluJTIyJTdE`. It looks random. You paste it in and add "From Base64" - the output becomes `%7B%22user%22%3A%22admin%22%7D`, which now clearly has URL-encoding (`%7B`, `%22`). You add "URL Decode" as the next step and the output resolves to `{"user":"admin"}` - a plain JSON object saying the user is admin. Two operations turned a scary string into a readable value you could tamper with. That layered peel is the single most useful CyberChef move.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**From Base64** - decode `SGVsbG8=` style strings (letters, digits, `+`, `/`, often ending in `=`)',
              '**URL Decode** - turn `%20` back into a space, `%22` into a quote',
              '**From Hex** - decode `48 65 6c 6c 6f` style byte strings',
              '**Magic** - CyberChef guesses the encoding for you; a great starting point when you are unsure',
              '**Recipes run top to bottom** - order matters, peel layers in reverse of how they were applied',
            ],
          },
          {
            type: 'paragraph',
            text:
              'How to read what happens: the output panel updates the instant you add or reorder a step, so you build the recipe by watching. If a step produces more gibberish, you either applied the wrong operation or the wrong order - drag the steps to reorder, or delete one. The "Magic" operation is the shortcut when you are stuck: it inspects the input, guesses which encodings are present, and suggests a recipe, which you then refine by hand.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hunter reaches for it daily: tokens, cookies and parameters are constantly encoded, and being able to instantly decode one tells you whether it hides something you can tamper with. A session cookie that Base64-decodes to `{"role":"user"}` is an open invitation to try changing `user` to `admin` and re-encoding it. CyberChef is also where you confirm a hunch fast - is that blob Base64, hex, or actually encrypted? If every decode produces more noise, it is probably genuinely encrypted, and that itself is useful to know.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Encoded is not encrypted',
            text:
              'Base64, hex and URL-encoding are reversible with no key - anyone can undo them. If a token is "protected" only by Base64, it is not protected at all. Encryption needs a key; encoding does not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can build a layered CyberChef recipe to peel encoding off a blob and reveal the real data hiding inside.',
          },
          { type: 'practice_ref', title: 'Analysis Tools check', exerciseSlug: 'analysis-tools-quiz' },
          {
            type: 'quiz',
            question: 'A value URL-decodes to something that then Base64-decodes to JSON. In what order were the layers applied?',
            options: [
              'JSON first, then Base64, then URL-encoding',
              'The data was Base64-encoded, then that result was URL-encoded',
              'It was encrypted twice',
              'URL-encoding first, then Base64',
            ],
            correctIndex: 1,
            explanation: 'You peel layers in reverse. If you URL-decode then Base64-decode to reach the data, it was Base64-encoded first and URL-encoded last.',
          },
        ],
      },
      {
        slug: 'mitmproxy-for-mobile-and-apis',
        title: 'mitmproxy for Mobile and APIs',
        summary: 'To read a phone app\'s HTTPS traffic, the phone has to trust your proxy. That trust step is the whole game.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          videoSlot('mitmproxy: install the CA on a device and watch a mobile app\'s HTTPS requests appear'),
          {
            type: 'paragraph',
            text:
              'Mobile apps and API clients talk to servers over HTTPS, which is encrypted - so a normal capture shows you only scrambled bytes. mitmproxy sits in the middle of that connection and decrypts it, letting you read and edit a phone app\'s traffic the same way Burp reads a browser\'s. But it only works if you clear one specific hurdle first, and that hurdle is the entire lesson.',
          },
          { type: 'heading', level: 3, text: 'Why the device has to trust you' },
          {
            type: 'paragraph',
            text:
              'HTTPS works because your device checks the server\'s certificate against a list of trusted authorities. To read the traffic, mitmproxy has to present its OWN certificate for every site - it impersonates the server to the phone and the phone to the server. The phone will reject that certificate instantly, because mitmproxy is not a trusted authority. So you must install mitmproxy\'s CA certificate on the device and mark it trusted. Once the phone trusts mitmproxy as an authority, it accepts the fake certificates, and the encrypted traffic opens up. Skip this step and every app simply shows connection errors - the encryption is doing its job against you.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the setup. You start mitmproxy on your machine, then set the phone\'s Wi-Fi proxy to point at your machine\'s IP and mitmproxy\'s port. On the phone\'s browser you visit `mitm.it`, a page mitmproxy serves, and download the certificate for your platform, then install and trust it in the device settings. Now open an app: its HTTPS requests appear in mitmproxy in plain text - the URLs, the headers, the JSON bodies. You can watch, for example, a shopping app quietly send your location to an analytics endpoint you never agreed to.',
          },
          {
            type: 'command',
            description: 'Start the interactive proxy on your machine, then point the device at it:',
            commands: [
              'mitmproxy --listen-port 8080',
            ],
          },
          {
            type: 'paragraph',
            text:
              'That starts mitmproxy listening on port 8080 with its terminal interface. Once the device\'s proxy is set and the CA is trusted, each request scrolls up the screen as a line showing the method, host and path - `GET api.example.com /v1/profile`. Press Enter on one and mitmproxy expands the full request and response, headers and body included. The flow of readable requests IS the confirmation that your CA is trusted; if you see nothing or only errors, the certificate step did not take, and that is where to look first.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The CA install is mandatory** - without a trusted mitmproxy certificate, HTTPS apps just error out',
              '**Modern Android** distrusts user-installed CAs for apps by default - a real limitation, not your mistake',
              '**Certificate pinning** - some apps only trust ONE specific certificate and refuse yours even when installed',
              '**mitm.it** - the built-in page that serves the certificate to your device',
              '**Proxy settings** - point the device\'s Wi-Fi proxy at your machine\'s IP and mitmproxy\'s port',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this unlocks the mobile attack surface: a mobile app is mostly a pretty front end over an API, and that API is where the real bugs live. Once you can read the traffic, testing the app becomes testing the API - the same access-control and injection ideas apply. The honest catch is certificate pinning: some apps ship knowing exactly which certificate to expect and reject even a trusted mitmproxy CA, and getting past that is a deeper topic. When your requests appear, you are in; when a pinned app refuses, that refusal is itself a finding about how the app defends itself.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'No traffic? Suspect the certificate',
            text:
              'If apps show connection errors or nothing appears, the CA trust step almost certainly failed - or the app pins its certificate. Check the certificate is installed AND marked trusted before blaming the proxy.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own devices and apps only',
            text: 'Only intercept traffic on a device you own and apps you are authorised to test. Installing a CA to read someone else\'s encrypted traffic is interception and is unlawful.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You understand why a device must trust mitmproxy\'s CA to decrypt HTTPS, and how to set up the proxy to read a mobile app\'s API traffic.',
          },
          {
            type: 'quiz',
            question: 'Why must you install mitmproxy\'s CA certificate on the device before you can read its HTTPS traffic?',
            options: [
              'To speed up the connection',
              'Because mitmproxy presents its own certificates, and the device rejects them unless it trusts mitmproxy as an authority',
              'To bypass the Wi-Fi password',
              'CyberChef requires it',
            ],
            correctIndex: 1,
            explanation: 'mitmproxy decrypts HTTPS by presenting its own certificate for each site. The device only accepts those certificates if mitmproxy\'s CA is installed and trusted; otherwise every HTTPS connection errors out.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'reverse-shells-and-listeners',
    slug: 'exploitation-tools-quiz',
    title: 'Exploitation Tools check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why hand sqlmap a request saved from Burp instead of a bare URL?',
        options: [
          'Files load faster than URLs',
          'It reuses your session and headers, testing the real authenticated request',
          'sqlmap refuses plain URLs',
          'It sets the risk level to zero',
        ],
        correctIndex: 1,
        explanation: 'A saved request carries your cookies and headers, so sqlmap tests the exact authenticated request rather than an unauthenticated guess.',
      },
      {
        prompt: 'What do low --level and --risk values give you on a live target?',
        options: [
          'Faster results',
          'Gentler, fewer and safer test payloads that avoid load and data changes',
          'Automatic authorisation',
          'A full database dump',
        ],
        correctIndex: 1,
        explanation: 'Low level and risk keep sqlmap to few, read-only tests - the way to confirm an injection without hammering or damaging the target.',
      },
      {
        prompt: 'Which credential attack best evades per-account lockout?',
        options: [
          'Brute force on one account',
          'Dictionary attack on one account',
          'A slow password spray, one common password across many accounts',
          'Credential stuffing at full speed',
        ],
        correctIndex: 2,
        explanation: 'Lockout usually counts failures per account, so one attempt each across many accounts stays under the threshold.',
      },
      {
        prompt: 'Why does a reverse shell work through NAT when a bind shell does not?',
        options: [
          'It is encrypted',
          'The target connects OUT to your listener, and outbound traffic is usually allowed',
          'It only needs port 80',
          'Bind shells are Windows-only',
        ],
        correctIndex: 1,
        explanation: 'A bind shell needs a blocked inbound connection; a reverse shell has the target dial out, which firewalls generally permit.',
      },
      {
        prompt: 'What is the danger of a low-ranked Metasploit exploit against a live box?',
        options: [
          'It is expensive',
          'It may crash the service instead of exploiting it, causing an outage',
          'It works only on Linux',
          'It emails the vendor',
        ],
        correctIndex: 1,
        explanation: 'A low reliability rank means the exploit is undependable and can take the service down rather than gaining access.',
      },
    ],
  },
  {
    lessonSlug: 'cyberchef',
    slug: 'analysis-tools-quiz',
    title: 'Analysis Tools check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does Follow TCP Stream do in Wireshark?',
        options: [
          'Blocks the connection',
          'Reassembles one conversation into a single readable transcript',
          'Decrypts HTTPS for free',
          'Speeds up capture',
        ],
        correctIndex: 1,
        explanation: 'It stitches all packets of one back-and-forth into one transcript, turning scattered packets into readable text.',
      },
      {
        prompt: 'Why must the Hashcat -m mode match the hash type?',
        options: [
          'It sets GPU speed',
          'Different hashes are computed differently, so a wrong mode never matches anything',
          'It picks the wordlist',
          'Only bcrypt needs it',
        ],
        correctIndex: 1,
        explanation: 'The mode selects the hashing algorithm; if it does not match the target, every comparison fails regardless of the wordlist.',
      },
      {
        prompt: 'A token URL-decodes, then Base64-decodes to JSON. How was it built?',
        options: [
          'JSON, then Base64, then URL-encoding',
          'Base64-encoded first, then URL-encoded',
          'Encrypted twice',
          'URL-encoded first, then Base64',
        ],
        correctIndex: 1,
        explanation: 'You peel in reverse: URL-decode then Base64-decode means it was Base64-encoded first and URL-encoded last.',
      },
      {
        prompt: 'A session cookie Base64-decodes to {"role":"user"}. What does that tell you?',
        options: [
          'It is safely encrypted',
          'It is only encoded, not protected, so tampering with the role is worth trying',
          'The cookie is invalid',
          'Nothing useful',
        ],
        correctIndex: 1,
        explanation: 'Base64 is reversible with no key, so a value it hides is unprotected - changing role and re-encoding is the obvious test.',
      },
      {
        prompt: 'Why must a device trust mitmproxy\'s CA before you can read its HTTPS traffic?',
        options: [
          'To speed up the link',
          'mitmproxy presents its own certificates, which the device rejects unless it trusts the CA',
          'To bypass the Wi-Fi password',
          'CyberChef requires it',
        ],
        correctIndex: 1,
        explanation: 'mitmproxy decrypts by presenting its own certificate per site; the device only accepts it if the mitmproxy CA is installed and trusted.',
      },
    ],
  },
];
