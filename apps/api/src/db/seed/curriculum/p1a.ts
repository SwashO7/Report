import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'terminal-survival',
    title: 'Terminal Survival',
    description: 'Move, read and search a Linux box from the command line without panic.',
    lessons: [
      {
        slug: 'terminal-basics',
        title: 'Terminal Basics',
        summary: 'The black box is just a text way to tell the computer what to do.',
        estimatedMinutes: 5,
        importance: 'essential',
        blocks: [
          videoSlot('The Linux terminal in 5 minutes - stop being scared of the black box'),
          {
            type: 'paragraph',
            text:
              'The terminal is just a place where you type a command and the computer does it. No clicking, no menus. Once you get past the "it looks scary" phase, it is faster than any GUI you have used.',
          },
          {
            type: 'paragraph',
            text:
              'That blinking bit is the prompt. It usually shows your username, the machine and where you are, then waits. You type, press Enter, it runs. That is the whole loop.',
          },
          {
            type: 'command',
            description: 'Three commands that tell you who and where you are:',
            commands: ['whoami', 'hostname', 'pwd'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`whoami` - which user you are logged in as',
              '`hostname` - the name of this machine',
              '`pwd` - "print working directory", the folder you are sitting in',
              '`clear` - wipe the screen when it gets messy (nothing is deleted)',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The up arrow is your best friend',
            text:
              'Press the up arrow to bring back the last command you ran. Keep pressing it to walk back through history. You will use this a thousand times a day.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can open a terminal, read the prompt, and run your first commands. That is the door every hacker walks through.',
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
        estimatedMinutes: 6,
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
              'A Linux filesystem is one big tree. It all starts at `/`, the root, and everything else hangs off it. Home folders, config, logs - all branches of the same tree.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a building. `/` is the ground, `/home` is the residents floor, and `/home/you` is your own flat. `cd` walks you between rooms, `ls` shows what is inside.',
          },
          {
            type: 'command',
            description: 'The three moves you will make constantly:',
            commands: ['ls -la', 'cd /home', 'cd ..'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`ls` - list what is in this folder; `ls -la` shows hidden files and details',
              '`cd folder` - go into that folder',
              '`cd ..` - go up one level',
              '`cd ~` - jump straight to your home folder',
              '`cd -` - jump back to the last folder you were in',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Absolute vs relative paths',
            text:
              'A path starting with `/` is absolute - it works from anywhere. A path without it is relative to where you are standing. Mix these up and you will "lose" files that are right there.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can move anywhere in a Linux system and see what is there. No more getting lost in the tree.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('cat, less, nano - read and edit files in the terminal like a pro'),
          {
            type: 'paragraph',
            text:
              'Half of hacking is reading files - configs, logs, source code, notes someone left lying around. The terminal has a tool for every situation, from a quick peek to a full edit.',
          },
          {
            type: 'command',
            description: 'Read a file three different ways:',
            commands: ['cat notes.txt', 'less /var/log/syslog', 'head -n 20 config.ini'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`cat file` - dump the whole thing to the screen (fine for short files)',
              '`less file` - scroll a big file page by page; press `q` to quit',
              '`head` / `tail` - the first or last lines; `tail -f` follows a live log',
              '`nano file` - a simple editor; `Ctrl+O` saves, `Ctrl+X` exits',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'tail -f is the log watcher',
            text:
              'Run `tail -f` on a log file and it keeps printing new lines as they arrive. Perfect for watching what an app does the moment you poke it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can open, read and edit any text file from the terminal - and pick the fast tool for the job.',
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
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('find and grep - the two commands that locate anything on a Linux box'),
          {
            type: 'paragraph',
            text:
              'You will constantly need to find a file whose name you half-remember, or hunt for a word - like `password` - buried inside a pile of configs. `find` finds files. `grep` finds text.',
          },
          {
            type: 'command',
            description: 'find files by name, grep for text inside them:',
            commands: [
              'find /etc -name "*.conf"',
              'grep -r "password" /etc',
              'grep -i "error" app.log',
            ],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`find <where> -name "<pattern>"` - locate files by name',
              '`grep "<text>" <file>` - print lines that contain the text',
              '`grep -r` - search recursively through every file in a folder',
              '`grep -i` - ignore upper/lower case',
              '`grep -n` - show the line numbers of matches',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The classic first move on a new box',
            text:
              'Landed on a machine and want quick wins? `grep -ri "password" .` in a config folder has ended more challenges than any fancy exploit.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only search and read files on machines you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can find any file by name and any word inside any file. That is real recon on a live system.',
          },
          {
            type: 'quiz',
            question: 'You want every line containing "error" in `app.log`, case-insensitive. Which command?',
            options: [
              '`find app.log -name error`',
              '`grep -i "error" app.log`',
              '`cat error app.log`',
              '`grep -v "error" app.log`',
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
        estimatedMinutes: 7,
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
              'This is where the terminal beats every GUI. You take the output of one command and feed it straight into the next. Small tools, snapped together, become one powerful line.',
          },
          {
            type: 'paragraph',
            text:
              'The pipe `|` passes output along. Redirection with `>` and `>>` sends output into a file instead of the screen. That is the whole trick, and it never stops being useful.',
          },
          {
            type: 'command',
            description: 'Pipe output into another command, then save it to a file:',
            commands: [
              'cat access.log | grep "404" | wc -l',
              'ls -la > listing.txt',
              'echo "note" >> log.txt',
            ],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`a | b` - send the output of `a` into `b`',
              '`> file` - write output to a file (overwrites it)',
              '`>> file` - append output to the end of a file',
              '`wc -l` - count lines; great at the end of a pipe',
              '`sort` and `uniq` - order lines and squash duplicates',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'One arrow overwrites, two append',
            text:
              '`>` wipes the file and writes fresh. `>>` adds to the end. Use the wrong one on an important file and it is gone - there is no undo.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can chain commands with pipes and save results to files. This is the superpower that makes the terminal worth learning.',
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
    description: 'Read `-rwxr-xr-x` at a glance and understand why it decides who can do what.',
    lessons: [
      {
        slug: 'files-and-permissions',
        title: 'Files and Permissions',
        summary: 'Every file says who can read, write and run it. Learn to read that.',
        estimatedMinutes: 7,
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
              'Every file on Linux carries a small label saying who is allowed to read it, change it, or run it. That label is the difference between "locked door" and "come on in", so hackers read it first.',
          },
          {
            type: 'paragraph',
            text:
              'Run `ls -l` and you see something like `-rwxr-xr-x`. It looks like line noise until you know it splits into three groups: what the **owner** can do, what the **group** can do, and what **everyone else** can do.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`r` - read the file',
              '`w` - write to / change the file',
              '`x` - execute (run) the file, or enter a folder',
              '`-` in a slot means that permission is off',
              'Order is always the same: **owner**, then **group**, then **others**',
            ],
          },
          {
            type: 'command',
            description: 'Look at the permissions on files in the current folder:',
            commands: ['ls -l', 'ls -la /etc'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The first character is the type',
            text:
              'Before the permissions sits one character: `-` is a normal file, `d` is a directory, `l` is a symbolic link. So `drwxr-xr-x` is a folder, not a file.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can look at `-rwxr-xr-x` and instantly say who can read, write and run a file. That is a core survival skill on any box.',
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
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('chmod and chown - change file permissions and ownership with confidence'),
          {
            type: 'paragraph',
            text:
              'Two commands run this show. `chmod` changes the permissions (read/write/execute). `chown` changes who owns the file. Together they decide exactly who can touch what.',
          },
          {
            type: 'paragraph',
            text:
              'You can set permissions with numbers. Each slot adds up: read is 4, write is 2, execute is 1. So `7` is all three, `5` is read plus execute. `chmod 755` means owner gets 7, group and others get 5.',
          },
          {
            type: 'command',
            description: 'Change permissions and view ownership:',
            commands: ['chmod 755 script.sh', 'chmod +x tool.sh', 'ls -l script.sh'],
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
              '`777` means anyone can read, write and run it. Convenient, and a gift to an attacker. When you see it on a real system, that is often where the story begins.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can change what a file allows and who owns it. You now control the locks, not just read them.',
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
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('SUID, SGID and the sticky bit - the permission bits that lead to root'),
          {
            type: 'paragraph',
            text:
              'On top of read/write/execute, Linux has a few special bits. They look small in an `ls -l`, but one of them - SUID - is a classic path from "normal user" to "root".',
          },
          {
            type: 'paragraph',
            text:
              'A SUID program runs with the permissions of its owner, not the user who launched it. If root owns a SUID program and it has a bug, a normal user can borrow root powers. That is why hunters look for them.',
          },
          {
            type: 'command',
            description: 'Hunt for SUID files on a system:',
            commands: ['find / -perm -4000 -type f 2>/dev/null'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SUID** - the program runs as its owner (shows as `s` in the owner slot)',
              '**SGID** - runs as its group instead',
              '**Sticky bit** - on a folder, only the owner of a file can delete it (see it on `/tmp`)',
              'An `s` where you expected `x` is the flag to notice',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why /tmp is safe-ish',
            text:
              'Everyone can write to `/tmp`, so why is it not chaos? The sticky bit. You can drop files there, but you cannot delete other people\'s files.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only hunt SUID binaries and test privilege paths on machines you own or are authorised to test.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Linux users and processes - see who is logged in and what they are running'),
          {
            type: 'paragraph',
            text:
              'A Linux box is a shared flat. Several users can be on it at once, and every running program belongs to some user. Knowing who is who tells you what damage each one could do.',
          },
          {
            type: 'paragraph',
            text:
              'Users are listed in `/etc/passwd` (readable by everyone, despite the name - it holds no passwords). Each user has an ID number; user `0` is always root, the one that can do anything.',
          },
          {
            type: 'command',
            description: 'See users and running processes:',
            commands: ['whoami', 'id', 'cat /etc/passwd', 'ps aux'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`id` - your user ID, group, and which groups you belong to',
              '`/etc/passwd` - the list of accounts on the box',
              'UID `0` = root; anyone with UID 0 has full power',
              '`ps aux` - every running process and who owns it',
              '`w` / `who` - who is currently logged in',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the owner column',
            text:
              'In `ps aux`, the first column is the user running each process. A process running as root is a bigger prize than one running as `www-data`.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can list the users on a box and see which user each process is running as. That is how you size up a system fast.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('sudo and root explained - borrow superpowers without living as root'),
          {
            type: 'paragraph',
            text:
              'Root is the god account: it can read any file, kill any process, change anything. Living as root full time is dangerous, so you stay a normal user and borrow root power for one command with `sudo`.',
          },
          {
            type: 'paragraph',
            text:
              'When you run `sudo something`, the system checks a rules file (`/etc/sudoers`) to see if you are allowed, asks your password once, then runs that single command as root. Cleaner and safer than logging in as root.',
          },
          {
            type: 'command',
            description: 'Borrow root for one command and check what you are allowed:',
            commands: ['sudo whoami', 'sudo -l', 'cat /etc/passwd'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`sudo cmd` - run one command as root',
              '`sudo -l` - list exactly what sudo will let you run (gold for recon)',
              '`sudo whoami` should print `root` if it worked',
              'Sudo access is often logged, so it is not invisible',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Misconfigured sudo is a privesc goldmine',
            text:
              'If `sudo -l` shows you can run one wrong program as root - even something as innocent as an editor or `find` - that is often a full ladder to root. It is one of the first things a hunter checks.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test sudo rules and privilege paths on machines you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand root, how `sudo` lends its power, and why `sudo -l` is the first thing worth running on a new box.',
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
    description: 'Find what is running on a box, what runs in the background, and what it left behind.',
    lessons: [
      {
        slug: 'processes-and-signals',
        title: 'Processes and Signals',
        summary: 'Every running program is a process. Signals are how you talk to them.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Linux processes and signals - list, inspect and kill anything running'),
          {
            type: 'paragraph',
            text:
              'Every program that is running is a process, and each one gets an ID number - the PID. When you want to inspect or stop a program, you talk to it by its PID.',
          },
          {
            type: 'paragraph',
            text:
              'You control processes by sending signals. The famous one is "kill", but it is really just "please stop". There is a polite version and a force-quit version, and knowing the difference saves you.',
          },
          {
            type: 'command',
            description: 'List processes, then stop one by its PID:',
            commands: ['ps aux', 'top', 'kill 1234', 'kill -9 1234'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`ps aux` - a snapshot of every process and its PID',
              '`top` (or `htop`) - a live, updating view of what is busy',
              '`kill <pid>` - ask a process to shut down cleanly',
              '`kill -9 <pid>` - force it to stop right now, no cleanup',
              '`pgrep name` - find the PID of a process by name',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Try the polite kill first',
            text:
              'Plain `kill` lets a program save and clean up. `kill -9` is the sledgehammer - use it only when the polite version is ignored, or you risk corrupting its data.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can list what is running, read its PID, and stop it cleanly or forcefully. Basic control over any Linux box.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('systemd and services - control the background programs on any Linux server'),
          {
            type: 'paragraph',
            text:
              'A server does not have someone sitting there running programs by hand. Web servers, databases and SSH all run as services - background programs that start on boot and keep going. On most Linux, `systemd` manages them.',
          },
          {
            type: 'paragraph',
            text:
              'Services are exactly what an attacker cares about: each running service is a door, and every door is a chance to get in. So the first question on any box is "what services are running here?".',
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
            type: 'list',
            ordered: false,
            items: [
              '`systemctl status <name>` - is it running, and recent log lines',
              '`systemctl list-units --type=service` - every service on the box',
              '`systemctl start` / `stop` / `restart` - control a service (needs root)',
              '`systemctl enable` - make it start on boot',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Services map to ports',
            text:
              'A running web service means an open web port. Line up `systemctl` output against the open ports you found and you start to understand what the machine actually does.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can list a server\'s background services and check whether each one is running. That is how you learn what a box is for.',
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
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Linux logs and journalctl - read the diary every system quietly keeps'),
          {
            type: 'paragraph',
            text:
              'Systems write down almost everything they do - logins, errors, services starting, requests coming in. That diary lives mostly in `/var/log`, and on `systemd` machines you also read it with `journalctl`.',
          },
          {
            type: 'paragraph',
            text:
              'Logs cut both ways. For a defender, they are evidence. For an attacker, they leak usernames, paths, versions and mistakes. Either way, whoever reads the logs first has the advantage.',
          },
          {
            type: 'command',
            description: 'Read logs from files and from the journal:',
            commands: [
              'ls /var/log',
              'tail -f /var/log/auth.log',
              'journalctl -u ssh --no-pager',
            ],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`/var/log/auth.log` (or `secure`) - logins and sudo use',
              '`/var/log/syslog` - the general system diary',
              '`journalctl -u <service>` - logs for one specific service',
              '`journalctl -f` - follow new log entries live',
              'Pipe logs through `grep` to find the one line that matters',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Logs are where defenders catch you',
            text:
              'Every failed login and odd request can land in a log. On a real engagement, assume someone reads these. As a beginner, learning to read them is how you learn what a system is doing.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can open a system\'s logs, follow them live, and grep for the event you care about. This is the detective skill.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('cron jobs explained - scheduled tasks and why hackers love them'),
          {
            type: 'paragraph',
            text:
              'Some jobs need to run on their own - a backup at 2am, a cleanup every hour. `cron` is the built-in alarm clock that runs commands on a schedule, without anyone logging in.',
          },
          {
            type: 'paragraph',
            text:
              'A cron entry is five time fields then a command: minute, hour, day of month, month, day of week. `0 2 * * *` means "2:00 every day". Once you can read that line, the schedule stops looking like a puzzle.',
          },
          {
            type: 'command',
            description: 'See scheduled jobs for your user and the system:',
            commands: ['crontab -l', 'ls /etc/cron.d', 'cat /etc/crontab'],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`crontab -l` - list the current user\'s scheduled jobs',
              '`/etc/crontab` and `/etc/cron.d/` - system-wide jobs',
              'Five fields: minute, hour, day-of-month, month, day-of-week',
              '`*` means "every" - `* * * * *` runs every minute',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A cron job running as root is a target',
            text:
              'If a scheduled job runs as root and you can edit the script it calls, you can make root run your code on the next tick. Checking cron is a standard privesc step.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only inspect and test scheduled jobs on machines you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can read a cron schedule, list scheduled jobs, and see why an attacker checks them early.',
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
