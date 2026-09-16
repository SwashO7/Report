# Curriculum plan — file by file

Read `_AUTHORING.md` first. This file says WHAT goes in each part file.
`C` = `importance: 'core'`, `O` = `importance: 'optional'`.
Lesson order inside a module = the order listed here. Do not add or drop lessons.
Every module gets one exercise (`<module-slug>-quiz`) unless a different slug is
named. Exercise attaches to the module's last `C` lesson unless stated.

---

## p0a.ts — Level 0 "Foundations", part A

**`start-here`** — "Start Here" — Get oriented, get legal, get a working setup.
- `what-is-hacking` — What Hacking Actually Is (vs the Movies) — C
- `hacker-types-and-jobs` — White Hat, Black Hat, and Who Actually Pays — C
- `rules-of-the-game` — The Rules: Law, Consent, and Not Going to Jail — C
- `how-to-use-suraksha-labs` — How to Actually Use This Platform — O
- `your-hacking-setup` — Your Setup: Laptop, VM, Browser — C

**`how-computers-communicate`** — "How Computers Talk" — Addresses, ports, and the two protocols that carry the internet.
- `what-is-a-computer-network` — What Is a Network, Really? — C
- `ip-addresses` — IP Addresses: The Internet's Home Addresses — C
- `mac-addresses-and-arp` — MAC Addresses and ARP — C
- `ports` — Ports: One Machine, Many Doors — C
- `tcp-and-udp` — TCP vs UDP — C
- `packets-and-encapsulation` — Packets: How Data Gets Wrapped — C

Exercises for this module: FOUR, all of them:
- `network-basics-quiz` on `packets-and-encapsulation`, title "How Computers Talk check"
- `ip-addresses-quiz` on `ip-addresses`, title "IP addresses check"
- `ports-quiz` on `ports`, title "Ports check"
- `tcp-and-udp-quiz` on `tcp-and-udp`, title "TCP vs UDP check"
(Add the `practice_ref` block only to `packets-and-encapsulation`.)

**`finding-things-on-the-internet`** — "Finding Things on the Internet" — Names, routes, and how your packet finds its way.
- `dns` — DNS: The Internet's Contact List — C
- `dhcp-and-nat` — DHCP and NAT: Why Your IP Is 192.168.x.x — C
- `routers-switches-firewalls` — Routers, Switches, Firewalls — C
- `subnetting-lite` — Subnet Masks Without the Maths Panic — O
- `traceroute-and-ping` — Ping and Traceroute: Your First Recon — C

Exercise: `dns-quiz` on `dns`, title "Finding Things on the Internet check".

---

## p0b.ts — Level 0 "Foundations", part B

**`the-web`** — "The Web" — What actually happens between your click and the page.
- `http` — HTTP: The Web's Request Language — C
- `requests-and-responses` — Anatomy of a Request and Response — C
- `headers` — Headers: The Metadata That Runs the Web — C
- `status-codes` — Status Codes: What the Server Is Telling You — C
- `urls-and-query-strings` — URLs, Paths and Query Strings — C
- `https` — HTTPS and TLS: The Padlock Explained — C
- `browser-devtools` — DevTools: Your Free Hacking Toolkit — C

Exercise: `http-quiz` on `browser-devtools`, title "The Web check".

**`sessions-and-identity`** — "Who Are You? Sessions and Identity" — How sites remember you, and how that gets abused.
- `cookies` — Cookies: Tiny Files, Huge Consequences — C
- `sessions` — Sessions: Staying Logged In — C
- `authentication-vs-authorization` — Authentication vs Authorization — C
- `jwt-basics` — JWTs: Tokens You Can Read — C
- `oauth-and-social-login` — "Login with Google" Explained — O

Exercise: `cookies-quiz` on `jwt-basics`, title "Sessions and Identity check".

**`data-and-encoding`** — "Data, Encoding and Hashing" — Tell encoding, encryption and hashing apart forever.
- `encoding-vs-encryption-vs-hashing` — Encoding vs Encryption vs Hashing — C
- `base64-hex-url-encoding` — Base64, Hex and URL Encoding — C
- `hashing-and-password-storage` — How Passwords Should Be Stored — C
- `json-and-apis-intro` — JSON and APIs in 6 Minutes — C
- `character-sets-and-unicode` — Unicode Weirdness Hackers Love — O

