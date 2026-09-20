import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'active-recon',
    title: 'Active Recon',
    description:
      'Passive recon reads public records; active recon actually pokes the target and reads what comes back. This module teaches you to scan ports and know what filtered really means, fingerprint the exact software behind a banner, map every hidden page and parameter with a fuzzer, and do it all without lighting up the target like a Diwali cracker. By the end you can turn a bare domain into a ranked list of things worth testing.',
    lessons: [
      {
        slug: 'port-scanning-deep',
        title: 'Port Scanning, Deeper',
        summary: 'A SYN scan and a connect scan ask the same question in two different ways. The answers differ, and so do the risks.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('SYN scan vs connect scan, and what filtered actually means - a live nmap walkthrough'),
          {
            type: 'paragraph',
            text:
              'You already know a port scan finds open doors. Now the important part: there is more than one way to knock, and the way you knock changes what you learn, how loud you are, and whether a firewall even lets you find out. Get this and you stop guessing at your scan results.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Connect scan vs SYN scan',
          },
          {
            type: 'paragraph',
            text:
              'A TCP connection starts with a three-step handshake: you send SYN, the server replies SYN-ACK, you reply ACK. A **connect scan** (`-sT`) does the whole handshake, exactly like a normal program opening a connection. It is reliable and needs no special privileges, but it completes the connection, so the target app often logs it as a real visit. A **SYN scan** (`-sS`, the nmap default when you run as root) sends SYN, waits for the SYN-ACK, and then never sends the final ACK - it tears the half-open connection down instead. It learns the same thing (the port answered, so it is open) while completing fewer connections, which is faster and slips past some basic logging.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one port concretely. You SYN-scan port 443 on `192.0.2.10`. You send SYN. The server sends SYN-ACK - that reply alone proves something is listening, so nmap marks 443 **open** and sends a RST to drop the half-open connection. Now you scan port 8081 and get nothing back at all, not even a refusal. That silence is the interesting case, and it is what the next section is about.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Open vs closed vs filtered',
          },
          {
            type: 'paragraph',
            text:
              'Three results, three different meanings. **Open** means you got a SYN-ACK - a service is listening and will talk. **Closed** means you got a RST (reset) - the machine is reachable and answered, but nothing is listening on that port. **Filtered** means you got nothing - no SYN-ACK, no RST, just silence, usually because a firewall dropped your packet on the floor without a reply. Closed tells you the host is alive; filtered tells you something is deliberately blocking you, which is itself a clue about the target.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**`-sS`** - SYN (half-open) scan. Fast, quieter, needs root. Nmap default with privileges.',
              '**`-sT`** - full connect scan. No root needed, but completes and often logs the connection.',
              '**`-sU`** - UDP scan. Slow and uncertain because UDP has no handshake to confirm against.',
              '**open** - got SYN-ACK; a service is listening.',
              '**closed** - got RST; host is alive, port has no service.',
              '**filtered** - got silence; a firewall is likely dropping your packets.',
            ],
          },
          {
            type: 'command',
            description: 'A focused SYN scan of the common ports on one host, with service detection:',
            commands: ['nmap -sS -sV --top-ports 100 192.0.2.10'],
          },
          {
            type: 'paragraph',
            text:
              'Read that output line by line. Each row is `PORT  STATE  SERVICE  VERSION`. A line like `22/tcp open ssh OpenSSH 8.9` means port 22 answered, nmap connected far enough to grab a banner, and the software is OpenSSH 8.9 - a real version you can now look up. A row marked `filtered` with no version means the packet was dropped; you learned a firewall is in the way, not that the port is dead. If most ports come back filtered but a couple are open, you have just found the small door the firewall was told to leave open.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters when you are hunting: the open ports are your attack surface, and filtered ports tell you the target has a firewall making choices. A box with only 443 open behaves very differently from one with 22, 3306 and 8080 exposed. Reading state correctly stops you from wasting an hour attacking a port that was never really there.',
          },
          {
            type: 'lab_ref',
            labSlug: 'port-discovery',
            title: 'Try it: Port Discovery lab',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Silence is not "closed"',
            text:
              'Beginners read filtered as closed and move on. They are opposite signals. Closed means the host answered "nothing here". Filtered means something intercepted your knock - a firewall, a rate limiter, an IPS. That silence is a finding in itself.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Scan only what you own',
            text: 'Port scanning a host you have no authorisation to test can itself be treated as hostile activity. Stay inside the scope you were given.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can pick the right scan type on purpose and read open, closed and filtered as the three distinct signals they are.',
          },
          {
            type: 'practice_ref',
            title: 'Active Recon check',
            exerciseSlug: 'active-recon-quiz',
          },
          {
            type: 'quiz',
            question: 'Your SYN scan gets no reply at all on port 8080 - no SYN-ACK, no RST. What does nmap call this?',
            options: [
              'closed - nothing is listening',
              'open - a service replied',
              'filtered - something is dropping the packets',
              'unreachable - the host is down',
            ],
            correctIndex: 2,
            explanation: 'Total silence means your packet was dropped, usually by a firewall. That is "filtered". A closed port would have sent back a RST.',
          },
        ],
      },
      {
        slug: 'service-and-version-fingerprinting',
        title: 'Service and Version Fingerprinting',
        summary: 'An open port tells you a door exists. A banner tells you exactly what is behind it - and what to attack.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Reading banners with nmap -sV: turning an open port into a named, versioned target'),
          {
            type: 'paragraph',
            text:
              'Knowing port 22 is open is a start. Knowing it runs OpenSSH 7.2 on Ubuntu is the whole game, because now you can search for the exact weaknesses that version had. Fingerprinting is the step that turns "something is listening" into "this specific software, this specific version".',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism. When you connect to a service, it usually introduces itself - a short greeting called a banner. A mail server says `220 mail.example.com ESMTP Postfix`. A web server drops a `Server: nginx/1.18.0` line in its response headers. SSH announces `SSH-2.0-OpenSSH_8.9p1`. A version scanner like nmap `-sV` opens the connection, reads that greeting, and matches it against a huge database of known fingerprints to name the software and version. Where the banner is vague, it sends a few probes and reads the exact shape of the replies, because different software answers the same odd question in slightly different ways.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one host end to end. You scan `192.0.2.20` with `-sV`. Port 80 comes back `Apache httpd 2.4.29`, port 22 comes back `OpenSSH 7.6p1`, port 3306 comes back `MySQL 5.7.33`. In thirty seconds you have gone from three numbers to three named, versioned pieces of software. Now you can look each version up, check whether it is old enough to have known issues, and decide which door is worth your time first.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Banner** - the greeting a service sends when you connect. Often names the software and version.',
              '**`nmap -sV`** - version detection; reads banners and probes to name and version each service.',
              '**Server header** - HTTP responses often reveal the web server in a `Server:` line.',
              '**`X-Powered-By`** - a header that can leak the backend language or framework.',
              '**Vague banners** - some services are configured to hide the version; you fall back to behaviour.',
            ],
          },
          {
            type: 'command',
            description: 'Grab a web server banner by hand, without any scanner:',
            commands: ['curl -sI http://192.0.2.20', 'nmap -sV -p 22,80,3306 192.0.2.20'],
          },
          {
            type: 'paragraph',
            text:
              'The `curl -sI` command asks only for the response headers. In the output, the `Server:` line is the prize - `Server: Apache/2.4.29 (Ubuntu)` tells you the web server, its version, and even the operating system family. An `X-Powered-By: PHP/7.2.5` line, if present, hands you the backend language too. The nmap line does the same across three ports at once and cross-checks the guess. If a header is missing, that absence is a signal on its own: someone stripped it deliberately, which means the target is at least a little security-aware.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hunter cares: a precise version is a shortcut to real findings. Old software has documented weaknesses; a version two years behind is a strong lead. Even when the exact version is hidden, fingerprinting narrows the attack surface - knowing it is nginx and not Apache changes which misconfigurations you test for. You are not attacking a mystery box any more; you are attacking a known thing with known habits.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'port-scanning-deep',
            title: 'Prerequisite: Port Scanning, Deeper',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Trust, but verify the banner',
            text:
              'A banner can lie. Admins sometimes fake the `Server` header to say `nginx` on an Apache box, or blank it entirely. Treat a banner as a strong hint, not gospel - confirm with behaviour before you bet an hour on it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can turn a bare open port into a named, versioned service and use that version as your first lead.',
          },
          {
            type: 'quiz',
            question: 'Which nmap flag reads banners and probes to identify the software version behind a port?',
            options: ['-sS', '-sV', '-Pn', '-oN'],
            correctIndex: 1,
            explanation: '-sV is version detection. -sS is a SYN scan, -Pn skips host discovery, and -oN writes normal output to a file.',
          },
        ],
      },
      {
        slug: 'web-tech-fingerprinting',
        title: 'Web Tech Fingerprinting',
        summary: 'Every website leaks what it is built from. Learn to read the tells before you test.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Before you attack a web app, you want to know what it is made of - the server, the framework, the CMS, the JavaScript libraries. That stack decides which bugs are even possible. A WordPress site and a custom Django app fail in completely different ways, and the site itself tells you which one you are looking at if you know where to look.',
          },
          {
            type: 'paragraph',
            text:
              'The tells are everywhere once you notice them. Response headers name the server and sometimes the language. Cookies carry framework signatures - a `PHPSESSID` cookie screams PHP, a `csrftoken` cookie is Django, a `laravel_session` cookie is Laravel. The HTML source hides paths like `/wp-content/` (WordPress) or `/_next/` (Next.js). Specific files exist on specific stacks: `/wp-login.php` on WordPress, `/robots.txt` often lists admin paths. A fingerprinting tool bundles all these signals and gives you a best guess in one shot, but you can read them by hand, and doing so once teaches you what the tool is actually seeing.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one site concretely. You open `example.com` and view the page source. You spot `<link href="/wp-content/themes/twenty/style.css">` and a `<meta name="generator" content="WordPress 6.2">` tag. The cookie jar has a `wordpress_test_cookie`. You now know, with high confidence, it is WordPress 6.2. That single fact reroutes your whole plan: you will check its plugins, its login page, its XML-RPC endpoint - the things that actually break on WordPress - instead of testing generic bugs blind.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Headers** - `Server`, `X-Powered-By`, `X-AspNet-Version` name the stack.',
              '**Cookies** - `PHPSESSID` (PHP), `csrftoken` (Django), `laravel_session` (Laravel), `JSESSIONID` (Java).',
              '**Paths in HTML** - `/wp-content/` (WordPress), `/_next/` (Next.js), `/sites/default/` (Drupal).',
              '**`<meta name="generator">`** - many CMSs stamp their name and version right into the page.',
              '**Favicon hash** - the same framework often ships the same default favicon; its hash is a fingerprint.',
            ],
          },
          {
            type: 'command',
            description: 'Pull the headers and search the page source for stack tells by hand:',
            commands: [
              'curl -sI https://example.com',
              'curl -s https://example.com | grep -iE "generator|wp-content|_next|csrf"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command shows headers; scan for `Server`, `X-Powered-By`, and any cookie names in `Set-Cookie`. The second downloads the HTML and greps for the giveaway strings. A hit on `wp-content` confirms WordPress; a hit on `_next` confirms a Next.js frontend; a `generator` meta line often hands you the exact version. No hits at all is also information - a custom stack that leaks nothing is either well hardened or hand-built, and both change how you approach it.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: fingerprinting the stack is how you stop testing randomly. Each technology has a signature set of weaknesses and a signature set of default files and endpoints. Knowing the stack tells you which wordlist to fuzz with, which login page to look for, and which known issues to check - it points every later step at the bugs that are actually plausible here.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The absence of tells is a tell',
            text:
              'A site that strips every header and hides its generator tag is telling you someone thought about this. Do not read blank as boring - read it as "the easy wins are probably already gone, look harder".',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a page and its headers to name the stack, then aim your testing at the bugs that stack actually gets.',
          },
          {
            type: 'quiz',
            question: 'You see a cookie named PHPSESSID and a /wp-login.php page. What is the site most likely built on?',
            options: ['Django', 'WordPress (PHP)', 'A Java Spring app', 'A static HTML site'],
            correctIndex: 1,
            explanation: 'PHPSESSID means PHP, and /wp-login.php is the WordPress login page. Together they point strongly at WordPress.',
          },
        ],
      },
      {
        slug: 'content-discovery-fuzzing',
        title: 'Content Discovery and Fuzzing',
        summary: 'The pages that are not linked anywhere are often the interesting ones. Fuzzing finds them.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('Content discovery with ffuf: finding hidden admin panels and backup files, and filtering the noise'),
          {
            type: 'paragraph',
            text:
              'A website shows you the pages it wants you to see. The interesting ones - `/admin`, `/backup.zip`, `/api/internal`, an old `/test.php` - are usually not linked from anywhere. Content discovery means guessing those paths at speed by trying a big list of likely names and watching which ones exist. This is where a lot of real findings actually start.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is simple and brutal. You take a wordlist - a file with thousands of common path names, one per line - and a fuzzer requests every one against the target: `/admin`, `/login`, `/config`, and so on. For each request you read the HTTP status code. A `200 OK` means the page exists and loads. A `403 Forbidden` means it exists but you are blocked - which is often more interesting than a 200, because it confirms something is there worth protecting. A `404 Not Found` means nothing there. `301`/`302` are redirects. The fuzzer does thousands of these a minute; your job is to filter the flood down to the handful that matter.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one run concretely. You point ffuf at `https://example.com/FUZZ` with a wordlist. Most requests come back 404 - noise. Three come back interesting: `/admin` returns 403, `/backup` returns 301 redirecting to `/backup/`, and `/api` returns 200. You now have three leads that were on no page and in no sitemap. The 403 on `/admin` is a login or an access-control test waiting to happen; the `/backup/` directory might list old files; `/api` is a whole surface to map. None of it was visible until you fuzzed for it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**FUZZ keyword** - the placeholder in the URL that ffuf swaps for each wordlist entry.',
              '**200** - page exists and loads. **403** - exists but blocked, often a good lead.',
              '**301/302** - redirect; a trailing-slash redirect usually means a real directory.',
              '**404** - nothing there; the bulk of your results, and the noise to filter out.',
              '**`-mc`** - match specific status codes. **`-fc`** - filter out codes. **`-fs`** - filter by response size.',
            ],
          },
          {
            type: 'command',
            description: 'A basic content-discovery run, then a filtered one that hides the 404 noise:',
            commands: [
              'ffuf -u https://example.com/FUZZ -w wordlist.txt',
              'ffuf -u https://example.com/FUZZ -w wordlist.txt -mc 200,301,302,403 -fs 0',
            ],
          },
          {
            type: 'paragraph',
            text:
              'In the ffuf output each hit shows the word, the status code, and the response size in bytes. The size column is your best friend: if a site returns a soft-404 page (a friendly "not found" that still answers 200), every fake path has the same size, so you filter that size out with `-fs` and only real pages remain. Match `-mc 200,301,302,403` to keep the codes that mean "something is here" and drop the rest. The goal is to end with ten lines you actually read, not ten thousand you scroll past.',
          },
          {
            type: 'paragraph',
            text:
              'A word on noise and rate. Blasting a target with the maximum thread count is how you get IP-banned and how you knock a fragile site over. Start slower, watch for rate-limit responses (`429 Too Many Requests`), and back off if the site starts erroring. A smaller, smarter wordlist that finishes cleanly beats a giant one that gets you blocked halfway through. Recon that gets you banned is worse than no recon.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A 403 is a lead, not a dead end',
            text:
              'Beginners skip 403s because they cannot open them. Do the opposite - a 403 confirms the path exists and someone bothered to protect it. That is exactly the kind of thing worth a second look.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Fuzz only in scope',
            text: 'Content discovery fires thousands of requests. Point it only at targets you are authorised to test, and respect any rate rules the program sets.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can fuzz a site for hidden paths and filter the results down to the few that are actually worth opening.',
          },
          {
            type: 'quiz',
            question: 'During a fuzz, /admin returns 403. Why is that worth your attention?',
            options: [
              'It means the page is broken',
              'It confirms the path exists and is deliberately protected',
              'It means the path does not exist',
              'It means the server is down',
            ],
            correctIndex: 1,
            explanation: 'A 403 says the resource exists but access is denied. That confirms something worth protecting is there - a strong lead for access-control testing.',
          },
        ],
      },
      {
        slug: 'parameter-discovery',
        title: 'Parameter Discovery',
        summary: 'A page can accept inputs it never shows you. Those hidden parameters are where bugs hide.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Finding a page is half the job. The other half is finding the inputs that page accepts - the query parameters, the form fields, the JSON keys. Many of them are not shown in any form or link, but the server still reads them. A hidden `debug=true` or `admin=1` parameter has handed hunters real bugs. Parameter discovery is how you find inputs nobody advertised.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism mirrors content discovery, but you are fuzzing parameter names instead of paths. You take a list of common parameter names - `id`, `user`, `debug`, `redirect`, `file`, `page` - and send each one to the endpoint, then watch whether the response changes. If adding `?debug=true` makes the page longer, or throws a different error, or returns extra data, that parameter is real and the server is doing something with it. A parameter that changes nothing is ignored; a parameter that changes the response is a live input you can now test for injection, IDOR, or logic flaws.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete find. You have an endpoint `https://example.com/profile` that shows your own profile. You fuzz parameter names and notice that `https://example.com/profile?id=5` returns a different response size than `?id=1` - the page is reading an `id` you were never shown. That single discovery is the doorway to an IDOR: if `?id=5` shows user 5\'s profile and you are user 1, the app is trusting a number it should be checking. The parameter was invisible in the UI; fuzzing surfaced it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Query parameter** - the `?key=value` part of a URL. Often the easiest to fuzz.',
              '**Body parameter** - fields in a POST body or JSON, read the same way, fuzzed the same way.',
              '**Response diffing** - a parameter is real if it changes the response length, content or error.',
              '**Common suspects** - `id`, `user`, `debug`, `test`, `redirect`, `file`, `page`, `admin`.',
              '**Reflected value** - if your input appears in the response, that is a fast lead toward XSS testing.',
            ],
          },
          {
            type: 'command',
            description: 'Fuzz parameter names with ffuf and keep only responses that differ in size:',
            commands: [
              'ffuf -u "https://example.com/profile?FUZZ=test" -w params.txt -fs 0',
              'curl -s "https://example.com/profile?debug=true" | wc -c',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The ffuf line swaps `FUZZ` for each parameter name and flags any request whose response size stands out from the baseline. A word that produces a different size is a parameter the server actually processed. The `curl ... | wc -c` line then confirms one candidate by hand: it fetches the page with `debug=true` and counts the bytes. Compare that count to the page without the parameter - if it differs, the parameter is doing something, and you have a real input to probe. Same size, no effect, move on.',
          },
          {
            type: 'paragraph',
            text:
              'Why hunters chase hidden parameters: they are inputs the developer forgot to hide or thought nobody would find, which means they are often the least tested part of the app. A forgotten `debug` flag might dump internal data. An unlisted `redirect` parameter might be an open redirect. An unexpected `id` is the classic path to IDOR. The visible form was cleaned up; the hidden parameter behind it frequently was not.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Diff by size first, read second',
            text:
              'You cannot eyeball thousands of responses. Let the tool flag the ones whose size differs from the baseline, then read only those by hand. Size diffing is what makes parameter fuzzing practical instead of endless.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Probing hidden inputs sends many crafted requests. Do it only against systems you have explicit permission to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can uncover inputs a page never shows you and confirm which ones the server actually acts on.',
          },
          {
            type: 'quiz',
            question: 'How do you tell that a fuzzed parameter name is actually being used by the server?',
            options: [
              'It appears in the URL bar',
              'The response changes - different size, content, or error',
              'The wordlist contains it',
              'The status code is always 200',
            ],
            correctIndex: 1,
            explanation: 'A parameter the server ignores changes nothing. One it processes alters the response - length, content, or error - which is exactly what you diff for.',
          },
        ],
      },
    ],
  },
  {
    slug: 'recon-automation',
    title: 'Recon Automation',
    description:
      'Doing recon by hand once is learning; doing it by hand every day is a waste. This module turns your manual steps into a small pipeline that runs itself, then keeps watching so a new subdomain or endpoint reaches you before it reaches the crowd. By the end you can chain tools into one readable script, run Nuclei templates for known issues, diff a target day over day, and keep the flood of output organised enough to actually act on.',
    lessons: [
      {
        slug: 'building-a-recon-pipeline',
        title: 'Building a Recon Pipeline',
        summary: 'Stop retyping the same five commands. Chain them into one script that turns a domain into a target list.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('Chaining recon tools into one shell pipeline: from a bare domain to a live-host list'),
          {
            type: 'paragraph',
            text:
              'You run the same handful of commands on every new target: find subdomains, check which are alive, scan their ports, note the web tech. Doing that by hand is fine once. A pipeline is just those steps wired together so one command does the lot - and the real value is that it runs identically every time, so you stop forgetting a step at 2am.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is the humble Unix pipe: the output of one tool becomes the input of the next. Subdomain enumeration produces a list of hostnames. That list feeds a liveness check that keeps only the ones answering right now. The survivors feed a port scan and a tech-fingerprint step. Each stage narrows or enriches the data, and because each tool reads standard input and writes standard output, you can connect them with `|` and `>` without writing real code. A pipeline is a recipe, not a program.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete flow. You start with `example.com`. A subdomain step finds `app.example.com`, `api.example.com`, `blog.example.com`, and two dozen more, and writes them to `subs.txt`. A liveness step requests each and keeps only those that respond, cutting the list to twelve live hosts in `live.txt`. A port step scans those twelve. In one run you went from a single domain to a ranked list of live hosts with open ports - the exact starting point you would otherwise have assembled by hand over an hour.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Pipe (`|`)** - sends one command\'s output straight into the next command\'s input.',
              '**Redirect (`>`)** - writes output to a file you can feed to the next stage.',
              '**Stage 1 - enumerate** - collect candidate subdomains into a file.',
              '**Stage 2 - probe liveness** - keep only hosts that actually respond.',
              '**Stage 3 - scan and fingerprint** - port-scan and tech-detect the survivors.',
            ],
          },
          {
            type: 'code',
            language: 'bash',
            filename: 'recon.sh',
            code: [
              '#!/bin/bash',
              '# Usage: ./recon.sh example.com',
              'domain="$1"',
              '',
              '# 1. Collect subdomains (subfinder writes one host per line)',
              'subfinder -d "$domain" -silent > subs.txt',
              '',
              '# 2. Keep only the live ones (httpx confirms a response)',
              'cat subs.txt | httpx -silent > live.txt',
              '',
              '# 3. Port-scan the live hosts',
              'nmap -sS -iL live.txt -oN ports.txt',
              '',
              'echo "Found $(wc -l < subs.txt) subdomains, $(wc -l < live.txt) live."',
            ].join('\n'),
          },
          {
            type: 'paragraph',
            text:
              'Read what this script leaves behind. `subs.txt` is every candidate name; `live.txt` is the subset that answered, which is the list you actually work from; `ports.txt` is the nmap results for those live hosts. The final `echo` prints the two counts so you see at a glance how big the target is - "found 40 subdomains, 12 live" tells you the scale before you open a single one. Run it on any new domain and you get the same three files in the same shape every time, which is the whole point.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters for finding bugs: consistency beats brilliance in recon. A pipeline never forgets the liveness step or mistypes a flag, so your coverage is the same on target one and target fifty. It also frees your attention for the thinking part - deciding which of those twelve live hosts is worth deep testing - instead of spending it retyping commands you have run a hundred times.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Start small and readable',
            text:
              'A three-line pipeline you understand beats a forty-line one you copied and cannot debug. Add a stage only when you have run the previous version enough to know what is missing. A pipeline you cannot read is a pipeline you cannot trust.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Automation still needs authorisation',
            text: 'A script that scans hundreds of hosts fast is still scanning. Point it only at scopes you are cleared to test, and honour any rate limits the program sets.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can wire enumerate, probe and scan into one script that turns a bare domain into a live target list every time.',
          },
          {
            type: 'quiz',
            question: 'In the pipeline, what is the purpose of the httpx (liveness) stage between subdomains and the port scan?',
            options: [
              'It sorts the subdomains alphabetically',
              'It keeps only the hosts that actually respond, so you do not scan dead names',
              'It encrypts the subdomain list',
              'It renames the hosts',
            ],
            correctIndex: 1,
            explanation: 'Enumeration finds many names that no longer resolve or answer. The liveness stage trims the list to hosts worth scanning, saving time and noise.',
          },
        ],
      },
      {
        slug: 'nuclei-and-templates',
        title: 'Nuclei and Templates',
        summary: 'A scanner is only as good as its checks. Nuclei runs thousands of community checks, and you can read one.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Running Nuclei against a target and reading a template: what each check actually sends'),
          {
            type: 'paragraph',
            text:
              'Once you have a list of live hosts, you want to check them for known issues fast - exposed panels, default files, misconfigurations that thousands of sites share. Nuclei does exactly this. It is a scanner driven by templates: small readable files that each describe one check. The genius is that the checks are just text, so you can read what a scan is actually doing instead of trusting a black box.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism. A Nuclei template is a YAML file that says: send this request, and if the response matches this pattern, flag it. Nuclei loads a whole folder of these templates and fires each one at every target you give it, then reports only the templates that matched. A community repository ships thousands of templates for known exposures, so a single run checks a target against a huge library of "have you left this open?" tests. Because a template is plain text, you can open one, see the exact request it sends and the exact string it looks for, and trust or edit it accordingly.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete result. You run Nuclei against `live.txt`. Most templates match nothing. One fires: a template named `git-config-exposure` matched on `https://app.example.com/.git/config`, meaning the site is serving its Git config file to the public. That one line is a real finding - an exposed `.git` directory can leak source code and secrets. Nuclei did not "hack" anything; it sent one GET request the template described and noticed the response looked like a Git config. You can now verify by hand and write it up.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Template** - a YAML file describing one check: a request plus a match condition.',
              '**Matcher** - the rule that decides a template "fired" (a status code, a word, a regex).',
              '**`-t`** - run specific templates or a folder of them. **`-severity`** - filter by how serious.',
              '**Community templates** - a large shared library of checks for known exposures.',
              '**False positive** - a match that is not really a bug; always verify a fired template by hand.',
            ],
          },
          {
            type: 'code',
            language: 'yaml',
            filename: 'exposed-env.yaml',
            code: [
              'id: exposed-env-file',
              'info:',
              '  name: Exposed .env file',
              '  severity: high',
              'requests:',
              '  - method: GET',
              '    path:',
              '      - "{{BaseURL}}/.env"',
              '    matchers:',
              '      - type: word',
              '        words:',
              '          - "DB_PASSWORD"',
              '          - "APP_KEY"',
              '        condition: or',
            ].join('\n'),
          },
          {
            type: 'paragraph',
            text:
              'Read this template top to bottom. The `id` and `info` name it and mark it high severity. The `requests` block says: send a GET to `/.env` on the target. The `matchers` block says: if the response body contains `DB_PASSWORD` or `APP_KEY`, this template fired. That is the whole check - request a file that should never be public, and confirm it by the tell-tale strings a real `.env` file contains. Run this against a list and Nuclei reports every host serving its environment file, which is a common and painful leak.',
          },
          {
            type: 'command',
            description: 'Run Nuclei against your live hosts, limited to high and critical checks:',
            commands: ['nuclei -l live.txt -severity high,critical'],
          },
          {
            type: 'paragraph',
            text:
              'The `-l live.txt` feeds your live-host list; `-severity high,critical` skips the low-value noise so you see only the checks worth acting on. Each result line names the template that fired and the URL it fired on - that pairing is your lead. Treat every hit as a claim to verify, not a confirmed bug: open the URL yourself and confirm the exposure is real before you report it, because a matcher can fire on a page that merely mentions the word it was looking for.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A fired template is a lead, not a report',
            text:
              'Nuclei finds candidates fast, and so does every other hunter running the same templates. The edge is in verifying and understanding the hit, not in the scan. Never paste a raw Nuclei line into a report - confirm it first.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Scan in scope, at a sane rate',
            text: 'Nuclei fires many requests across many hosts. Run it only against authorised targets and throttle it so you do not overwhelm a fragile service.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can run a template scanner across a host list and read a template to know exactly what a check sends and matches.',
          },
          {
            type: 'quiz',
            question: 'What is a Nuclei template, in plain terms?',
            options: [
              'A wordlist of subdomains',
              'A readable file describing one request and the pattern that means it matched',
              'A compiled binary you cannot inspect',
              'A list of IP addresses to avoid',
            ],
            correctIndex: 1,
            explanation: 'Each template is a small YAML file: it defines a request to send and a matcher that decides whether the response counts as a hit. You can read exactly what it does.',
          },
        ],
      },
      {
        slug: 'monitoring-targets-continuously',
        title: 'Monitoring Targets Continuously',
        summary: 'The person who finds the new subdomain first often finds the bug first. Automate the watching.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Big targets change constantly - a new subdomain here, a fresh endpoint there. The hunter who spots that new asset the day it appears, before the crowd, gets first crack at whatever bugs it shipped with. You cannot watch a target by staring at it. You automate the watching: run your recon on a schedule and get told only what changed.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is diffing - comparing today against yesterday. You save the output of each recon run to a dated file. The next run produces a fresh file. A diff tool compares the two and shows only the new lines - the subdomains that were not there before. Everything unchanged is silent; only the additions surface. Wrap that in a scheduled job and you turn a manual chore into an alert that pings you when, and only when, the target grows a new limb.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete cycle. Monday your subdomain run lists 40 hosts, saved as `subs-monday.txt`. Tuesday the run lists 42, saved as `subs-tuesday.txt`. You diff the two files and two new names appear: `staging-api.example.com` and `payments-test.example.com`. Those two lines are gold - a staging API and a test payments host, likely rushed out and lightly tested. Everyone watching this program on a schedule now races to them; everyone who is not watching will not even know they exist for weeks.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Snapshot** - the saved output of one recon run, usually dated.',
              '**Diff** - comparing two snapshots to surface only what changed.',
              '**New asset** - a subdomain or endpoint present today but not yesterday. Your alert trigger.',
              '**Schedule** - a cron job or timer that reruns recon at a fixed interval.',
              '**Signal, not noise** - notify only on real changes, never on every unchanged run.',
            ],
          },
          {
            type: 'command',
            description: 'Diff today\'s subdomain list against yesterday\'s and show only the additions:',
            commands: [
              'comm -13 <(sort subs-monday.txt) <(sort subs-tuesday.txt)',
              'diff subs-monday.txt subs-tuesday.txt',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The `comm -13` command is the precise tool here: it prints lines that are in the second file but not the first - exactly the new subdomains, nothing else. The `<(sort ...)` parts sort each file first, which `comm` requires. The plainer `diff` shows changes in both directions with `>` marking additions and `<` marking removals. Either way, the output you read is short - just what changed - which is what makes daily monitoring bearable. If the output is empty, nothing new appeared and you correctly get no alert.',
          },
          {
            type: 'paragraph',
            text:
              'Why this is an edge, not just tidiness: bugs are most findable when an asset is new and least tested. A freshly deployed subdomain often ships with debug flags on, default credentials, or an old library, and it stays that way until someone notices. Continuous monitoring puts you in the small group that notices first. Combine it with the scheduler this platform gives you and the target effectively reports its own changes to you.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'First is often the whole advantage',
            text:
              'On a crowded program, the difference between a bounty and a duplicate is frequently who arrived first. Monitoring is how you arrive first without living in front of the terminal.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can snapshot a target, diff it over time, and surface a brand-new asset the day it appears instead of weeks later.',
          },
          {
            type: 'quiz',
            question: 'You save daily subdomain lists and diff them. What is the point of the diff?',
            options: [
              'To delete old subdomains',
              'To surface only the assets that are new since the last run',
              'To sort the list alphabetically',
              'To count how many hosts are live',
            ],
            correctIndex: 1,
            explanation: 'Diffing two snapshots shows only what changed - the new subdomains - so you can jump on fresh, lightly-tested assets before the crowd does.',
          },
        ],
      },
      {
        slug: 'organizing-recon-data',
        title: 'Organising Recon Data',
        summary: 'Recon produces a flood of files. If you cannot find yesterday\'s finding, you did not really find it.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A week of active recon leaves you drowning in output - subdomain lists, port scans, screenshots, notes, half-finished ideas. If it is all dumped in one folder with names like `scan1.txt` and `new.txt`, you will lose findings simply because you cannot find them again. Organising recon data is boring and it is exactly what separates hunters who compound their work from those who redo it.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a convention you actually stick to. Give every target its own folder. Inside it, keep a predictable set of files: `subdomains.txt`, `live.txt`, `ports.txt`, `notes.md`. Date your snapshots so monitoring diffs have something to compare. Keep a single `notes.md` where you write, in plain sentences, what you tested and what you found - not just raw tool output. The system does not need to be clever; it needs to be the same every time, so future-you can walk into any target folder and instantly know where things are.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete layout. You create `~/targets/example.com/`. Inside go `subdomains-2024-06-01.txt`, `live.txt`, `ports.txt`, and `notes.md`. In `notes.md` you write: "01 Jun - found /admin (403), api.example.com has an exposed Swagger doc, staging-api appeared today, untested." Three weeks later you come back, open that one file, and in ten seconds you know exactly where you stopped and what to try next. Without it, you would re-run everything and rediscover the same three things you already knew.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**One folder per target** - never mix two programs\' data in one place.',
              '**Predictable filenames** - `subdomains.txt`, `live.txt`, `ports.txt`, the same every time.',
              '**Dated snapshots** - so continuous monitoring has yesterday to diff against.',
              '**A `notes.md` in plain words** - what you tested, what you found, what is left to try.',
              '**Raw output stays raw** - keep tool output separate from your written conclusions.',
            ],
          },
          {
            type: 'command',
            description: 'Set up a clean target folder in one go:',
            commands: [
              'mkdir -p ~/targets/example.com',
              'cd ~/targets/example.com && touch subdomains.txt live.txt ports.txt notes.md',
            ],
          },
          {
            type: 'paragraph',
            text:
              'These two commands create the folder and lay down the four standard files so the structure exists before you generate a single result. `mkdir -p` makes the directory (and any missing parents) without complaining if it already exists; `touch` creates the empty files. From here your pipeline writes into `subdomains.txt` and `live.txt`, your scans fill `ports.txt`, and you type conclusions into `notes.md`. The value is that every target you ever work looks identical, so you never waste a minute wondering where you put something.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters for real bounties: recon compounds only if you can build on it. The hunter who kept clean notes returns to a target after a month and immediately tests the three ideas they parked. The one who did not starts from zero every time and slowly burns out re-scanning. Good organisation is not admin - it is the difference between recon that accumulates into findings and recon that evaporates.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Notes in sentences, not just dumps',
            text:
              'A folder of raw tool output is not notes. Write one line of plain English per finding - "api.example.com leaks a Swagger doc, untested". That sentence is what future-you can actually act on.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You have a repeatable layout for target data, so past recon becomes a head start instead of a pile you re-run.',
          },
          {
            type: 'quiz',
            question: 'Why keep a plain-English notes.md alongside your raw recon output?',
            options: [
              'Tools require it to run',
              'So future-you can act on what you tested and found without re-running everything',
              'It makes the scans faster',
              'It encrypts the findings',
            ],
            correctIndex: 1,
            explanation: 'Raw output tells you what a tool saw; notes tell you what you concluded and what is left to try. That is what lets recon compound instead of being redone.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'parameter-discovery',
    slug: 'active-recon-quiz',
    title: 'Active Recon check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'A SYN scan gets no reply at all on a port - no SYN-ACK, no RST. What is that port called?',
        options: ['open', 'closed', 'filtered', 'unknown'],
        correctIndex: 2,
        explanation: 'Silence usually means a firewall dropped the packet. That is filtered. A closed port would send back a RST.',
      },
      {
        prompt: 'Which nmap flag identifies the software and version behind an open port?',
        options: ['-sS', '-Pn', '-sV', '-oN'],
        correctIndex: 2,
        explanation: '-sV is version detection. It reads banners and probes to name the service and its version.',
      },
      {
        prompt: 'A cookie named laravel_session appears in the responses. What does that tell you?',
        options: [
          'The site is built on Laravel (PHP)',
          'The site is a static HTML page',
          'The site runs Java',
          'The site has no framework',
        ],
        correctIndex: 0,
        explanation: 'Framework cookies are strong fingerprints. laravel_session points at the Laravel PHP framework.',
      },
      {
        prompt: 'During content discovery, /admin returns a 403. Why is that a lead worth keeping?',
        options: [
          'It means the page does not exist',
          'It confirms the path exists and is deliberately protected',
          'It means the server crashed',
          'It means you were rate limited',
        ],
        correctIndex: 1,
        explanation: 'A 403 says the resource exists but access is denied - proof something worth protecting is there.',
      },
      {
        prompt: 'How do you tell a fuzzed parameter name is actually processed by the server?',
        options: [
          'It is in your wordlist',
          'The response changes - size, content, or error',
          'The status code stays 200',
          'It appears in the address bar',
        ],
        correctIndex: 1,
        explanation: 'An ignored parameter changes nothing. A processed one alters the response, which is what you diff for.',
      },
    ],
  },
  {
    lessonSlug: 'organizing-recon-data',
    slug: 'recon-automation-quiz',
    title: 'Recon Automation check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In a recon pipeline, what does the liveness (httpx) stage do between enumeration and scanning?',
        options: [
          'Sorts the subdomains',
          'Keeps only hosts that actually respond, so dead names are not scanned',
          'Encrypts the host list',
          'Counts the open ports',
        ],
        correctIndex: 1,
        explanation: 'Enumeration finds many dead names. The liveness stage trims the list to hosts worth scanning.',
      },
      {
        prompt: 'What is a Nuclei template?',
        options: [
          'A compiled binary you cannot inspect',
          'A readable YAML file describing one request and the pattern that means it matched',
          'A list of subdomains',
          'A wordlist for fuzzing',
        ],
        correctIndex: 1,
        explanation: 'Each template is a small YAML file defining a request and a matcher - you can read exactly what it checks.',
      },
      {
        prompt: 'A Nuclei template fires on a host. What should you do before reporting it?',
        options: [
          'Report it immediately as a confirmed bug',
          'Verify the hit by hand, since matchers can produce false positives',
          'Delete the template',
          'Rescan with a bigger wordlist',
        ],
        correctIndex: 1,
        explanation: 'A fired template is a lead, not a confirmed finding. Always verify the exposure yourself before writing it up.',
      },
      {
        prompt: 'You diff yesterday\'s and today\'s subdomain lists. What is the point?',
        options: [
          'To delete old hosts',
          'To surface only the assets that are new since the last run',
          'To sort the list',
          'To measure scan speed',
        ],
        correctIndex: 1,
        explanation: 'Diffing two snapshots shows only what changed, so you jump on fresh, lightly-tested assets first.',
      },
      {
        prompt: 'Why keep a plain-English notes.md next to raw recon output?',
        options: [
          'Tools require it',
          'So future-you can act on what you tested and found without re-running everything',
          'It speeds up scans',
          'It hides the findings',
        ],
        correctIndex: 1,
        explanation: 'Raw output records what a tool saw; notes record your conclusions and next steps, which is what lets recon compound.',
      },
    ],
  },
];
