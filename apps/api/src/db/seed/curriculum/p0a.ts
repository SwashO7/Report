import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'start-here',
    title: 'Start Here',
    description:
      'Get oriented before you touch a single tool: what hacking actually is, the difference between a bounty and a court date, and the one consent rule that keeps you legal. By the end you can tell a white hat from a black hat, name the jobs security people get hired into, say exactly what you are allowed to test, and stand up a safe VM setup to break things in.',
    lessons: [
      {
        slug: 'what-is-hacking',
        title: 'What Hacking Actually Is (vs the Movies)',
        summary: 'It is not green text raining down a screen. It is curiosity plus patience.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Forget the hoodie and the three keyboards. Hacking is understanding how something works better than the people who built it, then making it do something it was never meant to do. Nothing more mystical than that.",
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, because "curiosity" on its own is a poster slogan. Every system is built on assumptions the builder made: "the price comes from our database, not the form", "only logged-in users reach this page", "nobody will send a negative quantity". A hacker\'s whole job is to find one assumption, ask "what if that is not true?", and test it. You are not breaking magic. You are finding the one input the builder forgot to check.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. A shopping site sends your order to the server as `item=1337&price=999`. The builder assumed the price field just reflects what their own page put there. So you intercept that request and change it to `price=1`. If the server trusts the number instead of re-checking it against the database, you just bought a phone for one rupee. No exotic tool - you changed one number in a request the site itself sent. The bug was the assumption, and you tested it.',
          },
          {
            type: 'paragraph',
            text:
              'Most real work looks like debugging at 2am with a cup of chai: read, make a guess, be wrong, adjust, try again. The tenth attempt is usually where it clicks. That loop - read, guess, test, note it down - is the entire craft, whether you are poking at a login page or reversing a firmware image.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Curiosity** - "what happens if I change this value?"',
              '**Patience** - the first nine tries fail, the tenth teaches you something',
              '**Note-taking** - you will forget which payload worked within the hour',
              '**Reading** - docs, error messages, and other people\'s writeups are where the ideas come from',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this matters from day one: if you go looking for a magic button, you will bounce off every real target. If you go looking for a broken assumption, you will start finding bugs on ordinary-looking apps that a scanner walked straight past. The mindset is the multiplier - tools only speed up a person who already knows what they are hunting for.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The real skill',
            text:
              'Nobody memorises every attack. Good hackers are good at *learning fast* and staying stubborn when something breaks. The specific bug you find next year has not been invented yet.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know what hacking really is - hunting broken assumptions, not typing fast. Everything else here builds on that.',
          },
          {
            type: 'quiz',
            question: 'Which one best describes real-world hacking?',
            options: [
              'Typing very fast on multiple keyboards',
              'Finding an assumption a system makes and testing what happens when it is false',
              'Guessing passwords until one works',
              'Downloading a tool that does everything for you',
            ],
            correctIndex: 1,
            explanation:
              'Hacking is about spotting the assumption a builder made and bending the system where that assumption breaks. Tools help, but the understanding is the job.',
          },
        ],
      },
      {
        slug: 'hacker-types-and-jobs',
        title: 'White Hat, Black Hat, and Who Actually Pays',
        summary: 'Same skills, very different outcomes. One buys you a career, one buys you a case.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The technical skills across all of these are nearly identical. The same person who commits a crime and the person who earns a salary can run the exact same command. What splits them is two words: permission and intent.',
          },
          {
            type: 'paragraph',
            text:
              'Think about what actually separates the labels. Permission is whether the owner said yes before you touched their system. Intent is what you meant to do with what you found - report it and get it fixed, or steal it and cause harm. Plot any hacker on those two axes and the "types" stop being a vibe and become a definition you can apply to a real situation.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the same action landing three different ways. You run a port scan against a server. Case one: it is a lab you own, so it is practice. Case two: it is a company that published a bug bounty program listing that server as in-scope, so it is professional recon and a step toward a payout. Case three: it is a random company\'s server you found on your phone, so it is a criminal offence under the IT Act. Identical packets on the wire. The only variable that changed was permission - and that variable decided everything.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**White hat** - hacks with permission, reports bugs, gets paid',
              '**Black hat** - hacks without permission, for theft or damage',
              '**Grey hat** - pokes around uninvited, then reports it (still illegal, still risky)',
              '**Red team / pentester** - white hat, hired to attack a target on purpose',
              '**Bug bounty hunter** - freelance white hat, paid per valid bug they report',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The good news is that the white-hat side is a real career, not a hobby with a halo. Companies genuinely want people who find their bugs before criminals do, because a bug you report costs them a fix and a bug a criminal finds costs them a breach. Pentesters are hired to attack on a schedule; bug bounty hunters get paid per valid finding on published programs. This whole platform exists to push you toward that side of the line.',
          },
          {
            type: 'paragraph',
            text:
              'Why care about the distinction beyond ethics? Because it is the thing that keeps your skills usable. A black hat burns every target once and lives one subpoena from the end of their career. A white hat can point tools at systems all day, build a public track record of findings, and get hired on the strength of it. Same skill set, wildly different shelf life.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Skills are neutral, choices are not',
            text:
              'The exact same port scan is professional recon on a target you are allowed to test, and a crime on one you are not. Nothing about the command tells you which - only the authorisation does.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell the hats apart by permission and intent, and name the actual jobs security people get hired into.',
          },
          {
            type: 'quiz',
            question: 'What is the real difference between a white hat and a black hat?',
            options: [
              'The tools they use',
              'Permission and intent',
              'Which operating system they run',
              'How fast they type',
            ],
            correctIndex: 1,
            explanation:
              'The skills overlap heavily. Permission and intent are what make one a career and the other a crime.',
          },
        ],
      },
      {
        slug: 'rules-of-the-game',
        title: 'The Rules: Law, Consent, and Not Going to Jail',
        summary: 'One rule matters more than all the tools combined: only test what you are allowed to test.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Here is the rule that outranks every technique in this course: you only touch systems you own, or that you have clear permission to test. No exceptions, no "I was only checking". Learn this before you learn anything that could break something.',
          },
          {
            type: 'paragraph',
            text:
              'The reason this is a hard rule and not friendly advice is the law itself. In India, unauthorised access to a computer resource is covered by the Information Technology Act, 2000 - primarily Section 43 (civil liability, damages) and Section 66 (the criminal offence). The wording that catches beginners is "accesses or secures access ... without permission of the owner". Notice what is missing from that sentence: any mention of damage. You do not have to break, steal, or change anything. The unauthorised access is the offence on its own.',
          },
          {
            type: 'paragraph',
            text:
              'Walk it through concretely. You find a login page for a company you do not work for. You think "I will just try a couple of common passwords to see if it is secure" - three attempts, you change nothing, you tell no one. Under the Act you have already secured access attempts without permission. "I did not cause harm" and "I was going to report it" are not defences to the access itself; at best they affect how seriously it is treated after the fact. The safe version of that same curiosity is to do it on a lab built for exactly this, where the owner has said yes in advance.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Your own machines and VMs - always fine, you are the owner',
              'Labs and CTFs built for hacking - permission is the entire point of them',
              'A bug bounty program - only the assets it lists, only within its stated rules',
              'Anything else - assume the answer is no, unless you have written permission that says otherwise',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For a defender or a hiring manager, this rule is also why you are trustworthy. A tester who understands scope is one they can point at production systems without fear. A tester who "just pokes around" is a liability, however talented. Respecting the line is not a limitation on the job - it is the thing that makes the job exist.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Read this twice',
            text:
              'Only test targets you own or are explicitly authorised to test. Everything you practice on this platform is on purpose-built labs where that permission already exists.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know exactly where the legal line sits - unauthorised access, not damage - and that staying inside it is what makes you employable.',
          },
          {
            type: 'quiz',
            question: 'You find a login page on a company you do not work for. What can you legally do?',
            options: [
              'Run a quick scan, it is only recon',
              'Try a few common passwords to see if it is secure',
              'Nothing without permission or an in-scope bounty program',
              'Test it as long as you do not break anything',
            ],
            correctIndex: 2,
            explanation:
              'No permission means no testing. Recon and "harmless" tries are still unauthorised access - the offence does not require any damage.',
          },
        ],
      },
      {
        slug: 'how-to-use-suraksha-labs',
        title: 'How to Actually Use This Platform',
        summary: 'Lessons, labs and quizzes work together. Here is how to get the most out of them.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'This platform is built to be done on your phone in short bursts. But the order you do things in changes how much sticks, so it is worth understanding the loop rather than clicking around at random.',
          },
          {
            type: 'paragraph',
            text:
              'The loop is deliberate: read a lesson, watch its video if it has one, take the quiz, then do the matching lab. Each step does a different job. The lesson gives you the mental model. The quiz forces you to actively recall it, which is what moves it from "I read that" to "I know that". The lab makes you use it under slightly real conditions, which is where you discover the parts you only *thought* you understood. Skip a step and you feel faster but retain less.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete pass. You do the Ports lesson: you learn that a port is a numbered door and 443 means HTTPS. The quiz asks you to identify a service from its port - now you have to retrieve it, not just recognise it. Then you open the Port Discovery lab and actually scan a target, and you see three unexpected open ports the lesson never mentioned. That gap between "four common ports" and "what this box is really running" is the exact thing the lab teaches that no amount of reading could.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Lessons** teach the idea and the mechanism, in a few minutes each',
              '**Quizzes** force active recall and award XP - they are a checkpoint, not a formality',
              '**Labs** are safe, broken-on-purpose apps you attack for real',
              '**XP and levels** track progress across everything so you can see the climb',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why the lab step is non-negotiable: reading about an attack and performing it are two different skills, and only the second one gets you hired or gets you a bounty. Employers do not ask what you have read. The lab is where theory becomes something you can actually do on demand, and that is the whole point of the platform existing instead of a PDF.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Do the labs',
            text:
              'Reading about SQL injection and doing it are two different skills. The labs are where it stops being theory and becomes something your hands know how to do.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know the lesson-quiz-lab loop, why each step matters, and how XP tracks your climb.',
          },
          {
            type: 'quiz',
            question: 'What is the best way to learn on this platform?',
            options: [
              'Read every lesson first, then start labs much later',
              'Skip lessons and only grind quizzes for XP',
              'Loop: read the lesson, take the quiz, then do the matching lab',
              'Watch the videos on 2x and never touch a lab',
            ],
            correctIndex: 2,
            explanation:
              'The lesson-quiz-lab loop turns theory into a skill. The lab step is where understanding is tested against something real.',
          },
        ],
      },
      {
        slug: 'your-hacking-setup',
        title: 'Your Setup: Laptop, VM, Browser',
        summary: 'You do not need a supercomputer. You need one VM, one browser, and a place to break things safely.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('The beginner hacking setup - a VM, a browser, and nothing fancy'),
          {
            type: 'paragraph',
            text:
              'You do not need a fancy rig. A normal laptop with 8GB of RAM is plenty to start. The one piece worth setting up properly is a virtual machine, and it is worth understanding what that actually is before you install one.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What a VM really is',
          },
          {
            type: 'paragraph',
            text:
              'A virtual machine is a whole computer running as software inside your real computer. A program called a hypervisor (VirtualBox or VMware) pretends to be hardware - a CPU, disk, network card - and a second operating system boots on top of that fake hardware, believing it is a real machine. Because it is only software, that guest system is walled off from your real one: files, processes and crashes inside the VM stay inside the VM. That wall is the entire reason you use one for security work.',
          },
          {
            type: 'paragraph',
            text:
              'The single feature that makes a VM special for hacking is snapshots. A snapshot freezes the exact state of the guest - disk and memory - to a file. Walk the workflow: you snapshot a clean Kali install, spend an hour installing tools and testing malware in a lab, something corrupts the system, and instead of a one-hour reinstall you restore the snapshot and you are back to the clean state in about ten seconds. You can break the VM on purpose, repeatedly, and it costs you nothing.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What to install',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A hypervisor** - VirtualBox (free) or VMware, to run the VMs',
              '**Kali Linux or Parrot** - a Linux distro pre-loaded with security tools',
              '**A modern browser** - Chrome or Firefox, mainly for its DevTools',
              '**A notes app** - anything you will actually keep open while you work',
            ],
          },
          {
            type: 'command',
            description: 'Inside your Linux VM, confirm what shell and kernel you landed on:',
            commands: ['uname -a', 'echo $SHELL'],
          },
          {
            type: 'paragraph',
            text:
              '`uname -a` prints one line with the kernel name, version and architecture - if you see `Linux kali 6.x ... x86_64` you are on a 64-bit Linux kernel, which is what you want. `echo $SHELL` prints the path of your login shell, usually `/bin/bash` or `/usr/bin/zsh`; that tells you which syntax the rest of the course\'s commands will run under. Neither command changes anything - they only report, which makes them safe first commands to get comfortable with.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Snapshots are your undo button',
            text:
              'Take a VM snapshot before you break something. If it goes wrong, roll back in seconds instead of reinstalling for an hour.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the minimum kit - a hypervisor, a security Linux, a browser - and why a VM with snapshots keeps your real machine safe.',
          },
          {
            type: 'practice_ref',
            title: 'Start Here check',
            exerciseSlug: 'start-here-quiz',
          },
          {
            type: 'quiz',
            question: 'Why run your hacking tools inside a virtual machine?',
            options: [
              'It makes your laptop faster',
              'It isolates experiments so a mistake does not wreck your real system',
              'It is required by law',
              'VMs cannot be hacked',
            ],
            correctIndex: 1,
            explanation:
              'A VM is a sandbox. You can break it, snapshot it, and roll back without touching your host machine.',
          },
        ],
      },
    ],
  },
  {
    slug: 'how-computers-communicate',
    title: 'How Computers Talk',
    description:
      'How machines find each other and hold a conversation: addresses at every layer, the ports that pick a service, and the two transport protocols that carry almost all traffic. By the end you can read an IP:port pair and say what is probably running there, explain the TCP handshake in three packets, describe how ARP glues IPs to hardware, and say why a UDP scan is slower and less certain than a TCP one.',
    lessons: [
      {
        slug: 'what-is-a-computer-network',
        title: 'What Is a Network, Really?',
        summary: 'A network is just computers that can talk to each other. That is the whole idea.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('What is a network - explained without the textbook nonsense'),
          {
            type: 'image',
            src: '/api/v1/diagrams/network-basics',
            alt: 'Laptop to home router to ISP to web server, four hops',
            caption: 'Your data takes the same path an attacker would use.',
          },
          {
            type: 'paragraph',
            text:
              'A network is just computers that can talk to each other. That is it. Your phone talking to the Wi-Fi router is a network. Add the whole planet and you get the internet. Everything else in this module is detail hung on that one idea.',
          },
          {
            type: 'paragraph',
            text:
              'For any two devices to talk, three things must exist, and every one of them will matter later when something breaks. First, a way to find each other - an address, so a reply knows where to go back to. Second, a shared language - a protocol, an agreed set of rules for what the bytes mean. Third, a physical path - the cables, fibre and radio waves carrying the signal. Miss any one and there is no conversation: an address with no path is a phone number for a disconnected line; a path with no shared protocol is two people shouting in languages neither speaks.',
          },
          {
            type: 'paragraph',
            text:
              'The diagram above walks a real request. You load a website on your laptop. Hop one, your data goes to your home router. Hop two, the router hands it to your ISP. Hop three, the ISP carries it across the internet to the web server. The server sends the page back down the same chain in reverse. That picture matters because an attacker studies the exact same hops - each one is a place traffic can be watched, redirected, or blocked.',
          },
          {
            type: 'paragraph',
            text:
              'The other idea to lock in now is client and server. The client is whoever asks - your phone requesting a page. The server is whoever answers - the machine holding the website. It is not a permanent title: your laptop is a client when it loads a site and a server when it shares a file. Every single interaction on a network is one side asking and another side answering.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**LAN** - a small local network, like your home or office',
              '**WAN** - a large network spanning distance, the internet being the biggest',
              '**Client** - the device asking for something (your phone)',
              '**Server** - the device answering (the website)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker cares about this from the start: every attack is a manipulation of that ask-and-answer conversation. You either pose as the client and send something the server did not expect, pose as the server and answer with something the client trusts, or sit on the path in the middle and read or alter what goes by. If you cannot describe the normal conversation, you cannot spot the abnormal one - which is why this deceptively simple lesson is the foundation for all of it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Everything is a conversation',
            text:
              'Loading a website is your device asking a question and a server answering. Every hack starts by understanding that conversation well enough to disturb it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain what a network is in one sentence, name the three things every conversation needs, and point at the client-server pair behind every request.',
          },
          {
            type: 'quiz',
            question: 'What three things do two devices need to communicate?',
            options: [
              'A password, a cable, and a browser',
              'An address, a shared protocol, and a path between them',
              'The same operating system',
              'A router made by the same company',
            ],
            correctIndex: 1,
            explanation:
              'They need to find each other (address), speak the same language (protocol), and have a route (path). Remove any one and the conversation cannot happen.',
          },
        ],
      },
      {
        slug: 'ip-addresses',
        title: "IP Addresses: The Internet's Home Addresses",
        summary: 'Every device online needs an address so replies know where to come back to.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'An IP address is the home address of a device on a network. When you ask for a website, the reply has to know where to come back to, and your IP is that return address. No IP, no reply - the server would have your question and nowhere to send the answer.',
          },
          {
            type: 'paragraph',
            text:
              'Look at the format, because it is not random. An IPv4 address is four numbers separated by dots, like `142.250.72.14`, and each number is one byte - so it runs 0 to 255 and never higher. That is why `999.1.1.1` is instantly, obviously fake: 999 does not fit in a byte. Four bytes give about 4.3 billion possible addresses, which sounded infinite in the 1980s and ran out years ago. That shortage is the entire reason IPv6 exists, with much longer addresses like `2405:200:1630::1` written in hex - enough to give every grain of sand its own address and then some.',
          },
          {
            type: 'paragraph',
            text:
              'The distinction that trips up beginners is public versus private. Walk it concretely. Your laptop at home has a private IP like `192.168.1.5` - an address that only means something inside your house and that ranges reserved for private use (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) are set aside for. It is not reachable from the internet; two different homes can both use `192.168.1.5` with no clash. Meanwhile your whole house shares one public IP that the internet actually sees, handed to you by your ISP. And `127.0.0.1` is a special case that always means "this very machine" - traffic to it never leaves the box.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Public IP** - your address on the whole internet, visible to any server you talk to',
              '**Private IP** - your address inside your home network, like `192.168.1.5`, not routable outside',
              '**Localhost** - `127.0.0.1`, always means "this machine", never touches the network',
            ],
          },
          {
            type: 'command',
            description: 'Find both of your own addresses - the private one your device holds and the public one the world sees:',
            commands: ['ip addr', 'curl ifconfig.me'],
          },
          {
            type: 'paragraph',
            text:
              '`ip addr` lists every network interface and its address; look for a line like `inet 192.168.1.5/24` under your Wi-Fi interface - that is your private IP, and the `/24` is the subnet, covered soon. `curl ifconfig.me` asks a remote server "what address did my request arrive from?" and prints the answer, which is your public IP. If those two numbers are different - and they almost always are - you are looking at NAT in action: many private addresses hiding behind one public one, which is a whole lesson of its own shortly.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to an attacker or defender: the first job of recon is figuring out what address actually belongs to the target, because a private IP is only reachable if you are already inside that network. Hit a `192.168.x.x` from the outside and you get nothing - it is not routable. Knowing which addresses are public, which are private, and that localhost never leaves the machine keeps you from wasting hours attacking an address that could never have answered you in the first place.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two addresses at once',
            text:
              'Your laptop has a private IP inside your home and shares one public IP with every other device on your Wi-Fi. The gap between them is NAT, coming up shortly.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read an IPv4 address, spot a fake one, and tell a public address from a private one and from localhost.',
          },
          {
            type: 'practice_ref',
            title: 'IP addresses check',
            exerciseSlug: 'ip-addresses-quiz',
          },
          {
            type: 'quiz',
            question: 'What does the address 127.0.0.1 always refer to?',
            options: ['Your router', 'The nearest DNS server', 'This machine (localhost)', 'A public web server'],
            correctIndex: 2,
            explanation: '127.0.0.1 is localhost - it always points back at the device you are on, and traffic to it never leaves the machine.',
          },
        ],
      },
      {
        slug: 'mac-addresses-and-arp',
        title: 'MAC Addresses and ARP',
        summary: 'Below IP there is a hardware address burned into every network card, and ARP is how they get matched up.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('MAC addresses and ARP - the layer below IP that nobody explains'),
          {
            type: 'image',
            src: '/api/v1/diagrams/arp-request',
            alt: 'A machine broadcasting who has this IP and one device replying',
            caption: 'ARP is a shout with no verification - which is the whole problem.',
          },
          {
            type: 'paragraph',
            text:
              'IP addresses can change - your laptop gets a different one at a cafe than at home. But every network card ships with a permanent hardware address called a MAC address, set at the factory. Think of the IP as your current flat, which changes when you move, and the MAC as your fingerprint, which does not.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the part almost nobody explains: on your local network, devices do not actually deliver data using IP addresses at all. The final handoff, machine to machine on the same wire or Wi-Fi, happens using MAC addresses. IP is how the internet routes toward the right neighbourhood; MAC is how the last step reaches the exact device. So there has to be a translation step - a way to start with "I know the IP `192.168.1.1`" and end with "and its MAC is `a4:83:e7:1c:9f:20`". That translation is ARP, the Address Resolution Protocol.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one ARP exchange, which the diagram above shows. Your laptop wants to send something to `192.168.1.1` (the router) but only knows its IP. It shouts to the entire local network: "Who has `192.168.1.1`? Tell me your MAC." Every device hears it; all but one ignore it. The router replies directly: "That is me, my MAC is `a4:83:e7:1c:9f:20`." Your laptop saves that answer in a short-term table called the ARP cache so it does not have to shout again for a while, and now it can address the actual frame. Done - except for one detail that becomes a whole attack later.',
          },
          {
            type: 'paragraph',
            text:
              'That detail: ARP has no verification whatsoever. When a reply arrives saying "that IP is at this MAC", your machine simply believes it and updates its cache. There is no check that the replier is telling the truth. Any device on the network can answer "I am `192.168.1.1`" and your laptop will start sending the router\'s traffic to the liar instead. That is ARP spoofing, and this naive trust is why it works - but you only attack it on networks you are authorised to test.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**MAC address** - looks like `a4:83:e7:1c:9f:20`, six bytes, tied to the hardware',
              '**ARP** - the question "who has IP X? tell me your MAC" and the reply to it',
              '**ARP cache** - the short-lived IP-to-MAC table your device remembers between lookups',
            ],
          },
          {
            type: 'command',
            description: 'See the IP-to-MAC answers your own machine has already learned and cached:',
            commands: ['ip neigh', 'arp -a'],
          },
          {
            type: 'paragraph',
            text:
              'Both commands print your ARP cache - the mappings your device figured out via ARP. `ip neigh` is the modern Linux form and shows lines like `192.168.1.1 dev wlan0 lladdr a4:83:e7:1c:9f:20 REACHABLE`: the IP, the interface, the MAC (`lladdr`), and a state. `arp -a` is the older cross-platform form that also works on Windows. If you ever see two different IPs mapped to the *same* MAC, or your router\'s IP suddenly pointing at an unfamiliar MAC, that is exactly the fingerprint of an ARP spoofing attack in progress.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'ARP trusts everyone',
            text:
              'ARP has no way to check if an answer is honest. That naivety is exactly what ARP spoofing abuses, and it only works because the cache believes whatever replies last.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know the difference between a MAC and an IP, how ARP resolves one to the other on a LAN, and why its blind trust is a weakness.',
          },
          {
            type: 'quiz',
            question: 'What does ARP do?',
            options: [
              'Encrypts traffic on the network',
              'Maps an IP address to a MAC address on the local network',
              'Assigns IP addresses to new devices',
              'Routes packets across the internet',
            ],
            correctIndex: 1,
            explanation:
              'ARP answers "which MAC address has this IP?" so devices on the same LAN can complete the final handoff to the right hardware.',
          },
        ],
      },
      {
        slug: 'ports',
        title: 'Ports: One Machine, Many Doors',
        summary: 'An IP gets you to the building. A port gets you to the right flat.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('Ports explained in 5 minutes - and why hackers scan them first'),
          {
            type: 'image',
            src: '/api/v1/diagrams/ip-and-ports',
            alt: 'One IP address with numbered ports listed beside it',
            caption: 'The IP finds the machine. The port finds the service.',
          },
          {
            type: 'paragraph',
            text:
              'One server can run a website, a database and a mail service all at once. Same IP address, so how does incoming data know which of the three it is for? Ports. A port is a number from 0 to 65535 that picks the specific service on a machine.',
          },
          {
            type: 'paragraph',
            text:
              'The analogy that actually holds: the IP is the building address and the port is the flat number. `142.250.72.14:443` means "that building, flat 443", and flat 443 is where the HTTPS service lives. The mechanism behind it is that each listening program tells the operating system "send me anything that arrives for port 443". When a packet comes in, the OS reads the destination port off it and hands the data to whichever program claimed that number. That is the whole routing decision - a lookup by port number.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete arrival. A packet reaches `142.250.72.14` with destination port 443. The OS checks its table of listening programs, sees the web server registered for 443, and delivers the bytes there. A second packet arrives for port 3306; the OS routes it to the MySQL database instead. Same machine, same IP, two packets, two different programs - decided entirely by the number after the colon. Ports below 1024 are "well-known" and reserved for standard services, which is why the same numbers mean the same things almost everywhere.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**22** - SSH, remote shell',
              '**53** - DNS, name lookups',
              '**80** - HTTP, plain web',
              '**443** - HTTPS, encrypted web',
              '**3306** - MySQL',
              '**3389** - Windows remote desktop',
            ],
          },
          {
            type: 'command',
            description: 'See which doors are open on your own machine right now:',
            commands: ['ss -tuln', 'netstat -an'],
          },
          {
            type: 'paragraph',
            text:
              'In the `ss -tuln` output each row is a socket the OS is listening on. The flags mean TCP (`-t`), UDP (`-u`), listening only (`-l`), and numeric - do not resolve names (`-n`), which keeps it fast and readable. Read the `Local Address:Port` column: a row ending `:22` is SSH waiting for connections, `:443` is a web server. An address of `0.0.0.0:443` means it accepts connections from any network, while `127.0.0.1:3306` means the database only listens to the local machine - a meaningful security difference. `netstat -an` shows the same information in the older cross-platform format.',
          },
          {
            type: 'paragraph',
            text:
              'This is where recon begins for an attacker, and where hardening begins for a defender. Every open port is a program listening, and every listening program is code that can have bugs - so the list of open ports is literally the list of ways in. The first thing anyone does against a target is scan its ports to build that list. A forgotten debug service left listening on 8080, or a database exposed on `0.0.0.0` instead of localhost, is exactly the kind of open door that turns into an incident.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Every open port is a promise',
            text:
              'An open port means software is listening. Software listens, software has bugs. That forgotten debug service on 8080 has ruined more than one weekend.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read `IP:port`, say what is probably running there, and read a listening-sockets list. That is step one of every scan you will ever do.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'practice_ref',
            title: 'Ports check',
            exerciseSlug: 'ports-quiz',
          },
          {
            type: 'quiz',
            question: 'You see a service on port 443. What is it most likely?',
            options: ['A MySQL database', 'An HTTPS web server', 'An SSH shell', 'A DNS resolver'],
            correctIndex: 1,
            explanation: '443 is the standard HTTPS port. MySQL is 3306, SSH is 22, DNS is 53.',
          },
        ],
      },
      {
        slug: 'tcp-and-udp',
        title: 'TCP vs UDP',
        summary: 'Two ways to move data: one confirms every delivery, one throws it and moves on. The choice explains scanning, spoofing and stuttering calls.',
        estimatedMinutes: 9,
        importance: 'essential',
        blocks: [
          videoSlot('TCP vs UDP - why your video call stutters but your download never corrupts'),
          {
            type: 'paragraph',
            text:
              'IP gets a packet to the right machine. It does not promise the packet arrives, arrives once, or arrives in order. Something has to sit on top and decide how much it cares. That is TCP and UDP, and almost every service you will ever touch picks one of them.',
          },
          { type: 'heading', level: 3, text: 'TCP: nothing moves until both sides agree' },
          {
            type: 'paragraph',
            text:
              'TCP is connection-oriented, which means it refuses to send your data until a connection exists. It builds one with the three-way handshake: your machine sends a **SYN** ("I want to talk, my starting sequence number is 4000"), the server replies **SYN-ACK** ("fine, mine is 9000, and I acknowledge 4001"), and you send **ACK** ("acknowledged 9001"). Only now does data flow.',
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/tcp-handshake',
            alt: 'SYN, SYN-ACK, ACK exchanged between client and server',
            caption: 'Three packets before a single byte of your data moves.',
          },
          {
            type: 'paragraph',
            text:
              'Those sequence numbers are the whole trick. Every byte TCP sends is numbered, and the receiver acknowledges what it has. Say you download a 5 MB file as roughly 3,500 packets and packet 1,204 vanishes into a dead Wi-Fi moment. The receiver keeps acknowledging 1,203, your machine notices the missing acknowledgement, and re-sends only that packet. The receiver then slots it into place before handing the file to your browser. You get every byte, in order, or the connection fails loudly. That is why a download either completes or errors, and never quietly corrupts.',
          },
          { type: 'heading', level: 3, text: 'UDP: fire it and forget it' },
          {
            type: 'paragraph',
            text:
              'UDP has no handshake, no sequence numbers, no acknowledgements and no connection. You hand it a datagram with a destination port and it goes. If it arrives, lovely. If it does not, nobody retries and nobody tells you. If two datagrams arrive out of order, UDP hands them over out of order.',
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/tcp-vs-udp',
            alt: 'TCP confirming each packet beside UDP sending without confirmation',
            caption: 'Left: every packet confirmed and re-sent if lost. Right: no confirmations at all.',
          },
          {
            type: 'paragraph',
            text:
              'That sounds broken until you are on a video call. A frame of video from 300 milliseconds ago is worthless - by the time TCP finished re-sending it, the conversation has moved on and everyone is talking over each other. UDP drops the frame, you see a brief smear, and the call stays live. The application decides what loss means instead of the transport layer deciding for it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**TCP** - HTTP/HTTPS (80, 443), SSH (22), SMTP (25), MySQL (3306). Anything where a missing byte ruins the result.',
              '**UDP** - DNS (53), DHCP (67/68), NTP (123), most voice and video, most gaming.',
              '**DNS uses both** - UDP for normal small lookups, TCP when the answer is too big for one datagram or for zone transfers.',
              '**QUIC** (behind HTTP/3) runs reliability *on top of* UDP, because it wanted TCP guarantees without TCP handshake latency.',
            ],
          },
          {
            type: 'command',
            description: 'Watch both on your own machine. The first two list listening sockets by protocol; the third makes a TCP connection, the fourth a UDP query:',
            commands: ['ss -tln', 'ss -uln', 'curl -sS -o /dev/null -w "%{http_code}\\n" https://example.com', 'dig +short example.com'],
          },
          {
            type: 'paragraph',
            text:
              'In the `ss` output, `-t` is TCP and `-u` is UDP, and the TCP rows say `LISTEN` while the UDP rows say `UNCONN` - unconnected, because UDP has no connection state to be in. That single word is the difference made visible. On Windows use `netstat -an -p tcp` and `netstat -an -p udp` instead.',
          },
          { type: 'heading', level: 3, text: 'Why an attacker cares' },
          {
            type: 'paragraph',
            text:
              'Port scanning works because TCP is talkative. Send a SYN to a closed TCP port and you get a **RST** back; send it to an open one and you get SYN-ACK. Either way the port told you the truth, which is why TCP scans are fast and reliable. Send a UDP datagram and an open port usually says nothing at all, and a closed one *may* return an ICMP port-unreachable that firewalls often drop. Silence therefore means "open, or filtered, or the reply got eaten" - so UDP scans are slow, need retries, and are the usual place a real service hides from a lazy scan.',
          },
          {
            type: 'paragraph',
            text:
              'The missing handshake has a second consequence: because UDP never verifies who it is talking to, you can forge the source address. That is the foundation of reflection and amplification abuse, where a small spoofed DNS or NTP query produces a large reply aimed at the victim. TCP resists this precisely because the handshake forces the sender to prove it can receive.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not trust an empty UDP scan',
            text:
              'A UDP port reported as `open|filtered` is not a clean bill of health - it means the scanner learned nothing. Re-scan with a service probe before you conclude anything is closed.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can name which transport a service uses, explain the handshake in three packets, and say why a TCP scan is trustworthy while a UDP scan is a maybe.',
          },
          {
            type: 'quiz',
            question: 'A UDP port scan reports "open|filtered". What does that actually tell you?',
            options: [
              'The port is definitely open',
              'The port is definitely closed',
              'Nothing conclusive - no reply came back, and silence has several possible causes',
              'The service is encrypted',
            ],
            correctIndex: 2,
            explanation:
              'UDP has no handshake, so an open port usually stays silent and a closed one may only reply with ICMP that firewalls drop. No reply means undetermined, not closed.',
          },
        ],
      },
      {
        slug: 'packets-and-encapsulation',
        title: 'Packets: How Data Gets Wrapped',
        summary: 'Your data does not travel in one lump. It is chopped into packets, each wrapped in layers of address labels.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('Packets and encapsulation - how one message becomes a hundred labelled envelopes'),
          {
            type: 'image',
            src: '/api/v1/diagrams/encapsulation',
            alt: 'Your data nested inside TCP, IP and Ethernet layers',
            caption: 'Each layer is an envelope around the one above it.',
          },
          {
            type: 'paragraph',
            text:
              'Your data does not zoom across the internet as one big blob. It gets chopped into small chunks called packets, and each packet is wrapped in layers of labels so every part of the network knows what to do with it. Understanding those layers is what lets you read captured traffic instead of staring at it.',
          },
          {
            type: 'paragraph',
            text:
              'Encapsulation is the wrapping process, and the diagram above shows it as nested envelopes. Start with the thing you actually want to send - say the text `GET /login`. As it goes down the stack, each layer adds its own header in front, like putting a letter inside progressively bigger envelopes. The transport layer adds a TCP or UDP header saying which port. The network layer wraps that in an IP header saying which machine. The link layer wraps that in an Ethernet frame saying which device on the local wire. Nothing rewrites the data - each layer only adds a label around everything below it.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real packet built end to end. Your browser wants to send `GET /login` to a web server at `142.250.72.14`. TCP wraps it with a header marked destination port 443, so the far side knows it is web traffic. IP wraps that with source `192.168.1.5` and destination `142.250.72.14`, so routers know where to carry it. Ethernet wraps that with your MAC and the router\'s MAC, so it reaches the right device on your LAN. The finished packet is `[Ethernet [IP [TCP [GET /login]]]]`. At the other end the server unwraps it in reverse - strip Ethernet, strip IP, strip TCP - and hands `GET /login` to its web software. Every hop reads only the layer it needs and leaves the rest sealed.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Your actual data (the message, e.g. `GET /login`)',
              'A TCP or UDP header (which port / service)',
              'An IP header (which machine, source and destination)',
              'An Ethernet frame (which device on the local wire, by MAC)',
            ],
          },
          {
            type: 'command',
            description: 'Capture a few live packets on your own machine to see the layers for real (needs sudo; press Ctrl-C to stop):',
            commands: ['sudo tcpdump -c 5 -n -v'],
          },
          {
            type: 'paragraph',
            text:
              'Each line `tcpdump` prints is one packet with its layers peeled apart for you. You will see the IP layer as `192.168.1.5 > 142.250.72.14` (source, then destination), the transport layer as a port and flags like `Flags [S]` for a TCP SYN, and lengths for each part. The `-c 5` caps it at five packets so it stops on its own, `-n` skips slow name lookups, and `-v` adds detail. Reading this output is exactly reading encapsulation in reverse - the tool is unwrapping the envelopes and showing you what each header said.',
          },
          {
            type: 'paragraph',
            text:
              'This is why packet analysis is a core skill for both sides. A defender reads captured packets to see exactly what an attacker sent - the precise bytes, not a guess. An attacker reads them to understand a protocol nobody documented, or to spot a value worth tampering with. Because each layer is a clean, separate header, tools like Wireshark and tcpdump can show you any one of them in isolation - and once you can read the layers, "what did this system actually say on the wire?" stops being a mystery.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why hackers care',
            text:
              'Tools like Wireshark let you unwrap every layer of a captured packet. Reading those layers is how you understand exactly what a system said, byte for byte.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know data travels as packets, each wrapped layer by layer, and you can name the layers and read them back off a capture.',
          },
          {
            type: 'practice_ref', title: 'How Computers Talk check', exerciseSlug: 'network-basics-quiz',
          },
          {
            type: 'quiz',
            question: 'What is encapsulation?',
            options: [
              'Encrypting a packet so nobody can read it',
              'Wrapping data in successive headers (TCP/UDP, IP, Ethernet) as it goes down the stack',
              'Splitting one file across many servers',
              'Compressing data to make it smaller',
            ],
            correctIndex: 1,
            explanation:
              'Each layer adds its own header around the data - port info, then IP, then the local frame. That layered wrapping is encapsulation.',
          },
        ],
      },
    ],
  },
  {
    slug: 'finding-things-on-the-internet',
    title: 'Finding Things on the Internet',
    description:
      'How a name you can remember becomes a machine your packet can reach, and how that packet finds its way across the world. By the end you can resolve a domain and read its records, explain why your IP starts with 192.168 and how NAT shares one public address, tell a router from a switch from a firewall, read a subnet mask, and run ping and traceroute as your first two recon moves.',
    lessons: [
      {
        slug: 'dns',
        title: "DNS: The Internet's Contact List",
        summary: 'Nobody memorises IP addresses. DNS turns names you can remember into addresses machines can use.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('DNS explained - how google.com becomes an IP address in milliseconds'),
          {
            type: 'image',
            src: '/api/v1/diagrams/dns-resolution',
            alt: 'Browser asking a resolver, which asks root, then .com, then the site nameserver',
            caption: 'A name becomes an address in about four questions.',
          },
          {
            type: 'paragraph',
            text:
              "You type `google.com`, not `142.250.72.14`, because humans remember names and machines route by numbers. DNS is the system that translates one into the other. It is the internet's contact list, and it runs before almost every connection you make.",
          },
          {
            type: 'paragraph',
            text:
              'The part worth understanding is that no single computer knows every name on the internet - the job is split up in a tree, and the diagram above traces it. Your browser asks a resolver (usually your ISP\'s or something like `8.8.8.8`) "what is the IP for `google.com`?". If the resolver does not already have it cached, it asks the root servers, who say "I do not know, but here is who handles `.com`". It asks the `.com` servers, who say "I do not know the address, but here is Google\'s own nameserver". It asks that nameserver, which finally answers `142.250.72.14`. The resolver caches the answer and hands it back. Four questions, and it happens in a fraction of a second.',
          },
          {
            type: 'paragraph',
            text:
              'Walk what actually comes back. The answer is not just an address - it is a record of a specific type. Ask for the `A` record of `google.com` and you get an IPv4 address. Ask for the `MX` record and you get the mail server that handles email for the domain. That typing matters: an attacker who wants to know where a company reads its email asks for `MX`, and DNS hands it over without any login, because DNS answers are public by design.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A record** - a name to an IPv4 address',
              '**AAAA record** - a name to an IPv6 address',
              '**MX record** - where email for a domain should be delivered',
              '**CNAME** - "this name is an alias that points at that other name"',
            ],
          },
          {
            type: 'command',
            description: 'Resolve a domain yourself and read what comes back:',
            commands: ['dig google.com', 'nslookup google.com'],
          },
          {
            type: 'paragraph',
            text:
              'In the `dig` output, look for the `ANSWER SECTION` - that is the real result. A line like `google.com. 210 IN A 142.250.72.14` reads left to right as: the name, the time-to-live in seconds (how long it may be cached, here 210), the class `IN` for internet, the record type `A`, and the address. Try `dig google.com MX` and you will see mail-server names instead. `nslookup` gives you the same answer in a simpler layout and works on Windows too. Nothing here is privileged - you are asking the same public questions any recon tool asks.',
          },
          {
            type: 'paragraph',
            text:
              'This is why recon almost always starts at DNS. Its records quietly reveal a target\'s mail servers, its subdomains (`vpn.company.com`, `dev.company.com`, `admin.company.com`), and often the third-party services it relies on - all without touching the company\'s actual servers or tripping an alarm. A defender cares for the same reason in reverse: a stray DNS record pointing at an old, forgotten server is a classic way in, and pruning them is basic hygiene.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'DNS is a recon goldmine',
            text:
              'DNS records quietly reveal mail servers, subdomains and infrastructure, and querying them touches no login. That is why recon almost always starts here.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know DNS resolves names to IPs through a tree of servers, and you can read the common record types off a `dig` answer.',
          },
          {
            type: 'related_lesson', lessonSlug: 'ip-addresses', title: 'Recap: IP Addresses',
          },
          {
            type: 'quiz',
            question: 'What does DNS do?',
            options: [
              'Encrypts your web traffic',
              'Translates a domain name into an IP address',
              'Blocks malicious websites',
              'Assigns your device its IP',
            ],
            correctIndex: 1,
            explanation: 'DNS resolves human-friendly names into the IP addresses machines actually connect to, asking a tree of servers when it does not already have the answer cached.',
          },
        ],
      },
      {
        slug: 'dhcp-and-nat',
        title: 'DHCP and NAT: Why Your IP Is 192.168.x.x',
        summary: 'Your device did not choose its address, and your public IP is shared. Two quiet systems make that work.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('DHCP and NAT - why every device in your house has a 192.168 address'),
          {
            type: 'image',
            src: '/api/v1/diagrams/nat',
            alt: 'Three private devices behind a router sharing one public IP',
            caption: 'Many private addresses hide behind one public one.',
          },
          {
            type: 'paragraph',
            text:
              'You never typed your laptop\'s IP address, yet it has one. And every device in your home shares a single public IP with the outside world. Two systems make that happen quietly in the background: DHCP hands out the local addresses, and NAT lets them all share one public one.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'DHCP hands out addresses',
          },
          {
            type: 'paragraph',
            text:
              'When your phone joins Wi-Fi, it has no address yet, so it shouts on the local network "does anyone give out addresses?". Your router\'s DHCP service answers and leases it one - say `192.168.1.7` - along with the details it needs to actually use the network: the gateway to send outside traffic to, and the DNS resolver to ask for names. It is like the society gate register: you arrive, they assign you a visitor slot and tell you which lift to use, and the slot is yours for a while (a "lease") before it has to be renewed.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'NAT shares one public IP',
          },
          {
            type: 'paragraph',
            text:
              'Now everything in your house has a private address, but only one public IP faces the internet. NAT (Network Address Translation) sits at the router and does the juggling. Walk it through: your laptop `192.168.1.7` requests a website. The router rewrites the outgoing packet\'s source to the public IP and notes in a table "laptop:port 51000 is waiting for this reply". The reply comes back to the public IP; the router checks its table, sees it belongs to the laptop, rewrites the destination back to `192.168.1.7`, and delivers it. Your phone doing the same thing at the same time gets a different table entry, so the two never get confused.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**DHCP** - automatically leases private IPs (plus gateway and DNS) to devices as they join',
              '**NAT** - rewrites addresses at the router so many private devices share one public IP',
              '**Private ranges** - `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x` are reserved for local use and are not routable on the internet',
            ],
          },
          {
            type: 'command',
            description: 'See the private address DHCP gave you and the gateway it pointed you at:',
            commands: ['ip route', 'ipconfig'],
          },
          {
            type: 'paragraph',
            text:
              '`ip route` prints how your machine reaches other networks. The key line starts with `default via 192.168.1.1 dev wlan0 src 192.168.1.7`: `default via` is your gateway - the router NAT runs on, and where every packet for the outside world goes first - and `src` is the private address DHCP leased you. On Windows, `ipconfig` shows the same pair as "Default Gateway" and "IPv4 Address". Seeing `192.168.1.1` as the gateway and `192.168.1.7` as your address is DHCP and NAT made visible in two numbers.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters for testing: NAT is why you cannot simply reach a device inside someone\'s home network from outside - there is no public address that points straight at it, only the shared one at the router. It is a side-effect firewall, not a designed one, but it shapes every external attack. From inside a network, though, all those private addresses are directly reachable, which is exactly why gaining a foothold on one internal machine is so valuable: NAT stops mattering the moment you are behind it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why 192.168?',
            text:
              'Ranges like `192.168.x.x` and `10.x.x.x` are reserved for private networks and are not routable on the internet, which is exactly why NAT is needed to reach the outside world.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know why your IP starts with 192.168, how DHCP leases it, and how NAT lets a whole house share one public address.',
          },
          {
            type: 'quiz',
            question: 'What does NAT do?',
            options: [
              'Assigns private IPs to new devices',
              'Lets many private devices share one public IP address',
              'Encrypts traffic leaving your router',
              'Resolves domain names to IPs',
            ],
            correctIndex: 1,
            explanation:
              'NAT rewrites addresses at the router so multiple private devices share a single public IP. DHCP is the separate system that assigns the private IPs.',
          },
        ],
      },
      {
        slug: 'routers-switches-firewalls',
        title: 'Routers, Switches, Firewalls',
        summary: 'Three boxes with three jobs: connect networks, connect devices, and decide what gets through.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'People lump all network boxes together as "the internet thing blinking in the corner", but three of them do genuinely different jobs. Get these straight now and network diagrams stop looking like a plate of spaghetti.',
          },
          {
            type: 'paragraph',
            text:
              'The cleanest way to keep them apart is by the question each one answers. A switch answers "which device on *this* network do I hand this to?" and it decides using MAC addresses, so it works purely inside one local network - think of it as the internal wiring connecting the flats in one building. A router answers "which *network* do I forward this toward?" and decides using IP addresses, so it connects different networks together and picks the path between them - it is the gateway from your building out to the city. A firewall answers a different kind of question entirely: "is this traffic allowed at all?", and it enforces rules about what may pass.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one packet to see all three. Your laptop sends a request to a website. The switch inside your home moves the frame from your laptop to the router by MAC address. The firewall (built into that router) checks its rules and, since outbound web traffic is allowed, lets it through. The router then looks at the destination IP, sees it is not local, and forwards it toward the internet, choosing the next hop. Three boxes, three decisions, one packet - and in a home they are all crammed into the single plastic box from your ISP. Enterprises split them into separate dedicated hardware.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Switch** - connects devices *inside* one network using MAC addresses. The internal wiring of one building',
              '**Router** - connects *different* networks and chooses the path, using IP addresses. The gateway to the internet',
              '**Firewall** - the security guard; allows or blocks traffic based on rules, regardless of where it is headed',
            ],
          },
          {
            type: 'command',
            description: 'Ask your own machine which router it uses as its way out:',
            commands: ['ip route show default', 'route print'],
          },
          {
            type: 'paragraph',
            text:
              'The output names your default gateway - the router every packet bound for another network is handed to first. A line like `default via 192.168.1.1 dev wlan0` means "for anything not on my local network, send it to `192.168.1.1`". That address is the router doing its connect-different-networks job. On Windows, `route print` shows the same thing under the `0.0.0.0` destination row. Knowing your gateway is step one of understanding the shape of any network you are on.',
          },
          {
            type: 'paragraph',
            text:
              'For attacking and defending, the firewall is the one that changes how you read everything else. A firewall can silently drop your packets, which makes a perfectly alive host look completely dead to a scan. So when a scan comes back empty, the honest reading is not "nothing is there" but "nothing answered me" - a firewall may be swallowing the replies. Knowing which of the three boxes you are up against, and that one of them is designed to lie to you by staying silent, is what separates a careful tester from one who trusts their tools too much.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Firewalls shape your scans',
            text:
              'A firewall can make a live host look dead by silently dropping your packets. Knowing one is there changes how you read a scan result.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell a switch, a router and a firewall apart by the job each does, and find your own gateway.',
          },
          {
            type: 'quiz',
            question: 'Which device connects two different networks and chooses the path between them?',
            options: ['A switch', 'A router', 'A firewall', 'A hub'],
            correctIndex: 1,
            explanation:
              'Routers connect separate networks and route traffic between them using IP addresses. Switches work inside one network by MAC; firewalls filter traffic by rules.',
          },
        ],
      },
      {
        slug: 'subnetting-lite',
        title: 'Subnet Masks Without the Maths Panic',
        summary: 'A subnet mask just splits an IP into "which network" and "which device". No panic required.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'image',
            src: '/api/v1/diagrams/subnet-mask',
            alt: 'An IP split into a network part and a host part',
            caption: 'The mask just marks where the network stops and hosts begin.',
          },
          {
            type: 'paragraph',
            text:
              'Subnetting scares beginners because people teach it with binary tables first. Skip that for now. Here is the plain version: a subnet mask tells you which part of an IP address is the *network* and which part is the individual *device*. That is the whole job.',
          },
          {
            type: 'paragraph',
            text:
              'The diagram shows an IP split into those two parts, and the mask is what draws the line. Take `192.168.1.7` with mask `255.255.255.0`. Line them up: wherever the mask shows `255`, that piece of the IP is the network; wherever it shows `0`, that piece is the device. So `255.255.255.0` says the first three numbers - `192.168.1` - are the network, and the last number - `7` - is the device on it. Every machine that shares `192.168.1` is on the same local network and can talk directly, without going through a router.',
          },
          {
            type: 'paragraph',
            text:
              'You will more often see the mask written as a slash number, and it means the same thing. `/24` means "the first 24 bits are the network", and since each of the four IP numbers is 8 bits, 24 bits is exactly the first three numbers - so `/24` and `255.255.255.0` are two ways of writing the identical split. A `/16` (that is `255.255.0.0`) fixes only the first two numbers as the network, leaving a much bigger range of devices. Bigger network part, fewer devices per network; smaller network part, more devices. Walk it: `192.168.1.7/24` puts `192.168.1.1` through `192.168.1.254` on one network, and `192.168.2.7` is a different network entirely.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`/24` = mask `255.255.255.0` = first three numbers are the network, up to 254 devices',
              '`/16` = mask `255.255.0.0` = first two numbers are the network, a much larger range',
              'Same network number means two devices can talk directly, with no router in between',
            ],
          },
          {
            type: 'command',
            description: 'See your own IP and its mask together - the /number after the address is the mask:',
            commands: ['ip addr show', 'ipconfig'],
          },
          {
            type: 'paragraph',
            text:
              'In `ip addr show`, find your Wi-Fi interface and read the line `inet 192.168.1.7/24`. That `/24` is your subnet mask in slash form - it tells you your network is `192.168.1.x` and there could be up to 254 machines sharing it. On Windows, `ipconfig` prints the mask separately as `Subnet Mask . . . 255.255.255.0`, the same `/24` written the long way. Reading that one number tells you the size and shape of the network you are sitting on.',
          },
          {
            type: 'paragraph',
            text:
              'Why a tester cares: the mask tells you how many neighbours you might have. On a `/24` you know there are at most 254 possible hosts on your segment, so a sweep of `192.168.1.1-254` will find every live machine near you. Read the mask wrong and you either miss half the network or waste time scanning a range that cannot exist. It is the difference between "scan the right 254 addresses" and "guess".',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why it matters for hacking',
            text:
              'Knowing the subnet tells you how many machines might be nearby to scan. A `/24` is up to 254 hosts on the same segment - a bounded, scannable list.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can read a subnet mask in both forms and say which part of an IP is the network - no binary panic.',
          },
          {
            type: 'quiz',
            question: 'With mask 255.255.255.0, which part of 192.168.1.7 is the network?',
            options: ['Just 192', '192.168', '192.168.1', 'The whole thing'],
            correctIndex: 2,
            explanation:
              'A /24 mask (255.255.255.0) makes the first three numbers the network, so 192.168.1 is the network and 7 is the host.',
          },
        ],
      },
      {
        slug: 'traceroute-and-ping',
        title: 'Ping and Traceroute: Your First Recon',
        summary: 'Two ancient commands answer the first two questions of any recon: is it alive, and how do I reach it?',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('ping and traceroute - your first two recon commands, explained'),
          {
            type: 'image',
            src: '/api/v1/diagrams/traceroute-hops',
            alt: 'Packets with increasing TTL revealing each router along the path',
            caption: 'Each hop reveals itself by letting the packet expire.',
          },
          {
            type: 'paragraph',
            text:
              'Before any fancy tool, two commands answer the two most basic questions about a target: is this host even alive, and what path does my traffic take to reach it? Those are `ping` and `traceroute`, and they have barely changed in decades because they still work.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'ping - is it alive?',
          },
          {
            type: 'paragraph',
            text:
              'Ping sends a tiny ICMP "echo request" packet that means "are you there?" and starts a stopwatch. If the host is up and willing, it sends back an "echo reply" and ping prints how long the round trip took. So a reply tells you two things at once: the host is reachable, and roughly how far away it is in time. A time of 2ms is basically next door; 300ms is likely across the planet or through something slow.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'traceroute - how do I get there?',
          },
          {
            type: 'paragraph',
            text:
              'Traceroute lists every router hop between you and the target, like reading the stations on a railway route. Its trick is clever: every packet carries a TTL ("time to live") counter that each router decreases by one, and when it hits zero that router throws the packet away and sends back an error naming itself. So traceroute sends a packet with TTL 1 (dies at the first router, which reveals itself), then TTL 2 (dies at the second), and so on - each deliberately-expiring packet forces the next router in line to announce its address. The diagram above shows exactly that: increasing TTL peeling back one hop at a time.',
          },
          {
            type: 'command',
            description: 'Run your first recon against a host you are allowed to test:',
            commands: ['ping -c 4 example.com', 'traceroute example.com', 'tracert example.com'],
          },
          {
            type: 'paragraph',
            text:
              '`ping -c 4` sends four probes then stops (drop the `-c` on Windows, which pings four times by default). Read the `time=` value on each reply for latency and the summary line for packet loss - `0% packet loss` is a healthy, reachable host. In `traceroute` output, each numbered line is one hop, showing that router\'s address and the time to reach it; a line of `* * *` means that hop did not reply (often a firewall), which is normal and not a failure. On Windows the command is `tracert`. Together they answer "is it up?" and "what is between us?".',
          },
          {
            type: 'paragraph',
            text:
              'The habit to build early is treating silence as inconclusive, not as "dead". Plenty of hosts and firewalls drop ping on purpose, so a host that never replies may be perfectly alive and simply ignoring you - concluding "offline" from ping alone is a classic beginner mistake that makes you skip real targets. Traceroute is where you also spot where traffic slows to a crawl or gets blocked entirely, which tells a defender where a bottleneck or a filtering device sits, and tells an attacker where the network\'s edges are.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Silence is not death',
            text:
              'Many hosts block ping. No reply does not mean the host is down - it may just be ignoring you. Never conclude "dead" from ping alone.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can check whether a host is reachable, read its latency, and trace the router path to it - the first moves of real recon.',
          },
          {
            type: 'practice_ref',
            title: 'Finding Things on the Internet check',
            exerciseSlug: 'dns-quiz',
          },
          {
            type: 'quiz',
            question: 'A host does not reply to ping. What can you safely conclude?',
            options: [
              'It is definitely offline',
              'Nothing certain - it may be up but blocking ping',
              'The network is down',
              'Your internet is broken',
            ],
            correctIndex: 1,
            explanation:
              'Plenty of hosts drop ping on purpose, so no reply is inconclusive. You check other ways before deciding a host is down.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'your-hacking-setup',
    slug: 'start-here-quiz',
    title: 'Start Here check',
    instructions: 'Four quick ones on the ground rules. Get three right and you are clear to continue.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What makes security testing legal?',
        options: [
          'Not causing any damage',
          'Permission from the system owner, in writing or via a published policy',
          'Testing only at night',
          'Reporting the bug afterwards',
        ],
        correctIndex: 1,
        explanation: 'Authorisation is the whole thing. No permission means no legal testing, however careful you are and however good your intentions.',
      },
      {
        prompt: 'A company publishes a vulnerability disclosure policy listing its domains. What does that give you?',
        options: [
          'Permission to test anything the company owns',
          'Permission to test what the policy lists, within the rules it sets',
          'Nothing, you still need an email reply first',
          'Permission to test their vendors too',
        ],
        correctIndex: 1,
        explanation: 'A policy is standing permission for exactly what it names. Anything outside that scope, including third-party vendors, is not covered.',
      },
      {
        prompt: 'Why run your tools in a virtual machine rather than your main OS?',
        options: [
          'Tools run faster in a VM',
          'It keeps messy tooling and untrusted files isolated from your real data',
          'It is required by law',
          'VMs cannot be traced',
        ],
        correctIndex: 1,
        explanation: 'A VM is a sandbox you can throw away. It protects your own machine and keeps your testing environment reproducible.',
      },
      {
        prompt: 'Which best describes what a security researcher actually does most of the day?',
        options: [
          'Typing fast on a black screen while text scrolls',
          'Reading how a system works, then patiently testing where its assumptions break',
          'Running one tool that finds all bugs automatically',
          'Guessing passwords',
        ],
        correctIndex: 1,
        explanation: 'It is mostly reading, note-taking and methodical testing. The dramatic part is the movie version.',
      },
    ],
  },
  {
    lessonSlug: 'packets-and-encapsulation',
    slug: 'network-basics-quiz',
    title: 'How Computers Talk check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is a network, in the simplest terms?',
        options: [
          'A single powerful computer',
          'Computers that can talk to each other',
          'A type of firewall',
          'The physical Wi-Fi router only',
        ],
        correctIndex: 1,
        explanation: 'A network is just devices able to communicate with each other. Scale it up and you get the internet.',
      },
      {
        prompt: 'What is the job of an IP address?',
        options: [
          'To encrypt your traffic',
          'To identify a device so replies find their way back',
          'To store your passwords',
          'To speed up downloads',
        ],
        correctIndex: 1,
        explanation: 'An IP address is the location of a device on a network so data knows where to go and come back.',
      },
      {
        prompt: 'On a local network, what does ARP resolve?',
        options: [
          'A domain name to an IP',
          'An IP address to a MAC address',
          'A port to a service',
          'A public IP to a private IP',
        ],
        correctIndex: 1,
        explanation: 'ARP maps an IP to the hardware MAC address so devices on the same LAN can reach each other.',
      },
      {
        prompt: 'Which protocol is reliable and confirms delivery?',
        options: ['UDP', 'TCP', 'ARP', 'DNS'],
        correctIndex: 1,
        explanation: 'TCP confirms and re-sends. UDP is fast but does not confirm delivery.',
      },
      {
        prompt: 'What is encapsulation?',
        options: [
          'Encrypting each packet',
          'Wrapping data in layered headers (TCP/UDP, IP, Ethernet)',
          'Compressing a file before sending',
          'Splitting traffic across two routers',
        ],
        correctIndex: 1,
        explanation: 'Each layer adds its own header around the data as it travels down the stack. That layered wrapping is encapsulation.',
      },
    ],
  },
  {
    lessonSlug: 'ip-addresses',
    slug: 'ip-addresses-quiz',
    title: 'IP addresses check',
    instructions: 'Four quick ones. Get three right and you have got IPs down.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which of these is a valid IPv4 address?',
        options: ['142.250.72.14', '999.1.1.1', 'google.com', 'a4:83:e7:1c:9f:20'],
        correctIndex: 0,
        explanation: 'IPv4 is four numbers, each 0 to 255. 999 is out of range, google.com is a name, and the last is a MAC address.',
      },
      {
        prompt: 'What does 127.0.0.1 mean?',
        options: ['Your router', 'This machine (localhost)', 'A public DNS server', 'An invalid address'],
        correctIndex: 1,
        explanation: '127.0.0.1 is localhost and always points back at the device you are on.',
      },
      {
        prompt: 'Which is a private IP address?',
        options: ['142.250.72.14', '8.8.8.8', '192.168.1.5', '1.1.1.1'],
        correctIndex: 2,
        explanation: '192.168.x.x is a private range used inside home and office networks.',
      },
      {
        prompt: 'Why do IPv6 addresses exist?',
        options: [
          'They are faster than IPv4',
          'The world ran out of short IPv4 addresses',
          'They are more secure by default',
          'They replace DNS',
        ],
        correctIndex: 1,
        explanation: 'IPv6 exists mainly because the pool of IPv4 addresses was too small for the number of devices.',
      },
    ],
  },
  {
    lessonSlug: 'ports',
    slug: 'ports-quiz',
    title: 'Ports check',
    instructions: 'Four quick ones. Get three right and ports are yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is the full port range?',
        options: ['0-255', '0-1023', '0-65535', '1-1000000'],
        correctIndex: 2,
        explanation: 'Ports are 16-bit numbers, so 0 through 65535.',
      },
      {
        prompt: 'Which port is standard for HTTPS?',
        options: ['22', '80', '443', '3306'],
        correctIndex: 2,
        explanation: '443 is HTTPS. 80 is plain HTTP, 22 is SSH, 3306 is MySQL.',
      },
      {
        prompt: 'What does an open port tell an attacker?',
        options: [
          'Nothing useful',
          'Software is listening there, which is a potential way in',
          'The machine is offline',
          'The port is encrypted',
        ],
        correctIndex: 1,
        explanation: 'An open port means a service is listening, and every listening service is a possible attack surface.',
      },
      {
        prompt: 'In 142.250.72.14:443, what is 443?',
        options: ['The IP address', 'The port', 'The MAC address', 'The subnet'],
        correctIndex: 1,
        explanation: 'The part after the colon is the port - the specific door on that machine.',
      },
    ],
  },
  {
    lessonSlug: 'tcp-and-udp',
    slug: 'tcp-and-udp-quiz',
    title: 'TCP vs UDP check',
    instructions: 'Four quick ones. Get three right and you can pick the right protocol every time.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which protocol confirms every packet was delivered?',
        options: ['UDP', 'TCP', 'ARP', 'DNS'],
        correctIndex: 1,
        explanation: 'TCP is the reliable one - it confirms and re-sends lost packets.',
      },
      {
        prompt: 'Why do live video calls prefer UDP?',
        options: [
          'UDP encrypts the call',
          'Speed matters more than re-sending a lost frame',
          'TCP does not work over Wi-Fi',
          'UDP never loses packets',
        ],
        correctIndex: 1,
        explanation: 'For live media, staying real-time beats waiting to re-send. UDP skips confirmations to stay fast.',
      },
      {
        prompt: 'A large file download should use which protocol?',
        options: ['UDP', 'TCP', 'Either, it makes no difference', 'ARP'],
        correctIndex: 1,
        explanation: 'A single missing byte can corrupt a file, so downloads use reliable TCP.',
      },
      {
        prompt: 'Which statement is true?',
        options: [
          'UDP guarantees ordered, complete delivery',
          'TCP is faster because it does less work',
          'TCP is reliable and ordered; UDP is fast and unconfirmed',
          'TCP and UDP are the same thing',
        ],
        correctIndex: 2,
        explanation: 'TCP trades speed for reliability and order; UDP trades reliability for speed.',
      },
    ],
  },
  {
    lessonSlug: 'dns',
    slug: 'dns-quiz',
    title: 'Finding Things on the Internet check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does DNS translate?',
        options: [
          'IP addresses into MAC addresses',
          'Domain names into IP addresses',
          'Ports into services',
          'Private IPs into public IPs',
        ],
        correctIndex: 1,
        explanation: 'DNS turns human-friendly names like google.com into the IP addresses machines connect to.',
      },
      {
        prompt: 'What does DHCP do?',
        options: [
          'Assigns IP addresses to devices automatically',
          'Encrypts your traffic',
          'Resolves domain names',
          'Blocks malicious sites',
        ],
        correctIndex: 0,
        explanation: 'DHCP leases out IP addresses to devices when they join a network, no manual setup needed.',
      },
      {
        prompt: 'What is NAT responsible for?',
        options: [
          'Naming devices on the network',
          'Letting many private devices share one public IP',
          'Encrypting DNS lookups',
          'Assigning MAC addresses',
        ],
        correctIndex: 1,
        explanation: 'NAT rewrites addresses so multiple private devices share a single public IP.',
      },
      {
        prompt: 'Which device connects two different networks and chooses the path?',
        options: ['A switch', 'A router', 'A firewall', 'A DNS server'],
        correctIndex: 1,
        explanation: 'Routers connect separate networks and route traffic between them.',
      },
      {
        prompt: 'A host does not reply to ping. What does that tell you?',
        options: [
          'It is definitely offline',
          'Nothing certain - it may be up but blocking ping',
          'Your DNS is broken',
          'The port is closed',
        ],
        correctIndex: 1,
        explanation: 'Many hosts drop ping on purpose, so no reply is inconclusive.',
      },
    ],
  },
];