**`your-first-tools`** — "Your First Tools" — Four tools, one scan, zero fear.
- `command-line-basics` — The Command Line, Minus the Fear — C
- `curl-basics` — curl: Talk to Servers by Hand — C
- `nmap-first-scan` — Nmap: Your First Scan — C
- `burp-suite-first-launch` — Burp Suite: First Launch — C
- `note-taking-for-hackers` — Notes That Win Bounties — O

Exercise: `nmap-basics-quiz` on `burp-suite-first-launch`, title "Your First Tools check".

---

## p1a.ts — Level 1 "Linux and the Command Line", part A

**`terminal-survival`** — "Terminal Survival" — Move, read and search a Linux box without panic.
- `terminal-basics` — Terminal Basics — C
- `navigating-the-filesystem` — Moving Around the Filesystem — C
- `reading-and-editing-files` — Reading and Editing Files — C
- `finding-files-and-text` — find and grep: Locating Anything — C
- `pipes-and-redirection` — Pipes and Redirection — C

**`files-users-permissions`** — "Files, Users and Permissions" — Read `-rwxr-xr-x` at a glance and know why it matters.
- `files-and-permissions` — Files and Permissions — C
- `owners-groups-chmod` — Owners, Groups and chmod — C
- `suid-and-special-bits` — SUID and the Sticky Bit — O
- `users-and-processes` — Users and Processes — C
- `sudo-and-root` — sudo, root, and Why It Matters — C

**`processes-services-logs`** — "Processes, Services and Logs" — Find what is running, and what it left behind.
- `processes-and-signals` — Processes and Signals — C
- `services-and-systemd` — Services and systemd — C
- `logs-and-journalctl` — Logs: Where Systems Confess — C
- `cron-and-scheduled-jobs` — cron and Scheduled Jobs — C

---

## p1b.ts — Level 1 "Linux and the Command Line", part B

**`networking-from-the-shell`** — "Networking from the Shell" — Investigate a network with nothing but a terminal.
- `ss-netstat-and-lsof` — Who Is Listening? ss, netstat, lsof — C
- `ssh-basics` — SSH: Remote Shells Done Right — C
- `transferring-files` — Moving Files: scp, rsync, nc — C
- `dns-tools-dig-nslookup` — dig and nslookup — C

**`bash-scripting`** — "Bash Scripting" — Automate the boring half of hacking.
- `your-first-bash-script` — Your First Bash Script — C
- `variables-and-arguments` — Variables and Arguments — C
- `loops-and-conditions` — Loops and Conditions — C
- `bash-one-liners-for-hackers` — One-Liners That Do Real Work — C
- `grep-sed-awk-crash-course` — grep, sed, awk Crash Course — O

**`windows-side-quest`** — "Windows Side Quest" — Enough Windows to not be lost when the target is Windows.
- `windows-command-line` — cmd.exe Survival Kit — C
- `powershell-basics` — PowerShell Basics — C
- `windows-file-system-and-registry` — Windows Filesystem and Registry — O
- `windows-vs-linux-for-hackers` — Windows vs Linux for Hackers — O

---

## p2a.ts — Level 2 "Networking Deep Dive", part A

**`models-and-layers`** — "Models and Layers" — The OSI/TCP-IP map you will use for the rest of your career.
- `osi-model` — The OSI Model (Actually Useful Version) — C
- `tcp-ip-model` — The TCP/IP Model — C
- `how-a-packet-travels` — Follow One Packet End to End — C
- `layer-by-layer-attacks` — What Breaks at Each Layer — C

**`ethernet-and-lan`** — "Ethernet and the LAN" — What happens on the wire before IP even shows up.
- `ethernet-and-frames` — Ethernet Frames — C
- `switches-and-mac-tables` — Switches and MAC Tables — C
- `arp-deep-dive` — ARP Deep Dive (and ARP Spoofing) — C
- `vlans-and-segmentation` — VLANs and Segmentation — O

**`ip-routing-subnets`** — "IP, Routing and Subnets" — Subnetting that finally clicks, plus how routers decide.
- `ipv4-addressing-deep` — IPv4 Addressing, Properly — C
- `subnetting-for-real` — Subnetting for Real — C
- `routing-basics` — How Routing Decisions Happen — C
- `ipv6-basics` — IPv6 Without the Headache — O
- `icmp-and-diagnostics` — ICMP and Network Diagnostics — C

---

## p2b.ts — Level 2 "Networking Deep Dive", part B

