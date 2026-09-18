import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'networking-from-the-shell',
    title: 'Networking from the Shell',
    description:
      'Investigate a live network with nothing but a terminal. By the end you can list every open port on a box and the process behind it, log in over SSH with keys instead of passwords, move files three different ways, and query DNS records by hand - the exact recon moves you make in the first ten minutes on any target.',
    lessons: [
      {
        slug: 'ss-netstat-and-lsof',
        title: 'Who Is Listening? ss, netstat, lsof',
        summary: 'Three commands that show you every open door on a machine and the program behind each one.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('ss vs netstat vs lsof - find every open port in 5 minutes'),
          {
            type: 'paragraph',
            text:
              'Before you touch a box you ask one question: what is running on it? A listening port is a program sitting by an open door, waiting for someone to knock. Find those doors and you have found the attack surface - because every listening service is code that can have bugs. This lesson is how you list them on a machine you already have a shell on.',
          },
          {
            type: 'paragraph',
            text:
              'A socket is the endpoint of a network conversation, identified by a protocol, an address and a port. When a program calls `listen()` on port 8080, the kernel records a listening socket bound to that port. `ss`, `netstat` and `lsof` all read that same kernel table - they just present it differently. `ss` is the modern, fast tool. `netstat` is the old classic that still ships almost everywhere, so you fall back to it when `ss` is missing. `lsof` is the one that maps a socket back to the exact process ID and program name holding it.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real result. Say you run the command below and see the line `tcp LISTEN 0 128 0.0.0.0:22 0.0.0.0:*`. Read it left to right: protocol is TCP, state is LISTEN (a server waiting), the local side is `0.0.0.0:22` which means "port 22 on every network interface", and the remote side `0.0.0.0:*` means "anyone, any port, is allowed to connect". Port 22 is SSH, so this box accepts remote logins from anywhere. That one line just told you the machine is reachable and how.',
          },
          {
            type: 'command',
            description: 'List listening TCP and UDP ports on your own machine, then map one to its process:',
            commands: ['ss -tuln', 'netstat -tuln', 'sudo ss -tulnp'],
          },
          {
            type: 'paragraph',
            text:
              'The output is one row per listening socket. The `Local Address:Port` column is the door number. `0.0.0.0` or `*` means the service is exposed on every interface; `127.0.0.1` means it only listens to the machine itself and is not reachable from the network. Add `-p` (with sudo) and each row gains a `users:(("nginx",pid=812,...))` tag naming the program and PID behind the port. That mystery service on 8080 with no `-p` becomes "the leftover dev server someone started as PID 812 and forgot to kill" the moment you add it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`-t` - TCP sockets, `-u` - UDP sockets',
              '`-l` - only listening sockets (drop it and you also see live connections)',
              '`-n` - show numeric ports and IPs, do not resolve names (much faster)',
              '`-p` - show the owning process (needs sudo)',
              '`0.0.0.0` / `*` in the address means exposed on all interfaces; `127.0.0.1` means local-only',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters the second you land on a machine during a real test. The internet-facing ports are what an outside attacker can reach, but the local-only services (`127.0.0.1`) are the interesting ones once you are already inside - an admin panel or database bound to localhost was never meant to be reached, and a foothold plus a local-only service is a classic privilege-escalation path. Listing sockets is also how you confirm your own tools started correctly and how a defender spots a service that should not be there.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Name to number, fast',
            text:
              'Add `-p` to `ss -tulnp` and every port gets the program name next to it. Recon is guessing "what is on 8080?"; `-p` turns the guess into an answer.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can walk onto any Linux box and list every service it exposes, tell the internet-facing ones from the local-only ones, and name the process behind each.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'quiz',
            question: 'You want only the ports a machine is actively listening on, shown as numbers. Which flags?',
            options: ['ss -a', 'ss -tuln', 'ss -e', 'ss -s'],
            correctIndex: 1,
            explanation: '-t and -u pick TCP/UDP, -l limits to listening sockets, and -n keeps the output numeric so it does not stall on name lookups.',
          },
        ],
      },
      {
        slug: 'ssh-basics',
        title: 'SSH: Remote Shells Done Right',
        summary: 'Log into a machine across the internet and get a real shell, safely, with keys instead of passwords.',
        estimatedMinutes: 9,
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
              'SSH gives you a terminal on a machine that is not in front of you - across the room or across the planet. Everything you type and everything it sends back is encrypted, so anyone watching the wire sees scrambled bytes, not your commands. It listens on port 22 by default, which is why that port is the first thing scanners look for: an open 22 means "you can maybe log in here".',
          },
          {
            type: 'paragraph',
            text:
              'The diagram above shows the safer way to log in: public-key authentication. A key pair is two linked files. The private key stays on your machine and you guard it like a password. The public key is math-derived from it and is safe to hand out. Here is the trick that makes it secure - the two are linked so that anything the private key signs can be verified by the public key, but you cannot work backwards from the public key to the private one.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the login end to end. You put your public key in the server\'s `~/.ssh/authorized_keys` file (the `ssh-copy-id` command below does this for you). When you connect, the server generates a random challenge and asks you to sign it. Your SSH client signs the challenge with your private key and sends the signature back. The server checks the signature against the public key it already trusts. If it matches, you are in - and notice your private key never crossed the network. That is why key auth beats a password, which does travel to the server every time.',
          },
          {
            type: 'command',
            description: 'Make an Ed25519 key pair, install the public half on a server, then log in:',
            commands: [
              'ssh-keygen -t ed25519 -C "you@laptop"',
              'ssh-copy-id user@server',
              'ssh user@server',
            ],
          },
          {
            type: 'paragraph',
            text:
              '`ssh-keygen` writes two files: `~/.ssh/id_ed25519` (private, keep it) and `~/.ssh/id_ed25519.pub` (public, share it). `ssh-copy-id` appends the `.pub` file to the server\'s `authorized_keys`, which is the only setup step. The final `ssh user@server` should now drop you straight to a shell prompt with no password asked - the challenge-and-sign exchange happened silently. If it still asks for a password, the public key did not land in `authorized_keys`, or the server has key auth turned off.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Private key `id_ed25519` - never leaves your machine, never share it',
              'Public key `id_ed25519.pub` - safe to hand to any server',
              '`authorized_keys` on the server - the list of public keys allowed to log in',
              'Port 22 - the default; a listening 22 is an invitation to try to authenticate',
              'Ed25519 - a modern key type, short and strong; prefer it over old RSA',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For a hacker, SSH cuts both ways. On the offense side, a reachable SSH port with weak or reused passwords is a direct way in, and finding a private key left on a compromised box often unlocks other machines that trust it. On the defense side, key-only auth (disabling passwords entirely) shuts down the brute-force attempts that hammer port 22 all day. Either way, understanding that the private key is the whole secret tells you exactly what to protect and what to hunt for.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The private key never leaves your machine',
            text:
              'If a site ever asks you to upload your private key, or you are about to paste it anywhere, stop. Only the `.pub` file is meant to travel. The private key is the entire secret - leaking it is handing over the login.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can log into a remote box over an encrypted channel and set up key-based auth so you never type that machine\'s password again.',
          },
          {
            type: 'quiz',
            question: 'Which file are you allowed to hand to a server?',
            options: ['The private key', 'The public key ending in .pub', 'Both keys together', 'Neither, ever'],
            correctIndex: 1,
            explanation: 'The public key is designed to be shared and installed on servers; the private key stays secret on your own machine and never travels.',
          },
        ],
      },
      {
        slug: 'transferring-files',
        title: 'Moving Files: scp, rsync, nc',
        summary: 'Copy files between machines three ways, and know when each one is the right tool.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('scp vs rsync vs netcat - moving files between machines'),
          {
            type: 'paragraph',
            text:
              'You found a file on a remote box - a config, a log, some loot - and you need it on your machine. Or the other way round: you want to push a tool up to a server. Three commands cover almost every case, and picking the right one saves you time and noise.',
          },
          {
            type: 'paragraph',
            text:
              '`scp` (secure copy) rides on top of SSH, so it is encrypted and uses the same login you already have. It copies a file or folder in one shot, every byte, every time. `rsync` also rides on SSH but is smarter: it compares source and destination first and sends only the parts that differ. `nc` (netcat) is the raw option - it opens a plain TCP socket with no encryption and no login, which you reach for only when SSH is not available and you just need bytes to move.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete pull. `scp user@server:/tmp/loot.txt .` means "connect to server as user, grab `/tmp/loot.txt`, and drop it in the current directory (`.`)". The colon is the split between the host and the remote path - everything before it is where to connect, everything after is what to fetch. Reverse the arguments and you push instead: `scp local.txt user@server:/tmp/` sends your file up. Same tool, direction decided by which side has the `user@host:` prefix.',
          },
          {
            type: 'command',
            description: 'Pull one file with scp, then sync a whole folder with rsync:',
            commands: [
              'scp user@server:/tmp/loot.txt .',
              'rsync -avz user@server:/var/log/ ./logs/',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The `rsync` line copies the remote `/var/log/` folder into a local `logs/` folder. Read the flags: `-a` (archive) preserves permissions and timestamps and recurses into subfolders, `-v` (verbose) prints each file as it goes, and `-z` compresses data over the wire to save bandwidth. The first run copies everything and prints a list. Run the exact same command again and it finishes almost instantly, printing far fewer files - because rsync checked and found nothing changed. That "only send the difference" behavior is why every real backup system is built on it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`scp` - simple encrypted copy over SSH, best for one or two files',
              '`rsync -avz` - smart copy that only sends changed data, best for big folders and repeats',
              '`nc` (netcat) - a raw unencrypted pipe for when there is no SSH, only a bare socket',
              'The `:` in `user@host:/path` splits where to connect from what to copy',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters in real testing because moving data quietly and correctly is half of post-exploitation. Pulling a large log for offline analysis with rsync means you can re-pull it later and only fetch the new lines. Knowing scp uses SSH tells you it needs the same credentials and leaves the same auth logs, while a netcat transfer is plaintext and anyone sniffing the wire reads it. Choosing the tool is also choosing how loud you are.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'rsync remembers',
            text:
              'Run the same rsync twice and the second run is nearly instant - it only copies bytes that actually changed since last time. That is the whole reason backups use it instead of plain copies.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can move files between any two machines you have access to, choosing the right tool for one file, a big repeating folder, or a bare socket with no SSH.',
          },
          {
            type: 'quiz',
            question: 'You need to copy a large folder to a server and repeat it daily. Best tool?',
            options: ['scp', 'rsync', 'nc', 'cat'],
            correctIndex: 1,
            explanation: 'rsync only transfers the data that changed since last time, so repeated syncs of a big folder are fast where scp would re-send everything.',
          },
        ],
      },
      {
        slug: 'dns-tools-dig-nslookup',
        title: 'dig and nslookup',
        summary: 'Ask DNS questions directly and read the answers, instead of trusting whatever the browser did.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('dig and nslookup - talk to DNS directly like a pro'),
          {
            type: 'paragraph',
            text:
              'DNS is the internet\'s address book: it turns a name like `suraksha.com` into an IP address a machine can actually connect to. Your browser does this lookup silently every time you visit a site. When you are doing recon, you do not want silent - you want to ask DNS yourself and read the raw answer, because those records quietly reveal where a company hosts its mail, its apps and sometimes services it forgot were public.',
          },
          {
            type: 'paragraph',
            text:
              '`dig` (domain information groper) is the detailed tool recon people live in - it prints the full query, the answer, and the metadata around it. `nslookup` is the shorter, friendlier one that ships on almost every system including Windows, so it is your fallback when `dig` is missing. Both ask the same question of the same DNS servers; `dig` just shows more of the answer.',
          },
          {
            type: 'paragraph',
            text:
              'Records come in types, and the type is which question you are asking. `A` asks "what IPv4 address?", `MX` asks "where does email for this domain go?", `TXT` asks "any free-form text records?" - which often hold domain-verification tokens that leak what third-party services a company uses. Walk one lookup: `dig example.com MX` asks only for the mail records, and the answer names the mail servers, which tells you whether email is self-hosted or handed to a provider like Google or Microsoft.',
          },
          {
            type: 'command',
            description: 'Query different record types for a domain:',
            commands: [
              'dig example.com A',
              'dig example.com MX',
              'dig +short example.com',
              'nslookup example.com',
            ],
          },
          {
            type: 'paragraph',
            text:
              '`dig` prints several labelled sections, and the one you actually want is the ANSWER SECTION - that is the resolved record. A line like `example.com. 3600 IN A 93.184.216.34` reads as: the name, the time-to-live in seconds (how long it may be cached), the class `IN` (internet), the record type `A`, and finally the value - here the IP address. Everything above and below the ANSWER SECTION is metadata about the query itself. If you want just the value with none of the noise, `dig +short` prints only the answer, which is perfect for feeding into a script.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`A` - the IPv4 address a name resolves to',
              '`AAAA` - the IPv6 address',
              '`MX` - where email for the domain is delivered',
              '`TXT` - free-form text, often verification tokens that reveal which services a company uses',
              '`CNAME` - an alias pointing one name at another',
              '`+short` - strip everything except the answer value',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is the opening move of mapping a target. Resolving the main name gives you an IP to scan. Pulling `MX` and `TXT` records paints a picture of the company\'s supporting infrastructure. And enumerating subdomains (dev, staging, admin, old) turns up hosts that were spun up, half-secured and forgotten - a classic source of easy findings. You cannot test a host until you know it exists, and DNS is how you learn it exists.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the ANSWER section',
            text:
              'dig prints a lot of output. The part that matters is the ANSWER SECTION - that is the actual record. Everything else is metadata about how the query went.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can query any DNS record type by hand and read the answer, which is the first move in mapping what a target actually exposes.',
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
            explanation: 'MX (Mail eXchange) records point to the mail servers for a domain; A gives an IPv4 address, TXT holds free text, CNAME is an alias.',
          },
        ],
      },
    ],
  },
  {
    slug: 'bash-scripting',
    title: 'Bash Scripting',
    description:
      'Automate the boring half of hacking. You will turn commands you already type into scripts, feed them targets as arguments, loop over lists and make decisions, and chain small tools into one-liners that pull a clean answer out of a messy log. By the end you can write a script that runs a check against every host in a list without you babysitting it.',
    lessons: [
      {
        slug: 'your-first-bash-script',
        title: 'Your First Bash Script',
        summary: 'Take the commands you already type and save them into a file you can run any time.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Write your first Bash script in 5 minutes'),
          {
            type: 'paragraph',
            text:
              'A Bash script is just a text file full of commands you would type into the terminal anyway. Instead of typing the same five commands every time, you write them once, save the file, and run the file. The shell reads it top to bottom and runs each line exactly as if you had typed it. That is the entire concept - and it is where automation starts.',
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'hello.sh',
            code: '#!/bin/bash\n# A first script: greet, then report time and user\necho "Hello, hacker"\ndate\nwhoami',
          },
          {
            type: 'paragraph',
            text:
              'Read that file line by line. Line 1, `#!/bin/bash`, is the shebang - it tells the system which program should interpret the file, here the Bash shell. Line 2 starts with `#`, so it is a comment; Bash ignores it and it is only there for a human reading later. Line 3, `echo "Hello, hacker"`, prints that text to the screen. Line 4, `date`, prints the current date and time. Line 5, `whoami`, prints the username you are logged in as. Nothing exotic - each line is a command you could run on its own.',
          },
          {
            type: 'command',
            description: 'Make the file runnable, then run it:',
            commands: ['chmod +x hello.sh', './hello.sh'],
          },
          {
            type: 'paragraph',
            text:
              'The first command, `chmod +x hello.sh`, flips the "executable" permission on the file - without it the system refuses to run the file as a program. The second command runs it, and you will see three lines of output: `Hello, hacker`, then something like `Fri Sep 18 08:30:12 IST 2026`, then your username such as `ravi`. That is the script executing its lines in order. Change a line, save, run again, and the output changes to match - the file is the source of truth.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`#!/bin/bash` - the shebang, names the interpreter, must be the very first line',
              '`#` at the start of a line - a comment, ignored by Bash',
              '`echo "text"` - print text to the screen',
              '`chmod +x file.sh` - grant execute permission (a one-time step per file)',
              '`./file.sh` - run a script in the current folder',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because real testing is repetitive by nature. You run the same recon steps against every new target, the same checks after every change. A script captures that routine once so you never fat-finger step three at 2am, and so a teammate can run your exact process by running your file. Every big hacking tool you will meet is, underneath, a very grown-up version of this: commands in a file, run in order.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The ./ is not optional',
            text:
              'You must write `./hello.sh`, not just `hello.sh`. The `./` means "the file right here in this folder". Without it, Bash only searches the system PATH folders, does not find your script, and reports "command not found".',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can save a sequence of commands into a script, mark it executable, and run the whole thing with one line.',
          },
          {
            type: 'quiz',
            question: 'What does the shebang line #!/bin/bash do?',
            options: [
              'Adds a comment for humans to read',
              'Tells the system which interpreter runs the file',
              'Makes the file executable by itself',
              'Prints the file name when the script runs',
            ],
            correctIndex: 1,
            explanation: 'The shebang points to the interpreter that should run the script. Making the file executable is a separate step, done with chmod +x.',
          },
        ],
      },
      {
        slug: 'variables-and-arguments',
        title: 'Variables and Arguments',
        summary: 'Store values, and let your script take input so one script handles many targets.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A script with everything hardcoded only ever does one thing. Variables let it remember values, and arguments let it take input from you when you run it - so one script works on any target you feed it instead of one you baked in. This is the jump from "a note to myself" to "a reusable tool".',
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'scan.sh',
            code: '#!/bin/bash\ntarget="$1"\necho "Scanning target: $target"\nping -c 1 "$target"',
          },
          {
            type: 'paragraph',
            text:
              'Read it line by line. `target="$1"` creates a variable named `target` and stores the script\'s first argument in it - note there are no spaces around the `=`, which Bash is strict about. `$1` is a special variable Bash fills in with the first thing you typed after the script name. The `echo` line prints a message, and `$target` inside the double quotes is replaced with the stored value. The last line pings that target exactly once (`-c 1` means "count: 1 packet") so it does not run forever.',
          },
          {
            type: 'command',
            description: 'Run it, passing a target as the first argument:',
            commands: ['chmod +x scan.sh', './scan.sh example.com'],
          },
          {
            type: 'paragraph',
            text:
              'When you run `./scan.sh example.com`, Bash sets `$1` to `example.com`, so `target` becomes `example.com` and the script prints `Scanning target: example.com` then pings it once. Run it again with `./scan.sh 8.8.8.8` and the same script now works on a different host - you changed the input, not the code. That is the entire point of arguments: the script is a template and the argument fills in the blank.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`$1`, `$2`, `$3` - the first, second, third argument you passed',
              '`$0` - the script name itself',
              '`$#` - how many arguments were given (useful for checking the user passed enough)',
              '`$@` - all the arguments at once, handy for looping over them',
              '`name="value"` - assign a variable, with no spaces around the `=`',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is where scripts start to pay for themselves in real work. A recon script that takes the target domain as `$1` can be pointed at any client in seconds. You can check `$#` at the top and print a usage message if the user forgot to pass a target, so the tool fails clearly instead of doing something weird with an empty value. One well-parameterised script replaces a folder full of near-identical copies.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Quote your variables',
            text:
              'Always write `"$target"`, not bare `$target`. Without the quotes, a value containing a space (or crafted input) splits into separate words and your command does the wrong thing - a bug class in its own right.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can write one script that takes a target as input and runs against anything you hand it, instead of hardcoding a single value.',
          },
          {
            type: 'quiz',
            question: 'Inside a script run as ./scan.sh example.com, what holds "example.com"?',
            options: ['$0', '$1', '$#', '$@ only'],
            correctIndex: 1,
            explanation: '$1 is the first argument. $0 is the script name and $# is the count of arguments passed.',
          },
        ],
      },
      {
        slug: 'loops-and-conditions',
        title: 'Loops and Conditions',
        summary: 'Repeat work over a list and make decisions, which is where scripts start to feel powerful.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Bash loops and if statements - automate repetitive scans'),
          {
            type: 'paragraph',
            text:
              'A loop repeats an action over a list of things. A condition decides whether to do something based on a result. Put them together and your script stops being a fixed list of commands and starts reacting - marching through a range of hosts, checking each one, and acting only on the ones that respond. This is the shape of nearly every recon script.',
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'ping-sweep.sh',
            code: '#!/bin/bash\n# Ping the first five hosts on a /24 and report which are alive\nfor ip in 1 2 3 4 5; do\n  host="192.168.1.$ip"\n  if ping -c 1 -W 1 "$host" > /dev/null 2>&1; then\n    echo "$host is up"\n  fi\ndone',
          },
          {
            type: 'paragraph',
            text:
              'Read it line by line. `for ip in 1 2 3 4 5; do` starts a loop that runs the body once for each number, with `ip` set to that number each pass. `host="192.168.1.$ip"` builds a full address like `192.168.1.3` by pasting the current number onto the base. `if ping -c 1 -W 1 "$host" ...` sends one ping (`-c 1`) with a one-second timeout (`-W 1`). `> /dev/null 2>&1` throws away ping\'s own chatty output so you only see your clean message. If the ping succeeds, `echo "$host is up"` runs. `fi` closes the if, `done` closes the loop.',
          },
          {
            type: 'command',
            description: 'Make it runnable and sweep your own local range:',
            commands: ['chmod +x ping-sweep.sh', './ping-sweep.sh'],
          },
          {
            type: 'paragraph',
            text:
              'Running it prints a short list like `192.168.1.1 is up` and `192.168.1.4 is up`, and stays silent about the addresses that did not answer. That silence is the condition working: the script only printed for the hosts where the ping came back. You just did in five lines what would be five separate manual pings, and you could change `1 2 3 4 5` to a wider range or read the list from a file to sweep a whole network.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`for x in a b c; do ... done` - run the body once per item, with `x` set each pass',
              '`if command; then ... fi` - run the body only if the command succeeded',
              '`ping -c 1 -W 1` - one packet, one-second timeout, so it never hangs',
              '`> /dev/null 2>&1` - discard both normal output and errors',
              'You can loop over a file with `for host in $(cat hosts.txt); do`',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is the core of automated recon on a real engagement. Given a list of in-scope hosts, a loop checks each for a specific open port, a known-vulnerable path, or simple reachability, and writes the hits to a file for you to dig into. The script does the tedious sweep while you focus on the interesting responses. Scale the loop up and you have the skeleton of the scanners professionals actually run.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Exit codes drive the if',
            text:
              'A Bash `if` tests success, not truth. Every command returns an exit code: 0 means success, anything else means failure, and `if` treats 0 as "yes". That is why `if ping ...` just works without comparing anything.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay in your lane',
            text: 'Only sweep or scan IP ranges you own or have written authorisation to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can loop over a list of targets, test each one, and act only on the ones that respond - the basic ping sweep every recon phase starts with.',
          },
          {
            type: 'quiz',
            question: 'In Bash, an if statement acts on what?',
            options: [
              'Whether the command printed any text',
              'The command exit code, where 0 means success',
              'The length of the command output',
              'Whether a file with that name exists',
            ],
            correctIndex: 1,
            explanation: 'if tests the exit code: 0 is success (treated as true), and anything non-zero is failure (false).',
          },
        ],
      },
      {
        slug: 'bash-one-liners-for-hackers',
        title: 'One-Liners That Do Real Work',
        summary: 'Chain small commands into a single line that pulls exactly what you want out of noise.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Bash one-liners every hacker should know'),
          {
            type: 'paragraph',
            text:
              'The real power of the shell is not any single command - it is gluing tiny tools together with the pipe symbol `|`. A pipe takes the output of the command on its left and feeds it as the input of the command on its right. Each tool does one small job well, and the chain of them does something big. Whole tasks that would be a script collapse into one line.',
          },
          {
            type: 'command',
            description: 'Find the busiest visitors in a web log: the IPs that made the most successful requests:',
            commands: [
              "grep ' 200 ' access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head",
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read the pipeline stage by stage, because that is exactly how it runs. `grep \' 200 \' access.log` keeps only the log lines with a 200 (successful) status. That stream flows into `awk \'{print $1}\'`, which prints just the first column of each line - in a standard access log, the visitor\'s IP address. `sort` puts identical IPs next to each other, which `uniq -c` needs in order to collapse duplicates and prefix each with a count. `sort -rn` then re-sorts by that count, reverse and numeric, so the biggest numbers rise to the top. `head` shows the top ten. The result is a tidy ranking like `342 203.0.113.9`, meaning that IP made 342 successful requests.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`grep pattern` - keep only the lines that match',
              "`awk '{print $1}'` - pull out a specific column (here the first)",
              '`sort` - order lines so duplicates sit together',
              '`uniq -c` - collapse adjacent duplicates and prefix each with its count',
              '`sort -rn | head` - rank by count, biggest first, show the top few',
            ],
          },
          {
            type: 'paragraph',
            text:
              'On a real test this exact shape earns its keep constantly. You point it at an access log to spot the IP hammering an endpoint (a brute-force attempt or a scanner). You swap the pattern to `401` or `403` to find who is getting rejected and how often. You change the `awk` column to pull URLs instead of IPs and rank the most-hit paths. The pipeline is a template: the tools stay, you change the pattern and the column.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Build it one pipe at a time',
            text:
              'Do not write a giant one-liner from memory. Run the first command, look at the output, then tack on the next `|` and run again. Grow the chain stage by stage until it does the job - you will see exactly where it goes wrong if it does.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can chain grep, awk, sort and uniq into a single line that turns a messy log into a clean, ranked answer.',
          },
          {
            type: 'quiz',
            question: 'What does `sort | uniq -c` give you?',
            options: [
              'Lines in random order',
              'Each unique line with a count of how often it appeared',
              'Only the first line of the file',
              'The lines reversed',
            ],
            correctIndex: 1,
            explanation: 'uniq -c collapses adjacent duplicate lines into one and prefixes the count, which is exactly why you sort first - it puts the duplicates next to each other.',
          },
        ],
      },
      {
        slug: 'grep-sed-awk-crash-course',
        title: 'grep, sed, awk Crash Course',
        summary: 'The three text tools that turn raw output into exactly the data you need.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          videoSlot('grep, sed and awk - the text-processing trio, explained fast'),
          {
            type: 'paragraph',
            text:
              'These three tools do three different jobs, and knowing which is which saves you from opening a file in an editor for every little change. `grep` finds lines that match a pattern. `sed` edits text as it streams past, most often find-and-replace. `awk` treats each line as columns and lets you work with them. Together they are how you reshape raw command output into just the data you actually want.',
          },
          {
            type: 'command',
            description: 'One example of each: find matching lines, replace text, and extract columns:',
            commands: [
              'grep "error" app.log',
              "sed 's/http:/https:/g' urls.txt",
              "awk '{print $1, $9}' access.log",
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read each command. `grep "error" app.log` prints only the log lines containing the word `error`, so a 10,000-line log becomes the handful you care about. `sed \'s/http:/https:/g\' urls.txt` streams the file and replaces every `http:` with `https:` - the `s` means substitute, the slashes separate old from new, and the trailing `g` means "every match on the line, not just the first". `awk \'{print $1, $9}\' access.log` prints columns 1 and 9 of each line; in a standard access log that is the client IP and the status code, side by side.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`grep pattern file` - print only the lines that match the pattern',
              "`sed 's/old/new/g' file` - find and replace text on every line (g = all matches)",
              "`awk '{print $2}' file` - print the second whitespace-separated column of each line",
              'Pipe them together: `grep ... | awk ...` to filter then extract',
              'grep -i ignores case; grep -v inverts to show non-matching lines',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For a hacker these three are the daily glue. You grep a giant scan output down to the lines mentioning a specific vulnerability. You awk a list of `URL status` pairs and pull only the URLs that returned 200, giving you the pages that actually exist. You sed a captured list of `http` links into `https` before feeding them to another tool. None of this needs a real programming language - the trio handles it inline, which is why they show up in almost every hacking walkthrough you will read.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'awk splits on spaces for free',
            text:
              'By default awk breaks each line into columns on any whitespace, so `$1` is the first word, `$2` the second, and so on. You get column parsing with zero setup - no need to write splitting code.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can search, replace and slice text straight from the command line without ever opening an editor.',
          },
          {
            type: 'quiz',
            question: 'Which tool is built to print a specific column from each line?',
            options: ['grep', 'sed', 'awk', 'cat'],
            correctIndex: 2,
            explanation: 'awk splits each line into fields and prints the columns you name. grep matches whole lines and sed edits text.',
          },
        ],
      },
    ],
  },
  {
    slug: 'windows-side-quest',
    title: 'Windows Side Quest',
    description:
      'Enough Windows to never freeze when a target runs it. You will learn the classic cmd.exe commands, why PowerShell hands back objects instead of text and how that changes filtering, where Windows keeps its files and settings in the registry, and the honest trade-offs of Linux versus Windows so you know which OS to attack from and what each target expects.',
    lessons: [
      {
        slug: 'windows-command-line',
        title: 'cmd.exe Survival Kit',
        summary: 'The handful of classic Windows commands you need when you land on a Windows box.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('cmd.exe survival kit - Windows commands for Linux people'),
          {
            type: 'paragraph',
            text:
              'Most of your practice happens on Linux, but a huge share of real targets - especially inside companies - run Windows. When a shell drops you onto a Windows machine, your Linux muscle memory fails: `ls` errors, `cat` errors. The commands are simply named differently. This is the small survival kit that gets you looking around instead of stuck.',
          },
          {
            type: 'paragraph',
            text:
              'The mapping is mostly one-to-one, just different words. `dir` lists files like `ls`. `cd` changes directory the same as on Linux. `type file.txt` prints a file like `cat`. `whoami` tells you which account you are running as - the single most important thing to know the moment you land, because it decides what you are allowed to do. `ipconfig` shows the network configuration like `ifconfig`, and with `/all` it dumps everything including DNS servers and MAC addresses.',
          },
          {
            type: 'command',
            description: 'Get your bearings on a fresh Windows shell:',
            commands: ['whoami', 'ipconfig /all', 'dir'],
          },
          {
            type: 'paragraph',
            text:
              'Read the output in order. `whoami` returns something like `corp\\ravi` - the `corp\\` part is the domain, which tells you this machine is joined to a company Active Directory, not a standalone box, and that is a big deal for what comes next. `ipconfig /all` lists each network adapter with its IPv4 address, subnet mask, default gateway and DNS servers - the gateway and DNS often reveal internal network ranges to explore. `dir` lists the current folder\'s files and subfolders with sizes and timestamps, the same first look as `ls -l`.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`dir` - list files (Linux `ls`)',
              '`cd` - change directory (same as Linux)',
              '`type file.txt` - print a file (Linux `cat`)',
              '`whoami` - the account you are running as; check this first',
              '`ipconfig /all` - full network config, DNS and adapters (Linux `ifconfig`)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because the first minutes on a new box decide your next move. Knowing your user tells you whether you already have admin or need to escalate. Reading `ipconfig` tells you what network you are sitting in and what else might be reachable. Being fluent in these basics means a Windows shell is just another shell to you, not a wall - and hesitation on a live engagement is how you lose access before you have learned anything.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Backslashes and drive letters',
            text:
              'Windows paths use backslashes and begin with a drive letter, like `C:\\Users\\ravi`. Linux uses forward slashes from a single root `/`. It is a small thing that trips up everyone at first, so expect it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You will not freeze when a shell lands you on a Windows box - you know the basic commands to see who you are, where you are, and what is around you.',
          },
          {
            type: 'quiz',
            question: 'On Windows cmd.exe, which command prints the contents of a file?',
            options: ['cat', 'type', 'more only', 'show'],
            correctIndex: 1,
            explanation: 'type file.txt prints a file on Windows, the same job cat does on Linux.',
          },
        ],
      },
      {
        slug: 'powershell-basics',
        title: 'PowerShell Basics',
        summary: 'The modern Windows shell that returns objects, not just text, and why that changes everything.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('PowerShell for hackers - the shell that returns objects'),
          {
            type: 'paragraph',
            text:
              'PowerShell is the grown-up Windows shell that replaced cmd.exe for real work. It has one big idea that makes it different from Bash and cmd: its commands hand back structured objects, not plain text. That sounds abstract, but it changes how you get information out - instead of chopping up strings with awk, you ask an object for a named property directly.',
          },
          {
            type: 'paragraph',
            text:
              'Commands are named as `Verb-Noun`, like `Get-Process`, `Get-Service`, `Stop-Process`. Once you spot the pattern, you can often guess a command name and be right. Each command returns objects with properties - a process object has `.Name`, `.Id`, `.CPU`; a service object has `.Status`, `.Name`. In Bash you would run a command, get a wall of text, and slice out the column you want. In PowerShell the column is already a labelled property, so you filter on it by name and never touch string positions.',
          },
          {
            type: 'command',
            description: 'List processes, then show only the services that are actually running:',
            commands: [
              'Get-Process',
              "Get-Service | Where-Object { $_.Status -eq 'Running' }",
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read the second line, because it is the whole point. `Get-Service` produces one object per Windows service. The pipe `|` sends those objects into `Where-Object`, which keeps only the ones matching a test. Inside the braces, `$_` means "the current object flowing through", and `$_.Status -eq \'Running\'` keeps it only if its Status property equals the text `Running`. The result is a clean table of just the running services. Notice you never parsed text - you compared a real property, so it cannot break if the output spacing changes.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Commands are `Verb-Noun`: `Get-Process`, `Get-Service`, `Get-ChildItem` (the `dir`/`ls` equivalent)',
              '`|` pipes objects, not text, from one command to the next',
              '`Where-Object { $_.Prop -eq value }` filters on a named property',
              '`$_` is the current object in the pipeline',
              'Comparisons use words: `-eq`, `-ne`, `-gt`, `-lt` (not `==` or `>`)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For a hacker, PowerShell is the native language of a Windows target. It is already installed, admins use it, and it can query the system, the network and Active Directory in ways cmd.exe cannot. That power also makes it a favourite for both offense and defense, so its activity is heavily logged - which is worth knowing before you lean on it during a real engagement. Learning to filter on properties instead of parsing text is the habit that makes everything after this easier.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Objects beat text',
            text:
              'In Bash you grep and awk text out of output and hope the spacing never changes. In PowerShell you filter on real properties like `.Status` or `.Name`, so your command keeps working even when the display format shifts.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can run PowerShell commands and filter their output by real properties instead of cutting up text by position.',
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
              'It runs faster than both',
              'Commands return structured objects, not just text',
              'It only works when offline',
              'It has no scripting support',
            ],
            correctIndex: 1,
            explanation: 'PowerShell passes objects down the pipeline, so you filter on named properties instead of parsing raw text.',
          },
        ],
      },
      {
        slug: 'windows-file-system-and-registry',
        title: 'Windows Filesystem and Registry',
        summary: 'Where Windows keeps its files and its settings, and which spots matter to an attacker.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Windows keeps its files in a few predictable folders and its settings in one giant database called the registry. Once you know that map, "where do I look for something interesting on this box?" has a set of standard answers. This lesson is that map, plus the spots that reward a look after you land on a machine.',
          },
          {
            type: 'paragraph',
            text:
              'Start with the filesystem. `C:\\Users\\` holds one folder per account, and inside a user folder live their desktop, documents, downloads and - crucially - hidden app-config folders. `C:\\Windows\\System32` holds the core system binaries, the Windows equivalent of `/bin` and `/sbin`. `C:\\Program Files` (and `Program Files (x86)` for 32-bit apps) holds installed software. Knowing these means you can navigate straight to where the good stuff usually sits instead of wandering.',
          },
          {
            type: 'paragraph',
            text:
              'Now the registry. It is a single hierarchical database of settings, split into top-level sections called hives. `HKLM` (HKEY_LOCAL_MACHINE) holds settings for the whole machine - every user sees them. `HKCU` (HKEY_CURRENT_USER) holds settings for just the logged-in user. Programs read the registry to know how to behave, and a specific set of keys - the "Run" keys under both hives - lists programs that launch automatically at startup. That autostart list is exactly where malware and attackers plant persistence so their code runs again after a reboot.',
          },
          {
            type: 'command',
            description: 'Read a startup autostart list and one interesting value from the registry (safe, read-only queries):',
            commands: [
              'reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"',
              'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Each `reg query` prints the values under that key: a name, a type like `REG_SZ`, and the data - usually a path to a program. Reading these two Run keys tells you everything that launches automatically at boot for the machine and for the current user. On a real box, a legitimate line points at something like an updater; a suspicious line pointing at a script in a temp folder or a user\'s AppData is a classic persistence red flag a defender would flag and an attacker would recognise as someone else\'s foothold.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`C:\\Users\\` - one folder per account, holds personal files and hidden app config',
              '`C:\\Windows\\System32` - core system binaries',
              '`C:\\Program Files` - installed software',
              'Registry hive `HKLM` - machine-wide settings',
              'Registry hive `HKCU` - current-user settings',
              'The `...\\CurrentVersion\\Run` keys - programs that autostart, a persistence hotspot',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters because after gaining a foothold, the questions are "what can I find?" and "how would someone stay hidden here?" - and both are answered in these locations. Saved connection strings, scheduled-task definitions and app config files under a user folder frequently hold plaintext passwords that unlock other systems. The registry Run keys reveal both what belongs and what does not. Knowing the map turns a blank Windows box into a checklist.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Config files hide credentials',
            text:
              'Saved connection strings, scheduled tasks and app config files under a user folder often hold plaintext passwords. It is one of the first places worth checking after landing on a box.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the key Windows folders and the registry hives, so you know where to hunt for secrets and where persistence hides on a Windows target.',
          },
          {
            type: 'quiz',
            question: 'Which registry hive holds settings for the whole machine?',
            options: ['HKCU', 'HKLM', 'HKCR', 'HKU'],
            correctIndex: 1,
            explanation: 'HKLM (HKEY_LOCAL_MACHINE) is machine-wide and affects every user; HKCU applies only to the current user.',
          },
        ],
      },
      {
        slug: 'windows-vs-linux-for-hackers',
        title: 'Windows vs Linux for Hackers',
        summary: 'The honest trade-offs, so you know which OS to run your tools from and what each target expects.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You will use both operating systems, so this is not a rivalry to pick a winner in - it is knowing which one to attack from and which one you will most often be attacking. The short version: you drive from Linux, and you frequently arrive at Windows. Understanding why saves you from fighting your own tools.',
          },
          {
            type: 'paragraph',
            text:
              'Linux is the attacker workstation of choice for a simple reason: the ecosystem of hacking tools is built for it. nmap, Burp, Metasploit, ffuf, the whole toolbox installs cleanly and runs without friction, and distributions like Kali or Parrot ship them pre-packaged. Linux also stays out of your way - no forced updates mid-scan, easy scripting, full control over the network stack. So your commands, your scripts, and your proxies all live on Linux.',
          },
          {
            type: 'paragraph',
            text:
              'Windows is where you are usually going. Most companies run Windows on desktops and many servers, and the big corporate identity system, Active Directory, is entirely a Windows world - it is how thousands of company machines share logins, and it is one of the richest attack surfaces in enterprise security. So the pattern is: your tools run on Linux, and they reach across the network to Windows targets. When you truly need Linux tooling on a Windows machine you are sitting at, WSL (Windows Subsystem for Linux) runs a real Linux environment inside Windows as a bridge.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Attack FROM Linux - it is where the tooling lives and it stays out of your way',
              'Expect the TARGET to often be Windows, especially inside company networks',
              'Active Directory, the corporate login backbone, is a Windows-only world',
              'WSL runs a real Linux environment inside Windows when you have no Linux box handy',
              'Be fluent in both shells even though you keep your home on Linux',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This matters for how you set yourself up and how you read a job. If an engagement is a corporate internal network, you can bet on Windows and Active Directory being the main event, so brushing up on PowerShell beforehand pays off. If it is a web application, you may never touch either OS directly and it barely matters. Knowing the trade-offs means you prepare the right skills for the target in front of you instead of being surprised by it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Learn both shells, prefer one home',
            text:
              'Do not pick a side and ignore the other. Live in Linux for day-to-day tooling, but be comfortable enough in Windows that a target running it never slows you down.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know why Linux is the attacker box and Windows is so often the target, and you will not be thrown by working across either one.',
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
            explanation: 'The hacking-tool ecosystem is Linux-first and Linux gives you full control without getting in the way, even though the targets you reach are frequently Windows.',
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
