import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'start-here',
    title: 'Start Here',
    description: 'Get oriented, get legal, and get a working setup before you touch anything.',
    lessons: [
      {
        slug: 'what-is-hacking',
        title: 'What Hacking Actually Is (vs the Movies)',
        summary: 'It is not green text raining down a screen. It is curiosity plus patience.',
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('What hacking really is - and why it is nothing like the movies'),
          {
            type: 'paragraph',
            text:
              "Forget the hoodie and the three keyboards. Hacking is just understanding how something works better than the people who built it, and then making it do something it was not supposed to do.",
          },
          {
            type: 'paragraph',
            text:
              'Most real hacking is reading, testing a guess, being wrong, and trying again. It looks less like an action scene and more like debugging code at 2am with a cup of chai.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Curiosity** - "what happens if I change this?"',
              '**Patience** - the tenth attempt is where it clicks',
              '**Note-taking** - you will forget what worked in an hour',
              '**Reading** - docs, errors, other people\'s writeups',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The real skill',
            text:
              'Nobody memorises every attack. Good hackers are good at *learning fast* and staying stubborn when something breaks.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know what hacking really is - a mindset, not a movie. Everything else here builds on that.',
          },
          {
            type: 'quiz',
            question: 'Which one best describes real-world hacking?',
            options: [
              'Typing very fast on multiple keyboards',
              'Understanding a system deeply and making it behave unexpectedly',
              'Guessing passwords until one works',
              'Downloading a tool that does everything for you',
            ],
            correctIndex: 1,
            explanation:
              'Hacking is about understanding how something works and bending it. Tools help, but the understanding is the job.',
          },
        ],
      },
      {
        slug: 'hacker-types-and-jobs',
        title: 'White Hat, Black Hat, and Who Actually Pays',
        summary: 'Same skills, very different outcomes. One buys you a career, one buys you a case.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('White hat vs black hat - who gets paid and who gets arrested'),
          {
            type: 'paragraph',
            text:
              'The technical skills are almost identical. What separates them is permission and intent. That single line decides whether you get a bounty or a court date.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**White hat** - hacks with permission, reports bugs, gets paid',
              '**Black hat** - hacks without permission, for theft or damage',
              '**Grey hat** - pokes around uninvited, then reports it (still illegal, still risky)',
              '**Red team / pentester** - white hat, hired to attack on purpose',
              '**Bug bounty hunter** - freelance white hat, paid per valid bug',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The good news: the jobs are real and they pay. Companies **want** people who can find their bugs before criminals do. That is the whole point of this platform.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Skills are neutral, choices are not',
            text:
              'The exact same port scan is professional recon on a target you are allowed to test, and a crime on one you are not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell the hats apart and name the actual jobs security people get hired into.',
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
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('The one rule that keeps hackers out of jail - consent and scope'),
          {
            type: 'paragraph',
            text:
              'Here is the rule that outranks every technique in this course: you only touch systems you own, or that you have clear written permission to test. No exceptions, no "just checking".',
          },
          {
            type: 'paragraph',
            text:
              'In India, unauthorised access is covered by the IT Act, and "I was only looking" is not a defence. A scan against a random company website is not practice - it is an offence.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Your own machines and VMs - always fine',
              'Labs and CTFs built for hacking - that is what they are for',
              'A bug bounty program - only inside its stated scope',
              'Anything else - assume no, unless you have written permission',
            ],
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Read this twice',
            text:
              'Only test targets you own or are explicitly authorised to test. Everything you practice here is on purpose-built labs.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know exactly where the legal line is - and that keeping inside it is what makes you employable.',
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
              'No permission means no testing. Recon and "harmless" tries are still unauthorised access.',
          },
        ],
      },
      {
        slug: 'how-to-use-suraksha-labs',
        title: 'How to Actually Use This Platform',
        summary: 'Lessons, labs and quizzes work together. Here is how to get the most out of them.',
        estimatedMinutes: 4,
        importance: 'optional',
        blocks: [
          videoSlot('How to get the most out of Suraksha Labs - lessons, labs and XP'),
          {
            type: 'paragraph',
            text:
              'This platform is built to be done on your phone in short bursts. Read a lesson, watch the video, take the quiz, then get your hands dirty in a lab. That loop is the whole trick.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Lessons** teach the idea in about 6 minutes',
              '**Quizzes** check you actually got it and give you XP',
              '**Labs** are safe, broken-on-purpose apps to attack for real',
              '**XP and levels** track your progress across everything',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Do the labs',
            text:
              'Reading about SQL injection and doing it are two different skills. The labs are where it stops being theory.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know the lesson-quiz-lab loop and how XP tracks your climb.',
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
              'The lesson-quiz-lab loop turns theory into a skill. Labs are where it actually sticks.',
          },
        ],
      },
      {
        slug: 'your-hacking-setup',
        title: 'Your Setup: Laptop, VM, Browser',
        summary: 'You do not need a supercomputer. You need one VM, one browser, and a place to break things safely.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('The beginner hacking setup - a VM, a browser, and nothing fancy'),
          {
            type: 'paragraph',
            text:
              'You do not need a fancy rig. A normal laptop with 8GB of RAM is plenty to start. The one thing worth setting up is a virtual machine - a computer inside your computer, so you can experiment without wrecking your real system.',
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
              '**A hypervisor** - VirtualBox (free) or VMware to run VMs',
              '**Kali Linux or Parrot** - a Linux built for security work',
              '**A modern browser** - Chrome or Firefox, for DevTools',
              '**A notes app** - anything you will actually use',
            ],
          },
          {
            type: 'command',
            description: 'On any Linux box, confirm which shell and version you are on:',
            commands: ['uname -a', 'echo $SHELL'],
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
            text: 'You know the minimum kit - a VM, a security Linux, a browser - and why a VM keeps your real machine safe.',
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
    description: 'Addresses, ports, and the two protocols that carry the entire internet.',
    lessons: [
      {
        slug: 'what-is-a-computer-network',
        title: 'What Is a Network, Really?',
        summary: 'A network is just computers that can talk to each other. That is the whole idea.',
        estimatedMinutes: 5,
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
              'A network is just computers that can talk to each other. That is it. Your phone talking to the Wi-Fi router is a network. Add the whole planet and you get the internet.',
          },
          {
            type: 'paragraph',
            text:
              'For two devices to talk, they need three things: a way to find each other (an address), a shared language (a protocol), and a path between them (the wires and radio waves in the middle).',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**LAN** - a small local network, like your home or office',
              '**WAN** - a big network spanning distances, like the internet',
              '**Client** - the device asking for something (your phone)',
              '**Server** - the device answering (the website)',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Everything is a conversation',
            text:
              'Loading a website is your device asking a question and a server answering. Every hack starts by understanding that conversation.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain what a network is in one sentence and name the client-server pair behind every request.',
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
              'They need to find each other (address), speak the same language (protocol), and have a route (path).',
          },
        ],
      },
      {
        slug: 'ip-addresses',
        title: "IP Addresses: The Internet's Home Addresses",
        summary: 'Every device online needs an address so replies know where to come back to.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('IP addresses explained - how the internet knows where you live'),
          {
            type: 'paragraph',
            text:
              'An IP address is the home address of a device on a network. When you ask for a website, the reply needs to know where to come back to - that is your IP.',
          },
          {
            type: 'paragraph',
            text:
              'An IPv4 address looks like `142.250.72.14` - four numbers, each 0 to 255. Newer IPv6 addresses are longer and look like `2405:200:1630::1`, because we ran out of the short ones.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Public IP** - your address on the whole internet',
              '**Private IP** - your address inside your home network (like `192.168.1.5`)',
              '**Localhost** - `127.0.0.1`, always means "this machine"',
            ],
          },
          {
            type: 'command',
            description: 'Find your own IP addresses:',
            commands: ['ip addr', 'curl ifconfig.me'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two addresses at once',
            text:
              'Your laptop has a private IP inside your home and shares one public IP with every other device on your Wi-Fi. More on that later.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read an IP address and tell a public one from a private one.',
          },
          {
            type: 'quiz',
            question: 'What does the address 127.0.0.1 always refer to?',
            options: ['Your router', 'The nearest DNS server', 'This machine (localhost)', 'A public web server'],
            correctIndex: 2,
            explanation: '127.0.0.1 is localhost - it always points back at the device you are on.',
          },
        ],
      },
      {
        slug: 'mac-addresses-and-arp',
        title: 'MAC Addresses and ARP',
        summary: 'Below IP there is a hardware address burned into every network card, and ARP is how they get matched up.',
        estimatedMinutes: 6,
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
              'IP addresses can change, but every network card ships with a permanent hardware address called a MAC address. Think of the IP as your current flat and the MAC as your fingerprint - one moves, one does not.',
          },
          {
            type: 'paragraph',
            text:
              'Inside your local network, devices actually talk using MAC addresses, not IPs. So there needs to be a way to ask "who has this IP?" and get back a MAC. That is what ARP does.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**MAC address** - looks like `a4:83:e7:1c:9f:20`, tied to the hardware',
              '**ARP** - "who has IP 192.168.1.1? tell me your MAC"',
              '**ARP cache** - a short-term list of IP-to-MAC answers your device remembers',
            ],
          },
          {
            type: 'command',
            description: 'See the IP-to-MAC mappings your machine has learned:',
            commands: ['ip neigh', 'arp -a'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'ARP trusts everyone',
            text:
              'ARP has no way to check if an answer is honest. That naivety is exactly what ARP spoofing abuses - covered much later.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know the difference between a MAC and an IP, and how ARP glues them together on a LAN.',
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
              'ARP answers "which MAC address has this IP?" so devices on the same LAN can actually reach each other.',
          },
        ],
      },
      {
        slug: 'ports',
        title: 'Ports: One Machine, Many Doors',
        summary: 'An IP gets you to the building. A port gets you to the right flat.',
        estimatedMinutes: 6,
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
              'One server can run a website, a database and a mail service at the same time. Same address, different doors. Those doors are ports - numbers from 0 to 65535.',
          },
          {
            type: 'paragraph',
            text:
              'Think of the IP as the building address and the port as the flat number. `142.250.72.14:443` means "that building, flat 443" - and flat 443 is where HTTPS lives.',
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
            text: 'You can read `IP:port` and say what is probably running there. That is step one of every scan you will ever do.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
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
        summary: 'Two ways to send data: one careful and reliable, one fast and forgetful.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('TCP vs UDP - why your video call stutters but your download does not'),
          {
            type: 'image',
            src: '/api/v1/diagrams/tcp-vs-udp',
            alt: 'TCP confirming each packet beside UDP sending without confirmation',
            caption: 'TCP checks every packet arrived. UDP does not look back.',
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/tcp-handshake',
            alt: 'SYN, SYN-ACK, ACK exchanged between client and server',
            caption: 'The three-way handshake - and the reason port scans work.',
          },
          {
            type: 'paragraph',
            text:
              'There are two main ways computers send data. TCP is the careful courier who confirms every delivery. UDP is the guy who throws packets over the wall and does not look back.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**TCP** - reliable, ordered, confirmed. Used for web, email, file downloads',
              '**UDP** - fast, no confirmation, some loss is fine. Used for video calls, gaming, DNS',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Your file download uses TCP because a single missing byte corrupts the file. Your video call uses UDP because waiting to re-send a lost frame would make everyone talk over each other.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This matters for scanning',
            text:
              'Scanners treat TCP and UDP ports differently, because TCP will "answer the door" and UDP often will not. You will feel this the first time you scan.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can say when a service uses TCP versus UDP, and why the trade-off exists.',
          },
          {
            type: 'quiz',
            question: 'Why does a video call use UDP instead of TCP?',
            options: [
              'UDP encrypts the call',
              'UDP is fast and does not wait to re-send lost data, so the call stays live',
              'TCP does not work on Wi-Fi',
              'UDP guarantees zero packet loss',
            ],
            correctIndex: 1,
            explanation:
              'For live media, speed beats perfection. UDP skips confirmations so the call keeps flowing.',
          },
        ],
      },
      {
        slug: 'packets-and-encapsulation',
        title: 'Packets: How Data Gets Wrapped',
        summary: 'Your data does not travel in one lump. It is chopped into packets, each wrapped in layers of address labels.',
        estimatedMinutes: 6,
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
              'Your data does not zoom across the internet as one big blob. It gets chopped into small chunks called packets, and each packet is wrapped in layers of labels so the network knows where to send it.',
          },
          {
            type: 'paragraph',
            text:
              'Picture posting a letter. You write the message, put it in an envelope with an address, hand it to the courier who adds their own tracking sticker. Each layer wraps the one before it. That wrapping is called encapsulation.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Your actual data (the message)',
              'A TCP or UDP header (which port)',
              'An IP header (which machine)',
              'An Ethernet frame (which device on the local wire)',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why hackers care',
            text:
              'Tools like Wireshark let you unwrap every layer of a captured packet. Reading those layers is how you understand exactly what a system said.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know data travels as packets, each wrapped layer by layer - and you can name the layers.',
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
    description: 'Names, routes, and how your packet actually finds its way across the world.',
    lessons: [
      {
        slug: 'dns',
        title: "DNS: The Internet's Contact List",
        summary: 'Nobody memorises IP addresses. DNS turns names you can remember into addresses machines can use.',
        estimatedMinutes: 6,
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
              "You type `google.com`, not `142.250.72.14`. DNS is the system that translates the name you remember into the address your machine needs. It is the internet's contact list.",
          },
          {
            type: 'paragraph',
            text:
              'When you visit a site, your device asks a DNS resolver "what is the IP for this name?". The resolver looks it up, hands back the number, and only then does your browser connect. All in a fraction of a second.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A record** - name to an IPv4 address',
              '**AAAA record** - name to an IPv6 address',
              '**MX record** - where email for a domain should go',
              '**CNAME** - "this name is an alias for that name"',
            ],
          },
          {
            type: 'command',
            description: 'Look up a domain yourself:',
            commands: ['dig google.com', 'nslookup google.com'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'DNS is a recon goldmine',
            text:
              'DNS records quietly reveal mail servers, subdomains and infrastructure. That is why recon almost always starts here.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know DNS turns names into IPs, and you can read the common record types.',
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
            explanation: 'DNS resolves human-friendly names into the IP addresses machines actually connect to.',
          },
        ],
      },
      {
        slug: 'dhcp-and-nat',
        title: 'DHCP and NAT: Why Your IP Is 192.168.x.x',
        summary: 'Your device did not choose its address, and your public IP is shared. Two quiet systems make that work.',
        estimatedMinutes: 6,
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
              'You never typed in your laptop\'s IP address, yet it has one. And every device in your home shares a single public IP. Two systems make this happen quietly in the background: DHCP and NAT.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'DHCP hands out addresses',
          },
          {
            type: 'paragraph',
            text:
              'When your phone joins Wi-Fi, your router\'s DHCP service leases it a private IP like `192.168.1.7` automatically. No manual setup - it is like the society gate register assigning you a visitor slot on arrival.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'NAT shares one public IP',
          },
          {
            type: 'paragraph',
            text:
              'Your whole house has private IPs, but only one public IP. NAT (Network Address Translation) sits at the router and rewrites addresses so many private devices can share that single public address, then sends each reply back to the right one.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why 192.168?',
            text:
              'Ranges like `192.168.x.x` and `10.x.x.x` are reserved for private networks. They are not routable on the internet, which is why NAT is needed to reach the outside world.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know why your IP starts with 192.168, and how DHCP and NAT split the work of getting you online.',
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
              'NAT rewrites addresses at the router so multiple private devices share a single public IP. DHCP is the one that assigns the private IPs.',
          },
        ],
      },
      {
        slug: 'routers-switches-firewalls',
        title: 'Routers, Switches, Firewalls',
        summary: 'Three boxes with three jobs: connect networks, connect devices, and decide what gets through.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Routers vs switches vs firewalls - three boxes, three jobs'),
          {
            type: 'paragraph',
            text:
              'People lump all network boxes together, but three do very different jobs. Get these straight now and network diagrams stop looking scary.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Switch** - connects devices *inside* one network, using MAC addresses. Like the internal wiring of one building',
              '**Router** - connects *different* networks together and picks the path. It is the gateway from your home to the internet',
              '**Firewall** - the security guard. Decides which traffic is allowed in or out based on rules',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Your home router is actually all three squished into one box: a switch for your devices, a router to the internet, and a basic firewall. Enterprise setups split them apart.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Firewalls shape your scans',
            text:
              'A firewall can make a live host look dead by silently dropping your packets. Knowing one is there changes how you read a scan.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell a switch, a router and a firewall apart by the job each one does.',
          },
          {
            type: 'quiz',
            question: 'Which device connects two different networks and chooses the path between them?',
            options: ['A switch', 'A router', 'A firewall', 'A hub'],
            correctIndex: 1,
            explanation:
              'Routers connect separate networks and route traffic between them. Switches work inside one network; firewalls filter traffic.',
          },
        ],
      },
      {
        slug: 'subnetting-lite',
        title: 'Subnet Masks Without the Maths Panic',
        summary: 'A subnet mask just splits an IP into "which network" and "which device". No panic required.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Subnet masks in plain English - no scary binary maths'),
          {
            type: 'image',
            src: '/api/v1/diagrams/subnet-mask',
            alt: 'An IP split into a network part and a host part',
            caption: 'The mask just marks where the network stops and hosts begin.',
          },
          {
            type: 'paragraph',
            text:
              'Subnetting scares beginners because people teach it with binary tables first. Here is the plain version: a subnet mask just tells you which part of an IP is the *network* and which part is the *device*.',
          },
          {
            type: 'paragraph',
            text:
              'Take `192.168.1.7` with mask `255.255.255.0`. The mask says the first three numbers are the network (`192.168.1`) and the last number is the device (`7`). Everyone sharing `192.168.1.x` is on the same local network.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`/24` means the first 24 bits are the network - that is the `255.255.255.0` mask',
              '`/16` means the first 16 bits - `255.255.0.0`, a bigger network',
              'Same network number = they can talk directly without a router',
            ],
          },
          {
            type: 'command',
            description: 'See your own IP and subnet mask together:',
            commands: ['ip addr show', 'ipconfig'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why it matters for hacking',
            text:
              'Knowing the subnet tells you how many machines might be nearby to scan. A `/24` is up to 254 hosts on the same segment.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can read a subnet mask and say which part of an IP is the network - no binary panic.',
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
        estimatedMinutes: 6,
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
              'Before any fancy tool, two commands answer the basics: is this host even alive, and what path does my traffic take to reach it? Those are `ping` and `traceroute`.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'ping - is it alive?',
          },
          {
            type: 'paragraph',
            text:
              'Ping sends a tiny "are you there?" packet and times how long the reply takes. A reply means the host is up and reachable; the time tells you how far, roughly, it is.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'traceroute - how do I get there?',
          },
          {
            type: 'paragraph',
            text:
              'Traceroute shows every router hop between you and the target, like the list of stations on a railway route. It is how you spot where traffic slows down or gets blocked.',
          },
          {
            type: 'command',
            description: 'Run your first recon on a host you are allowed to test:',
            commands: ['ping -c 4 example.com', 'traceroute example.com', 'tracert example.com'],
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
            text: 'You can check if a host is reachable and trace the path to it - the first moves of real recon.',
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
              'Plenty of hosts drop ping on purpose. No reply is inconclusive, so you check other ways before deciding it is down.',
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