**`tcp-deep-dive`** — "TCP Deep Dive" — Handshakes, flags and why scans work the way they do.
- `tcp-three-way-handshake` — The Three-Way Handshake — C
- `tcp-flags-and-states` — TCP Flags and Connection States — C
- `sequence-numbers-and-acks` — Sequence Numbers and ACKs — C
- `flow-control-and-sliding-window` — Flow Control and the Sliding Window — C
- `congestion-control` — Congestion Control — O
- `mtu-fragmentation-and-mss` — MTU, MSS and Fragmentation — O

**`udp-dns-and-friends`** — "UDP, DNS and Friends" — The stateless side of the internet, and how it gets abused.
- `udp-deep-dive` — UDP Deep Dive — C
- `dns-records-and-resolution` — DNS Records and Resolution — C
- `dns-attacks-overview` — DNS Attacks: Spoofing to Rebinding — C
- `dhcp-deep-dive` — DHCP Deep Dive — O

**`encryption-on-the-wire`** — "Encryption on the Wire" — TLS, certificates and SSH, demystified.
- `tls-handshake` — The TLS Handshake — C
- `certificates-and-pki` — Certificates and PKI — C
- `ssh-protocol-deep` — How SSH Actually Works — C
- `vpns-and-tunnels` — VPNs and Tunnels — O
- `tls-attacks-overview` — When TLS Goes Wrong — C

---

## p2c.ts — Level 2 "Networking Deep Dive", part C

**`wireless`** — "Wireless" — Wi-Fi from radio waves to WPA3.
- `how-wifi-works` — How Wi-Fi Actually Works — C
- `wep-wpa-wpa2-wpa3` — WEP to WPA3: The Security Timeline — C
- `wifi-attacks-overview` — Wi-Fi Attacks Overview — C
- `bluetooth-and-nfc-peek` — Bluetooth and NFC Peek — O

**`packet-analysis`** — "Packet Analysis" — Open a capture and read it like a detective.
- `packet-analysis` — Packet Analysis: The Mindset — C
- `wireshark-tour` — Wireshark Tour — C
- `filters-that-actually-help` — Filters That Actually Help — C
- `tcpdump-basics` — tcpdump Basics — C
- `reading-a-pcap-like-a-detective` — Reading a PCAP Like a Detective — C

**`email-and-messaging`** — "Email and Messaging" — SMTP, spoofing, and the three records that stop it.
- `smtp-imap-pop3` — SMTP, IMAP, POP3 — C
- `spf-dkim-dmarc` — SPF, DKIM, DMARC — C
- `email-spoofing-and-phishing-headers` — Reading Phishing Headers — C
- `email-attack-surface` — The Email Attack Surface — O

---

## p3a.ts — Level 3 "Programming for Hackers", part A

**`python-basics`** — "Python Basics" — Enough Python to write your own tools.
- `why-python` — Why Python Is the Hacker's Language — C
- `variables-and-types` — Variables and Types — C
- `lists-dicts-loops` — Lists, Dicts and Loops — C
- `functions-and-files` — Functions and File Handling — C
- `errors-and-debugging` — Errors and Debugging — C
- `virtualenv-and-pip` — pip and Virtual Environments — O

**`python-for-security`** — "Python for Security" — Turn Python into recon and exploitation tooling.
- `requests-and-http-in-python` — HTTP with requests — C
- `parsing-html-and-json` — Parsing HTML and JSON — C
- `sockets-and-port-scanner` — Build a Port Scanner — C
- `automating-with-python` — Automating the Boring Parts — C
- `writing-your-first-exploit-script` — Your First Exploit Script — C

---

## p3b.ts — Level 3 "Programming for Hackers", part B

**`web-languages`** — "Web Languages" — Read the code you are attacking.
- `html-crash-course` — HTML Crash Course — C
- `css-enough-to-break-it` — CSS: Just Enough — O
- `javascript-crash-course` — JavaScript Crash Course — C
- `the-dom-and-events` — The DOM and Events — C
- `fetch-and-async` — fetch, Promises and async — C

**`databases-and-sql`** — "Databases and SQL" — Speak SQL before you inject it.
- `sql-crash-course` — SQL Crash Course — C
- `joins-and-queries` — Joins and Real Queries — C
- `nosql-basics` — NoSQL Basics — O
- `how-apps-talk-to-databases` — How Apps Talk to Databases — C

