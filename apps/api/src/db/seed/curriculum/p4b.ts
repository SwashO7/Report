import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'xss',
    title: 'Cross-Site Scripting',
    description: 'Get your JavaScript running in someone else\'s browser, and learn how sites try to stop you.',
    lessons: [
      {
        slug: 'xss-cross-site-scripting',
        title: 'XSS: The Big Picture',
        summary: 'You get the site to run your JavaScript in another user\'s browser. That is the whole game.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('XSS explained - how your JavaScript ends up running in someone else\'s browser'),
          {
            type: 'image',
            src: '/api/v1/diagrams/xss-types',
            alt: 'Reflected, stored and DOM XSS compared by where the payload lives',
            caption: 'Same root cause, three delivery routes.',
          },
          {
            type: 'paragraph',
            text:
              'XSS is when a site takes your input and prints it back onto a page without cleaning it, so the browser runs it as code. Your script then executes with all the trust the site has - same cookies, same session, same permissions as the victim.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a review box that shows your comment to everyone. If you type `<script>alert(1)</script>` and it renders instead of showing as text, every visitor just ran your code. Now imagine that code stole their session instead of popping an alert.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Reflected** - your input bounces straight back in the response',
              '**Stored** - your input is saved and served to other users later',
              '**DOM-based** - the page\'s own JavaScript writes your input into the page',
            ],
          },
          {
            type: 'code',
            language: 'html',
            filename: 'the-classic-test',
            code: '<script>alert(document.domain)</script>',
          },
          {
            type: 'paragraph',
            text:
              'Why `document.domain` and not `alert(1)`? Because it proves *which* site is running your code - clean evidence for a report, and it works even when the app frames content from elsewhere.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'It is a trust bug',
            text:
              'The browser cannot tell your injected script from the site\'s real script. That is exactly why XSS is so powerful - your code inherits every bit of the victim\'s trust.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test XSS on systems you own or are authorised to test. Popping an alert on a live site you do not own is still an attack.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know what XSS is - running your code in a victim\'s browser - and the three flavours it comes in.',
          },
          {
            type: 'quiz',
            question: 'What does an XSS vulnerability let an attacker do?',
            options: [
              'Read files off the server\'s hard drive',
              'Run their own JavaScript in another user\'s browser',
              'Crash the database',
              'Bypass the login page directly',
            ],
            correctIndex: 1,
            explanation:
              'XSS runs attacker-controlled JavaScript in a victim\'s browser, inheriting that user\'s session and trust.',
          },
        ],
      },
      {
        slug: 'reflected-vs-stored-xss',
        title: 'Reflected vs Stored XSS',
        summary: 'One fires only when you trick someone into clicking your link. The other waits, saved, for every visitor.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Reflected vs stored XSS - the difference that changes everything'),
          {
            type: 'paragraph',
            text:
              'Both run your script in a victim\'s browser, but they get there differently - and that difference decides how bad the bug is and how you exploit it.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Reflected: you need a click',
          },
          {
            type: 'paragraph',
            text:
              'Your payload lives in the URL or a form, gets echoed straight back in the response, and runs. Nothing is saved, so you have to deliver the malicious link to the victim yourself - usually by getting them to click it.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'reflected-example',
            code: 'https://shop.example/search?q=<script>alert(document.domain)</script>',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Stored: it waits for them',
          },
          {
            type: 'paragraph',
            text:
              'Your payload is saved on the server - a comment, a profile bio, a support ticket - and served to everyone who views that page. No link to send. It fires on its own for every visitor, which is why stored XSS usually scores higher.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Reflected** - short-lived, needs social engineering, one victim per click',
              '**Stored** - persistent, self-spreading, hits everyone who loads the page',
              'Test spots for stored: comments, usernames, bios, chat, filenames, ticket subjects',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Check every output, not just the obvious one',
            text:
              'Input entered in one place often shows up somewhere else - a username set at signup that appears in an admin panel. Follow where your data lands.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only plant test payloads on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can tell reflected from stored XSS and explain why stored usually hits harder.',
          },
          {
            type: 'quiz',
            question: 'Why is stored XSS usually more severe than reflected XSS?',
            options: [
              'It is harder for defenders to detect',
              'It is saved and served to every visitor without needing them to click a crafted link',
              'It works on more browsers',
              'It can read server files',
            ],
            correctIndex: 1,
            explanation:
              'Stored XSS persists and runs for anyone who views the page, so it does not depend on tricking each victim into a click.',
          },
        ],
      },
      {
        slug: 'dom-xss',
        title: 'DOM XSS',
        summary: 'Sometimes the server is innocent. The page\'s own JavaScript takes your input and writes it into the page.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('DOM XSS - when the bug never touches the server'),
          {
            type: 'paragraph',
            text:
              'In DOM XSS the payload never has to reach the server. The page\'s own JavaScript reads something you control - the URL, the hash, a query value - and writes it into the page unsafely. The vulnerability lives entirely in the client-side code.',
          },
          {
            type: 'paragraph',
            text:
              'The key idea is source and sink. A **source** is where attacker input enters (like `location.hash`). A **sink** is a dangerous function that turns a string into live content (like `innerHTML`). Input flowing from a source to a sink with no cleaning is DOM XSS.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'vulnerable-code',
            code: '// Reads the part after # and drops it straight into the page\nconst name = decodeURIComponent(location.hash.slice(1));\ndocument.getElementById(\'greeting\').innerHTML = \'Hi \' + name;',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Common sources** - `location.href`, `location.hash`, `location.search`, `document.referrer`',
              '**Dangerous sinks** - `innerHTML`, `document.write`, `eval`, `setTimeout(string)`',
              'Payload example in the hash: `#<img src=x onerror=alert(document.domain)>`',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the JavaScript, not just the response',
            text:
              'DOM XSS will not show up when you view the raw HTML response, because the injection happens in the browser. Use DevTools and search the JS for sinks like `innerHTML`.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test DOM XSS on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can trace input from a source to a dangerous sink - the mindset behind every DOM XSS find.',
          },
          {
            type: 'quiz',
            question: 'What makes DOM XSS different from reflected XSS?',
            options: [
              'It only works on old browsers',
              'The injection happens in the page\'s own JavaScript, often without the server ever seeing the payload',
              'It requires a saved database entry',
              'It cannot steal cookies',
            ],
            correctIndex: 1,
            explanation:
              'DOM XSS is caused by client-side JavaScript writing a source into a sink unsafely. The payload may never reach the server.',
          },
        ],
      },
      {
        slug: 'xss-payloads-and-filters',
        title: 'Payloads and Filter Bypasses',
        summary: 'Alert boxes are cute. Real payloads steal sessions, and real filters try to stop them - badly.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('XSS payloads and filter bypasses - past the naive blocklist'),
          {
            type: 'paragraph',
            text:
              'Once you confirm XSS, you move past `alert(1)` to something that proves real impact. And most sites do not fix XSS properly - they slap on a filter that blocks the word "script" and call it done. Filters like that break in about five minutes.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Payloads that do not need the word script',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`<img src=x onerror=alert(document.domain)>` - event handler, no `<script>`',
              '`<svg onload=alert(document.domain)>` - fires on load',
              '`<body onpageshow=alert(document.domain)>` - another handler route',
              '`"><img src=x onerror=alert(1)>` - break out of an attribute first',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'How weak filters get bypassed',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Case** - `<ScRiPt>` beats a filter that only matches lowercase',
              '**Broken tags** - `<scr<script>ipt>` where the filter strips one copy of `script`',
              '**Encoding** - HTML entities or URL-encoding to slip past a naive string match',
              '**Alternate events** - if `onerror` is blocked, try `onload`, `onmouseover`, `onfocus autofocus`',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For real proof of impact, a payload that reads `document.cookie` and sends it to a server you control shows the session can be stolen - far more convincing in a report than a popup.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Context is everything',
            text:
              'The same input needs a different payload depending on where it lands - inside an HTML tag, an attribute, a `<script>` block, or a URL. Always look at the surrounding HTML before crafting the payload.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only fire these payloads at systems you own or are authorised to test, and never exfiltrate a real user\'s cookies outside an authorised test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can write XSS payloads that dodge naive filters and prove real impact instead of a plain alert.',
          },
          {
            type: 'quiz',
            question: 'A site blocks the string "script" but reflects your input into the page. What is the smart next move?',
            options: [
              'Give up, the site is secure',
              'Use an event-handler payload like <img src=x onerror=...> that needs no <script> tag',
              'Try the same payload again unchanged',
              'Report it as unexploitable',
            ],
            correctIndex: 1,
            explanation:
              'Blocking the word "script" ignores event handlers. Payloads like <img src=x onerror=...> run JavaScript with no <script> tag at all.',
          },
        ],
      },
      {
        slug: 'csp-and-xss-defense',
        title: 'CSP and Defending Against XSS',
        summary: 'The real fix is not a blocklist. It is output encoding, plus a Content Security Policy as a safety net.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('CSP and stopping XSS properly - encoding first, policy second'),
          {
            type: 'paragraph',
            text:
              'You cannot blocklist your way out of XSS - attackers have more payloads than you have filters. The real defence is treating all user input as text on the way out, and adding a Content Security Policy as a backup that limits what runs even if something slips through.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The primary fix: context-aware output encoding',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Encode user data for the exact context it lands in - HTML body, attribute, JS, or URL',
              'In HTML, turn `<` into `&lt;` so it displays instead of running',
              'Use framework escaping (React, template engines) instead of hand-rolling it',
              'Avoid dangerous sinks like `innerHTML`; prefer `textContent`',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'The safety net: Content Security Policy',
          },
          {
            type: 'paragraph',
            text:
              'CSP is a response header that tells the browser which sources of script are allowed. A good policy blocks inline scripts, so even an injected `<script>` simply refuses to run.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'response-header',
            code: 'Content-Security-Policy: default-src \'self\'; script-src \'self\'',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'CSP is not the fix by itself',
            text:
              'A CSP with `unsafe-inline` or a wildcard source is basically decorative. And CSP is a second layer - encoding is still the primary defence, not the header.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know XSS is fixed with context-aware output encoding, with CSP as a safety net - not with a word blocklist.',
          },
          {
            type: 'quiz',
            question: 'What is the primary, correct fix for XSS?',
            options: [
              'Block the word "script" in all inputs',
              'Context-aware output encoding so user input is treated as text, not code',
              'Rely entirely on a Content Security Policy',
              'Disable JavaScript on the site',
            ],
            correctIndex: 1,
            explanation:
              'Encoding output for its context stops input from being interpreted as code. CSP is a valuable second layer, not the main fix.',
          },
        ],
      },
    ],
  },
  {
    slug: 'broken-access-control',
    title: 'Broken Access Control',
    description: 'The bug class that pays the most - reaching data and actions that should not be yours.',
    lessons: [
      {
        slug: 'access-control-basics',
        title: 'Access Control Basics',
        summary: 'Authentication asks who you are. Access control decides what you are allowed to touch. Getting it wrong is the top bug class.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Access control basics - the most valuable bug class, explained'),
          {
            type: 'paragraph',
            text:
              'Logging in proves who you are. Access control is the separate check that decides what you can see and do once you are in. When that check is missing or wrong, a normal user reaches another user\'s data or an admin-only action. That is broken access control, and it consistently pays the most in bug bounties.',
          },
          {
            type: 'paragraph',
            text:
              'Picture a hotel. Your keycard proves you are a guest (authentication). It should only open your own room (access control). A door that opens for any keycard is the bug - and it is embarrassingly common.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Vertical** - a normal user does something only an admin should (delete users, change roles)',
              '**Horizontal** - you reach another user\'s data at your own privilege level (their orders, their messages)',
              '**Context-dependent** - doing a valid step at the wrong time, like editing an order after it shipped',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The golden rule',
            text:
              'Every access check must happen on the server, on every request. A hidden button or a disabled field is not a control - the server has to say no.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only probe access controls on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell authentication from access control, and name vertical vs horizontal privilege problems.',
          },
          {
            type: 'quiz',
            question: 'A logged-in normal user can call an endpoint that deletes any account. What kind of flaw is this?',
            options: [
              'Horizontal privilege issue',
              'Vertical privilege escalation - a user reaching an admin-only action',
              'An authentication bug',
              'A network misconfiguration',
            ],
            correctIndex: 1,
            explanation:
              'Reaching an action reserved for a higher role (admin) is vertical privilege escalation, a broken access control flaw.',
          },
        ],
      },
      {
        slug: 'idor',
        title: 'IDOR: Changing the Number',
        summary: 'Change the id in the request, get someone else\'s data. Simple, common, and it pays.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('IDOR explained - change one number, read someone else\'s data'),
          {
            type: 'image',
            src: '/api/v1/diagrams/idor-flow',
            alt: 'Same user requesting their own record and then another user record',
            caption: 'One number changed. The missing check is the finding.',
          },
          {
            type: 'paragraph',
            text:
              'IDOR (Insecure Direct Object Reference) is the classic access-control bug: the app trusts an id you send and hands back the matching object without checking it belongs to you. Change `id=1024` to `id=1025` and if you see a stranger\'s invoice, that is IDOR.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How to find one',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Log in and do something normal - open your own order, invoice or profile',
              'Watch the request in Burp; note the id in the URL, body or a parameter',
              'Send it to Repeater and change the id to a neighbouring value',
              'If you get back data that is not yours, you have an IDOR',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'the-tell',
            code: 'GET /api/invoices/1024   -> your invoice (200)\nGET /api/invoices/1025   -> someone else\'s invoice (200)  <-- IDOR',
          },
          {
            type: 'paragraph',
            text:
              'It is not only reads. The same missing check on a `POST` or `DELETE` lets you edit or delete other people\'s objects. And ids are not always sequential - watch for them in cookies, hidden fields, and JSON bodies too.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'UUIDs are not a fix',
            text:
              'Swapping numeric ids for random UUIDs just makes them harder to guess - it does not add an ownership check. If a UUID leaks anywhere, the IDOR is still there.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test IDOR on systems you own or are authorised to test. Pulling a real person\'s records without authorisation is a data breach.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot an object id in a request, tamper it, and confirm an IDOR end to end.',
          },
          { type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab' },
          {
            type: 'quiz',
            question: 'You change invoiceId=1024 to 1025 and see another customer\'s invoice. What is the root cause?',
            options: [
              'A weak password policy',
              'The server does not check that the requested object belongs to you',
              'Missing HTTPS',
              'A cross-site scripting flaw',
            ],
            correctIndex: 1,
            explanation:
              'IDOR happens because the server trusts the id without verifying ownership. The fix is a server-side ownership check on every access.',
          },
        ],
      },
      {
        slug: 'path-traversal',
        title: 'Path Traversal',
        summary: 'Feed the app ../ and walk out of the folder it meant to keep you in - straight to files it never meant to serve.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Path traversal - escaping the folder with dot dot slash'),
          {
            type: 'paragraph',
            text:
              'When an app builds a file path from your input - `?file=report.pdf` - and does not clean it, you can add `../` to climb out of the intended folder and reach files elsewhere on the server. That is path traversal, also called directory traversal.',
          },
          {
            type: 'paragraph',
            text:
              'Each `../` means "go up one folder". Chain enough of them and you reach the root, then walk back down to something sensitive like the password file or a config with database credentials.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'the-payload',
            code: 'Normal:    GET /download?file=report.pdf\nTraversal: GET /download?file=../../../../etc/passwd',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Linux target** - `../../../../etc/passwd` is the classic proof file',
              '**Windows target** - `..\\..\\..\\windows\\win.ini`',
              '**Encoded** - `%2e%2e%2f` if the app naively strips literal `../`',
              '**Juicy targets** - app config, `.env` files, source code, SSH keys',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Filters get bypassed',
            text:
              'Stripping `../` once is not enough - `....//` collapses back to `../` after the strip. URL-encoding and double-encoding beat naive filters too.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only attempt path traversal on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can recognise a file-path parameter and test it for traversal out of its intended folder.',
          },
          {
            type: 'quiz',
            question: 'What does the sequence ../ do in a path traversal attack?',
            options: [
              'Encrypts the file being requested',
              'Moves up one directory, letting you escape the intended folder',
              'Deletes the current directory',
              'Renames the requested file',
            ],
            correctIndex: 1,
            explanation:
              '../ steps up a directory. Chaining it lets an attacker climb out of the allowed folder to reach other files.',
          },
        ],
      },
      {
        slug: 'privilege-escalation-in-apps',
        title: 'Privilege Escalation in Apps',
        summary: 'Start as a normal user, end up as admin - by flipping a role, a flag, or a hidden parameter the server trusts.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Privilege escalation in web apps - from user to admin'),
          {
            type: 'paragraph',
            text:
              'Privilege escalation is turning a low-privilege account into a high-privilege one. In web apps it usually happens because the server trusts a value the client can change - a role field, an `isAdmin` flag, an account tier - instead of checking it against the real session.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Where to look',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Editable role fields** - a profile update that accepts `role=admin` in the body',
              '**Hidden form values** - a `user_type` field the UI never shows but the server reads',
              '**Mass assignment** - sending extra JSON keys the API blindly saves (`{"isAdmin":true}`)',
              '**Cookies and tokens** - a `role=user` cookie you can flip to `role=admin`',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'mass-assignment-tamper',
            code: 'Original: {"name":"Asha","email":"asha@example.com"}\nTampered: {"name":"Asha","email":"asha@example.com","role":"admin"}',
          },
          {
            type: 'paragraph',
            text:
              'The test is simple: intercept a legitimate update request in Burp, add or change a field that sounds privileged, forward it, then reload and check whether you gained access you should not have.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Diff two accounts',
            text:
              'Capture the same action as a normal user and as an admin. The fields that differ are exactly the ones worth tampering.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only attempt privilege escalation on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot a client-controlled privilege value and test whether the server foolishly trusts it.',
          },
          {
            type: 'quiz',
            question: 'You add "role":"admin" to a profile-update request and become an admin. What went wrong?',
            options: [
              'The password was too weak',
              'The server trusted a client-supplied field instead of enforcing the role server-side',
              'The site was missing HTTPS',
              'The session cookie expired',
            ],
            correctIndex: 1,
            explanation:
              'Mass assignment: the server saved a privileged field straight from the request. Roles must be enforced server-side, never taken from client input.',
          },
        ],
      },
      {
        slug: 'forced-browsing',
        title: 'Forced Browsing and Hidden Admin',
        summary: 'The admin page is often right there - just not linked. Guess the URL and see if the server actually stops you.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Forced browsing - the admin panel nobody linked but nobody protected'),
          {
            type: 'paragraph',
            text:
              'Forced browsing is reaching pages and files by requesting their URLs directly, even though nothing links to them. Hiding a page just by not linking it is "security by obscurity" - and if the server does not check permissions when you visit it directly, you are in.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Guess the obvious** - `/admin`, `/dashboard`, `/backup`, `/config`, `/.git/`',
              '**Fuzz with a wordlist** - tools like ffuf or gobuster try thousands of paths fast',
              '**Follow patterns** - if `/report/2024` exists, try `/report/2023` and `/admin/report`',
              '**Look for leftovers** - `/old/`, `/test/`, `.bak` files, exposed `.env`',
            ],
          },
          {
            type: 'command',
            description: 'Fuzz for hidden paths on a target you are authorised to test:',
            commands: [
              'ffuf -u https://target.example/FUZZ -w wordlist.txt',
              'gobuster dir -u https://target.example -w wordlist.txt',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The bug is not that you *found* `/admin` - it is that the server let you *use* it without being an admin. A found page that redirects you to login is fine; one that serves the admin dashboard is the finding.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Found is not the same as broken',
            text:
              'Discovering a hidden path only matters if access control is missing behind it. Always confirm you can actually do the privileged thing.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only fuzz and force-browse systems you own or are authorised to test - aggressive fuzzing is noisy and unauthorised scanning is an offence.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can hunt for unlinked pages and, more importantly, confirm whether the server actually protects them.',
          },
          {
            type: 'practice_ref', title: 'Broken Access Control check', exerciseSlug: 'broken-access-control-quiz',
          },
          {
            type: 'quiz',
            question: 'You find /admin by guessing the URL, and it loads the full admin panel for your normal account. What is the real vulnerability?',
            options: [
              'That the page was not linked in the menu',
              'That the server served an admin-only page without checking your privileges',
              'That you used a wordlist to find it',
              'That the URL was easy to guess',
            ],
            correctIndex: 1,
            explanation:
              'Not linking a page is not protection. The flaw is missing server-side access control on the page, so any user who reaches it gets in.',
          },
        ],
      },
    ],
  },
  {
    slug: 'auth-and-session-attacks',
    title: 'Auth and Session Attacks',
    description: 'Account takeover, step by step - from weak passwords to stolen sessions and broken resets.',
    lessons: [
      {
        slug: 'password-attacks-and-brute-force',
        title: 'Password Attacks',
        summary: 'Guessing at scale still works, because people reuse weak passwords and sites forget to slow attackers down.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Password attacks - brute force, spraying and stuffing, explained'),
          {
            type: 'paragraph',
            text:
              'Passwords are still the front door of most apps, and people pick predictable ones. Password attacks are about guessing at scale, and they keep working because too many sites do not rate-limit, lock accounts, or add a second factor.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Brute force** - try many passwords against one account',
              '**Dictionary attack** - try a wordlist of likely passwords, not random ones',
              '**Password spraying** - try one common password across many accounts (dodges lockouts)',
              '**Credential stuffing** - reuse username/password pairs leaked from other breaches',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Spraying and stuffing are the practical ones. Spraying tries `Welcome@123` against a thousand users, staying under any per-account lockout. Stuffing bets that someone reused a password that already leaked somewhere else.',
          },
          {
            type: 'command',
            description: 'Concept of an authorised login test (only against a target you own or are authorised to test):',
            commands: ['hydra -l admin -P wordlist.txt target.example http-post-form'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Watch the responses',
            text:
              'A different error, a different status code, or a different response time for a valid vs invalid username leaks which accounts exist - useful before you even guess a password.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only run password attacks against systems you own or are authorised to test. Guessing credentials on someone else\'s login is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell brute force, spraying and stuffing apart and name the defences that stop them.',
          },
          {
            type: 'quiz',
            question: 'Password spraying differs from brute force because it...',
            options: [
              'Tries thousands of passwords against one account',
              'Tries one common password across many accounts to avoid per-account lockouts',
              'Only works with leaked password databases',
              'Requires the admin password',
            ],
            correctIndex: 1,
            explanation:
              'Spraying tries a single common password across many users, staying under lockout thresholds that would trip a single-account brute force.',
          },
        ],
      },
      {
        slug: 'session-hijacking-and-fixation',
        title: 'Session Hijacking and Fixation',
        summary: 'Steal the session token and you are logged in as them - no password needed. Or hand them a token you already know.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('Session hijacking and fixation - being someone without their password'),
          {
            type: 'paragraph',
            text:
              'After you log in, the site hands your browser a session token - usually a cookie - and trusts it on every request. Steal that token and you are that user, no password required. That is session hijacking.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Hijacking: steal the token',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Via XSS** - `document.cookie` read and sent to an attacker (unless the cookie is HttpOnly)',
              '**Over plain HTTP** - a cookie without the Secure flag can be sniffed on the wire',
              '**From logs or URLs** - session ids that leak into logs, referers, or shared links',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: 'Fixation: plant the token',
          },
          {
            type: 'paragraph',
            text:
              'In session fixation you set a known session id in the victim\'s browser *before* they log in. If the app does not issue a fresh id at login, you already know their now-authenticated session id and can ride it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The fix for fixation',
            text:
              'Always regenerate the session id at login (and at privilege change). A token that existed before authentication should never be valid after it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test session attacks on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain how a stolen or pre-planted session token becomes account access, and how HttpOnly, Secure, and id regeneration stop it.',
          },
          {
            type: 'quiz',
            question: 'Which cookie flag most directly stops an XSS payload from stealing a session cookie?',
            options: ['Secure', 'HttpOnly', 'SameSite', 'Path'],
            correctIndex: 1,
            explanation:
              'HttpOnly hides the cookie from JavaScript, so document.cookie cannot read it. Secure and SameSite defend against other risks.',
          },
        ],
      },
      {
        slug: 'jwt-attacks',
        title: 'JWT Attacks',
        summary: 'A JWT is readable, and if the server checks its signature lazily, you can rewrite the part that says who you are.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('JWT attacks - none algorithm, weak secrets, and readable tokens'),
          {
            type: 'image',
            src: '/api/v1/diagrams/jwt-anatomy',
            alt: 'A JWT split into header, payload and signature with decoded contents',
            caption: 'Attack the header and the signature check, not the base64.',
          },
          {
            type: 'paragraph',
            text:
              'A JWT (JSON Web Token) is three base64 chunks joined by dots: a header, a payload, and a signature. The payload often carries your identity and role. It is only base64, not encrypted - anyone can read it - so the signature is the only thing stopping you from editing it. Attack the signature check and you can forge identity.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'decoded-payload',
            code: 'header:  {"alg":"HS256","typ":"JWT"}\npayload: {"sub":"asha","role":"user"}   <-- change user to admin if you can re-sign',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The classic weaknesses',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**alg: none** - set the algorithm to `none` and drop the signature; a broken server accepts it',
              '**Weak HMAC secret** - if signed with HS256 and a guessable secret, crack it offline and re-sign',
              '**alg confusion** - swap RS256 for HS256 and sign with the public key as the secret',
              '**No expiry check** - a token that never expires stays valid forever',
            ],
          },
          {
            type: 'command',
            description: 'Try cracking a weak HMAC secret on a token from a target you are authorised to test:',
            commands: ['hashcat -m 16500 token.jwt wordlist.txt'],
          },
          {
            type: 'paragraph',
            text:
              'The workflow: decode the token, spot a juicy field like `role`, change it, then either strip the signature (`alg:none`) or re-sign with a cracked secret, and replay the request. If the server accepts it, you have identity forgery.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Never trust the payload blindly',
            text:
              'A server must verify the signature with a strong, secret key and pin the expected algorithm. Reading the payload without a real signature check is the whole bug.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only tamper with and crack tokens issued to you by systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can decode a JWT, spot a forgeable claim, and name the alg:none and weak-secret attacks.',
          },
          {
            type: 'quiz',
            question: 'A server accepts a JWT with its algorithm set to "none" and no signature. Why is that dangerous?',
            options: [
              'The token loads slower',
              'Anyone can edit the payload (like role) and the server accepts it without a valid signature',
              'It exposes the user\'s password',
              'It disables HTTPS',
            ],
            correctIndex: 1,
            explanation:
              'With alg:none the signature check is skipped, so an attacker can rewrite claims such as role and be trusted as anyone.',
          },
        ],
      },
      {
        slug: 'password-reset-flaws',
        title: 'Password Reset Flaws',
        summary: 'The "forgot password" flow is a second login you can attack - and it is often weaker than the first.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Password reset flaws - the weakest door into any account'),
          {
            type: 'paragraph',
            text:
              'The password reset flow can hand over an account, so attackers love it - and it is frequently built more carelessly than the login page. If you can predict the reset token, redirect where it is sent, or reuse it, you own the account.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Predictable tokens** - short, sequential, or timestamp-based reset codes you can guess',
              '**Token leakage** - the reset link leaking via the Referer header to third-party scripts',
              '**Host header poisoning** - the reset email built from a Host header you control, sending the link to your server',
              '**No expiry or single-use** - an old reset link that still works, or works twice',
              '**Account takeover via email/param tampering** - changing an `email` or `user` field in the reset request',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'host-header-tamper',
            code: 'POST /forgot-password\nHost: attacker.example        <-- reset link may be built from this\n\nemail=victim@example.com',
          },
          {
            type: 'paragraph',
            text:
              'A strong reset uses a long random single-use token, tied to the account, that expires quickly and is sent only to the registered email - with the link built from a trusted server value, never a client-supplied header.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Test the token itself',
            text:
              'Request a reset, then check: is the token long and random? Does it expire? Does it still work after use? Can you use one account\'s token on another?',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test reset flows on accounts and systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can pick apart a password reset flow and name the flaws that turn it into account takeover.',
          },
          {
            type: 'quiz',
            question: 'Why is a Host header used to build a password reset link dangerous?',
            options: [
              'It makes the email load slower',
              'An attacker can set the Host to their own domain, so the reset link points to a server they control',
              'It reveals the user\'s password in the email',
              'It disables the token entirely',
            ],
            correctIndex: 1,
            explanation:
              'If the reset link is built from an attacker-controlled Host header, the victim\'s reset token can be delivered to the attacker\'s server.',
          },
        ],
      },
      {
        slug: 'mfa-bypass',
        title: 'MFA Bypass',
        summary: 'A second factor is only as strong as how it is checked. Skip the step, brute the code, or replay the flow.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('MFA bypass - when the second factor is not really enforced'),
          {
            type: 'paragraph',
            text:
              'Multi-factor auth adds a second check - an OTP, an app code, a push. It is a genuinely strong defence, but only if the server enforces it correctly. Plenty of implementations let you skip, guess, or replay your way past it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Skipping the step** - go straight to the post-login URL; if the server issued a session before MFA, you are in',
              '**No rate limit on the OTP** - a 6-digit code with unlimited tries is brute-forceable',
              '**Response tampering** - flip `"mfa":false` or a `verified:true` field in the response or a follow-up request',
              '**Reusing or leaking codes** - an OTP that stays valid too long, or is reflected back to the client',
              '**Backup-code weakness** - weak or unlimited recovery codes that dodge the real factor',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'step-skip-test',
            code: 'After password step, MFA page is shown. Try requesting:\nGET /account/dashboard   directly, before submitting the code.',
          },
          {
            type: 'paragraph',
            text:
              'The core test: does the server treat you as unauthenticated until the second factor is verified? If any authenticated action works before the code is checked, the MFA is decorative.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Rate limit the code',
            text:
              'A short numeric OTP with no attempt limit is not a second factor - it is a speed bump. Enforcement and rate limiting are what make MFA real.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test MFA flows on accounts and systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can probe an MFA flow for step-skipping, missing rate limits, and tamperable verification.',
          },
          {
            type: 'quiz',
            question: 'After the password step, you browse straight to the dashboard URL and it loads without entering the OTP. What is the flaw?',
            options: [
              'The OTP was too short',
              'The server granted an authenticated session before the second factor was verified',
              'The email was not confirmed',
              'The password was weak',
            ],
            correctIndex: 1,
            explanation:
              'MFA must gate the session. If authenticated pages work before the code is checked, the second factor is not actually enforced.',
          },
        ],
      },
      {
        slug: 'oauth-misconfigurations',
        title: 'OAuth Misconfigurations',
        summary: '"Login with Google" is convenient - and full of sharp edges when redirect URIs and state are handled sloppily.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          videoSlot('OAuth misconfigurations - stealing tokens through sloppy redirects'),
          {
            type: 'paragraph',
            text:
              'OAuth powers "Login with Google/GitHub". It is a token dance between the app, the provider, and your browser. When the app validates redirect URIs loosely or skips the state check, that dance leaks tokens or forges logins.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Open redirect_uri** - if the provider accepts a redirect to a domain you control, the auth code lands on your server',
              '**Missing state parameter** - no state means no CSRF protection on the login, enabling login CSRF',
              '**Weak redirect matching** - `redirect_uri` validated by prefix or substring, bypassed with a lookalike path',
              '**Token leakage** - access tokens in the URL fragment leaking via Referer or history',
              '**Account linking abuse** - linking your OAuth identity to a victim\'s existing account',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'redirect-tamper',
            code: 'Legit:  redirect_uri=https://app.example/callback\nEvil:   redirect_uri=https://app.example.attacker.example/callback',
          },
          {
            type: 'paragraph',
            text:
              'The high-value target is the `redirect_uri`. If you can nudge the code or token to a domain you own, you complete the login as the victim. Always test exact-match vs loose matching on that parameter.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'state is not optional',
            text:
              'The `state` parameter ties the response back to the request that started it. Missing or unverified state is a CSRF hole in the login itself.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only test OAuth flows on applications you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can name the redirect_uri and state flaws that turn a convenient social login into account takeover.',
          },
          {
            type: 'quiz',
            question: 'Why is loose validation of the OAuth redirect_uri dangerous?',
            options: [
              'It makes login slower',
              'An attacker can redirect the auth code or token to a domain they control and complete the login as the victim',
              'It exposes the OAuth provider\'s source code',
              'It disables HTTPS on the callback',
            ],
            correctIndex: 1,
            explanation:
              'If the app accepts an attacker-controlled redirect_uri, the authorization code or token is delivered to the attacker, leading to account takeover. Redirect URIs must be matched exactly.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'csp-and-xss-defense',
    slug: 'xss-quiz',
    title: 'Cross-Site Scripting check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does an XSS bug let an attacker do?',
        options: [
          'Read arbitrary files on the server',
          'Run their own JavaScript in another user\'s browser',
          'Drop the database',
          'Bypass the firewall',
        ],
        correctIndex: 1,
        explanation: 'XSS runs attacker-controlled JavaScript in a victim\'s browser with that user\'s trust and session.',
      },
      {
        prompt: 'Which type of XSS is saved on the server and served to every visitor?',
        options: ['Reflected', 'Stored', 'DOM-based', 'Blind only'],
        correctIndex: 1,
        explanation: 'Stored XSS is persisted and runs for anyone who loads the affected page, no click needed.',
      },
      {
        prompt: 'DOM XSS is caused by...',
        options: [
          'The server echoing input into HTML',
          'Client-side JavaScript writing a source into a dangerous sink like innerHTML',
          'A weak database password',
          'A missing HTTPS certificate',
        ],
        correctIndex: 1,
        explanation: 'DOM XSS happens entirely in the browser when JS moves attacker input into a sink such as innerHTML.',
      },
      {
        prompt: 'A filter blocks the word "script". Which payload still runs JavaScript?',
        options: [
          '<script>alert(1)</script>',
          '<img src=x onerror=alert(1)>',
          'plain text with no tags',
          'alert(1) typed alone',
        ],
        correctIndex: 1,
        explanation: 'Event handlers like onerror execute JavaScript with no <script> tag, so a word blocklist misses them.',
      },
      {
        prompt: 'What is the primary correct defence against XSS?',
        options: [
          'Blocking the word script',
          'Context-aware output encoding, with CSP as a safety net',
          'A longer password policy',
          'Turning off cookies',
        ],
        correctIndex: 1,
        explanation: 'Encoding output for its context stops input being run as code. CSP is a valuable second layer, not the main fix.',
      },
    ],
  },
  {
    lessonSlug: 'forced-browsing',
    slug: 'broken-access-control-quiz',
    title: 'Broken Access Control check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is the difference between authentication and access control?',
        options: [
          'They are the same thing',
          'Authentication proves who you are; access control decides what you may do',
          'Access control happens before login',
          'Authentication is only for admins',
        ],
        correctIndex: 1,
        explanation: 'Login proves identity. Access control is the separate check on what that identity is allowed to touch.',
      },
      {
        prompt: 'You change invoiceId=1024 to 1025 and see another user\'s invoice. This is...',
        options: ['XSS', 'IDOR', 'A brute-force attack', 'Path traversal'],
        correctIndex: 1,
        explanation: 'IDOR: the server trusts the supplied id without checking the object belongs to you.',
      },
      {
        prompt: 'What does ../ achieve in a path traversal attack?',
        options: [
          'Encrypts the file',
          'Moves up a directory to escape the intended folder',
          'Deletes a directory',
          'Renames a file',
        ],
        correctIndex: 1,
        explanation: '../ climbs up one folder; chaining it escapes the allowed directory to reach other files.',
      },
      {
        prompt: 'A profile update accepts "role":"admin" and you become admin. What is this?',
        options: [
          'Session fixation',
          'Mass-assignment privilege escalation - the server trusted a client field',
          'An open redirect',
          'A DNS bug',
        ],
        correctIndex: 1,
        explanation: 'The server saved a privileged field from the request. Roles must be enforced server-side, never taken from client input.',
      },
      {
        prompt: 'You guess /admin and it loads the admin panel for your normal account. The real bug is...',
        options: [
          'That the page was not in the menu',
          'That the server served an admin-only page without checking your privileges',
          'That you guessed the URL',
          'That the URL was short',
        ],
        correctIndex: 1,
        explanation: 'Hiding a page is not protection. The flaw is missing server-side access control behind the URL.',
      },
    ],
  },
  {
    lessonSlug: 'oauth-misconfigurations',
    slug: 'auth-and-session-attacks-quiz',
    title: 'Auth and Session Attacks check',
    instructions: 'Six quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Password spraying is best described as...',
        options: [
          'Trying thousands of passwords against one account',
          'Trying one common password across many accounts to dodge lockouts',
          'Cracking a password hash offline',
          'Guessing a reset token',
        ],
        correctIndex: 1,
        explanation: 'Spraying uses one common password across many users, staying under per-account lockout limits.',
      },
      {
        prompt: 'Which cookie flag stops JavaScript (and thus XSS) from reading a session cookie?',
        options: ['Secure', 'HttpOnly', 'SameSite', 'Domain'],
        correctIndex: 1,
        explanation: 'HttpOnly hides the cookie from document.cookie, blocking script-based theft.',
      },
      {
        prompt: 'A server accepts a JWT with alg set to "none". Why is that bad?',
        options: [
          'The token loads slower',
          'The signature is skipped, so an attacker can edit claims like role and be trusted',
          'It leaks the user\'s password',
          'It disables HTTPS',
        ],
        correctIndex: 1,
        explanation: 'alg:none means no signature check, so claims can be forged freely.',
      },
      {
        prompt: 'Why is an attacker-controlled Host header in a password reset dangerous?',
        options: [
          'It slows the email',
          'The reset link can be built from it and delivered to the attacker\'s server',
          'It changes the user\'s password directly',
          'It reveals the database schema',
        ],
        correctIndex: 1,
        explanation: 'If the reset link uses a client-supplied Host, the victim\'s reset token can land on the attacker\'s domain.',
      },
      {
        prompt: 'You reach an authenticated dashboard before submitting the OTP. The MFA flaw is...',
        options: [
          'The OTP was too short',
          'The session was granted before the second factor was verified',
          'The email was unverified',
          'The password was reused',
        ],
        correctIndex: 1,
        explanation: 'MFA must gate the session. Authenticated pages working before the code is checked means it is not enforced.',
      },
      {
        prompt: 'Why must an OAuth redirect_uri be matched exactly?',
        options: [
          'To speed up login',
          'Loose matching lets an attacker send the auth code or token to a domain they control',
          'To hide the client secret',
          'To enable HTTPS',
        ],
        correctIndex: 1,
        explanation: 'An attacker-controlled redirect_uri delivers the code or token to the attacker, causing account takeover.',
      },
    ],
  },
];
