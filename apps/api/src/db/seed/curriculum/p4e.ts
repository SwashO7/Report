import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'owasp-top-10',
    title: 'The OWASP Top 10',
    description:
      'The famous list every interviewer and report references, decoded. By the end you can name all ten 2021 categories, say in plain words what each one really means, give one concrete example, and know exactly which deep-dive lesson teaches the actual attack. It is the map that tells you where to look for real bugs.',
    lessons: [
      {
        slug: 'owasp-top-10-overview',
        title: 'What the OWASP Top 10 Actually Is',
        summary: 'Not a checklist of bugs. A consensus list of the categories that hurt the most, refreshed every few years.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('The OWASP Top 10, explained in plain English - what it is and what it is not'),
          {
            type: 'paragraph',
            text:
              'The OWASP Top 10 is a list of the ten broad categories of web security problem that industry experts agree cause the most damage. OWASP stands for the Open Worldwide Application Security Project - a non-profit that publishes free security guidance. The Top 10 is their most famous document, and it is the thing your interviewer means when they say "walk me through the OWASP Top 10".',
          },
          {
            type: 'paragraph',
            text:
              'Here is the part people get wrong. It is not a list of bugs, and it is not a checklist you tick off. It is a list of *categories*. "A03: Injection" is not one bug - it is a whole family that includes SQL injection, command injection, and more. Think of it like the crime categories in a police report: "theft" is a category, and pickpocketing, shoplifting and car break-ins all live under it. The Top 10 tells you which categories to worry about; the actual attacks live one level down.',
          },
          {
            type: 'paragraph',
            text:
              'It gets refreshed every few years from real-world data - surveys of security professionals plus statistics on how often each category actually shows up in tested applications. The current edition is 2021, numbered A01 through A10. A01 is at the top because broken access control was found in more tested apps than anything else, not because it is the "scariest" bug. So the ranking is about how common a category is, not how bad a single instance can be.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**A01** - Broken Access Control',
              '**A02** - Cryptographic Failures',
              '**A03** - Injection',
              '**A04** - Insecure Design',
              '**A05** - Security Misconfiguration',
              '**A06** - Vulnerable and Outdated Components',
              '**A07** - Identification and Authentication Failures',
              '**A08** - Software and Data Integrity Failures',
              '**A09** - Security Logging and Monitoring Failures',
              '**A10** - Server-Side Request Forgery (SSRF)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'How does this help you find bugs? It gives you a checklist of *places to look*, not answers. When you land on a new target, you can walk the ten categories and ask one question each: can I reach data that is not mine (A01)? Is anything sensitive sent or stored without encryption (A02)? Does my input ever become code (A03)? That turns a blank page into ten concrete starting points. The rest of this module takes each category, explains it in one breath, and points you at the lesson where you actually learn to exploit it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A map, not the territory',
            text:
              'The Top 10 tells you the neighbourhoods where bugs live. It will not find the bug for you, and plenty of real findings do not fit neatly into one box. Use it to start looking, not to stop thinking.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain what the OWASP Top 10 is - ten categories, ranked by how common they are - and answer the interview question cold.',
          },
          {
            type: 'quiz',
            question: 'What is the OWASP Top 10, most accurately?',
            options: [
              'A list of the ten worst individual bugs ever found',
              'A ranked list of the ten broad categories of web security risk, refreshed periodically',
              'A tool that scans a site for vulnerabilities',
              'A law that websites must follow',
            ],
            correctIndex: 1,
            explanation:
              'It is a consensus list of ten risk categories, ordered by how often they appear in real applications, updated every few years - not a bug list, tool, or law.',
          },
        ],
      },
      {
        slug: 'owasp-a01-broken-access-control',
        title: 'A01: Broken Access Control',
        summary: 'The number one category. You can reach data or actions that are supposed to be off-limits to you.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Broken access control means the app lets you do or see something your account should not be allowed to. You are logged in as a normal user, but you can read another user\'s invoice, or hit an admin-only button, or change a record that is not yours. It sits at number one because it is the most common category found in real applications, and it is often the easiest to spot.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is almost always the same: the app checks *who you are* (authentication) but forgets to check *what you are allowed to touch* (authorisation). Picture a society gate register. The watchman confirms you live in the building - that is authentication. But if he lets you walk into any flat once you are inside, that is broken access control. The lock on your own door was never the problem; the missing lock on everyone else\'s was.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete example. You open your own invoice and the URL reads `GET /api/invoices/1043`. You change the number to `1044` and the server hands you a stranger\'s invoice - name, amount, address, all of it. The server checked your login cookie and saw a valid user, but never checked whether invoice 1044 belongs to *you*. That specific pattern - swapping an ID to reach another user\'s object - is called IDOR, and it is the single most reported flavour of A01.',
          },
          {
            type: 'paragraph',
            text:
              'Why does this keep happening? The developer wrote a query like "fetch the invoice with this id" and stopped there, because on their screen the number in the URL was always their own - the UI only ever links you to your invoices, so the missing check never shows up in testing. The guard rail they forgot is one extra condition: "fetch the invoice with this id **that also belongs to the logged-in user**." The app trusts the ID in the URL to be honest, and an ID in a URL is the easiest thing in the world to edit.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Swapping an ID in a URL or JSON body (`?id=1043` becomes `1044`)',
              'Reaching an admin page directly by typing its path (`/admin/users`)',
              'Changing a hidden `role=user` field to `role=admin` in a request',
              'Using an API endpoint the UI hides from you but the server still answers',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Do the action as a low-privilege user, then repeat the exact request with another user\'s ID or a higher-privilege path. If the server answers instead of returning 403 Forbidden, access control is broken. Always compare against what a proper 403 looks like on the same app.',
          },
          {
            type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Reading another person\'s data is only research when the target is yours or you have written permission. Otherwise it is a breach, full stop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot the number-one bug category: an app that checks who you are but not what you are allowed to touch.',
          },
          {
            type: 'related_lesson', lessonSlug: 'idor', title: 'Deep dive: IDOR: Changing the Number',
          },
          {
            type: 'quiz',
            question: 'An app checks your login but lets you open /api/invoices/1044 when only 1043 is yours. Which category?',
            options: [
              'A02: Cryptographic Failures',
              'A01: Broken Access Control',
              'A03: Injection',
              'A05: Security Misconfiguration',
            ],
            correctIndex: 1,
            explanation:
              'It authenticated you but failed to authorise the specific object - that missing authorisation check is exactly A01, and this ID-swap flavour is IDOR.',
          },
        ],
      },
      {
        slug: 'owasp-a02-cryptographic-failures',
        title: 'A02: Cryptographic Failures',
        summary: 'Sensitive data left readable - no encryption, weak encryption, or secrets sent in the clear.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Cryptographic failures cover everything that goes wrong when data that should be scrambled is left readable. Passwords stored as plain text, a login form served over plain HTTP, credit card numbers sitting unencrypted in a database - all of it lands here. The old name for this category was "Sensitive Data Exposure", which honestly describes it better: the failure is that a secret ended up in a form anyone could read.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism has two halves. First, *data in transit* - information moving between the browser and the server. If a page uses `http://` instead of `https://`, anyone on the same Wi-Fi can read every field you type, including your password. Encryption in transit is the padlock in your browser bar. Second, *data at rest* - information sitting in storage. A password should never be stored as-is; it should be run through a slow one-way hash so that even if the database leaks, the passwords cannot simply be read off.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. A signup form posts to `http://shop.example/register`. You open your browser DevTools, watch the network request, and see `password=Hunter2025` sitting in the request body in plain text over an unencrypted connection. That is a cryptographic failure twice over: the channel is not encrypted, so the password crosses the network readable, and if the server also stores it as-is, a single database leak hands attackers every account. The fix is HTTPS on the wire and a strong password hash at rest.',
          },
          {
            type: 'paragraph',
            text:
              'Why does a team ship this? Usually nobody chose to expose the password - HTTPS got left off a subdomain, or a "temporary" test page went live, or the storage code saved the raw string because hashing felt like a later problem. The mechanism to get right is boring on purpose: force every page onto `https://`, and store passwords through a slow, salted hash such as bcrypt so that even a stolen database is a pile of unusable gibberish. The tell that hashing was skipped is a leaked login response that echoes the password back, or a "forgot password" flow that emails you your old password in plain text - a site can only do that if it stored it readable.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Login or payment pages served over `http://` instead of `https://`',
              'Passwords stored in plain text or with a fast, crackable hash like MD5',
              'Sensitive tokens sent in a URL, where they land in logs and browser history',
              'A JSON Web Token signed with a weak or guessable secret',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Check whether every sensitive page uses HTTPS, and watch the network tab for secrets travelling in the clear or sitting in a URL. For stored data, look for signs of weak hashing in leaked responses or error messages.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can ask the A02 question of any target: is anything secret being sent or stored in a form someone could just read?',
          },
          {
            type: 'related_lesson', lessonSlug: 'jwt-attacks', title: 'Deep dive: JWT Attacks',
          },
          {
            type: 'quiz',
            question: 'A login form is served over http:// and you can read the password field in the network tab. Which category?',
            options: [
              'A01: Broken Access Control',
              'A02: Cryptographic Failures',
              'A07: Authentication Failures',
              'A09: Logging Failures',
            ],
            correctIndex: 1,
            explanation:
              'Sensitive data crossing the network unencrypted is a cryptographic failure - the data was left readable when it should have been protected.',
          },
        ],
      },
      {
        slug: 'owasp-a03-injection',
        title: 'A03: Injection',
        summary: 'Your input stops being data and starts being commands the app runs for you.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Injection is the whole family of bugs where something you type gets treated as code instead of text. SQL injection, command injection, and their cousins all live here. The app takes your input and stitches it into a query or a command without cleaning it, so the parts you wrote change what the app actually does. It used to sit at number one for years; it is still one of the most dangerous categories because a good injection often means full control.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a mixing problem. The app builds a command by gluing together its own trusted text and your untrusted input into one string, then hands the whole string to something that runs it - a database, a shell, a template engine. That interpreter has no idea which parts came from the developer and which came from you; it just runs the finished string. If your input contains characters that mean something to that interpreter, you can break out of the "data" slot and into the "command" slot.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the classic. A login checks the database with `SELECT * FROM users WHERE name = \'INPUT\'`. You type your username as `admin\' --`. The query the database receives becomes `SELECT * FROM users WHERE name = \'admin\' --\'`. Your quote closed the string early, and `--` starts a SQL comment that kills the rest of the line, so any password check after it is ignored. You just logged in as admin without a password. That is your input escaping the data slot and rewriting the command - the essence of every injection.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SQL injection** - your input rewrites a database query',
              '**Command injection** - your input runs as a shell command on the server',
              '**LDAP / XPath injection** - your input rewrites a directory or XML lookup',
              'The tell: a single quote, semicolon or backtick changes the response or throws a database error',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Put one unusual character - a single quote `\'` - into a field that looks like it feeds a query. A sudden database error, a changed result, or a broken page means your character reached the interpreter, and that is the thread you pull on.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where you are allowed',
            text: 'Injection payloads can corrupt or delete real data. Fire them only at a target you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You understand the root of every injection: your input crossing the line from data into command.',
          },
          {
            type: 'related_lesson', lessonSlug: 'sql-injection', title: 'Deep dive: SQL Injection',
          },
          {
            type: 'quiz',
            question: 'What is the single root cause behind all injection bugs?',
            options: [
              'Weak passwords',
              'User input being treated as code instead of data by an interpreter',
              'Missing HTTPS',
              'Outdated software libraries',
            ],
            correctIndex: 1,
            explanation:
              'Injection happens when untrusted input is mixed into a command or query and an interpreter runs it as code rather than data.',
          },
        ],
      },
      {
        slug: 'owasp-a04-insecure-design',
        title: 'A04: Insecure Design',
        summary: 'The bug is in the plan, not the code. The feature was thought up wrong before anyone typed a line.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Insecure design is the odd category that is not about a coding mistake at all. It is about a feature that was *designed* wrong - the flaw is baked into how the thing is supposed to work, so no amount of careful coding fixes it. This category was added in 2021 to make one point loudly: you cannot patch your way out of a bad idea.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a missing question during planning. When a team designs a feature and never asks "how could someone abuse this?", they build a smooth path for the honest user and no guardrail for the dishonest one. The code can be flawless - every input validated, every query parameterised - and the feature still hands attackers exactly what they want, because the abuse was never considered. Think of a building with a beautiful, sturdy front door and a permanently open side gate the architect simply forgot to draw.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete example. A site lets you reset your password by answering a security question like "what city were you born in?". The code is perfect - it checks the answer correctly every time. But the *design* is broken, because that answer is often public on social media, so anyone can reset anyone\'s password. Compare A03 injection, which is a coding bug you fix in one line, with this: the only real fix is to redesign the reset flow to use an email or SMS code. The problem was in the blueprint, not the bricks.',
          },
          {
            type: 'paragraph',
            text:
              'Here is a second flavour that shows the mechanism clearly: an online shop sends the item price from the browser. The checkout request reads `POST /cart/checkout` with a body of `{"item":"phone","price":54999,"qty":1}`, and the server charges whatever `price` it receives. A developer wired it this way because the browser already knew the price, so re-sending it felt efficient. You edit the body to `"price":1` and pay one rupee for the phone. No input was malformed, no character was injected - the server simply trusted a number it should have looked up itself. That misplaced trust is the design flaw, and you confirm it the moment the order total obeys your edited value instead of the real catalogue price.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Guessable "secret" questions used as the only reset step',
              'A checkout that trusts a price sent by the browser instead of looking it up server-side',
              'No limit on money transfers because "users would not do that"',
              'A flow that assumes users follow steps in order and breaks when they do not',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Stop hunting for a typo in the code and ask what the feature is *for*, then how you would abuse the intended flow. Insecure design is found by thinking like a cheat, not by scanning - a tool almost never flags it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell a coding bug from a design bug - and know that the second kind is fixed on a whiteboard, not in one line.',
          },
          {
            type: 'related_lesson', lessonSlug: 'business-logic-flaws', title: 'Deep dive: Business Logic Flaws',
          },
          {
            type: 'quiz',
            question: 'A password reset uses "your birth city" as the only check, and the code checks it flawlessly. What category?',
            options: [
              'A03: Injection',
              'A04: Insecure Design',
              'A02: Cryptographic Failures',
              'A06: Vulnerable Components',
            ],
            correctIndex: 1,
            explanation:
              'The code is correct; the flaw is in the design of the flow itself, so it is A04 - a problem no code fix can solve.',
          },
        ],
      },
      {
        slug: 'owasp-a05-security-misconfiguration',
        title: 'A05: Security Misconfiguration',
        summary: 'The software is fine. Someone left a setting wrong - a default password, a debug page, an open directory.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Security misconfiguration is when the software itself is fine but someone set it up carelessly. A default admin password nobody changed, a debug mode left on in production, a directory listing that shows every file on the server, an error page that spills the database structure. Nothing here is a code bug - it is a settings bug, and it is everywhere because setting things up securely is boring and easy to skip.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is "shipped as-is". Software often arrives with convenient defaults meant for getting started fast - a sample admin account, verbose errors, extra features switched on. Those defaults are great on your laptop and dangerous on the public internet. When a team deploys without going through and locking each one down, the app runs exactly as the vendor shipped it, and attackers know those defaults by heart. It is like moving into a new flat and never changing the lock the builder used for every unit in the society.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. You visit `http://app.example/uploads/` and instead of an error the server shows a bare list of every file in that folder - backups, spreadsheets, a `config.php`. Directory listing was left enabled, a default setting on some web servers. You did not attack anything; you typed a folder path and the server volunteered its contents. From there you download a backup file and read database credentials out of it. One wrong setting, no exploit required.',
          },
          {
            type: 'command',
            description: 'Ask a server what it reveals about itself - headers and a common config path:',
            commands: [
              'curl -I http://app.example/',
              'curl http://app.example/.env',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command prints only the response headers. A line like `Server: Apache/2.4.29` tells you the exact software and version for free, and an `X-Powered-By: PHP/7.2` line adds the language - both are misconfigurations because a locked-down server hides them. The second command tries to fetch the `.env` file, where apps often keep secrets. If it returns `404 Not Found`, good - the file is not served. If it returns `200` and a body full of `DB_PASSWORD=...` lines, that is a live finding: a config file that should never be reachable is being handed to anyone who asks.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Default or sample credentials left active (`admin` / `admin`)',
              'Directory listing enabled, exposing files not meant to be browsed',
              'Debug or developer mode on in production, printing internals in errors',
              'Admin panels and dashboards reachable from the public internet',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Check common paths and defaults: try the vendor default login, request folders directly, trigger an error and read what it reveals, and look for admin panels left exposed. Most of A05 is discovery, not exploitation.',
          },
          {
            type: 'lab_ref', labSlug: 'http-investigation', title: 'Try it: HTTP Investigation lab',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can hunt the free findings: wrong settings and forgotten defaults that expose a site with no exploit at all.',
          },
          {
            type: 'related_lesson', lessonSlug: 'security-misconfiguration', title: 'Deep dive: Security Misconfiguration',
          },
          {
            type: 'quiz',
            question: 'A server shows a full list of files when you visit /uploads/. Which category, and did you exploit code?',
            options: [
              'A03 Injection, yes you injected a payload',
              'A05 Security Misconfiguration, no - directory listing was left enabled',
              'A01 Broken Access Control, yes you escalated privilege',
              'A02 Cryptographic Failures, no encryption was involved',
            ],
            correctIndex: 1,
            explanation:
              'An enabled directory listing is a wrong setting, not a code flaw - classic A05, found by asking rather than attacking.',
          },
        ],
      },
      {
        slug: 'owasp-a06-vulnerable-components',
        title: 'A06: Vulnerable and Outdated Components',
        summary: 'Your code is fine. A library you pulled in years ago has a known hole, and you inherited it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Modern apps are not written from scratch - they are assembled from hundreds of ready-made pieces: libraries, frameworks, plugins, base images. Vulnerable and outdated components is the category for when one of those borrowed pieces has a publicly known security hole and nobody updated it. Your own code can be spotless and the app still be wide open, because the weak spot came pre-installed.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is inherited risk. When a widely used library has a flaw, it gets a public writeup and a fix in a newer version. Every app still running the old version is now a known target - attackers do not have to discover anything, they just check which version you run and reuse the published attack. It is like a specific model of lock being shown on the news to open with a paperclip. The lock on your door is not special; the whole model is now trivial, and everyone who bought it is exposed until they swap it.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. A site runs a content system whose version is printed right in the page source: `<meta name="generator" content="ExampleCMS 4.1.2">`. You look up that version, find it has a documented flaw fixed in 4.1.5, and the published details tell you exactly which request triggers it. You never had to find a bug - the component announced its own version, and the internet already knew its weakness. The fix is not clever code; it is running the update.',
          },
          {
            type: 'command',
            description: 'Pull the version tells straight out of a page:',
            commands: ['curl -s http://app.example/ | grep -i "generator\\|jquery\\|bootstrap"'],
          },
          {
            type: 'paragraph',
            text:
              'This grabs the page and shows only the lines that name a component. A hit like `content="ExampleCMS 4.1.2"` or a script tag loading `jquery-1.8.3.min.js` is your answer: you now know a piece and its exact version. An old version number is not proof of a bug by itself - the next step is to check whether that specific version has a public advisory. If it does, the advisory usually spells out the vulnerable request, so your job shrinks to matching a version string to a known issue rather than discovering anything new.',
          },
          {
            type: 'paragraph',
            text:
              'Why is this so common? Nobody sets out to run a vulnerable library. A team pulls in a package that works, ships the product, and moves on - updating a dependency later can break things, so it quietly stays on the version from launch day. Years pass, a flaw in that version becomes public, and the app is now a documented target without a single line of its own code changing. The moving part that failed is not code, it is maintenance: no one owned the job of watching for and applying updates.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Version numbers leaked in page source, headers, or `/version` style endpoints',
              'Old JavaScript libraries loaded in the browser with known issues',
              'Outdated server software announced in a `Server:` response header',
              'Dependencies nobody has updated since the project started',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Fingerprint versions from headers, HTML comments, and JavaScript filenames, then check whether that exact version has a public advisory. The bug is not yours to find - it is already documented; you are matching a version to a known issue.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know to check what a site is built from, because a borrowed component with a known hole is a bug you inherit for free.',
          },
          {
            type: 'related_lesson', lessonSlug: 'information-disclosure', title: 'Related: Information Disclosure',
          },
          {
            type: 'quiz',
            question: 'The page source shows "ExampleCMS 4.1.2" and that version has a public advisory. Which category?',
            options: [
              'A04: Insecure Design',
              'A06: Vulnerable and Outdated Components',
              'A01: Broken Access Control',
              'A03: Injection',
            ],
            correctIndex: 1,
            explanation:
              'Running a component with a publicly known flaw is A06 - the weakness is inherited from the outdated piece, not written by you.',
          },
        ],
      },
      {
        slug: 'owasp-a07-auth-failures',
        title: 'A07: Identification and Authentication Failures',
        summary: 'The lock on the front door is weak - guessable passwords, no lockout, sessions that never die.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'This category covers everything that goes wrong with proving who you are. Weak passwords allowed, no limit on guesses, session tokens that never expire, "remember me" that never forgets, no protection against someone trying a million passwords. If A01 is about doing things you should not once you are in, A07 is about getting in when you should not be able to at all.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a login that does not defend itself. A well-built login treats every attempt as suspicious: it slows down or locks after a handful of wrong guesses, it demands a strong password, it expires your session after a while, and it ties the session token to you so a stolen one is useless. A failing login skips these. The classic version is no rate limiting - the server happily accepts thousands of guesses per minute, so an attacker with a list of common passwords just tries them all until one sticks.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. A login at `/login` accepts `POST username=admin&password=...`. You send 5,000 guesses from a common-password list and the server answers every single one with "wrong password" - no delay, no lockout, no captcha. On guess 812 it returns "welcome". Nothing stopped you, because the login had no defence against volume. That is A07: the authentication existed, but it was too weak to do its job. The same category covers a session token that stays valid for months after logout.',
          },
          {
            type: 'paragraph',
            text:
              'Two details make this real. First, how you *confirm* there is no defence: watch the response to attempt 1 and attempt 500. If both come back with the same status (say `200`), the same body length, and the same speed, nothing is rate-limiting you - a defended login would start returning `429 Too Many Requests`, a captcha, or a growing delay. The sameness is the finding. Second, the mechanism behind the worst version, credential stuffing: attackers take username-password pairs leaked from some *other* breached site and replay them here, betting that people reuse passwords. They are not guessing blindly - they already have real passwords, just from a different door, and a login with no rate limit lets them try every one.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'No lockout or rate limit, so unlimited password guessing works',
              'Weak password rules that allow `123456` or `password`',
              'Session tokens that do not expire or survive after logout',
              'Multi-factor authentication that can be skipped or bypassed',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Send many wrong logins in a row and watch for any slowdown, lockout, or captcha. If the hundredth wrong attempt behaves exactly like the first, there is no brute-force defence - that is the finding.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Never on a real account',
            text: 'Guessing passwords against a login you do not own or are not authorised to test is a crime, no matter how weak the login is. Stay on your own targets.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can judge a login the way an attacker does: does it fight back when someone hammers it, or roll over?',
          },
          {
            type: 'related_lesson', lessonSlug: 'password-attacks-and-brute-force', title: 'Deep dive: Password Attacks',
          },
          {
            type: 'quiz',
            question: 'A login accepts thousands of password guesses with no delay or lockout. Which category?',
            options: [
              'A05: Security Misconfiguration',
              'A07: Identification and Authentication Failures',
              'A02: Cryptographic Failures',
              'A10: SSRF',
            ],
            correctIndex: 1,
            explanation:
              'A login with no brute-force defence is an authentication failure - the mechanism to prove identity is too weak to resist guessing.',
          },
        ],
      },
      {
        slug: 'owasp-a08-integrity-failures',
        title: 'A08: Software and Data Integrity Failures',
        summary: 'The app trusts code or data it did not verify - an update, a plugin, or a saved object it blindly rebuilds.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Integrity failures happen when an app accepts code or data without checking it has not been tampered with. It downloads an update and runs it without verifying who signed it. It pulls a plugin from a source it does not control. It takes a saved object from the user and rebuilds it in memory, trusting whatever was inside. The common thread: the app assumed something was genuine when it never actually checked.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is missing verification of origin. Signing and integrity checks exist so software can prove "this update really came from us and was not changed on the way". Skip that check and an attacker who can slip into the delivery path - a compromised update server, a poisoned dependency, a middleman on the network - can hand your app malicious code that it runs as if it were trusted. A big slice of this category is *insecure deserialization*: the app takes a serialised object the user sent, rebuilds it, and in doing so runs logic the attacker packed inside.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. An app stores your preferences as a serialised object in a cookie and rebuilds that object on every request. You decode the cookie, see it is a serialised structure, and craft a modified version that, when the server rebuilds it, triggers code the app did not intend to run. The server trusted the cookie because it came back looking normal - but "it came back" is not the same as "we verified it". That blind rebuild of attacker-controlled data is the heart of A08.',
          },
          {
            type: 'paragraph',
            text:
              'Make that concrete. Say the cookie reads `prefs=eyJ0aGVtZSI6ImRhcmsiLCJyb2xlIjoidXNlciJ9`. That is base64; decode it and you get `{"theme":"dark","role":"user"}`. The app happily rebuilds whatever is inside, so you re-encode `{"theme":"dark","role":"admin"}`, paste it back, and the server treats you as an admin because it never checked the cookie was the one it issued. The moving part the developer got wrong: they used the round-tripped cookie as a convenient place to *store* state, forgetting that anything the client can send back, the client can also change. A signed token would have caught the edit; a plain serialised blob does not.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Updates or plugins installed without a signature check',
              'Serialised objects accepted from the user and rebuilt without validation',
              'A build pipeline pulling dependencies from an untrusted source',
              'Client-side code loaded from a third party with no integrity attribute',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Look for serialised blobs in cookies, tokens, and hidden fields - odd base64 that decodes to a structured object is the tell. Then ask whether the server validates it or just trusts and rebuilds it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Tampering with serialised data can execute code on the server. Only attempt it where you own the system or hold written permission.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot the trust-without-checking pattern: an app that rebuilds or runs data it never verified came from a safe source.',
          },
          {
            type: 'related_lesson', lessonSlug: 'insecure-deserialization', title: 'Deep dive: Insecure Deserialization',
          },
          {
            type: 'quiz',
            question: 'An app rebuilds a serialised object from a user-supplied cookie without validating it. Which category?',
            options: [
              'A08: Software and Data Integrity Failures',
              'A01: Broken Access Control',
              'A09: Logging Failures',
              'A02: Cryptographic Failures',
            ],
            correctIndex: 0,
            explanation:
              'Trusting and rebuilding unverified data is an integrity failure - insecure deserialization is the classic A08 example.',
          },
        ],
      },
      {
        slug: 'owasp-a09-logging-failures',
        title: 'A09: Security Logging and Monitoring Failures',
        summary: 'When something bad happens and nobody notices, because nothing was written down or watched.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'This category is about the alarm that never went off. An app can be attacked - thousands of failed logins, a user reaching data that is not theirs - and if nobody logged it or nobody was watching the logs, the attacker moves freely for weeks. Logging and monitoring failures do not open the door themselves; they let whoever came through the door roam undetected.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is missing evidence and missing eyes. Good logging records the security-relevant events - logins, failures, access-denied, high-value actions - with enough detail to reconstruct what happened. Good monitoring means someone or something actually reads those logs and raises an alarm when the pattern looks wrong. A09 is failing either half: no logs, useless logs, or logs nobody ever looks at. Think of a society gate register that the watchman never fills in - when a theft happens, there is simply no record of who came and went.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. An attacker runs 10,000 failed logins against `/login` over an hour. On a healthy system that spike triggers an alert and the account or IP gets throttled. On a failing one, the attempts are either not logged at all or logged into a file nobody reads, so no alert fires and the brute force runs to completion unnoticed. The direct bug might be the weak login (A07), but the reason it succeeded quietly is A09 - nothing was watching.',
          },
          {
            type: 'paragraph',
            text:
              'What separates a useful log from a useless one is detail. A useful line reads `2026-02-14 09:12:03 LOGIN_FAIL user=admin ip=203.0.113.9 attempt=812` - it has a timestamp, the account, the source, and a count, so a person or a rule can see 812 failures from one IP and react. A useless line reads `error: login failed` with no who, no where, no when. During an investigation the first tells you the story; the second tells you nothing. Monitoring is the second half: even a perfect log is worthless if no rule ever counts those failures and raises a flag. A09 is failing at either step - not recording the event, recording it uselessly, or recording it well and never looking.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Failed logins and access-denied events that are never recorded',
              'Logs that exist but contain no useful detail (no user, no timestamp, no IP)',
              'No alerting, so a clear attack pattern raises nothing',
              'Logs that record sensitive data like passwords, becoming a leak of their own',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The category you rarely report alone',
            text:
              'As an outside tester you usually cannot see whether logging exists, so A09 is mostly a defender-side finding. Where you can show it - an action that clearly should alert but produces no visible response - note it as a contributing weakness.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You understand why silent detection matters: an attack nobody records is an attack nobody can stop or investigate.',
          },
          {
            type: 'quiz',
            question: 'Why do logging and monitoring failures make other attacks worse?',
            options: [
              'They encrypt the attacker\'s traffic',
              'They let an attack go unnoticed, so it runs longer and is never investigated',
              'They give the attacker admin rights directly',
              'They inject code into the database',
            ],
            correctIndex: 1,
            explanation:
              'A09 does not grant access; it removes detection, so an ongoing attack continues unseen and unexamined.',
          },
        ],
      },
      {
        slug: 'owasp-a10-ssrf',
        title: 'A10: Server-Side Request Forgery (SSRF)',
        summary: 'You make the server fetch a URL for you, and point it somewhere it should never go.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'SSRF is the trick where you get the *server* to make a web request on your behalf, then aim that request at somewhere you could never reach yourself. Many apps fetch URLs for you - loading an image from a link you paste, checking a webhook, generating a preview. If you control the URL and the app does not restrict it, you can point the server at its own private network.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism turns the server into your proxy. You sit outside, on the public internet. The server sits inside, on a private network full of internal services, admin panels, and cloud metadata that never face the outside world. When the app fetches a URL you supply, it does so from *inside* - so a request that would be blocked from your machine sails through from the server. You are borrowing the server\'s network position, like convincing the office peon to walk into a locked records room and read a file out to you.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the famous example. A "fetch preview" feature takes `POST url=https://example.com/logo.png` and returns whatever it downloads. You change it to `url=http://169.254.169.254/latest/meta-data/`. That address is the cloud metadata endpoint - reachable only from inside the cloud instance, and it can hand out credentials for the server itself. The app dutifully fetches it and returns the response to you. You never touched the internal network directly; the server did it for you. That is SSRF at its most dangerous.',
          },
          {
            type: 'paragraph',
            text:
              'Why does the feature exist at all? Because fetching a URL for the user is genuinely useful - link previews, image imports, webhook checks all need the server to go get something. The developer built exactly that and assumed the URL would always be a normal public link. The moving part they missed is a check on *where* the URL points: an allowlist of permitted hosts, and a block on internal ranges like `169.254.x.x`, `127.0.0.1`, and `10.x.x.x`. Without it, "fetch this URL" quietly becomes "fetch anything I can reach, including your own back yard".',
          },
          {
            type: 'paragraph',
            text:
              'Confirming it is cleaner than it sounds. Before you aim anywhere sensitive, prove the server actually makes the request: put in a URL pointing at a listener you control, such as `http://your-collaborator.example/ping`, and watch your listener. If a hit arrives *from the target server\'s IP* rather than your own, the server is fetching your URLs - SSRF is confirmed. Only then, and only in scope, do you try internal addresses. That out-of-band ping is the difference between suspecting SSRF and proving it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Any feature that fetches a URL you provide (webhooks, previews, imports)',
              'The cloud metadata address `169.254.169.254`, a prime SSRF target',
              'Internal-only hosts and admin panels not exposed to the internet',
              'Bypasses using redirects, alternate IP formats, or DNS tricks when a blacklist is present',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'How you test it',
            text:
              'Point a URL field at a server you control and watch whether the target server connects to it - that confirms the server is fetching your URL. If it connects, try internal addresses next, carefully and only in scope.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only within your scope',
            text: 'SSRF can reach a target\'s crown jewels. Aim it only at systems you own or are authorised to test, and never at unrelated third parties.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot the SSRF setup: a feature that fetches a URL you control, waiting to be pointed inward.',
          },
          {
            type: 'related_lesson', lessonSlug: 'ssrf', title: 'Deep dive: SSRF: Making the Server Fetch',
          },
          {
            type: 'quiz',
            question: 'A preview feature fetches any URL you paste. You send it 169.254.169.254. What are you attempting?',
            options: [
              'SQL injection',
              'SSRF - making the server request an internal address you cannot reach directly',
              'Cross-site scripting',
              'A brute-force attack',
            ],
            correctIndex: 1,
            explanation:
              'Getting the server to fetch an internal-only address like the cloud metadata endpoint is textbook SSRF - A10.',
          },
        ],
      },
      {
        slug: 'owasp-api-top-10',
        title: 'The API Security Top 10',
        summary: 'APIs have their own separate list, because the bugs that hurt an API are not the ones that hurt a web page.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The main OWASP Top 10 was written with web pages in mind. But so much of the world now runs on APIs - the machine-to-machine endpoints your mobile app and JavaScript talk to - that OWASP publishes a *separate* API Security Top 10. The categories overlap in spirit but not in emphasis: APIs get attacked in ways a rendered web page usually does not, and this list captures those.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism behind most of it is that an API is a raw door to data, with no friendly UI hiding the sharp edges. A web page might only show you a button for actions you are allowed to take; an API just exposes `GET /api/users/1043` and trusts the caller to behave. So the headline API bug is BOLA - Broken Object Level Authorization - which is the API version of IDOR: you swap the object ID and the API hands you someone else\'s object because it checked your login but not your ownership. Right beside it sits BFLA - Broken Function Level Authorization - where you call an admin-only *function* the mobile app never shows you, and the API runs it anyway.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one example. A banking app shows your own transactions. You capture its traffic and see `GET /api/v1/accounts/50021/transactions`. You change `50021` to `50022` and the API returns another customer\'s transactions - BOLA, the most reported API bug there is. The reason it is number one on the API list rather than buried is that APIs expose object IDs everywhere and authorisation checks per object are the easiest thing for a busy team to forget.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**BOLA** - swap an object ID, get another user\'s object (the API IDOR)',
              '**Broken Authentication** - weak or missing checks on who is calling',
              '**Broken Object Property Level Authorization** - reading or writing fields you should not, including mass assignment',
              '**Unrestricted Resource Consumption** - no limits, so you can exhaust or overcharge the service',
              '**BFLA** - calling admin functions your role should not reach',
              '**Unrestricted Access to Sensitive Business Flows** - abusing a legit flow at scale (bulk buying, spam)',
              '**SSRF** - same server-side fetch abuse, common in API integrations',
              '**Security Misconfiguration** - wrong settings, same idea as the web list',
              '**Improper Inventory Management** - forgotten old versions like `/api/v1` left running',
              '**Unsafe Consumption of APIs** - trusting data from a third-party API you call',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Why a separate list',
            text:
              'Notice how many API entries are authorisation bugs (BOLA, BFLA, property-level). APIs expose objects and functions directly, so "who is allowed to touch this exact thing" is where they break most - which is why they earned their own top 10.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test only what is yours',
            text: 'Reading another customer\'s API data is a real breach unless the target is yours or in an authorised scope. Confirm scope before you swap a single ID.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know APIs carry their own top 10, and that its centre of gravity is authorisation - BOLA and BFLA above all.',
          },
          {
            type: 'related_lesson', lessonSlug: 'idor', title: 'Related: IDOR (the web cousin of BOLA)',
          },
          {
            type: 'related_lesson', lessonSlug: 'oauth-misconfigurations', title: 'Related: OAuth Misconfigurations',
          },
          {
            type: 'practice_ref', title: 'The OWASP Top 10 check', exerciseSlug: 'owasp-top-10-quiz',
          },
          {
            type: 'quiz',
            question: 'What is BOLA, the top API security risk?',
            options: [
              'Injecting SQL into an API parameter',
              'Swapping an object ID to access another user\'s object because ownership is not checked',
              'Serving the API over plain HTTP',
              'Leaving an old API version running',
            ],
            correctIndex: 1,
            explanation:
              'BOLA (Broken Object Level Authorization) is the API version of IDOR: the API verifies your login but not that the object belongs to you.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'owasp-api-top-10',
    slug: 'owasp-top-10-quiz',
    title: 'The OWASP Top 10 check',
    instructions: 'Six quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'The OWASP Top 10 is best described as:',
        options: [
          'A scanner that finds bugs automatically',
          'A ranked list of the ten broad categories of web risk, refreshed periodically',
          'A legal standard websites must pass',
          'The ten worst individual bugs ever discovered',
        ],
        correctIndex: 1,
        explanation: 'It is a consensus list of ten risk categories ordered by how common they are, not a tool, law, or bug list.',
      },
      {
        prompt: 'You change /api/invoices/1043 to 1044 and get a stranger\'s invoice. Which category?',
        options: ['A02 Cryptographic Failures', 'A01 Broken Access Control', 'A05 Security Misconfiguration', 'A09 Logging Failures'],
        correctIndex: 1,
        explanation: 'The app authenticated you but failed to authorise the specific object - A01, and this ID-swap flavour is IDOR.',
      },
      {
        prompt: 'A single quote in a form field throws a database error. This points at:',
        options: ['A07 Authentication Failures', 'A03 Injection', 'A10 SSRF', 'A04 Insecure Design'],
        correctIndex: 1,
        explanation: 'Your character reaching the database interpreter and breaking its query is the signature of injection.',
      },
      {
        prompt: 'A password reset uses "your birth city" and the code checks it flawlessly. Which category?',
        options: ['A04 Insecure Design', 'A03 Injection', 'A06 Vulnerable Components', 'A02 Cryptographic Failures'],
        correctIndex: 0,
        explanation: 'The code is correct; the flow itself is designed insecurely, so no code fix solves it - A04.',
      },
      {
        prompt: 'You get a preview feature to fetch http://169.254.169.254/. What is the category?',
        options: ['A03 Injection', 'A10 SSRF', 'A01 Broken Access Control', 'A08 Integrity Failures'],
        correctIndex: 1,
        explanation: 'Making the server fetch an internal-only address like the cloud metadata endpoint is SSRF - A10.',
      },
      {
        prompt: 'On the API list, what is BOLA?',
        options: [
          'Serving the API over plain HTTP',
          'The API version of IDOR - swapping an object ID because ownership is not checked',
          'A brute-force attack on the API login',
          'An outdated API version left running',
        ],
        correctIndex: 1,
        explanation: 'BOLA (Broken Object Level Authorization) checks your login but not whether the object is yours - the top API risk.',
      },
    ],
  },
];