**`git-and-tooling`** — "Git and Tooling" — Version control, regex, and reading unfamiliar code.
- `git-basics` — Git Basics — C
- `github-for-hackers` — GitHub for Hackers — C
- `regex-crash-course` — Regex Crash Course — C
- `reading-code-you-didnt-write` — Reading Code You Did Not Write — C

---

## p4a.ts — Level 4 "Web Hacking Core", part A

**`how-web-apps-work`** — "How Web Apps Work" — The mental model every web bug comes from.
- `anatomy-of-a-web-app` — Anatomy of a Web App — C
- `client-vs-server-trust` — The Golden Rule: Never Trust the Client — C
- `apis-and-endpoints` — APIs and Endpoints — C
- `frameworks-and-routing` — Frameworks and Routing — O
- `where-bugs-come-from` — Where Bugs Actually Come From — C

**`mapping-the-target`** — "Mapping the Target" — Build a map before you touch anything.
- `mapping-an-application` — Mapping an Application — C
- `spidering-and-content-discovery` — Spidering and Content Discovery — C
- `understanding-auth-flows` — Mapping the Auth Flow — C
- `finding-hidden-parameters` — Finding Hidden Parameters — C

**`injection`** — "Injection" — When your input becomes someone else's code.
- `sql-injection` — SQL Injection — C
- `sqli-hands-on` — SQL Injection Hands-On — C
- `blind-sql-injection` — Blind SQL Injection — C
- `command-injection` — Command Injection — C
- `nosql-injection` — NoSQL Injection — O
- `template-injection-ssti` — Server-Side Template Injection — O

---

## p4b.ts — Level 4 "Web Hacking Core", part B

**`xss`** — "Cross-Site Scripting" — Your JavaScript, their browser.
- `xss-cross-site-scripting` — XSS: The Big Picture — C
- `reflected-vs-stored-xss` — Reflected vs Stored XSS — C
- `dom-xss` — DOM XSS — C
- `xss-payloads-and-filters` — Payloads and Filter Bypasses — C
- `csp-and-xss-defense` — CSP and Defending Against XSS — C

**`broken-access-control`** — "Broken Access Control" — The bug class that pays the most.
- `access-control-basics` — Access Control Basics — C
- `idor` — IDOR: Changing the Number — C
- `path-traversal` — Path Traversal — C
- `privilege-escalation-in-apps` — Privilege Escalation in Apps — C
- `forced-browsing` — Forced Browsing and Hidden Admin — C

**`auth-and-session-attacks`** — "Auth and Session Attacks" — Account takeover, step by step.
- `password-attacks-and-brute-force` — Password Attacks — C
- `session-hijacking-and-fixation` — Session Hijacking and Fixation — C
- `jwt-attacks` — JWT Attacks — C
- `password-reset-flaws` — Password Reset Flaws — C
- `mfa-bypass` — MFA Bypass — C
- `oauth-misconfigurations` — OAuth Misconfigurations — O

Note: attach a `lab_ref` for `invoice-portal` inside `idor`.

---

## p4c.ts — Level 4 "Web Hacking Core", part C

**`csrf-ssrf-redirects`** — "CSRF, SSRF and Redirects" — Making the browser or the server work for you.
- `csrf` — CSRF: Riding Someone Else's Session — C
- `ssrf` — SSRF: Making the Server Fetch — C
- `open-redirect` — Open Redirect — C
- `cors-misconfiguration` — CORS Misconfiguration — C

**`files-and-uploads`** — "Files, Uploads and Parsers" — Where "just an upload form" becomes remote code.
- `file-upload-vulnerabilities` — File Upload Vulnerabilities — C
- `lfi-and-rfi` — LFI and RFI — C
- `xxe` — XXE: XML External Entities — C
- `insecure-deserialization` — Insecure Deserialization — O

**`logic-and-race-conditions`** — "Logic and Race Conditions" — Bugs no scanner will ever find.
- `business-logic-flaws` — Business Logic Flaws — C
- `race-conditions` — Race Conditions — C
- `rate-limit-bypass` — Rate Limit Bypass — C
- `price-and-quantity-tampering` — Price and Quantity Tampering — C

---

## p4d.ts — Level 4 "Web Hacking Core", part D

**`misconfig-and-disclosure`** — "Misconfiguration and Disclosure" — Free findings hiding in plain sight.
- `security-misconfiguration` — Security Misconfiguration — C
- `information-disclosure` — Information Disclosure — C
- `security-headers` — Security Headers That Matter — C
- `default-credentials-and-panels` — Default Creds and Exposed Panels — C
- `verbose-errors-and-stack-traces` — Verbose Errors and Stack Traces — O

