import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'terminal-survival',
    title: 'Terminal Survival',
    description:
      'Stop being scared of the black window and learn to actually work in it: read the prompt, walk the filesystem tree, read and edit any file, and hunt down files and text with find and grep. By the end you can land on an unfamiliar Linux box, figure out where you are, and pull a password out of a pile of configs with one chained command.',
    lessons: [
      {
        slug: 'terminal-basics',
        title: 'Terminal Basics',
        summary: 'The black box is just a text way to tell the computer what to do.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('The Linux terminal in 5 minutes - stop being scared of the black box'),
          {
            type: 'paragraph',
            text:
              'The terminal is just a place where you type a command and the computer runs it. No clicking, no menus, no waiting for a window to load. It looks intimidating because it is silent and plain, but once it clicks it is faster than any GUI, and almost every security tool you will ever use lives here and nowhere else.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the whole loop, and it never changes. The terminal prints a **prompt** and waits. You type a command, press Enter, it runs the command and prints whatever the command had to say, then prints a fresh prompt and waits again. That is it - type, Enter, read, repeat. The prompt itself is not decoration: it usually packs in your username, the machine name, and the folder you are currently sitting in, so you can always see who and where you are at a glance.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real one. A prompt like `priya@webserver:/var/www$` reads left to right as: you are the user `priya`, on a machine called `webserver`, currently in the folder `/var/www`, and the `$` means you are a normal user (a `#` would mean you are root). Run `whoami` and it prints `priya`. Run `hostname` and it prints `webserver`. Run `pwd` and it prints `/var/www`. The prompt was already telling you all three - these commands just confirm each piece on its own so you learn to trust what the prompt shows.',
          },
          {
            type: 'command',
            description: 'Three read-only commands that tell you who and where you are:',
            commands: ['whoami', 'hostname', 'pwd'],
          },
          {
            type: 'paragraph',
            text:
              '`whoami` prints the single username you are logged in as - important because your username decides what you are allowed to touch. `hostname` prints the machine\'s name, which matters the moment you are hopping between several boxes and need to know which one your commands are hitting. `pwd` means "print working directory" and prints the full path of the folder you are in, like `/var/www`; every relative command you type runs from here, so knowing it stops you from acting in the wrong place. None of the three change anything - they only report, which is exactly why they are safe first commands to build confidence on.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`whoami` - which user you are logged in as',
              '`hostname` - the name of this machine',
              '`pwd` - "print working directory", the folder you are sitting in',
              '`clear` - wipe the screen when it gets messy (nothing is deleted)',
              'A `$` prompt means a normal user; a `#` prompt means you are root',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters the second you land on an unfamiliar machine: orientation comes before action. When you get a shell on a box in a lab, the first questions are always "who am I and where am I?", because the answer decides everything you can do next. `whoami` returning `root` versus `www-data` is the difference between owning the box and being stuck in a corner of it. Running these harmless commands first, every single time, is a habit that keeps you from typing a destructive command in a folder you did not realise you were in.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The up arrow is your best friend',
            text:
              'Press the up arrow to bring back the last command you ran, and keep pressing it to walk back through your history. Tab auto-completes file and folder names. Between them you will type half as much and make far fewer typos.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can open a terminal, read the prompt like a sentence, and run your first commands to see who and where you are. That is the door every hacker walks through.',
          },
          {
            type: 'quiz',
            question: 'What does the `pwd` command tell you?',
            options: [
              'Your password',
              'The folder you are currently in',
              'The name of the machine',
              'A list of every file on the disk',
            ],
            correctIndex: 1,
            explanation: '`pwd` means "print working directory" - it shows the folder you are in right now. It has nothing to do with passwords.',
          },
        ],
      },
      {
        slug: 'navigating-the-filesystem',
        title: 'Moving Around the Filesystem',
        summary: 'Folders inside folders, all hanging off one root. Learn to walk it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('cd, ls, pwd - navigate any Linux system in 6 minutes'),
          {
            type: 'image',
            src: '/api/v1/diagrams/linux-filesystem',
            alt: 'The Linux directory tree with etc, home, var, tmp and usr/bin',
            caption: 'One tree, no drive letters. These are the folders worth knowing.',
          },
          {
            type: 'paragraph',
            text:
              'A Linux filesystem is one single tree. There are no `C:` or `D:` drives like on Windows - everything starts at `/`, called the root, and every folder and file hangs off it as a branch. Your home folder, the system config, the logs, the programs - all of them are somewhere under that one starting point. The diagram above shows the branches worth memorising early.',
          },
          {
            type: 'paragraph',
            text:
              'The building analogy holds up well. `/` is the ground floor of the whole building. `/home` is the residents\' floor, and `/home/priya` is your own flat inside it. `/etc` is the building\'s control room where the settings live, `/var/log` is where the security-camera recordings pile up, and `/tmp` is the shared scratch table anyone can dump things on. `cd` walks you from room to room, `ls` shows you what is inside whichever room you are standing in, and `pwd` tells you which room that is.',
          },
          {
            type: 'command',
            description: 'The three moves you will make constantly, all safe:',
            commands: ['ls -la', 'cd /var/log', 'cd ..'],
          },
          {
            type: 'paragraph',
            text:
              'Walk that sequence and watch what happens. `ls -la` lists everything in the current folder including hidden files, in long form - each row shows permissions, owner, size and name, so a line like `drwxr-xr-x 2 root root 4096 May 2 apache2` tells you `apache2` is a folder (`d`) owned by root. `cd /var/log` moves you into the system log folder; run `pwd` and it now prints `/var/log`. `cd ..` goes up exactly one level, landing you back in `/var`. Two dots always mean "the folder above me", so from `/var/log` you climb to `/var`, and a second `cd ..` would take you to `/`.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`ls` - list what is in this folder; `ls -la` shows hidden files and full details',
              '`cd folder` - go into that folder',
              '`cd ..` - go up one level',
              '`cd ~` - jump straight to your home folder',
              '`cd -` - jump back to the last folder you were in',
              'Hidden files start with a dot (like `.bashrc`) and only show up with `ls -a`',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Absolute vs relative paths',
            text:
              'A path starting with `/` is absolute - it points at the same place no matter where you are standing, like a full postal address. A path without the leading slash is relative to your current folder, like saying "two rooms to the left". Mix these up and you will "lose" files that are sitting right there, or act on the wrong copy.',
          },
          {
            type: 'paragraph',
            text:
              'Why this is a survival skill and not just housekeeping: when you land on an unfamiliar machine, the whole system is laid out in this one tree, and knowing the tree tells you where the interesting things live before you even look. Configs and secrets cluster in `/etc`, web application code sits under `/var/www`, logs that reveal what the box does are in `/var/log`, and anyone\'s writable dumping ground is `/tmp`. A tester who knows the standard layout heads straight for the valuable folders; one who does not wanders blind. Being able to `cd` anywhere and `ls` to see what is there is how you go from "lost in a strange box" to "mapping it in minutes".',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can move anywhere in a Linux system, list what is there including hidden files, and read a long listing. No more getting lost in the tree.',
          },
          {
            type: 'quiz',
            question: 'You are in `/var/log` and you run `cd ..`. Where do you end up?',
            options: ['`/`', '`/var`', '`/var/log/log`', '`/home`'],
            correctIndex: 1,
            explanation: '`cd ..` goes up exactly one level. From `/var/log` that lands you in `/var`.',
          },
        ],
      },
      {
        slug: 'reading-and-editing-files',
        title: 'Reading and Editing Files',
        summary: 'Peek at a file, dump it, or edit it - the right tool for each.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('cat, less, nano - read and edit files in the terminal like a pro'),
          {
            type: 'paragraph',
            text:
              'A huge amount of hacking is just reading files - configuration files that hold database passwords, logs that record what happened, source code that reveals how an app works, and notes someone left lying around. The terminal has a different tool for each situation, and picking the right one is the difference between a clean read and a screen full of garbage.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism to understand is that these tools differ in how much they load and whether they can change anything. `cat` dumps a whole file to the screen at once and is read-only - perfect for something short, painful for a 10,000-line log because it all scrolls past in a blur. `less` opens a big file and lets you scroll it a page at a time without loading the whole thing into memory, so it stays fast on huge files. `head` and `tail` show only the first or last handful of lines. `nano` is a simple editor that actually lets you change and save the file.',
          },
          {
            type: 'command',
            description: 'Read a file three different ways, all non-destructive:',
            commands: ['cat /etc/hostname', 'less /var/log/syslog', 'tail -n 20 /var/log/auth.log'],
          },
          {
            type: 'paragraph',
            text:
              'Walk what each one gives you. `cat /etc/hostname` prints the machine\'s name and drops you straight back at the prompt, because the file is one short line - ideal for small files. `less /var/log/syslog` opens the big system log in a scrollable view: use the arrow keys or Page Down to move, `/error` to search for the word "error", and `q` to quit back to the prompt. `tail -n 20 /var/log/auth.log` prints just the last 20 lines of the authentication log - the most recent logins and sudo attempts - which is usually exactly the part you care about, since the newest events sit at the bottom.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`cat file` - dump the whole thing to the screen (fine for short files)',
              '`less file` - scroll a big file page by page; `/word` searches, `q` quits',
              '`head -n N file` / `tail -n N file` - the first or last N lines',
              '`tail -f file` - follow a live log, printing new lines as they arrive',
              '`nano file` - a simple editor; `Ctrl+O` saves, `Ctrl+X` exits',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'tail -f is the log watcher',
            text:
              'Run `tail -f` on a log file and it keeps printing new lines the instant they arrive, live. It is perfect for watching what an app writes the moment you poke it from another window - poke, watch the log react, learn how it behaves.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters on an unfamiliar machine: once you can move around the tree, the payoff is reading what is in it, and reading well means not drowning. Trying to `cat` a giant log floods your screen and teaches you nothing; opening it in `less` and searching for the one line you want turns a wall of noise into an answer. On a real box the win often hides in a config file - a `wp-config.php` with the database password, an `.env` with an API key - and knowing whether to peek with `head`, scroll with `less`, or watch live with `tail -f` is what lets you find it fast instead of missing it in the scroll.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can open, read and edit any text file from the terminal, and pick the fast tool for the job instead of drowning a big log in `cat`.',
          },
          {
            type: 'quiz',
            question: 'Which command lets you scroll a huge log file page by page?',
            options: ['`cat`', '`less`', '`nano`', '`pwd`'],
            correctIndex: 1,
            explanation: '`less` pages through big files without loading the whole thing to the screen. `cat` dumps it all at once, which is painful for large logs.',
          },
        ],
      },
      {
        slug: 'finding-files-and-text',
        title: 'find and grep: Locating Anything',
        summary: 'Two tools that find any file, or any word inside any file.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('find and grep - the two commands that locate anything on a Linux box'),
          {
            type: 'paragraph',
            text:
              'You will constantly need to find a file whose name you only half-remember, or hunt for a word - like `password` - buried somewhere inside a pile of config files. Two tools cover almost every case, and they split the job cleanly: `find` locates files by their name or properties, while `grep` searches for text inside files. Learn the pair and nothing on a box can hide from you for long.',
          },
          {
            type: 'paragraph',
            text:
              'Here is how each one thinks. `find` walks the directory tree starting from a folder you name and returns every file matching a rule - a name pattern, a size, a permission. Its shape is `find <where> <what to match>`, so `find /etc -name "*.conf"` means "starting in /etc, return every file whose name ends in .conf". `grep` does the opposite job: you give it a word and a file, and it prints every line that contains that word. Its shape is `grep "<text>" <file>`. Add `-r` and grep dives recursively through every file in a folder instead of just one.',
          },
          {
            type: 'command',
            description: 'find files by name, then grep for text inside them:',
            commands: [
              'find /etc -name "*.conf"',
              'grep -i "error" /var/log/syslog',
              'grep -rn "password" /etc 2>/dev/null',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read the output of each. `find /etc -name "*.conf"` prints a list of full paths, one per line, like `/etc/ssh/sshd_config` - each line is a file you could now open. `grep -i "error" /var/log/syslog` prints only the log lines containing "error", ignoring case (`-i`), so you skip straight to the problems. The big one is `grep -rn "password" /etc`: `-r` searches every file under /etc, `-n` prefixes each hit with its line number, and each result reads `/etc/some.conf:42:password=hunter2` - meaning file, line 42, and the matching line. The `2>/dev/null` on the end simply hides the "permission denied" noise for files you cannot read, leaving only real hits.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`find <where> -name "<pattern>"` - locate files by name',
              '`grep "<text>" <file>` - print lines that contain the text',
              '`grep -r` - search recursively through every file in a folder',
              '`grep -i` - ignore upper/lower case',
              '`grep -n` - show the line number of each match',
              '`2>/dev/null` - hide the permission-denied errors so real hits stand out',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The classic first move on a new box',
            text:
              'Landed on a machine and want quick wins? `grep -rn "password" .` inside a config folder has ended more challenges than any fancy exploit. Developers leave credentials in config files constantly, and grep drags them into the light in one line.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only search and read files on machines you own or are explicitly authorised to test.',
          },
          {
            type: 'paragraph',
            text:
              'Why this is the heart of terminal recon on an unfamiliar machine: once you can reach any folder and read any file, `find` and `grep` are how you decide WHICH files are worth reading out of thousands. Instead of opening configs one by one hoping for a secret, you grep the whole tree for `password`, `secret`, `api_key` or `token` and let the machine point you at the interesting lines. `find` handles the other half - locating that config, key file or backup whose name you know but whose location you do not. Together they turn "there might be something useful somewhere on this box" into a short list of exact files and line numbers.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can find any file by name and any word inside any file, complete with line numbers. That is real recon on a live system.',
          },
          {
            type: 'quiz',
            question: 'You want every line containing "error" in `syslog`, case-insensitive. Which command?',
            options: [
              '`find syslog -name error`',
              '`grep -i "error" syslog`',
              '`cat error syslog`',
              '`grep -v "error" syslog`',
            ],
            correctIndex: 1,
            explanation: '`grep -i` matches text ignoring case. `find` locates files, not text; `grep -v` would show lines that do NOT match.',
          },
        ],
      },
      {
        slug: 'pipes-and-redirection',
        title: 'Pipes and Redirection',
        summary: 'Snap small commands together into one that does real work.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Pipes and redirection - chain commands like Lego and feel powerful'),
          {
            type: 'image',
            src: '/api/v1/diagrams/pipes-redirection',
            alt: 'Output of one command flowing into the next through pipes',
            caption: 'Small tools chained together beat one big tool.',
          },
          {
            type: 'paragraph',
            text:
              'This is where the terminal leaves every GUI behind. The idea is simple and it is the whole Unix philosophy: each command does one small job well, and you snap them together so the output of one becomes the input of the next. Chain three tiny tools and you get a single line that does work no single program shipped a button for. The diagram above shows that flow - data pouring out of one command straight into the mouth of the next.',
          },
          {
            type: 'paragraph',
            text:
              'Two mechanisms do all of it. The **pipe** `|` takes whatever a command prints and feeds it as input to the command on its right, instead of showing it on screen. **Redirection** with `>` and `>>` takes that output and writes it into a file instead. That is the entire trick: `|` passes output sideways to another command, `>` and `>>` park it in a file. Everything clever you see experienced people do at the terminal is mostly these two ideas stacked up.',
          },
          {
            type: 'command',
            description: 'Pipe output through other commands, then save results to a file:',
            commands: [
              'cat /var/log/syslog | grep "error" | wc -l',
              'ls -la > listing.txt',
              'echo "checked at 10am" >> notes.txt',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read that first line field by field, because it is a real recon one-liner. `cat /var/log/syslog` prints the whole log; the `|` hands it to `grep "error"`, which keeps only the lines containing "error"; the second `|` hands those to `wc -l`, which counts lines. So the whole line prints a single number: how many error lines are in the log. You never saw the thousands of lines in between - each pipe filtered the stream until only the answer remained. The second command, `ls -la > listing.txt`, runs the listing but sends it into a file instead of the screen. The third appends a timestamped note to the end of `notes.txt` without erasing what was there.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`a | b` - send the output of `a` into `b` as its input',
              '`> file` - write output to a file, overwriting whatever was there',
              '`>> file` - append output to the end of a file',
              '`wc -l` - count lines; great at the end of a pipe',
              '`sort` and `uniq` - order lines and squash duplicates (often used together)',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'One arrow overwrites, two append',
            text:
              '`>` wipes the file clean and writes fresh output. `>>` adds to the end and keeps what was already there. Use `>` on a file you meant to add to and it is gone - there is no undo, so pause half a second before every single `>`.',
          },
          {
            type: 'paragraph',
            text:
              'Why this is the payoff of the whole module on an unfamiliar machine: the earlier tools each answer one question, but real recon is combining them. `grep -r "password" /etc | grep -v "#"` finds credential lines while dropping commented-out ones. `ls /var/www | wc -l` counts how many sites a server hosts. `cat access.log | grep "admin" | tail -20` pulls the last twenty times anyone hit an admin page. And redirection means you save every finding to a notes file as you go, so nothing is lost when the shell closes. Pipes turn a box full of noise into pointed answers, and that is the superpower that makes learning the terminal worth it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can chain commands with pipes to filter a stream down to the answer, and save results to files. This is the skill that makes the terminal worth learning.',
          },
          {
            type: 'practice_ref',
            title: 'Terminal Survival check',
            exerciseSlug: 'terminal-survival-quiz',
          },
          {
            type: 'quiz',
            question: 'What is the difference between `>` and `>>`?',
            options: [
              'They are identical',
              '`>` overwrites the file, `>>` appends to it',
              '`>` appends, `>>` overwrites',
              '`>>` deletes the file first',
            ],
            correctIndex: 1,
            explanation: '`>` overwrites the whole file with new output. `>>` adds to the end without touching what is already there.',
          },
        ],
      },
    ],
  },
  {
    slug: 'files-users-permissions',
    title: 'Files, Users and Permissions',
    description:
      'Read `-rwxr-xr-x` at a glance and understand why that little string decides who can do what on a box. By the end you can decode any permission line, change permissions and ownership with chmod and chown, spot the SUID and sticky bits that quietly hand out extra power, list the users and processes on a machine, and explain why `sudo -l` is the first thing a hunter runs on a fresh shell.',
    lessons: [
      {
        slug: 'files-and-permissions',
        title: 'Files and Permissions',
        summary: 'Every file says who can read, write and run it. Learn to read that.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('Linux file permissions explained - decode -rwxr-xr-x in one sitting'),
          {
            type: 'image',
            src: '/api/v1/diagrams/linux-permissions',
            alt: 'The permission string broken into type, owner, group and everyone',
            caption: 'Learn to read this once and every Linux box gets easier.',
          },
          {
            type: 'paragraph',
            text:
              'Every file on Linux carries a small label saying who is allowed to read it, change it, or run it. That label is the difference between "locked door" and "come on in", which is exactly why a hacker reads it before touching anything. Get comfortable with this one string and every Linux machine you ever meet becomes easier to understand. The diagram above breaks the string into the pieces we are about to name.',
          },
          {
            type: 'paragraph',
            text:
              'Run `ls -l` on a file and you see something like `-rwxr-xr-x`. It looks like line noise until you know it is really ten slots in a fixed order. The very first slot is the file type. The next nine are three groups of three: the first `rwx` is what the **owner** can do, the middle `r-x` is what the **group** can do, and the last `r-x` is what **everyone else** on the system can do. Within each group of three the order is always read, then write, then execute - `r`, `w`, `x` - and a `-` in any slot means that permission is switched off.',
          },
          {
            type: 'paragraph',
            text:
              'Decode `-rwxr-xr-x` end to end. The leading `-` says it is a normal file. Owner has `rwx` - read, write and execute, so the owner can do everything. Group has `r-x` - read and execute but no write, so group members can run it and read it but not change it. Others have `r-x` too - same as the group. So a script with these permissions can be read and run by anyone on the box, but only its owner can edit it. Change that first character to `d` and you would be looking at a directory instead, where `x` means "allowed to enter it" rather than "allowed to run it".',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`r` - read the file (or list a directory)',
              '`w` - write to / change the file (or add and remove files in a directory)',
              '`x` - execute (run) the file, or enter a directory',
              '`-` in a slot means that permission is off',
              'Order is always the same: **owner**, then **group**, then **others**',
            ],
          },
          {
            type: 'command',
            description: 'Look at the permissions on files in a real system folder:',
            commands: ['ls -l', 'ls -la /etc'],
          },
          {
            type: 'paragraph',
            text:
              'In the output of `ls -l /etc`, each row is one file or folder and the first column is exactly the permission string you just learned to read. A line like `-rw-r--r-- 1 root root 1234 May 2 passwd` reads as: a normal file, owner (root) can read and write, group can only read, others can only read - and it is owned by root. A line beginning `drwxr-xr-x` is a directory anyone can enter and list. Reading down that first column tells you at a glance which files you could change, which you can only read, and which are locked to root - before you waste time trying to edit something you have no write access to.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The first character is the type',
            text:
              'Before the nine permission slots sits one character for the type: `-` is a normal file, `d` is a directory, and `l` is a symbolic link (a shortcut to somewhere else). So `drwxr-xr-x` is a folder, not a file, and reading that first character stops a lot of confusion.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can look at `-rwxr-xr-x` and instantly say who can read, write and run a file, and tell a file from a directory. That is a core survival skill on any box.',
          },
          {
            type: 'quiz',
            question: 'In `-rwxr-xr-x`, what can "others" (the last group) do?',
            options: [
              'Read, write and execute',
              'Read and execute, but not write',
              'Nothing',
              'Only write',
            ],
            correctIndex: 1,
            explanation: 'The last three characters `r-x` mean read and execute are on, but write is off. So others can read and run it, but not change it.',
          },
        ],
      },
      {
        slug: 'owners-groups-chmod',
        title: 'Owners, Groups and chmod',
        summary: 'Every file has an owner and a group. chmod changes what each can do.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('chmod and chown - change file permissions and ownership with confidence'),
          {
            type: 'paragraph',
            text:
              'Now that you can read a permission line, you need to change one. Two commands run this whole show. `chmod` ("change mode") changes the read/write/execute permissions on a file. `chown` ("change owner") changes who owns it. Between them they decide exactly who can touch what, and understanding them turns permissions from something you read into something you control.',
          },
          {
            type: 'paragraph',
            text:
              'The part that scares beginners is the numbers, so here is the trick that makes them easy. Each permission has a value: read is **4**, write is **2**, execute is **1**. To set a slot, you add up the values of the permissions you want. Read plus write is 4+2 = 6. All three is 4+2+1 = 7. Read plus execute is 4+1 = 5. A chmod number is three of these digits in a row - one for owner, one for group, one for others. So `chmod 755` means owner gets 7 (everything), group gets 5 (read and execute), others get 5 (read and execute). `chmod 644` means owner 6 (read and write), group 4 (read), others 4 (read).',
          },
          {
            type: 'command',
            description: 'Change permissions and check them (run on a throwaway file you own):',
            commands: ['chmod 755 script.sh', 'chmod +x tool.sh', 'ls -l script.sh'],
          },
          {
            type: 'paragraph',
            text:
              'Walk what these do. `chmod 755 script.sh` sets that file to `-rwxr-xr-x` - the very string from the last lesson - so the owner can edit and run it and everyone else can read and run it. `chmod +x tool.sh` is the shortcut form: it just adds the execute bit without touching anything else, which is what you use constantly to make a downloaded script runnable without doing any maths. Then `ls -l script.sh` prints the file\'s permission line so you can confirm the change landed - you should see `-rwxr-xr-x` where before it might have been `-rw-r--r--`. Always verify with `ls -l` rather than assuming the chmod worked.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`4` = read, `2` = write, `1` = execute - add them up per slot',
              '`chmod 644` - owner read/write, everyone else read only',
              '`chmod 755` - owner all, group and others read/execute',
              '`chmod +x file` - just make it runnable, no maths needed',
              '`chown user:group file` - hand the file to a new owner (needs root)',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'chmod 777 is a code smell',
            text:
              '`777` means every single user can read, write AND run the file. It is the lazy "just make it work" fix, and it is a gift to an attacker: anyone on the box can rewrite that file. When you spot `777` on a real system, especially on a script or a web file, that is very often where the story begins.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you land on an unfamiliar machine: permissions are not just something to read, they are something to hunt for weaknesses in. A world-writable script (`chmod 777` or a `w` in the others slot) that a more privileged user or a scheduled job runs is a classic path to escalate: you rewrite the script, wait for root to run it, and your code runs as root. So after reading permissions, the next instinct is to look for files you can write that you should not be able to - and `chmod` is also how a defender fixes exactly those mistakes. Understanding both directions, loosening and tightening, is what lets you spot the dangerous ones.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can change what a file allows with numbers or the `+x` shortcut, hand a file to a new owner, and verify the result. You now control the locks, not just read them.',
          },
          {
            type: 'quiz',
            question: 'What does `chmod 755 file` give the owner?',
            options: [
              'Read only',
              'Read, write and execute',
              'Write and execute only',
              'Nothing',
            ],
            correctIndex: 1,
            explanation: 'The first digit `7` is 4+2+1 = read, write and execute. Group and others get `5` (4+1) = read and execute.',
          },
        ],
      },
      {
        slug: 'suid-and-special-bits',
        title: 'SUID and the Sticky Bit',
        summary: 'A few special permission bits that quietly hand out extra power.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'On top of the read/write/execute bits you already know, Linux has a few special permission bits that change how a file behaves in surprising ways. They look tiny in an `ls -l` - just a single letter in a slot you expected something else - but one of them, SUID, is one of the most classic paths from "normal user" to "root" that exists.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism that makes SUID dangerous. Normally, when you run a program, it runs with YOUR permissions. A SUID program breaks that rule: it runs with the permissions of its OWNER, no matter who launched it. So if a program is owned by root and has the SUID bit set, then any normal user who runs it is briefly acting as root for the duration of that program. That exists for good reasons - `passwd` needs to edit a root-owned file so you can change your own password - but it means a root-owned SUID program with a bug can be tricked into doing root things on the attacker\'s behalf.',
          },
          {
            type: 'command',
            description: 'Hunt for SUID files across the whole system:',
            commands: ['find / -perm -4000 -type f 2>/dev/null'],
          },
          {
            type: 'paragraph',
            text:
              'Read this one carefully because it is a standard privilege-escalation check. `find /` searches the entire filesystem from the root. `-perm -4000` matches only files with the SUID bit set (4000 is the numeric code for SUID). `-type f` limits it to files, not directories. `2>/dev/null` throws away the flood of "permission denied" errors so you see only real results. The output is a list of full paths, each a program that runs as its owner - and you cross-check each against known-abusable binaries (a curated list called GTFOBins). A familiar name like `/usr/bin/passwd` is expected; something unusual like `/usr/bin/find` being SUID-root is a red flag worth chasing.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SUID** - the program runs as its owner (shows as `s` in the owner execute slot)',
              '**SGID** - the program runs as its group instead',
              '**Sticky bit** - on a folder, only the owner of a file can delete it (see it on `/tmp`)',
              'An `s` where you expected an `x` is the flag to notice in `ls -l`',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why /tmp is safe-ish',
            text:
              'Everyone can write to `/tmp`, so why is it not total chaos with people deleting each other\'s files? The sticky bit. On `/tmp` it means you can drop your own files there, but you cannot delete files that belong to someone else - which is exactly what a shared scratch folder needs.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only hunt SUID binaries and test privilege paths on machines you own or are authorised to test.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters the moment you get a low-privileged shell on an unfamiliar machine: you rarely land as root, so the whole game becomes climbing from the account you have to the one you want. The SUID hunt above is one of the very first commands run on a fresh shell precisely because a single misconfigured SUID-root binary can be the whole ladder to root. Reading `ls -l` and noticing an `s` where an `x` should be, or running that `find`, is how you spot in seconds a weakness the system\'s owner never intended - which is exactly why a careful defender audits their own SUID files regularly.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot SUID and the sticky bit and understand why one small `s` can matter more than the whole rest of the line.',
          },
          {
            type: 'quiz',
            question: 'Why do attackers hunt for SUID programs owned by root?',
            options: [
              'They are always invisible',
              'They run with the owner\'s permissions, so a buggy one can give root',
              'They cannot be read',
              'They delete themselves after running',
            ],
            correctIndex: 1,
            explanation: 'A SUID program runs as its owner. If root owns it and it can be abused, a normal user borrows root - a classic privilege escalation.',
          },
        ],
      },
      {
        slug: 'users-and-processes',
        title: 'Users and Processes',
        summary: 'Who is on the box, and what each one is actually running.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A Linux box is a shared flat. Several users can exist on it at once, and every running program belongs to some user. Knowing who is who, and which user each program runs as, tells you exactly how much damage each one could do - which is the whole point of sizing up a machine before you act on it.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism to grasp is that Linux identifies users by a number, not a name. Every account has a **UID** (user ID), and the mapping from names to UIDs lives in the file `/etc/passwd`. Despite the alarming name, that file holds no passwords at all - just account details - and it is readable by everyone. The one UID worth memorising is **0**: UID 0 is always root, the account that can do anything. Any account with UID 0 has full power, even if it is not literally named "root", which is itself a sneaky thing to check for.',
          },
          {
            type: 'command',
            description: 'See who you are, who else exists, and what is running:',
            commands: ['whoami', 'id', 'cat /etc/passwd', 'ps aux'],
          },
          {
            type: 'paragraph',
            text:
              'Read each result. `whoami` prints your username. `id` prints more: something like `uid=1000(priya) gid=1000(priya) groups=1000(priya),27(sudo)` - your UID, your main group, and every group you belong to. That `sudo` group is gold, because it hints you may be able to run commands as root. `cat /etc/passwd` prints one line per account, like `root:x:0:0:root:/root:/bin/bash` - the fields are username, a placeholder `x`, UID, group ID, description, home folder, and login shell; scan the third field for any UID `0`. `ps aux` lists every running process; its first column is the USER running each one, so you can see at a glance what root is running versus what a limited service user like `www-data` is running.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`id` - your user ID, group, and which groups you belong to',
              '`/etc/passwd` - the list of accounts on the box (no passwords in it)',
              'UID `0` = root; anyone with UID 0 has full power',
              '`ps aux` - every running process and which user owns it',
              '`w` / `who` - who is currently logged in right now',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the owner column',
            text:
              'In `ps aux`, the first column is the user running each process, and it is the column that matters most. A web server process running as `root` is a far bigger prize than the same process running as the locked-down `www-data` user - if you can influence the first, you influence root.',
          },
          {
            type: 'paragraph',
            text:
              'Why this is core recon on an unfamiliar machine: after you know your own permissions, the next questions are "who else is here, and what is already running as root?". `/etc/passwd` gives you the guest list - other users to target or impersonate. `id` tells you which powerful groups you are already in. `ps aux` shows which processes run as root, because a root process you can feed input to (a script, a service with a known bug) is a direct route to escalate. Together these paint the map of power on the box: who has it, what is running with it, and where the gap between your account and root is thin enough to jump.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can list the users on a box, read your own groups, and see which user each process runs as. That is how you size up a system fast.',
          },
          {
            type: 'quiz',
            question: 'Which user ID (UID) always belongs to root?',
            options: ['`1000`', '`0`', '`1`', '`999`'],
            correctIndex: 1,
            explanation: 'UID `0` is always root on Linux. Regular users usually start at `1000`.',
          },
        ],
      },
      {
        slug: 'sudo-and-root',
        title: 'sudo, root, and Why It Matters',
        summary: 'Root can do anything. sudo lets you borrow that power for one command.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Root is the god account on a Linux box: it can read any file, kill any process, install anything, and change anything it likes. Living logged in as root all the time is dangerous, because one careless command wipes the system with no "are you sure?". So the normal way to work is to stay a regular user and borrow root\'s power for one command at a time with `sudo`.',
          },
          {
            type: 'paragraph',
            text:
              'Here is exactly what happens when you run `sudo something`. The system checks a rules file called `/etc/sudoers` to see whether your account is allowed to use sudo, and for which commands. If you are allowed, it asks for YOUR password (not root\'s), and once you type it correctly it runs that single command as root, then drops you straight back to being a normal user. It also usually caches your password for a few minutes so you are not retyping it constantly. This is cleaner and far safer than logging in as root, because only the one command you asked for gets the extra power.',
          },
          {
            type: 'command',
            description: 'Borrow root for one command, and check what you are allowed to run:',
            commands: ['sudo whoami', 'sudo -l', 'sudo cat /etc/shadow'],
          },
          {
            type: 'paragraph',
            text:
              'Read the results, because two of these are pure recon. `sudo whoami` should print `root` - proof that sudo worked and you really did run that command as root. `sudo -l` is the important one: it lists exactly which commands your account is allowed to run via sudo, printing lines like `(root) NOPASSWD: /usr/bin/find`. That output is a menu of your privileged powers, and on a target it is often the single fastest route to root. `sudo cat /etc/shadow` reads the file that DOES hold password hashes (unlike `/etc/passwd`), which a normal user cannot read - so it working confirms your sudo access reaches genuinely protected files.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`sudo cmd` - run one command as root (asks for YOUR password)',
              '`sudo -l` - list exactly what sudo will let you run (gold for recon)',
              '`sudo whoami` should print `root` if it worked',
              'Sudo use is usually logged, so it is not invisible',
              '`/etc/sudoers` is the rules file that decides who may run what',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Misconfigured sudo is a privesc goldmine',
            text:
              'If `sudo -l` shows you can run even one wrong program as root - something as innocent-looking as a text editor, `find`, `vim`, or `less` - that is often a complete ladder to a root shell, because many everyday programs can be made to run a shell from inside them. It is one of the first things a hunter checks on a new shell.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test sudo rules and privilege paths on machines you own or are authorised to test.',
          },
          {
            type: 'paragraph',
            text:
              'Why this closes out the module on an unfamiliar machine: the whole arc of the last few lessons - reading permissions, spotting SUID, mapping users and processes - is really about one goal, getting from the account you landed on to the account that can do everything. `sudo -l` is the most direct probe for that goal, because it flat-out tells you which powerful commands you already have permission to run. A single misconfigured sudo rule can hand you root faster than any exploit, which is why running `sudo -l` is a reflex on every fresh shell, and why a careful administrator keeps that rules file as tight as possible.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand root, how `sudo` lends its power for a single command, and why `sudo -l` is the first thing worth running on a new box.',
          },
          {
            type: 'practice_ref',
            title: 'Files, Users and Permissions check',
            exerciseSlug: 'files-users-permissions-quiz',
          },
          {
            type: 'quiz',
            question: 'What does `sudo -l` show you?',
            options: [
              'Every file on the system',
              'The commands you are allowed to run with sudo',
              'A list of logged-in users',
              'Your login history',
            ],
            correctIndex: 1,
            explanation: '`sudo -l` lists exactly what sudo will let your account run. On a target, that list is often the fastest route to root.',
          },
        ],
      },
    ],
  },
  {
    slug: 'processes-services-logs',
    title: 'Processes, Services and Logs',
    description:
      'Find what is running on a box, what runs quietly in the background, and what all of it left written down. By the end you can list and stop processes with the right signal, list and query the services systemd manages, read the logs in /var/log and via journalctl to reconstruct what happened, and read a cron schedule to spot the scheduled jobs attackers love to abuse.',
    lessons: [
      {
        slug: 'processes-and-signals',
        title: 'Processes and Signals',
        summary: 'Every running program is a process. Signals are how you talk to them.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Linux processes and signals - list, inspect and kill anything running'),
          {
            type: 'paragraph',
            text:
              'Every program that is currently running is a process, and the system gives each one a unique ID number called the PID. The PID is how you refer to a specific running program - to inspect it, pause it, or stop it, you talk to it by its PID. Understanding processes is understanding what a machine is actually doing right now, moment to moment, rather than what it could do.',
          },
          {
            type: 'paragraph',
            text:
              'The way you control a process is by sending it a **signal** - a small message that tells it to do something. The famous one is called "kill", but that name is misleading: the default kill signal is really a polite "please shut down cleanly", which gives the program a chance to save its work and tidy up. There is also a force-quit signal, `-9`, that stops the process instantly with no chance to clean up. Knowing the difference between the polite request and the sledgehammer is what stops you corrupting a program\'s data by accident.',
          },
          {
            type: 'command',
            description: 'List processes, then stop one by its PID (use a PID you own):',
            commands: ['ps aux', 'top', 'kill 1234', 'kill -9 1234'],
          },
          {
            type: 'paragraph',
            text:
              'Read what each shows. `ps aux` prints a one-time snapshot of every process: the columns include USER (who owns it), PID (its number), %CPU and %MEM (how much it is using), and COMMAND (what it actually is) - so a row `root 812 0.0 0.1 /usr/sbin/sshd` tells you SSH is running as root with PID 812. `top` is the live version of the same idea, refreshing every couple of seconds so you can watch which process is eating the CPU right now (press `q` to quit). `kill 1234` sends the polite stop signal to PID 1234; `kill -9 1234` forces it. You get the PID from `ps` or `top` first, then feed it to `kill`.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`ps aux` - a snapshot of every process with its PID and owner',
              '`top` (or `htop`) - a live, updating view of what is busy',
              '`kill <pid>` - ask a process to shut down cleanly',
              '`kill -9 <pid>` - force it to stop right now, no cleanup',
              '`pgrep name` - find the PID of a process by its name',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Try the polite kill first',
            text:
              'Plain `kill` lets a program save and clean up before it exits. `kill -9` is the sledgehammer that stops it dead mid-action. Reach for `-9` only when the polite version is ignored, because forcing a database or an editor to die can leave its files corrupted.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you land on an unfamiliar machine: `ps aux` is one of the very first commands you run, because it is a live inventory of everything happening on the box. It shows you the services worth attacking (a web server, a database), which user each runs as (a process running as root is a bigger target), and sometimes leaks secrets outright - passwords passed on a command line show up right there in the COMMAND column for anyone running `ps`. Being able to read that snapshot, find a process by name, and control it, is the difference between watching a machine and understanding it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can list what is running, read its PID and owner, and stop it cleanly or forcefully. That is basic control over any Linux box.',
          },
          {
            type: 'quiz',
            question: 'What is the difference between `kill` and `kill -9`?',
            options: [
              'They are the same',
              '`kill` asks nicely, `kill -9` forces the process to stop immediately',
              '`kill -9` restarts the process',
              '`kill` is only for root',
            ],
            correctIndex: 1,
            explanation: 'Plain `kill` sends a polite "please stop" so the program can clean up. `kill -9` forces it to die at once, with no chance to save.',
          },
        ],
      },
      {
        slug: 'services-and-systemd',
        title: 'Services and systemd',
        summary: 'The background programs a server runs, and the tool that manages them.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A server does not have someone sitting at a keyboard launching programs by hand. Web servers, databases, SSH - they all run as **services**: background programs that start automatically when the machine boots and keep running without anyone logged in. On almost every modern Linux system, a manager called `systemd` is what starts, stops, and supervises those services.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism. Each service is described by a small config called a unit, and systemd reads those units to know what to run and how to keep it alive. If a service crashes, systemd can restart it. You talk to systemd through one command, `systemctl`, which is the single control panel for every service on the box. And this matters directly to security: each running service is a door into the machine, listening on some port, so an attacker\'s first real question about any server is "what services are running here, and which of them are reachable?".',
          },
          {
            type: 'command',
            description: 'Check a service and list what is running:',
            commands: [
              'systemctl status ssh',
              'systemctl list-units --type=service',
              'systemctl is-active nginx',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read the output. `systemctl status ssh` prints a block showing whether the service is `active (running)` or `inactive (dead)`, how long it has been up, its main PID, and the last few log lines it produced - so in one command you learn if SSH is up and see its recent activity. `systemctl list-units --type=service` prints a table of every service with a LOAD/ACTIVE/SUB state and a description, which is essentially the full list of what this machine does for a living. `systemctl is-active nginx` is the quick yes/no version, printing just `active` or `inactive` - handy in scripts or when you only need a single answer.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`systemctl status <name>` - is it running, plus recent log lines',
              '`systemctl list-units --type=service` - every service on the box',
              '`systemctl start` / `stop` / `restart` - control a service (needs root)',
              '`systemctl enable` - make it start automatically on boot',
              '`systemctl is-active <name>` - a quick active/inactive answer',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Services map to ports',
            text:
              'A running web service means an open web port, a running database service means an open database port, and so on. Line up the `systemctl` service list against the open ports you found from a scan, and the machine\'s purpose stops being a guess - you can see exactly what each open door leads to.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters on an unfamiliar machine: processes (last lesson) tell you what is running right now, but services tell you what the box is designed to run and will run again after every reboot. Listing the services is how you understand what a server is FOR - a web host, a database server, a mail relay - and each service is attack surface that persists. An old, forgotten service still enabled from years ago is exactly the kind of unpatched door that turns into a way in, which is also why a careful administrator disables services they do not actually need. Reading the service list is reconnaissance and hardening at the same time.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can list a server\'s background services and check whether each one is running. That is how you learn what a box is really for.',
          },
          {
            type: 'quiz',
            question: 'Which command shows whether the SSH service is currently running?',
            options: [
              '`ls ssh`',
              '`systemctl status ssh`',
              '`cat ssh`',
              '`kill ssh`',
            ],
            correctIndex: 1,
            explanation: '`systemctl status ssh` reports whether the service is active and shows its recent log lines.',
          },
        ],
      },
      {
        slug: 'logs-and-journalctl',
        title: 'Logs: Where Systems Confess',
        summary: 'Every system keeps a diary. Read it and you see everything that happened.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Linux logs and journalctl - read the diary every system quietly keeps'),
          {
            type: 'paragraph',
            text:
              'Systems write down almost everything they do - who logged in, what errors happened, which services started, what requests came in. That running diary is your single best source of truth about what a machine has actually been up to. Most of it lives in files under `/var/log`, and on `systemd` machines you can also read it through a command called `journalctl`.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is that different events go to different logs, so knowing which file holds what saves you a lot of time. Authentication events - logins, failed passwords, sudo use - land in `/var/log/auth.log` (called `secure` on Red Hat-style systems). General system chatter goes to `/var/log/syslog`. Individual applications often keep their own logs, like a web server\'s access log. `journalctl` is systemd\'s unified view that can filter all of this by service and time. Because logs are just text, everything you learned about `tail`, `less` and `grep` applies directly to reading them.',
          },
          {
            type: 'command',
            description: 'Read logs from files and from the journal:',
            commands: [
              'ls /var/log',
              'tail -f /var/log/auth.log',
              'journalctl -u ssh --no-pager | tail -20',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Walk each one. `ls /var/log` prints the list of available log files so you can see what this machine records - names like `auth.log`, `syslog`, `nginx/` and `dpkg.log`. `tail -f /var/log/auth.log` shows the last lines of the auth log and then keeps printing new ones live; a real line reads like `May 2 10:04:11 webserver sshd[812]: Failed password for priya from 10.0.0.5` - date, host, the sshd process, and exactly what happened, including the source IP. `journalctl -u ssh` pulls only the SSH service\'s log entries from the journal; `--no-pager` prints them straight out and `tail -20` keeps it to the most recent twenty. Reading these tells you a story: repeated "Failed password" lines from one IP is someone brute-forcing the login.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`/var/log/auth.log` (or `secure`) - logins, failed passwords, sudo use',
              '`/var/log/syslog` - the general system diary',
              '`journalctl -u <service>` - logs for one specific service',
              '`journalctl -f` - follow new journal entries live',
              'Pipe any log through `grep` to jump to the one line that matters',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Logs are where defenders catch you',
            text:
              'Every failed login, every odd request, every sudo command can land in a log. On a real engagement, assume someone reads these and that your actions leave a trail. As a learner, that same trail is a gift: reading the logs is the fastest way to understand what a system is doing and what has already happened to it.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters on an unfamiliar machine: logs cut both ways, and both ways are useful to you. For a defender, they are evidence - the record of who did what and when, and where an attack came from. For an attacker, they leak intelligence: usernames that exist, file paths, software versions, and other people\'s mistakes, all written down in plain text. Either way, whoever reads the logs first has the advantage. Landing on a box and reading `/var/log/auth.log` tells you which accounts are real and whether anyone is already attacking it; reading an app\'s log can reveal exactly how it behaves. This is the detective skill that ties the whole module together.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can open a system\'s logs, follow them live, query one service through journalctl, and grep for the event you care about. This is the detective skill.',
          },
          {
            type: 'lab_ref',
            labSlug: 'log-hunter',
            title: 'Try it: Log Hunter lab',
          },
          {
            type: 'quiz',
            question: 'Where would you usually look first for login and sudo activity?',
            options: [
              '`/etc/passwd`',
              '`/var/log/auth.log`',
              '`/home`',
              '`/tmp`',
            ],
            correctIndex: 1,
            explanation: '`/var/log/auth.log` (called `secure` on some systems) records logins and sudo use - the first stop for "who did what".',
          },
        ],
      },
      {
        slug: 'cron-and-scheduled-jobs',
        title: 'cron and Scheduled Jobs',
        summary: 'The clockwork that runs jobs on a schedule - and a favourite privesc hideout.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Some jobs need to run on their own, without anyone logged in - a backup at 2am, a cleanup every hour, a report every Monday. `cron` is the built-in alarm clock that runs commands on a schedule. It sits in the background checking the time, and whenever a scheduled moment arrives, it runs whatever command was booked for it. Understanding cron means understanding what a machine does automatically, when nobody is watching.',
          },
          {
            type: 'paragraph',
            text:
              'A cron entry is five time fields followed by the command to run. The fields, in order, are: minute, hour, day-of-month, month, and day-of-week. A `*` in any field means "every". So `0 2 * * *` reads as minute 0, hour 2, every day of the month, every month, every day of the week - in plain words, "2:00 AM every day". Once you can read those five fields left to right, a schedule that looked like a puzzle becomes a sentence. `*/5 * * * *` means "every 5 minutes"; `30 9 * * 1` means "9:30 AM every Monday" (1 is Monday).',
          },
          {
            type: 'command',
            description: 'See scheduled jobs for your user and for the system:',
            commands: ['crontab -l', 'ls -la /etc/cron.d', 'cat /etc/crontab'],
          },
          {
            type: 'paragraph',
            text:
              'Read what each reveals. `crontab -l` lists the current user\'s own scheduled jobs, printing lines exactly in the five-fields-then-command format you just learned. `ls -la /etc/cron.d` lists the system-wide cron job files - and note the permissions column here, because a cron file you can WRITE to is a finding in itself. `cat /etc/crontab` prints the main system schedule, which on many systems adds a sixth field: the USER the job runs as. A line like `0 3 * * * root /opt/backup.sh` means "at 3:00 AM every day, run /opt/backup.sh as root" - and that "as root" is the detail an attacker\'s eyes go straight to.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`crontab -l` - list the current user\'s scheduled jobs',
              '`/etc/crontab` and `/etc/cron.d/` - system-wide jobs (often name the user)',
              'Five fields: minute, hour, day-of-month, month, day-of-week',
              '`*` means "every"; `* * * * *` runs every single minute',
              'The script a cron job calls matters as much as the schedule',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A cron job running as root is a target',
            text:
              'If a scheduled job runs as root and you can edit the script it calls - or drop a file into a folder it processes - you can make root run YOUR code on the very next tick. Checking cron for jobs that run as root against files you can write is a standard privilege-escalation step.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only inspect and test scheduled jobs on machines you own or are authorised to test.',
          },
          {
            type: 'paragraph',
            text:
              'Why this closes out the module on an unfamiliar machine: processes show what runs now, services show what runs on boot, logs show what already happened - and cron shows what will run automatically in the future, often with more power than your account has. That combination is exactly why cron is a favourite hiding spot for privilege escalation: a root cron job that runs a world-writable script is a quiet, recurring gift to an attacker, and it is easy for an administrator to leave one lying around by accident. Reading a schedule, checking who each job runs as, and checking whether you can write the files it touches is how you find that gift - or, as a defender, how you make sure you never left one.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can read a cron schedule field by field, list the scheduled jobs on a box, and see why an attacker checks them early.',
          },
          {
            type: 'practice_ref',
            title: 'Processes, Services and Logs check',
            exerciseSlug: 'processes-services-logs-quiz',
          },
          {
            type: 'quiz',
            question: 'What does the cron schedule `0 2 * * *` mean?',
            options: [
              'Every 2 minutes',
              'At 2:00 every day',
              'Only on the 2nd of the month',
              'Twice an hour',
            ],
            correctIndex: 1,
            explanation: 'The fields are minute, hour, day, month, weekday. `0 2 * * *` is minute 0 of hour 2, every day - so 2:00 AM daily.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'pipes-and-redirection',
    slug: 'terminal-survival-quiz',
    title: 'Terminal Survival check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does `pwd` print?',
        options: ['Your password', 'The folder you are in', 'The machine name', 'A file list'],
        correctIndex: 1,
        explanation: '`pwd` means print working directory - the folder you are currently in.',
      },
      {
        prompt: 'You are in `/var/log`. Where does `cd ..` take you?',
        options: ['`/`', '`/var`', '`/home`', 'Nowhere'],
        correctIndex: 1,
        explanation: '`cd ..` goes up one level, so from `/var/log` you land in `/var`.',
      },
      {
        prompt: 'Which command scrolls a huge log file page by page?',
        options: ['`cat`', '`less`', '`echo`', '`pwd`'],
        correctIndex: 1,
        explanation: '`less` pages through a big file. `cat` dumps the whole thing to the screen at once.',
      },
      {
        prompt: 'Which command searches for text inside files, ignoring case?',
        options: ['`find`', '`grep -i`', '`ls -la`', '`wc -l`'],
        correctIndex: 1,
        explanation: '`grep -i` matches text case-insensitively. `find` locates files by name, not text.',
      },
      {
        prompt: 'What does `>>` do compared to `>`?',
        options: [
          'Nothing different',
          'Appends instead of overwriting',
          'Deletes the file',
          'Runs the command twice',
        ],
        correctIndex: 1,
        explanation: '`>` overwrites the file; `>>` appends to the end without erasing what is there.',
      },
    ],
  },
  {
    lessonSlug: 'sudo-and-root',
    slug: 'files-users-permissions-quiz',
    title: 'Files, Users and Permissions check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In `-rwxr-xr-x`, which group does the first `rwx` belong to?',
        options: ['Others', 'The group', 'The owner', 'Root only'],
        correctIndex: 2,
        explanation: 'The order is always owner, group, others. The first `rwx` is the owner.',
      },
      {
        prompt: 'What permissions does `chmod 755` give the owner?',
        options: ['Read only', 'Read and write', 'Read, write and execute', 'Nothing'],
        correctIndex: 2,
        explanation: 'The first digit `7` is 4+2+1 = read, write and execute.',
      },
      {
        prompt: 'Why do attackers hunt for root-owned SUID programs?',
        options: [
          'They are invisible',
          'They run as their owner, so a buggy one can grant root',
          'They cannot be deleted',
          'They run faster',
        ],
        correctIndex: 1,
        explanation: 'A SUID program runs with the owner\'s permissions. A root-owned, abusable one is a classic path to root.',
      },
      {
        prompt: 'Which UID always belongs to root?',
        options: ['`1000`', '`0`', '`1`', '`500`'],
        correctIndex: 1,
        explanation: 'Root is always UID `0`. Normal users typically start at `1000`.',
      },
      {
        prompt: 'What does `sudo -l` show?',
        options: [
          'All files on disk',
          'The commands you can run with sudo',
          'Logged-in users',
          'Your password',
        ],
        correctIndex: 1,
        explanation: '`sudo -l` lists what your account is allowed to run via sudo - often the fastest route to root.',
      },
    ],
  },
  {
    lessonSlug: 'cron-and-scheduled-jobs',
    slug: 'processes-services-logs-quiz',
    title: 'Processes, Services and Logs check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What number does a process use as its ID?',
        options: ['UID', 'PID', 'GID', 'TTL'],
        correctIndex: 1,
        explanation: 'A process is identified by its PID (process ID). UID is a user ID.',
      },
      {
        prompt: 'What does `kill -9` do?',
        options: [
          'Restarts the process',
          'Forces the process to stop immediately',
          'Asks it politely to stop',
          'Lists processes',
        ],
        correctIndex: 1,
        explanation: '`kill -9` force-stops a process at once, with no chance to clean up. Plain `kill` asks nicely first.',
      },
      {
        prompt: 'Which command shows whether a service is running?',
        options: ['`ls`', '`systemctl status <name>`', '`cat <name>`', '`pwd`'],
        correctIndex: 1,
        explanation: '`systemctl status <name>` reports whether a service is active and shows recent logs.',
      },
      {
        prompt: 'Where do login and sudo events usually get logged?',
        options: ['`/etc/passwd`', '`/var/log/auth.log`', '`/tmp`', '`/home`'],
        correctIndex: 1,
        explanation: '`/var/log/auth.log` (or `secure`) records logins and sudo use.',
      },
      {
        prompt: 'What does the cron line `0 2 * * *` mean?',
        options: ['Every 2 minutes', 'At 2:00 every day', 'On the 2nd only', 'Twice an hour'],
        correctIndex: 1,
        explanation: 'The fields are minute, hour, day, month, weekday - so minute 0 of hour 2, daily.',
      },
    ],
  },
];
