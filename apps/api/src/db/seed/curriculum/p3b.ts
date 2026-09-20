import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'web-languages',
    title: 'Web Languages',
    description:
      'Read the code you are attacking. By the end you can look at a page and see its HTML skeleton, spot where user input lands in a form, tell what CSS can and cannot hide, and read a JavaScript snippet well enough to find a fetch or an eval you should worry about. Not a web dev course - just enough to understand the surface before you test it.',
    lessons: [
      {
        slug: 'html-crash-course',
        title: 'HTML: Reading a Page\'s Skeleton',
        summary: 'HTML is the structure under every page. Learn to read it and you can see exactly where your input goes.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'HTML is the skeleton of every web page. It is not code that runs or decides things - it is just structure that says "here is a heading, here is a form, here is a box to type in". You do not need to build pages. You need to read them, because HTML is where you find the forms and inputs that carry your data to the server, and that is where bugs live.',
          },
          {
            type: 'paragraph',
            text:
              'A page is built from tags. A tag is a name in angle brackets, and most come in pairs: `<p>hello</p>` is a paragraph containing the word hello. The opening `<p>` starts it, the closing `</p>` ends it. Tags nest inside each other like boxes inside boxes, which is why a page is a tree - a body holds a form, the form holds inputs, and so on down. Tags also carry *attributes*, extra settings written as `name="value"` inside the opening tag. Those attributes are often the whole story for a hacker.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Where your input lands',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real form. Say a login page has `<form action="/login" method="POST"><input name="username"><input name="password" type="password"><button>Sign in</button></form>`. Read it: the `form` is a bundle of inputs, `action="/login"` is the URL it sends to, and `method="POST"` is how it sends. Each `<input>` has a `name` - `username` and `password` - and those names are exactly the keys the server receives. So when you type `admin` into that first box and submit, the server gets `username=admin`. Now you know the parameter names to test without guessing.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`<form>` - a bundle of inputs; `action` is where it sends, `method` is GET or POST',
              '`<input name="x">` - a box; its `name` becomes the parameter the server reads',
              '`type="hidden"` - an input the user never sees but the browser still submits',
              '`<a href="...">` - a link; `href` is the URL it points to',
              '`<script src="...">` - loads JavaScript, either inline or from another file',
              'An `id` or `class` attribute is just a label used by CSS and JS to find an element',
            ],
          },
          {
            type: 'paragraph',
            text:
              'To read any page\'s real HTML, right-click and choose "View page source" for what the server sent, or "Inspect" to see the live structure after scripts have run. Press F12 to open the same developer tools. Hunt for `<form>`, `<input>`, and especially `type="hidden"` fields - a hidden input like `<input type="hidden" name="role" value="user">` is invisible on screen but the browser submits it anyway, and changing `user` to `admin` before hitting send is one of the oldest tricks that still works.',
          },
          {
            type: 'command',
            description: 'Pull the raw HTML of a page from the terminal and search it for input fields:',
            commands: ['curl -s https://example.com/login | grep -i "input\\|form"'],
          },
          {
            type: 'paragraph',
            text:
              'That command downloads the page\'s HTML with `curl` and filters it to only the lines mentioning `input` or `form`, so the noise falls away and the fields you care about stand out. Each matching line shows you a `name` attribute - the exact parameter the server expects. If you see `name="redirect"` or `name="user_id"` in the output, you have just found a parameter to probe, before you have even opened a browser tool.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Hidden does not mean secret',
            text:
              'A `type="hidden"` input is invisible on the page but travels to the server exactly like a visible one. The browser trusts it, so the server often does too - which is why tampering with hidden fields is a classic first test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can open any page, read its HTML, and point at the exact inputs and hidden fields that carry data to the server. That is where you will aim every test that follows.',
          },
          { type: 'practice_ref', title: 'Web Languages check', exerciseSlug: 'web-languages-quiz' },
          {
            type: 'quiz',
            question: 'A form has `<input name="email">`. When the user submits, what does the server receive?',
            options: ['A parameter called email with the typed value', 'Nothing, inputs are display-only', 'The word input', 'The email tag itself'],
            correctIndex: 0,
            explanation: 'An input\'s name attribute becomes the parameter key the server reads, paired with whatever value the user typed.',
          },
        ],
      },
      {
        slug: 'css-enough-to-break-it',
        title: 'CSS: Just Enough',
        summary: 'CSS decides how a page looks, not what it does. The one security lesson: it can hide, but it cannot remove.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'If HTML is the skeleton, CSS is the clothes. It controls colour, spacing, fonts and layout - how a page looks. For a hacker, CSS matters for exactly one reason, so we keep this short: CSS can *hide* things from your eyes, but it never *removes* them from the page. Anything hidden with CSS is still sitting right there in the HTML, waiting to be read.',
          },
          {
            type: 'paragraph',
            text:
              'CSS works with selectors. A selector picks elements, then a rule styles them. `p { color: red; }` means "every paragraph, make the text red". You target things by tag name (`p`), by class (`.warning`, matching `class="warning"`), or by id (`#login`, matching `id="login"`). That is genuinely all the selector knowledge you need to read code you are attacking - enough to follow which rule affects which element.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the part that matters. A developer wants to hide an admin button from normal users, so they write `.admin-panel { display: none; }`. It vanishes from the screen. But `display: none` only tells the browser "do not draw this". The HTML for that panel - links, buttons, maybe a delete action - is still fully present in the page source. Open developer tools, find the element, flip the style off, and it reappears, fully clickable. The security was never real; it was a coat of paint over an unlocked door.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`p { }` - selects by tag; `.name { }` selects by class; `#name { }` selects by id',
              '`display: none` - hides an element but leaves it in the HTML',
              '`visibility: hidden` - same idea, still present in the page',
              'CSS never enforces security - it only changes appearance',
              'Anything hidden by CSS is readable in "View source" and editable in dev tools',
            ],
          },
          {
            type: 'command',
            description: 'Find elements a page tried to hide with CSS, straight from the source:',
            commands: ['curl -s https://example.com | grep -i "display:\\s*none\\|hidden"'],
          },
          {
            type: 'paragraph',
            text:
              'This pulls the page and shows any lines using `display: none` or a `hidden` attribute. Each hit is a spot where the developer decided you should not see something - a debug link, a hidden form field, an admin control. The output points you straight at the elements worth un-hiding in dev tools. What was hidden for a reason is often the most interesting thing on the page.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Hiding is not securing',
            text:
              'Never trust that "the user cannot see it" means "the user cannot reach it". If sensitive data or an admin action is only hidden by CSS, it is one dev-tools click from being visible and used.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read basic CSS selectors and, more importantly, you know that anything CSS hides is still in the page and fully within reach.',
          },
          {
            type: 'quiz',
            question: 'A "delete account" button is styled with `display: none`. Can a normal user still trigger it?',
            options: ['No, it is gone', 'Yes - it is still in the HTML and can be un-hidden or called directly', 'Only the admin can', 'Only if JavaScript is off'],
            correctIndex: 1,
            explanation: 'display: none only stops the browser from drawing the element. The HTML and its action remain in the page and are reachable through dev tools or a direct request.',
          },
        ],
      },
      {
        slug: 'javascript-crash-course',
        title: 'JavaScript Crash Course',
        summary: 'JavaScript is the muscle that makes pages act. Read it well enough to spot a fetch or an eval you should worry about.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'HTML is the skeleton, CSS the clothes, JavaScript the muscles - it makes the page move and react. It runs inside the browser, on the visitor\'s machine, and it can read what you type, send requests, and change the page on the fly. You are not here to write apps. You are here to read someone else\'s script and answer one question: does this do anything dangerous with untrusted input?',
          },
          {
            type: 'paragraph',
            text:
              'Start with the pieces you will see everywhere. A *variable* holds a value: `let user = "admin"` labels a box `user` and puts the text `admin` in it. A *function* is a named block of steps you can run: `function login(name) { ... }` takes an input called `name` and does something with it. An *object* groups related values with labels, like a contact card: `let account = { id: 42, role: "user" }` - you read a field with `account.role`. If you can follow a variable into a function and see what comes out, you can read most snippets.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The lines that should catch your eye',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real snippet: `let name = location.search; document.getElementById("hello").innerHTML = name;`. Read it slowly. `location.search` is the part of the URL after the `?` - fully attacker-controlled, since anyone can put anything in a URL. `innerHTML = name` writes that value straight into the page as HTML. So if you visit the page with `?<img src=x onerror=alert(1)>` in the URL, that string becomes live HTML and the browser runs it. That is DOM-based XSS, and you found it just by reading two lines and asking "where does the input come from, and where does it end up?"',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`let` / `const` / `var` - declare a variable (a labelled box for a value)',
              '`function name(args) { }` - a reusable block; `args` are the inputs it receives',
              '`obj.field` - read a labelled value out of an object',
              '`eval(x)` - runs the string `x` as code; a giant red flag if `x` is user input',
              '`innerHTML = x` - writes `x` into the page as HTML; another sink for XSS',
              '`fetch(url)` - sends a network request from the browser (covered next lesson)',
              '`location`, `document`, `window` - built-in objects that expose the URL and the page',
            ],
          },
          {
            type: 'command',
            description: 'Download a page and its scripts, then grep for the dangerous sinks:',
            commands: ['curl -s https://example.com/app.js | grep -n "eval\\|innerHTML\\|document.write\\|fetch"'],
          },
          {
            type: 'paragraph',
            text:
              'The `-n` flag numbers each matching line so you can jump to it. A hit on `eval` or `innerHTML` is not automatically a bug - it is a place to look. What you check next is whether the value being passed in can be influenced by a user (a URL parameter, a form field, a message). If it can, you may have found something. If it is a hard-coded string the developer wrote, it is safe. The grep finds the candidates; your reading decides which ones matter.',
          },
          {
            type: 'paragraph',
            text:
              'This is the core skill for finding client-side bugs. Cross-site scripting, insecure redirects and leaked secrets in front-end code are all found by reading JavaScript and tracing where untrusted input flows. You do not need to understand every line of a huge bundle - you need to find the few lines where outside data meets a dangerous function.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Follow the data, not every line',
            text:
              'You will never read a whole minified bundle line by line. Instead, find the sinks (`eval`, `innerHTML`, `fetch`) and work backwards: does the value reaching them come from something a user controls?',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can read a JavaScript snippet, name the variables and functions, and spot the sinks where user input turns into code or HTML.',
          },
          {
            type: 'quiz',
            question: 'You see `element.innerHTML = location.hash`. Why is that worth a closer look?',
            options: ['It is slow', 'It writes an attacker-controlled URL value straight into the page as HTML', 'It only works in old browsers', 'It hides the element'],
            correctIndex: 1,
            explanation: 'location.hash is part of the URL, so a user controls it. Writing it into innerHTML lets that value run as HTML - the setup for DOM XSS.',
          },
        ],
      },
      {
        slug: 'the-dom-and-events',
        title: 'The DOM and Events',
        summary: 'The page is a live object your scripts can change. That single idea is the whole basis of DOM XSS.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'When the browser loads HTML, it does not just show it - it builds a live model of the page in memory called the DOM (Document Object Model). Think of it as the page turned into an object your JavaScript can read and rewrite while you watch. Change the DOM and the screen changes instantly. Understanding this is not optional trivia: it is the whole reason a class of bug called DOM XSS exists.',
          },
          {
            type: 'paragraph',
            text:
              'The DOM is a tree, mirroring how HTML tags nest. At the top is `document`. Under it sits the page, then the body, then every element inside. Scripts reach into this tree to find and change things: `document.getElementById("msg")` grabs the element with `id="msg"`, and setting its `.innerHTML` rewrites what is inside it. Because it is a live tree, a script can add a new element, delete one, or change any text at any moment after the page loaded.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Events: code that waits for the user',
          },
          {
            type: 'paragraph',
            text:
              'Pages react because scripts listen for *events* - a click, a keypress, the page finishing loading. Walk a real one: `document.getElementById("search").addEventListener("input", function(e) { document.getElementById("results").innerHTML = e.target.value; });`. Read it: whenever someone types in the search box (the `input` event), the code takes what they typed (`e.target.value`) and writes it into the results area as HTML. The user\'s keystrokes flow straight into the page. Type `<img src=x onerror=alert(1)>` and it executes - a DOM XSS with no server involved at all, because the whole path lives in the browser.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`document` - the root object representing the whole page',
              '`getElementById` / `querySelector` - find an element in the DOM tree',
              '`.innerHTML` / `.textContent` - read or rewrite what is inside an element',
              '`addEventListener("click", fn)` - run `fn` when that event happens',
              '`e.target.value` - inside an event handler, the current value of the element',
              'A *source* is where input enters (URL, input box); a *sink* is where it lands (innerHTML)',
            ],
          },
          {
            type: 'command',
            description: 'Find DOM sinks and event handlers in a page\'s script:',
            commands: ['curl -s https://example.com/main.js | grep -n "addEventListener\\|innerHTML\\|getElementById\\|location"'],
          },
          {
            type: 'paragraph',
            text:
              'Each numbered hit is a place the script touches the live page or reacts to the user. Reading the results, you are drawing the map from *source* to *sink*: does a value from `location` (the URL) or from an event handler travel into an `innerHTML`? When it does, and nothing sanitises it on the way, that is your DOM XSS. The grep gives you the handful of lines to trace instead of the whole file.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Source to sink',
            text:
              'DOM XSS is always a story of a source (where input enters) reaching a sink (where it becomes HTML or code) with nothing cleaning it in between. Learn to read that path and you can find the bug on sight.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand the page is a live object scripts can rewrite, and you can trace user input from a source through an event to a dangerous sink.',
          },
          { type: 'related_lesson', lessonSlug: 'dom-xss', title: 'Deep dive later: DOM XSS' },
          {
            type: 'quiz',
            question: 'What does "the DOM" refer to?',
            options: ['A JavaScript file', 'The live in-memory tree of the page that scripts can read and change', 'A type of server', 'The page\'s CSS'],
            correctIndex: 1,
            explanation: 'The DOM is the browser\'s live object model of the page. Scripts change the DOM and the visible page changes with it.',
          },
        ],
      },
      {
        slug: 'fetch-and-async',
        title: 'fetch, Promises and async',
        summary: 'Why a request fires seconds after the page loads, and how to catch it in DevTools.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Modern pages do not reload to get new data. You scroll a feed and more posts appear; you type in a search box and results update - all without the page flashing. Behind that, JavaScript is quietly firing network requests in the background with `fetch`. For a hacker this is gold: those background requests are calls to an API, and every one is a request you can capture, read and tamper with.',
          },
          {
            type: 'paragraph',
            text:
              'The reason requests fire *after* load is that they are *asynchronous* - the code does not stop and wait. `fetch("/api/user")` starts a request and immediately moves on, handing you a *Promise*: a placeholder that says "the answer will arrive later". You attach a callback for when it does. That is why you can load a page and then, a moment later, see a request appear on its own - the script kicked it off and the response came back whenever the server was ready.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Reading a real call',
          },
          {
            type: 'paragraph',
            text:
              'Walk this snippet: `fetch("/api/orders?user=42").then(r => r.json()).then(data => render(data));`. Read it in order. `fetch("/api/orders?user=42")` asks the server for order data for user 42. `.then(r => r.json())` runs once the response arrives and parses it as JSON. The final `.then(data => render(data))` draws that data on the page. Notice `user=42` sitting right there in the URL - if you change it to `user=43` and the server hands back someone else\'s orders, you have found an IDOR. You found it by reading one fetch line.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`fetch(url)` - starts a background network request and returns a Promise',
              '`.then(fn)` - run `fn` when the response arrives (chainable)',
              '`async` / `await` - a tidier way to write the same waiting; `await fetch(...)` pauses inside an async function',
              '`r.json()` - parse the response body as JSON',
              'The Network tab in DevTools (F12) lists every fetch, its URL, headers and response',
              'Filter the Network tab to "Fetch/XHR" to see only the API calls, not images and CSS',
            ],
          },
          {
            type: 'command',
            description: 'Replay a background API call by hand, once you have spotted it in DevTools:',
            commands: ['curl -s "https://example.com/api/orders?user=42" -H "Cookie: session=YOUR_SESSION"'],
          },
          {
            type: 'paragraph',
            text:
              'This resends the same request the page made, from your terminal, using your session cookie so the server treats you as logged in. The JSON that comes back is exactly what the app would have rendered. Now you change `user=42` to another number and run it again: if you get back data that is not yours, the server is trusting the number in the URL instead of checking who you are. Being able to lift a fetch out of the browser and replay it is how you move from "the page shows me my orders" to "let me ask for order 43".',
          },
          {
            type: 'paragraph',
            text:
              'This matters because most real testing happens against the API behind the page, not the page itself. Open the Network tab, watch the fetches fire, and you see the true endpoints and parameters - often more than the visible UI exposes. Every background request is a candidate to replay, tamper and probe, and knowing it is async tells you to wait and watch rather than assume the page loaded everything up front.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The Network tab is your best friend',
            text:
              'Press F12, open Network, filter to Fetch/XHR, then use the app normally. Every real API call shows up with its URL, parameters and response - the actual attack surface, laid out for you.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know why background requests fire after load, can find them in the Network tab, and can replay one from the terminal to start tampering.',
          },
          {
            type: 'related_lesson', lessonSlug: 'idor', title: 'Deep dive later: IDOR',
          },
          {
            type: 'quiz',
            question: 'In DevTools, which Network filter shows only the API calls a page makes?',
            options: ['Img', 'CSS', 'Fetch/XHR', 'Font'],
            correctIndex: 2,
            explanation: 'The Fetch/XHR filter isolates JavaScript-initiated requests - the API calls - from static assets like images, CSS and fonts.',
          },
        ],
      },
    ],
  },
  {
    slug: 'databases-and-sql',
    title: 'Databases and SQL',
    description:
      'Speak SQL before you inject it. By the end you can read a SELECT, follow a WHERE clause, understand how a JOIN stitches two tables together, and picture exactly what an injected query does to a database. This is the reading level that turns SQL injection from a magic incantation into something you can reason about.',
    lessons: [
      {
        slug: 'sql-crash-course',
        title: 'SQL Crash Course',
        summary: 'A database is a stack of registers. SQL is how you ask it questions - and reading it is step one to injecting it.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Almost every app keeps its data in a database, and almost every database speaks SQL. Picture a table as a register at a shop - the society gate register, say. Every row is one entry (one person, one order, one login), and every column is a field on that entry (name, flat number, time in). SQL is the language the app uses to read from and write to those registers. You need to read SQL, because when you inject, you are writing SQL - so you had better know what a query does first.',
          },
          {
            type: 'paragraph',
            text:
              'The command you will see most is `SELECT`, which reads rows. Walk a real one: `SELECT username, email FROM users WHERE id = 42;`. Read it in plain words: "get the username and email columns, from the users table, but only the row where id equals 42". `SELECT` picks the columns, `FROM` names the table, and `WHERE` is the filter that decides which rows come back. Change the `WHERE` and you change which rows you see - which is exactly the lever an injection pulls.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The WHERE clause is the whole game',
          },
          {
            type: 'paragraph',
            text:
              'Apps build queries by pasting your input into them. Imagine a login that does `SELECT * FROM users WHERE username = \'INPUT\' AND password = \'INPUT\';`, dropping whatever you typed into the two `INPUT` spots. If you type a normal name, fine. But the filter is just text being glued together - so if you could smuggle in something that changes the logic of the `WHERE`, you could make it return a row it should not. That is the seed of SQL injection, and it starts with seeing the query as text with holes in it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`SELECT columns FROM table` - read data; `SELECT *` means every column',
              '`WHERE condition` - filter to rows that match; the heart of most injections',
              '`INSERT INTO table VALUES (...)` - add a new row',
              '`UPDATE table SET col = x WHERE ...` - change existing rows',
              '`DELETE FROM table WHERE ...` - remove rows (a missing WHERE deletes everything)',
              'A string value is wrapped in single quotes: `WHERE name = \'admin\'`',
            ],
          },
          {
            type: 'command',
            description: 'Run SQL against a local SQLite database to see queries in action:',
            commands: [
              'sqlite3 shop.db',
              'SELECT id, username FROM users WHERE id = 1;',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first line opens a small SQLite database file and drops you at a `sqlite>` prompt. The second asks for the id and username of the user whose id is 1, and the database prints back something like `1|admin`. Reading that: the number before the `|` is the id column, the text after it is the username - the exact row that matched your `WHERE id = 1`. Ask for `id = 2` and you get a different row. Seeing the filter control the result, live, is what makes injection click later.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'It is just text with holes',
            text:
              'A query the app runs is a string it built by pasting your input into a template. Once you see the query as text with your input dropped in, injection stops being magic - you are just changing what that text says.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a SELECT statement, follow its WHERE filter, and picture how an app glues your input into a query - the mental model every SQL injection builds on.',
          },
          {
            type: 'quiz',
            question: 'In `SELECT email FROM users WHERE id = 5;`, what does the WHERE clause do?',
            options: ['Picks the email column', 'Names the table', 'Filters to only the row where id equals 5', 'Deletes the row'],
            correctIndex: 2,
            explanation: 'WHERE is the filter. SELECT picks columns, FROM names the table, and WHERE decides which rows are returned - here, only id 5.',
          },
        ],
      },
      {
        slug: 'joins-and-queries',
        title: 'Joins and Real Queries',
        summary: 'A JOIN matches two registers by a shared number. Read one and you can follow the queries real apps actually run.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Real apps do not keep everything in one table. Users live in a `users` table, their orders in an `orders` table, kept apart so nothing is duplicated. But you often need them together - "show each order with the name of the person who placed it". A `JOIN` is how SQL stitches two tables into one result. Reading joins matters because the queries behind real bugs are rarely one flat table; they are two or three tables matched together.',
          },
          {
            type: 'paragraph',
            text:
              'The everyday picture: a `JOIN` matches two registers by a shared number, like matching a class attendance register to a marks register by roll number. Each order row stores a `user_id` - the roll number pointing back to a row in `users`. The join lines them up. Without it you would have an order that just says "user 42" with no name; with it you get the order and "Priya" in the same row.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Reading a join step by step',
          },
          {
            type: 'paragraph',
            text:
              'Walk this: `SELECT orders.id, users.username FROM orders JOIN users ON orders.user_id = users.id WHERE users.username = \'priya\';`. Read it piece by piece. `FROM orders JOIN users` says "combine the orders and users tables". `ON orders.user_id = users.id` is the matching rule - pair each order with the user whose id equals that order\'s `user_id`. Then `WHERE users.username = \'priya\'` filters the combined result down to Priya\'s orders only. The output is a list of order ids next to the name priya. Notice the `table.column` names - the dot just says which table a column comes from once two are in play.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`JOIN ... ON a = b` - combine two tables where the two columns match',
              '`table.column` - names a column and which table it belongs to',
              '`ORDER BY column` - sort the results; add `DESC` for reverse order',
              '`LIMIT 10` - return at most 10 rows',
              '`COUNT(*)`, `SUM(col)` - aggregate: count rows, add up a column',
              '`UNION` - stack the results of two SELECTs; important later for injection',
            ],
          },
          {
            type: 'command',
            description: 'Join two tables in SQLite and read the combined rows:',
            commands: [
              'SELECT orders.id, users.username FROM orders JOIN users ON orders.user_id = users.id LIMIT 3;',
            ],
          },
          {
            type: 'paragraph',
            text:
              'This returns up to three rows, each showing an order id next to the username of whoever placed it - the two tables merged on the `user_id`-to-`id` match. If a row reads `1007|ravi`, that is order 1007 placed by ravi. The `LIMIT 3` just keeps the output short. Being able to read this tells you what a query is really pulling, so when you later see a `UNION`-based injection stacking your own SELECT onto the app\'s, you already understand how columns from different sources line up in one result.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'UNION is coming back',
            text:
              'The `UNION` that stacks two SELECTs into one result is the exact mechanism behind UNION-based SQL injection. Get comfortable reading it here and that attack will make immediate sense.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a JOIN, follow how two tables get matched on a shared column, and understand the multi-table queries real applications run.',
          },
          { type: 'related_lesson', lessonSlug: 'sql-injection', title: 'Deep dive later: SQL Injection' },
          {
            type: 'quiz',
            question: 'What does `JOIN users ON orders.user_id = users.id` do?',
            options: ['Deletes the users table', 'Matches each order to the user whose id equals its user_id', 'Sorts the orders', 'Counts the users'],
            correctIndex: 1,
            explanation: 'The ON clause is the matching rule: it pairs each order row with the user row whose id equals that order\'s user_id, merging the two tables.',
          },
        ],
      },
      {
        slug: 'nosql-basics',
        title: 'NoSQL Basics',
        summary: 'Not every database uses tables and SQL. Meet the document store - and why its queries can be injected too.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Not every database is rows and columns. A big family called NoSQL throws out the rigid table and stores data as flexible *documents* - the most common being MongoDB. If a SQL table is a strict register with fixed columns, a document store is more like a folder of contact cards, where each card can have whatever fields it needs. You should recognise one because its queries look completely different, and yes, they can be injected too.',
          },
          {
            type: 'paragraph',
            text:
              'A document is basically the same JSON objects you saw in JavaScript. A user might be stored as `{ "username": "priya", "role": "user", "email": "priya@example.com" }`. There is no separate table definition - the document carries its own field names. To find that user, instead of SQL you send a query that is *also* a JSON-shaped object: `db.users.find({ "username": "priya" })` means "find documents in the users collection where username is priya". A *collection* is NoSQL\'s word for a group of documents, roughly what a table is in SQL.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Why it can be injected',
          },
          {
            type: 'paragraph',
            text:
              'Because the query is a structured object, an attacker who controls part of it can slip in *operators* instead of plain values. Say a login sends `{ "username": "priya", "password": "INPUT" }`. If the app lets you send an object where it expected a string, you could send `{ "$ne": "" }` as the password - `$ne` means "not equal to", so the filter becomes "password is not equal to empty string", which is true for everyone. The check passes without you knowing the password. That is NoSQL injection: not breaking out of quotes like in SQL, but smuggling in query operators.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Document - one record stored as a JSON-like object with its own fields',
              'Collection - a group of documents (NoSQL\'s version of a table)',
              '`find({ ... })` - query documents matching the given fields',
              '`$ne`, `$gt`, `$regex` - operators that change how a field is matched',
              'No fixed schema - different documents in one collection can have different fields',
            ],
          },
          {
            type: 'code',
            language: 'json',
            filename: 'nosql-auth-bypass.json',
            code: '{\n  "username": "priya",\n  "password": { "$ne": "" }\n}',
          },
          {
            type: 'paragraph',
            text:
              'This is a login payload where the password is not a string but an object using the `$ne` (not-equal) operator. Read it: "find the user priya whose password is not equal to an empty string". Since Priya\'s password is obviously not empty, the condition is true and the login succeeds - without the real password ever being supplied. When you see an app accept JSON where you expected a plain text field, this is the shape you test with.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Different database, same lesson',
            text:
              'SQL breaks out with quotes; NoSQL breaks out with operators. The root cause is identical - user input treated as part of the query structure instead of as plain data.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can recognise a document database, read a JSON-shaped query, and understand how injected operators bypass a NoSQL check.',
          },
          {
            type: 'quiz',
            question: 'Why does sending `{ "$ne": "" }` as a password sometimes bypass a NoSQL login?',
            options: ['It guesses the password', 'It means "not equal to empty", which is true for any real password', 'It deletes the user', 'It encrypts the request'],
            correctIndex: 1,
            explanation: '$ne is the not-equal operator. "Password not equal to empty string" is true for any user with a set password, so the check passes without the real value.',
          },
        ],
      },
      {
        slug: 'how-apps-talk-to-databases',
        title: 'How Apps Talk to Databases',
        summary: 'The moment an app glues your input into a query is the exact moment injection is born - or prevented.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You can read SQL now. Here is where it pays off: understanding the exact moment an app turns your input into a database query. Every injection bug and every fix lives in that one moment. Get this and you will know, on sight, whether a piece of code is safe or a gift waiting for you.',
          },
          {
            type: 'paragraph',
            text:
              'There are two ways an app builds a query, and the difference is everything. The dangerous way is *string concatenation*: the code literally pastes your input into the query text. The safe way is a *parameterised query* (also called a prepared statement): the code sends the query and your input to the database *separately*, so the database always treats your input as data, never as commands. Same result when input is normal - wildly different when input is an attack.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The same login, two ways',
          },
          {
            type: 'paragraph',
            text:
              'Look at the two snippets below. The first glues `username` straight into the query string. If someone types `\' OR \'1\'=\'1` as the username, the query becomes `... WHERE username = \'\' OR \'1\'=\'1\'`, and since `\'1\'=\'1\'` is always true, it returns every user - a classic auth bypass. The second uses a `?` placeholder and passes the value alongside. The database keeps that value quarantined as data, so `\' OR \'1\'=\'1` is treated as a (very odd) literal username that simply matches nobody. One line of difference decides whether the app is exploitable.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'query-building.js',
            code:
              '// DANGEROUS - input pasted into the query text\ndb.query("SELECT * FROM users WHERE username = \'" + username + "\'");\n\n// SAFE - input sent separately from the query\ndb.query("SELECT * FROM users WHERE username = ?", [username]);',
          },
          {
            type: 'paragraph',
            text:
              'Read the two lines. In the first, the `+ username +` means the raw text you typed becomes part of the SQL - your quotes can end the string early and your words become commands. In the second, the `?` is a placeholder and `[username]` is handed over as a separate value; the database fills the blank without ever parsing your input as SQL. When you audit code, this concatenation-versus-placeholder distinction is the single fastest tell for whether an input is injectable.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'String concatenation (`"... " + input`) - input becomes part of the query; injectable',
              'Parameterised query (`?` or `$1` placeholder + separate value) - input stays data; safe',
              'An ORM (like Prisma or Sequelize) usually parameterises for you - but not if you call its raw-query escape hatch',
              'The bug is always input crossing from data into query structure',
              'The fix is always keeping that boundary intact',
            ],
          },
          {
            type: 'command',
            description: 'Search a codebase for the risky pattern - queries built by concatenation:',
            commands: ['grep -rn "query(.*+.*)" ./src'],
          },
          {
            type: 'paragraph',
            text:
              'This recursively searches the `src` folder for lines that call `query(` with a `+` inside - the fingerprint of a concatenated query. Each numbered hit is a spot to inspect: is the thing being concatenated user input? If yes, you likely have an injection point. If it is joining two hard-coded strings, it is fine. The grep will not prove a bug, but it hands you the short list of lines worth reading closely instead of the whole codebase.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Only test what you are allowed to test',
            text:
              'Trying injection payloads against a login or search box is only legal on a target you own or have written authorisation to test. On anything else it is an attack, full stop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can look at how an app builds a query and tell a safe parameterised call from a dangerous concatenated one - the core judgement behind every injection finding.',
          },
          { type: 'practice_ref', title: 'Databases and SQL check', exerciseSlug: 'databases-and-sql-quiz' },
          {
            type: 'quiz',
            question: 'Which way of building a query keeps user input safe from SQL injection?',
            options: ['Pasting input into the query with +', 'A parameterised query with a ? placeholder and a separate value', 'Making the input uppercase', 'Adding more quotes'],
            correctIndex: 1,
            explanation: 'A parameterised query sends the SQL and the input to the database separately, so the input is always treated as data and can never become part of the command.',
          },
        ],
      },
    ],
  },
  {
    slug: 'git-and-tooling',
    title: 'Git and Tooling',
    description:
      'Version control, regex, and reading unfamiliar code. By the end you can dig through a project\'s git history to recover a secret someone thought they deleted, search a whole codebase with grep and regex, and walk into a repository you have never seen and find the interesting parts fast. This is how source code becomes a hunting ground.',
    lessons: [
      {
        slug: 'git-basics',
        title: 'Git Basics',
        summary: 'Git is a time machine for code. Every change is remembered forever - which is exactly why secrets leak through it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Git in 8 minutes - commits, history, and why deleted secrets never really leave'),
          {
            type: 'paragraph',
            text:
              'Git is how nearly all code is stored and shared, and for a hacker it is one thing above all: a time machine. Every save, called a *commit*, is remembered forever. When a developer commits an API key, then panics and deletes it in the next commit, the key is not gone - it is sitting in the history, one command away. Understanding how git remembers is how you find the things people thought they erased.',
          },
          {
            type: 'paragraph',
            text:
              'A *repository* (repo) is a project folder git is tracking. A *commit* is a snapshot of every file at one moment, stamped with who made it, when, and a message. Commits form a chain - each one points at the one before it - so the whole history is a timeline you can walk backwards. This is why "I removed the password" only removes it from the *latest* snapshot. The old snapshot that still contains it stays in the chain, untouched.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Reading the timeline',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real history. Run `git log --oneline` in a repo and you get lines like `a1b2c3d Fix login`, `9f8e7d6 Add config`, `4c3b2a1 Initial commit`. Read it top to bottom as newest to oldest. Each short code (`a1b2c3d`) is a commit\'s unique id, the *hash*; the text is the message the developer wrote. Now `git show 9f8e7d6` prints exactly what changed in the "Add config" commit - every added and removed line. If that commit added `API_KEY=sk_live_abc123` and a later one removed it, `git show` on the old commit still displays it in full. The delete never reached back in time.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`git clone <url>` - download a repo with its full history',
              '`git log --oneline` - list commits, newest first, one line each',
              '`git show <hash>` - see everything a single commit changed',
              '`git diff <hash1> <hash2>` - compare two points in time',
              'A commit is a permanent snapshot; deleting a file in a new commit does not erase old ones',
              'The `.git` folder holds the entire history - lose it and you lose the time machine',
            ],
          },
          {
            type: 'command',
            description: 'Clone a repo and walk its history to see what changed and when:',
            commands: [
              'git clone https://example.com/app.git',
              'cd app',
              'git log --oneline',
            ],
          },
          {
            type: 'paragraph',
            text:
              'After cloning, `git log --oneline` prints the commit timeline. Each row is one snapshot: the hash on the left, the message on the right. Reading it tells you the project\'s story - when auth was added, when a config landed, when something was hurriedly "fixed". A message like `Remove hardcoded key` is practically an arrow pointing at the previous commit, which almost certainly still contains that key. The history is a confession log if you know how to read it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Delete does not mean gone',
            text:
              'Removing a secret in a new commit only hides it from the latest version. The commit that first added it keeps it forever. Real cleanup means rewriting history, which most people never do.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can clone a repo, read its commit timeline, and view exactly what any single commit changed - the foundation for mining history for secrets.',
          },
          {
            type: 'quiz',
            question: 'A developer commits an API key, then removes it in the next commit. Where is the key now?',
            options: ['Gone forever', 'Still in the earlier commit in the history', 'Only in the developer\'s memory', 'Encrypted automatically'],
            correctIndex: 1,
            explanation: 'Each commit is a permanent snapshot. Removing the key in a later commit leaves the earlier commit - which still contains it - fully intact in the history.',
          },
        ],
      },
      {
        slug: 'github-for-hackers',
        title: 'GitHub for Hackers',
        summary: 'A public repo is a goldmine. Search commit history and code for the secrets developers leak by accident.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Finding leaked secrets in GitHub repos - a live walkthrough'),
          {
            type: 'paragraph',
            text:
              'GitHub hosts millions of public repositories, and a huge share of real findings start there - not with a fancy exploit, but with a developer who committed something they should not have. An API key in a config file, a database password in an old commit, an internal hostname in a comment. Your job is to search that history faster and more thoroughly than the person who left it there. This is recon, and it is often where the first win comes from.',
          },
          {
            type: 'paragraph',
            text:
              'The strongest move is searching *history*, not just the current files, because that is where deleted secrets hide. `git log -p` prints every commit along with its full diff, so you can scroll the entire life of the project. Better, `git log -p -S "password"` uses the pickaxe option: `-S` finds only the commits where the text `password` was added or removed. Instead of reading everything, you jump straight to the moments a secret entered or left the code.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'One focused hunt',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real search. You clone `app.git` and run `git log -p -S "api_key"`. Git prints each commit that touched the text `api_key`, with the diff. One result shows commit `3d4e5f6` adding a line `const api_key = "sk_live_9a8b7c";` to a config file, and a later commit removing it. The current code is clean - a casual look at the repo shows nothing. But the history hands you a live-looking key. You found it by searching *when the string moved*, not by reading files. That is the whole technique.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`git log -p` - full history with every diff, to scroll the project\'s life',
              '`git log -p -S "secret"` - jump to commits that added or removed that exact text',
              '`git log --all` - include every branch, not just the one you are on',
              'Look for: `.env` files, `config.*`, `*.pem`/`*.key`, hard-coded `password`/`token`/`api_key`',
              'Deleted branches and old commits often outlive the "fix" that removed a secret',
              'Automated scanners exist, but reading history by hand catches what patterns miss',
            ],
          },
          {
            type: 'command',
            description: 'Mine a cloned repo\'s history for common secret keywords:',
            commands: [
              'git log -p -S "api_key" --all',
              'git log --all --oneline | head',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command searches every branch\'s history for commits touching `api_key` and shows the diffs, so a leaked key surfaces even if the current code is spotless. The second lists recent commits across all branches so you can spot suspicious messages like "temp creds" or "revert secret". Reading these, a diff line starting with `+` is text that was added, and a `-` line is text removed - so a `-` on a secret is the "cleanup" that still left the `+` version behind in the same history. Interpreting those plus and minus lines is how you tell a live leak from an already-rotated one.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Found a key? Do not use it',
            text:
              'Discovering a leaked credential on a public repo is a finding to report, not a login to try. Using it - even "just to confirm" - crosses from research into unauthorised access. Report the leak; do not open the door.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can search a repository\'s full history for secrets developers tried to delete, and read a diff well enough to tell a live leak from an old one.',
          },
          {
            type: 'quiz',
            question: 'Why is `git log -p -S "password"` better than just browsing the current files?',
            options: ['It is faster to type', 'It finds every commit that added or removed that text, including deleted secrets', 'It edits the files', 'It works only on private repos'],
            correctIndex: 1,
            explanation: 'The -S pickaxe search targets the history - the moments a string entered or left the code - so it surfaces secrets that were later deleted from the current files.',
          },
        ],
      },
      {
        slug: 'regex-crash-course',
        title: 'Regex Crash Course',
        summary: 'Regex is a search language for patterns. It is how you find every email, key or token in a mountain of code.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Sometimes you do not know the exact text to search for - you know its *shape*. Every email looks like something@something.something. Every API key from one service starts with `sk_live_` and has 24 letters after it. Regex (regular expressions) is a tiny language for describing shapes like that, and it turns "search a huge codebase for anything that looks like a secret" from impossible into one line. You will use it inside grep, in Burp, in code, everywhere.',
          },
          {
            type: 'paragraph',
            text:
              'A regex is a pattern built from ordinary characters plus a few special ones. Plain letters match themselves: `cat` matches the text "cat". The power is in the special pieces. `\\d` matches any digit, `\\w` any letter/digit/underscore, and `.` matches any single character. A `+` means "one or more of the thing before it", `*` means "zero or more", and `{5}` means "exactly five". Square brackets list choices: `[aeiou]` matches any one vowel. Combine a handful of these and you can describe almost any string shape.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Building one that finds emails',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real pattern: `[\\w.]+@[\\w.]+\\.\\w+`. Read it left to right. `[\\w.]+` means "one or more letters, digits or dots" - the part before the @. Then a literal `@`. Then `[\\w.]+` again - the domain body. Then `\\.` (a backslash escapes the dot so it means a literal dot, not "any character"). Then `\\w+` - the ending like `com` or `in`. Put together, it matches `priya.k@example.com`. Change the ending logic and you can hunt for anything: `sk_live_\\w{24}` finds a specific vendor\'s live keys.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`\\d` - a digit; `\\w` - letter, digit or underscore; `.` - any character',
              '`+` - one or more; `*` - zero or more; `{3}` - exactly three',
              '`[abc]` - any one of a, b, c; `[a-z]` - any lowercase letter',
              '`\\.` - a literal dot (the backslash escapes the special meaning)',
              '`^` - start of line; `$` - end of line',
              '`|` - or, as in `cat|dog`',
            ],
          },
          {
            type: 'command',
            description: 'Use regex with grep to find every email and every AWS-style key in a codebase:',
            commands: [
              'grep -rEn "[\\w.]+@[\\w.]+\\.\\w+" ./src',
              'grep -rEn "AKIA[0-9A-Z]{16}" ./src',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The `-E` turns on extended regex, `-r` recurses through folders, and `-n` numbers the lines. The first command lists every email address hiding in the source. The second is sharper: `AKIA` followed by 16 uppercase letters or digits is the exact shape of an AWS access key id, so any hit is almost certainly a real leaked credential. Reading the output, each numbered line is a file and location to check - the regex did the finding, you do the judging. A shape-based search like this scales to millions of lines where eyeballing never could.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Search by shape, not by word',
            text:
              'When you cannot guess the exact secret but you know its format, describe the format. `sk_live_\\w{24}`, `AKIA[0-9A-Z]{16}`, a JWT\'s three dot-separated blobs - a pattern finds them all at once.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read and write basic regex, and use it with grep to sweep a whole codebase for anything shaped like a secret, an email or a token.',
          },
          {
            type: 'quiz',
            question: 'In the regex `\\d{4}`, what does `{4}` mean?',
            options: ['Four different regexes', 'Match exactly four of the previous thing (four digits)', 'The fourth line', 'Optional four'],
            correctIndex: 1,
            explanation: '{4} is a quantifier meaning "exactly four of the preceding item". With \\d before it, the pattern matches exactly four digits in a row.',
          },
        ],
      },
      {
        slug: 'reading-code-you-didnt-write',
        title: 'Reading Code You Did Not Write',
        summary: 'Walk into an unfamiliar repo and find the security-relevant parts fast, without reading every line.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You will spend more time reading code than writing it, and most of it will be code you have never seen, written by strangers, with no one to explain it. The beginner mistake is trying to read a project top to bottom like a novel. You will drown. The skill is finding the few files and lines that matter - where input enters, where queries run, where auth is decided - and ignoring the rest. This lesson is that method.',
          },
          {
            type: 'paragraph',
            text:
              'Start with the map, not the streets. Open the `README` and the folder structure first - they tell you what the project is and roughly where things live. Then find the *entry points*: the routes or endpoints, usually in files named `routes`, `controllers`, `handlers`, `api`, or `app`. Those are the doors data comes through. From a door, you follow one request inward: where does the input go, what function handles it, does it hit a database or a file or run a command? You are tracing one path, not memorising the building.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Grep for the dangerous verbs',
          },
          {
            type: 'paragraph',
            text:
              'Instead of reading everything, jump straight to the risky operations by searching for the functions that touch the outside world. A worked example: you clone an app and run `grep -rn "exec\\|query\\|readFile\\|redirect" ./src`. Say it returns `src/api/report.js:44: exec("convert " + req.query.file)`. Read that one line: `exec` runs a shell command, and `req.query.file` is user input from the URL glued right into it. That is command injection, found in seconds - not by reading the file, but by grepping for a dangerous verb and then reading the *one* line it flagged.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Start with `README` and folder layout - understand the shape before the details',
              'Find entry points: `routes`, `controllers`, `handlers`, `api`, `main`, `app`',
              'Grep for sinks: `exec`, `system`, `eval`, `query`, `readFile`, `fetch`, `redirect`',
              'Trace one input from where it enters to where it is used - follow the data',
              'Read config and dependency files (`package.json`, `.env.example`) for clues and versions',
              'Ignore tests, styles and docs on a first pass - they rarely hold the bug',
            ],
          },
          {
            type: 'command',
            description: 'Get oriented in a fresh repo and jump to the risky calls:',
            commands: [
              'ls -la',
              'grep -rn "exec\\|eval\\|query\\|readFile\\|redirect" ./src',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The `ls -la` shows you the top-level layout and any hidden files like `.env` or `.git`. The grep then lists every place the code runs a command, evaluates a string, queries a database, reads a file, or redirects - the operations where user input turns dangerous. Reading the results, you are triaging: for each hit, ask "could a user influence what goes into this?" A hit where the argument is a hard-coded string is noise; a hit where it is `req.body` or `req.query` is a lead. This turns an intimidating unknown codebase into a short, ranked list of things to actually read.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Read the doors, not the whole house',
            text:
              'You do not need to understand a whole codebase to find a bug in it. Find where input enters and where dangerous functions live, then connect the two. Everything in between is usually noise.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can drop into an unfamiliar repository, find its entry points and dangerous sinks, and trace one input to a bug - without reading every line.',
          },
          { type: 'practice_ref', title: 'Git and Tooling check', exerciseSlug: 'git-and-tooling-quiz' },
          {
            type: 'quiz',
            question: 'What is the fastest first move when auditing an unfamiliar codebase for bugs?',
            options: ['Read every file top to bottom', 'Find the entry points and grep for dangerous sinks, then trace input between them', 'Rewrite it in another language', 'Run it and hope it crashes'],
            correctIndex: 1,
            explanation: 'Reading everything does not scale. Locating where input enters and where risky functions are called, then connecting the two, finds bugs fast without reading the whole project.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'fetch-and-async',
    slug: 'web-languages-quiz',
    title: 'Web Languages check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does an input\'s `name` attribute become when a form is submitted?',
        options: ['The label shown on screen', 'The parameter key the server reads', 'The CSS class', 'Nothing, it is ignored'],
        correctIndex: 1,
        explanation: 'The name attribute is the key the server receives, paired with the typed value - so it tells you exactly which parameter to test.',
      },
      {
        prompt: 'A button is hidden with `display: none`. Is it truly gone?',
        options: ['Yes, removed from the page', 'No, still in the HTML and reachable via dev tools', 'Only for admins', 'Only if JavaScript runs'],
        correctIndex: 1,
        explanation: 'CSS only changes appearance. The element and its action remain in the page and can be un-hidden or called directly.',
      },
      {
        prompt: 'Which JavaScript call is a red flag when its argument is user-controlled?',
        options: ['console.log(x)', 'eval(x)', 'let y = 5', 'Math.round(x)'],
        correctIndex: 1,
        explanation: 'eval runs a string as code. If a user controls that string, they can run their own code - a direct path to injection.',
      },
      {
        prompt: 'What is the DOM?',
        options: ['A stylesheet', 'The browser\'s live, changeable tree of the page', 'A database', 'A server framework'],
        correctIndex: 1,
        explanation: 'The DOM is the in-memory model of the page. Scripts change the DOM and the visible page updates - the basis of DOM XSS.',
      },
      {
        prompt: 'Which DevTools Network filter isolates a page\'s API calls?',
        options: ['Img', 'Fetch/XHR', 'CSS', 'Media'],
        correctIndex: 1,
        explanation: 'Fetch/XHR shows only JavaScript-initiated requests - the real API endpoints - separate from static assets.',
      },
    ],
  },
  {
    lessonSlug: 'how-apps-talk-to-databases',
    slug: 'databases-and-sql-quiz',
    title: 'Databases and SQL check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In a SELECT statement, which clause decides which rows come back?',
        options: ['FROM', 'WHERE', 'SELECT', 'ORDER BY'],
        correctIndex: 1,
        explanation: 'WHERE is the filter. SELECT picks columns and FROM names the table, but WHERE controls which rows are returned.',
      },
      {
        prompt: 'What does a JOIN do?',
        options: ['Deletes a table', 'Combines two tables by matching a shared column', 'Sorts rows', 'Encrypts data'],
        correctIndex: 1,
        explanation: 'A JOIN stitches two tables together where a column in one matches a column in the other, like matching registers by roll number.',
      },
      {
        prompt: 'Why can `{ "$ne": "" }` bypass a NoSQL password check?',
        options: ['It guesses the password', 'It means "not equal to empty", true for any real password', 'It deletes the account', 'It disables the database'],
        correctIndex: 1,
        explanation: '$ne is the not-equal operator; "password not equal to empty" is true for any user with a set password, so the check passes.',
      },
      {
        prompt: 'Which query-building method is safe from SQL injection?',
        options: ['Concatenating input with +', 'A parameterised query with a ? placeholder', 'Uppercasing the input', 'Adding extra quotes'],
        correctIndex: 1,
        explanation: 'Parameterised queries send the SQL and the input separately, so the input is always treated as data, never as command text.',
      },
      {
        prompt: 'What is the root cause shared by SQL and NoSQL injection?',
        options: ['Slow servers', 'User input crossing from data into the query structure', 'Weak passwords', 'Old browsers'],
        correctIndex: 1,
        explanation: 'Both bugs happen when input meant to be data is treated as part of the query - quotes in SQL, operators in NoSQL.',
      },
    ],
  },
  {
    lessonSlug: 'reading-code-you-didnt-write',
    slug: 'git-and-tooling-quiz',
    title: 'Git and Tooling check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'A secret was committed, then deleted in the next commit. Where is it now?',
        options: ['Gone forever', 'Still in the earlier commit in the history', 'Encrypted', 'Moved to a branch'],
        correctIndex: 1,
        explanation: 'Each commit is a permanent snapshot. Deleting the secret later leaves the original commit - which still holds it - intact.',
      },
      {
        prompt: 'What does `git log -p -S "api_key"` find?',
        options: ['Files named api_key', 'Commits that added or removed the text api_key', 'The current API key only', 'Nothing useful'],
        correctIndex: 1,
        explanation: 'The -S pickaxe search targets the moments a string entered or left the code, surfacing secrets that were later deleted.',
      },
      {
        prompt: 'In the regex `\\d{4}`, what does `{4}` mean?',
        options: ['Four regexes', 'Exactly four of the previous item (four digits)', 'The fourth match', 'Optional'],
        correctIndex: 1,
        explanation: '{4} is a quantifier meaning exactly four of the preceding item; with \\d it matches four digits in a row.',
      },
      {
        prompt: 'You find a live-looking API key in a public repo. What is the right move?',
        options: ['Log in to confirm it works', 'Report the leak without using the key', 'Post it publicly', 'Sell it'],
        correctIndex: 1,
        explanation: 'Using a found credential - even to confirm - is unauthorised access. The finding is the leak; report it, do not use it.',
      },
      {
        prompt: 'What is the fastest way to start auditing an unfamiliar codebase?',
        options: ['Read every file in order', 'Find entry points and grep for dangerous sinks, then trace input', 'Delete the tests', 'Rewrite it'],
        correctIndex: 1,
        explanation: 'Locating where input enters and where risky functions run, then connecting them, finds bugs without reading the whole project.',
      },
    ],
  },
];