**`client-side-extras`** — "Client-Side Extras" — The browser-side bugs people forget to test.
- `clickjacking` — Clickjacking — C
- `websocket-security` — WebSocket Security — C
- `postmessage-and-window-attacks` — postMessage and Window Attacks — O
- `prototype-pollution` — Prototype Pollution — O

**`putting-it-together`** — "Putting It Together" — Turn findings into an assessment and a severity.
- `chaining-vulnerabilities` — Chaining Vulnerabilities — C
- `impact-and-severity-cvss` — Impact and Severity (CVSS) — C
- `a-full-web-assessment-walkthrough` — A Full Web Assessment, Start to Finish — C

---

## p5a.ts — Level 5 "Recon and OSINT", part A

**`recon-mindset`** — "The Recon Mindset" — Know your target before you touch it.
- `passive-reconnaissance` — Passive Reconnaissance — C
- `active-vs-passive` — Active vs Passive Recon — C
- `scoping-and-staying-legal` — Scope: The Line You Do Not Cross — C

**`finding-assets`** — "Finding Assets" — Discover everything the target owns.
- `subdomain-enumeration` — Subdomain Enumeration — C
- `dns-recon` — DNS Recon — C
- `certificate-transparency` — Certificate Transparency Logs — C
- `asn-and-ip-ranges` — ASNs and IP Ranges — O
- `cloud-asset-discovery` — Cloud Asset Discovery — C

**`osint`** — "OSINT" — Public information, professionally weaponised.
- `google-dorking` — Google Dorking — C
- `github-and-code-leaks` — GitHub and Code Leaks — C
- `people-and-company-osint` — People and Company OSINT — C
- `wayback-and-historical-data` — Wayback and Historical Data — C
- `leaked-credentials-and-breaches` — Leaked Credentials and Breaches — O

---

## p5b.ts — Level 5 "Recon and OSINT", part B

**`active-recon`** — "Active Recon" — Scan, fingerprint and fuzz with intent.
- `port-scanning-deep` — Port Scanning, Deeper — C
- `service-and-version-fingerprinting` — Service and Version Fingerprinting — C
- `web-tech-fingerprinting` — Web Tech Fingerprinting — C
- `content-discovery-fuzzing` — Content Discovery and Fuzzing — C
- `parameter-discovery` — Parameter Discovery — C

**`recon-automation`** — "Recon Automation" — Wake up to fresh findings.
- `building-a-recon-pipeline` — Building a Recon Pipeline — C
- `nuclei-and-templates` — Nuclei and Templates — C
- `monitoring-targets-continuously` — Monitoring Targets Continuously — C
- `organizing-recon-data` — Organising Recon Data — O

---

## p6a.ts — Level 6 "Tools Mastery", part A

**`burp-suite`** — "Burp Suite" — The tool you will live inside.
- `burp-tour` — Burp Suite Tour — C
- `burp-proxy-and-intercept` — Proxy and Intercept — C
- `burp-repeater` — Repeater: Tamper Anything — C
- `burp-intruder` — Intruder: Automate the Attack — C
- `burp-extensions-and-workflow` — Extensions and Workflow — O
- `burp-vs-caido-vs-zap` — Burp vs Caido vs ZAP — O

**`scanning-tools`** — "Scanning Tools" — Nmap and friends, properly driven.
- `nmap-deep-dive` — Nmap Deep Dive — C
- `nmap-scripting-engine` — Nmap Scripting Engine — C
- `nuclei-in-practice` — Nuclei in Practice — C
- `masscan-and-speed` — Masscan and Scanning at Speed — O

**`fuzzing-tools`** — "Fuzzing Tools" — Find what is not linked anywhere.
- `ffuf-deep-dive` — ffuf Deep Dive — C
- `wordlists-that-work` — Wordlists That Actually Work — C
- `gobuster-and-dirsearch` — gobuster and dirsearch — O

---

## p6b.ts — Level 6 "Tools Mastery", part B

**`exploitation-tools`** — "Exploitation Tools" — From finding to proving.
- `sqlmap` — sqlmap Without Shooting Yourself — C
- `hydra-and-credential-attacks` — Hydra and Credential Attacks — C
- `reverse-shells-and-listeners` — Reverse Shells and Listeners — C
- `metasploit-basics` — Metasploit Basics — O

