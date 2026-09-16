import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'models-and-layers',
    title: 'Models and Layers',
    description: 'The OSI and TCP/IP map you will reach for every single day of your career.',
    lessons: [
      {
        slug: 'osi-model',
        title: 'The OSI Model (Actually Useful Version)',
        summary: 'Seven layers sounds like exam torture. It is really just a checklist for "where did this break?".',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('The OSI model without the exam pain - what each layer actually does'),
          {
            type: 'image',
            src: '/api/v1/diagrams/osi-layers',
            alt: 'The seven OSI layers with the protocols and attacks at each',
            caption: 'Use it to ask which layer a bug lives on.',
          },
          {
            type: 'paragraph',
            text:
              'The OSI model splits networking into seven layers, from the physical wire up to the app you tap. It sounds like a memory test, but it is really a troubleshooting checklist: when something breaks, you walk the layers until you find where.',
          },
          {
            type: 'paragraph',
            text:
              'Think of ordering on Swiggy. The app is the top layer. Underneath, other layers quietly handle the address, the delivery route, and the actual roads. You only see the app, but every layer had to work.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**7 Application** - what you use (HTTP, DNS)',
              '**6 Presentation** - formatting, encryption (TLS lives near here)',
              '**5 Session** - keeping a conversation open',
              '**4 Transport** - TCP and UDP, ports',
              '**3 Network** - IP addresses and routing',
              '**2 Data Link** - MAC addresses, Ethernet frames',
              '**1 Physical** - the actual cable or radio wave',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'You do not memorise it, you use it',
            text:
              'Nobody recites all seven for fun. You use them to ask "is this a cable problem (layer 1) or a DNS problem (layer 7)?" and skip straight to the cause.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can name the layers and use them to pin down where a network problem actually lives.',
          },
          {
            type: 'quiz',
            question: 'IP addresses and routing live at which OSI layer?',
            options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
            correctIndex: 1,
            explanation: 'Layer 3, the Network layer, handles IP addressing and routing. Ports are layer 4; MAC is layer 2.',
          },
        ],
      },
      {
        slug: 'tcp-ip-model',
        title: 'The TCP/IP Model',
        summary: 'The model the real internet actually runs on. Four layers, not seven.',
        estimatedMinutes: 5,
        importance: 'essential',
        blocks: [
          videoSlot('TCP/IP vs OSI - the model the internet actually uses'),
          {
            type: 'paragraph',
            text:
              'OSI is the textbook map. TCP/IP is the map the real internet runs on, and it is simpler - just four layers. It squashes some of OSI together because that is how things actually got built.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**Application** - HTTP, DNS, SSH (OSI layers 5-7 rolled into one)',
              '**Transport** - TCP and UDP',
              '**Internet** - IP and routing',
              '**Link** - the local network, Ethernet and Wi-Fi',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Both models describe the same journey. OSI just slices it thinner. When someone says "layer 7 firewall" they mean OSI; when a diagram shows four boxes, that is TCP/IP.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Which one do I learn?',
            text:
              'Learn OSI for the vocabulary everyone uses ("layer 3", "layer 7"), and TCP/IP for how packets really flow. They agree far more than they disagree.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can map the four TCP/IP layers onto the seven OSI ones and know which model a conversation is using.',
          },
          {
            type: 'quiz',
            question: 'How many layers does the TCP/IP model have?',
            options: ['Three', 'Four', 'Five', 'Seven'],
            correctIndex: 1,
            explanation: 'TCP/IP has four layers: Application, Transport, Internet, and Link. OSI is the seven-layer one.',
          },
        ],
      },
      {
        slug: 'how-a-packet-travels',
        title: 'Follow One Packet End to End',
        summary: 'Watch a single request go down your stack, across the wire, and back up the other side.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Follow one packet from your phone to a server and back - layer by layer'),
          {
            type: 'paragraph',
            text:
              'Layers make sense the moment you follow one packet through them. Say you tap a link. Here is the whole trip, top to bottom, then bottom to top on the other end.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'The app makes a request (Application layer)',
              'TCP wraps it with a port and a sequence number (Transport)',
              'IP wraps that with source and destination addresses (Internet)',
              'The link layer wraps it in an Ethernet frame with MAC addresses (Link)',
              'It hits the wire, crosses routers, and the server unwraps it in reverse',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Each layer adds its own header on the way down and strips it on the way up. Same idea as the packets and encapsulation lesson - now you can see which layer does which wrapping.',
          },
          {
            type: 'command',
            description: 'Watch the hops your own packet takes on a host you are allowed to test:',
            commands: ['traceroute example.com', 'tracert example.com'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is what Wireshark shows you',
            text:
              'Open one captured packet in Wireshark and you see these exact layers stacked - frame, then IP, then TCP, then the data. Now you know what you are looking at.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can trace a single request down the stack and back up, naming what each layer added.',
          },
          {
            type: 'related_lesson', lessonSlug: 'packets-and-encapsulation', title: 'Recap: Packets and Encapsulation',
          },
          {
            type: 'quiz',
            question: 'As a packet goes DOWN the stack before hitting the wire, what happens at each layer?',
            options: [
              'A header is stripped off',
              'A header is added (wrapping the layer above)',
              'The data is encrypted',
              'The packet is split in two',
            ],
            correctIndex: 1,
            explanation: 'On the way down, each layer adds its own header. On the way up at the other end, each layer strips its header off.',
          },
        ],
      },
      {
        slug: 'layer-by-layer-attacks',
        title: 'What Breaks at Each Layer',
        summary: 'Every layer has its own bugs. Knowing the layer tells you which attacks even apply.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Attacks by layer - what can go wrong from the cable to the app'),
          {
            type: 'paragraph',
            text:
              'The layer model is not just for debugging. It is a map of attack surface. Each layer has its own classic weaknesses, and knowing the layer tells you which attacks are even possible.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Physical (1)** - cutting or tapping a cable, rogue access points',
              '**Data Link (2)** - ARP spoofing, MAC flooding a switch',
              '**Network (3)** - IP spoofing, routing tricks',
              '**Transport (4)** - port scans, SYN floods',
              '**Application (7)** - the big one: SQL injection, XSS, most web bugs',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Most of your career will be spent up at layer 7, where the web apps live. But layers 2 and 3 are where local-network attacks like ARP spoofing happen, and those come up in the next module.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Lab-only',
            text:
              'Every attack named here is only for targets you own or are authorised to test. On this platform, that means the purpose-built labs.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Defence stacks too',
            text:
              'Defenders think in layers as well - a firewall at layer 3-4, a web app firewall at layer 7. Attacks and defences line up on the same map.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can place a given attack on the right layer and reason about what it can and cannot reach.',
          },
          {
            type: 'practice_ref', title: 'Models and Layers check', exerciseSlug: 'models-and-layers-quiz',
          },
          {
            type: 'quiz',
            question: 'SQL injection and XSS are attacks at which layer?',
            options: ['Physical (1)', 'Data Link (2)', 'Network (3)', 'Application (7)'],
            correctIndex: 3,
            explanation: 'SQL injection and XSS target the application itself, so they live at layer 7. ARP spoofing is layer 2; SYN floods are layer 4.',
          },
        ],
      },
    ],
  },
  {
    slug: 'ethernet-and-lan',
    title: 'Ethernet and the LAN',
    description: 'What actually happens on the wire, before IP even shows up to the party.',
    lessons: [
      {
        slug: 'ethernet-and-frames',
        title: 'Ethernet Frames',
        summary: 'On the local wire, data does not travel as packets. It travels as frames, addressed by MAC.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Ethernet frames explained - the envelope your data rides on the local wire'),
          {
            type: 'paragraph',
            text:
              'Down at the local network, IP addresses are not enough. Devices on the same wire talk using frames - the layer 2 envelope - and each frame is addressed by MAC, not IP.',
          },
          {
            type: 'paragraph',
            text:
              'A frame is just a wrapper. Inside sits your IP packet. On the outside are the source and destination MAC addresses, plus a checksum so the receiver can tell if the frame arrived intact.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Destination MAC** - which device on the wire this is for',
              '**Source MAC** - who sent it',
              '**Type** - what is inside (usually an IP packet)',
              '**Payload** - the actual IP packet being carried',
              '**Checksum** - a quick integrity check',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Packet vs frame',
            text:
              'People say "packet" for everything, but strictly: a frame is layer 2 (MAC), a packet is layer 3 (IP). The frame carries the packet on the local hop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know a frame is the layer 2 envelope, addressed by MAC, that carries an IP packet across the local wire.',
          },
          {
            type: 'quiz',
            question: 'What address does an Ethernet frame use to reach a device on the same local network?',
            options: ['The IP address', 'The MAC address', 'The port number', 'The domain name'],
            correctIndex: 1,
            explanation: 'Frames are layer 2, addressed by MAC. The IP packet rides inside the frame as its payload.',
          },
        ],
      },
      {
        slug: 'switches-and-mac-tables',
        title: 'Switches and MAC Tables',
        summary: 'A switch learns who is where by watching traffic, then sends each frame only to the right port.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('How a switch learns - MAC tables explained without jargon'),
          {
            type: 'paragraph',
            text:
              'A switch connects the devices inside one network. Its trick is that it does not shout every frame to everyone - it learns which device is on which port and delivers frames only where they belong.',
          },
          {
            type: 'paragraph',
            text:
              'It builds a MAC table by watching. Every time a device sends a frame, the switch notes "that MAC is on port 3" and remembers it. Next time a frame is for that MAC, it goes straight to port 3 and nowhere else.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Frame arrives -> switch records the source MAC and the port it came from',
              'Destination MAC already known -> send only to that port',
              'Destination MAC unknown -> flood to all ports once, then learn from the reply',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The table has a limit',
            text:
              'A MAC table is finite. Flood it with thousands of fake MACs (MAC flooding) and some switches give up and broadcast everything - which is exactly what an attacker wants.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know how a switch learns MAC-to-port mappings and why that beats a dumb hub that shouts to everyone.',
          },
          {
            type: 'quiz',
            question: 'How does a switch decide which port to send a frame out of?',
            options: [
              'It always broadcasts to every port',
              'It looks up the destination MAC in its learned MAC table',
              'It uses the IP address',
              'It asks the router',
            ],
            correctIndex: 1,
            explanation: 'A switch learns which MAC is on which port and forwards frames only to the correct port. A hub, by contrast, broadcasts everywhere.',
          },
        ],
      },
      {
        slug: 'arp-deep-dive',
        title: 'ARP Deep Dive (and ARP Spoofing)',
        summary: 'ARP maps IP to MAC, and it trusts every answer. That trust is the whole attack.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('ARP spoofing explained - how one lie lets an attacker read your traffic'),
          {
            type: 'paragraph',
            text:
              'You met ARP earlier: it answers "who has this IP? tell me your MAC". Now the important part - ARP has no way to check if an answer is true. It just believes whoever replies.',
          },
          {
            type: 'paragraph',
            text:
              'ARP spoofing abuses that. An attacker on the same network keeps replying "that IP is at MY MAC" - claiming to be the router, say. Victims update their ARP cache with the lie and start sending their traffic to the attacker instead.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Attacker tells the victim: "the router is at my MAC"',
              'Attacker tells the router: "the victim is at my MAC"',
              'Both now route through the attacker, who sits in the middle',
              'The attacker reads, and can alter, the traffic before passing it on',
            ],
          },
          {
            type: 'command',
            description: 'Inspect your own ARP cache to see the IP-to-MAC entries your machine trusts:',
            commands: ['ip neigh', 'arp -a'],
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Lab-only',
            text:
              'ARP spoofing is a real attack on real networks. Only ever run it on a network you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why it still works',
            text:
              'ARP has no authentication built in, by design from the 1980s. Defences bolt on top (dynamic ARP inspection, static entries) rather than fixing ARP itself.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain how a machine-in-the-middle position is set up by poisoning ARP caches - and why the protocol allows it.',
          },
          {
            type: 'quiz',
            question: 'Why does ARP spoofing work at all?',
            options: [
              'ARP replies are encrypted but the key leaks',
              'ARP has no way to verify that a reply is honest',
              'Switches forward ARP to the internet',
              'It only works on Wi-Fi',
            ],
            correctIndex: 1,
            explanation: 'ARP trusts any reply with no authentication, so an attacker can claim someone else\'s IP and get traffic sent to them.',
          },
        ],
      },
      {
        slug: 'vlans-and-segmentation',
        title: 'VLANs and Segmentation',
        summary: 'One physical switch, several separate networks. Segmentation limits how far an attacker can spread.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('VLANs in plain English - splitting one switch into separate networks'),
          {
            type: 'paragraph',
            text:
              'A VLAN lets one physical switch act like several separate networks. Devices on different VLANs cannot talk directly, even though they share the same hardware. It is like separate societies sharing one gate but keeping their own resident lists.',
          },
          {
            type: 'paragraph',
            text:
              'Companies use this to segment. Guest Wi-Fi, staff laptops, and servers all live on different VLANs, so a break-in on the guest network does not automatically reach the servers.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Segmentation** - splitting a network so a breach in one part cannot spread everywhere',
              '**VLAN tag** - a label on frames marking which virtual network they belong to',
              '**Inter-VLAN routing** - a router is needed for VLANs to talk on purpose',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why attackers care',
            text:
              'Good segmentation means landing on one machine does not give you the whole network. Weak or missing segmentation is why one foothold sometimes becomes total control.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You understand why networks are segmented into VLANs and how that contains the blast radius of a breach.',
          },
          {
            type: 'quiz',
            question: 'What is the main security benefit of VLAN segmentation?',
            options: [
              'It encrypts all traffic',
              'It stops a breach in one segment from spreading freely to others',
              'It speeds up the internet',
              'It hides the network from DNS',
            ],
            correctIndex: 1,
            explanation: 'Segmentation contains the blast radius - a foothold in one VLAN does not automatically reach the others.',
          },
        ],
      },
    ],
  },
  {
    slug: 'ip-routing-subnets',
    title: 'IP, Routing and Subnets',
    description: 'Subnetting that finally clicks, plus how routers decide where every packet goes.',
    lessons: [
      {
        slug: 'ipv4-addressing-deep',
        title: 'IPv4 Addressing, Properly',
        summary: 'You know an IP is four numbers. Now learn network vs host, and why some ranges are special.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('IPv4 addressing done properly - network part, host part, and the special ranges'),
          {
            type: 'paragraph',
            text:
              'An IPv4 address is four numbers, each 0 to 255, like `192.168.1.7`. The real idea to lock in: part of that address names the network, and part names the specific device (the host) on it.',
          },
          {
            type: 'paragraph',
            text:
              'Which part is which is decided by the subnet mask, coming up next. First, know that some ranges are reserved and never appear on the public internet.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Private** - `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x` (home and office only)',
              '**Loopback** - `127.0.0.1`, always this machine',
              '**Public** - everything else, reachable across the internet',
              '**Network part** - names the network everyone shares',
              '**Host part** - names one device on that network',
            ],
          },
          {
            type: 'command',
            description: 'See your machine\'s IPv4 address and which network it is on:',
            commands: ['ip addr show', 'ipconfig'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two devices, same network',
            text:
              'If two devices share the same network part, they can talk directly. Different network part means the traffic has to go through a router.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can split an IPv4 address into its network and host parts and spot a private range on sight.',
          },
          {
            type: 'related_lesson', lessonSlug: 'ip-addresses', title: 'Recap: IP Addresses',
          },
          {
            type: 'quiz',
            question: 'Which of these is a private IPv4 address?',
            options: ['8.8.8.8', '10.0.5.20', '142.250.72.14', '1.1.1.1'],
            correctIndex: 1,
            explanation: '10.x.x.x is a private range. 8.8.8.8 and 1.1.1.1 are public DNS servers; 142.250.72.14 is a public address.',
          },
        ],
      },
      {
        slug: 'subnetting-for-real',
        title: 'Subnetting for Real',
        summary: 'No binary lectures. Just concrete examples of how /24 and /16 carve an address into network and hosts.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('Subnetting made concrete - /24 and /16 with real examples, zero scary maths'),
          {
            type: 'image',
            src: '/api/v1/diagrams/subnet-mask',
            alt: 'An IP split into a network part and a host part',
            caption: 'The mask marks where the network stops and hosts begin.',
          },
          {
            type: 'paragraph',
            text:
              'Subnetting scares people because it gets taught with binary tables first. Skip that. The whole job of a subnet mask is to say where the network part of an address stops and the host part begins.',
          },
          {
            type: 'paragraph',
            text:
              'Take `192.168.1.7` with a `/24` mask. The `/24` means "the first 24 bits are the network" - which lands neatly on the first three numbers. So the network is `192.168.1` and the host is `7`. Everyone on `192.168.1.x` is on the same network.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`/24` = `255.255.255.0` -> first three numbers are the network, up to 254 usable hosts',
              '`/16` = `255.255.0.0` -> first two numbers are the network, a much bigger range',
              '`/8` = `255.0.0.0` -> just the first number, huge',
              'Smaller number after the slash = bigger network = more hosts',
            ],
          },
          {
            type: 'paragraph',
            text:
              'A quick real example: your phone is `192.168.1.7/24` and the printer is `192.168.1.30`. Same first three numbers, same network - they talk directly. A server at `10.0.0.5` is on a different network, so that traffic goes through a router.',
          },
          {
            type: 'command',
            description: 'Read your own address and mask together (the number after the slash is the mask):',
            commands: ['ip -brief addr', 'ipconfig'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why a hacker counts hosts',
            text:
              'A `/24` means up to 254 machines could be sitting on the same segment as you. That number tells you how much there is to discover before you even scan.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read `/24` or `/16`, say which part of the address is the network, and roughly how many hosts fit - no bit-counting needed.',
          },
          {
            type: 'related_lesson', lessonSlug: 'subnetting-lite', title: 'Recap: Subnet Masks Without the Maths Panic',
          },
          {
            type: 'quiz',
            question: 'For 192.168.1.7 with a /24 mask, what is the network part?',
            options: ['192', '192.168', '192.168.1', 'The whole address'],
            correctIndex: 2,
            explanation: 'A /24 makes the first three numbers the network (192.168.1) and the last number the host (7).',
          },
        ],
      },
      {
        slug: 'routing-basics',
        title: 'How Routing Decisions Happen',
        summary: 'A router looks at the destination, checks its table, and picks the next hop. That is the whole loop.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('How routers decide - the routing table and the next hop, explained simply'),
          {
            type: 'paragraph',
            text:
              'When a packet needs to leave your network, a router decides where it goes next. It does not know the whole route to the destination - it only needs to know the next hop, and it trusts the next router to know the one after that.',
          },
          {
            type: 'paragraph',
            text:
              'It is like asking for directions on a road trip. You do not need the full map - just "next, take the highway toward Pune". Each router hands the packet one step closer, using its routing table.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Packet arrives with a destination IP',
              'Router checks its routing table for the best matching network',
              'Table says which next hop (or interface) leads that way',
              'Packet is forwarded; repeat at the next router',
              'No specific match? Send it to the default gateway',
            ],
          },
          {
            type: 'command',
            description: 'Look at your own routing table and default gateway:',
            commands: ['ip route', 'route print'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The default gateway',
            text:
              'Your default gateway is the router your device sends anything it does not have a specific route for. On a home network that is almost always your Wi-Fi router.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can describe how a router picks the next hop from its table and what the default gateway is for.',
          },
          {
            type: 'quiz',
            question: 'What does a router do with a packet whose destination has no specific route in its table?',
            options: [
              'Drops it immediately',
              'Sends it to the default gateway',
              'Broadcasts it to every device',
              'Returns it to the sender',
            ],
            correctIndex: 1,
            explanation: 'Anything without a specific matching route goes to the default gateway, which passes it further along.',
          },
        ],
      },
      {
        slug: 'ipv6-basics',
        title: 'IPv6 Without the Headache',
        summary: 'Longer addresses, same job. IPv6 exists because we ran out of the short ones.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('IPv6 without the headache - why the long addresses exist and how to read them'),
          {
            type: 'paragraph',
            text:
              'IPv6 addresses look scary - `2405:200:1630::1` - but the job is identical to IPv4: name a device so replies can find it. The only reason IPv6 exists is that the world ran out of the short IPv4 addresses.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'IPv4 has about 4 billion addresses - we blew past that',
              'IPv6 has a practically endless supply',
              'Written in hex, separated by colons, and `::` means "a run of zeros"',
              '`::1` is the IPv6 loopback, the same idea as `127.0.0.1`',
            ],
          },
          {
            type: 'command',
            description: 'See whether your machine has an IPv6 address:',
            commands: ['ip -6 addr', 'ipconfig'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Do not skip it in recon',
            text:
              'A target may be reachable over IPv6 even when IPv4 looks locked down. Some scans and firewall rules quietly forget IPv6 exists.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can read an IPv6 address, know what `::` means, and explain why IPv6 was needed at all.',
          },
          {
            type: 'quiz',
            question: 'Why does IPv6 exist?',
            options: [
              'It is more secure than IPv4 by default',
              'The world ran out of the shorter IPv4 addresses',
              'It is faster than IPv4',
              'It replaces the need for DNS',
            ],
            correctIndex: 1,
            explanation: 'IPv6 was created mainly because the roughly 4 billion IPv4 addresses were not enough for the number of devices.',
          },
        ],
      },
      {
        slug: 'icmp-and-diagnostics',
        title: 'ICMP and Network Diagnostics',
        summary: 'The protocol behind ping and traceroute - how the network reports back that something is wrong.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('ICMP explained - the protocol that powers ping, traceroute and error messages'),
          {
            type: 'paragraph',
            text:
              'ICMP is the network\'s way of sending status and error messages. It does not carry your actual data - it carries the little "are you there?" and "that did not work" notes that keep things diagnosable.',
          },
          {
            type: 'paragraph',
            text:
              'Ping and traceroute both ride on ICMP. Ping sends an echo request and waits for an echo reply. Traceroute uses ICMP time-exceeded messages to reveal each router along the path.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Echo request / reply** - what ping uses to check reachability',
              '**Time exceeded** - a packet ran out of hops; traceroute uses this to map the route',
              '**Destination unreachable** - the network telling you it could not deliver',
            ],
          },
          {
            type: 'command',
            description: 'Use ICMP-based tools on a host you are allowed to test:',
            commands: ['ping -c 4 example.com', 'traceroute example.com', 'tracert example.com'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Blocked ICMP fools scans',
            text:
              'Many hosts drop ICMP, so no ping reply does not mean the host is down - it may just be ignoring you. Never call a host dead on ping alone.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know ICMP carries the network\'s status and error messages, and that ping and traceroute are built on it.',
          },
          {
            type: 'related_lesson', lessonSlug: 'traceroute-and-ping', title: 'Recap: Ping and Traceroute' },
          {
            type: 'quiz',
            question: 'Which pair of tools is built on ICMP?',
            options: ['dig and nslookup', 'ping and traceroute', 'ssh and scp', 'nmap and curl'],
            correctIndex: 1,
            explanation: 'Ping uses ICMP echo request/reply; traceroute uses ICMP time-exceeded messages to map the route. dig/nslookup are DNS tools.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'layer-by-layer-attacks',
    slug: 'models-and-layers-quiz',
    title: 'Models and Layers check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'How many layers does the OSI model have?',
        options: ['Four', 'Five', 'Seven', 'Nine'],
        correctIndex: 2,
        explanation: 'OSI has seven layers, from Physical up to Application. TCP/IP is the four-layer model.',
      },
      {
        prompt: 'IP addressing and routing happen at which OSI layer?',
        options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
        correctIndex: 1,
        explanation: 'Layer 3, the Network layer, handles IP and routing. Ports are layer 4; MAC is layer 2.',
      },
      {
        prompt: 'How many layers does the TCP/IP model have?',
        options: ['Three', 'Four', 'Five', 'Seven'],
        correctIndex: 1,
        explanation: 'TCP/IP has four: Application, Transport, Internet, and Link.',
      },
      {
        prompt: 'As a packet travels DOWN the stack, what does each layer do?',
        options: [
          'Strips a header off',
          'Adds its own header around the layer above',
          'Encrypts the whole packet',
          'Splits it in half',
        ],
        correctIndex: 1,
        explanation: 'Going down, each layer adds a header. Going up at the destination, each layer strips its header off.',
      },
      {
        prompt: 'SQL injection and XSS are attacks at which layer?',
        options: ['Physical (1)', 'Network (3)', 'Transport (4)', 'Application (7)'],
        correctIndex: 3,
        explanation: 'They target the application itself, so layer 7. ARP spoofing is layer 2; SYN floods are layer 4.',
      },
    ],
  },
  {
    lessonSlug: 'vlans-and-segmentation',
    slug: 'ethernet-and-lan-quiz',
    title: 'Ethernet and the LAN check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What address does an Ethernet frame use on the local wire?',
        options: ['The IP address', 'The MAC address', 'The port number', 'The domain name'],
        correctIndex: 1,
        explanation: 'Frames are layer 2 and addressed by MAC. The IP packet rides inside the frame.',
      },
      {
        prompt: 'How does a switch choose the port to forward a frame to?',
        options: [
          'It always broadcasts to every port',
          'It looks up the destination MAC in its learned table',
          'It uses the IP address',
          'It asks DNS',
        ],
        correctIndex: 1,
        explanation: 'A switch learns which MAC sits on which port and forwards only to the right one.',
      },
      {
        prompt: 'Why does ARP spoofing work?',
        options: [
          'ARP replies are encrypted but leak',
          'ARP trusts any reply with no way to verify it',
          'Switches forward ARP to the internet',
          'It only works over Wi-Fi',
        ],
        correctIndex: 1,
        explanation: 'ARP has no authentication, so an attacker can claim another device\'s IP and get traffic sent to them.',
      },
      {
        prompt: 'In an ARP-spoofing machine-in-the-middle, where does the victim\'s traffic go?',
        options: [
          'Straight to the real router',
          'Through the attacker, who can read and alter it',
          'Nowhere, it is dropped',
          'Back to the victim',
        ],
        correctIndex: 1,
        explanation: 'The attacker poisons both caches so traffic routes through them before reaching its destination.',
      },
      {
        prompt: 'What is the main security benefit of splitting a network into VLANs?',
        options: [
          'It encrypts all traffic',
          'It contains a breach so it cannot spread freely between segments',
          'It makes the internet faster',
          'It removes the need for a router',
        ],
        correctIndex: 1,
        explanation: 'Segmentation limits the blast radius - a foothold in one VLAN does not automatically reach the others.',
      },
    ],
  },
  {
    lessonSlug: 'icmp-and-diagnostics',
    slug: 'ip-routing-subnets-quiz',
    title: 'IP, Routing and Subnets check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which of these is a private IPv4 address?',
        options: ['8.8.8.8', '172.20.1.5', '1.1.1.1', '142.250.72.14'],
        correctIndex: 1,
        explanation: '172.16-31.x.x is a private range. The others are public addresses.',
      },
      {
        prompt: 'For 192.168.1.7 with a /24 mask, which part is the network?',
        options: ['192', '192.168', '192.168.1', 'The whole address'],
        correctIndex: 2,
        explanation: 'A /24 makes the first three numbers the network and the last number the host.',
      },
      {
        prompt: 'A /24 network has room for roughly how many usable hosts?',
        options: ['About 30', 'About 254', 'About 1000', 'About 65000'],
        correctIndex: 1,
        explanation: 'A /24 leaves the last number (0-255) for hosts, giving up to 254 usable addresses.',
      },
      {
        prompt: 'What does a router do with a packet that has no specific matching route?',
        options: [
          'Drops it',
          'Sends it to the default gateway',
          'Broadcasts it everywhere',
          'Returns it to the sender',
        ],
        correctIndex: 1,
        explanation: 'Anything without a specific route goes to the default gateway to be passed along.',
      },
      {
        prompt: 'Which pair of diagnostic tools is built on ICMP?',
        options: ['dig and nslookup', 'ping and traceroute', 'ssh and scp', 'curl and wget'],
        correctIndex: 1,
        explanation: 'Ping uses ICMP echo; traceroute uses ICMP time-exceeded messages. dig/nslookup are DNS tools.',
      },
    ],
  },
];
