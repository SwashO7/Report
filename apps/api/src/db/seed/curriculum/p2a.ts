import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'models-and-layers',
    title: 'Models and Layers',
    description:
      'The OSI and TCP/IP maps you will reach for every single working day, taught as a troubleshooting and attack-surface checklist rather than an exam. By the end you can name which layer a problem lives on, follow one packet down your stack and back up the far side, and place a given attack - ARP spoofing, a SYN flood, SQL injection - on the exact layer it targets.',
    lessons: [
      {
        slug: 'osi-model',
        title: 'The OSI Model (Actually Useful Version)',
        summary: 'Seven layers sounds like exam torture. It is really just a checklist for "where did this break?".',
        estimatedMinutes: 8,
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
              'The OSI model splits networking into seven layers, from the physical wire up to the app you tap. It looks like a memory test, but it is really a troubleshooting checklist: when something breaks, you walk the layers until you find where. The diagram above stacks all seven with the protocols and the classic attacks that sit at each one, so you can point at a symptom and ask which layer owns it.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism. Each layer only talks to the layer directly above and below it, and each one has a single job. When you send data, it travels DOWN the stack from layer 7 to layer 1, each layer adding its own header, then out on the wire. At the other end it travels back UP, each layer reading and stripping the header its counterpart added. A layer never has to understand the layers far from it - the app at layer 7 has no idea whether you are on fibre or Wi-Fi at layer 1, and it does not need to.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete example. You tap a link to open `bank.example.com`. Layer 7 (Application) forms the HTTP request. Layer 6 (Presentation) handles the TLS encryption so it becomes HTTPS. Layer 4 (Transport) adds a TCP header aimed at port 443. Layer 3 (Network) adds an IP header with source `192.168.1.7` and destination `142.250.72.14`. Layer 2 (Data Link) wraps that in an Ethernet frame addressed to your router by MAC. Layer 1 (Physical) turns the whole thing into electrical or radio signals. If the page never loads, you now have seven places to check instead of one vague "internet is down".',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**7 Application** - what you use directly (HTTP, DNS, SSH)',
              '**6 Presentation** - formatting and encryption (TLS lives near here)',
              '**5 Session** - opening, holding and closing a conversation',
              '**4 Transport** - TCP and UDP, and the port numbers',
              '**3 Network** - IP addresses and routing between networks',
              '**2 Data Link** - MAC addresses and Ethernet frames on the local wire',
              '**1 Physical** - the actual cable, fibre or radio wave',
            ],
          },
          {
            type: 'command',
            description: 'Poke a couple of layers on your own machine: layer 3 reachability, then a layer 7 request:',
            commands: ['ping -c 4 example.com', 'curl -sS -o /dev/null -w "%{http_code}\\n" https://example.com'],
          },
          {
            type: 'paragraph',
            text:
              'Read the two results together and you have just localised a fault by layer. If `ping` gets replies, layers 1 through 3 are working - the wire, the local network and IP routing all reached the host. If `ping` works but `curl` prints nothing or hangs, the problem is higher up: TLS at layer 6 or the web app at layer 7, not the network. That is the whole point of the model - the tools each probe a different layer, so their answers tell you which layer to blame.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or a defender: the layer decides which attacks even apply and which tool you reach for. A layer 2 problem is inspected with a packet capture on the local wire; a layer 3 issue with traceroute; a layer 7 bug with an intercepting proxy like Burp. When someone reports a "firewall at layer 7" or a "layer 3 DDoS", the number is telling you exactly what is being filtered or flooded. You are not memorising trivia - you are learning the shared vocabulary every network conversation uses.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'You do not memorise it, you use it',
            text:
              'Nobody recites all seven for fun. You use them to ask "is this a cable problem (layer 1) or a DNS problem (layer 7)?" and skip straight to the likely cause.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can name the layers and use them to pin down where a network problem or an attack actually lives.',
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
        summary: 'The model the real internet actually runs on. Four layers, not seven, and every one maps onto OSI.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('TCP/IP vs OSI - the model the internet actually uses'),
          {
            type: 'paragraph',
            text:
              'OSI is the textbook map. TCP/IP is the map the real internet runs on, and it is simpler - just four layers. It squashes some of OSI together because that is how the protocols actually got built, before anyone drew the seven-layer diagram. Learn both: OSI for the vocabulary people use out loud, TCP/IP for how packets really flow.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is the same layered wrapping you saw with OSI - data goes down, each layer adds a header, it crosses the wire, and it comes back up with each header stripped. The difference is only how finely the job is sliced. TCP/IP takes OSI layers 5, 6 and 7 and merges them into one Application layer, because in practice the app, its formatting and its session handling are usually the same piece of software. It also merges OSI layers 1 and 2 into one Link layer, since the local wire and its addressing travel together.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**Application** - HTTP, DNS, SSH, TLS (OSI layers 5-7 rolled into one)',
              '**Transport** - TCP and UDP, with port numbers (OSI layer 4)',
              '**Internet** - IP and routing between networks (OSI layer 3)',
              '**Link** - the local network: Ethernet and Wi-Fi (OSI layers 1-2)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Map one packet across both models to make it click. Your HTTPS request to `142.250.72.14:443` lives in the Application layer of TCP/IP, which is OSI 5-7. Its TCP header is the Transport layer in both. Its IP header is the Internet layer in TCP/IP, OSI layer 3. Its Ethernet frame is the Link layer in TCP/IP, OSI layers 1-2. Same journey, same headers, just two different rulers measuring it. When a diagram shows four boxes it is TCP/IP; when someone says "layer 7 firewall" they are counting in OSI.',
          },
          {
            type: 'command',
            description: 'Watch the two lower layers of the model on your own machine - Transport sockets, then the Internet layer route table:',
            commands: ['ss -tuln', 'ip route'],
          },
          {
            type: 'paragraph',
            text:
              'The first command lists your Transport-layer sockets: each row is a TCP or UDP port your machine is listening on, which is the Transport layer of TCP/IP made visible. The second prints your Internet-layer routing table - the rules IP uses to decide where a packet leaves for. Reading them side by side, you are looking at two adjacent layers of the model doing their separate jobs: one owns ports and connections, the other owns addresses and routes.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: real tooling is organised by these layers. A port scanner works at Transport, a traceroute at Internet, a web proxy at Application, a packet sniffer at Link. Knowing which layer your target behaviour lives on tells you which tool will even see it. A bug in how an app parses JSON is Application - a sniffer at the Link layer will show you encrypted noise and teach you nothing, so you reach for the proxy instead.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Which one do I learn?',
            text:
              'Learn OSI for the vocabulary everyone uses ("layer 3", "layer 7") and TCP/IP for how packets really flow. They agree far more than they disagree.',
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
        summary: 'Watch a single request go down your stack, across the wire, and back up the other side, header by header.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Follow one packet from your phone to a server and back - layer by layer'),
          {
            type: 'paragraph',
            text:
              'Layers stop being abstract the moment you follow one packet through all of them. Say you tap a link to load a page. Here is the whole trip: down your stack, out on the wire, across some routers, then back up the stack on the server - and the reply retraces it in the other direction.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is encapsulation on the way down and de-encapsulation on the way up. Going down, each layer takes whatever the layer above handed it and adds its own header in front, like putting a letter inside progressively bigger envelopes. Nothing rewrites your data - each layer only wraps a label around everything below it. Going up at the destination, each layer reads its own header, strips it, and passes the rest to the layer above. The server never sees the Ethernet or IP headers by the time your `GET` request reaches its web software; those were peeled off on the way up.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'The app makes a request, e.g. `GET /login` (Application layer)',
              'TCP wraps it with a source and destination port and a sequence number (Transport)',
              'IP wraps that with source and destination addresses (Internet)',
              'The Link layer wraps it in an Ethernet frame with source and destination MAC (Link)',
              'It hits the wire, crosses routers hop by hop, and the server unwraps it in reverse',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Build one real packet to see the values. Your browser sends `GET /login` to `142.250.72.14`. TCP wraps it with destination port 443, so the far side knows it is web traffic. IP wraps that with source `192.168.1.7` and destination `142.250.72.14`, so routers know where to carry it. Ethernet wraps that with your MAC and your router\'s MAC, so it reaches the right device on your LAN. The finished packet is `[Ethernet [IP [TCP [GET /login]]]]`. Notice the addresses: the IP destination stays `142.250.72.14` the whole way across the internet, but the destination MAC changes at every hop, because MAC only ever means "the next device on this wire".',
          },
          {
            type: 'command',
            description: 'Watch the hops your own packet takes toward a host you are allowed to test:',
            commands: ['traceroute example.com', 'tracert example.com'],
          },
          {
            type: 'paragraph',
            text:
              'Each numbered line traceroute prints is one router your packet passed through, in order, with the time it took to answer. Line 1 is almost always your home router (something like `192.168.1.1`), line 2 your ISP, and the later lines march across the internet toward the target. That list IS the layer 3 journey made visible - every hop is an Internet-layer forwarding decision. Rows of `* * *` mean a router chose not to reply, which is common and not an error. On Windows use `tracert`; on Linux and macOS use `traceroute`.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: every value in those headers is a place something can go wrong or be tampered with. An attacker who can sit on your local wire can rewrite the Link-layer MAC (that is ARP spoofing, coming up) and become the next hop. A defender reading a packet capture reconstructs exactly this stack - frame, IP, TCP, data - to see precisely what was sent, byte for byte. Once you can name what each layer added, "what did this system actually say on the wire?" stops being a mystery and becomes something you read off the capture.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This is what Wireshark shows you',
            text:
              'Open one captured packet in Wireshark and you see these exact layers stacked - frame, then IP, then TCP, then the data. Now you know what you are looking at and which header did which job.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can trace a single request down the stack and back up, naming what each layer added and which addresses change per hop.',
          },
          {
            type: 'related_lesson', lessonSlug: 'packets-and-encapsulation', title: 'Recap: Packets and Encapsulation',
          },
          {
            type: 'quiz',
            question: 'As a packet goes DOWN the stack before hitting the wire, what happens at each layer?',
            options: [
              'A header is stripped off',
              'A header is added, wrapping the layer above',
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
        summary: 'Every layer has its own bugs. Knowing the layer tells you which attacks even apply and which tools reach them.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The layer model is not just for debugging. It is a map of attack surface. Each layer has its own classic weaknesses, and knowing the layer tells you which attacks are even possible against a target and which tool will let you carry one out. Pick the wrong layer and your tool sees nothing useful.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism behind this is that an attacker can only touch a layer they can reach. To attack layer 2 you must be on the same local wire as the victim, because MAC addressing does not travel past the first router. To attack layer 3 you need to influence routing or forge IP source addresses. Layer 4 attacks target the transport handshake itself. Layer 7 attacks ride inside a normal-looking request and reach anyone who can send HTTP - which is why the web is where most of the work is.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Physical (1)** - cutting or tapping a cable, planting a rogue Wi-Fi access point',
              '**Data Link (2)** - ARP spoofing, MAC flooding a switch to make it broadcast everything',
              '**Network (3)** - IP spoofing, routing tricks, ICMP-based scanning',
              '**Transport (4)** - port scans, SYN floods that exhaust a server\'s half-open connections',
              '**Application (7)** - the big one: SQL injection, XSS, auth bypass, most web bugs',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete comparison. A SYN flood is a layer 4 attack: the attacker sends thousands of TCP SYN packets and never completes the handshake, so the server piles up half-open connections until it cannot accept a real one. SQL injection is a layer 7 attack: the attacker sends one perfectly ordinary HTTP request whose parameter smuggles `\' OR 1=1 --` into a database query. Same victim server, completely different layers, completely different defences - a network firewall might catch the flood but will happily pass the injection, because at layer 3-4 the injection is just a normal-looking web request.',
          },
          {
            type: 'command',
            description: 'See the layer 3-4 attack surface of a host you own or are authorised to test - open TCP ports:',
            commands: ['nmap -sT localhost', 'nmap -sT 127.0.0.1'],
          },
          {
            type: 'paragraph',
            text:
              'Each line nmap prints is one port and its state - `open`, `closed` or `filtered` - plus a guess at the service. An `open` port means software is listening there and is reachable, which is a layer 4 finding that points you at a layer 7 target: a port 3306 marked open says "there is a MySQL database here to test", a port 80 or 443 says "there is a web app here". The scan itself works at Transport (it probes the TCP handshake), but what it hands you is a to-do list of higher-layer services to look at next.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters on both sides: it stops you wasting effort. Most of your career will be spent up at layer 7 where the web apps live, because that is where the reachable, high-impact bugs are. But layers 2 and 3 are exactly where local-network attacks like ARP spoofing happen, and those are the next module. A defender uses the same map in reverse - a firewall filters at layers 3-4, a web application firewall inspects at layer 7, and network segmentation limits what a layer 2 foothold can reach.',
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
    description:
      'What actually happens on the local wire, before IP even shows up: frames addressed by MAC, switches that learn who sits on which port, and the ARP protocol that trusts every answer it hears. By the end you can read a frame, explain how a switch forwards, describe an ARP-spoofing machine-in-the-middle step by step, and say why VLAN segmentation contains a breach.',
    lessons: [
      {
        slug: 'ethernet-and-frames',
        title: 'Ethernet Frames',
        summary: 'On the local wire, data does not travel as packets. It travels as frames, addressed by MAC.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Ethernet frames explained - the envelope your data rides on the local wire'),
          {
            type: 'paragraph',
            text:
              'Down at the local network, IP addresses are not enough to actually move data across the wire. Devices on the same wire talk using frames - the layer 2 envelope - and each frame is addressed by MAC, not by IP. Every packet you send gets wrapped in a frame for each local hop it takes.',
          },
          {
            type: 'paragraph',
            text:
              'A MAC address is the hardware address burned into a network card, written as six hex pairs like `a4:5e:60:c1:2f:9b`. Unlike an IP address, which can change when you move networks, a MAC is tied to the physical device. On the local wire, that MAC is how one machine picks out another. The frame is just a wrapper around your IP packet: on the outside are the source and destination MAC addresses plus a checksum, and inside sits the IP packet untouched.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete frame. Your laptop at MAC `a4:5e:60:c1:2f:9b` wants to reach a server on the internet. The IP packet inside is addressed to the far-away server, but the frame around it is addressed to your router, MAC `d8:07:b6:00:11:22`, because the router is the next device on your wire. Your card writes source `a4:5e:60:c1:2f:9b`, destination `d8:07:b6:00:11:22`, drops the IP packet in as payload, adds a checksum, and sends it. The router strips the frame, reads the IP packet, and builds a fresh frame for the next hop. The IP addresses never change; the MAC addresses change at every single hop.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Destination MAC** - which device on the wire this frame is for',
              '**Source MAC** - who sent it',
              '**Type** - what is inside (usually an IPv4 or IPv6 packet)',
              '**Payload** - the actual IP packet being carried',
              '**Checksum (FCS)** - a quick integrity check so the receiver spots a corrupted frame',
            ],
          },
          {
            type: 'command',
            description: 'Read the MAC addresses your own machine knows about on the local wire:',
            commands: ['ip link show', 'ip neigh', 'arp -a'],
          },
          {
            type: 'paragraph',
            text:
              'The first command lists your own network interfaces and shows each one\'s MAC after `link/ether` - that is the source MAC your frames carry. The second and third list the neighbour table: every other device your machine has recently talked to on the local wire, paired as IP-to-MAC. Reading that table, you are literally seeing the destination MACs your machine writes into frames. If your router is `192.168.1.1` and the table shows it at `d8:07:b6:00:11:22`, that hex string is who your outbound frames are addressed to.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker or defender cares: frames are the raw material of every local-network attack. Because the local wire trusts MAC addresses and there is no built-in check that a MAC is genuine, an attacker on the same segment can capture frames, read them, and even claim a MAC that is not theirs. That is the foundation of the sniffing and spoofing attacks in the next two lessons. A defender who can read frames off a capture sees exactly which physical device sent what - the MAC often survives even when the IP is spoofed.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Packet vs frame',
            text:
              'People say "packet" for everything, but strictly: a frame is layer 2 (addressed by MAC), a packet is layer 3 (addressed by IP). The frame carries the packet on each local hop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know a frame is the layer 2 envelope, addressed by MAC, that carries an IP packet across the local wire - and that the MAC changes every hop while the IP does not.',
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
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A switch connects the devices inside one network. Its whole trick is that it does not shout every frame to everyone - it learns which device is plugged into which port and delivers each frame only where it belongs. That is what makes a switch smart and an old hub dumb.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a MAC table (also called a CAM table) that the switch builds by watching. Every frame that arrives carries a source MAC. When a frame comes in on physical port 3 with source MAC `a4:5e:60:c1:2f:9b`, the switch writes down "that MAC lives on port 3" and remembers it. Next time a frame arrives whose destination is `a4:5e:60:c1:2f:9b`, the switch looks it up, sees port 3, and sends the frame only out of port 3 - no other device on the switch ever sees it.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the learning process with real values. Laptop A (`aa:aa`) is on port 1, laptop B (`bb:bb`) on port 2, the router (`cc:cc`) on port 3. A sends its first frame to B. The switch has an empty table, so it records "A is on port 1" from the source, but it does not yet know where B is - so it floods that first frame out of every other port. B replies, and now the switch records "B is on port 2" from B\'s source MAC. From that moment on, every frame between A and B goes straight port-to-port, and no flooding happens again. The table filled itself just by watching normal traffic.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Frame arrives -> switch records the source MAC and the port it came in on',
              'Destination MAC already in the table -> send only to that one port',
              'Destination MAC unknown -> flood to all ports once, then learn from the reply',
              'Broadcast destination (`ff:ff:ff:ff:ff:ff`) -> always sent to every port',
            ],
          },
          {
            type: 'command',
            description: 'On a Linux host acting as a bridge you can read its learned MAC-to-port table directly:',
            commands: ['bridge fdb show', 'ip link show type bridge'],
          },
          {
            type: 'paragraph',
            text:
              'On a machine bridging traffic, `bridge fdb show` prints the forwarding database - each line is a learned MAC paired with the interface (port) it was last seen on, which is exactly the table a hardware switch keeps internally. Reading it, you can see which device the bridge believes sits behind each port. On a real managed switch you would read the same information from its console as the "MAC address table"; the concept is identical - a list of MAC-to-port mappings the device learned by watching frames.',
          },
          {
            type: 'paragraph',
            text:
              'Why an attacker cares: the MAC table has a fixed size. Flood a switch with frames from thousands of fake, random source MACs - an attack called MAC flooding - and the table fills up. Some switches, when their table overflows, fail open: they give up on selective forwarding and start broadcasting every frame to every port, exactly like a hub. Now the attacker sees all traffic on the segment, not just their own. A defender counters this with port security, which caps how many MACs a port may learn, so a flood trips a limit instead of overflowing the table.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The table has a limit',
            text:
              'A MAC table is finite. Flood it with thousands of fake MACs and some switches give up and broadcast everything - which is exactly what an attacker on the wire wants.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know how a switch learns MAC-to-port mappings by watching traffic, and why that beats a dumb hub that shouts to everyone.',
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
        summary: 'ARP maps IP to MAC, and it trusts every answer it hears. That blind trust is the whole attack.',
        estimatedMinutes: 10,
        importance: 'essential',
        blocks: [
          videoSlot('ARP spoofing explained - how one lie lets an attacker read your traffic'),
          {
            type: 'paragraph',
            text:
              'You have an IP packet to send on your local wire, but the frame around it needs a destination MAC. How does your machine turn "I want to reach `192.168.1.1`" into "the MAC for that is `d8:07:b6:00:11:22`"? That translation is ARP, the Address Resolution Protocol - and the important part is that ARP has no way to check whether an answer is true.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a shout and a reply. Your machine broadcasts an ARP request to the whole local segment: "who has `192.168.1.1`? tell me your MAC." Every device hears it, but only the one that owns that IP is supposed to answer, with an ARP reply: "`192.168.1.1` is at `d8:07:b6:00:11:22`." Your machine caches that mapping and uses it to build frames. The flaw: ARP believes any reply it receives, from anyone, with no authentication whatsoever. There is no signature, no check, nothing that proves the replier actually owns that IP.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the ARP-spoofing attack with real addresses. The victim is `192.168.1.5`, the real router is `192.168.1.1` at MAC `cc:cc`, and the attacker is `192.168.1.9` at MAC `ee:ee`, all on the same wire. The attacker sends the victim unsolicited ARP replies claiming "`192.168.1.1` is at `ee:ee`" - the attacker\'s own MAC. The victim, trusting it, updates its cache and now sends all its internet-bound frames to `ee:ee`. The attacker also tells the router "`192.168.1.5` is at `ee:ee`", so the return traffic comes back through them too. The attacker now sits in the middle, reading and able to alter everything, while both sides think they are talking to each other directly.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Attacker tells the victim: "the router (192.168.1.1) is at MY MAC (ee:ee)"',
              'Attacker tells the router: "the victim (192.168.1.5) is at MY MAC (ee:ee)"',
              'Both now route their traffic through the attacker, who sits in the middle',
              'The attacker reads, and can alter, the traffic before forwarding it on',
              'Neither victim sees anything wrong - the conversation still works',
            ],
          },
          {
            type: 'command',
            description: 'Inspect your own ARP cache to see the IP-to-MAC entries your machine currently trusts:',
            commands: ['ip neigh', 'arp -a'],
          },
          {
            type: 'paragraph',
            text:
              'Each line is one IP-to-MAC mapping your machine has cached and will trust when building frames. During a spoofing attack, this is where the lie shows up: if two different IPs (say the router and another host) both suddenly map to the same MAC address, that shared MAC is the attacker\'s, and it is the visible fingerprint of the attack. On a healthy network every active IP maps to its own distinct MAC, so a duplicated MAC across entries is the thing to look for.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters on both sides: ARP spoofing is how an attacker on the same network gets into the middle of a conversation to sniff credentials, hijack sessions, or tamper with responses. It works because ARP has no authentication - a design decision from the 1980s that was never fixed, only bolted over. Defenders add dynamic ARP inspection on switches, static ARP entries for critical hosts, or simply rely on the fact that HTTPS keeps the traffic encrypted even when the attacker sits in the middle, so they capture ciphertext they cannot read.',
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
            text: 'You can explain how a machine-in-the-middle position is set up by poisoning ARP caches, and why the protocol allows it.',
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
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A VLAN (Virtual LAN) lets one physical switch act like several separate networks at once. Devices on different VLANs cannot talk directly, even though they are plugged into the same hardware. Think of separate housing societies sharing one gate but keeping their own resident registers - the guard will not let a resident of one into another just because they came through the same gate.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a small tag added to each frame. When a switch supports VLANs, it stamps every frame with a VLAN ID - a number saying which virtual network it belongs to - and it refuses to forward a frame from VLAN 10 to a port that belongs to VLAN 20. So the switch enforces separation in software: the same box carries traffic for many VLANs but keeps each one\'s frames walled off from the others. For two VLANs to talk on purpose, the traffic must go up to a router that is explicitly configured to route between them.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete company setup. VLAN 10 is guest Wi-Fi, VLAN 20 is staff laptops, VLAN 30 is the servers holding customer data. A visitor connects to guest Wi-Fi and lands on VLAN 10. Even though the servers on VLAN 30 are physically on the same switch, the visitor\'s frames are tagged VLAN 10 and the switch will not forward them to a VLAN 30 port. If a laptop on the guest network is compromised, the attacker is stuck inside VLAN 10 - they can see other guest devices, but the servers are unreachable without also defeating the router\'s rules between VLANs. That containment is the entire point.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Segmentation** - splitting a network so a breach in one part cannot spread everywhere',
              '**VLAN tag** - a numeric label on frames marking which virtual network they belong to',
              '**Inter-VLAN routing** - VLANs can only talk on purpose through a router configured to allow it',
              '**Blast radius** - how far a single compromised device can reach; segmentation shrinks it',
            ],
          },
          {
            type: 'command',
            description: 'On a Linux host you can see and create VLAN interfaces to understand tagging first-hand (read-only view here):',
            commands: ['ip -d link show', 'cat /proc/net/vlan/config'],
          },
          {
            type: 'paragraph',
            text:
              'The first command, with `-d` for detail, shows each interface and marks any VLAN sub-interface with its `vlan` type and the VLAN ID it is tagged with - so you can see, for example, that `eth0.10` carries VLAN 10 traffic. The second file, when the VLAN module is loaded, lists each configured VLAN interface and its ID. Reading these, you are seeing the tag that keeps one virtual network\'s frames from leaking into another - the ID in that output is exactly the number the switch stamps on every frame to decide where it may go.',
          },
          {
            type: 'paragraph',
            text:
              'Why attackers and defenders both care: good segmentation means landing on one machine does not hand you the whole network. Weak or missing segmentation is why a single phishing click sometimes becomes total compromise - once inside, the attacker moves sideways with nothing stopping them. For a defender, VLANs (backed by firewall rules between them) are one of the cheapest ways to make an intrusion expensive: the attacker has to break out of each segment separately instead of roaming freely. Attackers, in turn, look for VLAN misconfigurations that let a frame hop between VLANs it should not.',
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
            text: 'You understand why networks are segmented into VLANs, how a VLAN tag enforces it, and how that contains the blast radius of a breach.',
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
    description:
      'Subnetting that finally clicks through real address ranges, not binary lectures, plus how routers pick the next hop for every packet and how ICMP reports back when something breaks. By the end you can split an IP into network and host, read a /24 or /16 and name its range, describe a routing decision, and use ping, traceroute and their limits in recon.',
    lessons: [
      {
        slug: 'ipv4-addressing-deep',
        title: 'IPv4 Addressing, Properly',
        summary: 'You know an IP is four numbers. Now learn network vs host, and why some ranges are special.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'An IPv4 address is four numbers, each 0 to 255, like `192.168.1.7`. The idea to lock in is that this single address secretly has two parts: one part names the network everyone on your segment shares, and the other names the specific device - the host - on that network. Almost everything about routing and subnetting comes from that split.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism that decides where the split falls is the subnet mask, which the next lesson covers in full. For now, know that the network part is like the name of your housing society and the host part is your flat number: everyone in the society shares the society name, but each flat number is unique. Two devices that share the same network part are neighbours and can talk directly on the wire; two devices with different network parts are strangers, and their traffic must go through a router to reach each other.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. Take `192.168.1.7` on a home network where the mask makes the first three numbers the network. The network part is `192.168.1` and the host part is `7`. Your printer at `192.168.1.30` shares the same network part `192.168.1`, so your phone and the printer talk directly - no router involved. A cloud server at `142.250.72.14` has a completely different network part, so any traffic to it leaves your network through the router. Some ranges are also reserved and never appear on the public internet, which is why your home devices all start with `192.168`.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Private** - `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x` (home and office only, never routed on the public internet)',
              '**Loopback** - `127.0.0.1`, always means "this machine"',
              '**Public** - everything else, reachable across the internet',
              '**Network part** - names the network everyone on the segment shares',
              '**Host part** - names one specific device on that network',
            ],
          },
          {
            type: 'command',
            description: 'See your own IPv4 address and which network it is on:',
            commands: ['ip addr show', 'ipconfig'],
          },
          {
            type: 'paragraph',
            text:
              'In the output, find the line with your address - on Linux it reads something like `inet 192.168.1.7/24`, on Windows it appears as an IPv4 Address with a Subnet Mask beneath it. The address is your host, and the `/24` (or the `255.255.255.0` mask on Windows) tells you the network part is the first three numbers. So `192.168.1.7/24` means "I am device 7 on the 192.168.1 network." That one line tells you your identity and your neighbourhood at the same time.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker or defender cares: the moment you land on a network, the network part of your own address tells you the neighbourhood to explore. If you are `10.0.5.20`, the machines worth scanning are the other `10.0.5.x` hosts sharing your segment - that is where lateral movement starts. Spotting a private range instantly also tells you whether an address you found in a config or a log is an internal machine (interesting, reachable only from inside) or a public one. Defenders watch for private addresses leaking into places they should never appear, like public API responses.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two devices, same network',
            text:
              'If two devices share the same network part, they can talk directly. A different network part means the traffic has to go through a router.',
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
        estimatedMinutes: 10,
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
              'Subnetting scares people because it usually gets taught with binary tables first. Skip that. The entire job of a subnet mask is to say where the network part of an address stops and the host part begins - and the diagram above shows exactly that split, a line drawn through the address. Everything else is reading off ranges.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is the number after the slash, called the prefix length. It counts how many bits from the left belong to the network. The friendly news: `/8`, `/16` and `/24` land neatly on the dots between the four numbers, so you never need binary. A `/24` means the first 24 bits - the first three numbers - are the network, leaving the last number free for hosts. A `/16` means the first two numbers are the network. A `/8` means just the first number. The rest of the address is the host part, and its size is what decides how many devices fit.',
          },
          {
            type: 'paragraph',
            text:
              'Work a real range end to end. Take `192.168.1.0/24`. The network part is `192.168.1`, and the host part is the last number, which runs 0 to 255. Address `192.168.1.0` is reserved as the network address itself, and `192.168.1.255` is the broadcast address, so the usable hosts are `192.168.1.1` through `192.168.1.254` - that is 254 machines. Now widen to `192.168.0.0/16`: the network is `192.168`, the host part is the last two numbers, and the range spans `192.168.0.1` all the way to `192.168.255.254` - over 65,000 addresses. Smaller number after the slash means a bigger network with more hosts.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`/24` = `255.255.255.0` -> first three numbers are the network; usable hosts .1 to .254 (254 hosts)',
              '`/16` = `255.255.0.0` -> first two numbers are the network; roughly 65,000 hosts',
              '`/8` = `255.0.0.0` -> just the first number is the network; about 16 million hosts',
              'Smaller number after the slash = bigger network = more hosts',
            ],
          },
          {
            type: 'paragraph',
            text:
              'One more worked example, the everyday kind. Your phone is `192.168.1.7/24` and the printer is `192.168.1.30`. Both start `192.168.1`, both fall in the 1-to-254 range of that `/24`, so they are on the same network and talk directly. A server at `10.0.0.5` starts with a different network part entirely, so it is on another network and that traffic goes through a router. You just answered "can these two devices talk directly?" purely by comparing ranges - no bit arithmetic anywhere.',
          },
          {
            type: 'command',
            description: 'Read your own address and mask together (the number after the slash is the prefix):',
            commands: ['ip -brief addr', 'ipconfig'],
          },
          {
            type: 'paragraph',
            text:
              'The `-brief` view prints one tidy line per interface: the interface name, its state, and its address with the prefix, like `192.168.1.7/24`. That `/24` is your subnet mask in shorthand - it tells you your network is `192.168.1` and the usable hosts around you run `.1` to `.254`. On Windows, `ipconfig` shows the same thing as a separate Subnet Mask line (`255.255.255.0` is a `/24`). From that single value you can immediately state your network\'s range without touching a calculator.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker counts this: the prefix tells you how big your target neighbourhood is before you scan a single host. A `/24` means up to 254 machines could be sitting on the same segment as you - a quick, finite sweep. A `/16` means tens of thousands, so you scope and prioritise instead of blindly scanning everything. When you feed a scanner a target like `192.168.1.0/24`, you are handing it exactly this range, and knowing the range keeps you from either missing hosts or wasting hours on an oversized sweep. Defenders use the same maths to size their monitoring.',
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
            text: 'You can read `/24` or `/16`, say which part of the address is the network, name the actual range, and roughly how many hosts fit - no bit-counting needed.',
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
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'When a packet needs to leave your network, a router decides where it goes next. The surprising part: no single router knows the whole route to the destination. Each one only knows the next hop, and it trusts the next router to know the hop after that. Delivery across the internet is a chain of small, local decisions.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is the routing table - a list of "for this network, send toward that next hop" rules. When a packet arrives, the router reads its destination IP and looks for the most specific matching network in the table. Most specific wins: a rule for `142.250.72.0/24` beats a broad `0.0.0.0/0` catch-all if both match, because it describes a narrower, more exact destination. The matching rule names either a next-hop router or a directly connected interface, and the packet is forwarded there. Then the whole thing repeats at the next router.',
          },
          {
            type: 'paragraph',
            text:
              'It is like asking for directions on a road trip. You do not need the full map from Bangalore to Delhi - you just need "next, get on NH44 heading north". At the next junction you ask again. Each router hands the packet one step closer using its own table, and if a router has no specific rule for the destination, it falls back to its default route - the equivalent of "if you do not know, just head to the main highway and let the next junction figure it out". That default route points at the default gateway.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Packet arrives carrying a destination IP',
              'Router checks its routing table for the most specific matching network',
              'The matching rule says which next hop or interface leads that way',
              'Packet is forwarded there; the process repeats at the next router',
              'No specific match? Send it to the default gateway (the default route)',
            ],
          },
          {
            type: 'command',
            description: 'Look at your own routing table and default gateway:',
            commands: ['ip route', 'route print'],
          },
          {
            type: 'paragraph',
            text:
              'The output is your machine\'s routing table, one rule per line. The line beginning `default via 192.168.1.1` is your default route - it says "anything I do not have a specific rule for, send to `192.168.1.1`", which is your home router. Other lines like `192.168.1.0/24 dev wlan0` mean "hosts on my own local network I reach directly out of the Wi-Fi interface, no router needed". Reading these two kinds of line, you can tell exactly which destinations your machine handles locally and which it hands off to the gateway.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: the routing table and default gateway define the paths traffic can take, and controlling a path means controlling the traffic. An attacker who can inject a false route (or, at layer 2, become the default gateway via ARP spoofing) redirects a victim\'s traffic through themselves. A defender reads the routing table to spot exactly that - an unexpected route or a gateway pointing somewhere it should not. Knowing the default gateway is also the first thing you note after landing on a network: it is the door to everything beyond your own segment.',
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
            text: 'You can describe how a router picks the next hop from its table, why most-specific wins, and what the default gateway is for.',
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
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'IPv6 addresses look scary - `2405:200:1630::1` - but the job is identical to IPv4: name a device so replies can find it. The only reason IPv6 exists is that the world ran out of the short IPv4 addresses. Everything you learned about network parts, routing and hosts still applies; the numbers are just longer and written differently.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a bigger address space written in a shorter notation. IPv4 has about 4.3 billion addresses; with billions of phones, laptops and smart devices, that ran out. IPv6 uses 128-bit addresses - so many that scarcity effectively disappears. To keep them readable, IPv6 is written in hexadecimal groups separated by colons, and a run of all-zero groups is collapsed to a double colon `::`. That shorthand is the one piece of notation that trips people up, so it is worth pinning down with an example.',
          },
          {
            type: 'paragraph',
            text:
              'Expand one concrete address. The loopback `::1` is the IPv6 version of `127.0.0.1` - it always means "this machine". Written in full it is `0000:0000:0000:0000:0000:0000:0000:0001`, and the `::` simply stands in for all those zero groups. Similarly `2405:200:1630::1` is `2405:200:1630` followed by enough zero groups to fill the address, ending in `1`. The `::` can appear only once in an address, because otherwise you could not tell how many zero groups each one replaced. Read it as "these groups, then zeros, then these groups".',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'IPv4 has about 4.3 billion addresses - the world blew past that',
              'IPv6 has a practically endless supply (128-bit addresses)',
              'Written in hexadecimal, separated by colons, with `::` collapsing a run of zero groups',
              '`::1` is the IPv6 loopback, the same idea as `127.0.0.1`',
            ],
          },
          {
            type: 'command',
            description: 'See whether your machine has an IPv6 address:',
            commands: ['ip -6 addr', 'ipconfig'],
          },
          {
            type: 'paragraph',
            text:
              'The output lists your IPv6 addresses per interface. You will usually see at least one line starting `fe80::` - that is a link-local address, valid only on the local wire, and almost every IPv6-capable interface has one. If you also see a line starting with a global range (like `2401:` or `2405:`), your machine has a public IPv6 address reachable from the internet. Reading these, you can tell at a glance whether the device is IPv6-connected to the wider world or only speaking IPv6 to its immediate neighbours.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker or defender cannot skip it: a target may be fully reachable over IPv6 even when its IPv4 looks locked down. Firewall rules and scans are sometimes written for IPv4 only and quietly forget IPv6 exists, leaving a wide-open second front door. In recon, if a host has an AAAA DNS record (the IPv6 equivalent of an A record), it is worth scanning over IPv6 too. Defenders make the mirror-image mistake: they harden IPv4 and leave IPv6 rules missing, so a service they believe is firewalled is actually exposed on its IPv6 address.',
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
            text: 'You can read an IPv6 address, know what `::` means, tell a link-local from a global address, and explain why IPv6 was needed at all.',
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
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('ICMP explained - the protocol that powers ping, traceroute and error messages'),
          {
            type: 'paragraph',
            text:
              'ICMP is the network\'s way of sending status and error messages. It does not carry your actual data - no web pages, no video - it carries the little "are you there?" and "that did not work" notes that keep the network diagnosable. Two tools you will use constantly, ping and traceroute, are built entirely on it.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a small set of message types that routers and hosts send when something needs reporting. Ping uses an echo request and echo reply: your machine sends an ICMP echo request, and if the host is up and willing, it sends an echo reply straight back. Traceroute is cleverer - it relies on the TTL (time to live) field, a hop counter on every packet. Each router that forwards a packet decrements the TTL by one, and when the TTL hits zero, that router throws the packet away and sends back an ICMP "time exceeded" message. Traceroute abuses this on purpose.',
          },
          {
            type: 'paragraph',
            text:
              'Walk exactly how traceroute maps a path. It sends a packet with TTL set to 1. The very first router decrements it to 0, drops it, and replies "time exceeded" - so traceroute learns the first hop\'s address. Then it sends another packet with TTL 2, which dies at the second router and reveals hop two. TTL 3 reveals hop three, and so on, until a packet finally survives to the destination, which replies normally. By walking the TTL up one at a time, traceroute tricks each router along the path into announcing itself in order. The whole route map is just a series of these deliberate time-exceeded replies.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Echo request / echo reply** - what ping uses to check reachability',
              '**Time exceeded** - a packet ran out of TTL hops; traceroute uses this to map the route',
              '**Destination unreachable** - the network telling you it could not deliver the packet',
            ],
          },
          {
            type: 'command',
            description: 'Use ICMP-based tools on a host you are allowed to test:',
            commands: ['ping -c 4 example.com', 'traceroute example.com', 'tracert example.com'],
          },
          {
            type: 'paragraph',
            text:
              'The `ping` output prints one line per reply with a `time=` value in milliseconds - that round-trip time tells you both that the host is up and how far away it feels; `-c 4` stops it after four probes. At the end it summarises packet loss, and any loss above zero on a stable link hints at congestion or a flaky path. The `traceroute` (or `tracert` on Windows) output is the ordered list of hops from the process above: line 1 is your router, later lines march toward the target, and `* * *` on a line means that hop declined to send a time-exceeded reply, which is common and not a failure.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: ICMP is your first, cheapest recon, but its answers lie by omission. Many hosts and firewalls deliberately drop ICMP, so a silent ping does NOT mean the host is down - it may simply be ignoring you while running services happily on other ports. Calling a host dead on ping alone is a classic beginner mistake that skips real targets. Defenders exploit this the other way, dropping ICMP to make hosts look absent to a lazy scan; and they watch for a flood of ICMP as a sign of network mapping in progress.',
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
            text: 'You know ICMP carries the network\'s status and error messages, how traceroute walks the TTL to map a path, and why a silent ping is not proof a host is down.',
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