**`analysis-tools`** — "Analysis Tools" — Decode, crack and inspect.
- `wireshark-in-practice` — Wireshark in Practice — C
- `hashcat-and-john` — Hashcat and John — C
- `cyberchef` — CyberChef: The Swiss Army Knife — C
- `mitmproxy-for-mobile-and-apis` — mitmproxy for Mobile and APIs — O

---

## p7a.ts — Level 7 "APIs, Cloud and Modern Apps", part A

**`api-security`** — "API Security" — Where the real modern attack surface lives.
- `rest-api-attack-surface` — The REST API Attack Surface — C
- `api-authentication-flaws` — API Authentication Flaws — C
- `mass-assignment-and-bola` — Mass Assignment and BOLA — C
- `api-versioning-and-shadow-endpoints` — Old Versions and Shadow Endpoints — C
- `testing-apis-without-docs` — Testing an API With No Docs — C

**`graphql`** — "GraphQL" — One endpoint, a hundred ways in.
- `graphql-basics` — GraphQL Basics — C
- `graphql-introspection-and-recon` — Introspection and Recon — C
- `graphql-injection-and-batching` — Injection and Batching Attacks — C
- `graphql-authorization-flaws` — GraphQL Authorization Flaws — C

**`identity-deep`** — "Identity, Deeper" — OAuth, SSO and token architecture.
- `oauth-deep-dive` — OAuth 2.0 Deep Dive — C
- `openid-connect-and-sso` — OpenID Connect and SSO — C
- `session-vs-token-architectures` — Sessions vs Tokens — C
- `saml-basics` — SAML Basics — O

---

## p7b.ts — Level 7 "APIs, Cloud and Modern Apps", part B

**`cloud`** — "Cloud" — Misconfigurations at internet scale.
- `cloud-basics-for-hackers` — Cloud Basics for Hackers — C
- `s3-and-storage-misconfigs` — Storage Buckets Left Open — C
- `iam-and-privilege-issues` — IAM and Privilege Issues — C
- `metadata-service-ssrf` — SSRF to Cloud Metadata — C
- `serverless-security` — Serverless Security — O

**`containers-and-cicd`** — "Containers and CI/CD" — The pipeline is part of the attack surface.
- `docker-basics-for-hackers` — Docker Basics for Hackers — C
- `cicd-pipeline-attacks` — CI/CD Pipeline Attacks — C
- `dependency-and-supply-chain-risks` — Dependencies and Supply Chain — C
- `container-escape-concepts` — Container Escape Concepts — O

**`mobile-peek`** — "Mobile Peek" — Mobile apps are just APIs with extra steps.
- `how-mobile-apps-talk-to-servers` — How Mobile Apps Talk to Servers — C
- `intercepting-mobile-traffic` — Intercepting Mobile Traffic — C
- `mobile-app-storage-issues` — Mobile Storage Issues — O

---

## p8a.ts — Level 8 "Bug Bounty and Vulnerability Research", part A

**`bug-bounty-101`** — "Bug Bounty 101" — What the job really is, before you quit yours.
- `what-bug-bounty-really-is` — What Bug Bounty Really Is — C
- `platforms-and-programs` — Platforms and Programs — C
- `reading-scope-like-a-lawyer` — Reading Scope Like a Lawyer — C
- `duplicates-and-triage-reality` — Duplicates, N/A and Triage Reality — C
- `money-and-expectations` — Money and Expectations — O

**`hunting-methodology`** — "Hunting Methodology" — A repeatable process beats random clicking.
- `picking-a-target` — Picking a Target — C
- `a-repeatable-hunting-workflow` — A Repeatable Hunting Workflow — C
- `taking-notes-and-tracking-tests` — Notes and Test Tracking — C
- `when-to-dig-and-when-to-move-on` — When to Dig, When to Move On — C
- `hunting-with-limited-time` — Hunting With 1 Hour a Day — C

**`reporting`** — "Reporting" — The skill that turns findings into money.
- `responsible-disclosure` — Responsible Disclosure — C
- `writing-a-report-that-gets-paid` — Writing a Report That Gets Paid — C
- `proof-of-concept-craft` — Proof-of-Concept Craft — C
- `impact-storytelling-and-severity` — Impact Storytelling — C
- `handling-pushback-and-retests` — Pushback and Retests — C

