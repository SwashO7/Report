import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'burp-suite',
    title: 'Burp Suite',
    description:
      "The proxy you will live inside once you test web apps for real. By the end you can route a browser through Burp, catch a live request and hold it, replay and tamper one parameter in Repeater, fire a numeric sweep in Intruder and read the length column to spot the odd response, and say honestly what the free Community edition can and cannot do.",
    lessons: [
      {
        slug: 'burp-tour',
        title: 'Burp Suite Tour',
        summary: 'Burp sits between your browser and the target and lets you see, hold and change every request. Here is the map.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Burp Suite tour - proxy your browser and catch your first live request'),
          {
            type: 'paragraph',
            text:
              'Burp Suite is a proxy that sits in the middle of your browser and the website. Every request your browser sends goes through Burp first, and every response comes back through Burp too. Once traffic runs through it, you can read it, pause it, and rewrite it before it reaches the server.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a courier who opens every parcel before delivery. Your browser hands over the parcel (a request), Burp looks inside, and only then does it move on to the server. Nothing on the web is off-limits to you once it passes through that middle desk. That is the whole idea, and everything else in Burp is just a tool for doing something to a request you caught.',
          },
          {
            type: 'paragraph',
            text:
              'The window is split into tabs, and you only need a handful to start. **Proxy** is where live traffic gets caught and held. **Target** builds a tree of every URL you have visited, so you can see the whole site map as you browse. **Repeater** is a scratchpad: send one request there, edit it, fire it again, as many times as you like. **Intruder** automates that same edit-and-resend across a whole list of values. The rest (Decoder, Comparer, Sequencer) you meet later when you need them.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real loop. You open Burp, turn intercept on, and load `http://example.com/login` in the proxied browser. The page freezes because Burp is holding the request. You read the raw `POST /login` in the Proxy tab, right-click it, and pick "Send to Repeater". Now you have a copy you can replay forever without touching the browser again. That single move - catch it in Proxy, send it to Repeater - is the motion you will repeat a thousand times.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Proxy** - catch and hold live requests between browser and server',
              '**Target** - the site map tree of everything you have touched',
              '**Repeater** - replay and edit one request by hand',
              '**Intruder** - repeat one request across a list of payloads',
              '**Decoder / Comparer** - encode/decode strings and diff two responses',
              '**Community edition** - free, but no automated scanner and a throttled Intruder',
            ],
          },
          {
            type: 'command',
            description: 'Point your browser or curl at Burp so it flows through the proxy (default listener 127.0.0.1:8080):',
            commands: ['curl -x http://127.0.0.1:8080 -k http://example.com/login'],
          },
          {
            type: 'paragraph',
            text:
              'The `-x http://127.0.0.1:8080` flag tells curl to send the request through Burp instead of straight to the site, and `-k` stops curl complaining about Burp\'s own certificate. Run it with intercept on and the command hangs - that pause is Burp holding your request. Switch to the Proxy tab and you will see the exact `GET /login HTTP/1.1` request sitting there, waiting for you to forward it or change it. The hang IS the proof it worked.',
          },
          {
            type: 'paragraph',
            text:
              'Why does living in a proxy matter? Because the browser enforces rules the server does not. A form may block a negative quantity or hide a field, but the server only ever sees the raw request. Once that request is in Burp, the browser\'s rules are gone - you send whatever bytes you want. Almost every web finding starts here: catch the request, understand it, then change one thing.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The certificate step trips everyone',
            text:
              'HTTPS sites will show a scary warning until you install Burp\'s CA certificate in your browser. That is expected - Burp has to decrypt traffic to show it to you. Install the cert once from `http://burp` and the warnings stop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can route a browser through Burp and name what the Proxy, Repeater and Intruder tabs are each for.',
          },
          { type: 'lab_ref', labSlug: 'http-investigation', title: 'Try it: HTTP Investigation lab' },
          {
            type: 'quiz',
            question: 'Which Burp tab lets you replay and edit a single request by hand as many times as you like?',
            options: ['Proxy', 'Repeater', 'Target', 'Decoder'],
            correctIndex: 1,
            explanation: 'Repeater holds one request you can edit and resend repeatedly. Proxy catches live traffic, Target maps the site, Decoder encodes strings.',
          },
        ],
      },
      {
        slug: 'burp-proxy-and-intercept',
        title: 'Proxy and Intercept',
        summary: 'Catch a live request mid-flight, read it, change it, and let it go. This is the heartbeat of Burp.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Burp Proxy and Intercept - freeze a login request and change it before it lands'),
          {
            type: 'paragraph',
            text:
              'Intercept is the pause button for the web. With it on, Burp freezes every request the moment your browser sends it and holds it until you decide what to do. You can read it, edit any byte, then forward it - or drop it entirely so it never reaches the server.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism, step by step. Your browser is set to send traffic to Burp at `127.0.0.1:8080`. You flip Intercept to "on". You submit a login form. The browser sends the request, Burp catches it, and the page just sits there loading - because the request is stuck on Burp\'s desk. The Proxy tab now shows the raw request, editable. You either hit Forward (send it on, maybe changed) or Drop (throw it away).',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete tamper. You log in as `POST /login` with a body `username=ravi&password=hunter2&role=user`. Burp holds it. You see that hidden `role=user` field that the form put there. You change it to `role=admin` right there in the intercept window and hit Forward. The server never knew a browser rule existed - it just receives `role=admin`. Whether that actually works depends on the server, but you could only try it because you caught the request first.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Intercept on** - every request pauses until you act on it',
              '**Forward** - send the (possibly edited) request onward',
              '**Drop** - discard it, the server never sees it',
              '**Intercept off** - traffic flows normally but is still logged in HTTP history',
              '**HTTP history** - the full record of everything, even with intercept off - your search-later archive',
            ],
          },
          {
            type: 'command',
            description: 'Send a tampered request straight through the proxy without a browser, so you can see the raw bytes Burp shows:',
            commands: ['curl -x http://127.0.0.1:8080 -k -d "username=ravi&password=hunter2&role=user" http://example.com/login'],
          },
          {
            type: 'paragraph',
            text:
              'With intercept on, this command hangs and the request appears in the Proxy tab exactly as sent: the `POST /login` line, the headers curl added, a blank line, then the body `username=ravi&password=hunter2&role=user`. Edit `role=user` to `role=admin` in that window, hit Forward, and curl finally receives whatever the server sends back. The point is that Burp shows you the true wire format - what the server actually receives - not the tidy version a browser form pretends to send.',
          },
          {
            type: 'paragraph',
            text:
              'Why this is the heartbeat: almost every web test is "change one thing and watch what moves". Intercept is how you change that one thing at the exact moment it matters. Turn it off most of the time (constant pausing is annoying) and rely on HTTP history to browse normally, then flip it on for the single request you want to catch and edit.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Leave intercept OFF by default',
            text:
              'New users leave intercept on and then wonder why every page hangs. Keep it off, browse normally, and use HTTP history to find requests. Turn intercept on only for the one request you want to freeze.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can freeze a live request, edit a field the browser would never let you touch, and forward it changed.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own targets only',
            text: 'Intercepting and tampering with traffic is only legal against systems you own or have written permission to test.',
          },
          {
            type: 'quiz',
            question: 'With Burp intercept on, you submit a form and the page hangs. Why?',
            options: [
              'Burp has crashed',
              'Burp is holding the request until you forward or drop it',
              'The server is down',
              'Your internet disconnected',
            ],
            correctIndex: 1,
            explanation: 'Intercept freezes each request on Burp\'s desk until you act. Forward sends it on, Drop discards it. The hang is Burp waiting for your decision.',
          },
        ],
      },
      {
        slug: 'burp-repeater',
        title: 'Repeater: Tamper Anything',
        summary: 'One request, infinite retries. Repeater is where you change a value, resend, and compare - the core testing loop.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Burp Repeater - send one request, tamper a parameter, and read the response diff'),
          {
            type: 'paragraph',
            text:
              'Repeater is a workbench for a single request. You send one request into it, then edit and fire it as many times as you want, watching the response change each time. No browser, no forms, no rules - just you, the raw request, and the Send button.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is simple and that is the point. You catch a request in Proxy, right-click, "Send to Repeater". A new Repeater tab opens with the request on the left and a blank response panel on the right. You hit Send, the response fills in. Now you change one thing in the request - a parameter, a header, a path number - and hit Send again. The response updates. You compare the two. That loop, change-send-compare, is most of web testing.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real IDOR test. You catch `GET /api/orders/1042` with your session cookie and send it to Repeater. Send it: you get back your own order, `200 OK`, 380 bytes. Now change `1042` to `1041` and Send again. If the response is another `200 OK` showing someone else\'s order details, you just found a broken access control bug - the server handed you a record that is not yours. If instead you get `403 Forbidden` or a much shorter body, access control is holding. You learned which in two clicks.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Send** - fire the current request and see the response',
              '**Response length and status** - the two numbers you compare first',
              '**Ctrl+R** - send any request to Repeater from anywhere in Burp',
              '**Tab history** - Repeater keeps every version you sent, so you can step back',
              '**Render tab** - preview an HTML response as a page when raw is hard to read',
            ],
          },
          {
            type: 'command',
            description: 'The same request Repeater sends, done on the command line so you can see what changes between two IDs:',
            commands: [
              'curl -s -o /dev/null -w "%{http_code} %{size_download}\\n" -H "Cookie: session=abc123" http://example.com/api/orders/1042',
              'curl -s -o /dev/null -w "%{http_code} %{size_download}\\n" -H "Cookie: session=abc123" http://example.com/api/orders/1041',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The `-w "%{http_code} %{size_download}"` part prints just the status code and the response size, which are exactly the two numbers Repeater shows you. If the first line prints `200 380` (your order) and the second prints `200 372` (someone else\'s), that near-identical size on a different ID is the tell: the server returned a full record for an order that is not yours. A `403 0` on the second line would mean access control blocked it. Reading those two numbers side by side is the whole skill.',
          },
          {
            type: 'paragraph',
            text:
              'Why Repeater beats the browser: the browser sends the request its way, once, and moves on. Repeater lets you sit on one request and probe it methodically - flip one byte, resend, note the difference, flip it back. That patient, one-variable-at-a-time approach is how real bugs get confirmed, and it is impossible through a normal browser.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Change ONE thing at a time',
            text:
              'If you edit three fields and the response changes, you do not know which edit did it. Change one value, send, note the result, then change the next. Discipline here saves hours of confusion.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can send a request to Repeater, tamper one value, resend, and read the status-and-length diff to judge what happened.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where you are allowed',
            text: 'Replaying and altering requests against a live target is permitted only on systems you own or are authorised in writing to test.',
          },
          { type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab' },
          {
            type: 'quiz',
            question: 'In Repeater you change an order ID from 1042 to 1041 and get back a full 200 OK with someone else\'s data. What have you likely found?',
            options: [
              'A server error',
              'A broken access control (IDOR) bug',
              'A caching problem',
              'Nothing, this is normal',
            ],
            correctIndex: 1,
            explanation: 'Getting a full record for an ID that is not yours means the server did not check ownership - that is IDOR, a broken access control bug.',
          },
        ],
      },
      {
        slug: 'burp-intruder',
        title: 'Intruder: Automate the Attack',
        summary: 'Take one request, mark a spot, feed it a list of values, and let Burp fire them all. Then read the length column.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Burp Intruder - run a numeric sweep and spot the odd response in the results table'),
          {
            type: 'paragraph',
            text:
              'Intruder does what you did by hand in Repeater, but hundreds of times automatically. You take one request, mark the part you want to vary, hand Burp a list of values to try, and it fires a request for every value - then lays the results out in a table you can sort.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism has four steps you set up once. First, send a request to Intruder. Second, on the Positions tab, mark the spot to inject - Burp wraps it in `§` markers, like `/api/orders/§1042§`. Third, on the Payloads tab, give it the values - a number range, a wordlist, whatever. Fourth, hit Start Attack. Burp sends one request per payload and fills a results table with the status, length and time of each response. The odd one out is your lead.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete sweep. You mark the order ID in `GET /api/orders/§1042§` and set the payload to numbers 1040 through 1050. Start the attack. Most responses come back `403 Forbidden` at 0 bytes - access control doing its job. But rows 1043 and 1047 come back `200 OK` at 380 bytes. Those two are orders the server let you see when it should not have. You did not read eleven responses one by one; you sorted the Length column and the two outliers jumped out. That is Intruder\'s whole value: it makes the anomaly visible.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Positions** - mark what varies with `§markers§`',
              '**Payloads** - the list of values to try (numbers, words, a wordlist file)',
              '**Sniper** - the simple mode: one position, one payload list, one request each',
              '**Length column** - sort it to find the response that differs from the crowd',
              '**Status column** - a lone 200 among 403s (or the reverse) is the signal',
              '**Community throttle** - the free edition slows Intruder down heavily on purpose',
            ],
          },
          {
            type: 'command',
            description: 'The same numeric sweep as a shell loop, so you can see what Intruder automates under the hood:',
            commands: ['for id in $(seq 1040 1050); do echo -n "$id: "; curl -s -o /dev/null -w "%{http_code} %{size_download}\\n" -H "Cookie: session=abc123" http://example.com/api/orders/$id; done'],
          },
          {
            type: 'paragraph',
            text:
              'This loop sends one request per ID from 1040 to 1050 and prints the ID, its status code and its size. Read the output like the Intruder table: if most lines say `403 0` but `1043: 200 380` and `1047: 200 380` appear, those two IDs returned a full record you were not supposed to see. The uniform rows are noise; the two that break the pattern are the finding. Intruder does exactly this loop with a sortable GUI table instead of scrolling text.',
          },
          {
            type: 'paragraph',
            text:
              'Why automate at all? Because bugs hide in volume. Testing eleven IDs by hand is tedious but doable; testing username lists, parameter names, or a 4000-word content list by hand is not. Intruder turns "try everything and show me what is different" into a few clicks, and difference - in status, length or timing - is almost always where the bug is.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Community edition throttles Intruder',
            text:
              'The free version deliberately slows Intruder to a crawl to nudge you toward the paid Pro. It still works for small sweeps, but for large payload lists you will feel the artificial delay. Plan small, targeted attacks.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can mark a position, load a payload list, run a sweep, and read the length column to find the response that does not fit.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorisation is not optional',
            text: 'Automated sweeps hit a target hard and fast. Run Intruder only against systems you own or have explicit written permission to test.',
          },
          {
            type: 'practice_ref', title: 'Burp Suite check', exerciseSlug: 'burp-suite-quiz',
          },
          {
            type: 'quiz',
            question: 'After an Intruder sweep, most responses are 403 at 0 bytes but two are 200 at 380 bytes. What do those two suggest?',
            options: [
              'The server crashed on those two',
              'Those two IDs returned data you were not supposed to see',
              'Those two requests failed to send',
              'Nothing, 200 is always fine',
            ],
            correctIndex: 1,
            explanation: 'The 403s are access control blocking you. The two 200s that return a full-size body are records the server let through by mistake - the outliers are the finding.',
          },
        ],
      },
      {
        slug: 'burp-extensions-and-workflow',
        title: 'Extensions and Workflow',
        summary: 'Burp is a platform, not just a tool. A few extensions and a tidy habit turn it from usable into fast.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Out of the box Burp does the core job, but its real power is that other people have written add-ons for it. The BApp Store, built into Burp, is a catalogue of free extensions that bolt new abilities onto the tabs you already know. A good workflow is a small set of these plus a habit of keeping your work organised.',
          },
          {
            type: 'paragraph',
            text:
              'How extensions work: Burp exposes an API, and an extension hooks into it to see traffic, add tabs, or flag things automatically. You install one from the Extensions tab (BApp Store sub-tab), it loads, and it starts working on the traffic already flowing through Burp. Nothing changes about how you browse - the extension just watches or adds a panel. Remove it and Burp is back to stock.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a realistic setup. You install **Logger++** so every request across every tool lands in one searchable table - now you can grep all traffic for a keyword. You add **Autorize** so that as you browse logged in as a normal user, it silently replays each request without your admin cookie and flags any that still succeed - automatic access-control testing while you work. You add **JSON Web Tokens** so any JWT in a request is decoded and editable in place. Three extensions, and your normal browsing now quietly does three jobs at once.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Logger++** - one searchable log of every request from every Burp tool',
              '**Autorize** - replays requests without your session to catch access-control bugs',
              '**JSON Web Tokens** - decode and edit JWTs inline',
              '**Param Miner** - discovers hidden parameters and headers',
              '**Project files** - save your session so history and Repeater tabs survive a restart (Pro only for saved projects)',
            ],
          },
          {
            type: 'command',
            description: 'Most extensions are Java or Python (Jython) - check what a Jython-based extension needs before loading it:',
            commands: ['java -version'],
          },
          {
            type: 'paragraph',
            text:
              'This prints the Java version Burp runs on, and it matters because some older extensions need a specific Jython jar configured before they load. If `java -version` reports something like `openjdk version "17"`, you know the runtime is healthy; a "command not found" means Java is not on your path and Burp likely bundled its own. When an extension fails to load, the Extensions tab shows an error output panel - read it, because it usually names the missing dependency directly.',
          },
          {
            type: 'paragraph',
            text:
              'Why workflow beats raw features: a tester who loses their history on every restart, cannot search old traffic, and re-tests access control by hand is slow no matter how sharp their eye. A little setup - a logging extension, an authorisation checker, tidy scoping so Burp only records the target and not every ad and analytics call - means you spend your attention on the bug, not on wrangling the tool.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Set your Target scope first',
            text:
              'Add just the target to Target > Scope and tick "show only in-scope items". Otherwise Burp records every third-party script and ad the page loads, and your history becomes unreadable noise.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can install a Burp extension from the BApp Store and name a small workflow that tests access control while you simply browse.',
          },
          {
            type: 'quiz',
            question: 'What does the Autorize extension do while you browse as a normal user?',
            options: [
              'Blocks all requests to admin pages',
              'Replays your requests without your session to see if they still succeed',
              'Encrypts your traffic',
              'Speeds up Intruder',
            ],
            correctIndex: 1,
            explanation: 'Autorize silently re-sends each request stripped of your credentials and flags any that still return data - automatic access-control testing as you work.',
          },
        ],
      },
      {
        slug: 'burp-vs-caido-vs-zap',
        title: 'Burp vs Caido vs ZAP',
        summary: 'Three proxies, three trade-offs. Pick honestly, and know exactly what the free tier costs you.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Burp is the default the industry standardised on, but it is not the only intercepting proxy, and the free Burp has real limits. Caido is a newer, lighter challenger, and ZAP is the free, open-source option that owes nobody a licence. Knowing what each gives up helps you spend money (or not) with your eyes open.',
          },
          {
            type: 'paragraph',
            text:
              'They all do the same core thing - sit between browser and server, catch and edit requests - so the differences are in the edges. Burp Community is free but has no automated scanner at all and throttles Intruder heavily; the scanner and full-speed Intruder live in Pro, which is a yearly paid licence. Caido is a fresh, fast, project-based tool with a cleaner interface and a generous free tier, growing quickly but younger, so fewer extensions and less written about it. ZAP is fully free and open source with a built-in scanner, but its interface is busier and its automation is more DIY.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real decision. You are a beginner with no budget testing a lab and a couple of bounty targets. Burp Community covers the manual work you actually do at this stage - Proxy, Repeater, small Intruder sweeps - so it is a fine start, and it is what most tutorials assume. When the throttled Intruder starts hurting, you have three honest options: pay for Burp Pro, switch to Caido whose free tier does not cripple its equivalent feature, or use ZAP whose scanner is free. None is wrong; the right pick depends on your money and how much you lean on automation.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Burp Community** - free, industry default, NO scanner, throttled Intruder',
              '**Burp Pro** - paid yearly, full scanner, full-speed Intruder',
              '**Caido** - lightweight, project-based, cleaner UI, generous free tier, younger ecosystem',
              '**ZAP** - fully free and open source, built-in scanner, busier interface, DIY automation',
              '**The constant** - all four intercept, replay and tamper; the manual core is the same everywhere',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not pay before you feel the limit',
            text:
              'A beginner does not need a scanner or fast Intruder yet. Learn the manual craft on a free tool first. Buy Pro (or switch tools) only when a specific limit is genuinely slowing down real work you are already doing.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can name what Burp Community gives up (scanner and Intruder speed) and pick a proxy based on your budget and how much you automate.',
          },
          {
            type: 'quiz',
            question: 'What does the free Burp Community edition NOT include?',
            options: [
              'The Proxy tab',
              'Repeater',
              'The automated scanner and full-speed Intruder',
              'The ability to intercept requests',
            ],
            correctIndex: 2,
            explanation: 'Community has the full manual toolkit - Proxy, Repeater, a throttled Intruder - but no automated scanner. The scanner and unthrottled Intruder are Pro-only.',
          },
        ],
      },
    ],
  },
  {
    slug: 'scanning-tools',
    title: 'Scanning Tools',
    description:
      "Nmap and the scanners built on the same idea, driven with intent instead of copy-pasted flags. By the end you can build an nmap command from the flags you actually need and read what open, closed and filtered mean, run one NSE script and interpret its output, understand what a nuclei template is and read a tiny one, and know when scanning fast is worth the noise.",
    lessons: [
      {
        slug: 'nmap-deep-dive',
        title: 'Nmap Deep Dive',
        summary: 'Stop copying random flags. Build an nmap command from what you actually want to know, and read every port state.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Nmap deep dive - build a scan flag by flag and read open, closed and filtered'),
          {
            type: 'paragraph',
            text:
              'Nmap knocks on a machine\'s doors and reports which ones answer. That is the whole job: send packets to ports, listen to what comes back, and tell you what is probably running. Most people paste a flag soup they found online; the skill is building the command from what you actually want to know.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a conversation. To check a TCP port, nmap sends a `SYN` packet - the first step of the handshake, like knocking. If the port is open, the machine answers `SYN-ACK` ("come in"). If it is closed, it answers `RST` ("go away"). If a firewall silently eats the packet and nothing comes back, nmap cannot tell open from closed, so it reports `filtered`. Those three replies are the entire basis of a port scan.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real command. `nmap -sV -p- --open 192.0.2.10` means: `-p-` scan all 65535 ports (not just the top 1000 default), `--open` only show me ports that answered, and `-sV` after finding an open port, grab its banner and guess the service and version. So nmap first finds the open doors, then walks up to each and asks "what are you and which version?". The result is not just "80 is open" but "80 is open, running nginx 1.18". That version string is the thing you look up for known weaknesses.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**-sS** - SYN scan (default as root): fast, sends SYN, never completes the handshake',
              '**-sT** - connect scan: completes the full handshake, used when not root, noisier',
              '**-sV** - probe open ports for service and version',
              '**-p-** - all 65535 ports; **-p 80,443** - just those; default is top 1000',
              '**--open** - hide closed and filtered ports from the output',
              '**-T4** - a faster timing template (T0 slowest/stealthiest to T5 fastest/loudest)',
            ],
          },
          {
            type: 'command',
            description: 'A sensible first scan of a host you are authorised to test:',
            commands: ['nmap -sV -p- --open -T4 192.0.2.10'],
          },
          {
            type: 'paragraph',
            text:
              'The output lists each open port as a line like `22/tcp open ssh OpenSSH 8.2p1` and `80/tcp open http nginx 1.18.0`. Read it left to right: the port and protocol, the state (`open`), the service name, then the version banner. The version is the payload - `OpenSSH 8.2p1` tells you exactly what to search for known issues against. If a port shows `filtered` instead of `open` or `closed`, a firewall is dropping your packets silently, and that itself is information: something is being protected.',
          },
          {
            type: 'paragraph',
            text:
              'Why this matters to a hacker: a scan is the map you attack from. Every open port is a service, every service is code, and code has bugs. Knowing a box runs `nginx 1.18` and `OpenSSH 8.2` on ports 80 and 22 turns a blank IP into two concrete leads. Scan wrong - miss `-p-` and skip the service on port 8443 - and you never even see the door the bug is behind.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The default misses most ports',
            text:
              'A bare `nmap host` scans only the top 1000 ports. Real services love to hide on 8080, 8443, 9000. Use `-p-` when you can afford the time, or you will miss the interesting stuff.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can assemble an nmap command from the flags you need and read open, closed and filtered plus a version banner.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Scan only what is yours',
            text: 'Port scanning a machine you do not own or have no written authorisation to test can itself be treated as an offence. Stay inside scope.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'quiz',
            question: 'Nmap reports a port as "filtered". What does that most likely mean?',
            options: [
              'The port is definitely open',
              'The port is definitely closed',
              'A firewall is silently dropping the probes, so nmap cannot tell',
              'The service crashed',
            ],
            correctIndex: 2,
            explanation: 'Open answers SYN-ACK, closed answers RST. Filtered means nothing came back - usually a firewall eating the packets, so the true state is hidden.',
          },
        ],
      },
      {
        slug: 'nmap-scripting-engine',
        title: 'Nmap Scripting Engine',
        summary: 'Nmap is not just a port scanner. NSE runs small scripts against open ports to check for specific things automatically.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Nmap Scripting Engine - run one NSE script against a port and read its findings'),
          {
            type: 'paragraph',
            text:
              'The Nmap Scripting Engine (NSE) turns nmap from "which ports are open" into "and here is something specific about each one". Once nmap finds an open port, it can run little Lua scripts against that service - pull a banner, list SSL ciphers, check for a known misconfiguration, enumerate shares. Same tool, one more step.',
          },
          {
            type: 'paragraph',
            text:
              'Mechanically, each script is a small program that knows how to talk to one kind of service. You either name a script directly with `--script`, or use a category. The handy default set runs with `-sC` (equivalent to `--script=default`): a bundle of safe, useful scripts that grab extra detail without doing anything aggressive. Nmap runs the matching scripts against each open port and prints their output indented under that port\'s line.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete run. You scan a web server with `nmap -sV -sC -p 443 192.0.2.10`. Nmap finds 443 open, identifies HTTPS, then the default scripts fire: `ssl-cert` prints the certificate\'s subject, issuer and expiry date; `ssl-enum-ciphers` lists which TLS versions and cipher suites the server accepts and grades them. In one command you now know the site is on `443`, its cert is for `example.com` expiring next March, and it still allows TLS 1.0 - a weak configuration worth noting. You never ran three tools; NSE did it inline.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**-sC** - run the default safe script set',
              '**--script=<name>** - run one specific script, e.g. `--script=ssl-enum-ciphers`',
              '**--script=<category>** - run a whole category: `default`, `safe`, `vuln`, `auth`, `discovery`',
              '**--script-args** - pass options into a script',
              '**vuln category** - checks for known issues, but it is more intrusive - use with care and permission',
            ],
          },
          {
            type: 'command',
            description: 'Run one named script against a single open port:',
            commands: ['nmap -p 443 --script=ssl-enum-ciphers 192.0.2.10'],
          },
          {
            type: 'paragraph',
            text:
              'The output nests under the port: below `443/tcp open https` you get a `| ssl-enum-ciphers:` block listing each TLS version the server accepts, the ciphers under it, and a letter grade per cipher (A is strong, F is broken). If you see `TLSv1.0` listed with a `C` or lower grade, the server accepts an outdated protocol - a real, reportable weakness. The grade column is the shortcut: scan the letters, and anything below B is worth writing down.',
          },
          {
            type: 'paragraph',
            text:
              'Why NSE is worth learning: it automates the boring first questions you would otherwise ask by hand of every service. Instead of manually checking a cert, testing ciphers, and probing for default files, one flag does the safe versions of all three. The `vuln` category goes further and checks for known holes, but it pokes harder, so you save that for targets where you are clearly authorised and the noise is acceptable.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Categories are not all equal',
            text:
              'The `safe` and `default` scripts just observe. The `vuln` and `intrusive` categories actively test and can trip alarms or, rarely, disrupt a fragile service. Know which category you are running before you run it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can run an NSE script against an open port and read its nested output, including a cipher grade, to judge a service.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Especially the vuln scripts',
            text: 'NSE scripts, and the vuln category in particular, actively interact with a service. Run them only against targets you own or are authorised in writing to assess.',
          },
          {
            type: 'quiz',
            question: 'What does the -sC flag tell nmap to do?',
            options: [
              'Scan only closed ports',
              'Run the default set of safe NSE scripts against open ports',
              'Complete a full TCP connection',
              'Scan the top 100 ports only',
            ],
            correctIndex: 1,
            explanation: '-sC runs the default script category - a bundle of safe, useful scripts that gather extra detail about each open service.',
          },
        ],
      },
      {
        slug: 'nuclei-in-practice',
        title: 'Nuclei in Practice',
        summary: 'Nuclei fires thousands of community-written checks at a target using simple YAML templates. Here is what a template actually is.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Nuclei in practice - run a template pack against a target and read a match'),
          {
            type: 'paragraph',
            text:
              'Nuclei is a scanner that runs checks written as simple text files called templates. Instead of hard-coded logic, each check is a small YAML file that says "send this request, and if the response contains this, it is a match". Thousands of these are maintained by the community, so nuclei is really a fast engine for running everyone\'s checks at once.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is refreshingly plain. A template describes a request to send and a matcher that decides if the response is interesting. Nuclei reads the template, fires the request at your target, applies the matcher to what comes back, and reports a hit if it matches. Because the logic lives in the file, you can read any check to see exactly what it does - no black box.',
          },
          {
            type: 'paragraph',
            text:
              'Read a tiny template end to end. The one below sends a GET to `/.env` and matches only if the response is `200` AND the body contains `DB_PASSWORD`. If both are true, nuclei reports "exposed-env-file" against your target. That is the entire check: one request, two conditions, one verdict. Understanding this shape means you can read the 8000 community templates and know what each will actually do before you run it.',
          },
          {
            type: 'code',
            language: 'yaml',
            filename: 'exposed-env.yaml',
            code:
              'id: exposed-env-file\ninfo:\n  name: Exposed .env File\n  severity: high\nhttp:\n  - method: GET\n    path:\n      - "{{BaseURL}}/.env"\n    matchers-condition: and\n    matchers:\n      - type: status\n        status:\n          - 200\n      - type: word\n        words:\n          - "DB_PASSWORD"',
          },
          {
            type: 'paragraph',
            text:
              'Reading it top down: `id` is the unique name, `severity` grades the finding, the `http` block sends a GET to `{{BaseURL}}/.env` (nuclei fills in your target for `{{BaseURL}}`), and `matchers-condition: and` means BOTH matchers must pass. The first matcher requires status `200`, the second requires the word `DB_PASSWORD` in the body. Only if a `.env` file both exists and contains that string does nuclei flag it - which is why nuclei has far fewer false positives than a scanner that just checks the status code.',
          },
          {
            type: 'command',
            description: 'Run nuclei with a category of templates against a single authorised target:',
            commands: [
              'nuclei -u https://example.com -t http/exposures/ -severity high,critical',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The `-u` sets the target, `-t http/exposures/` picks a folder of templates (here, checks for exposed files and data), and `-severity high,critical` runs only the serious ones so you are not buried in low-value noise. Output lines look like `[exposed-env-file] [http] [high] https://example.com/.env` - the template id, the protocol, the severity, and the exact URL that matched. Each line is a lead you then confirm by hand; nuclei points, you verify.',
          },
          {
            type: 'paragraph',
            text:
              'Why nuclei fits a hacker\'s workflow: it turns "check this target for the 500 most common quick wins" into one command, and because templates are readable YAML you are never trusting a black box. Run a focused category against your scope, get a short list of matches, then open each in Repeater to confirm it is real. The danger is running everything at maximum speed against a live target - that is loud and can hurt a fragile server.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A match is a lead, not a finding',
            text:
              'Nuclei is fast but not always right. Every hit is something to confirm by hand, not paste straight into a report. Reproduce it in Repeater or a browser before you claim it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a nuclei template, understand its request-and-matcher shape, and run a focused template category against a target.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Templates hit real endpoints',
            text: 'Nuclei sends live requests, sometimes thousands. Point it only at targets you own or are explicitly authorised to test.',
          },
          {
            type: 'practice_ref', title: 'Scanning Tools check', exerciseSlug: 'scanning-tools-quiz',
          },
          {
            type: 'quiz',
            question: 'In the .env template, matchers-condition is set to "and". What does that mean for a match?',
            options: [
              'Either the status OR the word is enough',
              'Both the 200 status AND the word DB_PASSWORD must be present',
              'It scans two different paths',
              'It retries the request twice',
            ],
            correctIndex: 1,
            explanation: 'With "and", every matcher must pass. Here the response must be 200 AND contain DB_PASSWORD, which is what keeps false positives low.',
          },
        ],
      },
      {
        slug: 'masscan-and-speed',
        title: 'Masscan and Scanning at Speed',
        summary: 'Masscan scans the whole internet in minutes by giving up something nmap keeps. Know the trade before you use it.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Masscan is a port scanner built for one thing: raw speed across huge address ranges. Where nmap carefully scans one host well, masscan can sweep millions of addresses in minutes. It buys that speed by throwing out the caution and statefulness that make nmap accurate, so it is a different tool for a different job.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is why it is fast. Nmap tracks each connection - it sends a probe, waits, retries, remembers state - which is accurate but slow at scale. Masscan is asynchronous and stateless: it fires SYN packets as fast as your network allows and listens for replies separately, never waiting on any single one. It is closer to shouting "anyone there?" down a million corridors at once and noting who shouts back, rather than knocking on each door and waiting politely.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the real two-step workflow people actually use. First, masscan sweeps a big range fast for just the ports you care about: scan a `/16` (65000 addresses) for port 443 and in a couple of minutes you have a list of which hosts have HTTPS open. Second, you feed that short list of live hosts into nmap with `-sV -sC` for the careful, accurate detail. Masscan finds the needles fast; nmap examines them properly. Using masscan alone gives you speed but shallow, sometimes-wrong results.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**--rate** - packets per second; the knob that decides speed vs disruption',
              '**-p** - the ports to sweep; keep it small when the range is large',
              '**Stateless** - blazing fast but less reliable than nmap on any single host',
              '**Two-step habit** - masscan to find live hosts, nmap to examine them',
              '**Rate is a loaded gun** - too high can saturate a link or trip every alarm',
            ],
          },
          {
            type: 'command',
            description: 'Sweep a range for one port at a modest, considerate rate:',
            commands: ['masscan 192.0.2.0/24 -p443 --rate 1000'],
          },
          {
            type: 'paragraph',
            text:
              'This checks all 256 addresses in the `/24` for port 443 at 1000 packets per second. The output is terse: lines like `Discovered open port 443/tcp on 192.0.2.10` - just the port and the host, no version, no banner, because masscan does not stop to ask. That thin result is the point: you now have a list of live HTTPS hosts to hand to nmap. The `--rate` number is the one to respect; 1000 is polite, tens of thousands can knock over a small network or light up every intrusion alarm.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Rate is not a "go faster" button',
            text:
              'A high --rate can saturate the target\'s bandwidth, drop results, and guarantee you are noticed. On any real engagement, start low. Speed you cannot control is not an advantage.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain why masscan is fast, use it to find live hosts, and hand those to nmap for the accurate detail.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Speed makes it louder, not safer',
            text: 'Sweeping large ranges at speed is unmistakable and can disrupt networks. Only scan address space you own or are authorised in writing to test.',
          },
          {
            type: 'quiz',
            question: 'Why is masscan so much faster than nmap for large ranges?',
            options: [
              'It scans fewer ports automatically',
              'It is stateless and asynchronous, firing packets without waiting on each reply',
              'It uses a paid cloud service',
              'It only scans hosts that are already known',
            ],
            correctIndex: 1,
            explanation: 'Masscan does not track each connection or wait for replies in order. It blasts SYN packets and collects answers separately, trading nmap\'s accuracy for raw speed.',
          },
        ],
      },
    ],
  },
  {
    slug: 'fuzzing-tools',
    title: 'Fuzzing Tools',
    description:
      "Finding the pages, endpoints and parameters nobody linked to, by asking the server about thousands of guesses fast. By the end you can run a real ffuf command and filter the noise down to the one true hit, explain why a smaller well-chosen wordlist beats a giant one, and know where gobuster and dirsearch fit as lighter alternatives for the same job.",
    lessons: [
      {
        slug: 'ffuf-deep-dive',
        title: 'ffuf Deep Dive',
        summary: 'ffuf asks the server "does this path exist?" thousands of times fast. The skill is filtering the answers down to the real one.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('ffuf deep dive - fuzz for hidden paths and filter the noise down to one real hit'),
          {
            type: 'paragraph',
            text:
              'ffuf ("fuzz faster u fool") finds things on a website that are not linked anywhere. It takes a wordlist and, for each word, requests that path and watches the response. Hidden admin panels, forgotten backups, old API versions - if it exists at a guessable URL, fuzzing is how you find it.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is a substitution loop. You put the keyword `FUZZ` somewhere in the URL, hand ffuf a wordlist, and it swaps each word into that spot and sends the request. `http://example.com/FUZZ` with a wordlist of `admin`, `backup`, `login`, `config` becomes four requests: `/admin`, `/backup`, `/login`, `/config`. ffuf records the status and size of each response. The whole game is then telling the real page apart from the thousands of "not found" answers.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete run. You fuzz `http://example.com/FUZZ` with a 4000-word list. The site returns `404` for anything missing - but annoyingly, this site returns a friendly `200` "page not found" page for missing paths too, and that page is always 1256 bytes. So `/admin` and `/backup` come back `200` at 1256 bytes (fake - the custom 404) but `/config` comes back `200` at 843 bytes. That different size is the real hit: `/config` is an actual page. Without filtering, all three look like `200` and you would chase two dead ends.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**-u** - the URL, with `FUZZ` marking where words go',
              '**-w** - the wordlist file',
              '**-mc** - match only these status codes (e.g. `-mc 200,301,403`)',
              '**-fc** - filter OUT these status codes',
              '**-fs** - filter out responses of this exact size (kills a fake-404 page)',
              '**-t** - concurrent threads; higher is faster but louder and can trip rate limits',
            ],
          },
          {
            type: 'command',
            description: 'Fuzz for paths, then filter out the site\'s fake-404 page by its size:',
            commands: [
              'ffuf -u http://example.com/FUZZ -w wordlist.txt',
              'ffuf -u http://example.com/FUZZ -w wordlist.txt -fs 1256',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command shows everything, and you notice a flood of `200` responses all at size 1256 - that uniform size is the site\'s custom not-found page pretending to be real. The second command adds `-fs 1256` to filter out that exact size, and now only genuinely different pages remain in the output. Each surviving line shows the word, its status and its size, like `config [Status: 200, Size: 843]`. Filtering by the fake page\'s size is the single most useful fuzzing move, because a naive scan drowns the one real result in look-alikes.',
          },
          {
            type: 'paragraph',
            text:
              'Why fuzzing finds real bugs: the most damaging things are often the ones nobody meant to leave reachable - an unlinked `/admin`, a `/backup.zip`, an old `/api/v1` that skips the auth the new version added. None of these appear in the site\'s menu, so a spider misses them. Fuzzing is how you discover the attack surface the developers forgot was there, and filtering is how you actually see it among the noise.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Learn to filter before you fuzz harder',
            text:
              'A wall of 200s usually means the site returns a soft 404 for everything. Do not scan a bigger list - find the fake page\'s size or a unique word in it and filter it out with `-fs` or `-fr`. The right filter turns noise into one clear answer.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can run ffuf against a URL, spot a fake-404 page by its uniform size, and filter it out to reveal the real hidden path.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Fuzzing is a lot of requests',
            text: 'A single fuzz run can send thousands of requests in seconds. Do it only against targets you own or have written authorisation to test.',
          },
          {
            type: 'quiz',
            question: 'ffuf returns hundreds of 200 responses all exactly 1256 bytes, and one 200 at 843 bytes. What is the 843-byte response?',
            options: [
              'A server error',
              'The one real page - the 1256-byte responses are a fake "not found" page',
              'A duplicate request',
              'Proof the site is down',
            ],
            correctIndex: 1,
            explanation: 'The site returns a custom not-found page (always 1256 bytes) with a 200 status. The single different size is the genuine page; filter out 1256 with -fs to see it clearly.',
          },
        ],
      },
      {
        slug: 'wordlists-that-work',
        title: 'Wordlists That Actually Work',
        summary: 'A 200k-word list is usually worse than the right 4k. Fuzzing is only as good as the guesses you feed it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A fuzzer only ever finds words that are in its wordlist. That one fact decides whether fuzzing works. Beginners reach for the biggest list they can find, thinking more words means more findings. Usually it means more noise, more time, more chance of being rate-limited, and the real hit buried under 200,000 misses.',
          },
          {
            type: 'paragraph',
            text:
              'Here is why bigger is often worse. A 200k-word list sends 200k requests. Against a site that rate-limits after a few hundred, you get blocked before the useful words even run. It also takes far longer and produces so many responses that filtering becomes its own chore. A curated 4000-word list of paths that actually exist on real sites - the SecLists `common.txt` or `raft-medium-directories` - finds the same `/admin` and `/backup` in a fraction of the requests, quietly.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the real reasoning. You are looking for hidden directories on a PHP site. A giant list wastes thousands of guesses on `.aspx` and `.jsp` paths that cannot exist here. The smart move is to match the list to the target: use a directory list for directories, add a `.php` extension list because you know the stack, and pull in words from the site itself - names you saw in the HTML, in JavaScript, in URLs. A wordlist built partly from the target beats any generic list, because real apps name things consistently.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**SecLists** - the standard collection; `Discovery/Web-Content` is where the good lists live',
              '**common.txt** - a small, high-hit-rate starter list',
              '**raft-*-directories / -files** - medium lists ranked by how often each word really appears',
              '**Match the stack** - a PHP site wants `.php`; do not fuzz `.aspx` at it',
              '**Mine the target** - words from the site\'s own HTML and JS beat any generic list',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why this is a skill and not a download: the difference between a hunter who finds the hidden endpoint and one who gets rate-limited into nothing is almost never the tool - it is the list. A tight, relevant, stack-matched wordlist, topped up with words scraped from the target itself, turns fuzzing from a noisy shotgun into a precise probe. The best wordlist for a target is partly written by the target.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Start small, then go targeted',
            text:
              'Run a small list like `common.txt` first for quick wins, then build a custom list from words you found on the site itself. Reach for a giant list only when small and targeted have both come up empty.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can pick a wordlist that matches the target instead of the biggest one, and explain why a smaller relevant list finds more with less noise.',
          },
          {
            type: 'quiz',
            question: 'Why is a curated 4000-word list often better than a 200,000-word one?',
            options: [
              'It contains more words',
              'It finds the same real paths with far fewer requests, avoiding rate limits and noise',
              'It works without a target',
              'Bigger lists are always blocked by law',
            ],
            correctIndex: 1,
            explanation: 'A tight, relevant list hits the paths that actually exist while sending a fraction of the requests, so you avoid rate limiting and the real result is not buried in noise.',
          },
        ],
      },
      {
        slug: 'gobuster-and-dirsearch',
        title: 'gobuster and dirsearch',
        summary: 'Two lighter tools that do the same content-discovery job as ffuf, with fewer knobs. Know when to reach for each.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'ffuf is the flexible power tool, but two others do the same core job of finding hidden paths, often with a simpler starting experience. gobuster is a fast, no-frills scanner written in Go. dirsearch is a Python tool that comes with sensible defaults baked in. All three send a wordlist at a site and report what exists - they differ mostly in convenience.',
          },
          {
            type: 'paragraph',
            text:
              'Mechanically they are the same idea as ffuf: read a wordlist, request each entry, report the responses. gobuster keeps it lean - you pick a mode (`dir` for directories, `dns` for subdomains), give it a URL and a wordlist, and it goes. dirsearch leans the other way: it ships with its own wordlist and a list of common extensions, so `dirsearch -u <url>` does something useful with almost no flags. ffuf sits above both with the finest control over matching and filtering.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the choice in practice. You want a quick directory sweep with a wordlist you already have - gobuster is the fastest to type: `gobuster dir -u http://example.com -w wordlist.txt`. You want to just point something at a site and get reasonable results without thinking about lists or extensions - dirsearch\'s defaults do that. You hit a site with a soft-404 page or need to fuzz a parameter value rather than a path - that is where ffuf\'s filtering earns its place. Same job, and you pick by how much control this particular target needs.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**gobuster** - Go, very fast, minimal flags; `dir` and `dns` modes',
              '**dirsearch** - Python, batteries included, good defaults and built-in extensions',
              '**ffuf** - the most flexible matching and filtering; best for tricky responses',
              '**All three** - same core: wordlist in, existing paths out',
              '**Pick by need** - convenience (gobuster/dirsearch) vs control (ffuf)',
            ],
          },
          {
            type: 'command',
            description: 'The same directory scan in gobuster and dirsearch:',
            commands: [
              'gobuster dir -u http://example.com -w wordlist.txt',
              'dirsearch -u http://example.com',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The gobuster output prints one line per hit like `/admin (Status: 200) [Size: 843]` - path, status, size, the same three facts ffuf gives you. dirsearch prints a similar table and, because it added extensions itself, you may see `/config.php` and `/backup.zip` show up without you specifying them. Read both the same way: status tells you the page responded, and size (compared against the site\'s not-found page) tells you whether it is real. The tool changed; the reading skill did not.',
          },
          {
            type: 'paragraph',
            text:
              'Why keep all three around: on a good day gobuster\'s speed or dirsearch\'s zero-setup gets you a hit in seconds. On a stubborn target - custom 404s, rate limits, weird responses - ffuf\'s filtering is what actually separates signal from noise. Knowing which to grab is a small efficiency that adds up across hundreds of scans, and none of them will find anything a bad wordlist left out.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The tool is the easy part',
            text:
              'gobuster, dirsearch and ffuf all live or die by the wordlist you feed them and how you read the sizes. Do not collect tools - get good at filtering results and building a relevant list.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can run a directory scan in gobuster or dirsearch and choose between them and ffuf based on how much control the target needs.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Same rule as any fuzzer',
            text: 'These tools send large bursts of requests. Point them only at systems you own or have explicit written permission to test.',
          },
          {
            type: 'quiz',
            question: 'You face a site with a custom soft-404 page and need precise response filtering. Which tool is the best fit?',
            options: [
              'gobuster, for speed',
              'dirsearch, for its defaults',
              'ffuf, for its fine-grained matching and filtering',
              'None can handle it',
            ],
            correctIndex: 2,
            explanation: 'All three discover paths, but ffuf gives the most control over matching and filtering (like -fs to drop a fake-404 size), which is exactly what a soft-404 target needs.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'burp-intruder',
    slug: 'burp-suite-quiz',
    title: 'Burp Suite check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which Burp tab lets you edit and resend one request by hand, over and over?',
        options: ['Proxy', 'Repeater', 'Target', 'Decoder'],
        correctIndex: 1,
        explanation: 'Repeater is the single-request workbench: change a value, hit Send, compare the response, repeat.',
      },
      {
        prompt: 'With Intercept on, you submit a form and the page hangs. Why?',
        options: [
          'Burp crashed',
          'Burp is holding the request until you Forward or Drop it',
          'The server is down',
          'The wordlist ran out',
        ],
        correctIndex: 1,
        explanation: 'Intercept freezes each request on Burp\'s desk. The hang is Burp waiting for you to Forward it on or Drop it.',
      },
      {
        prompt: 'After an Intruder sweep, most rows are 403 at 0 bytes and two are 200 at 380 bytes. What are the two?',
        options: [
          'Failed requests',
          'Records the server returned that you were not meant to see',
          'Cached copies',
          'Server errors',
        ],
        correctIndex: 1,
        explanation: 'The 403s are access control working; the two full-size 200s are the outliers - data that slipped through.',
      },
      {
        prompt: 'What does the free Burp Community edition NOT include?',
        options: [
          'The Proxy tab',
          'Repeater',
          'The automated scanner and full-speed Intruder',
          'Interception',
        ],
        correctIndex: 2,
        explanation: 'Community has the full manual toolkit but no scanner, and its Intruder is deliberately throttled. Both are Pro features.',
      },
      {
        prompt: 'Why should you leave Intercept OFF most of the time?',
        options: [
          'It is illegal to leave it on',
          'Every request pauses, so browsing grinds to a halt; HTTP history still records everything',
          'It disables Repeater',
          'It uses too much memory',
        ],
        correctIndex: 1,
        explanation: 'With Intercept on, every page hangs. Keep it off, browse via HTTP history, and flip it on only for the one request you want to catch.',
      },
    ],
  },
  {
    lessonSlug: 'nuclei-in-practice',
    slug: 'scanning-tools-quiz',
    title: 'Scanning Tools check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Nmap reports a port as "filtered". What does that usually mean?',
        options: [
          'The port is open',
          'The port is closed',
          'A firewall is silently dropping the probes, so the true state is hidden',
          'The service crashed',
        ],
        correctIndex: 2,
        explanation: 'Open answers SYN-ACK, closed answers RST. Filtered means nothing came back - typically a firewall eating the packets.',
      },
      {
        prompt: 'What does the nmap -sV flag do?',
        options: [
          'Scans all 65535 ports',
          'Probes open ports for their service and version',
          'Runs the default scripts',
          'Uses a stealth SYN scan',
        ],
        correctIndex: 1,
        explanation: '-sV grabs the banner on each open port and guesses the service and version - the string you look up for known issues.',
      },
      {
        prompt: 'What does the -sC flag tell nmap to do?',
        options: [
          'Scan closed ports only',
          'Run the default set of safe NSE scripts against open ports',
          'Complete a full TCP handshake',
          'Scan only the top 100 ports',
        ],
        correctIndex: 1,
        explanation: '-sC runs the default script category - safe, useful scripts that gather extra detail about each open service.',
      },
      {
        prompt: 'In a nuclei template, matchers-condition: and means what?',
        options: [
          'Any one matcher is enough',
          'Every matcher must pass for a hit',
          'It sends two requests',
          'It retries on failure',
        ],
        correctIndex: 1,
        explanation: 'With "and", all matchers must be true - e.g. status 200 AND a keyword present - which keeps false positives low.',
      },
      {
        prompt: 'Why is masscan faster than nmap on huge ranges?',
        options: [
          'It scans fewer ports by default',
          'It is stateless and asynchronous, firing packets without waiting on each reply',
          'It uses a paid cloud',
          'It skips unknown hosts',
        ],
        correctIndex: 1,
        explanation: 'Masscan does not track connections or wait in order. It blasts SYN packets and collects replies separately, trading accuracy for speed.',
      },
    ],
  },
  {
    lessonSlug: 'ffuf-deep-dive',
    slug: 'fuzzing-tools-quiz',
    title: 'Fuzzing Tools check',
    instructions: 'Four quick ones. Get three right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In an ffuf URL, what does the keyword FUZZ mark?',
        options: [
          'The wordlist file',
          'The spot where each word from the list gets substituted',
          'The output file',
          'The status code to match',
        ],
        correctIndex: 1,
        explanation: 'ffuf swaps each wordlist entry into the FUZZ position and sends that request, so /FUZZ becomes /admin, /backup, and so on.',
      },
      {
        prompt: 'ffuf returns many 200s all at 1256 bytes and one 200 at 843 bytes. What is the 843-byte one?',
        options: [
          'A server error',
          'The real page - the 1256-byte responses are a fake not-found page',
          'A duplicate',
          'Proof the site is down',
        ],
        correctIndex: 1,
        explanation: 'The site serves a custom not-found page (always 1256 bytes) with a 200 status. The different size is the genuine page; -fs 1256 filters the fakes out.',
      },
      {
        prompt: 'Why is a curated 4000-word list often better than a 200,000-word one?',
        options: [
          'It has more words',
          'It finds the same real paths with far fewer requests, avoiding rate limits and noise',
          'It needs no target',
          'Big lists are illegal',
        ],
        correctIndex: 1,
        explanation: 'A tight, relevant list hits the paths that actually exist while sending a fraction of the requests, so the real result is not buried.',
      },
      {
        prompt: 'You face a custom soft-404 page and need precise response filtering. Which tool fits best?',
        options: [
          'gobuster, for speed',
          'dirsearch, for its defaults',
          'ffuf, for its fine-grained matching and filtering',
          'None can handle it',
        ],
        correctIndex: 2,
        explanation: 'All three discover paths, but ffuf gives the most control (like -fs to drop a fake-404 size), which is what a soft-404 target needs.',
      },
    ],
  },
];
