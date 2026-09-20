import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'binary-and-reversing',
    title: 'Binary and Reversing',
    description:
      'A first, honest look under the hood: how a running program lays out memory, why a return address sits next to a buffer you control, and what a "buffer overflow" actually corrupts. You will also learn to read a compiled program from the outside with strings and objdump before ever touching a decompiler, and where to safely practise pwn and reversing.',
    lessons: [
      {
        slug: 'how-programs-run-memory-basics',
        title: 'How Programs Run: Memory Basics',
        summary: 'Where a program keeps its stuff in memory - and why one of those places is dangerous.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Every attack you have heard about in low-level security - buffer overflows, shellcode, exploit dev - starts with one idea: a running program stores your data and its own control information in the same memory, and sometimes uncomfortably close together. Get this one lesson and the rest of the module stops being magic.',
          },
          {
            type: 'paragraph',
            text:
              'Picture the program\'s memory as a long apartment building. Some floors hold permanent things (the code itself, and global data). Two floors matter to us. The **heap** is a big open floor where the program asks for space on demand - "give me room for this uploaded photo" - and hands it back later. The **stack** is a stack of trays in a canteen: every time a function is called, a new tray is pushed on top holding that function\'s local variables; when the function finishes, its tray is popped off.',
          },
          { type: 'heading', level: 3, text: 'The one detail that matters' },
          {
            type: 'paragraph',
            text:
              'Here is the part that makes security people care. When function `A` calls function `B`, the CPU needs to remember where to come back to in `A` once `B` is done. So it writes that "come back here" address - the **return address** - onto the same tray as `B`\'s local variables. So the tray holds two very different things side by side: a local buffer you might fill with input, and the address the CPU will jump to next. They are neighbours.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete case. `B` declares a local array `char name[16]` - room for 16 characters. Just past that array, higher up the tray, sits the saved return address, say `0x00401337` (an address inside `A`). The program reads your input into `name`. If it reads only 16 bytes, fine. But if it reads whatever you send with no size check, and you send 40 bytes, the extra 24 bytes spill straight past `name` and overwrite that saved return address. When `B` finishes and the CPU reads the return address to know where to jump, it reads *your* bytes instead. That single fact - control data living next to your data - is the seed of a whole class of bugs.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Code** - the compiled instructions, usually read-only',
              '**Globals** - data that lives for the whole program run',
              '**Heap** - space requested on demand while the program runs, freed later',
              '**Stack** - per-function scratch space: local variables plus the saved return address',
              '**Return address** - "where to come back to", stored on the stack next to locals',
            ],
          },
          {
            type: 'command',
            description: 'On Linux you can see a running process\'s memory layout (safe, read-only, on a program you started):',
            commands: ['cat /proc/self/maps'],
          },
          {
            type: 'paragraph',
            text:
              'Each line names one region: an address range, then permissions like `r-xp` (readable, executable - that is code) or `rw-p` (readable, writable, not executable - that is data, stack or heap). You will spot a line ending in `[stack]` and one ending in `[heap]`. The takeaway from the permissions column: modern systems mark the stack as writable but *not* executable, which is one defence that made "just run code off the stack" much harder. Reading this map is how you confirm what lives where instead of guessing.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: almost every memory-corruption bug is some version of "data went where control information lives". As an attacker you learn to spot code that reads input without checking length. As a defender you learn why protections like stack canaries, non-executable stacks and ASLR exist - each one targets a specific step of the overwrite you just walked through. You cannot reason about any of them without this picture.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'You are learning the shape, not the exploit',
            text:
              'This lesson is deliberately conceptual. Turning "I overwrote the return address" into a working exploit is a deep specialisation with many modern defences in the way. Understanding the mechanism is the skill that transfers everywhere.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can explain the stack, the heap, and why a local buffer sitting next to a saved return address is the root of memory-corruption bugs.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'reading-code-you-didnt-write',
            title: 'Related: Reading Code You Did Not Write',
          },
          {
            type: 'practice_ref',
            title: 'Binary and Reversing check',
            exerciseSlug: 'binary-and-reversing-quiz',
          },
          {
            type: 'quiz',
            question: 'Why is the saved return address on the stack a security concern?',
            options: [
              'It stores the user password',
              'It sits next to local buffers, so input that overflows a buffer can overwrite it',
              'It is always encrypted',
              'It is stored on the heap, never the stack',
            ],
            correctIndex: 1,
            explanation:
              'The CPU keeps the "come back here" address on the same stack frame as local variables. An unchecked write into a local buffer can spill over and change it.',
          },
        ],
      },
      {
        slug: 'buffer-overflow-concepts',
        title: 'Buffer Overflow Concepts',
        summary: 'What actually happens when input is bigger than the box it was meant to fit in.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A buffer overflow is the oldest famous bug in the book, and it is refreshingly simple to state: a program set aside a box of a certain size, then wrote more than that into it, and the extra spilled onto whatever sat next door. This lesson explains the mechanism cleanly. It does not turn you into an exploit developer - that is a whole separate craft - but you will understand exactly what breaks and why.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a society gate register with sixteen ruled boxes for a name. You are supposed to write "Priya Sharma" and stop. But nobody is checking, and you keep writing past the last box - over the printed column headers, over the "next visitor" pointer the watchman uses. Now the register itself is corrupted, and the watchman, following his own pointer, ends up somewhere you wrote. That is an overflow: your writing did not stay in its box.',
          },
          { type: 'heading', level: 3, text: 'The mechanism, step by step' },
          {
            type: 'paragraph',
            text:
              'Concretely: a function has `char buf[16]`. Above `buf` on the stack sits the saved return address. The program calls something like `gets(buf)` or an unchecked copy that reads input until it feels like stopping - it never compares against 16. You send 32 bytes. Bytes 1 to 16 fill `buf`. Bytes 17 onward walk straight up into the saved return address and overwrite it. When the function returns, the CPU jumps to whatever those bytes spelled out. If your bytes were garbage, the program crashes (a segmentation fault). If they were carefully chosen, the jump goes somewhere the attacker picked. The bug is the missing size check; everything else follows from it.',
          },
          {
            type: 'code',
            language: 'c',
            filename: 'vulnerable.c',
            code:
              'void greet() {\n  char buf[16];        // 16-byte box\n  gets(buf);           // reads input with NO size limit - the bug\n  printf("Hi %s\\n", buf);\n}                       // return address sits just past buf',
          },
          {
            type: 'paragraph',
            text:
              'Read this snippet as an attacker would. The box `buf` is 16 bytes. `gets` is notorious precisely because it has no way to know how big `buf` is - it reads until a newline, however long that is. Send 16 characters and it behaves. Send 60 and the last 44 land past the box, corrupting the saved return address and whatever else is up there. The fix is equally plain: use a function that takes a size (`fgets(buf, sizeof buf, stdin)`), so the write can never exceed the box. When you audit C code, an unbounded read into a fixed array is the shape you are hunting for.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The cause** - writing more data than a buffer holds, with no length check',
              '**Stack overflow** - the overrun lands on stack data (locals, saved return address)',
              '**Heap overflow** - the overrun lands on heap metadata or a neighbouring allocation',
              '**Crash vs control** - random overflow bytes crash the program; chosen bytes can redirect it',
              '**The fix** - bounds checking: functions that take and respect a maximum size',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: memory-unsafe languages (C, C++) still run the world\'s operating systems, browsers and network daemons, so this class of bug is far from dead. Modern defences - stack canaries (a secret value placed before the return address that a corruption disturbs), ASLR (randomising where things sit so you cannot predict the address), and non-executable stacks - each block one step of the story above. Knowing the mechanism is how you understand what those defences actually defend against, which is exactly what a report or an interview will ask you.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Where beginners get stuck',
            text:
              'People assume "overflow found" means "exploit ready". On modern systems it usually does not - canaries and ASLR stand in the way. Treat spotting the bug and weaponising it as two very different skills.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Practise only where you are meant to',
            text: 'Study overflows on your own code or on a lab that exists to be broken - never on software you do not own or are not authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain a buffer overflow end to end - the missing size check, the spill onto the return address, crash versus control - and name the defences that stand against it.',
          },
          {
            type: 'quiz',
            question: 'What is the root cause of a classic stack buffer overflow?',
            options: [
              'The program encrypts input incorrectly',
              'The program writes more data into a buffer than it can hold, with no size check',
              'The network drops packets',
              'The user guesses a password',
            ],
            correctIndex: 1,
            explanation:
              'An unbounded write into a fixed-size buffer lets input spill onto neighbouring memory, including the saved return address.',
          },
        ],
      },
      {
        slug: 'reverse-engineering-intro',
        title: 'Reverse Engineering Intro',
        summary: 'How to learn what a program does when nobody gives you the source - starting from the easy tools.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Reverse engineering is figuring out how something works when you only have the finished product - a compiled binary, no source code. It sounds intimidating, and the deep end (decompilers, assembly line by line) genuinely is. But you get a surprising amount of the way with two simple tools and no assembly at all, so that is where you start.',
          },
          {
            type: 'paragraph',
            text:
              'There are two ways to study a program. **Static** analysis means reading it while it sits still - like reading a recipe without cooking. **Dynamic** analysis means running it and watching what it does - like tasting the dish as it cooks. Beginners should start static, because it is safe: you are not executing anything unknown, just reading it. Dynamic analysis comes later and, for untrusted binaries, belongs in a throwaway virtual machine.',
          },
          { type: 'heading', level: 3, text: 'Two tools before any decompiler' },
          {
            type: 'paragraph',
            text:
              'Work one concrete example. You are handed a mystery binary called `checker`. Before opening anything fancy, you run `strings` on it and among the noise you see `Enter license key:`, `Correct!`, `Wrong key.` and `https://api.example.com/verify`. In thirty seconds, with zero assembly, you already know it asks for a key, has a right and wrong path, and phones a server. Then you run `objdump -d` and search for where `Correct!` is referenced - now you can see the *structure* around the check even before you can read every instruction. `strings` told you the "what"; `objdump` starts showing the "where".',
          },
          {
            type: 'command',
            description: 'The two starter tools, run on a binary you are allowed to inspect (Linux):',
            commands: ['strings ./checker', 'objdump -d ./checker | head -n 40'],
          },
          {
            type: 'paragraph',
            text:
              '`strings` prints every run of readable text inside the file - prompts, error messages, URLs, file paths, sometimes even a hard-coded password left by a careless developer. It is the single highest-value first move because human-readable text survives compilation. `objdump -d` disassembles the binary into assembly instructions; piping to `head` just keeps the first 40 lines readable. You are not reading all of it - you are learning the layout and finding the interesting functions to focus on. Together they turn a wall of bytes into a starting map.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Static** - read the binary without running it (safe, start here)',
              '**Dynamic** - run it and observe (do untrusted binaries in a disposable VM)',
              '**strings** - pull out readable text: prompts, URLs, paths, leaked secrets',
              '**objdump -d** - disassemble to see functions and structure',
              '**Decompilers (Ghidra, later)** - reconstruct C-like pseudocode; powerful, but not step one',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to you: reverse engineering is how people find hard-coded credentials in an app, understand malware without a manual, spot how a mobile app signs its API requests, and solve CTF challenges. And it is exactly why *defenders* say "the client can always be reversed" - anything shipped to a user can be taken apart, so a secret baked into an app is not a secret. That principle underlies a lot of what this platform teaches about never trusting the client.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Start where the wins are',
            text:
              'A huge fraction of real reversing wins come from strings and a quick disassembly, long before a decompiler. Do not skip the easy tools to look clever - the pros run strings first too.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Handle unknown binaries safely',
            text: 'Only reverse software you own or are authorised to analyse, and run untrusted binaries in a disposable virtual machine, never on your daily-driver machine.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell static from dynamic analysis and use strings and objdump to learn what an unknown binary does before ever opening a decompiler.',
          },
          {
            type: 'quiz',
            question: 'What is usually the highest-value first step when reversing an unknown binary?',
            options: [
              'Immediately open a decompiler and read every function',
              'Run strings to pull out readable text like prompts, URLs and secrets',
              'Delete it to be safe',
              'Rename the file',
            ],
            correctIndex: 1,
            explanation:
              'Readable text survives compilation, so strings often reveals prompts, URLs and even hard-coded secrets in seconds - before any assembly.',
          },
        ],
      },
      {
        slug: 'ctf-pwn-starter-kit',
        title: 'CTF Pwn Starter Kit',
        summary: 'Where to practise binary exploitation safely, and the small toolchain to set up first.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You now know the shape of memory bugs and the first reversing tools. The way you actually get good is on purpose-built practice targets - "pwn" challenges - where breaking the program is the whole point and nobody\'s real system is at risk. This lesson is a map to good places to practise and the small toolkit to install first, so you can start on legal ground.',
          },
          {
            type: 'paragraph',
            text:
              'A word on one well-known resource. `pwn.college` teaches this progression brilliantly - Linux fluency first, then computing fundamentals like memory and assembly, then program security, then system security. It is worth following that *order* as a learning path. But it asks people not to publish walkthroughs or solutions to its challenges, and that is a request worth respecting: the learning is in the struggle, and posting answers ruins it for the next person. Use it to practise; do not go looking for or sharing its solutions. The same courtesy applies to most CTF platforms.',
          },
          { type: 'heading', level: 3, text: 'The starter toolchain' },
          {
            type: 'paragraph',
            text:
              'Set up a small Linux environment - a virtual machine or a container is ideal, because pwn practice involves running deliberately broken programs. Inside it, the everyday pwn toolkit is short: a debugger to step through a program (`gdb`, usually with the `pwndbg` or `gef` add-on that makes the stack readable), the `pwntools` Python library for talking to a challenge over a socket, and the reversing basics from the previous lesson (`strings`, `objdump`, later Ghidra). You do not need all of it on day one - a debugger and pwntools cover most beginner challenges.',
          },
          {
            type: 'command',
            description: 'A minimal beginner setup on a Debian/Ubuntu practice VM:',
            commands: [
              'sudo apt update && sudo apt install -y gdb python3-pip',
              'pip3 install --user pwntools',
              'python3 -c "import pwn; print(pwn.__version__)"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first line installs `gdb` (the debugger you step challenges through) and pip. The second installs `pwntools`, the library nearly every pwn solver uses to send input and read output from a challenge. The third line just prints the installed version - if it prints a number instead of an error, your setup works and you are ready to attempt a challenge. Getting this "hello, it imports" moment out of the way first means your later frustration is about the puzzle, not your environment.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**gdb (+ pwndbg or gef)** - step through a program and watch the stack',
              '**pwntools** - Python library to talk to challenges over a socket or locally',
              '**A disposable VM or container** - run deliberately broken binaries safely',
              '**strings / objdump / Ghidra** - the reversing tools from the previous lesson',
              '**A structured platform** - follow a progression rather than random challenges',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why practise this way at all: binary exploitation is one of the few skills you genuinely cannot learn by reading. The defences (canaries, ASLR, non-executable stacks) mean you must feel how a real challenge fights back. Purpose-built CTF targets give you that fight on legal ground, with a community that has hit the same walls. That is also why this is an optional side quest - it is a rewarding rabbit hole, not a prerequisite for the web-focused paths most bounty hunters live in.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Progression beats random',
            text:
              'Following a structured order - Linux, then fundamentals, then program security - beats bouncing between random challenges. Struggle on one level until it clicks, then move up.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know where to practise binary exploitation legally, how to respect a platform\'s no-walkthrough rule, and the minimal gdb-plus-pwntools setup to start with.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'ctfs-and-practice-platforms',
            title: 'Related: CTFs and Practice Platforms',
          },
          {
            type: 'quiz',
            question: 'What is the right way to use a platform like pwn.college?',
            options: [
              'Find and share the solutions so everyone saves time',
              'Follow its learning progression and practise, without publishing walkthroughs it asks you not to share',
              'Run its challenges against a company you want to test',
              'Skip practice and just read theory',
            ],
            correctIndex: 1,
            explanation:
              'The learning is in the struggle. Respect the request not to publish solutions, follow the intended order, and practise on the provided targets.',
          },
        ],
      },
    ],
  },
  {
    slug: 'blue-team',
    title: 'Blue Team',
    description:
      'Flip the camera and see your own activity the way defenders do. You will learn what a port scan, a login attempt and a web attack look like in logs, how a SIEM turns scattered log lines into an alert, the first hour of an incident response, and how to write a simple detection for an attack you understand - so you test more quietly and report with real defender context.',
    lessons: [
      {
        slug: 'how-defenders-see-you',
        title: 'How Defenders See You',
        summary: 'Every scan, login and request you send leaves a trail on the other side.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'When you attack a target, you are not invisible. The server, the firewall and the network gear all keep records, and a defender on the other side is reading them. Learning what your own activity looks like from that chair makes you a better tester - quieter when it counts - and a far better report writer, because you can describe impact in terms the defender already sees.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a society gate register. Every visitor who walks in gets a line: time, name, which flat. You might slip past unnoticed in the moment, but the register still has your entry. Servers are the same - each connection, each login attempt, each odd request becomes a line somewhere. The attacker who forgets this is the one who gets caught; the defender who reads it is the one doing the catching.',
          },
          { type: 'heading', level: 3, text: 'What your noise looks like' },
          {
            type: 'paragraph',
            text:
              'Walk one concrete trail. You run a port scan against `web01`. From your side it is one quick command. From the defender\'s side, the firewall log fills with dozens of connection attempts from a single IP hitting ports 21, 22, 23, 25, 80, 443, 3306 within one second - a fan-out no normal user ever produces. Then you try to log in to the admin panel with ten guessed passwords: the web server\'s access log now shows ten `POST /login` lines from your IP in a few seconds, each answered `401`. Neither action was invisible; each drew a shape a defender is trained to notice.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Firewall / connection logs** - who connected, from where, to which port, when',
              '**Web server access logs** - every request: IP, time, method, path, status code',
              '**Authentication logs** - login attempts, successes and failures, by account',
              '**Application logs** - errors and odd inputs the app itself recorded',
              '**Volume and timing** - many requests in seconds is the loudest tell of all',
            ],
          },
          {
            type: 'command',
            description: 'On a Linux web server, a defender watching failed logins in real time would run something like:',
            commands: ['tail -f /var/log/auth.log', 'grep "Failed password" /var/log/auth.log | tail -n 20'],
          },
          {
            type: 'paragraph',
            text:
              '`tail -f` streams new log lines as they arrive, so the defender watches attempts live. The `grep` for `Failed password` pulls out only the failed SSH logins and shows the last 20 - each line carries the source IP, the username tried and the time. Twenty of these from one IP in a minute is not a person mistyping their password; it is a brute-force attempt, and that pattern is exactly what a defender alerts on. Reading this output as the attacker tells you precisely how loud your own login guessing was.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters to both sides: as an attacker on an authorised test, knowing your footprint lets you decide when stealth matters and when it does not, and lets you warn the client "you should have seen this in your logs" - which is genuinely useful feedback. As a defender, this is your daily bread: the attacker\'s convenience (scan fast, guess many passwords) is exactly the pattern that stands out. Speed and volume are the attacker\'s friend and the defender\'s gift.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Loud is not always wrong',
            text:
              'On many authorised tests you are meant to be loud - the client wants to know if their monitoring catches you. Stealth is a choice for specific engagements, not a default virtue.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can name the logs that record your activity and describe what a port scan and a login brute-force look like from the defender\'s side.',
          },
          {
            type: 'quiz',
            question: 'What most reliably gives away a port scan in the defender\'s logs?',
            options: [
              'A single request to one port',
              'Many connection attempts to lots of ports from one IP in a very short time',
              'A slow browse of the website over an hour',
              'Nothing - scans are invisible',
            ],
            correctIndex: 1,
            explanation:
              'A fast fan-out across many ports from one source is a shape no normal user produces, which is exactly why it stands out.',
          },
        ],
      },
      {
        slug: 'logs-siem-and-detection',
        title: 'Logs, SIEM and Detection',
        summary: 'How scattered log lines from everywhere become one alert on a defender\'s screen.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A big company has logs on hundreds of machines. Nobody reads them one by one. A SIEM (Security Information and Event Management) is the system that pulls all those logs into one place and raises an alert when a pattern looks bad. If you have ever wondered how a defender "just knew" you were attacking, this is usually the answer.',
          },
          {
            type: 'paragraph',
            text:
              'Picture a courier company. Every branch keeps its own delivery register (each machine\'s logs). Head office collects copies of all of them into one giant ledger (the SIEM), and a supervisor there has standing rules: "flag any parcel that changed hands five times in an hour", "flag any COD over fifty thousand rupees". The supervisor never visited a branch - they just read the combined ledger against the rules. A SIEM is that head office for security logs.',
          },
          { type: 'heading', level: 3, text: 'From raw line to alert' },
          {
            type: 'paragraph',
            text:
              'Walk the pipeline with a real example. Your ten failed admin logins each wrote a line into `web01`\'s auth log. A shipper (an agent on the box) forwards every new line to the SIEM. The SIEM parses each line into fields - source IP, username, result, timestamp - so it is no longer text but structured data. A detection rule sits over that data: "more than 5 failed logins from the same IP within 60 seconds". Your ten-in-a-few-seconds trips the rule. The SIEM raises one alert - "possible brute force from 203.0.113.9 against admin" - and a human sees it. Ten scattered log lines became one clear signal.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Collect** - agents ship logs from every machine to a central store',
              '**Parse** - raw lines become structured fields (IP, user, status, time)',
              '**Correlate** - link related events, even across different machines',
              '**Detect** - rules and thresholds fire when a pattern matches',
              '**Alert** - a human analyst gets a prioritised signal to investigate',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'detection-rule (pseudocode)',
            code:
              'WHEN log.type == "auth" AND log.result == "failed"\nGROUP BY source_ip\nWITHIN 60 seconds\nHAVING count() > 5\nTHEN raise alert "Possible brute force"',
          },
          {
            type: 'paragraph',
            text:
              'Read this rule as the thing that catches you. It only looks at failed authentication events, groups them by the IP they came from, counts within a 60-second window, and fires when one IP crosses five. Your burst of login guesses matches every clause. The lesson for an attacker: the rule keys on *rate from one source*, so ten guesses in five seconds is caught while ten guesses spread over a day from rotating IPs might not be - which is precisely the trade-off you weigh on an authorised test. The lesson for a defender: good rules are specific enough to catch attacks without drowning in false alarms.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters: understanding detection makes your findings richer. On a report you can say "this endpoint has no rate limiting and your SIEM has no rule for repeated failures here" - that is defender-grade insight, not just "I brute-forced the login". And if you move toward blue team, this pipeline is the core of the job: most detection work is writing and tuning rules like the one above so real attacks fire and normal traffic stays quiet.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The false-positive tax',
            text:
              'A rule that is too broad alerts on everything and analysts start ignoring it - "alert fatigue". The hard part of detection is not catching the attack, it is not crying wolf.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You can explain how a SIEM collects, parses and correlates logs, and how a simple threshold rule turns your login burst into a single alert.',
          },
          { type: 'lab_ref', labSlug: 'log-hunter', title: 'Try it: Log Hunter lab' },
          {
            type: 'practice_ref',
            title: 'Blue Team check',
            exerciseSlug: 'blue-team-quiz',
          },
          {
            type: 'quiz',
            question: 'What is the main job of a SIEM?',
            options: [
              'To block all incoming traffic',
              'To centralise logs from many sources and raise alerts when patterns look malicious',
              'To store user passwords securely',
              'To scan websites for vulnerabilities',
            ],
            correctIndex: 1,
            explanation:
              'A SIEM collects, parses and correlates logs from across the estate, then fires alerts on rules and thresholds so an analyst can act.',
          },
        ],
      },
      {
        slug: 'incident-response-basics',
        title: 'Incident Response Basics',
        summary: 'What actually happens in the first hour after a breach is spotted.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'An alert fired, and it turned out to be real - someone is in. What happens next is not panic and pulling cables at random; it is a rehearsed process. Incident response (IR) is the defender\'s playbook for the messy hours after a breach is found. Even as an attacker, knowing this playbook tells you how your target will react to being caught.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a kitchen fire in a restaurant. You do not first ask how the fire started - you get people out and stop it spreading (contain), put it out (eradicate), clean up and reopen (recover), and only later sit down to work out which stove was faulty so it never happens again (lessons learned). Rushing to blame the stove while the fire spreads is exactly the mistake IR is designed to prevent. Security incidents follow the same order for the same reason.',
          },
          { type: 'heading', level: 3, text: 'The phases, in order' },
          {
            type: 'paragraph',
            text:
              'Walk a concrete case. The SIEM alerts that `web01` is making outbound connections to a strange address at 3am. **Identify:** an analyst confirms it is real, not a false alarm. **Contain:** they isolate `web01` from the network so the attacker cannot spread or exfiltrate more - but they do not wipe it yet, because they need the evidence. **Eradicate:** they find and remove the attacker\'s foothold (a malicious cron job, a web shell). **Recover:** they rebuild the box from a known-good image and bring it back carefully, watching for the attacker returning. **Lessons learned:** afterwards, they ask how the attacker got in and fix that hole. Notice containment comes before understanding - stop the bleeding first.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Prepare** - have the plan, contacts and backups ready before anything happens',
              '**Identify** - confirm the alert is a real incident, not a false positive',
              '**Contain** - isolate affected systems to stop the spread, preserving evidence',
              '**Eradicate** - remove the attacker\'s access and any malware or backdoors',
              '**Recover** - restore clean systems and watch for the attacker coming back',
              '**Lessons learned** - find the root cause and fix it so it cannot recur',
            ],
          },
          {
            type: 'paragraph',
            text:
              'One practical point that trips people up: preserving evidence and stopping the attacker can pull in opposite directions. Pulling the plug on a compromised server stops the attacker instantly but can destroy volatile evidence in memory that would tell you what they did. So mature teams isolate rather than power off - cut the network but keep the machine running - to contain the threat while keeping the forensic trail. That single decision, isolate versus power off, is one of the most debated calls in a real incident.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to you as a hacker: it shapes how a target behaves once your authorised test trips something. It also frames your reports - describing how quickly a finding could be *contained* and *recovered from* is exactly the language a security team responds to. And if you drift toward defence, IR is one of the most in-demand roles going, because every organisation eventually has a bad day and needs someone who does not freeze.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Contain before you understand',
            text:
              'The instinct is to figure out what happened first. The correct move is usually to stop the spread first and investigate second - like getting people out before inspecting the stove.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can name the incident-response phases in order and explain why containment - and isolating rather than powering off - comes before full investigation.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'how-defenders-see-you',
            title: 'Related: How Defenders See You',
          },
          {
            type: 'quiz',
            question: 'Why do responders often isolate a compromised server from the network rather than immediately powering it off?',
            options: [
              'Powering off is impossible remotely',
              'Isolating stops the spread while preserving volatile evidence that a shutdown would destroy',
              'It saves electricity',
              'The attacker cannot see an isolated machine',
            ],
            correctIndex: 1,
            explanation:
              'Cutting network access contains the threat, while keeping the machine running preserves in-memory evidence needed to understand the attack.',
          },
        ],
      },
      {
        slug: 'writing-detections-for-your-own-attacks',
        title: 'Detecting Your Own Attacks',
        summary: 'Turn something you know how to do into a rule that would have caught you.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The best detection engineers are people who understand attacks. That is you - you have spent this whole platform learning how things break. This lesson closes the loop: take one attack you can perform and write the detection that would catch it. Thinking like both sides at once is a rare and valuable skill, and it makes your bug reports far more useful.',
          },
          {
            type: 'paragraph',
            text:
              'The trick is to ask: what unavoidable trace does this attack leave? Every attack has a tell it cannot easily hide, because the tell is part of *how the attack works*. A brute force must send many login attempts. Directory fuzzing must request many paths that do not exist. SQL injection probes must send input with suspicious characters. You cannot do the attack without producing the trace, so the trace is where the detection lives.',
          },
          { type: 'heading', level: 3, text: 'A worked example: catching your own fuzzing' },
          {
            type: 'paragraph',
            text:
              'Say you ran a content-discovery scan against a site - hundreds of requests to guessed paths, most answered `404`. What is the unavoidable trace? A single IP generating a burst of `404` responses far faster and in far greater number than any human clicking links. So the detection writes itself: over the web access log, count `404` responses per source IP in a short window, and alert when one IP crosses a threshold that normal browsing never reaches. You just designed a rule that would have caught your own scan - because you know exactly what your scan looked like.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'fuzzing-detection (pseudocode)',
            code:
              'WHEN log.type == "web" AND log.status == 404\nGROUP BY source_ip\nWITHIN 30 seconds\nHAVING count() > 50\nTHEN raise alert "Possible content discovery / fuzzing"',
          },
          {
            type: 'paragraph',
            text:
              'Read the rule against what you did. It watches only `404` responses (the misses a fuzzer produces in bulk), groups them by source IP, counts within 30 seconds, and fires past 50. Your scan of hundreds of paths sails past that line; a real user who mistypes a URL twice never comes close. The two numbers - the window and the threshold - are the tuning: too low and every broken link alerts, too high and a slow scan slips through. Choosing them well is the actual craft, and you can only choose them well because you know how fast your tool fired.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Find the unavoidable trace** - the signal the attack cannot work without',
              '**Pick the field** - status code, username, path, request rate',
              '**Set a window and threshold** - short enough to catch bursts, high enough to ignore normal use',
              '**Test against normal traffic** - a rule that flags real users is worse than none',
              '**Iterate** - tune the numbers until real attacks fire and browsing stays quiet',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters: this is the single most transferable blue-team skill, and it feeds straight back into your offensive work. When you write a bug report, "here is a detection rule that would have caught this" turns a finding into a gift the security team can act on immediately. And it sharpens your attacking too - once you know what trips a rule, you understand exactly why a slower, lower-volume approach is quieter on an authorised engagement.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Tuning is the whole job',
            text:
              'Writing the rule is easy; picking the window and threshold so it catches attacks without flagging real users is the hard, valuable part. Always test a new rule against a day of normal traffic.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text:
              'You can take an attack you understand, identify its unavoidable trace, and write a threshold detection that would have caught it - the core loop of detection engineering.',
          },
          {
            type: 'quiz',
            question: 'What makes an attack detectable in the first place?',
            options: [
              'The attacker forgot to use a VPN',
              'Every attack leaves an unavoidable trace that is part of how it works',
              'Antivirus catches everything automatically',
              'Attacks are only detectable if the attacker announces them',
            ],
            correctIndex: 1,
            explanation:
              'You cannot brute-force without many login attempts, or fuzz without many 404s. That inherent trace is exactly what a detection rule keys on.',
          },
        ],
      },
    ],
  },
  {
    slug: 'forensics',
    title: 'Forensics',
    description:
      'What gets left behind after something happens on a machine, and how investigators recover it. You will learn the mindset of preserving evidence before touching it, where the useful artifacts live on disk and in memory, and the recurring tricks that make CTF forensics challenges solvable - enough to read a forensic finding, handle evidence without wrecking it, and enjoy a forensics puzzle.',
    lessons: [
      {
        slug: 'digital-forensics-intro',
        title: 'Digital Forensics Intro',
        summary: 'Recovering what happened on a machine - without destroying the evidence while you look.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Digital forensics is detective work on computers: figuring out what happened, when, and by whom, from the traces left on a system. It shows up after incidents, in legal cases, and as a genuinely fun category of CTF. The whole discipline rests on one unglamorous rule that beginners always underrate: do not change the evidence while you examine it.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a crime scene. The first officer does not tidy up, sit on the sofa, or make tea - every one of those actions destroys or adds evidence. They photograph everything, bag items carefully, and record who touched what. Digital forensics is identical: opening a file changes its "last accessed" time, and writing anything to a disk can overwrite deleted data you were trying to recover. The examiner\'s first job is to *not contaminate the scene*.',
          },
          { type: 'heading', level: 3, text: 'Work on a copy, prove it is faithful' },
          {
            type: 'paragraph',
            text:
              'Here is the core mechanism. You never investigate the original disk. You make a bit-for-bit copy (an image) and work only on the copy. To prove the copy is identical and that you did not alter it, you take a cryptographic hash - a short fingerprint - of both the original and the image. If the two hashes match, the copy is faithful. If you later hash your working copy and it still matches, you can prove in a report or a court that you changed nothing. This chain - image it, hash it, work on the copy - is the backbone of every serious investigation.',
          },
          {
            type: 'command',
            description: 'Fingerprint a disk image so you can prove it never changed (Linux, on a file you are authorised to examine):',
            commands: ['sha256sum evidence.img', 'sha256sum evidence.img > evidence.img.sha256'],
          },
          {
            type: 'paragraph',
            text:
              '`sha256sum` reads the whole image and prints a 64-character fingerprint. Change a single byte anywhere in the file and that fingerprint changes completely, so it is a tamper-evident seal. The second command saves the fingerprint to a file. Later you re-run `sha256sum evidence.img` and compare: an identical fingerprint proves the image is byte-for-byte what you started with. That is how "I did not tamper with the evidence" stops being a claim and becomes something you can demonstrate.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Preserve** - never alter the original; image it and work on the copy',
              '**Hash** - fingerprint original and copy to prove they match and stay unchanged',
              '**Chain of custody** - record who handled the evidence and when',
              '**Volatile first** - memory vanishes on power-off; capture it before disk if it matters',
              '**Document everything** - your notes are part of the evidence',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to you: even outside a courtroom, the same discipline saves your own work. If you image and hash before poking around, a mistake never costs you the original. It also connects back to incident response - the responder who isolates rather than powers off is protecting exactly the volatile evidence a forensic examiner needs. And if a finding of yours ever becomes an incident, understanding forensics helps you describe what traces your activity left, which is honest and useful.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The order matters',
            text:
              'Memory disappears the instant a machine powers off; disk survives. If both matter, capture the volatile evidence (memory) before the stable evidence (disk).',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You understand the preserve-image-hash discipline, why you never work on the original, and why volatile evidence is captured first.',
          },
          {
            type: 'quiz',
            question: 'Why do forensic examiners hash a disk image?',
            options: [
              'To make the image smaller',
              'To prove the copy matches the original and has not been altered',
              'To encrypt the evidence',
              'To speed up the investigation',
            ],
            correctIndex: 1,
            explanation:
              'A cryptographic hash is a tamper-evident fingerprint: matching hashes prove the copy is faithful and unchanged.',
          },
        ],
      },
      {
        slug: 'file-and-memory-artifacts',
        title: 'File and Memory Artifacts',
        summary: 'The specific places on disk and in RAM where "what happened" is actually recorded.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Once you are working safely on a copy, the question is where to look. Machines are surprisingly chatty - they record activity in dozens of places, often without the user knowing. Knowing the usual haunts turns "somewhere in this huge disk" into a short, ordered checklist. This lesson names the artifacts that matter most.',
          },
          {
            type: 'paragraph',
            text:
              'Two big buckets: what is written to disk and survives a reboot, and what lives only in memory (RAM) and vanishes on power-off. Disk artifacts are the paper trail - files, logs, timestamps, even "deleted" data that was not truly erased. Memory artifacts are the snapshot of the living machine - which programs were running, network connections open right now, and secrets the program was holding, sometimes including passwords or keys never written to disk.',
          },
          { type: 'heading', level: 3, text: 'A worked example: the deleted file' },
          {
            type: 'paragraph',
            text:
              'Suppose a user "deleted" a suspicious script. On most filesystems, deleting does not scrub the data - it just removes the pointer and marks the space reusable, like tearing the contact out of a phone\'s index while the number stays written on a back page until something overwrites it. Until new data lands there, the script\'s bytes are still on disk, recoverable by a tool that reads raw blocks (this is called file carving - finding files by their content signatures rather than the index). Meanwhile, if the machine was still running, that script might also be visible in a memory capture as a process that was live. Same event, two artifacts, two chances to recover it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Filesystem timestamps** - created, modified, accessed times pin down when things happened',
              '**Logs** - system, application and auth logs record events in order',
              '**Deleted-but-not-gone data** - recoverable by carving until it is overwritten',
              '**Browser and app history** - visited sites, cached files, recent documents',
              '**Memory capture** - running processes, open connections, in-RAM secrets',
            ],
          },
          {
            type: 'command',
            description: 'Read a file\'s timestamps on Linux (metadata only, does not change the contents):',
            commands: ['stat suspicious.sh'],
          },
          {
            type: 'paragraph',
            text:
              '`stat` prints a file\'s metadata, including three times: `Access` (when it was last read), `Modify` (when its contents last changed) and `Change` (when its metadata last changed). To an investigator these build a timeline - a script `Modify`d at 2:57am and a login `Access`ed at 2:55am start to tell a story of the same night. The catch you learned last lesson: merely opening the file to peek updates its `Access` time, which is exactly why forensics works on a copy. The timestamps are evidence, so you must not trample them.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters: whether you are investigating an incident or solving a CTF, knowing the artifact map is the difference between staring at a disk and going straight to the log, the timestamp and the carved file that answer the question. It also completes your attacker education - understanding that "deleted" often is not, and that memory holds secrets, tells you both what a defender can recover about you and why serious cleanup is much harder than pressing delete.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Deleted rarely means gone',
            text:
              'On most systems, deleting a file just frees the space for reuse. Until something overwrites it, the data is often fully recoverable - a fact that cuts both ways.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You know the main disk and memory artifacts, why timestamps build a timeline, and why deleted data often survives until it is overwritten.',
          },
          {
            type: 'quiz',
            question: 'What is special about memory (RAM) artifacts compared to disk artifacts?',
            options: [
              'They last forever',
              'They vanish when the machine powers off, but can hold live processes, connections and in-RAM secrets',
              'They are always encrypted',
              'They cannot be captured at all',
            ],
            correctIndex: 1,
            explanation:
              'Memory is volatile - it disappears on shutdown - which is why it is captured first and can reveal secrets never written to disk.',
          },
        ],
      },
      {
        slug: 'ctf-forensics-tricks',
        title: 'CTF Forensics Tricks',
        summary: 'The recurring moves that solve most beginner forensics challenges.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'CTF forensics challenges look intimidating - "here is a weird file, find the flag" - but they reuse a small set of tricks over and over. Learn the standard moves and most beginner challenges become a checklist rather than a mystery. This lesson is that checklist, built around the questions to ask any suspicious file.',
          },
          {
            type: 'paragraph',
            text:
              'The mindset is: a file is often not what its name says, and it often hides more than it shows. A `.jpg` might not be a real image; a real image might have a zip file glued to its end or a message tucked in its metadata. So you interrogate the file: what actually is it, what readable text is inside, what is hidden past where it "ends", and is anything concealed in the pixels or metadata. Each question has a go-to tool.',
          },
          { type: 'heading', level: 3, text: 'A worked example: the lying image' },
          {
            type: 'paragraph',
            text:
              'You get `cat.jpg`. First you ask *what is it really* with `file`, and it says JPEG - good, but names lie, so you check anyway. You run `strings` and spot `flag{` half-hidden in the output - sometimes that is the whole challenge. It is not here, so you check whether something is appended: images have a defined end marker, and a zip archive stuffed after it is invisible to an image viewer but obvious to `binwalk`, which scans for embedded file signatures. `binwalk` reports a zip at an offset inside `cat.jpg`; you extract it and there is the flag file. Four questions, four tools, solved.',
          },
          {
            type: 'command',
            description: 'The starter interrogation of a suspicious file (Linux, on a challenge file you are meant to solve):',
            commands: ['file mystery.jpg', 'strings mystery.jpg | grep -i flag', 'binwalk mystery.jpg', 'exiftool mystery.jpg'],
          },
          {
            type: 'paragraph',
            text:
              '`file` reads the first bytes (the "magic bytes") to say what the file truly is, regardless of its extension. `strings | grep -i flag` pulls readable text and filters for the flag marker - the laziest win, and it works more often than you would think. `binwalk` scans for signatures of files hidden *inside* the file, catching the appended-zip trick. `exiftool` dumps metadata - camera model, GPS, comments - where challenge authors love to tuck a clue. Run these four and you have answered "what is it, what does it say, what is hidden inside, what is in the metadata".',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**file** - what the file actually is, by its magic bytes, not its extension',
              '**strings** - readable text hiding in a binary; grep for the flag format',
              '**binwalk** - files hidden or appended inside another file',
              '**exiftool** - metadata: comments, GPS, author fields',
              '**Steganography** - data hidden in image pixels or audio; try dedicated stego tools when the basics fail',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters: beyond the fun of solving puzzles, these are real skills. "The extension lies, check the magic bytes" is exactly the lesson behind file-upload bypasses on the web. "Data can hide past where a file appears to end" matters in malware analysis. Forensics CTFs are a low-stakes, legal playground for muscle memory you will reuse in serious work - and they are genuinely one of the most beginner-friendly ways to enjoy security.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Extension is a suggestion, not a fact',
            text:
              'Always confirm a file\'s real type with its magic bytes. A file named .jpg that is really a zip is a classic challenge - and a classic real-world upload bypass.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text:
              'You have a repeatable checklist - file, strings, binwalk, exiftool - that cracks most beginner forensics challenges and mirrors real analysis skills.',
          },
          {
            type: 'practice_ref',
            title: 'Forensics check',
            exerciseSlug: 'forensics-quiz',
          },
          {
            type: 'quiz',
            question: 'A challenge gives you photo.jpg. What confirms what the file really is?',
            options: [
              'The .jpg extension is proof enough',
              'Checking its magic bytes with file, since the extension can lie',
              'Opening it in an image viewer only',
              'Its size in kilobytes',
            ],
            correctIndex: 1,
            explanation:
              'Extensions are just labels. The file command reads the leading magic bytes to reveal the true type, catching disguised or embedded files.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'how-programs-run-memory-basics',
    slug: 'binary-and-reversing-quiz',
    title: 'Binary and Reversing check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What lives on the stack right next to a function\'s local variables?',
        options: ['The user\'s password', 'The saved return address', 'The entire program code', 'The network buffer'],
        correctIndex: 1,
        explanation: 'Each stack frame holds the function\'s locals plus the saved return address - the "come back here" pointer. That neighbouring makes overflows dangerous.',
      },
      {
        prompt: 'What is the root cause of a classic buffer overflow?',
        options: [
          'A slow network',
          'Writing more data into a fixed-size buffer than it can hold, with no length check',
          'A mistyped password',
          'An expired certificate',
        ],
        correctIndex: 1,
        explanation: 'An unbounded write lets input spill past the buffer onto neighbouring memory, including control data like the return address.',
      },
      {
        prompt: 'What is the difference between static and dynamic analysis?',
        options: [
          'Static is fast, dynamic is slow',
          'Static reads the program without running it; dynamic runs it and observes',
          'Static needs source code, dynamic never does',
          'There is no real difference',
        ],
        correctIndex: 1,
        explanation: 'Static analysis reads a stationary binary (safe, start here); dynamic analysis executes it and watches behaviour, ideally in a disposable VM.',
      },
      {
        prompt: 'Why is running strings usually the best first move when reversing an unknown binary?',
        options: [
          'It deletes malware',
          'Readable text like prompts, URLs and even secrets survives compilation and often appears instantly',
          'It compiles the program',
          'It encrypts the file',
        ],
        correctIndex: 1,
        explanation: 'Human-readable text is preserved through compilation, so strings frequently reveals prompts, endpoints and hard-coded secrets in seconds.',
      },
      {
        prompt: 'What is the respectful way to use a practice platform like pwn.college?',
        options: [
          'Publish its solutions so others save time',
          'Follow its progression and practise without sharing walkthroughs it asks you not to publish',
          'Point its challenges at a live company',
          'Only read the theory and never attempt a challenge',
        ],
        correctIndex: 1,
        explanation: 'The learning is in the struggle. Practise on the provided targets, follow the intended order, and honour the request not to publish solutions.',
      },
    ],
  },
  {
    lessonSlug: 'logs-siem-and-detection',
    slug: 'blue-team-quiz',
    title: 'Blue Team check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What most clearly gives away a port scan in a defender\'s logs?',
        options: [
          'One request to a single port',
          'Many connection attempts to lots of ports from one IP in a very short time',
          'A slow, hour-long browse of the site',
          'A single successful login',
        ],
        correctIndex: 1,
        explanation: 'A fast fan-out across many ports from one source is a shape normal users never produce, so it stands out immediately.',
      },
      {
        prompt: 'What is the main job of a SIEM?',
        options: [
          'To block all traffic',
          'To centralise logs from many sources and raise alerts when patterns look malicious',
          'To store passwords',
          'To scan sites for bugs',
        ],
        correctIndex: 1,
        explanation: 'A SIEM collects, parses and correlates logs across the estate, then fires alerts on rules and thresholds for an analyst to review.',
      },
      {
        prompt: 'In incident response, why isolate a compromised server rather than immediately power it off?',
        options: [
          'To save electricity',
          'Isolating stops the spread while preserving volatile in-memory evidence a shutdown would destroy',
          'Powering off is impossible',
          'The attacker cannot see an isolated machine',
        ],
        correctIndex: 1,
        explanation: 'Cutting network access contains the threat, while keeping the machine running preserves memory evidence needed to understand the attack.',
      },
      {
        prompt: 'What makes an attack detectable in the first place?',
        options: [
          'The attacker forgot a VPN',
          'Every attack leaves an unavoidable trace that is part of how it works',
          'Antivirus catches everything',
          'Only announced attacks are detectable',
        ],
        correctIndex: 1,
        explanation: 'Brute force needs many logins; fuzzing needs many 404s. That inherent trace is exactly what a detection rule keys on.',
      },
      {
        prompt: 'What is the hardest part of writing a good detection rule?',
        options: [
          'Naming the rule',
          'Tuning the window and threshold so real attacks fire without flagging normal users',
          'Choosing a colour for the alert',
          'Writing it in the right programming language',
        ],
        correctIndex: 1,
        explanation: 'A rule that is too broad causes alert fatigue; too narrow and attacks slip through. Testing against normal traffic to tune it is the real craft.',
      },
    ],
  },
  {
    lessonSlug: 'ctf-forensics-tricks',
    slug: 'forensics-quiz',
    title: 'Forensics check',
    instructions: 'Four quick ones. Get three right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why do forensic examiners hash a disk image?',
        options: [
          'To compress it',
          'To prove the copy matches the original and has not been altered',
          'To encrypt the evidence',
          'To speed up the case',
        ],
        correctIndex: 1,
        explanation: 'A cryptographic hash is a tamper-evident fingerprint - matching hashes prove the working copy is faithful and unchanged.',
      },
      {
        prompt: 'What is special about memory (RAM) evidence?',
        options: [
          'It lasts forever',
          'It vanishes on power-off but can hold live processes, connections and in-RAM secrets',
          'It is always encrypted',
          'It cannot be captured',
        ],
        correctIndex: 1,
        explanation: 'Memory is volatile, so it is captured first and can reveal secrets and running state never written to disk.',
      },
      {
        prompt: 'On most systems, what happens when a file is "deleted"?',
        options: [
          'Its bytes are securely wiped instantly',
          'The pointer is removed and the space marked reusable, but the data often survives until overwritten',
          'It moves to the cloud',
          'It becomes encrypted',
        ],
        correctIndex: 1,
        explanation: 'Deletion usually just frees the space. Until new data overwrites those blocks, the original is often fully recoverable by carving.',
      },
      {
        prompt: 'A CTF hands you photo.jpg. What confirms its real type?',
        options: [
          'The .jpg extension is proof',
          'Checking its magic bytes with the file command, since extensions can lie',
          'Its size in KB',
          'Opening it in a viewer only',
        ],
        correctIndex: 1,
        explanation: 'Extensions are labels. The file command reads the leading magic bytes to reveal the true type, catching disguised or embedded files.',
      },
    ],
  },
];
