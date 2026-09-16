import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'how-web-apps-work',
    title: 'How Web Apps Work',
    description: 'The mental model every single web bug comes from - client, server, and who you can trust.',
    lessons: [
      {
        slug: 'anatomy-of-a-web-app',
        title: 'Anatomy of a Web App',
        summary: 'Every web app is the same three parts. Learn them once and every target makes sense.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Anatomy of a web app - the three parts behind every website you attack'),
          {
            type: 'paragraph',
            text:
              'Every web app, from a college portal to Swiggy, is really just three parts talking to each other. Learn the three and no app ever looks scary again.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Frontend** - the HTML, CSS and JavaScript running in your browser. What you see and click',
              '**Backend** - the server code that receives your requests and decides what to do',
              '**Database** - where the app stores users, orders, posts, everything worth stealing',
            ],
          },
          {
            type: 'paragraph',
            text:
              'You tap a button, the frontend sends a request to the backend, the backend asks the database, and an answer comes back up the chain. Every bug you will ever find lives somewhere on that path.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'Browser (frontend)\n   |  HTTP request\n   v\nServer (backend)  --->  Database\n   ^  HTTP response\n   |\nBrowser renders the page',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Follow the data',
            text:
              'When you hunt, ask "where does my input go, and who reads it?". Your input travelling from frontend to database is the map of every attack.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can break any web app into frontend, backend and database - and trace where your input flows.',
          },
          {
            type: 'quiz',
            question: 'Where does a web app usually store its user accounts and orders?',
            options: ['In the frontend JavaScript', 'In the database', 'In the browser cookies only', 'In the DNS records'],
            correctIndex: 1,
            explanation: 'The database is the app\'s memory. The backend reads and writes it; the frontend never touches it directly.',
          },
        ],
      },
      {
        slug: 'client-vs-server-trust',
        title: 'The Golden Rule: Never Trust the Client',
        summary: 'Anything running in the browser can be changed by the user. That single fact powers half of all web bugs.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Never trust the client - the golden rule behind half of all web bugs'),
          {
            type: 'paragraph',
            text:
              'Here is the rule that unlocks web hacking: anything that runs in the browser is under the user\'s control. You can read it, change it, delete it, or fake it. So the server can never trust it.',
          },
          {
            type: 'paragraph',
            text:
              'A price field, a hidden input, a disabled button, a JavaScript check that says "you are not an admin" - all of it lives on your machine. All of it can be edited before the request ever leaves.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'A "readonly" or hidden HTML field - you can still change it in DevTools',
              'A JavaScript price of 100 - you can send 1 instead',
              'A greyed-out "Delete" button - the request behind it still works if you send it',
              'A client-side "is this user allowed?" check - trivial to skip',
            ],
          },
          {
            type: 'code',
            language: 'html',
            code:
              '<!-- The browser sees this. So do you. -->\n<input type="hidden" name="price" value="4999">\n<input type="hidden" name="role" value="user">\n<!-- Change either one before the request leaves. -->',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The server must re-check everything',
            text:
              'Every real check - price, permission, ownership - has to happen on the server. When it does not, you have found a bug.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You understand the golden rule: the client is attacker-controlled, so only the server\'s checks count.',
          },
          {
            type: 'quiz',
            question: 'A shopping site sets the price in a hidden HTML field. Why is that dangerous?',
            options: [
              'Hidden fields slow the page down',
              'The user can change the field before sending, so the server must re-check the price',
              'Hidden fields are not supported in modern browsers',
              'It exposes the database password',
            ],
            correctIndex: 1,
            explanation: 'Anything in the browser is editable. If the server trusts a client-sent price, you can pay whatever you want.',
          },
        ],
      },
      {
        slug: 'apis-and-endpoints',
        title: 'APIs and Endpoints',
        summary: 'Behind every button is a URL doing the real work. Those URLs are the endpoints - and your actual targets.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('APIs and endpoints - the real URLs behind every button you click'),
          {
            type: 'paragraph',
            text:
              'The buttons and forms you see are just pretty covers. Underneath, the app talks to the server through URLs called endpoints. Learn to see the endpoints and you stop attacking the page and start attacking the app.',
          },
          {
            type: 'paragraph',
            text:
              'An API is just the set of endpoints an app exposes. Each one does a job: log in, fetch your profile, place an order. You can call them directly, without the buttons.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'GET  /api/users/1042        -> fetch profile of user 1042\nPOST /api/login             -> send username and password\nGET  /api/orders?status=paid -> list paid orders\nDELETE /api/posts/88        -> delete post 88',
          },
          {
            type: 'command',
            description: 'Call an endpoint directly on a lab or your own app, no browser needed:',
            commands: ['curl -i http://localhost:3000/api/health', 'curl http://localhost:3000/api/users/1'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The button is optional',
            text:
              'If the UI hides a "delete" button from you but the DELETE endpoint still exists, you can call it anyway. The frontend is a suggestion, not a lock.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read an API endpoint and see the real action behind a button - and call it directly.',
          },
          {
            type: 'quiz',
            question: 'What is an API endpoint?',
            options: [
              'A page the user sees in their browser',
              'A specific URL on the server that performs an action, like /api/users/1',
              'The database itself',
              'A type of firewall rule',
            ],
            correctIndex: 1,
            explanation: 'An endpoint is a server URL that does one job. The API is the whole set of them, and you can call them without the UI.',
          },
        ],
      },
      {
        slug: 'frameworks-and-routing',
        title: 'Frameworks and Routing',
        summary: 'How the server decides which code runs for which URL - and why that mapping leaks hints.',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('How routing works - the map that decides which code runs for each URL'),
          {
            type: 'paragraph',
            text:
              'When a request hits the server, something has to decide which code handles it. That something is the router, and the frameworks apps are built on (Express, Django, Laravel, Spring) all do it in a similar way.',
          },
          {
            type: 'paragraph',
            text:
              'A route is a rule that says "this URL pattern runs this function". Patterns often carry variables, like a user id in the path. Recognising the pattern tells you how to poke at it.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'routes.js',
            code:
              "// Express-style routes\napp.get('/api/users/:id', getUser);      // :id is a variable\napp.post('/api/login', login);\napp.delete('/api/posts/:postId', deletePost);",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'A `:id` in the route means the app expects a value there - try changing it',
              'Framework error pages often reveal the framework and even the version',
              'Default framework paths (like `/admin` or `/actuator`) are worth checking',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Fingerprints everywhere',
            text:
              'A 404 page, a cookie name, or a header can quietly name the framework. Knowing the framework tells you its known weak spots.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know how routing maps a URL to server code, and how framework hints point you at weak spots.',
          },
          {
            type: 'quiz',
            question: 'In the route /api/users/:id, what does :id mean?',
            options: [
              'A fixed page called "id"',
              'A variable slot the app fills with a value, like a user number',
              'An encrypted token',
              'A comment in the code',
            ],
            correctIndex: 1,
            explanation: 'The colon marks a variable part of the path. The app plugs a real value in there, which is exactly what you will try to tamper with.',
          },
        ],
      },
      {
        slug: 'where-bugs-come-from',
        title: 'Where Bugs Actually Come From',
        summary: 'Almost every web vulnerability is the same story: the app trusted input it should not have.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Where web bugs really come from - one pattern behind almost all of them'),
          {
            type: 'paragraph',
            text:
              'Once you have seen enough bugs, they stop looking like a long list to memorise. Almost all of them are one pattern: the app trusted something it should have checked.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Trusting input** - your text became a command (injection, XSS)',
              '**Trusting identity** - the app believed you were someone else (auth bugs)',
              '**Trusting authorisation** - it let you touch things that are not yours (access control)',
              '**Trusting the client** - it believed a price or role from the browser',
              '**Trusting configuration** - a default password or open panel left the door open',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This is why the golden rule matters so much. Every module ahead is really a different flavour of "the app trusted the wrong thing". Spot the trust and you spot the bug.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A question that finds bugs',
            text:
              'For any feature, ask: "what is this trusting, and what happens if that trust is wrong?". That single question has found more bugs than any tool.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You have the master pattern - misplaced trust - that every web vulnerability in this level is built on.',
          },
          {
            type: 'practice_ref', title: 'How Web Apps Work check', exerciseSlug: 'how-web-apps-work-quiz',
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
            explanation: 'Injection, auth bugs, access control, client-trust - they are all the app trusting input, identity, or configuration it should have checked.',
          },
        ],
      },
    ],
  },
  {
    slug: 'mapping-the-target',
    title: 'Mapping the Target',
    description: 'Build a full map of an application before you attack a single feature.',
    lessons: [
      {
        slug: 'mapping-an-application',
        title: 'Mapping an Application',
        summary: 'You cannot attack what you have not mapped. Walk every feature and write down every request first.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Mapping an application - the boring step that finds the best bugs'),
          {
            type: 'paragraph',
            text:
              'New hackers rush to attack the first form they see. Good hackers map the whole app first. You cannot test what you did not find, and the best bugs are usually in the corner nobody explored.',
          },
          {
            type: 'paragraph',
            text:
              'Mapping means walking through every feature like a normal user, with your proxy recording every request. By the end you have a list of every page, every endpoint, and every parameter the app accepts.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Click through every feature: sign up, log in, edit profile, place an order',
              'Watch the requests pile up in Burp\'s proxy history or your browser Network tab',
              'Note every endpoint, every parameter, and which ones need login',
              'Flag anything that looks like an id, a filename, a redirect, or a role',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Two accounts beat one',
            text:
              'Where you can, make two low-privilege accounts. Comparing what each can see is how you spot access-control bugs later.',
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
            text: 'You know why mapping comes first, and how to build a complete list of an app\'s endpoints and parameters.',
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
            explanation: 'Mapping surfaces every endpoint and parameter. The bug you miss is almost always in the feature you never opened.',
          },
        ],
      },
      {
        slug: 'spidering-and-content-discovery',
        title: 'Spidering and Content Discovery',
        summary: 'Not every page is linked. Spidering follows links; content discovery guesses the ones nobody linked to.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Spidering vs content discovery - finding the pages nobody linked to'),
          {
            type: 'paragraph',
            text:
              'Clicking around only finds what the app links to. But apps are full of pages that exist and are never linked: old admin panels, backup files, test endpoints. Two techniques dig those out.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Spidering** - a tool follows every link automatically to build the visible map',
              '**Content discovery** - a tool guesses paths from a wordlist (`/admin`, `/backup`, `/api/v1`) and keeps the ones that exist',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Content discovery is where surprises live. A `200 OK` on `/admin.bak` or `/.git/config` can hand you source code or credentials nobody meant to leave exposed.',
          },
          {
            type: 'command',
            description: 'Brute-force paths against a lab or your own app with a wordlist:',
            commands: [
              'ffuf -u http://localhost:3000/FUZZ -w wordlist.txt',
              'gobuster dir -u http://localhost:3000 -w wordlist.txt',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the status codes',
            text:
              'A 200 means it is there. A 403 means it exists but is protected - often more interesting than a 404. A 301 redirect can reveal a real path too.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Fuzzing hammers a server with requests. Only run content discovery against systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can find pages that are never linked - the hidden panels and files that make for easy wins.',
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
            explanation: 'Spidering maps what is linked. Content discovery brute-forces paths nobody linked to, which is where hidden panels hide.',
          },
        ],
      },
      {
        slug: 'understanding-auth-flows',
        title: 'Mapping the Auth Flow',
        summary: 'Trace exactly how the app logs you in and remembers you. That flow is where account takeovers begin.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Mapping the auth flow - every request from login to logged-in'),
          {
            type: 'paragraph',
            text:
              'Before you attack login, you have to understand it. Map every step from "I am a stranger" to "the app thinks I am logged in". Each step is a place something can go wrong.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Registration - what does it accept, and does it verify email or phone?',
              'Login - what request is sent, and what comes back on success?',
              'The session token or cookie - where is it stored and how is it sent?',
              'Password reset - the flow attackers love, because it is often the weakest',
              'Logout - does it actually kill the session on the server?',
            ],
          },
          {
            type: 'code',
            language: 'http',
            code:
              'POST /api/login\nContent-Type: application/json\n\n{"email":"you@example.com","password":"hunter2"}\n\n--- response ---\nSet-Cookie: session=eyJ1c2VyIjoxMDQyfQ; HttpOnly\n{"ok":true,"userId":1042}',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Watch what the token carries',
            text:
              'Sometimes the session token or a JWT literally contains your user id or role. If you can read it, note it - later you will try changing it.',
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
            text: 'You can trace an auth flow end to end and spot where a token or reset step might be weak.',
          },
          {
            type: 'quiz',
            question: 'Which part of the auth flow is famously the weakest and worth mapping carefully?',
            options: ['The logout button', 'The password reset flow', 'The favicon', 'The CSS file'],
            correctIndex: 1,
            explanation: 'Password reset touches tokens, email, and account identity all at once, so it is a frequent source of account-takeover bugs.',
          },
        ],
      },
      {
        slug: 'finding-hidden-parameters',
        title: 'Finding Hidden Parameters',
        summary: 'Endpoints often accept parameters they never show you. Undocumented inputs are undertested inputs.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Finding hidden parameters - the inputs the app never told you about'),
          {
            type: 'paragraph',
            text:
              'An endpoint might accept `debug`, `admin`, `role` or `redirect` even though the form never shows those fields. Hidden parameters are gold, because the developers forgot to test them.',
          },
          {
            type: 'paragraph',
            text:
              'You find them by guessing. A tool fires a big list of common parameter names at the endpoint and watches which ones change the response - a different length, a new error, extra data.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'GET /api/account?id=1042            -> normal profile\nGET /api/account?id=1042&debug=true -> extra internal fields appear\nGET /api/account?id=1042&admin=1    -> response changes: worth a deeper look',
          },
          {
            type: 'command',
            description: 'Discover accepted parameters on an authorised target:',
            commands: ['ffuf -u "http://localhost:3000/api/account?FUZZ=1" -w params.txt'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'A changed response is a signal',
            text:
              'If adding a parameter changes the length, status, or content of the reply, the app is reading it. That is your thread to pull.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where you are allowed',
            text:
              'Parameter fuzzing sends many requests. Do it only against systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can uncover undocumented parameters - the untested inputs where real bugs hide.',
          },
          {
            type: 'quiz',
            question: 'How do you tell a hidden parameter is actually being used by the app?',
            options: [
              'The URL turns green',
              'Adding it changes the response - length, status, or content',
              'The browser warns you',
              'It always returns a 500 error',
            ],
            correctIndex: 1,
            explanation: 'If the server treats the request differently when the parameter is present, it is reading that parameter. A changed response is the tell.',
          },
        ],
      },
    ],
  },
  {
    slug: 'injection',
    title: 'Injection',
    description: 'When your input stops being data and becomes someone else\'s code.',
    lessons: [
      {
        slug: 'sql-injection',
        title: 'SQL Injection',
        summary: 'The classic. When your input slips into a database query, you can rewrite what the query asks for.',
        estimatedMinutes: 8,
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
              'SQL injection is the granddaddy of web bugs. It happens when an app pastes your input straight into a database query. Your text stops being data and becomes part of the command.',
          },
          {
            type: 'paragraph',
            text:
              'Picture a login that builds its query by gluing strings together. Whatever you type in the username box lands inside the query. So you type SQL, not a name.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- The app builds this from your input:\nSELECT * FROM users WHERE username = '$input' AND password = '$pw';\n\n-- You type this as the username:\n' OR '1'='1' --\n\n-- The query becomes:\nSELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = '';",
          },
          {
            type: 'paragraph',
            text:
              "The `OR '1'='1'` is always true, and `--` comments out the password check. The database happily returns the first user, and you are logged in as them without knowing any password.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              "`'` - a lone apostrophe often triggers a SQL error, the first sign of injection",
              "`' OR '1'='1' --` - the classic auth bypass",
              "`' UNION SELECT username, password FROM users --` - pull data from other tables",
              "`'; --` - close the string and comment out the rest",
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The fix names the bug',
            text:
              'The cure is *parameterised queries* - the input is sent separately from the command, so it can never become code. If an app uses them, SQLi dies.',
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
            text: 'You understand how SQL injection turns an input box into a way to rewrite the database query.',
          },
          {
            type: 'quiz',
            question: "Why does the payload ' OR '1'='1' -- often bypass a login?",
            options: [
              'It guesses the admin password',
              "It makes the WHERE clause always true and comments out the rest of the query",
              'It crashes the server so login is skipped',
              'It encrypts the password field',
            ],
            correctIndex: 1,
            explanation: "OR '1'='1' is always true, so the condition passes, and -- comments out the password check. The database returns a user and logs you in.",
          },
        ],
      },
      {
        slug: 'sqli-hands-on',
        title: 'SQL Injection Hands-On',
        summary: 'Theory is over. Here is the exact loop: find the injection point, confirm it, then extract data.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('SQL injection hands-on - from a single quote to dumping the users table'),
          {
            type: 'paragraph',
            text:
              'Real SQLi is a loop: find an input that reaches a query, confirm it is injectable, then use UNION to pull data out. Let us walk it with real requests.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 1 - find and confirm',
          },
          {
            type: 'paragraph',
            text:
              'Add a single quote to a parameter and watch for a database error or a change in the response. An error like "unclosed quotation mark" is a near-certain sign the input reaches SQL.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              "GET /api/products?category=shoes'\n\n--- response ---\n500 Internal Server Error\nSQL syntax error near ''shoes'''",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Step 2 - work out the columns, then extract',
          },
          {
            type: 'paragraph',
            text:
              'A UNION lets you bolt your own SELECT onto the app\'s query, but the column count must match. Use `ORDER BY` to find the count, then UNION the data you want.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- find the column count (increase until it errors):\nshoes' ORDER BY 3 --\n\n-- pull usernames and passwords into the product listing:\nshoes' UNION SELECT username, password, NULL FROM users --",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'What success looks like',
            text:
              'When it works, usernames and password hashes appear right in the product list where shoe names should be. That misplaced data is your proof.',
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
            text: 'You can run the full SQLi loop: find the point, confirm with an error, and extract data with UNION.',
          },
          {
            type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab' },
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
            explanation: 'A UNION needs the same number of columns as the original query. ORDER BY 1, 2, 3... errors when you exceed the column count, revealing it.',
          },
        ],
      },
      {
        slug: 'blind-sql-injection',
        title: 'Blind SQL Injection',
        summary: 'Sometimes the app shows no data and no errors. You can still read the database - one yes-or-no question at a time.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Blind SQL injection - reading a database that never shows you anything'),
          {
            type: 'paragraph',
            text:
              'Sometimes the app is injectable but shows you nothing useful - no data, no error, just "logged in" or "not found". This is blind SQLi. You cannot see the data, so you ask the database questions it answers by behaving differently.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Boolean-based: true or false',
          },
          {
            type: 'paragraph',
            text:
              'You inject a condition and watch whether the page changes. If a true condition shows the normal page and a false one shows a different page, you can read data one bit at a time.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- does the admin password start with 'a'?\n1 AND substring((SELECT password FROM users WHERE username='admin'),1,1)='a'\n\n-- page looks normal  -> true, first letter is 'a'\n-- page looks different -> false, try the next letter",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Time-based: make it wait',
          },
          {
            type: 'paragraph',
            text:
              'When even the page never changes, make the database sleep on "true". A slow response means yes; an instant one means no. Slow, but it always works.',
          },
          {
            type: 'code',
            language: 'sql',
            code:
              "-- if the condition is true, the response is delayed 5 seconds:\n1 AND IF(substring(version(),1,1)='8', SLEEP(5), 0)",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Automate the boring part',
            text:
              'Reading a password one letter at a time by hand is painful. This is exactly what tools like sqlmap automate - but understand the manual version first.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Only test blind SQLi on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can extract data even when the app shows nothing, using true/false and time-based questions.',
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
            explanation: 'A payload like IF(condition, SLEEP(5), 0) makes the server pause only when the condition is true. Response timing becomes your yes/no channel.',
          },
        ],
      },
      {
        slug: 'command-injection',
        title: 'Command Injection',
        summary: 'When an app passes your input to the operating system shell, you can run your own commands on the server.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Command injection - from a ping box to running commands on the server'),
          {
            type: 'paragraph',
            text:
              'Some apps hand your input to the operating system - a "ping this host" tool, a file converter, a backup feature. If they build a shell command by gluing in your input, you can smuggle in commands of your own.',
          },
          {
            type: 'paragraph',
            text:
              'The shell treats characters like `;`, `&&`, and `|` as "and then run this too". So you end the intended command and start your own.',
          },
          {
            type: 'code',
            language: 'bash',
            code:
              '# The app runs:  ping -c 1 <your input>\n# You enter:\n127.0.0.1; id\n\n# The server actually runs:\nping -c 1 127.0.0.1; id\n# ...and the output of "id" comes back in the response.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`; command` - run a second command after the first',
              '`&& command` - run yours only if the first succeeded',
              '`| command` - pipe the output into your command',
              '`$(command)` - run yours and substitute its output',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Start harmless',
            text:
              'Confirm with a safe command like `id` or `whoami` first. If their output appears, you have proven code execution without touching anything.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Command injection runs real commands on someone\'s server. Only test it on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot where an app feeds input to the shell and confirm command execution safely.',
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
            explanation: 'If the app builds a shell command with your input, the shell reads ; as a separator and runs id as a second command.',
          },
        ],
      },
      {
        slug: 'nosql-injection',
        title: 'NoSQL Injection',
        summary: 'Databases like MongoDB do not use SQL, but they still trust your input - and JSON operators become the weapon.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('NoSQL injection - how a JSON operator bypasses a MongoDB login'),
          {
            type: 'paragraph',
            text:
              'Not every app uses SQL. Databases like MongoDB take queries as JSON objects. There is no apostrophe to break out of, but if the app trusts your input, you can inject query operators instead.',
          },
          {
            type: 'paragraph',
            text:
              'The trick: instead of sending a string, you send an object with an operator like `$ne` (not equal) or `$gt` (greater than). Suddenly "password equals X" becomes "password is not equal to nothing", which matches everyone.',
          },
          {
            type: 'code',
            language: 'json',
            code:
              '// Normal login body:\n{ "username": "admin", "password": "secret" }\n\n// Injected body - "password not equal to empty" matches any password:\n{ "username": "admin", "password": { "$ne": "" } }',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Same disease, different syntax',
            text:
              'It is still the trust problem. The app let your input decide the query structure instead of treating it as plain data.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Only test NoSQL injection on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know NoSQL apps are injectable too, and how a query operator like $ne can bypass a check.',
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
            explanation: 'The $ne operator turns the check into "not equal to empty string". Every real account has a non-empty password, so the condition passes.',
          },
        ],
      },
      {
        slug: 'template-injection-ssti',
        title: 'Server-Side Template Injection',
        summary: 'Template engines build pages by evaluating expressions. Slip your input into the template and it gets evaluated too.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          videoSlot('Server-side template injection - when {{7*7}} comes back as 49'),
          {
            type: 'paragraph',
            text:
              'Apps build pages with template engines - Jinja2, Twig, Freemarker - that evaluate little expressions like `{{ user.name }}`. If your input lands inside the template instead of being passed to it, the engine evaluates your expressions too.',
          },
          {
            type: 'paragraph',
            text:
              'The famous test is math. Send `{{7*7}}` in a field that gets rendered. If `49` comes back, the engine ran your expression - and that often escalates all the way to running code on the server.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'Input:   {{7*7}}\nOutput:  49          <- the template engine evaluated it\n\nInput:   ${7*7}       <- different engines use different syntax\nOutput:  49',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The 49 tells you the engine',
            text:
              'Which syntax returns 49 hints at which engine is running. That decides which follow-up payloads can reach command execution.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'SSTI can lead to full server takeover. Only test it on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can detect template injection with a simple math test and understand why it is so dangerous.',
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
            explanation: 'A literal 49 means the template engine evaluated your expression instead of printing it as text. That is server-side template injection.',
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
        explanation: 'Everything in the browser is under the user\'s control, so the server must re-check every value it receives.',
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
          "It makes the condition always true and comments out the password check",
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
