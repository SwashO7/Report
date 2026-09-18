import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'how-web-apps-work',
    title: 'How Web Apps Work',
    description:
      "The mental model every web bug grows out of: a browser, a server, a database, and the request travelling between them. By the end you can split any app into those parts, trace exactly where your input lands, and name what the server should have re-checked - which is the same as naming the bug before you have even found it.",
    lessons: [
      {
        slug: 'anatomy-of-a-web-app',
        title: 'Anatomy of a Web App',
        summary: 'Every web app is the same three parts. Learn them once and every target makes sense.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('Anatomy of a web app - the three parts behind every website you attack'),
          {
            type: 'paragraph',
            text:
              'Every web app, from your college portal to Swiggy, is really the same three parts talking to each other. Learn the three and where they hand off to one another, and no target ever looks scary again - it just looks like the same machine wearing a different logo.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Frontend** - the HTML, CSS and JavaScript running in your browser. Everything you see and click. It runs on *your* machine, so you fully control it.',
              '**Backend** - the server code that receives your requests and decides what to do. It runs on the company\'s machine, so you never see this code directly.',
              '**Database** - where the app keeps users, orders, posts, everything worth stealing. Only the backend talks to it; the frontend never touches it.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here is one round trip in slow motion. You tap "Add to cart". The frontend builds an HTTP request - a `POST /api/cart` carrying the product id - and sends it to the backend. The backend reads the request, checks you are logged in, and runs a database query to save the item against your account. The database returns "done", the backend builds a JSON reply, and the frontend updates the little cart badge. That whole loop happens in a fraction of a second, and every bug you will ever find lives somewhere on that path.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'Browser (frontend)\n   |  HTTP request:  POST /api/cart  { "product": 88 }\n   v\nServer (backend)  --->  Database:  INSERT INTO cart ...\n   ^  HTTP response: { "ok": true, "items": 3 }\n   |\nBrowser renders the updated cart',
          },
          {
            type: 'paragraph',
            text:
              'That diagram is the whole game. Notice the request goes out from a machine you control and lands on one you do not. The gap between them - the network hop - is where you get to see and change everything, because the frontend has already done its job and the backend has not yet started checking. A proxy like Burp sits exactly in that gap.',
          },
          {
            type: 'paragraph',
            text:
              'Why does this split matter for hacking? Because responsibilities are split too. The frontend is there to be convenient and pretty; it is not a security boundary. The backend is the only place that can actually enforce a rule, because it is the only part the user cannot rewrite. When you hear "the client is untrusted", this is what it means: the frontend is a helpful suggestion, and the backend is the law.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Follow the data',
            text:
              'When you hunt, keep asking one question: "where does my input go, and who reads it?". Your input travelling from frontend to backend to database is the literal map of every attack you will run.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can break any web app into frontend, backend and database, and trace a single click all the way to the database and back.',
          },
          {
            type: 'quiz',
            question: 'Where does a web app usually store its user accounts and orders?',
            options: ['In the frontend JavaScript', 'In the database', 'In the browser cookies only', 'In the DNS records'],
            correctIndex: 1,
            explanation:
              "The database is the app's memory. The backend reads and writes it; the frontend never touches it directly, which is why stealing data almost always means getting the backend to run a query it should not.",
          },
        ],
      },
      {
        slug: 'client-vs-server-trust',
        title: 'The Golden Rule: Never Trust the Client',
        summary: 'Anything running in the browser can be changed by the user. That single fact powers half of all web bugs.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Here is the one rule that unlocks web hacking: anything that runs in the browser is under the user's control. You can read it, change it, delete it, or fake it before it is ever sent. So the server can never trust a single thing the browser tells it.",
          },
          {
            type: 'paragraph',
            text:
              "The reason is mechanical, not philosophical. The frontend is HTML and JavaScript that got downloaded to your machine. Once it is on your machine, it is yours. You can open DevTools and rewrite a value, or - more powerfully - catch the outgoing request in a proxy and edit it after the page's own JavaScript has run. A price field, a hidden input, a disabled button, a check that says \"you are not an admin\" - all of it lives on your side of the wire.",
          },
          {
            type: 'paragraph',
            text:
              'Walk one worked example. A shop puts the price in the page so it can show it, and the "Buy" form submits that price back. A normal user sends `price=4999`. You catch that request in Burp and change it to `price=1` before forwarding. If the server just charges whatever price the request carried, you have bought a phone for one rupee. The bug is not that the price was in the page - it is that the server *believed* the price the browser sent instead of looking it up itself.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'A "readonly" or hidden HTML field - editable in DevTools, and editable again in the proxy',
              'A JavaScript price of 4999 - you can send 1 instead',
              'A greyed-out "Delete" button - the request behind it still works if you send it by hand',
              'A client-side "is this user allowed?" check - runs on your machine, so trivial to skip',
              'A dropdown that only lists your own account ids - nothing stops you typing a different id in the request',
            ],
          },
          {
            type: 'code',
            language: 'http',
            code:
              'POST /api/checkout HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nproduct=88&price=4999&role=user\n\n# Caught in the proxy, edited before forwarding:\nproduct=88&price=1&role=admin',
          },
          {
            type: 'paragraph',
            text:
              'Read that request carefully. Every value in the body came from the browser, so every value is suspect. `price=1` tests whether the server trusts a client price. `role=admin` tests whether it trusts a client-sent role. You are not breaking anything clever - you are just asking the server, one field at a time, "did you actually check this, or did you take my word for it?".',
          },
          {
            type: 'paragraph',
            text:
              'What is the impact when the answer is "took your word for it"? It depends on the field. A trusted price is fraud. A trusted role is privilege escalation - you become an admin. A trusted account id is access to someone else\'s data. In a report you would show the original request, the edited request, and the server\'s response proving it accepted your change - that before/after pair is the whole finding.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The server must re-check everything',
            text:
              'Every real decision - price, permission, ownership, quantity - has to be made again on the server using data it can trust. When a server skips that re-check and trusts the request, you have found a bug.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Editing requests to test trust is only legal on systems you own or are authorised to test. On this platform, practise it on the labs.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              "You understand the golden rule: the client is attacker-controlled, so only the server's own checks count for anything.",
          },
          {
            type: 'quiz',
            question: 'A shopping site sets the price in a hidden HTML field. Why is that dangerous?',
            options: [
              'Hidden fields slow the page down',
              'The user can change the field before sending, so the server must re-check the price itself',
              'Hidden fields are not supported in modern browsers',
              'It exposes the database password',
            ],
            correctIndex: 1,
            explanation:
              'Anything in the browser is editable, in DevTools or in a proxy. If the server trusts a client-sent price instead of looking it up, you can pay whatever you want.',
          },
        ],
      },
      {
        slug: 'apis-and-endpoints',
        title: 'APIs and Endpoints',
        summary: 'Behind every button is a URL doing the real work. Those URLs are the endpoints - and your actual targets.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The buttons and forms you see are just pretty covers. Underneath, the app talks to the server through URLs called endpoints. Learn to see the endpoints and you stop attacking the page and start attacking the app itself - which is where the bugs actually are.',
          },
          { type: 'heading', level: 3, text: 'What an endpoint actually is' },
          {
            type: 'paragraph',
            text:
              'An API is simply the full set of endpoints an app exposes. Each endpoint is a URL plus an HTTP method that does one job: log in, fetch your profile, place an order, delete a post. The method matters as much as the URL - `GET /api/posts/88` reads post 88, `DELETE /api/posts/88` destroys it. Same URL, completely different action, chosen by the verb. The frontend button labelled "Delete" is nothing more than a device that fires `DELETE /api/posts/88` when you tap it; the real action was always the request, and you can send that request yourself.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like ordering at a dhaba. The menu card is the frontend - it shows you what you can ask for. But the waiter carrying your order to the kitchen is the request, and the kitchen is the backend. If you know how the waiter phrases an order, you can walk up and place one yourself without ever looking at the menu. Endpoints are that phrasing, written down.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'GET    /api/users/1042         -> fetch profile of user 1042\nPOST   /api/login              -> send username and password\nGET    /api/orders?status=paid -> list paid orders\nDELETE /api/posts/88           -> delete post 88',
          },
          {
            type: 'paragraph',
            text:
              'Read that list like a hacker. Every number is a knob you can turn: `1042` is a user id you could change to `1043`. Every query parameter is an input you can bend: `status=paid` might also accept `status=all`, quietly listing orders that are not yours. Every method is a capability: if `DELETE /api/posts/88` exists, it does not care that the UI only offered a delete button on *your* posts. The URL is a sentence, and every noun and verb in it is something you can edit.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**GET** - read something. Parameters ride in the URL after `?`.',
              '**POST** - create or submit. Data usually rides in the request body.',
              '**PUT / PATCH** - update an existing thing.',
              '**DELETE** - remove a thing.',
              'A number in the path (`/users/1042`) is almost always a database id you can try changing.',
              'JSON responses often name endpoints you never saw - a `"next": "/api/orders?page=2"` field is a fresh path handed to you for free.',
            ],
          },
          { type: 'heading', level: 3, text: 'Call one yourself' },
          {
            type: 'command',
            description: 'Call an endpoint directly on a lab or your own app, no browser needed. -i prints the response headers too:',
            commands: ['curl -i http://localhost:3000/api/health', 'curl -i http://localhost:3000/api/users/1'],
          },
          {
            type: 'paragraph',
            text:
              'The `curl` reply is the raw truth the browser normally hides. Here is a real example of what `curl -i http://localhost:3000/api/users/1` might print back:',
          },
          {
            type: 'code',
            language: 'http',
            filename: 'response',
            code:
              'HTTP/1.1 200 OK\nContent-Type: application/json\nX-Powered-By: Express\nContent-Length: 96\n\n{"id":1,"name":"Ravi","email":"ravi@example.com","role":"user","createdAt":"2024-03-11"}',
          },
          {
            type: 'paragraph',
            text:
              'Read it top to bottom. The first line is the status - `200 OK` means the request worked; `401 Unauthorized` would mean you needed a login, and `404 Not Found` would mean no such user. The headers name the stack (`X-Powered-By: Express`) and would carry any `Set-Cookie` the server hands you. The body is the JSON the frontend would have prettied into a profile card. The finding here is quiet but real: you got a full profile - name, email, role - with no cookie, no login, nothing. That is an endpoint with no auth check. The way you tell it apart from a false positive is to send the *exact same request with no session* and see if it still returns real data; if a logged-out `curl` still shows Ravi email address, the endpoint genuinely leaks, and you could not have spotted it by clicking buttons.',
          },
          {
            type: 'paragraph',
            text:
              'Why does this pay off? Because the endpoint is where every rule is either enforced or forgotten. The button on the page can hide, grey out, or disable itself all day - none of that touches the endpoint behind it. When you learn to read and call endpoints directly, you test what the server actually does instead of what the designer hoped you would do, and the gap between those two is exactly where the bugs live.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The button is optional',
            text:
              'If the UI hides a "delete" button from you but the DELETE endpoint still exists and is not properly checked, you can call it anyway with curl or a proxy. The frontend is a suggestion, not a lock.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can read an API endpoint - its method, path, and parameters - see the real action behind a button, and call it directly.',
          },
          {
            type: 'quiz',
            question: 'What is an API endpoint?',
            options: [
              'A page the user sees in their browser',
              'A specific URL plus method on the server that performs an action, like DELETE /api/posts/88',
              'The database itself',
              'A type of firewall rule',
            ],
            correctIndex: 1,
            explanation:
              'An endpoint is a server URL and method that does one job. The API is the whole set of them, and you can call any of them directly without touching the UI.',
          },
        ],
      },
      {
        slug: 'frameworks-and-routing',
        title: 'Frameworks and Routing',
        summary: 'How the server decides which code runs for which URL - and why that mapping leaks hints.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'When a request hits the server, something has to decide which function handles it. That something is the router, and the frameworks apps are built on - Express, Django, Laravel, Spring - all solve the same problem in a similar way. Understanding it tells you how to probe an endpoint and how to guess ones you have not seen.',
          },
          {
            type: 'paragraph',
            text:
              'A route is a rule that says "this URL pattern runs this function". The server keeps an ordered list of these rules and, for each incoming request, walks the list and runs the first pattern that matches. Patterns usually carry variables - a user id in the path, a slug, a filename. Recognising the pattern tells you exactly which piece of the URL the app expects to change, and that is the piece you tamper with.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'routes.js',
            code:
              "// Express-style routes, checked top to bottom\napp.get('/api/users/:id', getUser);       // :id is a variable slot\napp.post('/api/login', login);\napp.delete('/api/posts/:postId', deletePost);\napp.get('/api/users/me', getMe);          // never reached - :id matched first",
          },
          {
            type: 'paragraph',
            text:
              'Look at that last line. Because the router runs the first match, `/api/users/me` is swallowed by `/api/users/:id` above it - the app tries to look up a user literally named "me". Route ordering bugs like this are real: a specific path registered after a greedy `:id` pattern quietly never runs. When an endpoint behaves oddly, mismatched route order is a genuine cause worth suspecting.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'A `:id` in a route means the app expects a value there - so try changing it to another id',
              'Framework error pages often reveal the framework and sometimes the version',
              'Default framework paths worth checking: `/admin`, `/actuator`, `/debug`, `/api/v1`',
              'A specific route hidden behind a greedy `:param` route may never run at all',
            ],
          },
          {
            type: 'command',
            description: 'Fingerprint the framework from its response headers and its error page:',
            commands: ['curl -I http://localhost:3000/', 'curl http://localhost:3000/this-path-does-not-exist'],
          },
          {
            type: 'paragraph',
            text:
              'Read what comes back. `curl -I` shows headers only - an `X-Powered-By: Express` or a `Server:` line often names the stack outright. The 404 body is the second tell: a default Express 404 says `Cannot GET /this-path-does-not-exist`, while Django, Laravel and Spring each have their own recognisable error page. Once you know the framework, you know its default paths and its known weak spots, which turns blind guessing into targeted testing.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Fingerprints everywhere',
            text:
              'A 404 page, a cookie name (`connect.sid`, `laravel_session`, `JSESSIONID`), or a header can quietly name the framework. Knowing the framework points you straight at its known weak spots.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text:
              'You know how routing maps a URL to server code, why route order can hide an endpoint, and how framework hints point you at weak spots.',
          },
          {
            type: 'quiz',
            question: 'In the route /api/users/:id, what does :id mean?',
            options: [
              'A fixed page called "id"',
              'A variable slot the app fills with a value, like a user number, which you can try changing',
              'An encrypted token',
              'A comment in the code',
            ],
            correctIndex: 1,
            explanation:
              'The colon marks a variable part of the path. The app plugs a real value in there, which is exactly what you try to tamper with - swapping one id for another.',
          },
        ],
      },
      {
        slug: 'where-bugs-come-from',
        title: 'Where Bugs Actually Come From',
        summary: 'Almost every web vulnerability is the same story: the app trusted input it should not have.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Once you have seen enough bugs, they stop looking like a long list to memorise. Almost every one is the same story told with different words: the app trusted something it should have checked. Learn the pattern and you can predict where a bug lives before you find it.',
          },
          {
            type: 'paragraph',
            text:
              'Trust always fails at a boundary - the line where data crosses from a place you control into a place the app controls. Your keyboard to the server. One user\'s request to another user\'s data. A config file to a running service. At each boundary the app either re-checks what crossed, or it assumes the value is fine. Every assumption is a candidate bug, and the five categories below are just five kinds of assumption.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Trusting input** - your text became a command or markup (SQL injection, command injection, XSS)',
              '**Trusting identity** - the app believed you were someone else (weak login, forgeable tokens)',
              '**Trusting authorisation** - it let you touch things that are not yours (IDOR, broken access control)',
              '**Trusting the client** - it believed a price, quantity or role sent from the browser',
              '**Trusting configuration** - a default password, an open debug panel, a public backup left the door open',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here is the pattern working on a concrete feature. A profile page loads via `GET /api/account?id=1042`. Ask the trust question of each part. The `id` is input - what if you send `1043`? That tests trusting authorisation. The session cookie proves who you are - what if it is guessable? That tests trusting identity. If the app pastes `id` into a database query, that tests trusting input. One boring endpoint, three separate trust boundaries, three possible bugs.',
          },
          {
            type: 'paragraph',
            text:
              'This is why the golden rule from the last lesson matters so much, and why the rest of this level is organised the way it is. Every module ahead - injection, auth, access control - is really one flavour of "the app trusted the wrong thing". Spot the trust and you have spotted the bug; the payload is just the proof.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A question that finds bugs',
            text:
              'For any feature, ask: "what is this trusting, and what happens if that trust is wrong?". That single question has found more bugs than any automated tool.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You have the master pattern - misplaced trust at a boundary - that every web vulnerability in this level is built on.',
          },
          {
            type: 'practice_ref',
            title: 'How Web Apps Work check',
            exerciseSlug: 'how-web-apps-work-quiz',
          },
          {
            type: 'quiz',
            question: 'What single idea sits behind almost every web vulnerability?',
            options: [
              'The app was written in the wrong language',
              'The app trusted something it should have verified',
              'The server was too slow',
              'The user had a weak password',
            ],
            correctIndex: 1,
            explanation:
              'Injection, auth bugs, access control, client-trust - they are all the app trusting input, identity, or configuration it should have re-checked at a boundary.',
          },
        ],
      },
    ],
  },
  {
    slug: 'mapping-the-target',
    title: 'Mapping the Target',
    description:
      "Before you attack one feature, you build a full map of the application - every page, endpoint, parameter and login step. This module teaches the reconnaissance loop: walk the app through a proxy, spider and brute-force the hidden paths, trace the auth flow end to end, and hunt undocumented parameters. By the end your attack surface is a written list, not a guess.",
    lessons: [
      {
        slug: 'mapping-an-application',
        title: 'Mapping an Application',
        summary: 'You cannot attack what you have not mapped. Walk every feature and record every request first.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('Mapping an application - the boring step that finds the best bugs'),
          {
            type: 'paragraph',
            text:
              'New hackers rush to attack the first form they see. Good hackers map the whole app first. You cannot test what you never found, and the best bugs are almost always in the corner nobody bothered to explore. Mapping is slow, unglamorous, and where real findings begin.',
          },
          {
            type: 'paragraph',
            text:
              'Mapping means walking through every feature like a normal, slightly nosy user - with a proxy such as Burp sitting between your browser and the server, recording every single request. You are not attacking yet. You are building an inventory: every page, every endpoint, every parameter, and which ones need a login. When you are done, you have a to-do list of things to test.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Click through every feature: sign up, log in, edit profile, upload a file, place an order, search',
              "Watch the requests pile up in Burp's proxy history (or your browser's Network tab)",
              'Note every endpoint, every parameter, and which requests carry your session cookie',
              'Flag anything that looks like an id, a filename, a redirect URL, a role, or an amount',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Take one concrete pass. You sign up, and the proxy shows `POST /api/register`. You log in: `POST /api/login`, and the reply sets a session cookie. You open your profile: `GET /api/users/1042`. You edit it: `POST /api/users/1042` with a body full of fields. Right there, in that history, you have already found the interesting bit - the `1042` in two URLs is your own id, and \"what if I put 1043\" is now a test on your list.",
          },
          {
            type: 'paragraph',
            text:
              "Why does this matter beyond tidiness? Because coverage is the difference between a real assessment and a lucky poke. A parameter you never recorded is a parameter you never tested, and a bug in an unrecorded parameter is a bug you will report as \"not found\" when it was really \"not looked at\". The map is what lets you say, honestly, that you tested the whole surface.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two accounts beat one',
            text:
              'Where you can, make two low-privilege accounts. Comparing what each one can see and do is how you spot access-control bugs later - user A trying to open user B\'s resource.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay in bounds',
            text:
              'Only map and test targets you own or are authorised to test. On this platform, that means the labs.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              "You know why mapping comes first, and how to build a complete written list of an app's endpoints, parameters and auth requirements.",
          },
          {
            type: 'quiz',
            question: 'Why map an application before attacking it?',
            options: [
              'To make the app run faster',
              'You cannot test features you never found, and the map shows every input to attack',
              'It is required by law',
              'Mapping fixes the bugs automatically',
            ],
            correctIndex: 1,
            explanation:
              'Mapping surfaces every endpoint and parameter. The bug you miss is almost always in the feature you never opened, so coverage is the whole point.',
          },
        ],
      },
      {
        slug: 'spidering-and-content-discovery',
        title: 'Spidering and Content Discovery',
        summary: 'Not every page is linked. Spidering follows links; content discovery guesses the ones nobody linked to.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Spidering vs content discovery - finding the pages nobody linked to'),
          {
            type: 'paragraph',
            text:
              'Clicking around only finds what the app links to. But apps are full of pages that exist and are never linked from anywhere: old admin panels, backup files, test endpoints, a `/api/v1` left running after `/api/v2` shipped. Two techniques dig those out, and they work in opposite ways.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Spidering** - a tool starts at the homepage and follows every link it finds, then every link on those pages, building the *visible* map automatically',
              '**Content discovery** - a tool takes a wordlist of common paths (`/admin`, `/backup`, `/.git`, `/api/v1`) and requests each one, keeping the paths that actually respond',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Spidering is the honest half: it only ever finds what the app already admits to. A crawler behaves like a very patient visitor, reading each page, collecting every `href` and form action, then visiting those too, until it runs out of new links. That gives you the sitemap the developers meant you to have. Useful, but it can only ever show you the front-of-house rooms.',
          },
          {
            type: 'paragraph',
            text:
              'Content discovery is where the surprises live, because it finds things no link points to. It works by brute force: fire thousands of guessed paths at the server and read the status code each one returns. The tool does not know what exists - the server tells it, one response at a time. A `200 OK` on `/admin.bak` or `/.git/config` can hand you source code or credentials nobody meant to leave exposed. It is the difference between reading the society noticeboard and rattling every door in the building to see which ones are unlocked.',
          },
          { type: 'heading', level: 3, text: 'Run it and read the verdicts' },
          {
            type: 'command',
            description: 'Brute-force paths against a lab or your own app with a wordlist. FUZZ marks where each word is inserted:',
            commands: [
              'ffuf -u http://localhost:3000/FUZZ -w wordlist.txt',
              'gobuster dir -u http://localhost:3000 -w wordlist.txt',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here is what a few useful lines of ffuf output actually look like - the path it tried, the status code, and the response size:',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'admin                   [Status: 200, Size: 4213, Words: 812]\nbackup                  [Status: 403, Size: 162,  Words: 12]\napi/v1                  [Status: 301, Size: 178,  Words: 8]\n.git/config             [Status: 200, Size: 402,  Words: 41]\nlicense.txt             [Status: 404, Size: 146,  Words: 9]',
          },
          {
            type: 'paragraph',
            text:
              'Read that as a table of guesses and verdicts. `admin` returned `200` with a real 4 KB page - that path is there and openable, your first place to look. `backup` returned `403`: it exists but is protected, which is often *more* interesting than a `200`, because someone cared enough to lock it. `api/v1` returned `301`, a redirect - follow the `Location` header and it points at the real path. `.git/config` at `200` is the jackpot: an exposed git config can leak the whole source repository. The `404` on `license.txt` is just a wrong guess, and a wall of those is noise you scroll past. The trick to reading this output is that the interesting paths are the ones that react at all - a size that jumps, or any status that is not `404`.',
          },
          {
            type: 'paragraph',
            text:
              'One caution on telling a real find from a false one: some servers return `200` for *everything*, even nonsense paths, as a soft error page. If `/this-is-not-real-xyz123` also comes back `200` with the same size as your "hits", the server is lying and every `200` is worthless. Establish that baseline first - request a path you know cannot exist - and only then trust the codes.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the status codes',
            text:
              'A 200 means it is there. A 403 means it exists but is protected - often the better lead. A 301/302 can reveal a real path in its redirect. A 404 is just a miss.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Content discovery hammers a server with thousands of requests. Only run it against systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You can find pages that are never linked - the hidden panels and forgotten files that make for the easiest wins.',
          },
          {
            type: 'quiz',
            question: 'What is the difference between spidering and content discovery?',
            options: [
              'They are the same thing',
              'Spidering follows existing links; content discovery guesses unlinked paths from a wordlist',
              'Spidering is illegal, content discovery is not',
              'Content discovery only works on HTTPS',
            ],
            correctIndex: 1,
            explanation:
              'Spidering maps what is linked. Content discovery brute-forces paths nobody linked to, which is exactly where hidden panels and backup files hide.',
          },
        ],
      },
      {
        slug: 'understanding-auth-flows',
        title: 'Mapping the Auth Flow',
        summary: 'Trace exactly how the app logs you in and remembers you. That flow is where account takeovers begin.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Before you attack login, you have to understand it. Map every step from "I am a total stranger" to "the app is convinced I am user 1042". Authentication is not one request - it is a chain, and each link is a place something can go wrong.',
          },
          {
            type: 'paragraph',
            text:
              'The chain has two jobs that people confuse. First, *authentication* - proving who you are, which mostly happens once at login. Then, *session management* - the app remembering you are still that person on every request after, usually with a cookie or token you carry. Most account-takeover bugs are not in the password check itself; they are in the remembering. So map both halves: how you prove it, and how the app keeps trusting the proof.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Registration - what does it accept, and does it verify email or phone before trusting it?',
              'Login - what request is sent, and what exactly comes back on success?',
              'The session token or cookie - where is it stored, how is it sent on later requests, and what does it contain?',
              'Password reset - the flow attackers love, because it is often the weakest link in the chain',
              'Logout - does it actually kill the session on the server, or just delete the cookie locally?',
            ],
          },
          { type: 'heading', level: 3, text: 'Watch one login end to end' },
          {
            type: 'paragraph',
            text:
              'Watch one login in the proxy. You send credentials, and the server answers by setting a cookie and confirming who you now are.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'POST /api/login HTTP/1.1\nContent-Type: application/json\n\n{"email":"you@example.com","password":"hunter2"}\n\n--- response ---\nHTTP/1.1 200 OK\nSet-Cookie: session=eyJ1c2VyIjoxMDQyfQ; HttpOnly\n{"ok":true,"userId":1042}',
          },
          {
            type: 'paragraph',
            text:
              'Now read the reply like an attacker, line by line. The body literally tells you that you are `userId:1042` - so ids are plain sequential integers, which means `1043` is another real person and every id-carrying endpoint is a candidate for tampering. The `Set-Cookie` header is the app handing you the identity you will carry on every later request. And the cookie value itself, `eyJ1c2VyIjoxMDQyfQ`, is the loudest clue of all: strings that start with `eyJ` are almost always base64-encoded JSON. Decode it and it reads `{"user":1042}`. The app is storing your identity in a value that *you* hold and can rewrite.',
          },
          {
            type: 'paragraph',
            text:
              'That decoded cookie is where you separate a real thread from a dead end. If you change the cookie to `{"user":1043}`, re-encode it to base64, replay the request, and the app hands you user 1043 data - that is a confirmed broken session, full account takeover. If instead the server rejects it with a `401`, the cookie is probably *signed* - there is a cryptographic signature checking the value was not touched, and your edit failed the check. A false positive here looks like success but is not: you edited the cookie, still saw *your own* data, and mistook "the server ignored my broken cookie and used the real session" for a win. Always confirm the returned data actually belongs to the *other* account before you call it a bug.',
          },
          {
            type: 'paragraph',
            text:
              'The reason this mapping pays off is that auth bugs are high impact by definition. A weak reset flow or a forgeable token is not "read one extra record" - it is account takeover, and often admin takeover. In a report, the flow you mapped is the evidence: here is login, here is the token, here is the single value I changed, here is me holding another account. That before-and-after pair, with the other user data plainly visible, is the whole finding.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Watch what the token carries',
            text:
              'Sometimes the session cookie or a JWT literally contains your user id or role. If you can read it, note it - later you will test whether changing it is enough to become someone else.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own accounts only',
            text:
              'Only probe auth flows on accounts and systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can trace an auth flow end to end, read what a token carries, and spot where a reset step or a token might be weak.',
          },
          {
            type: 'quiz',
            question: 'Which part of the auth flow is famously the weakest and worth mapping carefully?',
            options: ['The logout button', 'The password reset flow', 'The favicon', 'The CSS file'],
            correctIndex: 1,
            explanation:
              'Password reset touches tokens, email, and account identity all at once, so it is a frequent source of account-takeover bugs.',
          },
        ],
      },
      {
        slug: 'finding-hidden-parameters',
        title: 'Finding Hidden Parameters',
        summary: 'Endpoints often accept parameters they never show you. Undocumented inputs are undertested inputs.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Finding hidden parameters - the inputs the app never told you about'),
          {
            type: 'paragraph',
            text:
              'An endpoint might quietly accept `debug`, `admin`, `role`, `redirect` or `format` even though the form never shows those fields. Hidden parameters are gold, because the developers forgot they were there - which means they forgot to test them, and forgot to secure them.',
          },
          {
            type: 'paragraph',
            text:
              'Why do these exist at all? Because code outlives the UI. A developer adds `?debug=true` to dump extra info while building a feature, ships it, and removes the button but never the code. A parameter meant for an internal admin tool still works on the public endpoint because both call the same function. The frontend simply never sends these, so nobody looking at the app through a browser would ever know they are accepted. The server, meanwhile, is still cheerfully reading them.',
          },
          {
            type: 'paragraph',
            text:
              'You find them the same way content discovery finds pages: by guessing and watching. A tool fires a big list of common parameter names at the endpoint and compares each response to a baseline. Most guessed names change nothing - the server ignores them and the reply is byte-for-byte identical. But when one changes the response, the server is reading it, and you have found an input nobody documented. The whole method rests on one idea: a parameter the server ignores cannot change the answer, so any change *is* the signal.',
          },
          { type: 'heading', level: 3, text: 'A worked experiment' },
          {
            type: 'code',
            language: 'http',
            code:
              'GET /api/account?id=1042             -> 200, normal profile, length 512\nGET /api/account?id=1042&debug=true  -> 200, extra internal fields, length 780\nGET /api/account?id=1042&admin=1     -> 200, response changes shape: worth a deeper look',
          },
          {
            type: 'paragraph',
            text:
              'Read those three lines as a controlled experiment. The first is your baseline - normal size, normal fields, length 512. Adding `debug=true` jumps the response length to 780 and leaks internal fields, so the app is definitely reading `debug`. Adding `admin=1` changes the response too. A changed length, a new field, a different status, a fresh error message - any of these is the server admitting it processed the parameter. Identical responses mean the guess was ignored, and you move on.',
          },
          {
            type: 'command',
            description: 'Discover accepted parameters on an authorised target. Filter to hide the boring identical responses:',
            commands: ['ffuf -u "http://localhost:3000/api/account?FUZZ=1" -w params.txt -fs 512'],
          },
          {
            type: 'paragraph',
            text:
              'Here is the kind of output that filter leaves on screen once the noise is gone:',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'debug                   [Status: 200, Size: 780]\nformat                  [Status: 200, Size: 655]\nadmin                   [Status: 500, Size: 121]',
          },
          {
            type: 'paragraph',
            text:
              'That `-fs 512` tells ffuf to hide every response whose size equals the 512-byte baseline - so the only rows left are the parameters that changed something. `debug` and `format` both altered the body size, meaning the server read them. `admin` is even louder: it triggered a `500` error, which usually means the code tried to *do* something with your value and tripped over it - a strong hint the parameter reaches real logic. Now separate signal from noise: a change that is stable when you repeat the request is real; a size that wobbles by a few bytes every time (a timestamp, a CSRF token, a random id in the page) is not a parameter effect, it is just the page being dynamic. Re-send the winning request two or three times, and only trust the ones that change the response the *same* way every time.',
          },
          {
            type: 'paragraph',
            text:
              'Finding the parameter is only step one; the payoff is what it unlocks. `debug=true` leaking internal fields might expose password hashes or other users data. A working `admin=1` or `role=admin` is privilege escalation. A `redirect=` parameter is a candidate for open-redirect or SSRF. The discovery gives you the input; the next lessons give you what to feed it. Reading tool output well is mostly about filtering away the noise so this handful of real signals is impossible to miss.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A changed response is a signal',
            text:
              'If adding a parameter changes the length, status, or content of the reply, the app is reading it. That is your thread to pull - the next question is what the parameter does.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where you are allowed',
            text:
              'Parameter fuzzing sends a large volume of requests. Do it only against systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can uncover undocumented parameters - the untested, unsecured inputs where real bugs quietly wait.',
          },
          {
            type: 'quiz',
            question: 'How do you tell a hidden parameter is actually being used by the app?',
            options: [
              'The URL turns green',
              'Adding it changes the response - length, status, or content - compared to the baseline',
              'The browser warns you',
              'It always returns a 500 error',
            ],
            correctIndex: 1,
            explanation:
              'If the server treats the request differently when the parameter is present, it is reading that parameter. A changed response versus the baseline is the tell.',
          },
        ],
      },
    ],
  },
  {
    slug: 'injection',
    title: 'Injection',
    description:
      "The bug class where your input stops being data and becomes someone else's code - the query, the shell command, the template. This module walks SQL injection from a single apostrophe to dumping a table, then blind extraction with no output, command injection into the OS, NoSQL operator abuse, and template injection. By the end you can find an injection point, confirm it is real, and prove impact.",
    lessons: [
      {
        slug: 'sql-injection',
        title: 'SQL Injection',
        summary: 'The classic. When your input slips into a database query, you can rewrite what the query asks for.',
        estimatedMinutes: 9,
        importance: 'essential',
        blocks: [
          videoSlot('SQL injection explained - how one apostrophe reads the whole database'),
          {
            type: 'image',
            src: '/api/v1/diagrams/sqli-flow',
            alt: 'A safe query beside the same query broken by an injected quote',
            caption: 'Close the quote and your input becomes logic.',
          },
          {
            type: 'paragraph',
            text:
              'SQL injection is the granddaddy of web bugs, and the diagram above is the whole idea in one picture: on the left, your input sits safely inside quotes as plain data; on the right, an injected apostrophe closes those quotes early, and everything after it stops being your name and starts being part of the command. It happens whenever an app builds a database query by gluing your input into a string.',
          },
          {
            type: 'paragraph',
            text:
              'Walk it slowly. A login takes your username and password and builds a query to check them. If it builds that query by string concatenation, whatever you type lands *inside* the query text. So instead of typing a name, you type SQL - and the database, which cannot tell your input apart from the developer\'s own code, runs all of it together.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- The app builds this from your input:\nSELECT * FROM users WHERE username = '$input' AND password = '$pw';\n\n-- You type this as the username:\n' OR '1'='1' --\n\n-- The query the database actually runs:\nSELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = '';",
          },
          {
            type: 'paragraph',
            text:
              "Trace the transformation. Your leading `'` closes the empty username string. `OR '1'='1'` adds a condition that is always true, so the WHERE clause passes no matter what. Then `--` starts a SQL comment, so the entire password check after it is ignored. The database happily returns the first user in the table, and the app logs you in as them - without you knowing a single password. That is a full authentication bypass from one text box.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              "`'` - a lone apostrophe often triggers a SQL error, the very first sign the input reaches a query",
              "`' OR '1'='1' --` - the classic authentication bypass",
              "`' UNION SELECT username, password FROM users --` - pull data out of other tables",
              "`'; --` - close the string and comment out the rest of the intended query",
            ],
          },
          {
            type: 'paragraph',
            text:
              "How do you know it fired versus a false positive? A real bypass logs you in as a *different, specific* account you did not have the password for, or an error message quotes your broken SQL back at you (`syntax error near ''`). A false positive is a login that fails the same way it always does, or a generic \"invalid credentials\" that never changes. Confirmation means the app behaved *differently* because of your quote - a new error, a new session, data that should not be there.",
          },
          {
            type: 'paragraph',
            text:
              'The impact scales fast, which is why SQLi is treated so seriously. Reading one row is bad; a UNION can dump the entire users table with password hashes; some databases let you write files or run commands from a SQL context. In a report you would show the injectable parameter, the exact payload, and the response containing data you should never have been able to reach - and you would recommend parameterised queries as the fix.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The fix names the bug',
            text:
              'The cure is *parameterised queries* (prepared statements): the input is sent to the database separately from the command, so it is always treated as data and can never become code. If an app uses them everywhere, SQLi simply dies.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Only test SQL injection on systems you own or are explicitly authorised to test. Practise it on the labs here.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You understand how SQL injection turns an input box into a way to rewrite the database query, and how to tell a real bypass from a normal failed login.',
          },
          {
            type: 'quiz',
            question: "Why does the payload ' OR '1'='1' -- often bypass a login?",
            options: [
              'It guesses the admin password',
              'It makes the WHERE clause always true and comments out the rest of the query',
              'It crashes the server so login is skipped',
              'It encrypts the password field',
            ],
            correctIndex: 1,
            explanation:
              "OR '1'='1' is always true, so the condition passes, and -- comments out the password check. The database returns a user and logs you in.",
          },
        ],
      },
      {
        slug: 'sqli-hands-on',
        title: 'SQL Injection Hands-On',
        summary: 'Theory is over. Here is the exact loop: find the injection point, confirm it, then extract data.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('SQL injection hands-on - from a single quote to dumping the users table'),
          {
            type: 'paragraph',
            text:
              'Real SQLi is a loop with three stages: find an input that reaches a query, confirm it is genuinely injectable, then use a UNION to pull data out. Every SQLi you ever land follows this shape. Let us walk it with real requests and real responses.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 1 - find and confirm',
          },
          {
            type: 'paragraph',
            text:
              'Pick a parameter and add a single quote. Then watch what changes. A database error, a 500, or a broken page where content used to be is a near-certain sign your input reached the SQL and unbalanced its quotes.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              "GET /api/products?category=shoes'\n\n--- response ---\n500 Internal Server Error\nSQL syntax error near ''shoes'''",
          },
          {
            type: 'paragraph',
            text:
              "Read that error as a confession. The server took your `shoes'`, pasted it into a query, and the extra quote left the SQL malformed - so the database complained and the app leaked the complaint straight to you. Compare it to the false positive: if `category=shoes'` returns a normal, empty product list with no error, the quote may have been escaped or handled safely, and this parameter is probably not injectable. The tell is a *SQL-shaped* error, not just any error.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 2 - find the columns, then extract',
          },
          {
            type: 'paragraph',
            text:
              "A UNION lets you bolt your own SELECT onto the app's query so its results appear where the products should. But a UNION only works when both SELECTs return the same number of columns, so first you count them with `ORDER BY`, then you UNION in the data you actually want.",
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- find the column count: increase the number until it errors\nshoes' ORDER BY 3 --      -> works\nshoes' ORDER BY 4 --      -> error: unknown column 4  (so there are 3 columns)\n\n-- pull usernames and passwords into the product listing:\nshoes' UNION SELECT username, password, NULL FROM users --",
          },
          {
            type: 'paragraph',
            text:
              'Read the ORDER BY trick: the query can sort by column 1, 2, 3, but asking for column 4 errors because it does not exist - so the original query returns exactly 3 columns. Now your UNION supplies 3 values (`username`, `password`, and a `NULL` filler) to match. When it fires, usernames and password hashes appear right in the product list where shoe names should be. That misplaced data - login credentials rendered as products - is your proof, and it is unmistakable.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'What success looks like versus a false positive',
            text:
              'Success: rows of usernames and hashes shown where product names belong. False positive: a normal product list, an empty result, or a generic error that never changes no matter what you inject - that means your input is not landing in the query.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only on lab or authorised targets',
            text:
              'Extracting data from a real database you do not own is a crime. Run this only on the labs or systems you are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text:
              'You can run the full SQLi loop: find the point, confirm with a SQL error, count columns with ORDER BY, and extract data with UNION.',
          },
          {
            type: 'lab_ref',
            labSlug: 'invoice-portal',
            title: 'Try it: Invoice Portal lab',
          },
          {
            type: 'quiz',
            question: 'In a UNION-based SQLi, why do you first run ORDER BY with increasing numbers?',
            options: [
              'To sort the results alphabetically',
              'To find how many columns the original query returns, so your UNION matches',
              'To slow the database down',
              'To delete the other rows',
            ],
            correctIndex: 1,
            explanation:
              'A UNION needs the same number of columns as the original query. ORDER BY 1, 2, 3... errors when you exceed the column count, revealing it.',
          },
        ],
      },
      {
        slug: 'blind-sql-injection',
        title: 'Blind SQL Injection',
        summary: 'Sometimes the app shows no data and no errors. You can still read the database - one yes-or-no question at a time.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('Blind SQL injection - reading a database that never shows you anything'),
          {
            type: 'paragraph',
            text:
              'Sometimes a parameter is injectable but the app shows you nothing useful - no data on the page, no error message, just "logged in" or "not found". This is blind SQL injection. You cannot read the data directly, so instead you ask the database yes-or-no questions and read the answers from how the app behaves.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Boolean-based: true or false',
          },
          {
            type: 'paragraph',
            text:
              'You inject a condition and watch whether the page changes. If a condition that is TRUE gives the normal page and a FALSE one gives a different page (or none), then the page itself becomes a one-bit answer. Chain enough of those bits and you can read any value out, one character at a time.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- does the admin password's first character equal 'a'?\n1 AND substring((SELECT password FROM users WHERE username='admin'),1,1)='a'\n\n-- page looks normal  -> condition TRUE  -> first character is 'a'\n-- page looks different -> condition FALSE -> try 'b', then 'c', ...",
          },
          {
            type: 'paragraph',
            text:
              "Read the payload as a question. `substring(...,1,1)` grabs just the first character of the admin password; `='a'` asks whether it is 'a'. The `1 AND ...` glues that question onto the original query. If the normal page comes back, the answer is yes and you have the first letter; if the page changes, the answer is no and you move to the next letter. Confirming it is real means proving the two states are stable: `...='a'` and a deliberately false `...='zzz'` must reliably give the two different pages, or you are chasing noise.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Time-based: make it wait',
          },
          {
            type: 'paragraph',
            text:
              'When even the page never changes - same response whatever you inject - you make the database *sleep* on a true answer. A slow response means yes; an instant one means no. It is slow going, but it works when nothing else visible does.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- if the condition is true, the response is delayed 5 seconds:\n1 AND IF(substring(version(),1,1)='8', SLEEP(5), 0)",
          },
          {
            type: 'paragraph',
            text:
              'Read the timing as the channel. `IF(condition, SLEEP(5), 0)` tells the database: if the condition holds, pause 5 seconds, otherwise return instantly. So you time the response - a reply that takes ~5 seconds means the condition was true, a fast reply means false. To rule out a false positive from a slow network, repeat it: a real time-based injection is *consistently* ~5s for true and fast for false, and swapping `SLEEP(5)` for `SLEEP(2)` should change the delay to match.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Automate the boring part',
            text:
              'Reading a password one letter at a time by hand is painful and error-prone. This is exactly what a tool like sqlmap automates - but learn the manual version first, so you know what the tool is doing and can confirm its findings.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Only test blind SQLi on systems you own or are authorised to test. The request volume alone can stress a server.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can extract data even when the app shows nothing, using true/false page differences and time-based delays as your answer channel.',
          },
          {
            type: 'quiz',
            question: 'In time-based blind SQLi, how does the database answer "true"?',
            options: [
              'It prints the data on the page',
              'It delays the response, so a slow reply means true',
              'It returns a 404 error',
              'It emails you the answer',
            ],
            correctIndex: 1,
            explanation:
              'A payload like IF(condition, SLEEP(5), 0) makes the server pause only when the condition is true. Response timing becomes your yes/no channel.',
          },
        ],
      },
      {
        slug: 'command-injection',
        title: 'Command Injection',
        summary: 'When an app passes your input to the operating system shell, you can run your own commands on the server.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Command injection - from a ping box to running commands on the server'),
          {
            type: 'paragraph',
            text:
              'Some apps hand your input to the operating system - a "ping this host" diagnostic, an image converter that shells out to a tool, a backup feature that runs a command. If the app builds that shell command by gluing your input into a string, you can smuggle in commands of your own. This is command injection, and it often means running code directly on the server.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is the shell itself. A shell reads certain characters as "the command ends here, now run the next one". `;`, `&&`, `|`, and `$(...)` are all separators or substitutions. So if your input reaches a shell unescaped, you end the command the developer intended and start your own.',
          },
          {
            type: 'code',
            language: 'bash',
            code:
              '# The app runs:  ping -c 1 <your input>\n# You enter this as the host:\n127.0.0.1; id\n\n# The server actually runs two commands:\nping -c 1 127.0.0.1; id\n# ...and the output of "id" is returned in the response.',
          },
          {
            type: 'paragraph',
            text:
              'Trace it. The app expected a hostname and built `ping -c 1 <input>`. Your `;` ended the ping command, and `id` became a second command the shell also ran. Now read the response to confirm it fired: you are looking for the *output of id* - a line like `uid=33(www-data) gid=33(www-data)`. If that appears, you have proven command execution beyond any doubt. A false positive looks like the normal ping output with no `uid=` line, or an error saying the host was invalid - meaning your `;` was escaped or filtered.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`; command` - run a second command after the first, regardless of its result',
              '`&& command` - run yours only if the first command succeeded',
              '`| command` - pipe the first command\'s output into yours',
              '`$(command)` - run yours and substitute its output inline',
            ],
          },
          {
            type: 'command',
            description: 'On an authorised lab target, confirm execution with a harmless command first:',
            commands: ['curl "http://localhost:3000/ping?host=127.0.0.1;id"', 'curl "http://localhost:3000/ping?host=127.0.0.1;whoami"'],
          },
          {
            type: 'paragraph',
            text:
              'Read the reply for the proof, not the ping. The ping lines are noise; the signal is the extra output your injected command produced - a username from `whoami`, a uid string from `id`. Seeing your command\'s output echoed back is the difference between "I think this is injectable" and "here is code execution". Always start with a read-only command like `id`; you have proven the bug without changing or breaking anything.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Start harmless',
            text:
              'Confirm with a safe, read-only command like `id` or `whoami` first. If its output appears in the response, you have proven code execution without touching the system.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              "Command injection runs real commands on someone else's server. Only test it on systems you own or are authorised to test, and keep every command read-only.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can spot where an app feeds input to the shell, inject a second command, and confirm code execution safely from its output.',
          },
          {
            type: 'quiz',
            question: 'Why does entering 127.0.0.1; id into a ping tool sometimes run the id command?',
            options: [
              'id is a valid IP address',
              'The semicolon tells the shell to run a second command after ping',
              'ping always runs id afterwards',
              'The browser executes it locally',
            ],
            correctIndex: 1,
            explanation:
              'If the app builds a shell command with your input, the shell reads ; as a separator and runs id as a second command, returning its output.',
          },
        ],
      },
      {
        slug: 'nosql-injection',
        title: 'NoSQL Injection',
        summary: 'Databases like MongoDB do not use SQL, but they still trust your input - and JSON operators become the weapon.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Not every app uses SQL. Databases like MongoDB take their queries as JSON objects, not text strings. There is no apostrophe to break out of, so people assume they are safe. They are not: if the app builds its query straight from your JSON input, you can inject query *operators* instead of quotes.',
          },
          {
            type: 'paragraph',
            text:
              'To see why, look at how a Mongo login check actually works. The app takes the username and password you sent and asks the database to find one matching document: something like `db.users.findOne({ username: input.username, password: input.password })`. In plain words that is "find the user where username equals what they typed AND password equals what they typed". If both match a stored record, you are logged in. The whole check hinges on those two values being treated as plain strings to compare against.',
          },
          {
            type: 'paragraph',
            text:
              'The trick is that MongoDB queries understand special keys like `$ne` (not equal), `$gt` (greater than), and `$regex`. Normally the app sends `{ password: "secret" }`, meaning "password equals secret". But if you can send an object instead of a string, you swap `"secret"` for `{ "$ne": "" }`, and the query silently changes meaning from "password equals X" to "password is not equal to empty" - which is true for every real account. You did not guess the password; you rewrote the *question* so that any password answers it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Only test NoSQL injection on systems you own or are authorised to test.',
          },
          { type: 'heading', level: 3, text: 'The payload and how to read it' },
          {
            type: 'code',
            language: 'json',
            code:
              '// Normal login body the app expects:\n{ "username": "admin", "password": "secret" }\n\n// Injected body - "password not equal to empty" matches any real password:\n{ "username": "admin", "password": { "$ne": "" } }',
          },
          {
            type: 'paragraph',
            text:
              "Read the two bodies. In the first, `password` is a string, so Mongo checks for that exact value and a wrong password fails. In the second, `password` is an object with `$ne`, so Mongo checks \"is the stored password not equal to empty string?\" - and since admin's real password is not empty, the check passes and you are logged in as admin. The reason this even reaches the database is that many apps parse the incoming JSON and pass it into the query without checking that `password` is a *string*. An object slips straight through.",
          },
          {
            type: 'paragraph',
            text:
              "Now separate a real hit from a false positive, because this is where beginners fool themselves. A genuine success is a real logged-in admin session - you get a valid session cookie and the response body shows admin data, `{\"ok\":true,\"role\":\"admin\"}` or similar. A false positive is the same `{\"error\":\"invalid credentials\"}` you would get with any wrong password: that means the app coerced your object to a string (so `{ \"$ne\": \"\" }` became the literal text and matched nobody) or validated the input type and rejected it. Another false lead is a `500` error - that tells you the input broke something, not that you are logged in. Only a working, authenticated session with someone else's role counts as the finding. Confirm by using the returned cookie on a profile endpoint and checking you really are admin.",
          },
          {
            type: 'paragraph',
            text:
              "Why does this matter, and where does it go next? `$ne` on a login is the classic, but the same trick reads data too. A `$regex` in a search or reset field can extract a secret one character at a time by asking \"does it start with a? with b?\" and watching which query returns a result. The impact ranges from authentication bypass to slow data exfiltration, and it is all the same root cause: the app let your input decide the query's *shape* instead of pinning it to a fixed type.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Same disease, different syntax',
            text:
              'It is still the trust problem from the first module. The app let your input decide the *structure* of the query - object versus string - instead of treating it as plain data of a fixed type.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text:
              'You know NoSQL apps are injectable too, and how a query operator like $ne turns a login check into a condition that matches everyone.',
          },
          {
            type: 'quiz',
            question: 'How does {"password": {"$ne": ""}} bypass a MongoDB login?',
            options: [
              'It guesses the password',
              'It changes the query to "password is not equal to empty", which matches any real password',
              'It deletes the password field',
              'It crashes MongoDB',
            ],
            correctIndex: 1,
            explanation:
              'The $ne operator turns the check into "not equal to empty string". Every real account has a non-empty password, so the condition passes and you log in.',
          },
        ],
      },
      {
        slug: 'template-injection-ssti',
        title: 'Server-Side Template Injection',
        summary: 'Template engines build pages by evaluating expressions. Slip your input into the template and it gets evaluated too.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          videoSlot('Server-side template injection - when {{7*7}} comes back as 49'),
          {
            type: 'paragraph',
            text:
              'Apps build pages with template engines - Jinja2, Twig, Freemarker, Handlebars - that evaluate small expressions like `{{ user.name }}` and drop the result into the HTML. That is normal and safe when your input is *passed to* the template as data. It becomes server-side template injection when your input gets built *into* the template itself, because then the engine evaluates your expressions as if the developer wrote them.',
          },
          {
            type: 'paragraph',
            text:
              'The famous test is arithmetic, because it is unambiguous. Put `{{7*7}}` in a field that is rendered back to you - a name, a search term, an error message that echoes your input. If the page shows the literal text `{{7*7}}`, the input was treated as data and you are safe. If it shows `49`, the engine evaluated your expression, and you have SSTI. There is no other reason `49` appears.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'Input:   {{7*7}}\nOutput:  49          <- the template engine evaluated your expression: SSTI\n\nInput:   ${7*7}       <- different engines use different delimiters\nOutput:  49\n\nInput:   {{7*7}}\nOutput:  {{7*7}}      <- printed literally: NOT vulnerable, just reflected text',
          },
          {
            type: 'paragraph',
            text:
              'Read the three cases carefully, because this is exactly how you separate a real finding from a false positive. `49` means evaluation happened - that is the bug. The literal `{{7*7}}` printed back is just reflected input, which might be XSS but is *not* template injection. And *which* delimiter returns `49` fingerprints the engine: `{{ }}` points at Jinja2 or Twig, `${ }` at Freemarker or a Java stack. That fingerprint decides which follow-up payloads can escalate toward reading files or running commands.',
          },
          {
            type: 'paragraph',
            text:
              'Why does a maths trick matter so much? Because SSTI rarely stops at arithmetic. Template engines can usually reach the objects and functions of the language behind them, so a confirmed `{{7*7}}` often escalates to reading server files or full remote code execution. In a report you would show the reflected input point, the `{{7*7}}` returning `49` as proof of evaluation, and name the engine - impact framed as "template evaluation, escalating to code execution" is what makes it a critical finding.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The 49 tells you the engine',
            text:
              'Which delimiter returns 49 - `{{ }}` versus `${ }` versus something else - hints at which engine is running. That decides which follow-up payloads can reach file reads or command execution.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'SSTI can lead to full server takeover. Only test it on systems you own or are authorised to test, and stop at the harmless maths proof unless authorised to go further.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can detect template injection with a simple maths test, tell it apart from plain reflection, and explain why it is so dangerous.',
          },
          {
            type: 'quiz',
            question: 'You put {{7*7}} in a form field and the page shows 49. What does that mean?',
            options: [
              'The app did the maths for you as a feature',
              'Your input is being evaluated by the server-side template engine - a sign of SSTI',
              'The number 49 is a random error code',
              'The database returned it',
            ],
            correctIndex: 1,
            explanation:
              'A literal 49 means the template engine evaluated your expression instead of printing it as text. That is server-side template injection.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'where-bugs-come-from',
    slug: 'how-web-apps-work-quiz',
    title: 'How Web Apps Work check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What are the three parts of almost every web app?',
        options: [
          'Frontend, backend, database',
          'Router, switch, firewall',
          'HTML, CSS, images',
          'TCP, UDP, DNS',
        ],
        correctIndex: 0,
        explanation: 'The frontend runs in the browser, the backend runs on the server, and the database stores the data.',
      },
      {
        prompt: 'The golden rule of web hacking is:',
        options: [
          'Never trust the server',
          'Never trust the client - anything in the browser can be changed',
          'Always use HTTPS',
          'Scan every port first',
        ],
        correctIndex: 1,
        explanation: "Everything in the browser is under the user's control, so the server must re-check every value it receives.",
      },
      {
        prompt: 'What is an API endpoint?',
        options: [
          'A page in the browser',
          'A server URL that performs a specific action, like /api/users/1',
          'A CSS style',
          'A database table',
        ],
        correctIndex: 1,
        explanation: 'An endpoint is a URL on the server that does one job. You can call it directly, without the UI button.',
      },
      {
        prompt: 'In the route /api/posts/:id, the :id part is:',
        options: [
          'A fixed page name',
          'A variable slot the app fills with a value',
          'An encryption key',
          'A comment',
        ],
        correctIndex: 1,
        explanation: 'The colon marks a variable in the path. The app substitutes a real value there, which is what you try to tamper with.',
      },
      {
        prompt: 'What single idea sits behind almost every web vulnerability?',
        options: [
          'Slow servers',
          'The app trusted something it should have verified',
          'Weak Wi-Fi',
          'Old browsers',
        ],
        correctIndex: 1,
        explanation: 'Injection, auth bugs, and access control are all versions of the app trusting input, identity, or config it should have checked.',
      },
    ],
  },
  {
    lessonSlug: 'finding-hidden-parameters',
    slug: 'mapping-the-target-quiz',
    title: 'Mapping the Target check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why map an application before attacking it?',
        options: [
          'It makes the app faster',
          'You cannot test features you never found, and the map lists every input',
          'It fixes the bugs for you',
          'It is required to load the page',
        ],
        correctIndex: 1,
        explanation: 'Mapping surfaces every endpoint and parameter. The bug you miss is usually in the feature you never opened.',
      },
      {
        prompt: 'What does content discovery do that spidering does not?',
        options: [
          'It follows visible links',
          'It guesses unlinked paths from a wordlist, like /admin or /backup',
          'It encrypts the traffic',
          'It logs you in automatically',
        ],
        correctIndex: 1,
        explanation: 'Spidering follows links; content discovery brute-forces paths nobody linked to, which is where hidden panels hide.',
      },
      {
        prompt: 'Which part of the auth flow is famously the weakest?',
        options: ['The logout button', 'The password reset flow', 'The favicon', 'The homepage'],
        correctIndex: 1,
        explanation: 'Password reset combines tokens, email, and account identity, making it a frequent source of account-takeover bugs.',
      },
      {
        prompt: 'How do you tell a hidden parameter is being used by the app?',
        options: [
          'The URL bar turns green',
          'Adding it changes the response - length, status, or content',
          'The browser shows a warning',
          'It always returns 200',
        ],
        correctIndex: 1,
        explanation: 'If the server behaves differently when the parameter is present, it is reading that parameter.',
      },
      {
        prompt: 'When content discovery returns a 403 on a path, that usually means:',
        options: [
          'The path does not exist',
          'The path exists but is protected - often more interesting than a 404',
          'Your internet is down',
          'The server crashed',
        ],
        correctIndex: 1,
        explanation: 'A 403 means the resource is there but access is denied, which is often a more promising lead than a plain 404.',
      },
    ],
  },
  {
    lessonSlug: 'command-injection',
    slug: 'injection-quiz',
    title: 'Injection check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: "Why does ' OR '1'='1' -- often bypass a login?",
        options: [
          'It guesses the password',
          'It makes the condition always true and comments out the password check',
          'It crashes the database',
          'It encrypts the query',
        ],
        correctIndex: 1,
        explanation: "OR '1'='1' is always true and -- comments out the rest, so the query returns a user and logs you in.",
      },
      {
        prompt: 'What is the real fix for SQL injection?',
        options: [
          'Hiding the login page',
          'Parameterised queries, which send input separately from the command',
          'Using a longer password',
          'Blocking the apostrophe key',
        ],
        correctIndex: 1,
        explanation: 'Parameterised queries keep input as data, so it can never become part of the SQL command.',
      },
      {
        prompt: 'In time-based blind SQLi, how does the database signal "true"?',
        options: [
          'It prints the data',
          'It delays the response, so a slow reply means true',
          'It returns a 404',
          'It logs you out',
        ],
        correctIndex: 1,
        explanation: 'A payload like IF(condition, SLEEP(5), 0) makes the server pause only when the condition is true.',
      },
      {
        prompt: 'Why does 127.0.0.1; id sometimes run the id command in a ping tool?',
        options: [
          'id is an IP address',
          'The shell reads the semicolon as a separator and runs id as a second command',
          'ping always runs id',
          'The browser runs it',
        ],
        correctIndex: 1,
        explanation: 'If the app builds a shell command with your input, ; starts a new command that the shell also runs.',
      },
      {
        prompt: 'You submit {{7*7}} and the page returns 49. What did you find?',
        options: [
          'A calculator feature',
          'Server-side template injection - your expression was evaluated',
          'A random error',
          'A caching bug',
        ],
        correctIndex: 1,
        explanation: 'A literal 49 means the template engine evaluated your input instead of printing it, which is SSTI.',
      },
    ],
  },
];
