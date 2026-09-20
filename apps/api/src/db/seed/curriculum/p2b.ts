import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'tcp-deep-dive',
    title: 'TCP Deep Dive',
    description:
      'How TCP turns an unreliable network into a dependable, ordered conversation: the handshake that starts it, the flags that steer it, the sequence numbers that reassemble it, and the windows that pace it. By the end you can read a Wireshark stream, explain why a SYN scan works, and say what a SYN flood or a reset injection is really doing to those fields.',
    lessons: [
      {
        slug: 'tcp-three-way-handshake',
        title: 'The Three-Way Handshake',
        summary: 'Before TCP sends a single byte of your data, both sides say hello three times. That little ritual is why the web is reliable.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('The TCP three-way handshake in Wireshark - SYN, SYN-ACK, ACK, byte by byte'),
          {
            type: 'paragraph',
            text:
              'Every TCP connection - every web page, every SSH login, every API call - starts with a three-step handshake. Think of it like a phone call: you say hello, they say hello back, you confirm you heard them. Only then does the actual talking begin. TCP does the same thing so both sides agree the line is open before anyone trusts it with real data.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, step by step. The client sends a packet with the **SYN** flag set (SYN means "synchronise") carrying a random starting number. The server replies with **SYN-ACK**: it sets both the SYN flag (its own hello) and the ACK flag (acknowledging yours). Finally the client sends an **ACK**, acknowledging the server. Three packets, and now both ends have agreed on their starting sequence numbers and know the other side is alive and listening. That agreement is the whole point - it stops a machine from dumping data at a port nobody is actually reading.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete example with real numbers. Your browser opens `example.com:443`. Packet 1: client sends SYN with sequence number 1000. Packet 2: server sends SYN-ACK with its own sequence number 5000 and ACK = 1001 (your number plus one, meaning "got your 1000, expecting 1001 next"). Packet 3: client sends ACK = 5001 (their number plus one). The connection is now ESTABLISHED. Every byte of the HTTPS request that follows is counted from those agreed starting points, which is how the two sides keep the stream in order later.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**SYN** - client to server: "I want to talk, my sequence starts at X"',
              '**SYN-ACK** - server to client: "OK, my sequence starts at Y, and I got your X"',
              '**ACK** - client to server: "Got your Y, we are connected"',
              'The ACK number is always the other side\'s sequence number plus one',
              'After the third packet the state is ESTABLISHED and data can flow',
            ],
          },
          {
            type: 'command',
            description: 'Capture a real handshake to your own allowed target, filtered to just the SYN and SYN-ACK packets:',
            commands: ['sudo tcpdump -n -c 4 "tcp[tcpflags] & (tcp-syn|tcp-ack) != 0 and host example.com"'],
          },
          {
            type: 'paragraph',
            text:
              'In that capture the first line will show `Flags [S]` - that is the client SYN. The next shows `Flags [S.]`, where the dot is the ACK bit, so that is the server\'s SYN-ACK. The third shows `Flags [.]`, a bare ACK, the client finishing the handshake. If you only ever see the `[S]` going out and never a `[S.]` coming back, the port is closed or filtered - the server is not agreeing to talk, and that silence is itself a finding.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker: the handshake is exactly what a port scanner probes. A full-connect scan completes all three steps; a stealth SYN scan sends the SYN, reads the reply, and never sends the final ACK - a SYN-ACK back means "open", a RST back means "closed", and silence means "filtered". A SYN flood abuses the same ritual: the attacker sends thousands of SYNs and never completes them, leaving the server holding half-open connections until it runs out of room for real users. Understanding the three packets is understanding both how you map a target and how that mapping gets weaponised.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Half-open is a real state',
            text:
              'Between the SYN-ACK and the final ACK, the connection is "half-open" and the server is holding resources waiting for you. That waiting window is what a SYN flood attacks - it never sends the third packet.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a three-way handshake packet by packet and explain why an open port answers a SYN differently from a closed one.',
          },
          {
            type: 'quiz',
            question: 'In a TCP handshake, what does the server send in response to a client SYN?',
            options: ['Another SYN', 'A SYN-ACK', 'A plain ACK', 'A RST'],
            correctIndex: 1,
            explanation: 'The server replies with SYN-ACK: SYN for its own hello, ACK to acknowledge the client. A RST would mean the port is closed.',
          },
        ],
      },
      {
        slug: 'tcp-flags-and-states',
        title: 'TCP Flags and Connection States',
        summary: 'Six little bits steer every TCP connection from birth to death. Learn to read them and a packet capture starts telling a story.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Every TCP packet carries a set of one-bit flags that say what the packet is FOR: start a connection, acknowledge data, close politely, or slam the door. Six of them do almost all the work. Read the flags and you can tell what stage a connection is in without seeing the data at all.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a state machine. A connection is always in exactly one state - LISTEN, SYN-SENT, ESTABLISHED, FIN-WAIT, CLOSED, and a few more - and a flag is what moves it between states. SYN moves you toward ESTABLISHED. FIN begins a graceful shutdown, where each side says "I am done sending" and waits for the other to finish too. RST is the opposite of graceful: it forcibly kills the connection right now, no goodbye, and is what a machine sends when a packet arrives for a port or connection it knows nothing about.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a full connection life with real flags. Handshake: `SYN`, `SYN-ACK`, `ACK`. Data flows, every packet carrying `ACK` to confirm what it received (ACK is set on almost everything after the handshake). Shutdown: one side sends `FIN-ACK` meaning "I am finished sending", the other replies `ACK`, then sends its own `FIN-ACK`, and the first replies `ACK`. Four packets to close cleanly. Now contrast the ugly path: you send data to a port that closed, and you get back a single packet with `RST` - the connection is dead instantly, which is exactly the reply a closed port gives a scanner.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SYN** - open a connection, synchronise sequence numbers',
              '**ACK** - acknowledge received data; set on nearly every packet after the handshake',
              '**FIN** - "I am finished sending", start a graceful close',
              '**RST** - reset, kill the connection immediately with no handshake',
              '**PSH** - push, "deliver this to the app now, do not buffer it"',
              '**URG** - urgent, rarely used and often a red flag when it shows up',
            ],
          },
          {
            type: 'command',
            description: 'Watch flags live on your own machine while you make a connection in another terminal:',
            commands: ['sudo tcpdump -n "tcp and host example.com" -v'],
          },
          {
            type: 'paragraph',
            text:
              'tcpdump prints the flags in square brackets: `[S]` is SYN, `[S.]` is SYN-ACK, `[.]` is a bare ACK, `[P.]` is push plus ACK (real data being delivered), `[F.]` is FIN plus ACK (a polite close starting), and `[R]` or `[R.]` is a reset. So a healthy short-lived request reads like a sentence: `[S] [S.] [.] [P.] [.] [F.] [F.] [.]` - open, talk, close. If you instead see `[S]` immediately answered by `[R.]`, that port is closed and just told you so.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: flags are the raw material of scanning and of attacks. A SYN scan reads SYN-ACK-versus-RST to map open ports. Odd flag combinations - a FIN with no prior connection (a FIN scan), or all flags set at once (an Xmas scan) - are old tricks to slip past simple firewalls and to fingerprint an operating system by how it reacts. A forged RST injected into someone else\'s connection can tear it down mid-conversation, which is how some censorship systems and hijack attacks work. When you read a capture, the flags are the plot; the payload is just the dialogue.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A lone RST is a message',
            text:
              'If your SYN gets an instant RST back, the host is up but the port is closed - it is actively refusing, not ignoring you. Silence (no reply at all) usually means a firewall is dropping the packet instead.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can read the flag field of any TCP packet and say which state the connection is in and what happens next.',
          },
          {
            type: 'related_lesson', lessonSlug: 'tcp-three-way-handshake', title: 'Recap: The Three-Way Handshake' },
          {
            type: 'quiz',
            question: 'A host answers your SYN with a packet that has only the RST flag set. What does that mean?',
            options: [
              'The port is open and waiting',
              'The port is closed and refusing the connection',
              'A firewall silently dropped your packet',
              'The connection is established',
            ],
            correctIndex: 1,
            explanation: 'A RST is an active refusal: the host is up but nothing is listening on that port. A silent drop (no reply) is what a filtering firewall does instead.',
          },
        ],
      },
      {
        slug: 'sequence-numbers-and-acks',
        title: 'Sequence Numbers and ACKs',
        summary: 'TCP promises your data arrives complete and in order over a network that guarantees neither. Two counters make that promise real.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The internet does not deliver packets in order, and sometimes it loses them entirely. Yet when you download a file it arrives perfect and complete. TCP pulls that off with two numbers on every packet: a sequence number that says "this chunk starts at byte N", and an acknowledgement number that says "I have received everything up to byte M".',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism. TCP treats your data as one long stream of bytes and numbers every byte. Each packet\'s sequence number is the position of its first byte in that stream. The receiver replies with an ACK number equal to the next byte it expects - which is a compact way of saying "I have everything below this". If a packet goes missing, the receiver keeps ACKing the same number (the byte it is still waiting for), and the sender, seeing that stall, retransmits the missing chunk. Out-of-order arrivals get parked in a buffer and slotted into place using their sequence numbers, so the app upstairs always reads a clean, ordered stream.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. Say the handshake agreed a starting sequence of 1000. The sender ships 500 bytes: sequence 1000, covering bytes 1000-1499. The receiver replies ACK 1500 ("send me 1500 next"). The sender ships the next 500: sequence 1500. But that packet is lost. The sender then ships sequence 2000, which arrives - the receiver holds it in a buffer and ACKs 1500 again, because 1500 is still the gap. After a few duplicate 1500 ACKs the sender retransmits sequence 1500. Now the receiver has 1500-1999 and 2000-2499, stitches them together, and jumps its ACK to 2500. The hole is filled without the app ever noticing.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Sequence number** - the byte position where this packet\'s data starts',
              '**Acknowledgement number** - the next byte the receiver expects (everything below is safe)',
              'Lost packet - the receiver keeps ACKing the same number until the gap is filled',
              'Duplicate ACKs are the signal that triggers a fast retransmit',
              'Starting numbers are randomised at the handshake, not started from zero, for safety',
            ],
          },
          {
            type: 'command',
            description: 'See relative sequence and ACK numbers in a capture (Wireshark shows them relative to the start, which is easier to read):',
            commands: ['sudo tcpdump -n -S "tcp and host example.com"'],
          },
          {
            type: 'paragraph',
            text:
              'Each line shows something like `seq 1:501, ack 1` - the `seq 1:501` means "this packet carries bytes 1 through 500 of the stream", and `ack 1` on the reply means "I have byte 0, send me byte 1 next". Watch the ack number climb steadily and you are watching data being confirmed in real time. If you see the same ack number repeated several times in a row while sequence numbers keep advancing, you are literally watching a lost packet: the receiver is stuck asking for the same byte while later data piles up.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker: sequence numbers are a security control, not just plumbing. If they were predictable, an attacker who could not see your traffic could still guess the right numbers and inject forged packets into your connection - old TCP stacks with weak randomisation were hijacked exactly this way. That is why modern stacks pick a random starting sequence. When you read a capture, the sequence and ACK columns tell you whether a connection is healthy, stalling, or being tampered with, long before the payload does.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'ACK means "everything below", not "this one"',
            text:
              'An ACK number is the next byte expected, so it confirms every byte before it at once. That is why one ACK can cover several data packets - TCP does not need to acknowledge each packet separately.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read sequence and ACK numbers in a capture and spot a lost, retransmitted, or out-of-order packet on sight.',
          },
          {
            type: 'quiz',
            question: 'A receiver keeps sending the same ACK number while the sender keeps sending higher sequence numbers. What is happening?',
            options: [
              'The connection is closing',
              'A packet was lost and the receiver is waiting for it',
              'The data is encrypted',
              'The handshake failed',
            ],
            correctIndex: 1,
            explanation: 'A repeated ACK means the receiver is still waiting for a missing byte range. The duplicate ACKs eventually trigger the sender to retransmit the lost packet.',
          },
        ],
      },
      {
        slug: 'flow-control-and-sliding-window',
        title: 'Flow Control and the Sliding Window',
        summary: 'A fast sender can drown a slow receiver. TCP stops that with a window the receiver controls - it literally tells the sender when to slow down.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Imagine pouring water into a cup faster than someone can drink it - it overflows and spills. A fast server sending to a slow phone has the same problem. TCP solves it with flow control: the receiver advertises how much data it can hold right now, and the sender is not allowed to send past that. That advertised amount is the window.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a "sliding window" of allowed bytes. Every ACK the receiver sends also carries a **window size**: the number of extra bytes it currently has buffer space for. The sender may have that many bytes "in flight" (sent but not yet acknowledged) and no more. As the receiver\'s app reads data out of the buffer, space frees up, the advertised window grows, and the sender is allowed to push more. The window slides forward along the byte stream as data is acknowledged - hence the name. If the receiver\'s buffer fills, it advertises a window of zero, and the sender simply stops until told there is room again.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. The receiver advertises a window of 4000 bytes. The sender ships 4000 bytes and must now wait - that is the full window in flight, unacknowledged. The receiver\'s app reads 2000 of those bytes out of the buffer, so 2000 bytes of room reopen. In its next ACK the receiver advertises window 2000, and the sender may send 2000 more. The app is slow and does not read anything for a moment; the buffer stays full; the receiver advertises window 0, and the sender pauses entirely. When the app finally reads, the receiver sends a "window update" with room again, and the flow resumes. At no point does the sender overflow the receiver.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Window size** - bytes the receiver can currently accept, sent on every ACK',
              '**In flight** - bytes sent but not yet acknowledged; must not exceed the window',
              '**Window 0** - "stop sending, my buffer is full" - a legitimate, common state',
              '**Window update** - the receiver saying room has reopened, resume sending',
              'Flow control protects the RECEIVER; congestion control (next lesson) protects the NETWORK',
            ],
          },
          {
            type: 'command',
            description: 'Watch the advertised window shrink and grow during a transfer to your own allowed target:',
            commands: ['sudo tcpdump -n "tcp and host example.com" | grep -o "win [0-9]*"'],
          },
          {
            type: 'paragraph',
            text:
              'Each `win NNNN` you see is the sender of that packet telling the other side how many bytes it can currently accept. During a healthy download the client\'s advertised window stays comfortably large. If you see it drop toward `win 0`, the receiving side cannot keep up - its buffer is full because the app is reading slowly - and the transfer will stall until a window update reopens it. That is not a bug; it is flow control doing its job, and it is a normal thing to see under load.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: the window is another field an attacker can abuse. A "zero-window" denial-of-service (sometimes called a sockstress or slowloris-style trick at the TCP layer) opens a connection, then advertises a tiny or zero window, forcing the server to hold the connection open and buffered indefinitely - tie up enough of these and the server runs out of connection slots for real users, using almost no bandwidth to do it. Reading window sizes in a capture also tells a defender whether a slow transfer is the network\'s fault or the endpoint\'s.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two different "slow down" mechanisms',
            text:
              'Flow control is the receiver saying "I am full". Congestion control is the sender guessing the NETWORK is full. They work together but solve different problems - do not mix them up.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can explain the sliding window, read the advertised window in a capture, and tell a healthy pause from a receiver in trouble.',
          },
          {
            type: 'practice_ref', title: 'TCP Deep Dive check', exerciseSlug: 'tcp-deep-dive-quiz' },
          {
            type: 'quiz',
            question: 'A receiver advertises a TCP window of 0. What must the sender do?',
            options: [
              'Send data twice as fast to catch up',
              'Stop sending until the receiver advertises room again',
              'Close the connection with a RST',
              'Ignore the window and keep sending',
            ],
            correctIndex: 1,
            explanation: 'A zero window means the receiver\'s buffer is full. The sender must pause and wait for a window update before sending more.',
          },
        ],
      },
      {
        slug: 'congestion-control',
        title: 'Congestion Control',
        summary: 'Flow control watches the receiver. Congestion control watches the network in between - and it does it by guessing from lost packets.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The receiver can tell you how much IT can handle, but nobody tells TCP how much the NETWORK in between can handle. Routers along the way have limited buffers, and if everyone blasts data at full speed those buffers overflow and packets get dropped. Congestion control is TCP\'s way of finding the network\'s speed limit on its own, by carefully probing and backing off.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism uses a second, private window the sender keeps to itself: the **congestion window**. The sender may transmit only up to the smaller of the receiver\'s advertised window and its own congestion window. It starts small (slow start), doubling roughly every round trip while everything is arriving. When a packet is lost - which TCP reads as "the network is full" - the sender sharply cuts the congestion window and then grows it more cautiously (congestion avoidance). So the sending rate looks like a sawtooth: climb, hit loss, drop, climb again, forever hunting the edge of what the path can carry.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. A download begins in slow start: 1 segment, then 2, then 4, then 8 - doubling each round trip as ACKs return. It reaches 64 segments in flight and a router on the path drops one. The sender sees the loss (via duplicate ACKs), halves its congestion window to 32, and switches to congestion avoidance, now adding roughly one segment per round trip instead of doubling. It creeps up to 40, loses another, drops to 20, climbs again. That endless climb-and-halve is why a big download\'s speed graph is jagged rather than a flat line - TCP is constantly re-measuring a limit that keeps moving as other traffic comes and goes.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Congestion window** - the sender\'s private limit, separate from the receiver\'s window',
              '**Slow start** - begin small, double each round trip until the first loss',
              '**Congestion avoidance** - after loss, grow slowly (roughly one segment per round trip)',
              'Actual send limit = the SMALLER of the congestion window and the receiver window',
              'Loss is the signal; modern variants (BBR, CUBIC) refine how they react to it',
            ],
          },
          {
            type: 'command',
            description: 'On Linux, see which congestion control algorithm your machine is using:',
            commands: ['sysctl net.ipv4.tcp_congestion_control', 'sysctl net.ipv4.tcp_available_congestion_control'],
          },
          {
            type: 'paragraph',
            text:
              'The first command prints the algorithm in use, commonly `cubic` on modern Linux, sometimes `bbr` on servers tuned for throughput. The second lists everything the kernel could switch to. This matters because the algorithms disagree on what a lost packet means: classic CUBIC treats loss as congestion and backs off, while BBR models the path\'s bandwidth and delay directly and reacts differently. Knowing which one is running explains why two servers on the same link can behave very differently under load.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: congestion control shapes what your own tools do. A scanner or a fuzzer that hammers a target as fast as TCP allows will ride these limits, and its traffic pattern - bursts, backoffs, retransmits - is exactly what a defender\'s monitoring notices. On the defence side, understanding that loss drives backoff explains why a small amount of induced packet loss can throttle an attacker, and why congestion behaviour is one of the fingerprints used to tell a real browser from a crude script.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two windows, one send rate',
            text:
              'The sender obeys the smaller of the receiver window and the congestion window. Either one being small slows you down - so a slow transfer might be the receiver OR the network, and only the capture tells you which.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain why TCP throughput sawtooths, and name the difference between slow start and congestion avoidance.',
          },
          {
            type: 'quiz',
            question: 'What does classic TCP congestion control treat as the main signal that the network is overloaded?',
            options: ['A zero window from the receiver', 'A lost (dropped) packet', 'A RST flag', 'A DNS timeout'],
            correctIndex: 1,
            explanation: 'Packet loss is the classic congestion signal: the sender reads it as "the network is full" and reduces its congestion window.',
          },
        ],
      },
      {
        slug: 'mtu-fragmentation-and-mss',
        title: 'MTU, MSS and Fragmentation',
        summary: 'Packets have a size limit. What happens when your data is bigger than the wire allows has caused more mysterious outages than almost anything.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A single packet can only be so big before the network refuses to carry it in one piece. That limit is the MTU - Maximum Transmission Unit - and on ordinary Ethernet it is 1500 bytes. Send more than that and it either gets chopped into pieces (fragmentation) or dropped, and a surprising number of "the site loads for me but not for you" mysteries trace straight back to this number.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, and the two related numbers. **MTU** is the biggest packet a given link will carry, headers included - 1500 bytes on standard Ethernet. **MSS** (Maximum Segment Size) is the biggest chunk of actual DATA TCP will put in one packet, which is the MTU minus the IP and TCP headers (typically 1500 - 40 = 1460 bytes). The two ends agree an MSS during the handshake so TCP simply never builds a packet too big for the path - it slices your stream into MSS-sized segments before sending. Fragmentation, by contrast, is IP\'s cruder fallback: if a packet is already too big for a link it crosses, a router splits it into fragments that the destination must reassemble.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete failure. Suppose there is a VPN or tunnel somewhere on the path with an MTU of 1400, not 1500. Your machine, assuming 1500, sends a full 1500-byte packet with the "Do not fragment" bit set (which is normal today). The router at the 1400 link cannot forward it and cannot split it, so it drops the packet and sends back an ICMP "fragmentation needed" message telling your machine to use 1400. If a firewall blocks that ICMP message - and many do, thinking they are being safe - your machine never learns, keeps sending 1500-byte packets, and they keep vanishing. Small requests work, large ones hang forever. That maddening "SSH connects but large transfers freeze" bug is almost always this: a black-holed path MTU.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**MTU** - largest packet a link carries, headers included (1500 on Ethernet)',
              '**MSS** - largest data payload per TCP segment (MTU minus IP+TCP headers, ~1460)',
              '**Fragmentation** - IP splitting an oversized packet; reassembled at the destination',
              '**Path MTU Discovery** - finding the smallest MTU along the route, using ICMP feedback',
              'Blocked ICMP breaks Path MTU Discovery - the classic cause of stalled large transfers',
            ],
          },
          {
            type: 'command',
            description: 'Probe the path MTU yourself by sending a large ping that is not allowed to fragment (drop the size until it succeeds):',
            commands: ['ping -M do -s 1472 -c 2 example.com', 'ping -M do -s 1400 -c 2 example.com'],
          },
          {
            type: 'paragraph',
            text:
              'The `-s 1472` is 1500 minus the 28-byte ICMP and IP overhead, so it fills a standard Ethernet packet exactly. If that succeeds, the whole path handles 1500. If it fails with "message too long" or just times out but `-s 1400` succeeds, you have found a smaller MTU on the route - the largest working size plus 28 is the real path MTU. This is the manual version of what Path MTU Discovery does automatically, and running it by hand is how you prove a stalled-transfer problem is an MTU black hole rather than something else.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: fragmentation was long abused to evade detection. Splitting an attack across many tiny IP fragments could slip past older intrusion-detection systems that inspected each fragment alone and never reassembled them the way the target would - the malicious pattern only appeared after reassembly. Overlapping-fragment tricks exploited the fact that different operating systems reassemble conflicting fragments differently. Modern defences reassemble before inspecting, but the technique is why "how does the target put these pieces back together?" is still a fingerprinting question.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not blanket-block ICMP',
            text:
              'Blocking all ICMP feels secure but silently breaks Path MTU Discovery, black-holing large packets. If big transfers hang while small ones work, suspect a dropped ICMP "fragmentation needed" message.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell MTU from MSS, explain why a big transfer stalls while small ones work, and measure a path MTU by hand.',
          },
          {
            type: 'quiz',
            question: 'On standard Ethernet with an MTU of 1500 bytes, what is the typical TCP MSS?',
            options: ['1500 bytes', '1460 bytes', '576 bytes', '65535 bytes'],
            correctIndex: 1,
            explanation: 'MSS is the MTU minus the IP header (20) and TCP header (20), so 1500 - 40 = 1460 bytes of actual data per segment.',
          },
        ],
      },
    ],
  },
  {
    slug: 'udp-dns-and-friends',
    title: 'UDP, DNS and Friends',
    description:
      'The stateless half of the internet: UDP fires packets with no handshake and no guarantees, and the services built on it - DNS above all - inherit both its speed and its fragility. By the end you can explain when UDP beats TCP, read a DNS lookup record by record, and describe how spoofing, cache poisoning and DNS rebinding turn the internet\'s address book against its users.',
    lessons: [
      {
        slug: 'udp-deep-dive',
        title: 'UDP Deep Dive',
        summary: 'No handshake, no acknowledgements, no promises. UDP is TCP with the safety features removed - and for some jobs that is exactly what you want.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'TCP is a phone call - you connect, confirm, and know every word landed. UDP is a postcard - you write it, drop it in the box, and hope. No handshake, no acknowledgements, no ordering, no retransmission. That sounds worse, and for a file download it is. But for a live voice call or a game, where a late packet is useless anyway, throwing it away and moving on beats waiting for it.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is deliberate minimalism. A UDP packet (called a datagram) has a tiny 8-byte header: source port, destination port, length, and a checksum. That is the entire protocol - there is no connection state on either side, so the sender never learns whether the packet arrived. If reliability or ordering is needed, the APPLICATION on top has to build it itself. This is why UDP is fast and cheap: no round trip to set up, no buffers to track in-flight bytes, no waiting on ACKs. You send, and the packet either arrives or it does not.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. Your phone does a DNS lookup for `example.com` over UDP to port 53. It sends one small datagram: "what is the IP for example.com?" The resolver sends back one datagram: "93.184.216.34". Two packets, no handshake - the whole exchange is done before a TCP connection would even have finished saying hello. If the reply is lost, the phone simply asks again after a short timeout. For a one-shot question with a one-shot answer, paying for TCP\'s reliability machinery would only add delay for no benefit.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**No handshake** - the first packet carries real data, saving a round trip',
              '**No delivery guarantee** - lost packets are simply gone unless the app resends',
              '**No ordering** - packets can arrive out of sequence; the app must cope',
              '**8-byte header** - source port, destination port, length, checksum',
              'Used by DNS, DHCP, VoIP, video streaming, gaming, and QUIC/HTTP3',
            ],
          },
          {
            type: 'command',
            description: 'Watch a UDP DNS query and its reply on your own machine:',
            commands: ['sudo tcpdump -n -c 2 "udp port 53"'],
          },
          {
            type: 'paragraph',
            text:
              'You will see two lines and no handshake around them - that is the tell. The first line is your query going out to port 53; the second is the answer coming straight back. There is no `[S]`, no `[S.]`, no `[.]` - none of the TCP flag machinery, because UDP has no connection to set up. Just a question and an answer. If you run the same capture watching a web page load you would see the TCP handshake first; here the data IS the first packet, which is the whole speed advantage of UDP in one screen.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker: UDP\'s lack of a handshake makes it the darling of amplification attacks. Because the sender is never verified, an attacker can forge the source address to be the victim\'s, send a tiny query to a service like DNS or NTP, and the big reply gets dumped on the victim - a small spoofed packet triggering a huge response the target never asked for. UDP also makes port scanning harder and slower: an open UDP port often stays silent, so "no reply" is ambiguous, whereas a closed one may send an ICMP "port unreachable". That ambiguity is why UDP scans take far longer than TCP ones.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Fast because it forgets',
            text:
              'UDP is fast precisely because it keeps no state and makes no promises. When you need reliability on top of it, the app has to build it - which is exactly what QUIC (the protocol behind HTTP/3) does.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain when UDP beats TCP, name what its tiny header contains, and say why UDP scanning is slow and ambiguous.',
          },
          {
            type: 'related_lesson', lessonSlug: 'tcp-three-way-handshake', title: 'Compare: The Three-Way Handshake' },
          {
            type: 'quiz',
            question: 'Which of these does UDP NOT provide on its own?',
            options: ['Port numbers', 'Guaranteed, in-order delivery', 'A checksum', 'Low overhead'],
            correctIndex: 1,
            explanation: 'UDP has ports, a checksum and low overhead, but no delivery or ordering guarantees. If an app needs those, it must build them itself.',
          },
        ],
      },
      {
        slug: 'dns-records-and-resolution',
        title: 'DNS Records and Resolution',
        summary: 'You type a name, you reach a machine. In between, a chain of servers does a relay race to turn "example.com" into an address. Here is every leg of it.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('One DNS lookup, start to finish - root to TLD to authoritative, animated'),
          {
            type: 'paragraph',
            text:
              'Computers talk in IP addresses; humans remember names. DNS is the translator, and it works like the internet\'s giant contact list. But there is no single list - it is split across a hierarchy of servers, and resolving one name is a short relay race between them. Understanding that race is how you understand both caching bugs and half the recon you will ever do.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, leg by leg. Your device asks a **resolver** (usually your ISP\'s or something like 8.8.8.8). If the resolver does not already know the answer, it asks a **root** server, which does not know the address but knows who runs `.com` and points there. The resolver asks the **.com TLD** server, which points at the **authoritative** server for `example.com`. The resolver asks that authoritative server, which finally answers with the actual IP. The resolver caches the answer for a set time (the TTL) and hands it back to you. Next time, if the cache is still warm, the whole race is skipped.',
          },
          {
            type: 'paragraph',
            text:
              'Walk it with real values. You look up `www.example.com`. Resolver to root: "where is .com?" Root: "ask the .com servers". Resolver to .com: "where is example.com?" .com: "ask ns1.example.com". Resolver to ns1.example.com: "where is www.example.com?" Authoritative: "it is an A record, 93.184.216.34, TTL 3600". The resolver stores that for 3600 seconds (one hour) and returns it. For the next hour, everyone using that resolver gets the cached answer instantly, no relay race at all - which is exactly why a DNS change can take "up to an hour" to show up for some people.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A** - maps a name to an IPv4 address',
              '**AAAA** - maps a name to an IPv6 address',
              '**CNAME** - an alias pointing one name at another name',
              '**MX** - which mail servers accept email for this domain',
              '**NS** - which servers are authoritative for this domain',
              '**TXT** - free-form text; used by SPF, DKIM, domain verification',
              '**TTL** - how many seconds a record may be cached before re-checking',
            ],
          },
          {
            type: 'command',
            description: 'Run the lookup yourself and read the answer - the +trace flag walks the whole hierarchy:',
            commands: ['dig example.com A', 'dig +trace example.com', 'dig example.com MX'],
          },
          {
            type: 'paragraph',
            text:
              'In the first command\'s output, the ANSWER SECTION is what you came for: a line like `example.com. 3600 IN A 93.184.216.34` reads as "the name, its TTL in seconds, the class IN (internet), the record type A, and the address". The `+trace` version shows the relay race explicitly - you will see the root servers, then the .com servers, then the authoritative servers, each handing off to the next. The `MX` query returns mail servers with a priority number in front (lower is tried first). Reading these is the backbone of DNS recon: NS records reveal the DNS provider, MX reveals the mail provider, and TXT often leaks internal tooling.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: DNS records are a map of the target drawn by the target itself. A CNAME pointing at a third-party service tells you what they use and can hint at a subdomain takeover if that service was abandoned. MX records show where phishing-relevant mail flows. TXT records routinely expose which SaaS tools a company has verified with. And because resolvers cache by TTL, a low TTL means a record changes often (worth re-checking), while stale caches are exactly what the next lesson\'s attacks exploit.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The TTL is a promise about staleness',
            text:
              'A record with TTL 3600 can be served from cache for an hour before anyone re-checks it. That is why DNS changes are not instant - and why cache poisoning, once it lands, lasts as long as the TTL.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can trace a DNS lookup from root to authoritative server and read the common record types straight out of dig.',
          },
          {
            type: 'quiz',
            question: 'Which DNS record type maps a hostname to an IPv4 address?',
            options: ['MX', 'CNAME', 'A', 'TXT'],
            correctIndex: 2,
            explanation: 'An A record maps a name to an IPv4 address. AAAA is for IPv6, CNAME is an alias to another name, MX is for mail, TXT is free-form text.',
          },
        ],
      },
      {
        slug: 'dns-attacks-overview',
        title: 'DNS Attacks: Spoofing to Rebinding',
        summary: 'DNS decides where your traffic actually goes. Poison it and you can send a whole neighbourhood to a fake bank - here is how the classic tricks work.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'DNS is the internet\'s address book, and it was built in a trusting era with almost no authentication. That makes it a prime target: control what a name resolves to and you control where the victim\'s traffic goes, without ever touching their machine. The classic attacks all exploit the same weakness - a resolver believing an answer it should not.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism behind the two headline attacks. **DNS spoofing** is racing the real reply: because a query goes out over UDP with no handshake, an attacker who can guess the query\'s ID and port and get a forged answer in FIRST wins - the resolver takes whichever reply arrives first and matches, real or fake. **Cache poisoning** makes that win last: the forged answer gets stored in the resolver\'s cache for the full TTL, so every user of that resolver is silently redirected until the record expires. One successful race can misdirect thousands of people for hours.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete poisoning example. A resolver asks the authoritative server for `bank.example.com`. The attacker, who cannot see the query but can guess its parameters, floods the resolver with forged replies saying `bank.example.com = 6.6.6.6` (the attacker\'s server), each guessing a different query ID. If one forged reply matches the query ID and arrives before the genuine one, the resolver caches `6.6.6.6`. Now every customer using that resolver who types the bank\'s name lands on the attacker\'s clone site - correct name in the address bar, wrong server behind it. This is why the defence, DNSSEC, cryptographically signs records so a forged answer fails the signature check.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**DNS spoofing** - racing a forged reply in before the real one',
              '**Cache poisoning** - making that forged reply stick in the resolver cache for the TTL',
              '**Subdomain takeover** - claiming a dangling record that points at an abandoned service',
              '**DNS rebinding** - a name that changes IP mid-session to bypass same-origin rules',
              '**DNSSEC** - signed records, the main defence against forged answers',
            ],
          },
          {
            type: 'command',
            description: 'Check whether a domain is protected by DNSSEC and inspect a record for a possible dangling CNAME (recon only, on targets you may test):',
            commands: ['dig +dnssec example.com', 'dig CNAME staging.example.com'],
          },
          {
            type: 'paragraph',
            text:
              'In the first command\'s output, an `RRSIG` line in the ANSWER SECTION means the record is signed with DNSSEC - forged answers would fail that signature, so spoofing this name is far harder. No RRSIG means the name is unsigned and, in principle, spoofable. In the second command, if the CNAME points at a service name (say a cloud host or SaaS domain) that returns "no such bucket" or "domain not configured" when you visit it, that is a **dangling CNAME** - the DNS still points at a service the owner abandoned, and whoever can register that service name can serve content as `staging.example.com`. That is a subdomain takeover, and it is a real, reportable finding.',
          },
          {
            type: 'paragraph',
            text:
              'DNS rebinding deserves its own line because it targets browsers, not resolvers. An attacker controls a domain and sets a very short TTL. Your browser loads their page from their public IP; then the attacker changes the DNS record to point at an internal address like `192.168.1.1`. When the page\'s script makes another request to the same name, the browser - thinking it is the same origin - now talks to your router or an internal service, letting a public web page reach a private network it should never touch. The defence is servers rejecting requests whose Host header they do not recognise, and browsers pinning DNS for a session.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Racing, poisoning or rebinding against DNS you do not own or are not explicitly authorised to test is a criminal act, not a demo. Practise these only in a lab you control or a scope that permits it in writing.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Right name, wrong server',
            text:
              'The scariest part of DNS attacks is that the victim sees the correct name in the address bar. Nothing looks off - the padlock can even be present if the attacker got a certificate for the name they hijacked.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain spoofing, cache poisoning, subdomain takeover and rebinding, and check a domain for DNSSEC and dangling records.',
          },
          {
            type: 'related_lesson', lessonSlug: 'dns-records-and-resolution', title: 'Recap: DNS Records and Resolution' },
          {
            type: 'practice_ref', title: 'UDP, DNS and Friends check', exerciseSlug: 'udp-dns-and-friends-quiz' },
          {
            type: 'quiz',
            question: 'What makes a successful DNS cache poisoning attack dangerous for hours rather than seconds?',
            options: [
              'The forged answer is stored in the resolver cache for the record\'s TTL',
              'It rewrites the victim\'s hosts file permanently',
              'It disables the victim\'s antivirus',
              'It changes the victim\'s IP address',
            ],
            correctIndex: 0,
            explanation: 'The forged record is cached for its TTL, so every user of that resolver is misdirected until the entry expires - one win affects many people for a long time.',
          },
        ],
      },
      {
        slug: 'dhcp-deep-dive',
        title: 'DHCP Deep Dive',
        summary: 'You join a Wi-Fi and get an IP in a second. A four-step conversation you never see makes that happen, and it is easy to abuse.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Plug in an Ethernet cable or join a Wi-Fi and within a second your device has an IP address, a gateway, and DNS servers - all without you typing anything. DHCP is the automatic setup desk that hands out that configuration. It is convenient, invisible, and because a new device trusts whoever answers first, a soft spot on almost every local network.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a four-step exchange nicknamed **DORA**. **Discover**: your device, with no IP yet, broadcasts "is there a DHCP server out there?" to the whole local network. **Offer**: a DHCP server replies "here, take 192.168.1.50, and by the way your gateway is 192.168.1.1 and your DNS is 192.168.1.1". **Request**: your device broadcasts "I accept that offer" (broadcast, so any other servers know it is taken). **Acknowledge**: the server confirms and records the lease. Four packets, and your device is fully configured - it now knows its address, who to route through, and who to ask for names.',
          },
          {
            type: 'paragraph',
            text:
              'Walk it concretely. A new laptop joins a cafe Wi-Fi. It broadcasts a DHCP Discover. The router answers with an Offer: IP 192.168.1.50, gateway 192.168.1.1, DNS 192.168.1.1, lease 24 hours. The laptop broadcasts a Request for exactly that, the router sends an Acknowledge, and the laptop starts using it. The critical detail: the laptop took the FIRST valid offer it saw and trusted every field in it - including which machine is the gateway and which is the DNS server. It has no way to check whether that offer came from the real router or an impostor.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**Discover** - client broadcasts "any DHCP servers here?"',
              '**Offer** - server proposes an IP plus gateway, DNS, and lease time',
              '**Request** - client broadcasts acceptance of one offer',
              '**Acknowledge** - server confirms and records the lease',
              'The client trusts the FIRST valid offer, including the gateway and DNS it names',
            ],
          },
          {
            type: 'command',
            description: 'See the DHCP lease your own machine was handed:',
            commands: ['cat /var/lib/dhcp/dhclient.leases', 'ip route | grep default'],
          },
          {
            type: 'paragraph',
            text:
              'The leases file records what the DHCP server told you: your assigned address, the `routers` option (your gateway), the `domain-name-servers` option (your DNS), and how long the lease lasts. The second command shows the default route your machine actually installed from that lease - the `default via 192.168.1.1` line names the gateway every outbound packet leaves through. If that gateway is not what you expect, every packet you send is going through the wrong hands. Reading these two together tells you exactly whom your machine decided to trust when it joined the network.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: because clients trust the first offer, a **rogue DHCP server** is a classic man-in-the-middle setup. An attacker on the LAN runs their own DHCP server that answers faster than the real one, handing new devices an offer where the gateway and DNS both point at the attacker\'s machine. From then on the victim routes all its traffic through the attacker, who can read, redirect, or tamper with it. Defenders counter this with "DHCP snooping" on managed switches, which only lets trusted ports answer DHCP - which is why this attack works on a flat cafe network but not a well-run corporate one.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only on a network you own',
            text:
              'Running a rogue DHCP server on a network you are not authorised to test hijacks other people\'s traffic and is illegal. Keep this to your own lab or an engagement that permits it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can name the four DORA steps and explain why "trust the first offer" is what makes a rogue DHCP server so effective.',
          },
          {
            type: 'quiz',
            question: 'What are the four steps of the DHCP exchange, in order?',
            options: [
              'Discover, Offer, Request, Acknowledge',
              'SYN, SYN-ACK, ACK, FIN',
              'Request, Offer, Discover, Confirm',
              'Hello, Offer, Accept, Close',
            ],
            correctIndex: 0,
            explanation: 'DHCP follows DORA: Discover, Offer, Request, Acknowledge. The SYN/ACK sequence is TCP\'s handshake, a different protocol entirely.',
          },
        ],
      },
    ],
  },
  {
    slug: 'encryption-on-the-wire',
    title: 'Encryption on the Wire',
    description:
      'How data stays private and unforged as it crosses a hostile network: the TLS handshake that agrees a secret, the certificate chain that proves who you are talking to, and SSH, the workhorse of remote access. By the end you can explain why a padlock means "encrypted, not safe", read a certificate chain, and name the SSH habits that quietly hand attackers the keys.',
    lessons: [
      {
        slug: 'tls-handshake',
        title: 'The TLS Handshake',
        summary: 'The padlock in your address bar is the visible end of a quick negotiation where two strangers agree a shared secret in the open. Here is how they pull it off.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('The TLS handshake in Wireshark - ClientHello to encrypted traffic, step by step'),
          {
            type: 'paragraph',
            text:
              'Every HTTPS page starts with a problem that sounds impossible: two machines that have never met need to agree on a secret key, while an eavesdropper watches every packet. The TLS handshake solves it in a few round trips, and the padlock is just the sign that it succeeded. Get how it works and "why is this site not secure?" stops being a mystery message.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism for modern TLS (1.2 and 1.3). The client sends a **ClientHello** listing the TLS versions and cipher suites it supports, plus a random number. The server replies with a **ServerHello** picking one cipher suite, its own random number, and its **certificate** (which contains its public key). Now the clever part: using a key-exchange method called Diffie-Hellman, both sides combine their randoms with values exchanged in the open to independently compute the SAME shared secret - a number an eavesdropper watching the exchange cannot reconstruct. From that shared secret they derive symmetric keys, and everything after is encrypted with those fast symmetric keys.',
          },
          {
            type: 'paragraph',
            text:
              'Walk it concretely. Your browser hits `example.com:443`. ClientHello: "I support TLS 1.3 and these ciphers, here is random A". ServerHello: "let us use TLS 1.3 with this cipher, here is random B, and here is my certificate". Both run Diffie-Hellman and each ends up holding the identical secret S, though S was never sent across the wire. They turn S into symmetric keys, the client verifies the certificate proves the server really is `example.com`, and the encrypted HTTP request goes out. TLS 1.3 trimmed this to a single round trip, which is why modern HTTPS feels instant. The eavesdropper saw the randoms and the public values but cannot derive S - that is the whole trick.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**ClientHello** - client offers versions, cipher suites, and a random',
              '**ServerHello** - server picks a cipher, sends its random and its certificate',
              '**Key exchange** - both compute the same shared secret via Diffie-Hellman, never sending it',
              '**Finished** - both confirm the handshake was not tampered with',
              'After this, all traffic is encrypted with fast symmetric keys derived from the secret',
            ],
          },
          {
            type: 'command',
            description: 'Watch a real handshake and see the negotiated version and cipher:',
            commands: ['openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | grep -E "Protocol|Cipher"'],
          },
          {
            type: 'paragraph',
            text:
              'The output shows two lines that matter: `Protocol` names the TLS version both sides agreed on (you want to see `TLSv1.3` or `TLSv1.2`; `TLSv1.0` or `SSLv3` would be a finding), and `Cipher` names the exact cipher suite chosen for this connection. Together they tell you the security level the server actually settled for - not what it claims to support, but what it negotiated right now. A server that still accepts an old protocol or a weak cipher is downgrade-vulnerable, and this one command is how you check without a scanner.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: the handshake is where downgrade and interception attacks live. If a server accepts obsolete versions, a man-in-the-middle can force both sides down to a weak cipher and then break it - the whole point of disabling old TLS is to remove that option. On the interception side, a proxy like Burp works by presenting its OWN certificate during the handshake; it only succeeds because you told your machine to trust Burp\'s certificate authority, which is exactly why the padlock alone proves encryption, not that you are talking to who you think.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The secret is never sent',
            text:
              'The magic of the handshake is that both sides compute the same key without ever transmitting it. An eavesdropper sees the whole exchange and still cannot derive the key - that is Diffie-Hellman doing its job.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can walk the TLS handshake step by step and read the negotiated version and cipher off a live connection.',
          },
          {
            type: 'quiz',
            question: 'During the TLS handshake, how do the two sides end up with the same secret key?',
            options: [
              'The server emails it to the client',
              'They compute it independently via a key exchange, never sending the key itself',
              'The client picks it and sends it in plaintext',
              'It is printed in the certificate',
            ],
            correctIndex: 1,
            explanation: 'Using a Diffie-Hellman key exchange, both sides derive the identical secret from public values and their own randoms - the key is never transmitted, so an eavesdropper cannot recover it.',
          },
        ],
      },
      {
        slug: 'certificates-and-pki',
        title: 'Certificates and PKI',
        summary: 'A certificate is a passport for a website, and your browser trusts it because of a chain of signatures ending somewhere it already trusts.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The TLS handshake proves you share a secret key with the server - but how do you know that server is really `example.com` and not an impostor who also did a handshake? The certificate answers that. It is a passport: a document saying "this public key belongs to example.com", signed by an authority your browser already trusts. The whole system of who-signs-whom is called PKI, Public Key Infrastructure.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism - it is a chain of signatures. Your browser ships with a built-in list of trusted **root** Certificate Authorities (CAs). A root CA does not sign websites directly; it signs **intermediate** CAs, which in turn sign the **leaf** certificate for `example.com`. When you connect, the server presents the leaf plus the intermediates. Your browser checks each signature up the chain: leaf signed by intermediate, intermediate signed by root, root already in my trusted list. If every link verifies AND the name matches AND it is not expired or revoked, the padlock appears. Break any link and you get the scary warning page.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete chain. You visit `example.com`. The server sends a leaf certificate that says "public key K belongs to example.com, valid until next year, signed by Intermediate CA X". Your browser sees Intermediate X is itself signed by "Root CA Y". Root Y is in the browser\'s built-in trust store. So the browser reasons: I trust Y, Y vouched for X, X vouched for this leaf, and the leaf\'s name matches the address bar - trust established. Now swap in an attacker\'s certificate for example.com signed by nobody the browser trusts, and the chain breaks at the top: no trusted root, so the warning fires. That warning is the system working, not failing.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Leaf certificate** - the one for the actual site, naming its public key and hostname',
              '**Intermediate CA** - signs leaves; itself signed by a root',
              '**Root CA** - the top of the chain, pre-trusted by your browser or OS',
              '**Validity dates** - a certificate outside its date range is rejected',
              '**Revocation** - a way to declare a certificate bad before it expires (CRL, OCSP)',
              '**Name match** - the certificate must cover the exact hostname you visited',
            ],
          },
          {
            type: 'command',
            description: 'Pull a site\'s certificate chain and read the subject, issuer, and validity dates:',
            commands: ['openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates'],
          },
          {
            type: 'paragraph',
            text:
              'The output gives you the certificate\'s identity in a few lines. `subject=` is who the certificate is FOR (the site, e.g. `CN=example.com`). `issuer=` is who SIGNED it (the CA above it in the chain) - if subject and issuer are the same, it is a self-signed certificate and no CA vouched for it. `notBefore=` and `notAfter=` are the validity window; a `notAfter` in the past is why "your connection is not secure - certificate expired" appears. Reading these three fields tells you whether a certificate is genuinely trustworthy or just present, which are very different things.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: certificate details are recon and findings both. Certificate Transparency logs publicly record every certificate a CA issues, so searching them reveals subdomains a target forgot were public - a whole recon technique built on certificates. A self-signed or expired certificate on a production login page is a reportable weakness. And the reason interception proxies work is that you manually add THEIR root to your trust store; without that, the chain would break and the browser would refuse - which is exactly the protection PKI is supposed to give real users.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The padlock is not a safety badge',
            text:
              'A padlock only means the connection is encrypted and the certificate\'s chain checks out for that name. A phishing site can get a valid certificate for its own lookalike domain - encrypted does not mean trustworthy.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can read a certificate chain, tell a self-signed certificate from a CA-signed one, and explain why a browser trusts a stranger\'s site.',
          },
          {
            type: 'related_lesson', lessonSlug: 'tls-handshake', title: 'Recap: The TLS Handshake' },
          {
            type: 'quiz',
            question: 'Why does your browser trust a certificate for a site it has never visited?',
            options: [
              'It trusts every certificate by default',
              'The certificate chains up to a root CA already in the browser\'s trust store',
              'The site emailed the browser its key in advance',
              'The padlock icon guarantees it',
            ],
            correctIndex: 1,
            explanation: 'Trust flows up a chain: the leaf is signed by an intermediate, the intermediate by a root, and that root is pre-installed in the browser\'s trust store. Break the chain and the browser warns.',
          },
        ],
      },
      {
        slug: 'ssh-protocol-deep',
        title: 'How SSH Actually Works',
        summary: 'SSH is the encrypted door into almost every server on earth. Its keys, and the warning people click through, decide if that door is locked.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('SSH key exchange and host key verification - what that fingerprint prompt really means'),
          {
            type: 'paragraph',
            text:
              'SSH - Secure Shell - is how you get an encrypted command line on a remote machine. It is the front door to nearly every Linux server and cloud box running today. Most people use it daily and understand maybe a third of it, which is a problem, because the parts they skip are exactly the parts attackers rely on.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, in two halves. First, **key exchange**: just like TLS, the client and server run a Diffie-Hellman exchange to agree a shared symmetric key, so the session is encrypted before any password is typed. Second, **host key verification**: the server proves ITS identity with a host key. The first time you connect, SSH shows you the server\'s key fingerprint and asks "are you sure?" - it has nothing to compare against yet. When you say yes, it saves that fingerprint in your `known_hosts` file. On every later connection it checks the server\'s key against that saved copy. If they match, silence; if they differ, a loud warning.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the crucial warning concretely. You SSH to `server.example.com`, accept the fingerprint, and it is saved. Weeks later you connect again and SSH screams "REMOTE HOST IDENTIFICATION HAS CHANGED" and refuses to continue. There are exactly two explanations: either the server was legitimately rebuilt and got a new key, or someone is sitting between you and the server presenting THEIR key to intercept your session - a man-in-the-middle. The warning exists to make you stop and find out which. The dangerous habit is deleting the `known_hosts` line to "make it work" without checking - if it was an attacker, you just accepted them.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Key exchange** - Diffie-Hellman agrees a session key; the shell is encrypted throughout',
              '**Host key** - the server\'s identity; saved in `known_hosts` on first connect',
              '**Key auth vs password** - a key pair beats a password: no secret is ever sent, and it cannot be brute-forced',
              '**Public/private key** - the public key sits on the server, the private key stays on your machine',
              '**Agent forwarding** - convenient, and a real risk on a shared or compromised host',
            ],
          },
          {
            type: 'command',
            description: 'Generate a modern key pair and look at the public half you would put on a server:',
            commands: ['ssh-keygen -t ed25519 -C "you@example.com"', 'cat ~/.ssh/id_ed25519.pub'],
          },
          {
            type: 'paragraph',
            text:
              'The first command creates a key pair: a private key (`id_ed25519`, which never leaves your machine and should have a passphrase) and a public key (`id_ed25519.pub`). The second prints the public half - a single line starting `ssh-ed25519 AAAA...` ending in your comment. That public line is what you copy into a server\'s `~/.ssh/authorized_keys`; the server then challenges you to prove you hold the matching private key, and you never transmit a password at all. This is why key authentication defeats brute-force attacks that pound password logins: there is no password to guess, and the private key never crosses the network.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender - and the two habits that leak keys. First, blindly clicking through the changed-host-key warning throws away SSH\'s entire man-in-the-middle protection; treat that warning as a genuine question every time. Second, **agent forwarding** (`ssh -A`) lets a server you connect to use your local keys to hop onward - convenient for jumping through a bastion, but if that intermediate box is compromised, its root can quietly use your forwarded agent to authenticate as you to everything your keys unlock. The safer pattern is a jump host (`ssh -J`), which does not expose your agent. Attackers hunt private keys precisely because one unprotected key can open a whole fleet.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test only what is yours',
            text:
              'Connecting to, probing, or brute-forcing SSH on a server you do not own or are not authorised to test is unauthorised access - a crime in most countries. Keep practice to your own boxes.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'That host-key warning is not noise',
            text:
              'A changed host key means either the server was rebuilt or someone is intercepting you. Never delete the known_hosts line to silence it without confirming which - that is how you accept an attacker.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain SSH key exchange and host-key verification, tell key auth from password auth, and name why agent forwarding is risky.',
          },
          {
            type: 'quiz',
            question: 'You connect to a server you use often and SSH warns that the host key has changed. What is the responsible first step?',
            options: [
              'Delete the known_hosts entry so it stops complaining',
              'Stop and confirm whether the server was legitimately rebuilt or you are being intercepted',
              'Switch to password authentication',
              'Ignore it - host keys change all the time',
            ],
            correctIndex: 1,
            explanation: 'A changed host key means either a legitimate rebuild or a man-in-the-middle. Verify which before trusting the connection; blindly clearing known_hosts throws away the protection.',
          },
        ],
      },
      {
        slug: 'vpns-and-tunnels',
        title: 'VPNs and Tunnels',
        summary: 'A VPN mails your traffic through someone else\'s post office in a sealed envelope. Useful, misunderstood, and not an invisibility cloak.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A VPN - Virtual Private Network - takes all your traffic, wraps it in encryption, and sends it through a server somewhere else, which then forwards it to the real destination. To the websites you visit, the traffic appears to come from the VPN server, not you. It is genuinely useful for privacy on hostile networks - and it is oversold as a magic cloak that makes you untraceable, which it is not.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a tunnel: a packet inside a packet. Your device encrypts each original packet and wraps it in a new outer packet addressed to the VPN server. Anyone watching your local network - the cafe Wi-Fi, your ISP - sees only encrypted traffic going to the VPN server; they cannot read the inside or tell which sites you visit. The VPN server unwraps the inner packet and sends it on to the real destination, using its own address. The reply comes back to the server, gets wrapped again, and returns to you. Your real IP is hidden from the destination, and your destinations are hidden from your local network - but the VPN server itself sees everything.',
          },
          {
            type: 'paragraph',
            text:
              'Walk it concretely. On airport Wi-Fi you open your bank over a VPN. Your laptop encrypts the request and wraps it in a packet addressed to your VPN provider in another city. The airport network sees only "encrypted traffic to VPN-provider", not "connecting to bank". The VPN server unwraps it and forwards it to the bank, which sees the connection coming from the VPN\'s IP. Everything is protected from the airport\'s prying eyes - but the VPN provider could log that you visited the bank. You did not remove trust; you MOVED it, from the airport network to the VPN company.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Tunnel** - your real packet encrypted and wrapped inside an outer packet',
              '**What it hides from your local network** - the sites you visit and the content',
              '**What it hides from the destination** - your real IP address',
              '**What it does NOT do** - make you anonymous to the VPN provider itself',
              'Common protocols: WireGuard (modern, fast), OpenVPN, IPsec',
            ],
          },
          {
            type: 'command',
            description: 'Check what public IP the world sees before and after connecting a VPN:',
            commands: ['curl -s https://api.ipify.org', 'ip addr show | grep -E "wg0|tun0"'],
          },
          {
            type: 'paragraph',
            text:
              'The first command asks a public service what IP your traffic appears to come from. Run it with the VPN off and you see your real ISP address; run it again with the VPN on and you should see the VPN server\'s address instead - if it still shows your real IP, your VPN is not actually routing your traffic (a leak). The second command looks for a VPN interface: `wg0` for WireGuard or `tun0` for OpenVPN. Seeing that interface with an address confirms the tunnel is up. Together they verify the VPN is doing what you think, rather than sitting connected but bypassed.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: tunnels cut both ways. Testers use them to reach a client\'s internal network or to route tooling through an approved exit point. Attackers use them to hide origin and to tunnel out of a network they have breached - "data exfiltration over an encrypted tunnel" is exactly this mechanism turned malicious, which is why defenders watch for unexpected outbound VPN or SSH tunnels leaving their network. And relying on a VPN for anonymity misunderstands the trust model: you are trusting the provider not to log or leak, which is a promise, not a guarantee.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A VPN moves trust, it does not remove it',
            text:
              'You stop trusting the local network and start trusting the VPN provider instead. For hostile Wi-Fi that is a great trade. For "nobody can ever see me", it is not - the provider still can.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain how a tunnel wraps a packet, what a VPN hides from whom, and verify a tunnel is actually carrying your traffic.',
          },
          {
            type: 'quiz',
            question: 'A VPN hides the websites you visit from your local network. Who can still see which sites you visit?',
            options: ['Nobody, ever', 'The VPN provider running the server', 'Only law enforcement', 'The websites themselves see your real IP'],
            correctIndex: 1,
            explanation: 'The VPN server unwraps your traffic to forward it, so the provider can see your destinations. A VPN moves trust from the local network to the provider - it does not make you invisible.',
          },
        ],
      },
      {
        slug: 'tls-attacks-overview',
        title: 'When TLS Goes Wrong',
        summary: 'TLS done right is very hard to break. TLS done carelessly fails in ways that are common, findable, and genuinely reportable.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Properly configured modern TLS is not something you break by hand - the maths holds. What DOES break is the configuration around it: servers still speaking ancient protocol versions, connections that never got encrypted in the first place, and certificates that do not actually prove anything. These are among the most common findings in a real assessment because they are so easy to leave misconfigured.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism behind the classic failures. **Downgrade attacks**: if a server still accepts TLS 1.0 or weak ciphers, a man-in-the-middle can meddle with the handshake to force both sides onto the weak option, then attack that. **SSL stripping**: the attacker sits between you and a site and keeps the connection to YOU as plain HTTP while talking HTTPS to the server - you never see a padlock because you were never on HTTPS, and if you did not notice, you typed your password into a plaintext page. **Certificate failures**: an expired, self-signed, or wrong-name certificate means the identity check failed, so even if traffic is encrypted, you cannot be sure who you are encrypting it TO.',
          },
          {
            type: 'paragraph',
            text:
              'Walk SSL stripping concretely, because it is the sneakiest. You type `example.com` (no https). Your browser first tries plain HTTP. Normally the server redirects you to HTTPS - but an attacker in the middle intercepts that redirect, keeps talking plain HTTP to you, and quietly proxies HTTPS to the real server. You see `http://example.com`, no padlock, everything looks normal-ish, and every keystroke is readable to the attacker. The defence is **HSTS** - a header where the server tells browsers "always use HTTPS for me, never plain HTTP" - so the browser refuses the plaintext version before the attacker can exploit it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Downgrade** - forcing a weak protocol or cipher the server should not still allow',
              '**SSL stripping** - keeping the victim on plain HTTP while proxying HTTPS behind them',
              '**Expired / self-signed / wrong-name certificate** - the identity check fails',
              '**Mixed content** - an HTTPS page loading scripts over HTTP, reopening the hole',
              '**HSTS** - the header that tells browsers to refuse plain HTTP for this site',
            ],
          },
          {
            type: 'command',
            description: 'Check a server for weak protocol support and whether it sets HSTS (on a target you may test):',
            commands: ['openssl s_client -connect example.com:443 -tls1 </dev/null 2>&1 | grep -E "Protocol|handshake failure"', 'curl -sI https://example.com | grep -i strict-transport-security'],
          },
          {
            type: 'paragraph',
            text:
              'In the first command you deliberately ask for the obsolete TLS 1.0. If you see `handshake failure`, good - the server refused the weak version, which is what you want. If it instead reports `Protocol: TLSv1.0` and completes, the server still speaks a broken protocol and that is a downgrade finding. The second command checks for the `Strict-Transport-Security` response header: if it is present, the server is telling browsers to always use HTTPS, which blocks SSL stripping; if the line is empty, HSTS is missing and stripping is possible. Two quick commands, two concrete findings.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: these are the TLS findings you will actually report. A server accepting TLS 1.0 or a weak cipher is a genuine, gradeable weakness. A login page without HSTS is exploitable on a shared network via stripping. A certificate that does not match its hostname breaks trust for every visitor. None of these require breaking cryptography - they require noticing configuration that was left in a weak state, which is most of what a real TLS assessment is: not attacking the maths, but finding where the maths was switched off.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Interception needs authorisation',
            text:
              'Downgrade and SSL-stripping attacks intercept other people\'s traffic. Run them only against systems you own or a scope that explicitly permits active man-in-the-middle testing - never on a shared or public network.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'No padlock is the tell',
            text:
              'SSL stripping works because the victim never sees a padlock and does not miss it. Train yourself to notice its ABSENCE on a page that should be encrypted - that gap is the whole attack.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can name downgrade, stripping and certificate failures, check a server for weak TLS and missing HSTS, and write them up as findings.',
          },
          {
            type: 'related_lesson', lessonSlug: 'certificates-and-pki', title: 'Recap: Certificates and PKI' },
          {
            type: 'practice_ref', title: 'Encryption on the Wire check', exerciseSlug: 'encryption-on-the-wire-quiz' },
          {
            type: 'quiz',
            question: 'What does the HSTS response header protect against?',
            options: [
              'Weak passwords',
              'SSL stripping, by telling the browser to always use HTTPS for the site',
              'SQL injection',
              'Expired certificates',
            ],
            correctIndex: 1,
            explanation: 'HSTS (Strict-Transport-Security) tells the browser to refuse plain HTTP for the domain, so an attacker cannot keep the victim on an unencrypted connection - the core of SSL stripping.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'flow-control-and-sliding-window',
    slug: 'tcp-deep-dive-quiz',
    title: 'TCP Deep Dive check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In the three-way handshake, what does the server send back to a client SYN?',
        options: ['A second SYN', 'A SYN-ACK', 'A bare ACK', 'A FIN'],
        correctIndex: 1,
        explanation: 'The server replies SYN-ACK: SYN is its own hello, ACK acknowledges the client. A RST would mean the port is closed.',
      },
      {
        prompt: 'A host answers your SYN with a lone RST. The port is:',
        options: ['Open', 'Closed and actively refusing', 'Filtered by a firewall', 'Established'],
        correctIndex: 1,
        explanation: 'A RST is an active refusal - the host is up but nothing listens there. A silent drop, not a RST, is what a filtering firewall does.',
      },
      {
        prompt: 'A receiver keeps repeating the same ACK number while sequence numbers climb. This signals:',
        options: ['A graceful close', 'A lost packet the receiver is still waiting for', 'Encryption starting', 'A new connection'],
        correctIndex: 1,
        explanation: 'Duplicate ACKs mean a byte range is missing; enough of them trigger the sender to retransmit the lost packet.',
      },
      {
        prompt: 'A receiver advertises a TCP window of 0. The sender must:',
        options: ['Send faster', 'Pause until a window update arrives', 'Reset the connection', 'Ignore it'],
        correctIndex: 1,
        explanation: 'A zero window means the receiver\'s buffer is full. The sender waits for a window update before sending more.',
      },
      {
        prompt: 'Flow control protects the receiver. What does congestion control protect?',
        options: ['The certificate', 'The network path in between', 'The DNS cache', 'The sender\'s CPU'],
        correctIndex: 1,
        explanation: 'Congestion control keeps the sender from overwhelming routers on the path, using packet loss as its signal. Flow control is about the receiver\'s buffer.',
      },
    ],
  },
  {
    lessonSlug: 'dns-attacks-overview',
    slug: 'udp-dns-and-friends-quiz',
    title: 'UDP, DNS and Friends check',
    instructions: 'Five quick ones. Four correct and you have cleared the module.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which guarantee does UDP NOT provide by itself?',
        options: ['Port numbers', 'In-order, reliable delivery', 'A checksum', 'Low overhead'],
        correctIndex: 1,
        explanation: 'UDP has ports, a checksum and low overhead, but no delivery or ordering guarantees - the app must add those if it needs them.',
      },
      {
        prompt: 'Which DNS record maps a hostname to an IPv4 address?',
        options: ['MX', 'A', 'CNAME', 'NS'],
        correctIndex: 1,
        explanation: 'An A record gives an IPv4 address. AAAA is IPv6, CNAME is an alias, MX is mail, NS lists authoritative servers.',
      },
      {
        prompt: 'Why can one successful DNS cache poisoning affect many people for hours?',
        options: [
          'It edits every victim\'s hosts file',
          'The forged record is cached for its TTL',
          'It spreads like a worm',
          'It changes the resolver\'s hardware',
        ],
        correctIndex: 1,
        explanation: 'The forged answer sits in the resolver cache for the record\'s TTL, so everyone using that resolver is misdirected until it expires.',
      },
      {
        prompt: 'A CNAME points at a cloud service that now returns "no such resource". This is a sign of:',
        options: ['A healthy setup', 'A possible subdomain takeover', 'A TLS downgrade', 'A SYN flood'],
        correctIndex: 1,
        explanation: 'A dangling CNAME to an abandoned service can be claimed by whoever registers that service name - a subdomain takeover.',
      },
      {
        prompt: 'What are the four steps of DHCP, in order?',
        options: [
          'Discover, Offer, Request, Acknowledge',
          'SYN, SYN-ACK, ACK, FIN',
          'Hello, Offer, Accept, Close',
          'Request, Discover, Offer, Confirm',
        ],
        correctIndex: 0,
        explanation: 'DHCP follows DORA: Discover, Offer, Request, Acknowledge. The client trusts the first valid offer, which is what a rogue server abuses.',
      },
    ],
  },
  {
    lessonSlug: 'tls-attacks-overview',
    slug: 'encryption-on-the-wire-quiz',
    title: 'Encryption on the Wire check',
    instructions: 'Five quick ones. Get four and the module is done.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'How do two sides of a TLS handshake end up with the same secret key?',
        options: [
          'The server sends it in plaintext',
          'They derive it via a key exchange without ever sending the key',
          'It is written in the certificate',
          'The client emails it first',
        ],
        correctIndex: 1,
        explanation: 'Diffie-Hellman lets both sides compute the identical secret from public values, so an eavesdropper watching the exchange cannot recover it.',
      },
      {
        prompt: 'Why does a browser trust a certificate for a site it has never visited?',
        options: [
          'It trusts all certificates',
          'The certificate chains up to a root CA already in its trust store',
          'The padlock guarantees it',
          'The site pre-registered with the browser',
        ],
        correctIndex: 1,
        explanation: 'Trust flows up the chain: leaf signed by intermediate, intermediate by a root, and that root is pre-installed. Break the chain and the browser warns.',
      },
      {
        prompt: 'SSH warns that a known server\'s host key has changed. The responsible first step is to:',
        options: [
          'Delete the known_hosts line',
          'Confirm whether it was a legit rebuild or an interception',
          'Switch to password auth',
          'Ignore it',
        ],
        correctIndex: 1,
        explanation: 'A changed host key means a rebuild or a man-in-the-middle. Verify which before trusting it; clearing known_hosts blindly throws away the protection.',
      },
      {
        prompt: 'A VPN hides your destinations from the local network. Who can still see them?',
        options: ['Nobody', 'The VPN provider running the server', 'Only the police', 'The websites see your real IP'],
        correctIndex: 1,
        explanation: 'The VPN server unwraps your traffic to forward it, so the provider can see your destinations. A VPN moves trust to the provider, it does not remove it.',
      },
      {
        prompt: 'The HSTS response header defends against which attack?',
        options: ['SQL injection', 'SSL stripping', 'A SYN flood', 'Cache poisoning'],
        correctIndex: 1,
        explanation: 'HSTS tells the browser to always use HTTPS for the site, so an attacker cannot keep the victim on plaintext HTTP - the heart of SSL stripping.',
      },
    ],
  },
];
