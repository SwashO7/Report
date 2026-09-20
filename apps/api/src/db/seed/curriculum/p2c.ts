import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'wireless',
    title: 'Wireless',
    description:
      'How Wi-Fi carries your data through the air, and why that air is the whole problem. By the end you can explain how a client joins a network, read the WEP-to-WPA3 timeline and say which one is actually safe today, name the classic Wi-Fi attacks and what each one needs to work, and understand why Bluetooth and NFC are just short-range versions of the same trust questions.',
    lessons: [
      {
        slug: 'how-wifi-works',
        title: 'How Wi-Fi Actually Works',
        summary: 'Wi-Fi is just Ethernet with the cable replaced by radio. Same idea, one big catch: anyone nearby can hear it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('How a phone joins Wi-Fi - beacons, probes and the handshake, watched live'),
          {
            type: 'paragraph',
            text:
              'Wi-Fi is your local network with the cable swapped for radio waves. Your phone and the router talk the same way a wired machine and a switch do, except the signal travels through the air instead of down copper. That one swap changes everything for security: on a cable, you have to physically plug in to listen. In the air, anyone sitting in the same cafe can hear every frame you send.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, step by step. The router (the access point) shouts a *beacon* frame a few times a second, announcing its network name (the SSID) and what security it wants. Your phone hears beacons from every nearby network, or sends a *probe* asking "is my usual network here?". When you pick one, the phone and router run three quick steps: authentication (a basic "are we allowed to talk?"), association (the router assigns your phone to itself, like a receptionist logging you in), and then the security handshake that sets up encryption. Only after all three does your data start flowing.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real join. Your phone is in a cafe and sees a beacon: SSID `CafeWiFi`, security `WPA2`, on channel 6. You tap it and type the password. Your phone sends an authentication frame, the router replies "ok", your phone sends an association request, the router assigns it and replies with a success code. Then the four-way handshake runs to turn your password into a fresh encryption key for this session. From that point every frame between you and the router is scrambled - but the beacons, the SSID and the fact that your phone is connected at all are still visible to anyone listening.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SSID** - the network name in the beacon, e.g. `CafeWiFi`. Not a secret.',
              '**BSSID** - the access point\'s MAC address, its unique hardware ID',
              '**Channel** - the slice of radio spectrum used (1-13 on 2.4GHz), like a TV channel',
              '**Beacon** - the frame the router broadcasts to announce itself',
              '**Probe request** - the frame your phone sends looking for a known network',
              '**Association** - the step where the router adopts your phone as a client',
            ],
          },
          {
            type: 'command',
            description: 'List the Wi-Fi networks your own machine can currently hear:',
            commands: ['nmcli device wifi list', 'iwlist scan'],
          },
          {
            type: 'paragraph',
            text:
              'Each row is one beacon your card picked up. Read the columns: SSID is the network name, BSSID is the access point\'s MAC, CHAN is the radio channel, SIGNAL or the bars show how strong it is (higher is closer or louder), and SECURITY tells you the protection - `WPA2`, `WPA3`, or an alarming blank for an open network. You did not connect to anything to see all this. That is the lesson: the announcement is public, so a listener maps every network in range before touching a single one.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: the air is a shared medium, so the whole game is about who can listen and who can inject. A router cannot stop your neighbour\'s laptop from hearing its frames - it can only make the contents unreadable by encrypting them. That is why open networks are dangerous and why the strength of the encryption (the next lesson) is the single thing that decides whether "someone can hear this" also means "someone can read this". Understanding the join steps also tells you exactly where the classic attacks slot in later.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The SSID being hidden is not security',
            text:
              'A "hidden" network just stops broadcasting its name in beacons. Your phone still shouts the name in probe requests, and any listener reads it off the air in seconds. Hiding the SSID hides nothing worth hiding.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain how a device joins Wi-Fi step by step and name what a listener can see before any password is even typed.',
          },
          {
            type: 'quiz',
            question: 'What is the SSID of a Wi-Fi network?',
            options: [
              'The password used to encrypt traffic',
              'The network name broadcast in beacons',
              'The access point\'s MAC address',
              'The radio channel number',
            ],
            correctIndex: 1,
            explanation: 'The SSID is the human-readable network name. The MAC of the AP is the BSSID, and the password is separate.',
          },
        ],
      },
      {
        slug: 'wep-wpa-wpa2-wpa3',
        title: 'WEP to WPA3: The Security Timeline',
        summary: 'Wi-Fi security got broken, patched, broken again, and finally fixed. Knowing which era a network is stuck in tells you if it is safe.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Wi-Fi encryption has a history of being broken and re-fixed. The name a network advertises - WEP, WPA, WPA2, WPA3 - tells you which era it is stuck in, and that alone tells you roughly how safe it is. This is not trivia; it is the first thing you read off a beacon before deciding anything else.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How each one tried to lock the air',
          },
          {
            type: 'paragraph',
            text:
              'WEP (1997) was the first attempt and it was broken badly. It reused a short scrambling value so often that with enough captured traffic you can recover the key with maths alone - minutes on modern hardware. WPA (2003) was a rushed patch on the same broken hardware. WPA2 (2004) was the real fix: it uses strong AES encryption and a four-way handshake that mixes the password with fresh random values so each session gets a unique key. WPA3 (2018) closes WPA2\'s last big weakness - it uses a handshake (called SAE) that an eavesdropper cannot capture and grind offline, so weak passwords stop being a free win for attackers.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the one weakness that still bites WPA2. Its four-way handshake can be *captured* by a listener sitting nearby - you cannot read the traffic from it, but you get the mathematical puzzle that the password would solve. The attacker then takes that capture offline and tries millions of guesses against it on their own machine, no contact with the network needed. A password like `cafe1234` falls in seconds. A long random passphrase would take longer than the universe. WPA3 kills this by making the handshake un-capturable in that way - each guess has to be tried live against the router, which is hopelessly slow.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '**WEP** - broken, recoverable in minutes. If you see it, the network is a museum piece.',
              '**WPA (TKIP)** - a stopgap, also weak. Treat as broken.',
              '**WPA2 (AES)** - still standard and solid, BUT a weak password can be cracked from a captured handshake offline',
              '**WPA3 (SAE)** - current best. Handshake cannot be captured and cracked offline; even weak passwords are far safer',
              '**Open (no password)** - no encryption at all; every frame is readable by anyone in range',
            ],
          },
          {
            type: 'command',
            description: 'Check what security the networks around you are actually using:',
            commands: ['nmcli -f SSID,SECURITY device wifi list'],
          },
          {
            type: 'paragraph',
            text:
              'The SECURITY column is the verdict. `WPA2` or `WPA3` means the traffic is encrypted with a modern cipher. `WEP` means practically unprotected. A blank or `--` means the network is open - your traffic is plain text in the air, which is why you should treat cafe and airport open Wi-Fi as if a stranger is reading over your shoulder. Seeing WEP in the wild in 2020s is rare and almost always a forgotten old device.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: on an authorised assessment, the encryption tier decides which attacks are even worth attempting. WEP means the key falls to passive capture. WPA2 means the only realistic path is capturing a handshake and betting on a weak password, so a strong passphrase is the defence. WPA3 largely removes the offline-guessing path entirely. As a defender the takeaway is blunt: run WPA3 where you can, WPA2 with a long random passphrase everywhere else, and never leave WEP or open running.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'WPA2 is only as strong as the password',
            text:
              'WPA2 itself is not broken - but a short or dictionary password is, because the handshake can be captured and guessed against offline forever. "The network uses WPA2" is not the same as "the network is safe".',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can read a security label off a network and say what it means: which era it belongs to, and whether a listener can realistically get in.',
          },
          {
            type: 'quiz',
            question: 'A network uses WPA2 with the password "password123". What is the realistic risk?',
            options: [
              'None - WPA2 is unbreakable',
              'A captured handshake can be cracked offline because the password is weak',
              'The SSID can be stolen',
              'WPA2 encryption itself can be decrypted live',
            ],
            correctIndex: 1,
            explanation: 'WPA2 is solid, but a weak password can be recovered by capturing the handshake and guessing offline. WPA3 removes this path.',
          },
        ],
      },
      {
        slug: 'wifi-attacks-overview',
        title: 'Wi-Fi Attacks Overview',
        summary: 'Deauth, evil twins, handshake capture. Each attack targets a different weakness in how Wi-Fi trusts the air around it.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Wi-Fi attacks all exploit the same root fact: the air is shared and some management frames are not protected. Once you know how a device joins (the earlier lesson), the classic attacks make sense as ways to abuse one step of that join. Here are the ones worth knowing and what each actually needs.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The attacks and what they exploit',
          },
          {
            type: 'paragraph',
            text:
              'A *deauthentication* attack is the noisy one. Early Wi-Fi lets anyone send a "you are disconnected" management frame, and clients obey it without checking who sent it - like a stranger yelling "everyone out" and everyone leaving. Attackers use this to knock a device off so it reconnects, which forces the four-way handshake to happen again - and now they can capture it. An *evil twin* is a fake access point broadcasting the same SSID as a real one, usually stronger, so your phone connects to the attacker instead of the cafe. Once you are on their AP, they see all your unencrypted traffic and can serve fake login pages. *Handshake capture* is the passive one: sit quietly, wait for someone to join (or deauth them so they rejoin), record the handshake, and crack it offline as the previous lesson described.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete chain, because attacks combine. An attacker parks near `CafeWiFi` (WPA2). Step one: they capture the four-way handshake - but nobody is joining right now. Step two: they send a deauth frame to a connected laptop, which drops and immediately reconnects, producing a fresh handshake they record. Step three: offline, they run the capture against a wordlist; the cafe used `cafe2019` so it cracks in seconds. Now they know the Wi-Fi password. Notice deauth did not break encryption - it just forced the event the attacker needed to capture. WPA3 breaks this chain because the captured handshake cannot be cracked offline.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Deauth attack** - forces a client off so it reconnects and re-runs the handshake',
              '**Handshake capture** - records the four-way handshake to crack the password offline',
              '**Evil twin** - a fake AP with a real network\'s name, to lure clients onto it',
              '**Karma / probe abuse** - answers a phone\'s "is my home network here?" probe with "yes, it\'s me"',
              '**Monitor mode** - a card setting that lets it hear all frames in the air, not just its own',
            ],
          },
          {
            type: 'command',
            description: 'Passively watch the frames in the air on your own card (monitor mode, on hardware you own):',
            commands: ['sudo airmon-ng start wlan0', 'sudo airodump-ng wlan0mon'],
          },
          {
            type: 'paragraph',
            text:
              'The first command puts your wireless card into *monitor mode*, so it stops filtering and reports every frame it can hear, not just ones addressed to you. The second shows a live table: each row is a network with its BSSID, channel, encryption and how many clients are attached, and a lower panel lists the individual client devices. Reading it, you are seeing the raw radio picture an attacker starts from - who is around, on what channel, using what security. Nothing here connects to or attacks anything; it is pure listening, which is exactly why the air is the weak point.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a defender: most of these attacks leave signs. A flood of deauth frames, two access points with the same SSID but different BSSIDs, or a client probing for dozens of past networks are all detectable. Modern Wi-Fi (802.11w / WPA3) also protects management frames, so the deauth trick stops working - which is a concrete reason to move off WPA2. As a tester you would use these techniques only inside an authorised wireless assessment with the network owner\'s written permission.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Deauth does not break encryption',
            text:
              'A deauth attack never reads your traffic. It just kicks you off so a handshake happens again. The cracking is a separate, offline step - and it fails against a strong password or WPA3.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorisation is not optional',
            text:
              'Capturing or disrupting a Wi-Fi network you do not own, or were not given written permission to test, is illegal. Practise only on your own equipment or a sanctioned lab.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can name the main Wi-Fi attacks, explain what each one exploits, and see how a deauth plus a capture plus an offline crack chain together.',
          },
          { type: 'practice_ref', title: 'Wireless check', exerciseSlug: 'wireless-quiz' },
          {
            type: 'quiz',
            question: 'Why do attackers send deauthentication frames?',
            options: [
              'To decrypt WPA2 traffic directly',
              'To force a client to reconnect and re-run the handshake so it can be captured',
              'To change the network\'s SSID',
              'To speed up the Wi-Fi',
            ],
            correctIndex: 1,
            explanation: 'Deauth kicks a client off; on reconnect the four-way handshake runs again and can be captured for offline cracking.',
          },
        ],
      },
      {
        slug: 'bluetooth-and-nfc-peek',
        title: 'Bluetooth and NFC Peek',
        summary: 'Two short-range radios you use every day. Same trust questions as Wi-Fi, just measured in centimetres and metres.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Bluetooth and NFC are the other radios in your pocket. Bluetooth links your earbuds and speaker over a few metres; NFC is the tap-to-pay and metro-card range, a couple of centimetres. Both raise the same question Wi-Fi does: who can hear this, and who can pretend to be the other side?',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism, briefly. Bluetooth devices *pair* - they exchange keys once so they recognise each other later, like saving a contact so you know who is calling. The security depends on how that pairing happened: a modern pairing with a confirmed number on both screens is strong; older "just works" pairing with no confirmation can be tricked. NFC has almost no security of its own - it is a dumb, super-short-range link that simply moves a few bytes when two chips are close. The real security lives in what is on top: a payment app adds encryption and one-time codes, so a captured tap is useless to replay. A plain NFC tag or an unlocked transit card does not, which is why cloning those is easy.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one everyday example. You tap your phone to pay. The terminal and phone use NFC purely as the pipe; the actual payment runs a scheme where your card number is replaced by a one-time token that is useless if captured. Contrast a cheap NFC access tag for an office door that just says "ID 4271" every time - an attacker with a reader can stand next to you in a lift, read `4271`, and clone it onto a blank tag. Same radio, wildly different safety, entirely because of what sits on top of it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Bluetooth range** - roughly up to 10m for phones; "Classic" for audio, "BLE" for low-power gadgets',
              '**Pairing** - the one-time key exchange; a confirmed-code pairing is far safer than "just works"',
              '**NFC range** - a few centimetres, which is its main built-in defence',
              '**Replay risk** - static NFC tags and old cards can be read and cloned; tokenised payments cannot be replayed',
              '**Discoverable mode** - a Bluetooth device announcing itself, the equivalent of a broadcast SSID',
            ],
          },
          {
            type: 'command',
            description: 'See the Bluetooth devices your own machine can discover nearby:',
            commands: ['bluetoothctl', 'scan on'],
          },
          {
            type: 'paragraph',
            text:
              'Running `bluetoothctl` then `scan on` prints a live list of nearby Bluetooth devices, each with a MAC-style address and, often, a friendly name like `Arya-Buds` or `Living Room Speaker`. That name is the giveaway: people label devices personally, so a scan in a public place quietly reveals who is around and what they carry. You are only listening for announcements here, exactly like scanning for Wi-Fi beacons - the short range is the only thing keeping it local.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: short range is a real defence but not a guarantee - a determined attacker with a good antenna reaches further than the spec claims. The practical advice you would give: keep Bluetooth off or non-discoverable when you are not using it, prefer confirmed-code pairing, and never treat a static NFC tag or an old unencrypted card as a secure key. For payments, the tokenisation on top is what keeps you safe, not the NFC itself.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'NFC is safe because of what sits on top',
            text:
              'The NFC radio has almost no security by itself. Tap-to-pay is safe because the payment app adds one-time tokens - a captured tap cannot be replayed. A plain tag has none of that, so it clones trivially.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can explain why two taps that look identical - a payment and an access tag - have completely different safety, and it comes down to what runs on top of the radio.',
          },
          {
            type: 'quiz',
            question: 'Why is tapping your phone to pay generally safe even though NFC has weak built-in security?',
            options: [
              'NFC encrypts everything by default',
              'The payment layer on top uses one-time tokens, so a captured tap cannot be replayed',
              'The terminal blocks all attackers',
              'Phones disable NFC during payment',
            ],
            correctIndex: 1,
            explanation: 'NFC is just the pipe. The payment scheme adds tokenisation on top, so intercepting the tap gives an attacker nothing reusable.',
          },
        ],
      },
    ],
  },
  {
    slug: 'packet-analysis',
    title: 'Packet Analysis',
    description:
      'Open a captured file of network traffic and read what really happened, byte by byte, instead of guessing. By the end you can approach a capture with a plan, drive Wireshark and tcpdump for the everyday jobs, write filters that cut thousands of packets down to the handful that matter, and follow one conversation from first handshake to the data it carried.',
    lessons: [
      {
        slug: 'packet-analysis',
        title: 'Packet Analysis: The Mindset',
        summary: 'A capture has ten thousand packets and you care about six. The skill is not reading packets - it is finding the right ones.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A packet capture is a recording of everything that crossed a wire. Open one raw and it is overwhelming - tens of thousands of rows scrolling past. The real skill is not reading a packet; anyone can do that. It is walking in with a question and throwing away the 99% that does not answer it.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mindset, as a repeatable process. First, know your question before you open the file: "did this login succeed?", "what did that malware phone home to?", "why is the app slow?". Second, find an anchor - one packet you are sure is relevant, like the connection to a suspicious IP. Third, expand outward from that anchor by filtering to just its conversation. Fourth, read the story in order: who spoke first, what they said, how the other side replied. You are a detective with a transcript, not a reader working through a book cover to cover.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete investigation. You are handed a capture and told "a machine may be leaking data to `203.0.113.50`". Your question is set. You filter to `ip.addr == 203.0.113.50` and the ten thousand packets collapse to forty. You see your internal host `192.168.1.20` opened a connection to it on port 443, and there is a steady stream of outbound packets far larger than the replies. That imbalance - lots going out, little coming back - is the anchor that says "upload, not browsing". Now you follow just that conversation to see how much left and when. You never read the other 9,960 packets, and you did not need to.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Decide the question first - what are you actually trying to prove or find?',
              'Find one anchor packet you are confident is relevant',
              'Filter to that conversation so the noise disappears',
              'Read it in time order: who spoke first, the reply, the pattern',
              'Note the direction and volume - outbound-heavy often means data leaving',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Direction and size tell a story before you read a byte',
            text:
              'A conversation that sends far more than it receives smells like an upload or exfiltration. One with tiny regular beats smells like malware checking in. You can read intent from shape alone.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You approach a capture with a question and an anchor instead of scrolling, so a ten-thousand-packet file becomes a six-packet answer.',
          },
          {
            type: 'related_lesson', lessonSlug: 'how-a-packet-travels', title: 'Recap: Follow One Packet End to End' },
          {
            type: 'quiz',
            question: 'What is the first thing you should do when handed a large packet capture?',
            options: [
              'Read every packet in order',
              'Decide the specific question you are trying to answer',
              'Delete all encrypted traffic',
              'Sort by packet size only',
            ],
            correctIndex: 1,
            explanation: 'Analysis starts with a question. Without one you have no way to know which packets matter, and a capture has far too many to read blindly.',
          },
        ],
      },
      {
        slug: 'wireshark-tour',
        title: 'Wireshark Tour',
        summary: 'The tool everyone uses to read captures. One job this lesson: open a capture, find a web request, and read what it said.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Wireshark from scratch - open a capture, filter to one HTTP request, read it'),
          {
            type: 'paragraph',
            text:
              'Wireshark is the standard tool for reading packet captures, and it looks intimidating for about five minutes. This lesson has one task: open a capture, find a single web request, and read what the browser actually sent. Do that once and the interface stops being scary.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the layout you need. The window has three stacked panes. The top is the *packet list* - one row per packet, with time, source, destination and a summary. The middle is the *detail pane* - click any packet and it expands into the layers you already know: Ethernet frame, then IP, then TCP, then the application data, each one a collapsible tree. The bottom is the *bytes pane* - the same packet as raw hex, which you rarely need. The one control that matters most sits at the very top: the *display filter* bar, where you type an expression to hide everything that does not match.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the one task end to end. Open the capture. In the filter bar type `http.request` and press enter - now the list shows only outgoing web requests, cutting thousands of TCP and TLS packets. Click one row. In the detail pane, expand the *Hypertext Transfer Protocol* section and you see the real request: `GET /login HTTP/1.1`, the `Host: example.com` header, the `User-Agent`, any cookies. That is the exact text your browser put on the wire. Right-click the packet and choose *Follow > HTTP Stream* and Wireshark stitches the whole request and the server\'s response into one readable page.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Packet list** (top) - one row per packet; the overview',
              '**Detail pane** (middle) - the clicked packet broken into its layers',
              '**Bytes pane** (bottom) - raw hex, rarely needed',
              '**Display filter bar** - your most-used control; type an expression to hide the rest',
              '**Follow Stream** - right-click to reassemble a whole conversation into readable text',
            ],
          },
          {
            type: 'command',
            description: 'Capture a little traffic from the command line into a file Wireshark can open:',
            commands: ['sudo tcpdump -i any -c 50 -w /tmp/sample.pcap', 'wireshark /tmp/sample.pcap'],
          },
          {
            type: 'paragraph',
            text:
              'The first command records 50 packets from any interface and writes them to `sample.pcap`; the second opens that file in Wireshark. When it loads you will see those 50 rows in the packet list. Type `http.request` in the filter bar and most vanish, leaving just the web requests - proof the filter works. If nothing shows, your browsing was HTTPS (encrypted), so try `tls` instead and you will see the encrypted sessions listed even though you cannot read their contents. That difference - readable HTTP versus opaque TLS - is the single most important thing a capture teaches you.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: Wireshark is how you prove what a device or app actually sent, rather than what its docs claim. Testing a mobile app and suspect it leaks a token in plain text? Capture, filter to `http`, and either you see the token in the clear (a finding) or you see only `tls` (encrypted, good). It turns "I think it does X" into "here is the exact packet where it did X", which is the difference between a hunch and a report.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Display filter vs capture filter',
            text:
              'A capture filter decides what gets recorded (set before capturing, harder syntax). A display filter decides what you see now (typed any time, easy syntax like `http.request`). Beginners should live in the display filter.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can open a capture in Wireshark, filter to a single web request, and read the exact bytes a browser sent to a server.',
          },
          {
            type: 'quiz',
            question: 'In Wireshark, what does the display filter bar do?',
            options: [
              'Deletes packets permanently from the file',
              'Hides packets that do not match so you see only relevant ones',
              'Encrypts the capture',
              'Changes which network card is used',
            ],
            correctIndex: 1,
            explanation: 'A display filter only changes what is shown; nothing is deleted. It is the fastest way to cut a huge capture down to what matters.',
          },
        ],
      },
      {
        slug: 'filters-that-actually-help',
        title: 'Filters That Actually Help',
        summary: 'A handful of filter expressions turn a wall of packets into an answer. These are the ones you will type every single time.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Filtering is the whole game in packet analysis, and you only need a small set of expressions to do 90% of real work. This lesson gives you those expressions and, more importantly, how to combine and narrow them so you go from "everything" to "the six packets I need" in a couple of steps.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism of a Wireshark display filter. You name a field, compare it to a value, and only packets where that is true stay visible. `ip.addr == 203.0.113.50` shows packets to or from that IP. `tcp.port == 443` shows HTTPS. You join conditions with `and`, `or`, `not`: `ip.addr == 203.0.113.50 and tcp.port == 443` shows only that host\'s HTTPS. The skill is *narrowing in stages* - start broad with one host, see what protocols it uses, then add a protocol condition, then a specific field. Each step throws away more noise.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one narrowing sequence. You are chasing a failed login. Step one: `http` - shows all web traffic, still hundreds of packets. Step two: `http.request.method == "POST"` - logins are POSTs, now you have a dozen. Step three: `http.request.uri contains "login"` - now two packets, the login attempt and maybe a retry. You click the first, follow the stream, and read the exact form data and the server\'s response code. Three filters took you from hundreds of packets to the one that answers "did the login go through?". That staged narrowing is the technique, not the individual expressions.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`ip.addr == 1.2.3.4` - all traffic to or from that IP',
              '`tcp.port == 443` - a specific port (443 = HTTPS)',
              '`http` / `tls` / `dns` - only that protocol',
              '`http.request.method == "POST"` - only POST requests (logins, form submits)',
              '`dns.qry.name contains "example"` - DNS lookups for a name',
              '`tcp.flags.syn == 1 and tcp.flags.ack == 0` - connection attempts (the first SYN)',
              'Combine with `and`, `or`, `not` to narrow in stages',
            ],
          },
          {
            type: 'command',
            description: 'The same idea works in tshark, Wireshark\'s command-line twin - filter a saved capture without the GUI:',
            commands: ['tshark -r /tmp/sample.pcap -Y "http.request.method == \\"POST\\""'],
          },
          {
            type: 'paragraph',
            text:
              'This reads the saved capture and prints only the POST requests, using the exact same filter syntax you would type in the GUI (`-Y` means "display filter"). Each line of output is one matching packet with its number, time, source, destination and a summary of the request. If it prints nothing, there were no POSTs in that capture - which is itself an answer. Running filters from the command line like this is how you script analysis across hundreds of capture files without clicking through each one.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: a filter is how you answer a yes/no question about a capture fast. "Did this host ever talk to that IP?" is one filter. "Were any credentials sent over plain HTTP?" is `http.request.method == "POST"` plus a read of the body. A defender triaging an alert filters to the suspect IP and reads the conversation in under a minute. Without filters you would scroll forever; with the right five expressions you get answers at the speed of typing.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Narrow in stages, do not guess one perfect filter',
            text:
              'You will rarely nail the exact filter first try. Start broad (one host or one protocol), read what you get, then add a condition. Two or three quick steps beat staring at a blank result wondering what you typed wrong.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can chain filter conditions to narrow a huge capture down to the exact packets that answer your question.',
          },
          {
            type: 'quiz',
            question: 'You want only the POST requests to or from 10.0.0.5. Which filter is right?',
            options: [
              'ip.addr == 10.0.0.5 or http',
              'ip.addr == 10.0.0.5 and http.request.method == "POST"',
              'tcp.port == 10.0.0.5',
              'not http',
            ],
            correctIndex: 1,
            explanation: 'You combine an address condition and a method condition with "and", so both must be true for a packet to show.',
          },
        ],
      },
      {
        slug: 'tcpdump-basics',
        title: 'tcpdump Basics',
        summary: 'No GUI, no problem. When you are on a remote server over SSH, tcpdump is how you capture and read traffic.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('tcpdump on a remote server - capture, filter and read traffic with no GUI'),
          {
            type: 'paragraph',
            text:
              'Wireshark needs a screen. Half the time you are on a remote server over SSH with nothing but a terminal, and that is where tcpdump lives. It captures and prints packets as text, and once you know four options you can grab exactly the traffic you want and read it inline.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism. tcpdump listens on an interface and prints one line per packet. The options you actually need: `-i` picks the interface (`-i any` for all), `-n` stops it from slowly resolving names so you see raw IPs and ports, `-c` limits how many packets to grab, and `-w` writes to a file instead of the screen (so you can pull it into Wireshark later). After the options you add a *capture filter* in its own simple language: `port 443`, `host 203.0.113.50`, `tcp`, joined with `and`/`or`. That filter language is different from Wireshark\'s display filters - simpler, and set before capture.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real line and read its output. You run `tcpdump -i any -n -c 5 port 53`. That says: all interfaces, no name resolution, stop after 5 packets, only DNS traffic (port 53). A line comes back like `10:22:01.441 IP 192.168.1.7.51000 > 192.168.1.1.53: 4212+ A? example.com.`. Read it left to right: the time, `IP` for the protocol, your machine and source port `51000`, the `>` arrow meaning "sending to", the DNS server on port `53`, then `A? example.com` meaning "what is the A record (IPv4 address) for example.com?". The reply line right after shows the answer. You just read a DNS lookup with no GUI at all.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`-i any` - capture on all interfaces (or name one, like `-i eth0`)',
              '`-n` - do not resolve names; show raw IPs and ports (faster, clearer)',
              '`-c 5` - stop after 5 packets so it does not run forever',
              '`-w file.pcap` - save to a file instead of printing (open it in Wireshark later)',
              '`port 53` / `host 1.2.3.4` / `tcp` - capture filters, joined with `and` / `or`',
            ],
          },
          {
            type: 'command',
            description: 'Capture five DNS packets, no name resolution, and print them as text:',
            commands: ['sudo tcpdump -i any -n -c 5 port 53'],
          },
          {
            type: 'paragraph',
            text:
              'Each printed line is one packet. The `>` arrow shows direction (source on the left, destination on the right), the numbers after the last dot are ports, and for DNS the tail (`A? example.com`) tells you what was asked and the reply tells you the answer. If the command just hangs with no output, no DNS traffic is happening - trigger some by running a lookup in another terminal, and lines will appear. Because you passed `-c 5`, it exits on its own after five, so you are never stuck killing a runaway capture.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: on a compromised or suspicious server you often cannot install anything, but tcpdump is almost always already there. A defender uses it to snapshot "what is this box talking to right now?" straight from the shell. A tester uses `-w` to capture on the server, then copies the file back to a workstation to open in Wireshark - the best of both: capture where the traffic is, read it where the screen is. Four options and one filter cover nearly every real situation.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Always cap or write, never leave it running blind',
            text:
              'A bare `tcpdump` on a busy server floods your screen and can fill a disk if you add `-w` without limits. Use `-c` to cap the count, or a size/rotation limit when writing, so a forgotten capture never becomes an incident of its own.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can capture and read traffic on a remote server with nothing but a terminal, and save a capture to open in Wireshark later.',
          },
          {
            type: 'quiz',
            question: 'What does the -w option do in tcpdump?',
            options: [
              'Filters to only web traffic',
              'Writes the captured packets to a file instead of printing them',
              'Resolves all hostnames',
              'Waits before starting',
            ],
            correctIndex: 1,
            explanation: '-w saves packets to a file (e.g. capture.pcap) which you can later open in Wireshark. -n disables name resolution; there is no web-only flag.',
          },
        ],
      },
      {
        slug: 'reading-a-pcap-like-a-detective',
        title: 'Reading a PCAP Like a Detective',
        summary: 'Put it together: a mystery capture, a question, and a walk from first packet to conclusion.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Time to combine everything. You have the mindset, Wireshark, filters and tcpdump. Now we walk one full investigation of a mystery capture, start to finish, the way you would on a real case - a question, a series of filters, and a conclusion you can defend with specific packets.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The case: a suspicious outbound connection',
          },
          {
            type: 'paragraph',
            text:
              'The scenario: a defender got an alert that `192.168.1.20` might be infected. The capture has 40,000 packets. Your question: what is this host doing that it should not be? You start with an anchor - filter to just that host with `ip.addr == 192.168.1.20`. The count drops to a few thousand. Scanning the destinations, most are normal (DNS to the local resolver, HTTPS to known sites) but one stands out: repeated connections to `203.0.113.50` on port 8443, a port nothing normal uses, at a steady 60-second beat.',
          },
          {
            type: 'paragraph',
            text:
              'Now narrow and read. Filter to `ip.addr == 203.0.113.50` - forty packets. The pattern is textbook beaconing: every 60 seconds the host sends a small packet out and gets a small packet back, like clockwork. That regular heartbeat is what separates malware checking in with its control server from a human browsing, which is bursty and irregular. You right-click and Follow the TCP Stream. It is TLS, so the contents are encrypted - you cannot read the commands. But you do not need to: the destination, the odd port, and the metronome timing are already enough to say "this host is beaconing to an unknown server, isolate it". You back the conclusion with the packet numbers and timestamps.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Question: what is `192.168.1.20` doing wrong?',
              'Anchor: filter to that host, scan its destinations',
              'Spot the odd one out: `203.0.113.50:8443`, a port nothing normal uses',
              'Narrow: filter to that IP, see the 60-second beacon pattern',
              'Follow the stream: TLS, so encrypted - but timing and destination already tell the story',
              'Conclude with evidence: packet numbers, timestamps, the beacon interval',
            ],
          },
          {
            type: 'command',
            description: 'Pull the same conclusion from the command line - list who a host talked to, most-contacted first:',
            commands: ['tshark -r /tmp/case.pcap -q -z conv,ip'],
          },
          {
            type: 'paragraph',
            text:
              'The `-z conv,ip` option prints a conversation summary: one row per pair of IPs that talked, with packet and byte counts each way. Reading it, the row for `192.168.1.20` <-> `203.0.113.50` jumps out not because of volume but because of its steady, low, symmetric counts over a long time - the numeric shadow of beaconing. This is the same detective conclusion the GUI gave you, reached without opening a window, which is how you triage many captures quickly. A conversation table is often the fastest first look at an unfamiliar capture.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: this exact method - question, anchor, narrow, follow, conclude with evidence - is how every real capture gets read, whether you are a blue-teamer hunting malware or a bounty hunter proving an app leaked a token. Encryption does not stop you: even when you cannot read contents, the who, the when, the how-much and the how-often tell a story. The output of the work is never "I looked around", it is "packets 8,412 to 8,460 show X", and that specificity is what makes a finding believable.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Encrypted does not mean invisible',
            text:
              'You often cannot read TLS contents, and you rarely need to. The destination, the port, the size and the rhythm of a conversation reveal intent on their own. Metadata is loud even when the payload is silent.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can take a mystery capture, drive it from a question to an evidence-backed conclusion, and defend that conclusion with specific packets.',
          },
          { type: 'practice_ref', title: 'Packet Analysis check', exerciseSlug: 'packet-analysis-quiz' },
          {
            type: 'quiz',
            question: 'A host connects to one external IP every 60 seconds, sending and receiving small packets each time. What does this pattern most suggest?',
            options: [
              'Normal web browsing',
              'Malware beaconing to a control server',
              'A large file download',
              'A DNS lookup',
            ],
            correctIndex: 1,
            explanation: 'A steady, low-volume, regular heartbeat to one host is classic beaconing. Browsing is bursty and irregular; a download is large and one-directional.',
          },
        ],
      },
    ],
  },
  {
    slug: 'email-and-messaging',
    title: 'Email and Messaging',
    description:
      'How email actually moves, and why it was born trusting anyone who speaks up - which is the root of every spoof and phishing mail you have ever seen. By the end you can narrate the SMTP conversation that delivers a message, explain why the envelope sender and the From line are different things, read the three DNS records that fight forgery, and judge from a raw header block whether a mail is real or faked.',
    lessons: [
      {
        slug: 'smtp-imap-pop3',
        title: 'SMTP, IMAP, POP3',
        summary: 'Three protocols run your inbox. One sends, two fetch - and the sending one will happily believe you are anyone.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Send an email by hand - typing the raw SMTP conversation into a live server'),
          {
            type: 'paragraph',
            text:
              'Email runs on three protocols, and mixing them up hides the whole security story. SMTP *sends* mail between servers. IMAP and POP3 *fetch* mail from your server to your phone. The interesting one for a hacker is SMTP, because it was designed in an era of trust - it will cheerfully accept a message claiming to be from anyone, and that single fact is the root of all email spoofing.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The SMTP conversation, line by line',
          },
          {
            type: 'paragraph',
            text:
              'SMTP is a plain-text conversation between two servers, readable like a chat log. Your server connects to the recipient\'s server and they talk in short commands. `HELO mail.example.com` - "hi, I am this server". `MAIL FROM:<[email protected]>` - "here is who this is from, for delivery purposes". `RCPT TO:<[email protected]>` - "deliver it to this person". `DATA` - "here comes the message", followed by the headers (including the `From:` you see in your inbox) and the body, ended by a lone dot on its own line. The receiving server replies to each with a code like `250 OK`. That is the entire mechanism that moves nearly every email on earth.',
          },
          {
            type: 'paragraph',
            text:
              'Now the crucial catch, walked with real values. There are TWO senders in that conversation and they do not have to match. The `MAIL FROM:<[email protected]>` is the *envelope sender* - used for routing and bounces, like the return address written on the outside of a physical envelope. Inside the `DATA` section, a separate `From: [email protected]` header is what your mail app displays. Nothing in basic SMTP forces these to agree. So an attacker can set `MAIL FROM:<[email protected]>` for delivery but put `From: [email protected]` in the visible header - and your inbox shows "your bank" while the mail came from a stranger. Envelope sender versus header From: burn that difference into your memory, because every spoof exploits it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SMTP** (port 25 server-to-server, 587 for submission) - *sends* mail',
              '**IMAP** (port 143 / 993) - *fetches* mail, keeps it on the server, syncs across devices',
              '**POP3** (port 110 / 995) - *fetches* mail, traditionally downloads and deletes from the server',
              '**Envelope sender** (`MAIL FROM`) - the return address, used for routing and bounces',
              '**Header From** (`From:`) - what your mail app shows you; NOT verified by basic SMTP',
            ],
          },
          {
            type: 'command',
            description: 'Speak SMTP by hand to see the raw conversation (use a mail server you are authorised to test):',
            commands: [
              'nc mail.example.com 25',
              'HELO test.example.com',
              'MAIL FROM:<[email protected]>',
              'RCPT TO:<[email protected]>',
              'DATA',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Each line you type gets a numbered reply from the server. `220` on connect means "ready". After `HELO` you get `250` ("ok"). `MAIL FROM` and `RCPT TO` each return `250` if accepted. `DATA` returns `354` meaning "go ahead, send the message, end with a dot". You then type your headers and body, a lone `.`, and a final `250` confirms it is queued. Reading those codes, you are watching the exact handshake every mail server performs millions of times a day - and you just proved you can dictate the visible `From:` yourself, which is the spoofing problem in one sitting.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: because SMTP trusts what it is told, the entire defence against forgery had to be bolted on afterwards as DNS records that let a receiver check "did this server have the right to send as this domain?" - which is the next lesson. As a tester you check whether a target\'s mail setup lets you spoof its domain; as a defender you make sure it cannot. The whole spoofing conversation only makes sense once you have seen that basic SMTP never verifies the sender at all.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'IMAP keeps, POP3 takes',
            text:
              'IMAP leaves mail on the server so all your devices see the same inbox. POP3 traditionally downloads then deletes, so mail lives on one device. If your phone and laptop show the same read/unread state, you are on IMAP.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only against servers you are allowed to test',
            text:
              'Hand-typing SMTP against a mail server you do not own or lack written permission to test can be unauthorised access. Keep this to your own server or a sanctioned lab.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can narrate the SMTP conversation that delivers a mail and explain why the envelope sender and the visible From line are two different, unlinked things.',
          },
          {
            type: 'quiz',
            question: 'In SMTP, why can an email show "From: your bank" while actually coming from an attacker?',
            options: [
              'SMTP encrypts the sender so it cannot be checked',
              'The visible From header is separate from the envelope sender and basic SMTP does not verify it',
              'IMAP rewrites the sender',
              'The attacker guessed the bank password',
            ],
            correctIndex: 1,
            explanation: 'The header From: (what you see) is not the same as the envelope MAIL FROM, and plain SMTP verifies neither - so the visible sender can be forged.',
          },
        ],
      },
      {
        slug: 'spf-dkim-dmarc',
        title: 'SPF, DKIM, DMARC',
        summary: 'Three DNS records bolted onto email to answer one question SMTP never could: is this sender allowed to send as this domain?',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Because SMTP trusts anyone, three defences were added as DNS records: SPF, DKIM and DMARC. Together they let a receiving server ask "is this mail really allowed to claim it is from this domain?" - the question plain SMTP never asks. You need all three, because each checks a different thing and each has a gap the others cover.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'What each record actually checks',
          },
          {
            type: 'paragraph',
            text:
              'SPF (Sender Policy Framework) is a public list of which servers are allowed to send mail for a domain. It is a DNS TXT record like `v=spf1 include:_spf.google.com ip4:203.0.113.10 -all`, meaning "Google\'s servers and 203.0.113.10 may send as us; reject everything else" (the `-all` is the hard "reject"). The receiver checks the sending server\'s IP against this list. DKIM (DomainKeys Identified Mail) adds a cryptographic signature to the message headers using a private key; the matching public key sits in DNS, so the receiver can verify the mail was really signed by the domain and was not altered in transit. DMARC ties them together: it is a policy record saying "if SPF or DKIM fails AND the failing identity does not align with the visible From domain, then do this" - typically quarantine or reject - and it can email you reports of who is sending as you.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real check with values. A mail arrives claiming `From: [email protected]`. The receiving server looks up `_spf.bank.example` in DNS, gets `v=spf1 ip4:203.0.113.10 -all`, and sees the mail came from `198.51.100.99` - not on the list, so SPF fails. It checks the DKIM signature; there is none, so DKIM fails. It then looks up the DMARC record `v=DMARC1; p=reject;` at `_dmarc.bank.example`, which says "on failure, reject". Because both checks failed and the From domain is protected by a reject policy, the mail is bounced before it ever reaches the inbox. That is the three records working as a team to kill a spoof.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SPF** - a DNS list of servers allowed to send for the domain; checks the sending IP',
              '**DKIM** - a cryptographic signature; proves the mail really came from the domain and was not altered',
              '**DMARC** - the policy: what to do (none / quarantine / reject) when SPF or DKIM fails and does not align with the From',
              '**Alignment** - DMARC requires the passing check to match the *visible* From domain, closing SPF\'s envelope-only gap',
              '**`p=none`** - a DMARC policy that only reports and enforces nothing; common and a frequent weakness',
            ],
          },
          {
            type: 'command',
            description: 'Look up a domain\'s email protection records yourself (these are public DNS):',
            commands: [
              'dig +short TXT example.com',
              'dig +short TXT _dmarc.example.com',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command prints the domain\'s TXT records; the SPF one starts with `v=spf1` and lists the allowed senders, ending in `-all` (strict) or `~all` (soft, "probably reject"). The second looks up the DMARC record and shows its policy: `p=reject` means spoofed mail is bounced, `p=quarantine` sends it to spam, and `p=none` means DMARC is only watching and enforces nothing - so spoofing still lands. Reading these, you can tell in two commands whether a domain is genuinely protected or just looks like it is. A missing DMARC record or `p=none` is the gap attackers and testers both look for first.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: checking these records is a legitimate, entirely passive recon step on any authorised target, and a weak email setup (no SPF, no DKIM, or DMARC at `p=none`) can mean their domain is spoofable - a real, reportable finding because it enables phishing of their staff and customers. As a defender the fix is concrete: publish a strict SPF, sign with DKIM, and move DMARC to `p=reject` once reports confirm nothing legitimate breaks. All three, or attackers walk through the gap the missing one leaves.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'p=none is a spoofer\'s green light',
            text:
              'A domain can have perfect-looking SPF and DKIM, but if DMARC is `p=none` nothing is enforced - failing mail still gets delivered. Always read the policy, not just the presence of the records.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can look up a domain\'s SPF and DMARC records and say in plain words whether that domain can be spoofed.',
          },
          { type: 'related_lesson', lessonSlug: 'dns-records-and-resolution', title: 'Recap: DNS Records and Resolution' },
          {
            type: 'quiz',
            question: 'A domain has SPF and DKIM set up, but its DMARC record says p=none. What does that mean for spoofing?',
            options: [
              'Spoofing is fully blocked',
              'Failing mail is still delivered because no enforcement policy is applied',
              'DKIM is disabled',
              'The domain has no DNS',
            ],
            correctIndex: 1,
            explanation: 'p=none only monitors and reports. Without p=quarantine or p=reject, mail that fails the checks is still delivered, so the domain remains spoofable.',
          },
        ],
      },
      {
        slug: 'email-spoofing-and-phishing-headers',
        title: 'Reading Phishing Headers',
        summary: 'The full story of a mail is in its raw headers. Read them top-down and you can prove a "from your bank" email is a fake.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('Reading a real phishing email header block top-down - Received, Auth-Results, Return-Path'),
          {
            type: 'paragraph',
            text:
              'Every email carries a block of raw headers most people never see - the metadata added by each server it passed through. Learn to read that block top-down and you can judge, with evidence, whether a mail really came from who it claims. This is the single most useful email-forensics skill, and it needs no tools beyond "show original" in your mail app.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The three things you read, and in what order',
          },
          {
            type: 'paragraph',
            text:
              'Three parts of the header block tell the story. The `Received:` chain is a stack of stamps, one per server that handled the mail, newest at the TOP and oldest at the BOTTOM - so you read UP from the bottom to follow the mail\'s real journey from origin to you. `Authentication-Results:` is the receiving server\'s verdict on SPF, DKIM and DMARC - it literally prints `spf=pass` or `dkim=fail`. `Return-Path:` is the envelope sender (the `MAIL FROM` from the SMTP lesson), which you compare against the visible `From:` - a mismatch is the classic spoof tell. Read those three and you rarely need anything else.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real header block and reach a verdict. The mail shows `From: [email protected]`. You open the headers. `Authentication-Results:` says `spf=fail dkim=none dmarc=fail`. The bottom `Received:` line - the true origin - reads `from unknown (198.51.100.99)` on a random hosting provider, nothing to do with any bank. `Return-Path:` is `<[email protected]>`, completely different from the visible `From:`. Three independent signals all agree: SPF and DMARC failed, the origin server is a stranger, and the envelope sender does not match the display name. Verdict: forged, and you can point at the exact lines that prove it. That is a defensible conclusion, not a hunch.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '`Received:` chain - read bottom-up; the lowest line is the true origin server',
              '`Authentication-Results:` - the receiver\'s SPF / DKIM / DMARC verdict; `fail` is a red flag',
              '`Return-Path:` (envelope sender) vs `From:` (visible) - a mismatch is a classic spoof sign',
              '`Reply-To:` - if it points somewhere odd, replies go to the attacker even if From looks real',
              'Display name vs actual address - `Your Bank <[email protected]>` is a giveaway',
            ],
          },
          {
            type: 'command',
            description: 'Pull the key headers out of a saved .eml file so you can read them fast:',
            commands: ['grep -iE "^(received|authentication-results|return-path|from|reply-to):" message.eml'],
          },
          {
            type: 'paragraph',
            text:
              'This scans a saved email file and prints only the headers that matter, so you skip the noise. Read the output the way the lesson described: check `Authentication-Results:` for any `fail`, compare `Return-Path:` against `From:` for a mismatch, and look at the lowest `Received:` line for the true origin. If `Authentication-Results` shows `spf=pass dkim=pass dmarc=pass` and the Return-Path matches the From, the mail is very likely genuine. If any of those disagree, you have a concrete reason to treat it as forged - and the exact line to cite.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker or defender: header reading is how a SOC analyst triages a reported phishing mail in under a minute, and how you, on an authorised engagement, demonstrate that a target\'s domain is actually spoofable rather than just theoretically weak. It is also your own daily defence - one look at `Authentication-Results` and the origin server tells you whether that "urgent invoice" is real. The headers do not lie the way a display name does; they are the receipts of the mail\'s real journey.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The display name is theatre',
            text:
              'A mail can show `Government of India <[email protected]>` - the friendly name is free text an attacker types. Always read the actual address and the headers behind it, never the name your app renders in bold.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test spoofing only where you are authorised',
            text:
              'Sending forged mail to real people, even to prove a point, is phishing and is illegal without written authorisation. Analyse headers freely; send spoofed mail only inside a sanctioned assessment.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can open a raw header block, read the Received chain, Authentication-Results and Return-Path, and prove with specific lines whether a mail is forged.',
          },
          { type: 'practice_ref', title: 'Email and Messaging check', exerciseSlug: 'email-and-messaging-quiz' },
          {
            type: 'quiz',
            question: 'You suspect a phishing email. Which header gives the receiving server\'s own verdict on SPF, DKIM and DMARC?',
            options: [
              'Subject:',
              'Authentication-Results:',
              'Content-Type:',
              'Message-ID:',
            ],
            correctIndex: 1,
            explanation: 'Authentication-Results records whether SPF, DKIM and DMARC passed or failed. A fail there, plus a Return-Path that does not match From, strongly indicates a forgery.',
          },
        ],
      },
      {
        slug: 'email-attack-surface',
        title: 'The Email Attack Surface',
        summary: 'Beyond spoofing, email is a whole attack surface: attachments, links, trackers, auto-loading content and the humans reading it.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Spoofing is only the entry trick. Once a mail lands, email is a rich attack surface in its own right - the attachment, the link, the invisible tracker, and above all the human deciding whether to click. Knowing the full surface tells you what to test on an authorised engagement and what to warn users about.',
          },
          {
            type: 'paragraph',
            text:
              'Here are the moving parts. Attachments carry payloads - a macro-enabled document that runs code when "enable content" is clicked, or an executable disguised with a double extension like `invoice.pdf.exe` where the real `.exe` is easy to miss. Links go to attacker pages: a lookalike login (`bank-example.com` instead of `bank.example.com`) that harvests credentials, or a URL that fires an action while you are logged in. Remote content - images loaded from the attacker\'s server - acts as a tracking pixel: the moment your app fetches it, the attacker learns you opened the mail, when, and roughly where. And plain social pressure ("your account will be closed in 2 hours") rushes the reader past their judgement.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete lure. An email passes basic checks (the attacker used a domain they legitimately own) and reads `From: [email protected]`, subject "Delivery failed - reschedule now". It has a button. Hovering it - without clicking - the status bar shows `http://couriier-reschedule.example/track?id=8842` (note the doubled "i"). The page is a pixel-perfect copy of a courier site asking for your address and a "small redelivery fee" card payment. Nothing here needed SMTP spoofing at all; it needed a plausible pretext, a lookalike domain, and a moment of hurry. That is why user awareness sits alongside the technical records.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Malicious attachments** - macro documents, double extensions (`file.pdf.exe`), archive tricks',
              '**Phishing links** - lookalike domains, URL shorteners hiding the real destination',
              '**Tracking pixels** - remote images that report when and where a mail was opened',
              '**Lookalike / homoglyph domains** - `bank-example.com`, `paypa1.com` (a "1" for an "l")',
              '**Social pressure** - urgency, authority and fear to rush the reader into clicking',
            ],
          },
          {
            type: 'command',
            description: 'Before trusting a link, expand a shortened URL to see where it really goes (read-only, no click):',
            commands: ['curl -sI "https://short.example/abc123" | grep -i "^location:"'],
          },
          {
            type: 'paragraph',
            text:
              'This asks the shortener for just the headers (`-I`) without following the redirect, and prints the `Location:` line - the real destination the short link points at. If a "your bank" mail\'s link expands to `http://random-host.example/login`, that mismatch is your answer before you ever load the page. Reading the `Location` header is how you unmask a shortened or hidden URL safely, seeing the target without visiting it. If there is no `Location` line, the link is not a redirect and points directly where it says.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you test or defend: on an authorised phishing-resilience assessment you map exactly these vectors, but the defences are mostly boring and effective - block risky attachment types, strip or sandbox links, disable auto-loading of remote images, and train people to hover before they click. For a defender, the technical records from the last two lessons stop the easy spoofs, and awareness handles the mails that are technically valid but socially poisoned. Email security is always these two halves together, never just one.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Hover, do not click',
            text:
              'On desktop, hovering a link shows its true destination in the corner of the window. On mobile, press and hold to preview. The visible text of a link is just words - the real URL underneath is what matters.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Simulated phishing needs sign-off',
            text:
              'Running a phishing simulation against an organisation, even to help them, requires written authorisation from someone empowered to give it. Without that, it is an attack, not a test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can name the ways a landed email attacks - attachment, link, tracker, pretext - and safely unmask a hidden URL before trusting it.',
          },
          {
            type: 'quiz',
            question: 'An email link\'s text says "bank.example.com" but hovering shows it points to "bank-example.com". What is this?',
            options: [
              'A harmless typo in the display text',
              'A lookalike domain - the real destination is a different site pretending to be the bank',
              'Proof the mail is genuine',
              'A DNS error',
            ],
            correctIndex: 1,
            explanation: 'bank-example.com is a separate domain from bank.example.com. The visible text is just words; the real URL underneath points at the attacker\'s lookalike site.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'wifi-attacks-overview',
    slug: 'wireless-quiz',
    title: 'Wireless check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does the SSID in a beacon frame tell you?',
        options: ['The password', 'The network name', 'The encryption key', 'The channel width'],
        correctIndex: 1,
        explanation: 'The SSID is the human-readable network name and is broadcast openly. The password and keys are never in the beacon.',
      },
      {
        prompt: 'Which Wi-Fi security should you treat as effectively broken today?',
        options: ['WPA3', 'WPA2 with a long random passphrase', 'WEP', 'None of these'],
        correctIndex: 2,
        explanation: 'WEP reuses a short scrambling value and its key can be recovered in minutes. WPA2 with a strong passphrase and WPA3 are fine.',
      },
      {
        prompt: 'What is the main weakness of WPA2 that WPA3 fixes?',
        options: [
          'It has no encryption',
          'Its handshake can be captured and cracked offline against a weak password',
          'It broadcasts the password',
          'It only works on 2.4GHz',
        ],
        correctIndex: 1,
        explanation: 'A captured WPA2 four-way handshake can be guessed against offline. WPA3 makes the handshake un-capturable in that way.',
      },
      {
        prompt: 'What does a deauthentication attack actually achieve?',
        options: [
          'It decrypts traffic directly',
          'It forces a client to reconnect so its handshake can be captured',
          'It changes the SSID',
          'It steals the password from the router',
        ],
        correctIndex: 1,
        explanation: 'Deauth kicks a client off; on reconnect the handshake runs again and can be captured. It never breaks encryption on its own.',
      },
      {
        prompt: 'Why is tap-to-pay over NFC generally safe despite NFC having weak built-in security?',
        options: [
          'NFC has strong encryption',
          'The payment layer uses one-time tokens, so a captured tap cannot be replayed',
          'The range is exactly zero',
          'Phones turn NFC off during payment',
        ],
        correctIndex: 1,
        explanation: 'NFC is just the short-range pipe. The payment scheme adds tokenisation on top, making an intercepted tap useless to replay.',
      },
    ],
  },
  {
    lessonSlug: 'reading-a-pcap-like-a-detective',
    slug: 'packet-analysis-quiz',
    title: 'Packet Analysis check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What should you do first when handed a large packet capture?',
        options: ['Read every packet', 'Decide the question you are answering', 'Delete encrypted packets', 'Sort by size'],
        correctIndex: 1,
        explanation: 'Analysis starts with a specific question. Without one there is no way to know which of thousands of packets matter.',
      },
      {
        prompt: 'In Wireshark, what does a display filter like http.request do?',
        options: [
          'Deletes non-matching packets from the file',
          'Shows only matching packets without deleting anything',
          'Encrypts the capture',
          'Changes the network card',
        ],
        correctIndex: 1,
        explanation: 'A display filter only hides what does not match; the packets are still in the file. It is the fastest way to cut down a capture.',
      },
      {
        prompt: 'You want only POST requests to or from 10.0.0.5. Which filter is correct?',
        options: [
          'ip.addr == 10.0.0.5 or http',
          'ip.addr == 10.0.0.5 and http.request.method == "POST"',
          'tcp.port == 10.0.0.5',
          'not http',
        ],
        correctIndex: 1,
        explanation: 'Combine an address condition and a method condition with "and" so both must be true for a packet to show.',
      },
      {
        prompt: 'What does the -w option do in tcpdump?',
        options: [
          'Filters to web traffic',
          'Writes captured packets to a file instead of printing them',
          'Resolves hostnames',
          'Limits the packet count',
        ],
        correctIndex: 1,
        explanation: '-w saves packets to a file you can open in Wireshark later. -c limits count and -n disables name resolution.',
      },
      {
        prompt: 'A host contacts one external IP every 60 seconds with small packets each way. What does this suggest?',
        options: ['Normal browsing', 'Malware beaconing to a control server', 'A big download', 'A single DNS lookup'],
        correctIndex: 1,
        explanation: 'A steady, low-volume, regular heartbeat to one host is classic beaconing. Browsing is bursty; a download is large and one-way.',
      },
    ],
  },
  {
    lessonSlug: 'email-spoofing-and-phishing-headers',
    slug: 'email-and-messaging-quiz',
    title: 'Email and Messaging check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which email protocol is used to SEND mail between servers?',
        options: ['IMAP', 'POP3', 'SMTP', 'HTTP'],
        correctIndex: 2,
        explanation: 'SMTP sends mail. IMAP and POP3 fetch mail from your server to your device.',
      },
      {
        prompt: 'Why can an email display "From: your bank" while coming from an attacker?',
        options: [
          'SMTP encrypts the sender',
          'The visible From header is separate from the envelope sender and basic SMTP verifies neither',
          'The attacker knows the bank password',
          'IMAP rewrote it',
        ],
        correctIndex: 1,
        explanation: 'The header From: you see is not the envelope MAIL FROM, and plain SMTP checks neither, so the visible sender is forgeable.',
      },
      {
        prompt: 'What does DKIM add to an email?',
        options: [
          'A list of allowed sending servers',
          'A cryptographic signature proving the domain sent it and it was not altered',
          'A policy to reject mail',
          'A tracking pixel',
        ],
        correctIndex: 1,
        explanation: 'DKIM signs the mail with the domain\'s private key; the public key in DNS lets a receiver verify origin and integrity. SPF is the allowed-server list.',
      },
      {
        prompt: 'A domain has SPF and DKIM but its DMARC is p=none. What happens to spoofed mail?',
        options: [
          'It is rejected',
          'It is still delivered because nothing is enforced',
          'It is deleted',
          'DKIM blocks it anyway',
        ],
        correctIndex: 1,
        explanation: 'p=none only monitors and reports. Without p=quarantine or p=reject the failing mail is still delivered, so the domain stays spoofable.',
      },
      {
        prompt: 'Which header shows the receiving server\'s own SPF/DKIM/DMARC verdict?',
        options: ['Subject:', 'Authentication-Results:', 'Content-Type:', 'Message-ID:'],
        correctIndex: 1,
        explanation: 'Authentication-Results records pass/fail for each check. A fail there, plus a Return-Path that does not match From, points to a forgery.',
      },
    ],
  },
];
