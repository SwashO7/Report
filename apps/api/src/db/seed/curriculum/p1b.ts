import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'networking-from-the-shell',
    title: 'Networking from the Shell',
    description: 'Investigate a network with nothing but a terminal - open ports, remote shells, file transfer and DNS.',
    lessons: [
      {
        slug: 'ss-netstat-and-lsof',
        title: 'Who Is Listening? ss, netstat, lsof',
        summary: 'Three commands that show you every open door on a machine and the program behind each one.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('ss vs netstat vs lsof - find every open port in 5 minutes'),
          {
            type: 'paragraph',
            text:
              'Before you attack a box, you ask one question: what is running? A listening port means a program is waiting for connections. Find the ports, and you have found the attack surface.',
          },
          {
            type: 'paragraph',
            text:
              'Three tools do this. `ss` is the modern one, `netstat` is the old classic still everywhere, and `lsof` maps a port back to the exact process holding it.',
          },
          {
            type: 'command',
            description: 'List listening TCP and UDP ports on your own machine:',
            commands: ['ss -tuln', 'netstat -tuln', 'sudo lsof -i -P -n'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`-t` - TCP, `-u` - UDP',
              '`-l` - only listening sockets',
              '`-n` - show numbers, do not resolve names (faster)',
              '`-p` - show the process (needs sudo)',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Name to number, fast',
            text:
              'Add `-p` to `ss -tulnp` and you see the program name next to each port. That mysterious thing on 8080? Now you know it is the leftover dev server someone forgot to kill.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can walk onto any Linux box and list every service it is exposing, plus the process behind each one.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'quiz',
            question: 'You want only the ports a machine is actively listening on, as numbers. Which flags?',
            options: ['ss -a', 'ss -tuln', 'ss -e', 'ss -s'],
            correctIndex: 1,
            explanation: '-t and -u pick TCP/UDP, -l limits to listening sockets, -n keeps output numeric.',
          },
        ],
      },
      {
        slug: 'ssh-basics',
        title: 'SSH: Remote Shells Done Right',
        summary: 'Log into a machine across the internet and get a real shell, safely, with keys instead of passwords.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('SSH explained - passwords, keys, and why hackers love port 22'),
          {
            type: 'image',
            src: '/api/v1/diagrams/ssh-key-auth',
            alt: 'Server challenging the client, which signs it with a private key',
            caption: 'Your private key never leaves your machine.',
          },
          {
            type: 'paragraph',
            text:
              'SSH gives you a terminal on a machine that is not in front of you. It could be in another building or another country. Everything you type is encrypted on the way there.',
          },
          {
            type: 'paragraph',
            text:
              'Passwords work but keys are better. A key pair is two files: a public key you hand out, and a private key you guard with your life. The server checks that they match.',
          },
          {
            type: 'command',
            description: 'Make a key pair and log in:',
            commands: [
              'ssh-keygen -t ed25519',
              'ssh-copy-id user@server',
              'ssh user@server',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The private key never leaves your machine',
            text:
              'If you ever paste your private key somewhere, or a site asks you to upload it, stop. Only the public key (the `.pub` file) is meant to be shared. The private one is the whole secret.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can log into a remote box over an encrypted channel and set up key-based auth so you never type a password again.',
          },
          {
            type: 'quiz',
            question: 'Which file are you allowed to hand to a server?',
            options: ['The private key', 'The public key ending in .pub', 'Both keys together', 'Neither, ever'],
            correctIndex: 1,
            explanation: 'The public key is meant to be shared; the private key stays secret on your own machine.',
          },
        ],
      },
      {
        slug: 'transferring-files',
        title: 'Moving Files: scp, rsync, nc',
        summary: 'Copy files between machines three ways, and know when each one is the right tool.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('scp vs rsync vs netcat - moving files between machines'),
          {
            type: 'paragraph',
            text:
              'You grabbed a file on a remote box and you need it on yours. Or the other way around. Three tools cover almost every case you will hit.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`scp` - simple secure copy over SSH. Good for one or two files.',
              '`rsync` - smart copy that only sends what changed. Great for big folders and repeats.',
              '`nc` (netcat) - the raw pipe when there is no SSH, only a plain socket.',
            ],
          },
          {
            type: 'command',
            description: 'Pull a file down with scp, then sync a whole folder with rsync:',
            commands: [
              'scp user@server:/tmp/loot.txt .',
              'rsync -avz user@server:/var/logs/ ./logs/',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'rsync remembers',
            text:
              'Run the same rsync twice and the second time is almost instant - it only copies the bytes that actually changed. That is why backups use it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can move files between any two machines you have access to, picking the right tool for one file, a big folder, or a bare socket.',
          },
          {
            type: 'quiz',
            question: 'You need to copy a large folder to a server, and you will repeat it daily. Best tool?',
            options: ['scp', 'rsync', 'nc', 'cat'],
            correctIndex: 1,
            explanation: 'rsync only transfers changed data, so repeated syncs of big folders are fast.',
          },
        ],
      },
      {
        slug: 'dns-tools-dig-nslookup',
        title: 'dig and nslookup',
        summary: 'Ask DNS questions directly and read the answers, instead of trusting whatever the browser did.',
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('dig and nslookup - talk to DNS directly like a pro'),
          {
            type: 'paragraph',
            text:
              'DNS turns a name like `suraksha.com` into an IP address. When you want to see exactly what a name resolves to, you ask DNS yourself instead of guessing.',
          },
          {
            type: 'paragraph',
            text:
              '`dig` is the detailed one recon people live in. `nslookup` is the quick one that ships on almost every system, Windows included.',
          },
          {
            type: 'command',
            description: 'Look up records for a domain:',
            commands: [
              'dig example.com A',
              'dig example.com MX',
              'nslookup example.com',
            ],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`A` - the IPv4 address',
              '`AAAA` - the IPv6 address',
              '`MX` - where email for the domain goes',
              '`TXT` - free-form text, often used for verification records',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the ANSWER section',
            text:
              'dig prints a lot. The part you care about is the ANSWER SECTION - that is the actual record. Everything else is metadata about the query.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can query any DNS record type by hand and read the answer, which is the first move in mapping a target.',
          },
          {
            type: 'practice_ref',
            title: 'Networking from the Shell check',
            exerciseSlug: 'networking-from-the-shell-quiz',
          },
          {
            type: 'quiz',
            question: 'Which record tells you where a domain receives its email?',
            options: ['A', 'MX', 'TXT', 'CNAME'],
            correctIndex: 1,
            explanation: 'MX (Mail eXchange) records point to the mail servers for a domain.',
          },
        ],
      },
    ],
  },
  {
    slug: 'bash-scripting',
    title: 'Bash Scripting',
    description: 'Automate the boring half of hacking - turn repeated terminal work into scripts you run once.',
    lessons: [
      {
        slug: 'your-first-bash-script',
        title: 'Your First Bash Script',
        summary: 'Take the commands you already type and save them into a file you can run any time.',
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('Write your first Bash script in 5 minutes'),
          {
            type: 'paragraph',
            text:
              'A Bash script is just a text file full of commands you would type anyway. Instead of typing them ten times, you run the file once. That is the whole idea.',
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'hello.sh',
            code: '#!/bin/bash\necho "Hello, hacker"\ndate\nwhoami',
          },
          {
            type: 'paragraph',
            text:
              'That first line, the `#!/bin/bash`, is the shebang. It tells the system which program should run the file. Then you make it executable and run it.',
          },
          {
            type: 'command',
            description: 'Make it runnable and run it:',
            commands: ['chmod +x hello.sh', './hello.sh'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The ./ is not optional',
            text:
              'You have to write `./hello.sh`, not just `hello.sh`. The `./` says "the file right here". Without it, Bash only looks in system folders and cannot find your script.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can save a sequence of commands into a script and run the whole thing with one line.',
          },
          {
            type: 'quiz',
            question: 'What does the shebang line #!/bin/bash do?',
            options: [
              'Adds a comment for humans',
              'Tells the system which interpreter runs the file',
              'Makes the file executable',
              'Prints the file name',
            ],
            correctIndex: 1,
            explanation: 'The shebang points to the interpreter. chmod +x is what makes the file executable, separately.',
          },
        ],
      },
      {
        slug: 'variables-and-arguments',
        title: 'Variables and Arguments',
        summary: 'Store values, and let your script take input so one script handles many targets.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Bash variables and arguments - make your script reusable'),
          {
            type: 'paragraph',
            text:
              'A hardcoded script only ever does one thing. Variables and arguments let one script work on any input you feed it - a different target every time.',
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'scan.sh',
            code: '#!/bin/bash\ntarget="$1"\necho "Scanning $target"\nping -c 1 "$target"',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`$1`, `$2`, `$3` - the first, second, third argument you passed',
              '`$0` - the script name itself',
              '`$#` - how many arguments were given',
              '`$@` - all the arguments at once',
            ],
          },
          {
            type: 'command',
            description: 'Run it with an argument:',
            commands: ['./scan.sh example.com'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Quote your variables',
            text:
              'Always write `"$target"`, not bare `$target`. Without the quotes, a value with a space in it breaks into two pieces and your script does the wrong thing.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can write one script that takes a target as input and runs against anything you give it.',
          },
          {
            type: 'quiz',
            question: 'Inside a script run as ./scan.sh example.com, what holds "example.com"?',
            options: ['$0', '$1', '$#', '$@ only'],
            correctIndex: 1,
            explanation: '$1 is the first argument. $0 is the script name, $# is the count.',
          },
        ],
      },
      {
        slug: 'loops-and-conditions',
        title: 'Loops and Conditions',
        summary: 'Repeat work over a list and make decisions, which is where scripts start to feel powerful.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Bash loops and if statements - automate repetitive scans'),
          {
            type: 'paragraph',
            text:
              'Loops repeat. Conditions decide. Put them together and your script can march through a list of hosts, checking each one and reacting to what it finds.',
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'ping-sweep.sh',
            code: '#!/bin/bash\nfor ip in 1 2 3 4 5; do\n  host="192.168.1.$ip"\n  if ping -c 1 -W 1 "$host" > /dev/null; then\n    echo "$host is up"\n  fi\ndone',
          },
          {
            type: 'paragraph',
            text:
              'The `for` loop walks the list. The `if` checks whether the ping worked. `> /dev/null` throws away the noisy output so you only see your own clean message.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Exit codes drive the if',
            text:
              'An `if` in Bash tests success, not truth. A command that succeeds returns 0, and `if` treats that as yes. That is why `if ping ...` just works.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay in your lane',
            text: 'Only sweep IP ranges you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can loop over a list of targets and act only on the ones that respond - a basic ping sweep.',
          },
          {
            type: 'quiz',
            question: 'In Bash, an if statement acts on what?',
            options: [
              'Whether the command printed text',
              'The command exit code (0 means success)',
              'The length of the output',
              'Whether the file exists',
            ],
            correctIndex: 1,
            explanation: 'if tests the exit code: 0 is success (true), anything else is failure (false).',
          },
        ],
      },
      {
        slug: 'bash-one-liners-for-hackers',
        title: 'One-Liners That Do Real Work',
        summary: 'Chain small commands into a single line that pulls exactly what you want out of noise.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Bash one-liners every hacker should know'),
          {
            type: 'paragraph',
            text:
              'The real power of the shell is gluing tiny tools together with pipes. Each command does one job and passes its output to the next. Whole tasks collapse into one line.',
          },
          {
            type: 'command',
            description: 'Pull unique IPs out of a log and count the top talkers:',
            commands: [
              'cat access.log | grep 200 | awk \'{print $1}\' | sort | uniq -c | sort -rn | head',
            ],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`grep` - keep only lines you want',
              '`awk` - pull out a specific column',
              '`sort` then `uniq -c` - group and count duplicates',
              '`sort -rn | head` - show the biggest counts first',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Build it one pipe at a time',
            text:
              'Do not write a giant one-liner from memory. Run the first command, look at the output, then tack on the next pipe. Grow it until it does the job.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can chain grep, awk, sort and uniq into a single line that turns a messy log into a clean answer.',
          },
          {
            type: 'quiz',
            question: 'What does `sort | uniq -c` give you?',
            options: [
              'Lines in random order',
              'Each unique line with a count of how often it appeared',
              'Only the first line',
              'Lines reversed',
            ],
            correctIndex: 1,
            explanation: 'uniq -c collapses duplicate adjacent lines into one, prefixed with the count - which is why you sort first.',
          },
        ],
      },
      {
        slug: 'grep-sed-awk-crash-course',
        title: 'grep, sed, awk Crash Course',
        summary: 'The three text tools that turn raw output into exactly the data you need.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          videoSlot('grep, sed and awk - the text-processing trio, explained fast'),
          {
            type: 'paragraph',
            text:
              'These three do different jobs. grep finds lines, sed edits lines, awk works with columns. Once they click, you stop opening files in an editor to make small changes.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`grep pattern file` - print lines that match',
              '`sed \'s/old/new/g\' file` - find and replace text',
              '`awk \'{print $2}\' file` - print the second column of each line',
            ],
          },
          {
            type: 'command',
            description: 'Find, replace and extract in one file:',
            commands: [
              'grep "error" app.log',
              'sed \'s/http:/https:/g\' urls.txt',
              'awk \'{print $1, $9}\' access.log',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'awk splits on spaces for free',
            text:
              'By default awk breaks each line into columns on whitespace, so `$1` is the first word, `$2` the second. No parsing code needed.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can search, edit and slice text from the command line without ever opening an editor.',
          },
          {
            type: 'quiz',
            question: 'Which tool is built to print a specific column from each line?',
            options: ['grep', 'sed', 'awk', 'cat'],
            correctIndex: 2,
            explanation: 'awk splits lines into fields and prints columns. grep matches lines; sed edits text.',
          },
        ],
      },
    ],
  },
  {
    slug: 'windows-side-quest',
    title: 'Windows Side Quest',
    description: 'Enough Windows to not be lost when the target runs it - the shells, the filesystem, and the trade-offs.',
    lessons: [
      {
        slug: 'windows-command-line',
        title: 'cmd.exe Survival Kit',
        summary: 'The handful of classic Windows commands you need when you land on a Windows box.',
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('cmd.exe survival kit - Windows commands for Linux people'),
          {
            type: 'paragraph',
            text:
              'Most of your practice is on Linux, but plenty of targets run Windows. When you get a shell there, the commands are different. Here is the survival kit.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`dir` - list files (like `ls`)',
              '`cd` - change directory (same idea)',
              '`type file.txt` - print a file (like `cat`)',
              '`whoami` - who am I logged in as',
              '`ipconfig` - network config (like `ifconfig`)',
            ],
          },
          {
            type: 'command',
            description: 'Get your bearings on a fresh Windows shell:',
            commands: ['whoami', 'ipconfig /all', 'dir'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Backslashes and drive letters',
            text:
              'Windows paths use backslashes and start with a drive letter, like `C:\\Users`. Linux uses forward slashes from a single root `/`. Small thing, trips up everyone at first.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You will not freeze when a shell drops you onto a Windows box - you know the basic commands to look around.',
          },
          {
            type: 'quiz',
            question: 'On Windows cmd.exe, which command prints the contents of a file?',
            options: ['cat', 'type', 'more only', 'show'],
            correctIndex: 1,
            explanation: 'type file.txt prints a file on Windows, the way cat does on Linux.',
          },
        ],
      },
      {
        slug: 'powershell-basics',
        title: 'PowerShell Basics',
        summary: 'The modern Windows shell that returns objects, not just text, and why that changes everything.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('PowerShell for hackers - the shell that returns objects'),
          {
            type: 'paragraph',
            text:
              'PowerShell is the grown-up Windows shell. The big twist: commands hand back structured objects, not plain text. So you can ask for a specific property instead of chopping strings.',
          },
          {
            type: 'paragraph',
            text:
              'Commands are named `Verb-Noun`, like `Get-Process` or `Get-Service`. Once you spot the pattern, guessing command names actually works.',
          },
          {
            type: 'command',
            description: 'List processes and filter them:',
            commands: [
              'Get-Process',
              'Get-Service | Where-Object { $_.Status -eq "Running" }',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Objects beat text',
            text:
              'In Bash you `grep` and `awk` text out of output. In PowerShell you filter on real properties like `.Status` or `.Name`. No fragile string slicing.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can run PowerShell commands and filter their output by real properties, not by cutting up text.',
          },
          {
            type: 'practice_ref',
            title: 'Windows Side Quest check',
            exerciseSlug: 'windows-side-quest-quiz',
          },
          {
            type: 'quiz',
            question: 'What makes PowerShell different from cmd.exe and Bash?',
            options: [
              'It is faster',
              'Commands return structured objects, not just text',
              'It only works offline',
              'It has no scripting',
            ],
            correctIndex: 1,
            explanation: 'PowerShell passes objects down the pipeline, so you filter on properties instead of parsing text.',
          },
        ],
      },
      {
        slug: 'windows-file-system-and-registry',
        title: 'Windows Filesystem and Registry',
        summary: 'Where Windows keeps its files and its settings, and which spots matter to an attacker.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Windows filesystem and registry - what an attacker looks for'),
          {
            type: 'paragraph',
            text:
              'Windows stores files in a few predictable places and its settings in a giant database called the registry. Knowing the map tells you where to look for interesting stuff.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`C:\\Users\\` - everyone home folders',
              '`C:\\Windows\\System32` - the core system binaries',
              '`C:\\Program Files` - installed software',
              'The registry - settings, autostart entries, and sometimes secrets',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The registry is organised into hives like `HKLM` (whole machine) and `HKCU` (current user). Autostart keys under these are a classic place attackers hide persistence.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Config files hide credentials',
            text:
              'Saved connection strings, scheduled tasks and app config files under a user folder often hold plaintext passwords. It is one of the first places to check after landing on a box.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the key Windows folders and the registry hives, so you know where to hunt on a Windows target.',
          },
          {
            type: 'quiz',
            question: 'Which registry hive holds settings for the whole machine?',
            options: ['HKCU', 'HKLM', 'HKCR', 'HKU'],
            correctIndex: 1,
            explanation: 'HKLM (HKEY_LOCAL_MACHINE) is machine-wide; HKCU is the current user only.',
          },
        ],
      },
      {
        slug: 'windows-vs-linux-for-hackers',
        title: 'Windows vs Linux for Hackers',
        summary: 'The honest trade-offs, so you know which OS to run your tools from and what each target expects.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('Windows vs Linux for hackers - which one and when'),
          {
            type: 'paragraph',
            text:
              'You will use both. Linux is the attacker workstation of choice; most tools are built for it and it stays out of your way. Windows matters because so many companies run it as the target.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Run your tools from Linux (or Kali/Parrot) - it is where the tooling lives',
              'Expect the target to often be Windows, especially in company networks',
              'Active Directory, the big corporate login system, is a Windows world',
              'WSL lets you run Linux tools on a Windows machine when you have no choice',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Learn both shells, prefer one home',
            text:
              'Do not pick a side and ignore the other. Live in Linux for your day-to-day, but be comfortable enough in Windows that a target running it does not slow you down.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know why Linux is the attacker box and Windows is so often the target, and you will not be thrown by either.',
          },
          {
            type: 'quiz',
            question: 'Why do most hackers run their tools from Linux?',
            options: [
              'Windows cannot run security tools at all',
              'Most tooling is built for Linux and it stays out of your way',
              'Linux is the only OS with a terminal',
              'Targets are never Windows',
            ],
            correctIndex: 1,
            explanation: 'The ecosystem of hacking tools is Linux-first, even though targets are frequently Windows.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'dns-tools-dig-nslookup',
    slug: 'networking-from-the-shell-quiz',
    title: 'Networking from the Shell check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which command lists listening ports and the process behind them?',
        options: ['ss -tulnp', 'ls -la', 'cat /etc/hosts', 'ping -c 1'],
        correctIndex: 0,
        explanation: '-t/-u pick TCP/UDP, -l is listening, -n numeric, -p shows the process (needs sudo).',
      },
      {
        prompt: 'For SSH key auth, which key do you copy to the server?',
        options: ['The private key', 'The public key', 'Both', 'A password file'],
        correctIndex: 1,
        explanation: 'The public key goes to the server; the private key stays with you.',
      },
      {
        prompt: 'You need to repeatedly sync a large folder to a server. Best tool?',
        options: ['scp', 'rsync', 'nc', 'type'],
        correctIndex: 1,
        explanation: 'rsync only sends changed bytes, so repeated syncs are fast.',
      },
      {
        prompt: 'Which DNS record points to a domain mail servers?',
        options: ['A', 'AAAA', 'MX', 'TXT'],
        correctIndex: 2,
        explanation: 'MX records identify the mail exchangers for a domain.',
      },
      {
        prompt: 'In dig output, which section holds the actual record you asked for?',
        options: ['QUESTION SECTION', 'ANSWER SECTION', 'AUTHORITY SECTION', 'ADDITIONAL SECTION'],
        correctIndex: 1,
        explanation: 'The ANSWER SECTION contains the resolved record; the rest is query metadata.',
      },
    ],
  },
  {
    lessonSlug: 'grep-sed-awk-crash-course',
    slug: 'bash-scripting-quiz',
    title: 'Bash Scripting check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does the shebang #!/bin/bash do?',
        options: [
          'Makes the file executable',
          'Tells the system which interpreter runs the script',
          'Prints a comment',
          'Runs the script as root',
        ],
        correctIndex: 1,
        explanation: 'The shebang names the interpreter. chmod +x is what makes it executable.',
      },
      {
        prompt: 'Inside a script, what holds the first argument you passed?',
        options: ['$0', '$1', '$#', '$@'],
        correctIndex: 1,
        explanation: '$1 is the first argument; $0 is the script name and $# is the count.',
      },
      {
        prompt: 'A Bash if statement acts on what?',
        options: [
          'Whether output was printed',
          'The command exit code (0 is success)',
          'The size of the file',
          'The number of arguments',
        ],
        correctIndex: 1,
        explanation: 'if tests the exit code: 0 means success/true.',
      },
      {
        prompt: 'What does sort | uniq -c produce?',
        options: [
          'Shuffled lines',
          'Each unique line with a count',
          'Only unique first characters',
          'Reversed lines',
        ],
        correctIndex: 1,
        explanation: 'uniq -c counts adjacent duplicates, which is why you sort first.',
      },
      {
        prompt: 'Which tool is built to print a specific column of each line?',
        options: ['grep', 'sed', 'awk', 'cat'],
        correctIndex: 2,
        explanation: 'awk splits lines into fields; grep matches lines and sed edits text.',
      },
    ],
  },
  {
    lessonSlug: 'windows-vs-linux-for-hackers',
    slug: 'windows-side-quest-quiz',
    title: 'Windows Side Quest check',
    instructions: 'Four quick ones. Get three right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'On Windows cmd.exe, which command prints a file like cat does?',
        options: ['cat', 'type', 'show', 'echo'],
        correctIndex: 1,
        explanation: 'type file.txt prints a file on Windows.',
      },
      {
        prompt: 'What makes PowerShell different from cmd.exe and Bash?',
        options: [
          'It runs faster',
          'Commands return structured objects, not just text',
          'It has no scripting support',
          'It only works offline',
        ],
        correctIndex: 1,
        explanation: 'PowerShell passes objects, so you filter on properties instead of parsing text.',
      },
      {
        prompt: 'Which registry hive holds settings for the whole machine?',
        options: ['HKCU', 'HKLM', 'HKCR', 'HKU'],
        correctIndex: 1,
        explanation: 'HKLM is machine-wide; HKCU is per current user.',
      },
      {
        prompt: 'Why do most hackers run tools from Linux?',
        options: [
          'Windows cannot run tools',
          'Most tooling is Linux-first and stays out of your way',
          'Targets are never Windows',
          'Linux is the only OS with a shell',
        ],
        correctIndex: 1,
        explanation: 'The tooling ecosystem is Linux-first, even though targets are often Windows.',
      },
    ],
  },
];