---

## p8b.ts — Level 8 "Bug Bounty and Vulnerability Research", part B

**`learning-from-real-reports`** — "Learning From Real Reports" — Read disclosed bugs like a pro.
- `how-to-read-a-disclosed-report` — How to Read a Disclosed Report — C
- `case-study-idor` — Case Study: An IDOR Worth Real Money — C
- `case-study-account-takeover` — Case Study: Account Takeover — C
- `case-study-ssrf-to-cloud` — Case Study: SSRF to Cloud Keys — C

**`law-and-india`** — "Law, India Edition" — The rules that apply to you specifically.
- `indian-it-act-and-hacking` — The IT Act and You — C
- `dpdp-act-basics` — DPDP Act Basics — C
- `cert-in-and-incident-reporting` — CERT-In and Incident Reporting — C
- `global-laws-quick-tour` — Global Laws Quick Tour — O

**`career`** — "Career" — From learner to hired (or self-employed).
- `portfolio-and-github-presence` — Portfolio and GitHub Presence — C
- `ctfs-and-practice-platforms` — CTFs and Practice Platforms — C
- `resume-and-interviews` — Resume and Interviews — C
- `certifications-worth-it-or-not` — Certifications: Worth It? — O
- `staying-current-without-burning-out` — Staying Current Without Burning Out — O

---

## p9a.ts — Level 9 "Beyond Web (Side Quests)", part A

**`windows-and-ad`** — "Windows and Active Directory" — The environment most companies actually run.
- `active-directory-basics` — Active Directory Basics — C
- `ad-enumeration` — AD Enumeration — C
- `kerberos-and-ntlm` — Kerberos and NTLM — O
- `common-ad-attacks` — Common AD Attacks — O

**`privilege-escalation`** — "Privilege Escalation" — From a shell to owning the box.
- `linux-privesc-basics` — Linux Privilege Escalation — C
- `windows-privesc-basics` — Windows Privilege Escalation — C
- `credential-hunting` — Credential Hunting — C
- `post-exploitation-concepts` — Post-Exploitation Concepts — O

**`cryptography`** — "Cryptography" — Enough crypto to spot the mistakes.
- `symmetric-vs-asymmetric` — Symmetric vs Asymmetric — C
- `common-crypto-mistakes` — Common Crypto Mistakes — C
- `random-numbers-and-tokens` — Random Numbers and Tokens — C
- `padding-oracle-and-ecb` — Padding Oracle and ECB Patterns — O
- `crypto-in-ctfs` — Crypto in CTFs — O

---

## p9b.ts — Level 9 "Beyond Web (Side Quests)", part B

**`binary-and-reversing`** — "Binary and Reversing" — A first look under the hood.
- `how-programs-run-memory-basics` — How Programs Run: Memory Basics — C
- `buffer-overflow-concepts` — Buffer Overflow Concepts — O
- `reverse-engineering-intro` — Reverse Engineering Intro — O
- `ctf-pwn-starter-kit` — CTF Pwn Starter Kit — O

**`blue-team`** — "Blue Team" — See yourself the way defenders do.
- `how-defenders-see-you` — How Defenders See You — C
- `logs-siem-and-detection` — Logs, SIEM and Detection — C
- `incident-response-basics` — Incident Response Basics — O
- `writing-detections-for-your-own-attacks` — Detecting Your Own Attacks — O

Note: attach a `lab_ref` for `log-hunter` inside `logs-siem-and-detection`.

**`forensics`** — "Forensics" — What gets left behind.
- `digital-forensics-intro` — Digital Forensics Intro — O
- `file-and-memory-artifacts` — File and Memory Artifacts — O
- `ctf-forensics-tricks` — CTF Forensics Tricks — O

---

## p9c.ts — Level 9 "Beyond Web (Side Quests)", part C

**`human-and-physical`** — "Human and Physical" — The layer no patch fixes.
- `social-engineering-basics` — Social Engineering Basics — C
- `phishing-mechanics` — Phishing Mechanics — C
- `physical-security-and-badges` — Physical Security and Badges — O
- `osint-on-yourself-defense` — Run OSINT on Yourself — O

**`iot-and-emerging`** — "IoT and Emerging" — Where the next decade of bugs lives.
- `iot-attack-surface` — IoT Attack Surface — O
- `ot-ics-basics` — OT and ICS Basics — O
- `ai-and-llm-security` — AI and LLM Security — C
