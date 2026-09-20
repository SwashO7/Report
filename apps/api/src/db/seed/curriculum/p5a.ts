import type { ExerciseSeed, ModuleSeed } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'recon-mindset',
    title: 'The Recon Mindset',
    description:
      'Recon is where beginners burn the most hours, so this module teaches a decision at every step instead of a tool list. By the end you can tell passive recon from active, choose which one a situation calls for, and read a scope page well enough to know when a subdomain that clearly belongs to your target is still off limits because someone else runs it.',
    lessons: [
      {
        slug: 'passive-reconnaissance',
        title: 'Passive Reconnaissance',
        summary: 'Learn everything about a target without ever touching it. The target never knows you were there.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Passive recon means gathering information about a target without sending a single packet to their servers. You read what other people have already collected - search engines, public records, old website copies - so the target never sees you looking. It feels slow, but it is the safest and often the richest phase of any assessment.',
          },
          {
            type: 'paragraph',
            text:
              'Here is why it works. Every company leaves a trail in systems it does not control. When a site gets an HTTPS certificate, that certificate is logged in a public list. When a developer pushes code to a public repo, it sits in commit history forever. When a page goes live, search engines index it and archives snapshot it. None of these live on the target\'s own servers, so reading them touches nobody. You are a detective going through public newspaper archives, not knocking on the suspect\'s door.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete hunt end to end. You are handed `example.com` and told to map what they own. You start in a certificate transparency log and find certificates issued for `api.example.com`, `staging.example.com` and `vpn.example.com` - three hosts nobody advertised. You search the code-hosting sites and find a repo where an old commit mentions an internal tool at `admin-tools.example.com`. You pull the site up in a web archive and see a `/beta` section that was quietly removed last year but may still respond. You have not sent one request to example.com, yet you already have five leads. That is the whole point: you build the map before the target can start counting your knocks.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like scouting a cricket team before a match. You do not sneak into their practice - you watch old match footage, read the papers, study the stats. By the time you walk onto the field you already know who plays and how, and none of it tipped them off.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Certificate logs** - public records of every HTTPS certificate, leaking subdomain names.',
              '**Search engines** - indexed pages, file types, and exposed directories.',
              '**Code repositories** - public source, commit history, and leaked secrets.',
              '**Web archives** - old versions of pages that were changed or deleted.',
              '**WHOIS and DNS records** - who registered a domain and where it points.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Passive first, always',
            text:
              'Do the whole passive pass before you send one active packet. The wider your map is before you start scanning, the fewer noisy requests you make and the more targets you already know exist.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand passive recon - building a full picture of a target from public sources that never touch their servers.',
          },
          {
            type: 'quiz',
            question: 'What makes reconnaissance "passive"?',
            options: [
              'You do it slowly and carefully',
              'You gather information without sending requests to the target',
              'You only use free tools',
              'You do it after the active scan',
            ],
            correctIndex: 1,
            explanation: 'Passive recon uses third-party sources - certificate logs, archives, search engines - so no traffic reaches the target and they never see you looking.',
          },
        ],
      },
      {
        slug: 'active-vs-passive',
        title: 'Active vs Passive Recon',
        summary: 'One touches the target, one does not. Knowing which to reach for is half the skill.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Recon splits into two modes, and mixing them up gets beginners into trouble. Passive recon never touches the target. Active recon does - you send it requests and watch how it answers. Both find assets; the difference is who knows you were there and how much the law cares.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is the whole distinction. In passive mode, every question you ask goes to a third party - a certificate log answers you, not example.com. The target\'s logs stay empty. In active mode, you send packets straight at the target: a port scan, a request for a hidden page, a probe that asks "what version are you running?". Each of those lands in the target\'s access logs with your IP next to it. Active recon is far more accurate, because you are asking the real system instead of trusting old public data, but accuracy costs you invisibility.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example so the trade-off is concrete. You want to know whether `staging.example.com` is alive. The passive route: you already saw it in a certificate log, and a DNS lookup through a public resolver says it points to an IP - but a DNS name existing does not prove the server answers. The active route: you send one HTTP request to it and get back `200 OK` with a login page. Now you know for certain it is live and running a web app - but that request is in their logs. The passive answer was "probably exists"; the active answer was "definitely live, here is what it runs", bought with one logged request.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Passive** - third parties answer; target logs nothing; lower accuracy, zero footprint.',
              '**Active** - target answers directly; lands in their logs; high accuracy, visible.',
              '**Rule of thumb** - exhaust passive first, then go active only inside scope.',
              '**DNS lookup through a public resolver** - counts as passive; the target is not queried.',
              '**Port scan, content discovery, version probes** - all active; all logged.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Active recon needs permission',
            text:
              'A passive lookup of public data is fine anywhere. The moment you send packets at a system, you need that system to be in scope. Active recon on a target you were not authorised to touch is unauthorised access, full stop.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only run active recon against systems a program or client has explicitly authorised you to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell passive from active recon and choose the right one - map quietly first, then confirm loudly only inside scope.',
          },
          {
            type: 'quiz',
            question: 'You send an HTTP request directly to a target to see if it is alive. Which is this?',
            options: [
              'Passive recon, because it is just one request',
              'Active recon, because you touched the target and it can log you',
              'Neither, requests do not count as recon',
              'Passive, because HTTP is a public protocol',
            ],
            correctIndex: 1,
            explanation: 'Any packet you send to the target itself is active recon. It lands in their logs with your IP, so it needs the target to be in scope.',
          },
        ],
      },
      {
        slug: 'scoping-and-staying-legal',
        title: 'Scope: The Line You Do Not Cross',
        summary: 'A subdomain that clearly belongs to the target can still be off limits. Learn where the line really sits.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Recon finds assets faster than you can check whether you are allowed to test them. That is the danger. You will discover subdomains, cloud buckets and login pages that obviously relate to your target - and some of them will still be firmly out of bounds. Scope is the line, and in recon it is blurrier than it looks.',
          },
          {
            type: 'paragraph',
            text:
              'The rule that trips everyone up: belonging to the target and being in scope are two different things. A program scope of `*.example.com` sounds like it covers everything with that name. But two common cases sit inside it that you must not touch. First, explicit exclusions - the scope might list `blog.example.com` as out of scope, and an exclusion always beats a wildcard. Second, and this is the recon-specific trap, third-party services. A subdomain like `support.example.com` might just be a CNAME pointing at a SaaS help-desk product that some other company runs and owns. It carries the target\'s name, but the servers behind it belong to a vendor who never signed up for your testing. Attack it and you are hitting the vendor, not your target.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real decision. Your recon on `example.com` surfaces three hosts. `api.example.com` matches the wildcard, has no exclusion, and resolves to the target\'s own IP range - in scope, test it. `blog.example.com` matches the wildcard too, but the scope page lists it as excluded - off limits, leave it. `careers.example.com` matches the wildcard, but a DNS lookup shows it is a CNAME to `example.some-hiring-saas.com` - that is a third party\'s platform wearing your target\'s name, so it is out of scope unless the program explicitly says otherwise. Same wildcard, three different answers, and only recon plus a careful read of the scope tells them apart.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Wildcard scope** covers matching names, but exclusions and third parties carve chunks back out.',
              '**Exclusions override wildcards** - a listed out-of-scope host is off limits, always.',
              '**Third-party SaaS** wearing the target\'s name is a vendor\'s asset, not the target\'s.',
              '**Check the CNAME** - if a subdomain points to another company\'s domain, treat it as out of scope.',
              '**When unsure, ask the program** - a clarifying message beats an unauthorised test.',
            ],
          },
          {
            type: 'command',
            description: 'Check where a discovered subdomain actually points before you touch it:',
            commands: ['dig CNAME careers.example.com +short'],
          },
          {
            type: 'paragraph',
            text:
              'That command asks DNS for the subdomain\'s CNAME - the "real name" it forwards to. If it prints `example.some-hiring-saas.com`, the subdomain is an alias for a third party\'s platform, and testing it means testing that vendor, who never authorised you. If it prints nothing, the name has no CNAME and probably points at the target\'s own infrastructure - safer, but still confirm it against the scope. Reading this one field before you send any active traffic keeps you on the right side of the line.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The name is not the owner',
            text:
              'A subdomain carrying your target\'s brand can still be run and owned by a completely different company. Ownership follows the servers, not the name on the label.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Know your limits',
            text: 'Test only assets the program authorises. A host that merely looks related is not permission - confirm scope before sending a single active request.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell an in-scope asset from an excluded one and from a third-party service wearing the target\'s name.',
          },
          {
            type: 'practice_ref',
            title: 'The Recon Mindset check',
            exerciseSlug: 'recon-mindset-quiz',
          },
          {
            type: 'quiz',
            question: 'A scope is *.example.com. You find careers.example.com is a CNAME to a third-party hiring platform. Is it in scope?',
            options: [
              'Yes, it matches the wildcard',
              'No - it is a third party\'s platform wearing the target\'s name, so it is out of scope unless stated',
              'Yes, because the target clearly uses it',
              'Only if it has a login page',
            ],
            correctIndex: 1,
            explanation: 'The subdomain points at a vendor\'s servers. Testing it hits the vendor, who never authorised you, so it is out of scope unless the program explicitly includes it.',
          },
        ],
      },
    ],
  },
  {
    slug: 'finding-assets',
    title: 'Finding Assets',
    description:
      'A target is never just its main website - it is every subdomain, IP range and forgotten server it owns. This module teaches you to discover all of them: enumerate subdomains, read DNS records, mine certificate logs, and spot cloud buckets and services. By the end you can turn one domain name into a full map of a target\'s attack surface, including the staging box nobody remembered was public.',
    lessons: [
      {
        slug: 'subdomain-enumeration',
        title: 'Subdomain Enumeration',
        summary: 'One domain hides dozens of subdomains. The forgotten ones are where the bugs live.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A company buys `example.com` and then hangs dozens of subdomains off it - `www`, `api`, `mail`, `staging`, `dev`, `old`. Each one can be a separate web app on a separate server. The main site is usually the best-defended. The subdomain someone spun up two years ago and forgot is where you find the real bugs.',
          },
          {
            type: 'paragraph',
            text:
              'There are two ways to find subdomains, and good recon uses both. Passive enumeration pulls names from sources that already recorded them - certificate logs, search engines, DNS aggregators - without asking the target. Active enumeration takes a wordlist of common names (`dev`, `admin`, `vpn`, `test`) and asks DNS "does `dev.example.com` resolve?" for each, one by one. Passive is quiet and finds names nobody would guess; active is noisier but catches names no public source recorded. Run passive first for breadth, then active to fill gaps.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete run. You start passive and a tool returns `api.example.com`, `blog.example.com` and `shop.example.com` - pulled from certificate logs and search indexes. Good, but you suspect there is more. You switch to active brute-forcing with a wordlist, and the tool tries thousands of names; `dev.example.com` and `jenkins.example.com` come back with real IP addresses while the rest fail to resolve. That `jenkins` host is a build server that was never meant to be public - exactly the kind of forgotten asset that passive sources missed and a wordlist caught.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like finding every entrance to a big housing society. The main gate is obvious and guarded. But there is a side gate for deliveries, a service gate for garbage trucks, and an old gate that was bricked up but not really. Subdomain enumeration is walking the whole boundary wall until you have found every way in.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Passive enumeration** - names from certificate logs, search engines, DNS datasets. Quiet.',
              '**Active enumeration** - brute-force common names against DNS. Noisier, finds unlisted hosts.',
              '**Resolution check** - a name only matters if it resolves to a live IP.',
              '**Wildcard DNS** - some domains resolve every name; watch for it or every guess looks alive.',
              '**Forgotten hosts** - dev, staging, old, and legacy names are the highest-value finds.',
            ],
          },
          {
            type: 'command',
            description: 'Passively list known subdomains, then check which ones actually resolve:',
            commands: [
              'subfinder -d example.com -silent',
              'subfinder -d example.com -silent | dnsx -silent -a',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command asks passive sources for every subdomain of `example.com` they know and prints one name per line - discovery only, nothing tested against the target. The second pipes that list into a resolver that keeps only the names with a live `A` record (an IP). The difference matters: the first list might have fifty names, but if only twelve resolve, those twelve are your real attack surface and the rest are dead entries. Never treat a name as a target until you have confirmed it resolves.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A name is not a server',
            text:
              'Enumeration hands you names. Plenty will not resolve, and some resolve to a shared platform you must not touch. Confirm each one is live and in scope before it goes on your target list.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can turn one domain into a list of live subdomains using both passive sources and active brute-forcing.',
          },
          {
            type: 'quiz',
            question: 'Why do experienced hunters care most about forgotten subdomains like "staging" or "dev"?',
            options: [
              'They load faster',
              'They are usually less defended and less tested than the main site',
              'They are always in scope',
              'They never use HTTPS',
            ],
            correctIndex: 1,
            explanation: 'Old or non-production subdomains get less security attention and less testing, so real bugs survive there longer than on the well-guarded main site.',
          },
        ],
      },
      {
        slug: 'dns-recon',
        title: 'DNS Recon',
        summary: 'DNS records are a target telling you how it is built. Learn to read every line.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'DNS is the internet\'s contact list, and a target\'s DNS records quietly describe its whole setup - where its website lives, who handles its email, what cloud services it uses. Reading these records is pure passive recon done through public resolvers, and it hands you leads before you touch anything.',
          },
          {
            type: 'paragraph',
            text:
              'Each record type answers a different question. An `A` record maps a name to an IPv4 address - where the server is. A `CNAME` says "this name is really an alias for that other name" - which often reveals a third-party service. An `MX` record names the mail servers, so you learn whether they run their own mail or use a provider like a hosted email service. A `TXT` record holds free text, and this is where the leaks hide: email-security policies, domain-verification tokens for cloud services, and sometimes internal notes. `NS` records name the DNS servers themselves. Read together, these records sketch the target\'s architecture without a single request to their app.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one lookup and what it tells you. You query `example.com` and see an `MX` record pointing at a well-known hosted-email provider - so their email lives with a third party, and email attacks would target that provider\'s rules, not their own server. You see a `TXT` record starting with `v=spf1` listing several servers allowed to send mail - useful later for spoofing analysis. You see another `TXT` record that is a verification token for a cloud analytics product - now you know they use that product. And a `CNAME` on `cdn.example.com` pointing at a content-delivery network tells you their static files are served by a CDN. Four records, and you already understand their email, cloud, and delivery setup.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A / AAAA** - the IPv4 / IPv6 address a name points to. Where the server is.',
              '**CNAME** - an alias to another name; often reveals a third-party service.',
              '**MX** - the mail servers; tells you self-hosted vs hosted email.',
              '**TXT** - free text; SPF policies, verification tokens, and accidental leaks.',
              '**NS** - the authoritative DNS servers for the domain.',
            ],
          },
          {
            type: 'command',
            description: 'Pull the useful record types for a domain:',
            commands: [
              'dig example.com A +short',
              'dig example.com MX +short',
              'dig example.com TXT +short',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first line prints the IP addresses the domain resolves to - your entry points. The second prints the mail servers, each with a priority number in front (lower is preferred); if these names belong to a big provider, their email is hosted elsewhere. The third prints every TXT record, and this is the one to read slowly: an `spf1` line lists who may send their mail, and any `verification` or token line names a cloud product they signed up for. Every line here is a fact about the target you got for free, from a public resolver, with the target none the wiser.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'TXT records overshare',
            text:
              'The TXT record is where teams paste verification tokens for every SaaS they onboard. Read them like a list of vendors the company uses - each one is another service in their supply chain.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can read a target\'s DNS records and reconstruct where its site, email and cloud services actually live.',
          },
          {
            type: 'quiz',
            question: 'Which DNS record most often reveals which SaaS and cloud products a company uses?',
            options: [
              'The A record',
              'The MX record',
              'The TXT record, via verification tokens',
              'The NS record',
            ],
            correctIndex: 2,
            explanation: 'Companies paste vendor verification tokens into TXT records, so reading them lists the SaaS products the company has onboarded.',
          },
        ],
      },
      {
        slug: 'certificate-transparency',
        title: 'Certificate Transparency Logs',
        summary: 'Every HTTPS certificate a company gets is written into a public log. That log leaks their subdomains.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Here is a gift the security world accidentally gave recon: every time a website gets an HTTPS certificate, that certificate is recorded in a public, append-only log called Certificate Transparency. The logs exist to catch certificate authorities issuing bad certificates - but a side effect is that they list the domain names on every certificate, forever. That means they leak subdomains a company never advertised.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is simple once you see it. To serve HTTPS, a site needs a certificate that names the exact domains it covers - say `secret-admin.example.com`. Certificate authorities are required to publish every certificate they issue into these public logs. So the moment a company gets a certificate for an internal-sounding subdomain, the name is written into a log anyone can search. The company never linked to that subdomain, never put it in a menu, but the certificate outed it. You just read the log.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete search. You want every subdomain of `example.com` that ever had a certificate. You query a certificate-log search service for `%.example.com` and it returns rows including `www.example.com`, `mail.example.com`, and - the interesting one - `internal-vpn.example.com` and `test-payments.example.com`. Those last two were never meant to be found, but each needed a certificate to serve HTTPS, so each landed in the log. Watch too for a wildcard certificate like `*.example.com`: it covers every subdomain at once, which is convenient for the company but tells you they issue a lot of subdomains and hides the specific names, so you lean harder on brute-forcing for that domain.',
          },
          {
            type: 'command',
            description: 'Query a certificate transparency search for every logged subdomain (crt.sh style):',
            commands: [
              'curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r ".[].name_value" | sort -u',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This asks the search service for every certificate whose name matches `%.example.com` (the `%25` is a URL-encoded `%`, the log\'s wildcard), asks for JSON, pulls out just the domain-name field, and sorts unique names. The output is a clean, de-duplicated list of every subdomain that has ever had a certificate. A name here is a strong lead - a certificate was issued, so the host was real at some point - but confirm it still resolves before treating it as live, because the certificate may outlive the server.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Every HTTPS cert is logged** - the log is public, append-only, and searchable.',
              '**Certificates name their domains** - so the log leaks subdomains, including internal ones.',
              '**Wildcard cert (`*.example.com`)** - hides specific names; lean on brute-forcing instead.',
              '**Historical, not live** - a logged name may point at a server that is long gone.',
              '**Zero touch** - searching the log never contacts the target.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The best free subdomain source',
            text:
              'Certificate logs routinely surface hosts no wordlist would guess, because the company itself named them when it requested the certificate. Always run this pass early.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can mine certificate transparency logs to find subdomains a company never advertised.',
          },
          {
            type: 'quiz',
            question: 'How does Certificate Transparency leak a company\'s hidden subdomains?',
            options: [
              'It scans the company\'s servers directly',
              'Every issued HTTPS certificate names its domains and is published to a public log',
              'It reads the company\'s DNS zone file',
              'It guesses subdomains from a wordlist',
            ],
            correctIndex: 1,
            explanation: 'Certificate authorities must publish issued certificates to public logs, and each certificate lists the exact domains it covers - so internal subdomain names end up searchable.',
          },
        ],
      },
      {
        slug: 'asn-and-ip-ranges',
        title: 'ASNs and IP Ranges',
        summary: 'Big companies own whole blocks of IP addresses. Find the block, find every server in it.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Large organisations do not rent one IP address at a time - they own whole ranges. Those ranges are grouped under an ASN, an Autonomous System Number, which is basically a company\'s registered identity on the internet\'s routing map. Find a target\'s ASN and you find every IP block it owns, and every block is full of servers you can map.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism works like a property registry. The internet\'s routing needs to know which network owns which addresses, so there is a public record: this ASN belongs to this organisation, and it announces these IP ranges. You look up the target\'s name in that registry, get its ASN, and expand the ASN into the list of ranges - say `198.51.100.0/24`, a block of 256 addresses. Every live host in that block is very likely the target\'s, even ones with no DNS name at all. That is the payoff: DNS-based recon only finds hosts someone named, but an IP range finds the nameless ones too.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one lookup. You search a routing registry for "Example Corp" and it returns ASN `AS64500`. You expand that ASN and get two ranges: `198.51.100.0/24` and `203.0.113.0/25`. You now have roughly 384 addresses that belong to the target. You scan that block for live hosts and find one at `198.51.100.57` with no DNS name pointing at it - a server nobody would have found through subdomains, because it was never named. That is the whole reason to work at the IP level: you catch what the naming layer hides. One caution - a company on shared cloud hosting may not own its IPs at all, and that block will belong to the cloud provider, not the target, so confirm ownership before you treat a range as in scope.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**ASN** - a network\'s registered identity; groups the IP ranges it owns.',
              '**IP range (CIDR)** - a block like `198.51.100.0/24`, meaning 256 addresses.',
              '**Nameless hosts** - IP-range recon finds servers with no DNS name.',
              '**Cloud caveat** - hosts on shared cloud belong to the provider\'s ASN, not the target\'s.',
              '**Confirm ownership** - a range is only in scope if the target actually owns it.',
            ],
          },
          {
            type: 'command',
            description: 'Find a target\'s ASN, then list the IP ranges it announces:',
            commands: [
              'whois -h whois.cymru.com " -v 198.51.100.57"',
              'whois AS64500 | grep -i route',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command takes an IP you already know belongs to the target and asks a lookup service which ASN announces it - the reply names the ASN and the owning organisation, confirming you are looking at the right network. The second expands that ASN into its announced routes, and the `route` lines are the CIDR blocks the target owns. Read those blocks as your address-level attack surface: every live host inside them is a candidate, whether or not it has a name.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Cloud breaks the ASN trick',
            text:
              'If the target runs on shared cloud infrastructure, the IPs live in the cloud provider\'s ASN alongside thousands of other tenants. Scanning that block hits strangers, not your target - so this technique fits companies that own their own network space.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Confirm before you scan',
            text: 'Scan an IP range only after you confirm the target owns it and it is in scope - a shared block belongs to other people.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can find a target\'s ASN and expand it into the IP ranges it owns, catching nameless servers DNS recon misses.',
          },
          {
            type: 'quiz',
            question: 'What does finding a target\'s ASN give you that subdomain enumeration does not?',
            options: [
              'Faster DNS lookups',
              'The IP ranges it owns, including live servers with no DNS name',
              'A list of the company\'s employees',
              'The target\'s source code',
            ],
            correctIndex: 1,
            explanation: 'An ASN expands into the IP blocks a company owns, so you can find hosts by address even when no DNS name points at them - which subdomain enumeration cannot do.',
          },
        ],
      },
      {
        slug: 'cloud-asset-discovery',
        title: 'Cloud Asset Discovery',
        summary: 'Half a company\'s data now sits in cloud buckets and services. Learn where to look and what a leak looks like.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Modern companies keep huge amounts of data in the cloud - files in storage buckets, apps on cloud servers, functions running on demand. These assets often live outside the neat `example.com` naming you have been enumerating, on the cloud provider\'s own domains. Finding them is a separate recon skill, and it is where some of the easiest real findings still hide: a storage bucket left open to the world.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is predictable naming plus predictable domains. Cloud storage buckets get names, and companies name them exactly how you would guess: `example-backups`, `example-assets`, `example-prod`, `example-dev`. Each provider serves buckets on its own domain pattern, so a bucket resolves to a URL on the provider\'s domain, not the company\'s. That means you find them by combining the company\'s name and common words into candidate bucket names, then checking whether each one exists and, crucially, whether it is readable without credentials. A bucket that lists its files to anyone is a misconfiguration, and if those files are sensitive, that is a finding.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete check. Your target is `example.com`. You build guesses: `example-backups`, `example-uploads`, `example-static`, `example-internal`. You test each against the storage provider\'s URL pattern. `example-static` returns a public list of image files - probably intended, low impact. `example-backups` returns `AccessDenied` - it exists but is locked down, so note it and move on. Then `example-internal` returns a full directory listing including a file called `db-dump.sql` - a database backup readable by anyone on the internet. That is the finding: sensitive data in a bucket with public read access. You verify you can list it, you do not download and hoard the data, and you report it.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a company\'s storage unit at a facility. Most are padlocked. But recon is walking the row trying each door, and now and then one rolls up because someone forgot the lock - and inside are boxes marked "confidential".',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Buckets are guessably named** - company name plus backups, assets, prod, dev, uploads.',
              '**They live on the provider\'s domain** - not under `example.com`, so DNS recon misses them.',
              '**Public list access** is the misconfiguration - anyone can enumerate the files.',
              '**AccessDenied** means it exists but is locked - note it, do not force it.',
              '**Beyond buckets** - cloud functions, container registries and app services leak too.',
            ],
          },
          {
            type: 'command',
            description: 'Test whether a guessed bucket exists and is publicly listable:',
            commands: [
              'curl -s -o /dev/null -w "%{http_code}\\n" "https://example-internal.s3.amazonaws.com/"',
              'curl -s "https://example-internal.s3.amazonaws.com/"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command asks only for the HTTP status code. A `200` means the bucket exists and let you in - keep going. A `403` means it exists but denied you - locked, move on. A `404` means no such bucket - the name was a wrong guess. The second command, run only when the first returned `200`, fetches the actual listing: an XML document naming every file in the bucket. If you see filenames like `db-dump.sql` or `passwords.csv` in that listing, you have found sensitive data exposed to the public, and reading the status code first is what let you skip every locked and non-existent bucket without wasting requests.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'List access is the whole bug',
            text:
              'You do not need to download anything. Proving that an unauthenticated request can LIST sensitive files is the finding. Take one screenshot of the listing and stop - hoarding the data helps nobody and crosses a line.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Look, confirm, stop',
            text: 'Test cloud buckets only for in-scope targets, prove the exposure minimally, and never download or keep the data you find.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can guess and check a target\'s cloud storage buckets and recognise the misconfiguration that turns one into a real finding.',
          },
          {
            type: 'practice_ref',
            title: 'Finding Assets check',
            exerciseSlug: 'finding-assets-quiz',
          },
          {
            type: 'quiz',
            question: 'You curl a guessed bucket URL and get HTTP 403. What does that tell you?',
            options: [
              'The bucket does not exist',
              'The bucket exists but denied your unauthenticated request - it is locked down',
              'The bucket is public and listable',
              'The bucket contains a database dump',
            ],
            correctIndex: 1,
            explanation: 'A 403 means the bucket exists but is not readable without credentials. A 200 would mean public access, and a 404 would mean the name is wrong.',
          },
        ],
      },
    ],
  },
  {
    slug: 'osint',
    title: 'OSINT',
    description:
      'OSINT is open-source intelligence: turning public information into a serious advantage. This module teaches the professional version - search operators that find exposed files, mining code repositories and their history for leaked secrets, profiling a company and its people, digging up deleted pages from archives, and checking breach exposure ethically. By the end you can build a rich picture of a target from public data alone, and know exactly where the legal and ethical line sits.',
    lessons: [
      {
        slug: 'google-dorking',
        title: 'Google Dorking',
        summary: 'Search operators turn a search engine into a scanner for exposed files and pages.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Search engines index far more than home pages - they index login portals, config files, spreadsheets and error pages that were never meant to be public. "Dorking" is using advanced search operators to ask precise questions that surface exactly those. It is passive, it is free, and it regularly turns up things a company forgot the internet could see.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a handful of operators that narrow a search from "pages about this" to "pages that match this exact structure". `site:` restricts results to one domain. `inurl:` matches text in the URL. `intitle:` matches the page title. `filetype:` finds a specific file extension. Combine them and you stop searching for topics and start searching for shapes - the shape of a login page, the shape of an exposed spreadsheet, the shape of a directory listing. The search engine already crawled these; you are just asking the right question.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one worked dork. You want any spreadsheet the target accidentally published. You search `site:example.com filetype:xlsx`. That says "only pages on example.com, and only files ending in .xlsx". The results are every Excel file the crawler found on that domain - and a file named `employee-salaries.xlsx` in there is a real information-disclosure lead. Try another: `site:example.com inurl:admin` surfaces admin panels by matching `admin` in the URL, and `site:example.com intitle:"index of"` finds directory listings, because servers that expose a folder title the page "Index of /". Each dork is a specific question, and the specificity is what filters the noise.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**`site:example.com`** - restrict results to one domain.',
              '**`filetype:pdf`** (or xlsx, sql, log, env) - find a specific file type.',
              '**`inurl:admin`** - match text inside the URL, e.g. login or admin paths.',
              '**`intitle:"index of"`** - find open directory listings.',
              '**Combine them** - `site: filetype:` together is where the real finds are.',
            ],
          },
          {
            type: 'command',
            description: 'Dorks you can paste straight into a search engine:',
            commands: [
              'site:example.com filetype:xlsx',
              'site:example.com inurl:admin',
              'site:example.com intitle:"index of"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Run these and read the result count and titles, not just the first link. The first dork\'s results are downloadable spreadsheets - open one only if it is clearly the target\'s and in scope, and treat any personal data inside as a disclosure to report, not to collect. The second surfaces admin or login URLs, which tell you where authentication lives before you have sent the target a single request. The third lists open folders; a listing titled "Index of /backups" is a flashing sign. The engine did the crawling - your job is to phrase the question narrowly enough that the answer is a lead and not ten thousand irrelevant pages.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The crawler already saw it',
            text:
              'Dorking finds nothing new - it re-surfaces what the search engine already indexed. That is why it is passive and safe: you are querying the engine, not the target. It also means fixing the leak requires the company to remove or block the page, not just hope nobody searches.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Finding is not taking',
            text:
              'A dork can surface a spreadsheet full of personal data. Confirming it is exposed is the finding; downloading and keeping it is a separate, worse decision. Report the exposure, do not collect the data.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can use search operators to find exposed files, admin pages and open directories a company forgot were public.',
          },
          {
            type: 'quiz',
            question: 'Which dork finds Excel files published on a specific domain?',
            options: [
              'inurl:example.com xlsx',
              'site:example.com filetype:xlsx',
              'intitle:example.com excel',
              'example.com AND spreadsheet',
            ],
            correctIndex: 1,
            explanation: '`site:` limits results to the domain and `filetype:xlsx` matches the file extension, so together they list every indexed Excel file on that domain.',
          },
        ],
      },
      {
        slug: 'github-and-code-leaks',
        title: 'GitHub and Code Leaks',
        summary: 'Developers push secrets into public repos by accident. Deleting them later does not help.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Developers work fast, and sometimes an API key, a database password or an internal URL ends up committed into a public code repository. It happens constantly. Searching public repos for a target\'s leaked secrets is one of the highest-value OSINT skills there is - and the twist that makes it powerful is that deleting a secret does not remove it.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, and it hinges on how version control works. A repo does not just store the current files - it stores every version of every file, as a chain of commits. When a developer commits a file containing `API_KEY=sk_live_abc123`, that value is now baked into that commit forever. If they notice and "delete" the key in a new commit, the current files look clean - but the old commit still sits in the history, and anyone can browse back to it. So a secret that was live for ten minutes two years ago is still readable today unless the team rewrote history, which most never do.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete hunt. You search public repos for `example.com` and find a repo belonging to the company. The current code looks clean. But you open the commit history and scroll back, and a commit from last year shows a config file with `db_password = "SuperSecret2023"` - later "removed" in a newer commit. The password is still right there in the old commit. You also spot a hardcoded internal URL `https://internal-api.example.com` in another old file - an asset for your map. What a leaked key looks like in practice: a long random-looking string assigned to a name like `token`, `secret`, `api_key`, or `password`, often with a recognisable prefix that tells you which service it belongs to.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Commit history is permanent** - a "deleted" secret survives in the old commit.',
              '**Look for names** - `api_key`, `secret`, `token`, `password`, `.env` files.',
              '**Prefixes give it away** - many services use a recognisable key prefix.',
              '**Internal URLs leak too** - hardcoded hostnames expand your asset map.',
              '**Search by employee** - developers leak in personal repos, not just company ones.',
            ],
          },
          {
            type: 'command',
            description: 'Browse a repo\'s full history for a secret that was later removed:',
            commands: [
              'git clone https://github.com/example-corp/example-app.git',
              'cd example-app',
              'git log --all -p -S "api_key" | head -n 60',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The clone pulls down the entire repo including all history, not just the current files. The `git log` line is the key move: `--all` searches every branch, `-p` shows the actual code change in each commit, and `-S "api_key"` keeps only commits that added or removed the text `api_key`. The output is every moment that string entered or left the code - so a commit that added a real key, even one a later commit deleted, shows up here with the value in plain sight. Reading it tells you not just that a secret leaked but exactly when and what it was.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A leaked key is still someone\'s key',
            text:
              'Finding a live-looking credential is the finding. Actually using it to log in or call an API is unauthorised access, even though the key was public. Report it; do not test it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Do not use what you find',
            text: 'Report a discovered credential to the program. Using it to access systems is a crime regardless of how you found it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can mine a public repo\'s commit history for secrets and internal URLs, including ones that were later deleted.',
          },
          {
            type: 'quiz',
            question: 'A developer commits an API key, then removes it in a later commit. Why is it still a risk?',
            options: [
              'The removal did not save',
              'The key stays in the old commit in the repo history, which anyone can browse',
              'Search engines cache the key',
              'It is not a risk once removed',
            ],
            correctIndex: 1,
            explanation: 'Version control keeps every past commit. Removing the key in a new commit leaves the original commit - and the key - fully readable in history.',
          },
        ],
      },
      {
        slug: 'people-and-company-osint',
        title: 'People and Company OSINT',
        summary: 'Who works there, what they use, how they are organised - all public, all useful.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A company is people and the tools they use, and both leave public traces. Employee profiles, job postings, conference talks and public documents together sketch how an organisation is built - which technologies it runs, how its email addresses are formatted, who owns what. This is the human and organisational layer of recon, and it feeds everything from phishing-defence assessments to guessing where the sensitive systems live.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is joining small public facts into a bigger picture. Professional networking profiles list job titles and teams - so you learn the company has a "Payments Platform" team, which implies a payments system worth mapping. Job postings are goldmines: a listing for a "Senior Kubernetes Engineer, experience with a named cloud provider and a named CI tool" just told you their entire tech stack. Public documents carry metadata - an author name, the software that created them, sometimes internal file paths. Email format is often deducible: find one address like `first.last@example.com` and you can predict the rest. None of this is secret; the skill is assembling it.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one build-up. You start with a job posting that lists their cloud provider, their CI tool and their monitoring product - stack mapped. You check networking profiles and find the engineering team is organised into "Web", "Mobile" and "Infra" groups - so there is a mobile app worth its own recon. You find one employee\'s email on a public mailing list as `r.sharma@example.com`, which tells you the format is `first-initial.last`, so you can now predict addresses for phishing-resistance testing. You download a public PDF report and its metadata names the author and shows it was saved under `D:\\Finance\\Q3\\` - a hint at how their internal drives are organised. Each fact is trivial alone; together they are a map of the company.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Job postings** - the fastest way to learn the exact tech stack.',
              '**Networking profiles** - team structure, roles, and who owns which system.',
              '**Email format** - deduce the pattern from one known address.',
              '**Document metadata** - author, software, and sometimes internal file paths.',
              '**Conference talks and blogs** - engineers describe their own architecture publicly.',
            ],
          },
          {
            type: 'command',
            description: 'Strip the metadata out of a public document you downloaded:',
            commands: ['exiftool example-report.pdf'],
          },
          {
            type: 'paragraph',
            text:
              'This reads the file\'s embedded metadata and prints it as label-and-value lines. The `Author` and `Creator` fields often name a real employee and the exact software version they used. A `Producer` field can reveal an internal tool. Occasionally a field or an embedded path leaks a directory like `D:\\Finance\\Q3` - a peek at how their storage is laid out. The document\'s visible content might be a boring press release, but the metadata underneath is the part recon cares about, and most people never think to strip it before publishing.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Small facts compound',
            text:
              'No single profile or posting is a bug. The value is in joining them - stack plus team structure plus email format is a genuine map of an organisation, built entirely from public pieces.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'People are not targets',
            text:
              'Profiling an organisation for an authorised assessment is legitimate. Harassing, stalking or contacting individuals is not - keep it to public professional information and the scope you were given.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can assemble public facts about a company - its stack, teams, email format and document metadata - into a working map.',
          },
          {
            type: 'quiz',
            question: 'Which public source most directly reveals a company\'s exact technology stack?',
            options: [
              'Its home page banner',
              'Its job postings, which list the tools and platforms they hire for',
              'Its favicon',
              'Its HTTPS certificate',
            ],
            correctIndex: 1,
            explanation: 'Job postings spell out the specific technologies a team uses, because they need candidates with those exact skills - making them one of the richest stack-mapping sources.',
          },
        ],
      },
      {
        slug: 'wayback-and-historical-data',
        title: 'Wayback and Historical Data',
        summary: 'The internet remembers. Deleted pages, old endpoints and removed files still live in archives.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Websites change - pages get deleted, features get removed, old API endpoints get quietly retired. But web archives have been photographing the internet for decades, so the version of a site from three years ago is often still readable. That history is a recon goldmine, because things a company removed for a reason are exactly the things worth looking at.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is snapshots over time. An archive crawls a site repeatedly and stores each version with a date. You can browse any past snapshot, or - more usefully for recon - pull the archive\'s full list of every URL it ever saw on a domain. That list includes pages that no longer exist on the live site: an old `/admin` panel, a retired `/api/v1/` endpoint, a `robots.txt` that once named secret directories, a JavaScript file that referenced internal hosts. The live site cleaned all this up; the archive did not. And an old endpoint that got "removed" from the menu is frequently still running on the server, just unlinked.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete pull. You ask the archive for every URL it has seen on `example.com` and get thousands of lines. You filter them and spot `/api/v1/users` - the current site is on `/api/v2/`, but `v1` may still respond and may lack the newer access checks. You spot `/beta/dashboard`, a page removed last year, still worth requesting. You find an old `config.js` snapshot that hardcoded `https://internal.example.com` - a subdomain for your asset map. None of these appear anywhere on the site today; the archive is the only reason you know they existed, and half of them may still work.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Snapshots by date** - browse any past version of a page.',
              '**Full URL history** - pull every URL the archive ever recorded for a domain.',
              '**Retired endpoints** - old API versions often still respond without new checks.',
              '**Removed pages** - unlinked does not mean deleted from the server.',
              '**Old JS and config** - historical files leak internal hosts and paths.',
            ],
          },
          {
            type: 'command',
            description: 'Pull every URL an archive has recorded for a domain:',
            commands: [
              'curl -s "https://web.archive.org/cdx/search/cdx?url=example.com/*&output=text&fl=original&collapse=urlkey" | sort -u',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This queries the archive\'s index for every URL it ever captured under `example.com`, asks for just the original URL of each (`fl=original`), collapses duplicates, and sorts them. The output is a de-duplicated list of historical URLs - your job is to scan it for paths the live site no longer shows: old API versions, admin or beta paths, and static files worth fetching. A URL appearing here only proves it existed once, so the next step is to actually request the interesting ones against the live target (inside scope) and see which still answer - the ones that do are unlinked but live surface.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Removed is not gone',
            text:
              'Companies remove a link far more often than they remove the code behind it. An endpoint the archive remembers but the site no longer links to is a classic place to find forgotten, under-protected functionality.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can mine web archives for deleted pages, retired endpoints and old files that reveal a target\'s past and present surface.',
          },
          {
            type: 'practice_ref',
            title: 'OSINT check',
            exerciseSlug: 'osint-quiz',
          },
          {
            type: 'quiz',
            question: 'Why is an old API endpoint found in a web archive worth testing?',
            options: [
              'Archives make endpoints load faster',
              'It was unlinked but may still run on the server, often without the newer security checks',
              'Archived endpoints are always in scope',
              'It proves the site was hacked before',
            ],
            correctIndex: 1,
            explanation: 'Companies usually remove the link, not the underlying code. A retired endpoint often still responds and may lack the access controls added to its replacement.',
          },
        ],
      },
      {
        slug: 'leaked-credentials-and-breaches',
        title: 'Leaked Credentials and Breaches',
        summary: 'Old breaches leak passwords. You can check exposure to help - never to log in.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'When a website gets breached, the stolen usernames and passwords often end up circulating publicly. Over the years these pile into enormous collections. As a defender or an authorised assessor, checking whether a target\'s accounts appear in known breaches is a legitimate and useful signal. As anyone, using those passwords to log in is a crime. This lesson lives entirely on the ethical side of that line.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism you SHOULD use is exposure checking without ever handling raw passwords. Reputable breach-notification services let you check whether an email address appeared in a known breach, and whether a given password has been seen in any breach - without you needing the actual stolen data. The clever part is how password checking stays safe: you hash the password, send only the first few characters of that hash, and the service returns all matching hashes for you to compare locally. You learn "this password has been exposed" while the service never sees your password and you never touch the breach dump. That is exposure intelligence; it is not credential theft.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the legitimate use. You are assessing `example.com` with authorisation, and part of the brief is password hygiene. You check whether the company\'s domain appears in breach notifications - it does, in an old breach of an unrelated service several employees signed up to with work emails. That is your finding: staff reused work emails on a breached site, which raises credential-stuffing risk, and you report exactly that. What you do NOT do is take a leaked password from that breach and try it against the company login. Confirming exposure is defence; trying the password is attacking accounts you have no permission for, and no breach makes that legal.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Exposure check** - is this email or password in a known breach? A yes/no signal.',
              '**Range hashing** - check a password without sending the password or touching the dump.',
              '**Legitimate finding** - work emails reused on breached third-party sites.',
              '**Credential stuffing** - trying leaked passwords on a login. A crime without authorisation.',
              '**Password reuse** is the underlying risk breaches expose - report it, do not exploit it.',
            ],
          },
          {
            type: 'command',
            description: 'Check if a password has been exposed, sending only a hash prefix (k-anonymity):',
            commands: [
              'echo -n "password123" | sha1sum',
              'curl -s "https://api.pwnedpasswords.com/range/CBFDA"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first line hashes the password with SHA-1 and prints the hash - for `password123` it starts with `CBFDA...`. The second line sends only the first five characters of that hash to the service and gets back every full hash suffix that starts with those five characters, each with a count of how many breaches it appeared in. You compare the rest of your hash against that list locally: a match with a large count means this password is thoroughly burned. Notice what never left your machine - the password itself, and the full hash - which is exactly why this is safe to run and why it is exposure checking, not password harvesting.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The line is bright, not blurry',
            text:
              'Checking whether a credential is exposed is defence and is fine. Typing a leaked credential into a login form is unauthorised access. There is no clever framing that moves that line - do not cross it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Never log in with what leaked',
            text: 'Report password exposure and reuse as a finding. Using leaked credentials to access any account is a crime, authorised assessment or not.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can check breach exposure ethically - proving a credential is burned without ever touching the stolen data or logging in.',
          },
          {
            type: 'quiz',
            question: 'You find a target employee\'s password in an old breach. What is the ethical action?',
            options: [
              'Log in to confirm it still works',
              'Report the exposure and password-reuse risk without using the credential',
              'Sell it back to the company',
              'Post it so the company notices',
            ],
            correctIndex: 1,
            explanation: 'Checking and reporting exposure is legitimate defence. Actually using the leaked password to log in is unauthorised access - a crime regardless of how you obtained it.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'scoping-and-staying-legal',
    slug: 'recon-mindset-quiz',
    title: 'The Recon Mindset check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What defines passive reconnaissance?',
        options: [
          'It is done slowly',
          'No traffic reaches the target; you read third-party sources',
          'It only uses paid tools',
          'It happens after scanning',
        ],
        correctIndex: 1,
        explanation: 'Passive recon pulls from certificate logs, archives and search engines, so the target logs nothing.',
      },
      {
        prompt: 'You send an HTTP request straight to a target host. This is:',
        options: ['Passive recon', 'Active recon', 'Not recon at all', 'Only recon if it fails'],
        correctIndex: 1,
        explanation: 'Any packet sent to the target itself is active recon and lands in their logs, so it needs the host to be in scope.',
      },
      {
        prompt: 'A scope reads "*.example.com" but lists "blog.example.com" as out of scope. Can you test the blog?',
        options: [
          'Yes, the wildcard wins',
          'No, an exclusion always beats a wildcard',
          'Yes, if the bug is serious',
          'Only with a scanner',
        ],
        correctIndex: 1,
        explanation: 'An explicit out-of-scope entry overrides an in-scope wildcard every time.',
      },
      {
        prompt: 'careers.example.com is a CNAME to a third-party hiring platform. Under a "*.example.com" scope it is:',
        options: [
          'In scope, it matches the wildcard',
          'Out of scope unless stated - the servers belong to a vendor',
          'In scope because the target uses it',
          'In scope only during business hours',
        ],
        correctIndex: 1,
        explanation: 'The subdomain points at a vendor\'s infrastructure, so testing it hits the vendor, not the target.',
      },
      {
        prompt: 'Best general order of operations in recon?',
        options: [
          'Scan loudly first, read scope later',
          'Exhaust passive recon, then go active only inside scope',
          'Active only, passive wastes time',
          'Whatever is fastest',
        ],
        correctIndex: 1,
        explanation: 'Passive first builds the map with zero footprint; active confirms it, but only against authorised hosts.',
      },
    ],
  },
  {
    lessonSlug: 'cloud-asset-discovery',
    slug: 'finding-assets-quiz',
    title: 'Finding Assets check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why do hunters prize forgotten subdomains like "staging" or "dev"?',
        options: [
          'They load faster',
          'They are less defended and less tested than the main site',
          'They are always in scope',
          'They skip HTTPS',
        ],
        correctIndex: 1,
        explanation: 'Non-production hosts get less security attention, so real bugs survive there longer.',
      },
      {
        prompt: 'Which DNS record most often lists the SaaS products a company uses?',
        options: ['A record', 'MX record', 'TXT record via verification tokens', 'NS record'],
        correctIndex: 2,
        explanation: 'Companies paste vendor verification tokens into TXT records, effectively listing their vendors.',
      },
      {
        prompt: 'How does Certificate Transparency reveal hidden subdomains?',
        options: [
          'It scans the servers',
          'Every issued HTTPS certificate names its domains and is published to a public log',
          'It reads the DNS zone file',
          'It brute-forces names',
        ],
        correctIndex: 1,
        explanation: 'Certificate authorities must publish issued certificates, and each names the exact domains it covers.',
      },
      {
        prompt: 'What does finding a target\'s ASN give you over subdomain enumeration?',
        options: [
          'Faster lookups',
          'The IP ranges it owns, including live servers with no DNS name',
          'A list of employees',
          'The source code',
        ],
        correctIndex: 1,
        explanation: 'An ASN expands into owned IP blocks, catching nameless hosts that DNS-based recon cannot find.',
      },
      {
        prompt: 'You curl a guessed cloud bucket URL and get HTTP 403. That means:',
        options: [
          'The bucket does not exist',
          'It exists but denied your request - it is locked down',
          'It is public and listable',
          'It holds a database dump',
        ],
        correctIndex: 1,
        explanation: 'A 403 means the bucket exists but is not readable without credentials; 200 would mean public, 404 wrong name.',
      },
    ],
  },
  {
    lessonSlug: 'wayback-and-historical-data',
    slug: 'osint-quiz',
    title: 'OSINT check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which dork lists Excel files published on a specific domain?',
        options: [
          'inurl:example.com xlsx',
          'site:example.com filetype:xlsx',
          'intitle:example.com excel',
          'example.com AND spreadsheet',
        ],
        correctIndex: 1,
        explanation: '`site:` limits results to the domain and `filetype:xlsx` matches the extension.',
      },
      {
        prompt: 'A key was committed then removed in a later commit. Why is it still exposed?',
        options: [
          'The removal failed to save',
          'The key remains in the old commit in history, which anyone can browse',
          'Search engines cache it',
          'It is not exposed once removed',
        ],
        correctIndex: 1,
        explanation: 'Version control keeps every past commit, so a "deleted" secret stays readable in history.',
      },
      {
        prompt: 'Which public source most directly reveals a company\'s tech stack?',
        options: [
          'Its home page banner',
          'Its job postings, which list the tools they hire for',
          'Its favicon',
          'Its HTTPS certificate',
        ],
        correctIndex: 1,
        explanation: 'Job postings spell out the exact technologies a team needs, making them a rich stack source.',
      },
      {
        prompt: 'Why test an old API endpoint found only in a web archive?',
        options: [
          'Archives speed it up',
          'It was unlinked but may still run, often without newer access checks',
          'Archived endpoints are always in scope',
          'It proves a past breach',
        ],
        correctIndex: 1,
        explanation: 'Companies usually remove the link, not the code, so retired endpoints often still respond and may be under-protected.',
      },
      {
        prompt: 'You find an employee\'s password in an old breach. The ethical action is to:',
        options: [
          'Log in to confirm it works',
          'Report the exposure and reuse risk without using the credential',
          'Sell it to the company',
          'Post it publicly',
        ],
        correctIndex: 1,
        explanation: 'Checking and reporting exposure is defence; using the leaked password to log in is unauthorised access.',
      },
    ],
  },
];
