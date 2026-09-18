import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'the-web',
    title: 'The Web',
    description:
      "What actually happens between your click and the page loading: the request-and-response chat, the headers riding along, what status codes mean, the parts of a URL, and how HTTPS scrambles it all. By the end you can read a raw HTTP exchange line by line, tell 401 from 403 from 404, pick the query parameters worth poking, and open DevTools to watch a real page's traffic.",
    lessons: [
      {
        slug: 'http',
        title: "HTTP: The Web's Request Language",
        summary: 'Every web page is a conversation. HTTP is the language both sides speak.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('HTTP explained - the conversation behind every web page you open'),
          {
            type: 'image',
            src: '/api/v1/diagrams/http-request-response',
            alt: 'A request with method, path and headers beside a response with status and headers',
            caption: 'One request, one response. Everything on the web is this.',
          },
          {
            type: 'paragraph',
            text:
              'Every time you open a website, your browser and the server have a quick chat. Your browser asks for something, the server hands it back. HTTP is the language they use for that back-and-forth, and it is plain text you can read with your own eyes.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the whole mechanism, no magic. Your browser opens a connection to the server and sends a **request**: a first line saying what it wants ("GET the /login page"), then a stack of headers describing itself. The server reads that, decides what to do, and sends back a **response**: a status line saying how it went ("200 OK"), its own headers, and then the actual page. The diagram above shows those two halves side by side.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one real exchange. You visit `http://example.com`. Your browser sends `GET / HTTP/1.1` with a `Host: example.com` header. The server replies `HTTP/1.1 200 OK`, a `Content-Type: text/html` header, a blank line, and then the HTML. The blank line is the boundary: everything before it is headers, everything after it is the body. Your browser reads that HTML and paints the page, then repeats the whole round trip for every image, script and stylesheet it finds.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**GET** - "give me this resource" (loading a page). No body, safe to repeat.',
              '**POST** - "here is some data" (submitting a form, logging in). Carries a body.',
              '**PUT** - "create or replace this resource with what I send"',
              '**DELETE** - "remove this resource"',
              '**HEAD** - like GET but headers only, no body - handy for checking a page exists',
            ],
          },
          {
            type: 'command',
            description: 'Make a raw HTTP request yourself and watch the whole exchange:',
            commands: ['curl -v http://example.com'],
          },
          {
            type: 'paragraph',
            text:
              'The `-v` (verbose) flag prints the conversation both ways. Lines starting with `>` are what your machine SENT - the `GET / HTTP/1.1` line and your request headers. Lines starting with `<` are what the server SENT BACK - the `HTTP/1.1 200 OK` status line, then response headers like `Content-Type` and `Content-Length`, then the HTML body. Reading those `>` and `<` markers is how you separate your side of the chat from the server\'s.',
          },
          {
            type: 'paragraph',
            text:
              'Why does an attacker care that HTTP is plain text? Because if you can read a request, you can also write one. The browser might stop you sending a negative quantity or a huge value through its form, but the server only ever sees the raw HTTP. A tool that lets you catch the request and retype it means none of the browser\'s rules apply. Most web hacking is exactly this: understand the request, then change it.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'HTTP is just text',
            text:
              'A request is readable text you could type by hand. That is precisely why tools let you catch it, edit it, and send it back changed - the server cannot tell a hand-crafted request from a real one.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a raw HTTP request and response, tell the two halves apart, and name the common methods.',
          },
          { type: 'lab_ref', labSlug: 'http-investigation', title: 'Try it: HTTP Investigation lab' },
          {
            type: 'quiz',
            question: 'Which HTTP method is used to simply load a web page?',
            options: ['POST', 'GET', 'DELETE', 'PUT'],
            correctIndex: 1,
            explanation: 'GET asks the server for a resource, like loading a page. POST sends data, such as a form submission.',
          },
        ],
      },
      {
        slug: 'requests-and-responses',
        title: 'Anatomy of a Request and Response',
        summary: 'Pull one HTTP exchange apart line by line. Every web attack is an edit to something you are about to see.',
        estimatedMinutes: 9,
        importance: 'essential',
        blocks: [
          videoSlot('Anatomy of an HTTP request and response - reading the raw bytes line by line'),
          {
            type: 'paragraph',
            text:
              'You know HTTP is a request and a reply. Now look at the actual bytes, because this is the thing you will spend your whole career editing. Every payload you send, every header you tamper with, every parameter you change - it all happens inside the shape below.',
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/http-request-response',
            alt: 'A request with method, path and headers beside a response with status and headers',
            caption: 'Left is what you send. Right is what comes back. You control every byte on the left.',
          },
          { type: 'heading', level: 3, text: 'The request, in four parts' },
          {
            type: 'code',
            language: 'http',
            filename: 'request',
            code:
              'POST /api/login HTTP/1.1\nHost: shop.example.com\nUser-Agent: Mozilla/5.0\nContent-Type: application/json\nCookie: session=abc123\nContent-Length: 42\n\n{"email":"ravi@example.com","password":"hunter2"}',
          },
          {
            type: 'paragraph',
            text:
              'Line one is the **request line**: the method (`POST`), the path (`/api/login`), and the protocol version. Then come the **headers**, one per line, as `Name: value` pairs - metadata about the request. Then a **single blank line**, which is not decoration: it is the delimiter that tells the server "headers are finished, the body starts now". Then the **body**, here a JSON object. `Content-Length: 42` tells the server how many bytes of body to read.',
          },
          {
            type: 'paragraph',
            text:
              'That blank line matters more than it looks. A surprising number of parsing bugs, request smuggling among them, come from two systems disagreeing about where the headers end and the body begins.',
          },
          { type: 'heading', level: 3, text: 'The response, in the same shape' },
          {
            type: 'code',
            language: 'http',
            filename: 'response',
            code:
              'HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: session=xyz789; HttpOnly; Secure\nX-Powered-By: Express\nContent-Length: 38\n\n{"ok":true,"name":"Ravi","role":"user"}',
          },
          {
            type: 'paragraph',
            text:
              'Same structure, different first line. The **status line** carries the code (`200 OK`) instead of a method. Headers follow, then a blank line, then the body. Two things here are already interesting to a hacker: `Set-Cookie` is the server handing you the identity you will carry on every later request, and `X-Powered-By: Express` is the server volunteering what it runs - free reconnaissance nobody needed to give you.',
          },
          {
            type: 'command',
            description: 'See both halves for real. -v prints the request and response headers; -d sends a body:',
            commands: [
              'curl -v https://example.com',
              'curl -v -X POST -H "Content-Type: application/json" -d \'{"a":1}\' https://httpbin.org/post',
            ],
          },
          {
            type: 'paragraph',
            text:
              'In the `curl -v` output, lines starting with `>` are what you sent and lines starting with `<` are what came back, with `*` lines being curl talking about the connection itself. Read the `>` block and you are reading exactly what a proxy would let you edit. That mapping - `>` is mine to change, `<` is the evidence of what the server did with it - is the core testing loop.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Method** - GET reads, POST creates, PUT replaces, PATCH edits, DELETE removes. Servers do not always enforce this, and that gap is a bug class.',
              '**Path and query** - `/api/orders/1042?full=true`. Both halves are attacker-controlled.',
              '**Headers** - `Host`, `Cookie`, `Authorization`, `Content-Type`, `X-Forwarded-For`. All editable, all sometimes trusted.',
              '**Body** - JSON, form-encoded, multipart or XML. The format decides which injection styles are even possible.',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why does dissecting this pay off? Because testing is mostly changing one part and watching what moves. Change the path number and you are testing access control. Change `Content-Type` and you may reach a different parser. Add a duplicate header and you are probing how two servers disagree. Remove the `Cookie` line and you learn whether that endpoint ever checked who you were. You cannot do any of it until you can see the parts.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The response tells you if it worked',
            text:
              'Do not just read the status code. Compare response length, timing and body between your normal request and your modified one. A `200` that is 40 bytes shorter than usual is often the real finding.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text:
              'You can read a raw HTTP exchange, point at the request line, headers, blank-line delimiter and body, and say which parts you control.',
          },
          {
            type: 'quiz',
            question: 'In an HTTP request, what does the single blank line after the headers mean?',
            options: [
              'It is only formatting, the server ignores it',
              'It marks the end of the headers and the start of the body',
              'It separates two different requests',
              'It signals the connection should close',
            ],
            correctIndex: 1,
            explanation:
              'The blank line is the delimiter between headers and body. Systems disagreeing about where that boundary sits is the root of several parsing bugs, including request smuggling.',
          },
        ],
      },
      {
        slug: 'headers',
        title: 'Headers: The Metadata That Runs the Web',
        summary: 'Headers are the sticky notes on every request and response. They quietly control almost everything.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Headers are small "Name: Value" lines carried by every request and every response. They do not hold the page itself - they hold the details about it. Who you are, what formats you accept, whether you are logged in, how big the body is. The page is the parcel; the headers are the shipping label.',
          },
          {
            type: 'paragraph',
            text:
              'Mechanically, they sit between the first line and the body. In a request, right after `GET /account HTTP/1.1` comes a block of headers, then a blank line, then any body. Each header is one line: a name, a colon, a space, then the value. The server reads them top to bottom before it even looks at the body, and uses them to decide how to answer.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a concrete request. Your browser asks for your account page and sends `Host: bank.example.com` so a server hosting many sites knows which one you mean, `User-Agent: Mozilla/5.0` announcing the browser, `Accept: text/html` saying it wants HTML, and `Cookie: session=8f3a...` carrying the token that proves you are logged in. Drop that Cookie header and the same request comes back as a stranger who gets bounced to the login page. The headers, not the URL, are what make you "you" on that request.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Host** - which site you want (one server hosts many)',
              '**User-Agent** - what browser or tool is asking',
              '**Cookie** - your session token, re-sent on every request',
              '**Content-Type** - what kind of data the body holds (`application/json`, `text/html`)',
              '**Authorization** - credentials or a token proving who you are',
              '**Server** / **X-Powered-By** - response headers that leak what software is running',
            ],
          },
          {
            type: 'command',
            description: 'Fetch only the response headers of a site and read what it tells you:',
            commands: ['curl -I https://example.com'],
          },
          {
            type: 'paragraph',
            text:
              'The `-I` flag asks for headers only (a HEAD request), so you skip the page body and see the metadata cleanly. In the output you will see the status line, then lines like `Content-Type: text/html`, `Content-Length: 1256`, and often a `Server:` line. If that `Server:` line reads `Apache/2.4.29 (Ubuntu)`, the site just told you the exact web server and version it runs - the first thing you would look up for known weaknesses.',
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker cares: headers are both intel and attack surface. Response headers leak the tech stack (server, framework, sometimes internal hostnames) that nobody meant to publish. Request headers are attacker-controlled - you decide your own `User-Agent`, `Cookie` and custom headers - so any server logic that trusts a header ("if X-Forwarded-For is our internal IP, skip auth") can be fooled by simply sending that header yourself.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Headers leak secrets',
            text:
              'A `Server: Apache/2.4.29` line just told you what software is running. Recon often starts by reading headers nobody meant to expose.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read common headers and see how they carry identity, format, and quiet hints about the server behind a site.',
          },
          {
            type: 'quiz',
            question: 'Which header tells a server which website you are asking for?',
            options: ['User-Agent', 'Host', 'Accept', 'Cookie'],
            correctIndex: 1,
            explanation: 'The Host header names the site, so one server serving many domains knows which one you mean.',
          },
        ],
      },
      {
        slug: 'status-codes',
        title: 'Status Codes: What the Server Is Telling You',
        summary: 'That number in every response is the server telling you how the request went, in three digits.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Every response opens with a three-digit status code. The first digit is the mood of the answer: it worked, it moved, you got it wrong, or the server broke. Learn the four ranges and you can read a whole scan at a glance instead of clicking through each result.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is simple: the server picks the code that best describes the outcome and puts it on the status line, like `HTTP/1.1 404 Not Found`. Your browser reads the number, not the text, and reacts - a 3xx makes it follow a redirect automatically, a 200 makes it render the body, a 401 makes it show a login. The number drives the behaviour.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**2xx** - success. `200 OK` is the happy path, `201 Created` after a POST',
              '**3xx** - redirect. `301` moved permanently, `302` moved temporarily',
              '**4xx** - your fault. `400` bad request, `401` not logged in, `403` logged in but forbidden, `404` not found, `429` too many requests',
              '**5xx** - the server\'s fault. `500` internal error, `502` bad gateway, `503` unavailable',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The gap between `401`, `403` and `404` is gold. Walk it concretely: you request `/admin`. A `404` says "there is nothing here" - dead end. A `401` says "there is something here, but log in first". A `403` says "this exists and you are logged in, but you are not allowed" - which just confirmed the resource is real and you found a boundary worth pushing on. Same URL, three very different signals.',
          },
          {
            type: 'command',
            description: 'Ask a server for the status code of two paths without downloading the pages:',
            commands: [
              'curl -o /dev/null -s -w "%{http_code}\\n" https://example.com/',
              'curl -o /dev/null -s -w "%{http_code}\\n" https://example.com/does-not-exist',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Here `-o /dev/null` throws away the page body, `-s` hides the progress bar, and `-w "%{http_code}"` prints just the number. The first command should print `200` (the homepage exists), the second `404` (that path does not). This is the exact trick a directory brute-forcer uses at scale: request hundreds of guessed paths and watch which ones answer `200`, `301` or `403` instead of `404` - the non-404s are the pages the site did not link but did not remove.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: status codes are how you map a site you were not given a map to. A wall of `404`s with a few `403`s scattered in tells you exactly where the hidden, protected areas are. A `500` after you tweak an input tells you your input reached code that was not ready for it - often the first sign of a deeper bug.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: '403 vs 404 is a tell',
            text:
              'A `404` says nothing is there. A `403` admits something is there but blocked. That tiny difference quietly maps out hidden pages.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a status code and instantly know if it worked, redirected, or broke - and whose fault it was.',
          },
          {
            type: 'quiz',
            question: 'A server returns 403 Forbidden. What does that suggest?',
            options: [
              'The page does not exist',
              'The page exists but you are not allowed to see it',
              'The server has crashed',
              'The request was successful',
            ],
            correctIndex: 1,
            explanation: '403 means the resource exists but access is denied - which confirms it is really there.',
          },
        ],
      },
      {
        slug: 'urls-and-query-strings',
        title: 'URLs, Paths and Query Strings',
        summary: 'A URL is not one thing - it is several parts glued together, and each part is worth reading.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'You type URLs all day without a second thought. But a URL is a stack of parts glued together, and each one tells you something. Learn to read them and you start noticing exactly where a site takes input from you - which is where the interesting bugs live.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'https://shop.example.com:443/products?id=42&sort=price#reviews\n|_____| |______________| |__| |_______| |_____________| |______|\nscheme      host          port  path       query        fragment',
          },
          {
            type: 'paragraph',
            text:
              'Read that example left to right. `https` is the scheme (the protocol). `shop.example.com` is the host (which server). `:443` is the port (which door - 443 is HTTPS, usually left off because it is the default). `/products` is the path (which resource on that server). `?id=42&sort=price` is the query string (parameters). `#reviews` is the fragment, which the browser uses to jump to a spot on the page and never even sends to the server.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**scheme** - `https`, the protocol to use',
              '**host** - `shop.example.com`, which server',
              '**port** - `:443`, which door (often hidden when default)',
              '**path** - `/products`, which resource on it',
              '**query string** - `?id=42&sort=price`, the parameters',
              '**fragment** - `#reviews`, a spot on the page (browser-only, never sent)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The query string is where a lot of the action is. Everything after the `?` is a set of `name=value` pairs joined by `&`, and every single value is something you control. Take `?id=42`: that number almost certainly picks which record the server loads. Change it to `?id=43` and you may be looking at the next user\'s order. That one-character change is the classic test for an access-control bug called IDOR.',
          },
          {
            type: 'command',
            description: 'Ask a server for two IDs in a row and compare what comes back:',
            commands: [
              'curl -s "https://httpbin.org/anything?id=42"',
              'curl -s "https://httpbin.org/anything?id=43"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'httpbin.org is a safe practice server that just echoes your request back as JSON. In each response, look at the `"args"` section: you will see `"id": "42"` in the first and `"id": "43"` in the second, proving the server received exactly the value you put in the URL. On a real app that value would pick a database row instead of being echoed - and if the app forgot to check the row belongs to you, swapping the number hands you someone else\'s data.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: the query string is a list of the app\'s inputs, printed right in the address bar. When you size up a target, reading the parameters tells you what to poke - an `?id=` invites IDOR tests, a `?file=` invites path-traversal tests, a `?redirect=` invites open-redirect tests. The URL is a menu of attack surface, free to read.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Parameters are attacker inputs',
            text:
              'Every value in the query string is something the user controls. That is exactly why so many bugs hide in `?id=`, `?file=` and friends.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can break any URL into its parts and spot the query parameters worth poking at.',
          },
          {
            type: 'quiz',
            question: 'In https://site.com/item?id=42, what is id=42?',
            options: ['The path', 'A query string parameter', 'The host', 'The fragment'],
            correctIndex: 1,
            explanation: 'Everything after the ? is the query string. id=42 is a name=value parameter the user controls.',
          },
        ],
      },
      {
        slug: 'https',
        title: 'HTTPS and TLS: The Padlock Explained',
        summary: 'The little padlock is not decoration. It means your conversation with the site is scrambled to everyone else.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('HTTPS and TLS - what the padlock actually protects, and what it does not'),
          {
            type: 'paragraph',
            text:
              'Plain HTTP sends everything as readable text, so anyone sitting between you and the server - the cafe Wi-Fi, your ISP, a router in the middle - can read your password as it flies past. HTTPS is the same HTTP conversation wrapped in an encryption layer called TLS. Same request, same response, but now scrambled to everyone except you and the server.',
          },
          {
            type: 'paragraph',
            text:
              'Here is roughly how the wrapping gets set up. Before any page loads, your browser and the server do a TLS handshake. The server presents a **certificate** - a file signed by a trusted authority that says "I really am example.com". Your browser checks that signature against the authorities it trusts. If it checks out, the two sides agree on a shared secret key and use it to encrypt everything from then on. If the certificate is expired, self-signed, or names the wrong site, the browser throws the scary warning instead of connecting.',
          },
          {
            type: 'paragraph',
            text:
              'Walk what an eavesdropper actually sees. Over HTTP they see `POST /login` and `password=india123` in clear text. Over HTTPS they see the destination IP and that some encrypted bytes went to port 443, and nothing else - not the path, not the form data, not the cookie. The three guarantees below are what that buys you.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Encryption** - outsiders see scrambled bytes, not your login or cookie',
              '**Identity** - the certificate proves the server is who it claims to be',
              '**Integrity** - any tampering with the data in transit is detected and rejected',
            ],
          },
          {
            type: 'command',
            description: 'Inspect the certificate a site presents and see who vouched for it:',
            commands: ['curl -vI https://example.com 2>&1 | grep -i -E "subject:|issuer:|expire"'],
          },
          {
            type: 'paragraph',
            text:
              'This runs a verbose HTTPS request and filters the TLS lines. `subject:` is who the certificate is FOR (should match the site you asked for), `issuer:` is the authority that SIGNED it (a name like DigiCert or Let\'s Encrypt), and the expire line is when it stops being valid. If the subject does not match the hostname, or the issuer is one nobody trusts, that is exactly the mismatch a phishing or man-in-the-middle setup produces.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters to both sides: for a defender, a login page served over plain HTTP is a straight-up finding - credentials crossing the network in clear text. For an attacker, the padlock is a boundary to respect, not defeat: you do not break TLS, you look for what happens around it - a site that loads over HTTPS but posts the form to a plain `http://` endpoint, a cookie missing the Secure flag, or an app that trusts a certificate it never actually verified.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The padlock is not a safety badge',
            text:
              'HTTPS means the connection is private, not that the site is honest. A scam site can get a perfectly valid padlock in minutes - it proves the pipe is encrypted, not that the people at the other end are trustworthy.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know TLS gives you privacy, server identity and tamper-detection - and why the padlock is not a trust badge.',
          },
          {
            type: 'quiz',
            question: 'What does the padlock (HTTPS) actually guarantee?',
            options: [
              'The website is safe and trustworthy',
              'The connection is encrypted and the server identity is verified',
              'The site cannot be hacked',
              'Your data is stored securely on the server',
            ],
            correctIndex: 1,
            explanation: 'HTTPS secures the connection and verifies the server. It says nothing about whether the site itself is honest or secure.',
          },
        ],
      },
      {
        slug: 'browser-devtools',
        title: 'DevTools: Your Free Hacking Toolkit',
        summary: 'Every browser ships with a pro-grade inspection tool. Press F12 and you can see every request the page makes.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Browser DevTools for hackers - the free toolkit hiding behind F12'),
          {
            type: 'paragraph',
            text:
              'You already own a serious hacking tool and you did not pay for it. Press F12 in Chrome or Firefox and DevTools opens - the same window developers use to build sites, and the same one you will use to watch a site\'s every move. No install, no setup, it is already there.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The tabs that matter',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Network** - every request and response the page makes, live',
              '**Elements** - the HTML and CSS of the current page, editable in place',
              '**Console** - run JavaScript against the page right now',
              '**Application** - cookies, local storage and session data the site kept',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Start with Network, because it is where the truth lives. Open the tab, then reload the page, and watch rows pile up - one per request the page made. Click any row and a panel opens with sub-tabs: **Headers** (the request and response headers you just learned), **Payload** (the data your browser sent), **Response** (what came back), and **Timing**. This is how you see that clicking "Add to cart" quietly fired a `POST /api/cart` with `{"item":42,"qty":1}` in the payload.',
          },
          {
            type: 'paragraph',
            text:
              'Walk a real inspection. Log in to any site with the Network tab open and filter to `Fetch/XHR`. You will spot a request to something like `/api/login` or `/session`. Click it: the Payload shows the username and password your browser sent, and the response Headers show a `Set-Cookie` handing back your session token. You have just watched, byte by byte, the exact exchange that logged you in - no guesswork.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'console.js',
            code: '// Paste in the Console tab to list the cookies this page can read\ndocument.cookie;',
          },
          {
            type: 'paragraph',
            text:
              'Run that one line in the Console and it prints the cookies the page\'s JavaScript is allowed to see, as a single `name=value; name2=value2` string. If your session cookie does NOT appear here, that is good news - it means the cookie has the HttpOnly flag, which hides it from JavaScript so a script injected into the page cannot steal it. A session cookie that DOES show up here is reachable by any script on the page, which is a real weakness worth noting.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: DevTools turns a website from a mystery into a readable system. You can see every API the pretty page calls, every value it sends, and every cookie it stores - which is most of the recon for a web target, done with a tool already on the machine. And the Elements tab teaches the most important lesson early: you can edit any page there, but it only changes YOUR view. The real check lives on the server.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Client-side changes are just cosmetic',
            text:
              'You can delete a "disabled" flag or change a displayed price in Elements, but that only changes what you see. The real security lives on the server - never trust what you can edit in the browser.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: "You can open DevTools, watch a page's network traffic, read its cookies and storage, and run JavaScript against it.",
          },
          {
            type: 'practice_ref', title: 'The Web check', exerciseSlug: 'http-quiz',
          },
          {
            type: 'quiz',
            question: 'Which DevTools tab shows every request and response a page makes?',
            options: ['Elements', 'Console', 'Network', 'Sources'],
            correctIndex: 2,
            explanation: 'The Network tab lists every request the page sends and the responses it gets back.',
          },
        ],
      },
    ],
  },
  {
    slug: 'sessions-and-identity',
    title: 'Who Are You? Sessions and Identity',
    description:
      "How a forgetful protocol remembers you are logged in, and how that memory gets abused: cookies, server-side sessions, the difference between proving who you are and what you may do, and readable JWT tokens. By the end you can decode a real session cookie and a JWT, explain why a stolen token is a stolen login, and name the control that IDOR-style bugs actually break.",
    lessons: [
      {
        slug: 'cookies',
        title: 'Cookies: Tiny Files, Huge Consequences',
        summary: 'HTTP forgets you between clicks. Cookies are how a site remembers you are still there.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('Cookies explained - the tiny files that keep you logged in'),
          {
            type: 'image',
            src: '/api/v1/diagrams/cookies-and-sessions',
            alt: 'Login exchanging a password for a session cookie the browser reuses',
            caption: 'The cookie is your wristband. HTTP itself remembers nothing.',
          },
          {
            type: 'paragraph',
            text:
              'HTTP has no memory. Each request arrives like a stranger walking in for the first time - the server has no idea it just served you a page a second ago. So how does a site keep you logged in across dozens of clicks? It hands your browser a small token called a cookie, and your browser sends that cookie back on every single request.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the exact mechanism. When you log in, the server\'s response includes a header called `Set-Cookie`. Your browser stores whatever it says, then automatically attaches it as a `Cookie:` header on every future request to that site. You never see it happen - the browser does the bookkeeping. It is like the coat-check ticket at a wedding: the counter does not remember your face, but hand over the ticket and it returns your coat. Steal the ticket and you get the coat too, which is exactly the risk.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'Set-Cookie: session=8f3ad9c2b1e7; HttpOnly; Secure; SameSite=Lax; Path=/',
          },
          {
            type: 'paragraph',
            text:
              'Read that real `Set-Cookie` header piece by piece. `session=8f3ad9c2b1e7` is the name and value - the actual token. `HttpOnly` tells the browser not to let JavaScript read it, blocking a common theft route. `Secure` means only ever send it over HTTPS, never plain HTTP. `SameSite=Lax` limits sending it when the request comes from another site, which blunts cross-site request forgery. `Path=/` says attach it to the whole site. Those four flags are the difference between a cookie that is hard to steal and one that leaks everywhere.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Session cookie** - proves you are logged in, sent on every request',
              '**HttpOnly** - JavaScript cannot read it, which blocks script-based theft',
              '**Secure** - only sent over HTTPS, never plain HTTP',
              '**SameSite** - limits sending the cookie on requests from other sites',
            ],
          },
          {
            type: 'command',
            description: 'Log in to a practice endpoint and keep the cookie in a jar so you can see it:',
            commands: ['curl -c jar.txt -s "https://httpbin.org/cookies/set?session=8f3ad9c2b1e7" > /dev/null', 'cat jar.txt'],
          },
          {
            type: 'paragraph',
            text:
              'The `-c jar.txt` flag tells curl to save any cookie the server sets into a file. When you `cat jar.txt` you will see a row with the domain, the flags, the cookie name `session`, and its value `8f3ad9c2b1e7` - the same thing your browser stores silently. On a later request you would pass `-b jar.txt` to send it back, exactly as a browser re-attaches your session on every click. Seeing the raw jar makes it obvious the cookie is just a value being replayed, not something magic.',
          },
          {
            type: 'paragraph',
            text:
              'Why an attacker cares: the cookie IS the login. If someone grabs your session cookie - through a script on the page, an insecure network, or a leaky log - they do not need your password at all. They paste the value into their own request and the server treats them as you until it expires. That is why the `HttpOnly` and `Secure` flags matter so much, and why a session cookie exposed to JavaScript is a finding, not a detail.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A stolen cookie is a stolen login',
            text:
              'If an attacker grabs your session cookie, they do not need your password. They just hand over the ticket and walk in as you until it expires.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know cookies are how a forgetful protocol remembers you, can read a Set-Cookie header, and understand why its security flags matter.',
          },
          {
            type: 'quiz',
            question: 'Why do websites use cookies?',
            options: [
              'To make pages load faster',
              'Because HTTP has no memory, so they need a token to remember you',
              'To encrypt your traffic',
              'To store the whole website on your device',
            ],
            correctIndex: 1,
            explanation: 'HTTP is stateless, so a cookie is the token the browser sends back to prove it is still the same you.',
          },
        ],
      },
      {
        slug: 'sessions',
        title: 'Sessions: Staying Logged In',
        summary: 'A cookie is the ticket. The session is the record on the server that the ticket points to.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          videoSlot('Sessions vs cookies - what actually keeps you logged in behind the scenes'),
          {
            type: 'paragraph',
            text:
              'People mix up cookies and sessions constantly. Here is the clean split: the cookie is the ticket in your browser, and the session is the file on the server that the ticket refers to. One is the claim you carry, one is the record that backs it up.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the whole flow with real values. You log in as Priya. The server generates a long random session ID like `s%3A8f3ad9c2b1e7...`, stores a record on its side that says `{ id: "8f3ad9c2b1e7", user: "priya", role: "user", loginAt: "10:04" }`, and sends you a cookie holding only that ID. On every later request your browser sends the ID back; the server looks it up in its store and instantly knows it is Priya. The cookie carries the pointer; the server keeps the actual identity.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'You log in with your password',
              'The server creates a session record and stores it (in memory, Redis, or a database)',
              'It sends you a cookie holding only the session ID',
              'Every later request carries that ID so the server can look you up and know it is you',
            ],
          },
          {
            type: 'code',
            language: 'text',
            code:
              'Cookie in your browser:   session=8f3ad9c2b1e7\n                                 |\n                                 v\nRecord on the server:     8f3ad9c2b1e7 -> { user: "priya", role: "user" }',
          },
          {
            type: 'paragraph',
            text:
              'That diagram is the whole idea in two lines: your browser holds a meaningless-looking ID, and the server holds the mapping from that ID to who you actually are. Because the real data lives on the server, changing the cookie value does not change who you are - it just points at a different (probably non-existent) record. That is the security win of server-side sessions: you cannot promote yourself to admin by editing a cookie, because the role lives on the server, not in the token.',
          },
          {
            type: 'command',
            description: 'Generate the kind of long random value a good session ID uses:',
            commands: ['head -c 24 /dev/urandom | base64'],
          },
          {
            type: 'paragraph',
            text:
              'This reads 24 random bytes and prints them as a Base64 string, giving you something like `k9Fv2sQ1zR8pLmT0aXbY7wUu`. That is what a proper session ID looks like: long, random, and impossible to guess. Compare it to a bad session ID like `1001`, `1002`, `1003` - if IDs count up, an attacker just tries the next number and lands on another live session. The randomness is the entire defence.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: the session ID is the single secret standing between an attacker and every logged-in account. If it is short, sequential, or predictable, an attacker can guess a valid one and instantly become another user without ever knowing a password - an attack called session prediction or session hijacking. When you review an app, "how is the session ID generated?" is one of the first real questions.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Guessable IDs are a disaster',
            text:
              'If session IDs are short or count upwards, an attacker can guess a valid one and become another user. Good IDs are long and random for exactly this reason.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain the cookie-versus-session split, trace login to logged-in, and say why a random session ID is the whole defence.',
          },
          {
            type: 'quiz',
            question: 'What is stored in the session cookie itself?',
            options: [
              'Your password',
              'Usually just a session ID that points to a record on the server',
              'Your full profile',
              'The entire website',
            ],
            correctIndex: 1,
            explanation: 'The cookie normally carries only a session ID. The real user data sits in the session record on the server.',
          },
        ],
      },
      {
        slug: 'authentication-vs-authorization',
        title: 'Authentication vs Authorization',
        summary: 'Two words that sound alike and mean very different things. Mixing them up is where bugs are born.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'These two get confused constantly, so nail it now. Authentication is proving who you are. Authorization is what you are allowed to do once you are in. One is the door, the other is the set of rooms you may enter. They happen in that order and they fail in very different ways.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the mechanism on a single request. You send `GET /api/invoices/88` with your session cookie. First the server does **authentication**: it reads the cookie, looks up the session, and confirms "this is Priya, logged in". Then it does **authorization**: it checks "does invoice 88 belong to Priya, and is she allowed to view it?". Both checks must pass. The classic bug is an app that does the first and forgets the second - it confirms you are logged in, then hands over invoice 88 without ever checking it is yours.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Authentication (authn)** - "are you really Priya?" - login, OTP, password, passkey',
              '**Authorization (authz)** - "is Priya allowed to open THIS invoice / the admin panel?"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The airport analogy makes it stick. Authentication is showing your passport at check-in - it proves who you are. Authorization is the boarding pass deciding which flight, which gate and which seat you may take. A perfectly valid passport does not let you into the cockpit, and being genuinely logged in does not entitle you to another user\'s data.',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'GET /api/invoices/88 HTTP/1.1\nHost: portal.example.com\nCookie: session=8f3ad9c2b1e7\n\n# authn PASSES: valid session, you are Priya\n# authz SHOULD ASK: does invoice 88 belong to Priya?\n# broken app: skips that check and returns it anyway',
          },
          {
            type: 'paragraph',
            text:
              'Read that annotated request. The cookie is valid, so authentication succeeds - the server knows it is Priya. The bug lives in the comment: a well-built app now checks that invoice 88 is Priya\'s before returning it, while a broken one returns any invoice whose number you type. Change `88` to `89` and if you see someone else\'s invoice, you have proven the authorization check is missing. That is an IDOR, and it is one of the most common and rewarding web bugs.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Only try ID-swapping and access-control tests on systems you own or are explicitly authorised to test. On someone else\'s app it is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Where the money bugs live',
            text:
              'A huge class of bugs is broken authorization: you are logged in as yourself, but the app lets you reach things that are not yours. Keep the two words separate in your head.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You will never again confuse "who you are" with "what you can do" - the split behind a whole family of access-control bugs.',
          },
          {
            type: 'lab_ref', labSlug: 'invoice-portal', title: 'Try it: Invoice Portal lab',
          },
          {
            type: 'quiz',
            question: 'A logged-in user opens another user\'s private invoice by changing an ID. Which control failed?',
            options: [
              'Authentication',
              'Authorization',
              'Encryption',
              'DNS resolution',
            ],
            correctIndex: 1,
            explanation: 'They were authenticated (logged in as themselves) but authorization failed - the app let them reach data that was not theirs.',
          },
        ],
      },
      {
        slug: 'jwt-basics',
        title: 'JWTs: Tokens You Can Read',
        summary: 'A JWT is a login token you can actually decode and read. That surprises a lot of beginners.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('JWTs explained - the login token you can read but should not be able to forge'),
          {
            type: 'image',
            src: '/api/v1/diagrams/jwt-anatomy',
            alt: 'A JWT split into header, payload and signature with decoded contents',
            caption: 'Base64, not encryption. Anyone can read the payload.',
          },
          {
            type: 'paragraph',
            text:
              'A JWT (JSON Web Token) is a popular alternative to server-side sessions. Instead of the server keeping a record and handing you an ID, it hands you a signed token that CARRIES the facts about you inside it, and you send that whole token back each request. No server-side lookup needed - the token is self-contained.',
          },
          {
            type: 'paragraph',
            text:
              'The surprise for beginners: a JWT is not encrypted. It is three chunks separated by dots - `header.payload.signature` - and the first two are just Base64. Anyone who has the token can decode them and read every claim inside. The signature at the end is what stops you CHANGING those claims. The diagram above shows the three parts and their decoded contents.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicHJpeWEiLCJyb2xlIjoidXNlciJ9.q3Kx7f2n...\n\\_____header_____/ \\_________payload_________/ \\__signature__/\n\ndecoded header:   { "alg": "HS256" }\ndecoded payload:  { "user": "priya", "role": "user" }',
          },
          {
            type: 'paragraph',
            text:
              'Read that real token. The middle chunk decodes to `{ "user": "priya", "role": "user" }` - the claims the server will trust about you. See the `"role": "user"` field? The obvious attacker thought is "what if I change that to admin?" - and that is exactly the instinct JWTs are designed to defeat, because editing the payload changes the Base64, which no longer matches the signature.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Header** - which signing algorithm is used (`HS256`, `RS256`)',
              '**Payload** - the claims: who you are, your role, an expiry time',
              '**Signature** - proof the header and payload were not changed after signing',
            ],
          },
          {
            type: 'command',
            description: 'Decode the readable middle part of a token (safe, local only - no signature needed to read):',
            commands: ['echo "eyJ1c2VyIjoicHJpeWEiLCJyb2xlIjoidXNlciJ9" | base64 -d'],
          },
          {
            type: 'paragraph',
            text:
              'That command Base64-decodes the payload chunk and prints `{"user":"priya","role":"user"}` right in your terminal. No password, no key, no permission needed - which proves the point: a JWT payload is public. Anything the app puts in there (an email, a role, an internal user ID) is readable by whoever holds the token. If a developer stuffed a secret into a JWT thinking it was hidden, this one command exposes it.',
          },
          {
            type: 'paragraph',
            text:
              'Why an attacker cares: JWTs concentrate a lot of trust into a token you can read and try to forge. The real-world attacks target weak signature handling - a server that accepts the `alg: none` trick (a token with no signature), or one using a weak secret you can crack offline and then re-sign your own admin token. Reading is free and always works; forging is what those later attacks are about, and it all hinges on how carefully the server checks that signature.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Readable does not mean forgeable',
            text:
              'You can always read a JWT, but changing the payload breaks the signature. Weak, missing, or badly-checked signatures are exactly what JWT attacks target later.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know a JWT is a signed, readable token in three parts, can decode its payload, and understand that the signature - not secrecy - protects it.',
          },
          {
            type: 'practice_ref', title: 'Sessions and Identity check', exerciseSlug: 'cookies-quiz',
          },
          {
            type: 'quiz',
            question: 'What protects a JWT from being tampered with?',
            options: [
              'The payload is encrypted',
              'The signature, which breaks if the contents change',
              'It is hidden inside a cookie',
              'Nothing, JWTs are not secure',
            ],
            correctIndex: 1,
            explanation: 'A JWT payload is only Base64-encoded and readable. The signature is what detects any change to the token.',
          },
        ],
      },
      {
        slug: 'oauth-and-social-login',
        title: '"Login with Google" Explained',
        summary: 'That "Login with Google" button is OAuth. It lets you sign in without handing your password to every site.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          videoSlot('Login with Google explained - what OAuth actually does behind that button'),
          {
            type: 'image',
            src: '/api/v1/diagrams/oauth-flow',
            alt: 'User, app and Google exchanging a redirect, a code and then a token',
            caption: 'Your password never reaches the app. A code does.',
          },
          {
            type: 'paragraph',
            text:
              'You have clicked "Login with Google" a hundred times. That is OAuth doing its job. It lets one site (the app) log you in using your account somewhere else (Google), without the app ever seeing your Google password. Two strangers get to trust each other because a third party they both trust vouches for you.',
          },
          {
            type: 'paragraph',
            text:
              'Walk the actual redirect dance. You click the button on `todoapp.com`. It sends your browser to Google with a URL like `accounts.google.com/o/oauth2/auth?client_id=todoapp&redirect_uri=https://todoapp.com/callback&scope=profile`. Google checks you are logged in, shows the consent screen, and on approval bounces you back to `todoapp.com/callback?code=4/abc123`. The app takes that short-lived **code**, swaps it with Google server-to-server for a **token**, and now knows who you are. Your password stayed on Google the whole time.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'You click "Login with Google" on some app',
              'Your browser is redirected to Google with the app\'s client_id and a redirect_uri',
              'Google asks "let this app see your basic profile?" - the consent screen',
              'You approve, Google redirects back with a one-time code',
              'The app swaps the code for a token behind the scenes - never your password',
            ],
          },
          {
            type: 'code',
            language: 'text',
            code:
              'https://accounts.google.com/o/oauth2/auth\n  ?client_id=todoapp\n  &redirect_uri=https://todoapp.com/callback\n  &scope=profile email\n  &response_type=code',
          },
          {
            type: 'paragraph',
            text:
              'Read that authorization URL - it is the request the button actually makes. `client_id` names which app is asking. `scope=profile email` is exactly what the app wants access to, which is what the consent screen lists. And `redirect_uri` is where Google will send the code back. That last one is the security-critical field: if Google does not strictly check the redirect_uri against a registered value, an attacker can craft a link that sends YOUR code to THEIR server - a real and recurring OAuth bug class.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a valet key. You give the valet a key that starts the car but does not open the boot or the glovebox. The app gets a token that proves who you are and maybe reads your email address, but never gets your actual Google password or full account. Consent plus limited scope is the whole point - and misconfigured scopes or sloppy redirect checks are where OAuth bugs live.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Consent and redirect_uri are the whole game',
            text:
              'OAuth is about granting limited access. The consent screen is where you approve the scope, and a loosely-checked redirect_uri is where real OAuth account-takeover bugs come from.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can trace how "Login with Google" signs you in with a code-for-token swap, and name the redirect_uri as the field attackers probe.',
          },
          {
            type: 'quiz',
            question: 'When you use "Login with Google" on an app, what does the app receive?',
            options: [
              'Your Google password',
              'A token proving who you are, without your password',
              'Full control of your Google account',
              'Nothing, it just checks your email',
            ],
            correctIndex: 1,
            explanation: 'OAuth hands the app a limited token, never your password. You approve exactly what it can access on the consent screen.',
          },
        ],
      },
    ],
  },
  {
    slug: 'data-and-encoding',
    title: 'Data, Encoding and Hashing',
    description:
      "Tell encoding, encryption and hashing apart forever - the three get mixed up constantly and confusing them causes real bugs. By the end you can recognise Base64, hex and URL encoding on sight and decode them in seconds, explain why a salted slow hash is how passwords should be stored, read a JSON API response, and spot the Unicode lookalike tricks behind phishing domains and filter bypasses.",
    lessons: [
      {
        slug: 'encoding-vs-encryption-vs-hashing',
        title: 'Encoding vs Encryption vs Hashing',
        summary: 'Three things that scramble data, three totally different purposes. Confusing them causes real bugs.',
        estimatedMinutes: 8,
        importance: 'essential',
        blocks: [
          {
            type: 'paragraph',
            text:
              'These three get mixed up all the time, even by developers. They all turn readable data into something else, but for completely different reasons. Get this straight and half of your future crypto confusion simply disappears.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism that separates them is one question: is there a key, and can you go back? **Encoding** reformats data using a public, fixed scheme so systems can carry it safely - no key, and anyone can reverse it. **Encryption** transforms data with a secret key so only a key-holder can read it - reversible, but only with the key. **Hashing** runs data through a one-way function that produces a fixed-length fingerprint - not reversible at all, and the same input always yields the same output.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Encoding** - reformat so systems can carry it. Not secret, anyone reverses it (Base64, URL)',
              '**Encryption** - hide data with a key. Reversible only if you hold the key (AES)',
              '**Hashing** - a one-way fingerprint. Cannot be reversed; same input always gives the same hash (SHA-256)',
            ],
          },
          {
            type: 'command',
            description: 'Run one input through all three and watch how each behaves:',
            commands: [
              'echo -n "hello" | base64',
              'echo -n "hello" | sha256sum',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command encodes "hello" as `aGVsbG8=` - and you could pipe that straight back through `base64 -d` to get "hello" again, no key needed. The second hashes it to `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`, a 64-character fingerprint that no command on Earth turns back into "hello". Run the hash twice and it is identical every time; change one letter of the input and the whole fingerprint changes completely. That is the reversible-versus-one-way difference, made concrete.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: mislabelling these is a genuine vulnerability, not just sloppy words. A developer who "encrypts" a password by Base64-encoding it has protected nothing - anyone who reads the database decodes it instantly. A system that hashes data it needs to read back later has locked itself out. When you audit an app and see a scrambled value, your first job is to identify which of the three it is, because that tells you whether you can reverse it and how.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Base64 is not security',
            text:
              'Seeing Base64 and thinking "encrypted" is a classic mistake. It is just a reformat - decode it and the data is right there in plain view.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell encoding, encryption and hashing apart by asking one question: is there a key, and can it be reversed?',
          },
          {
            type: 'quiz',
            question: 'Which one is one-way and cannot be reversed back to the original?',
            options: ['Base64 encoding', 'Encryption', 'Hashing', 'URL encoding'],
            correctIndex: 2,
            explanation: 'Hashing is one-way. Encoding and encryption can both be reversed - encoding freely, encryption with a key.',
          },
        ],
      },
      {
        slug: 'base64-hex-url-encoding',
        title: 'Base64, Hex and URL Encoding',
        summary: 'Three encodings you will see everywhere. Recognise them on sight and you can decode them in seconds.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Base64, hex and URL encoding - spot them on sight and decode them fast'),
          {
            type: 'paragraph',
            text:
              'While hunting you will constantly bump into scrambled-looking strings - in cookies, in URLs, in API responses. Most are not encrypted; they are just encoded. Learn to recognise the three common types by their look and you can read them on the spot instead of assuming they are secret.',
          },
          {
            type: 'paragraph',
            text:
              'Each has a giveaway shape. **Base64** uses letters, digits, `+` and `/`, and often ends in one or two `=` signs used as padding - so `aGVsbG8=` screams Base64. **Hex** uses only the characters `0-9` and `a-f`, usually in even-length runs, so `68656c6c6f` is hex. **URL encoding** (also called percent-encoding) is a `%` followed by two hex digits standing in for a character that is unsafe in a URL, so `%20` is a space and `%2F` is a slash. Once you know the shapes, you classify a string in a glance.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Base64** - letters, digits, `+/`, often trailing `=`. `aGVsbG8=` is "hello"',
              '**Hex** - only `0-9` and `a-f`. `68656c6c6f` is also "hello"',
              '**URL encoding** - `%` plus two hex digits. `%20` is a space, `%2F` is `/`',
            ],
          },
          {
            type: 'command',
            description: 'Encode and decode all three on your own machine:',
            commands: [
              'echo -n "hello" | base64',
              'echo "aGVsbG8=" | base64 -d',
              'echo -n "hello" | xxd -p',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first line prints `aGVsbG8=` - "hello" in Base64. The second line takes that back to `hello`, proving encoding reverses freely with no key. The third uses `xxd -p` to print the hex form, `68656c6c6f`, where each pair (`68`, `65`, `6c`...) is the code for one letter (`h`, `e`, `l`...). Seeing "hello" come out the same in two different scrambled forms drives home that these are just alternative spellings of the same bytes, not protection.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: recognising encoding is a core recon reflex. A cookie value that decodes from Base64 to `user=priya;role=user` is begging you to try re-encoding `role=admin`. URL-encoding is also how attackers sneak characters past filters - a filter blocking `../` for path traversal might miss `%2e%2e%2f`, the same thing percent-encoded, which the server quietly decodes back. Knowing the encodings lets you both read what an app stores and reshape a payload to slip through.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'CyberChef is your friend',
            text:
              'When a string looks odd, tools like CyberChef will guess the encoding and unwrap it for you. But learn to eyeball the common three yourself - it is faster and it builds instinct.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot Base64, hex and URL encoding on sight and decode any of them quickly.',
          },
          {
            type: 'quiz',
            question: 'You see %20 in a URL. What is it?',
            options: [
              'An encrypted character',
              'URL encoding for a space',
              'A hex color',
              'A percentage value',
            ],
            correctIndex: 1,
            explanation: '%20 is URL encoding - % followed by the hex code for a space character.',
          },
        ],
      },
      {
        slug: 'hashing-and-password-storage',
        title: 'How Passwords Should Be Stored',
        summary: 'A good site never stores your actual password. It stores a salted hash - and here is why that matters.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A properly built site never stores your real password. It stores a hash of it - that one-way fingerprint from the last lesson. When you log in, the site hashes what you typed and compares the two fingerprints. If they match, you are in, and the site itself never has to keep your actual password around. Even a full database leak should not hand attackers your login.',
          },
          {
            type: 'paragraph',
            text:
              'But plain hashing alone is not enough, and here is the exact reason. Hashing is deterministic: everyone who uses the password "india123" gets the identical hash. So attackers precompute enormous tables mapping common passwords to their hashes (rainbow tables) and just look yours up. The fix is a **salt** - a unique random value added to each password before hashing. Now Priya\'s "india123" and Ravi\'s "india123" hash to completely different values, and no precomputed table helps.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Plain text** - the site stores your actual password. A disaster; a leak hands over every login',
              '**Plain hash** - better, but identical passwords collide and rainbow tables crack common ones',
              '**Salted hash** - a random per-user salt makes identical passwords hash differently, defeating those tables',
              '**bcrypt / argon2** - slow-on-purpose hashes built specifically for passwords',
            ],
          },
          {
            type: 'command',
            description: 'Hash the same password with two different salts and watch the output diverge:',
            commands: [
              'echo -n "salt1india123" | sha256sum',
              'echo -n "salt2india123" | sha256sum',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Both commands hash the same password "india123", but with a different salt glued in front. The two outputs are completely different 64-character hashes with nothing in common - even though the password is identical. That is the whole trick: because each stored hash was made with its own random salt, an attacker who steals the database cannot spot that two users share a password, and cannot reuse a precomputed table for even the most common ones. They are forced to attack each hash individually.',
          },
          {
            type: 'paragraph',
            text:
              'Why the "slow" hashes matter: SHA-256 is fast, which is great for files but terrible for passwords, because a cracker can try billions of guesses per second against stolen hashes. bcrypt and argon2 are deliberately slow and memory-hungry, so a single login is unaffected but mass-cracking millions of stolen hashes becomes painfully expensive. When you review an app and find plain-text passwords, or fast unsalted SHA hashes of passwords, that is a serious, reportable finding - it means one leak compromises every account.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Slow is a feature here',
            text:
              'Password hashes like bcrypt are deliberately slow. That barely affects one login but makes mass-cracking millions of stolen hashes painfully expensive.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know why good sites store salted, slow hashes - and why finding plain-text or fast-hashed passwords is a serious finding.',
          },
          {
            type: 'quiz',
            question: 'What does adding a salt to a password before hashing achieve?',
            options: [
              'It encrypts the password',
              'It makes identical passwords produce different hashes and defeats precomputed tables',
              'It makes the hash reversible',
              'It speeds up login',
            ],
            correctIndex: 1,
            explanation: 'A unique salt per user means the same password hashes differently, so attackers cannot reuse precomputed hash tables.',
          },
        ],
      },
      {
        slug: 'json-and-apis-intro',
        title: 'JSON and APIs in 6 Minutes',
        summary: 'Modern apps talk to each other in JSON over APIs. Read it once and it stops looking like code soup.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Behind most modern apps, the front end (what you see) and the back end (the server) chat using APIs, and they mostly speak JSON. Once you can read JSON, you can read what an app is really sending and receiving - which is most of web hacking, because the pretty page is just a wrapper around these calls.',
          },
          {
            type: 'paragraph',
            text:
              'JSON is just labelled data. It is built from two shapes: objects, wrapped in `{ }`, holding `"key": value` pairs; and arrays, wrapped in `[ ]`, holding an ordered list. Values can be text in quotes, numbers, `true`/`false`, `null`, or another object or array nested inside. That is the entire grammar. It is designed to be readable by both machines and humans, which is very good news for you.',
          },
          {
            type: 'code',
            language: 'json',
            filename: 'user.json',
            code:
              '{\n  "id": 42,\n  "name": "Priya",\n  "role": "user",\n  "isAdmin": false,\n  "email": "priya@example.com"\n}',
          },
          {
            type: 'paragraph',
            text:
              'Read that object. It describes one user: `id` 42, `name` "Priya", `role` "user", `isAdmin` false. Now notice `"isAdmin": false` and `"role": "user"`. An API is just a set of URLs the app calls - like `GET /api/users/42` returns exactly this, and a `PUT /api/users/42` might update it. If the update endpoint blindly trusts the fields you send back, changing `"isAdmin": false` to `"isAdmin": true` and re-submitting is a whole attack class called mass assignment.',
          },
          {
            type: 'command',
            description: 'Call a real practice API and read the JSON it returns:',
            commands: ['curl -s "https://httpbin.org/json"'],
          },
          {
            type: 'paragraph',
            text:
              'This returns a JSON object with a `"slideshow"` key whose value is itself an object containing an array of `"slides"`. Read it top-down: braces open an object, quoted names are keys, and the `[ ]` holds a list you can index. Being able to eyeball nested JSON like this is exactly what you do in DevTools\' Network tab or in Burp - every modern API answers in this shape, and reading it tells you what data and what decisions the server is exposing.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: the API is the real attack surface. The visible page is paint applied on top of these JSON calls, and it often hides or greys-out things the API still accepts. A "delete" button disabled in the UI does nothing if the underlying `DELETE /api/posts/42` still works when you call it directly. Learning to read JSON lets you skip the paint and test the API that actually holds the data and makes the decisions.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'APIs are the real attack surface',
            text:
              'The pretty page is just paint. The API underneath is where the data and the decisions live, so that is where you look for bugs the UI tries to hide.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a JSON object, follow nested arrays, and understand what an API is doing when an app calls one.',
          },
          {
            type: 'practice_ref', title: 'Data, Encoding and Hashing check', exerciseSlug: 'data-and-encoding-quiz',
          },
          {
            type: 'quiz',
            question: 'What is JSON mainly used for?',
            options: [
              'Encrypting web traffic',
              'A readable format for apps and APIs to exchange labelled data',
              'Styling web pages',
              'Storing passwords securely',
            ],
            correctIndex: 1,
            explanation: 'JSON is a lightweight, readable data format - keys and values - that apps and APIs use to exchange information.',
          },
        ],
      },
      {
        slug: 'character-sets-and-unicode',
        title: 'Unicode Weirdness Hackers Love',
        summary: 'Text is trickier than it looks. Two "identical" characters can be different bytes, and that gap gets abused.',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Computers store text as numbers, and the map from characters to numbers is a character set. ASCII covered basic English in 128 slots; Unicode covers nearly every script on Earth in over a hundred thousand. That richness is wonderful for the world and creates weird edge cases attackers genuinely enjoy.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism behind the tricks: the computer compares bytes, but a human compares shapes. Many different characters share the same shape. The Latin letter "a" (byte 0x61) and the Cyrillic letter that looks identical (a completely different code point) are the SAME to your eye and DIFFERENT to the machine. That mismatch - same look, different bytes - is the seam every Unicode trick slips through.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**ASCII** - the original 128 characters, plain English',
              '**UTF-8** - the Unicode encoding the web runs on',
              '**Homoglyphs** - characters that look identical but are different (Latin "a" vs Cyrillic "a")',
              '**Normalization** - collapsing different byte sequences that look the same into one canonical form',
            ],
          },
          {
            type: 'command',
            description: 'Print the actual bytes behind a plain "a" so the byte-versus-shape idea is concrete:',
            commands: ['echo -n "a" | xxd -p'],
          },
          {
            type: 'paragraph',
            text:
              'This prints `61` - the single hex byte for the ordinary Latin "a". A Cyrillic lookalike would print two bytes like `d0b0`, a completely different value, even though on screen the two letters are indistinguishable. That is the whole homoglyph attack in one comparison: a domain like `pаypal.com` where the "a" is Cyrillic renders identically to the real one, but points to an entirely different site because the bytes differ. Your eyes pass it; the DNS lookup does not.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: this gap powers two real attack families. Homoglyph domains drive convincing phishing - the link looks perfect and goes somewhere else. Normalization bugs bypass filters - a blocklist checks for the exact bytes of a banned word or character, but a differently-encoded version that normalizes to the same thing later slips straight through and gets processed. Any time a system makes a security decision by comparing text, ask whether two different byte sequences could look the same to a human but pass the check.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Same look, different bytes',
            text:
              'Filters compare bytes, but humans compare shapes. That mismatch is exactly the gap Unicode tricks slip through.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know why two identical-looking characters can be different bytes, and how that fuels lookalike domains and filter bypasses.',
          },
          {
            type: 'quiz',
            question: 'What makes a homoglyph attack work?',
            options: [
              'It encrypts the domain name',
              'Two characters look identical to a human but are different bytes to a computer',
              'It uses a faster protocol',
              'It hides the URL entirely',
            ],
            correctIndex: 1,
            explanation: 'Homoglyphs look the same to your eye but are distinct characters, so a lookalike domain fools people while pointing elsewhere.',
          },
        ],
      },
    ],
  },
  {
    slug: 'your-first-tools',
    title: 'Your First Tools',
    description:
      "Four tools, one scan, zero fear - the starter kit you will reach for in every lesson that follows. By the end you can move around a terminal, fire raw HTTP requests with curl, run your first Nmap scan and read the open ports, understand what Burp's proxy is for, and take notes good enough that a triager can reproduce your finding and actually pay it.",
    lessons: [
      {
        slug: 'command-line-basics',
        title: 'The Command Line, Minus the Fear',
        summary: 'The black window is not scary. It is just typing instructions instead of clicking them.',
        estimatedMinutes: 7,
        importance: 'essential',
        blocks: [
          videoSlot('The command line without fear - your first ten commands, explained'),
          {
            type: 'paragraph',
            text:
              'The terminal looks intimidating because it is silent, plain and unforgiving of typos. But underneath it is just a way to tell the computer what to do by typing instead of clicking. Once it clicks for you, it is faster than any menu and it is where almost every security tool actually lives.',
          },
          {
            type: 'paragraph',
            text:
              'Every command follows the same shape: a **command**, optional **options** (flags starting with `-`), and an optional **target**. Read `ls -l /home` as "run `ls` (list), in `-l` (long) form, on the target `/home`". That is it - verb, how, what. `cd /tmp` is "change directory to /tmp". `cat notes.txt` is "print the file notes.txt". Once you see that pattern, an unfamiliar command like `nmap -sV scanme.nmap.org` reads the same way: tool, flag, target.',
          },
          {
            type: 'command',
            description: 'The handful you will use constantly - every one read-only and safe:',
            commands: ['pwd', 'ls -l', 'cd /tmp', 'cat /etc/hostname', 'whoami'],
          },
          {
            type: 'paragraph',
            text:
              '`pwd` prints your current folder, so you always know where you are - it might say `/home/priya`. `ls -l` lists what is here with permissions, sizes and dates. `cd /tmp` moves you into the /tmp folder (run `pwd` again and it now says `/tmp`). `cat /etc/hostname` prints that small file\'s contents - the machine\'s name. `whoami` prints your username. None of these change anything; they only look, which is exactly how you should explore an unfamiliar system.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**pwd** - where am I right now?',
              '**ls** - what is in this folder?',
              '**cd** - move into a folder',
              '**cat** - print a file to the screen',
              '**whoami** - which user am I?',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: the command line is the price of entry for real tooling. Nmap, curl, Burp\'s helpers, John the Ripper, sqlmap - they all run here, and many have no clickable version at all. Just as important, when you land on a compromised or unfamiliar Linux box in a lab, these read-only commands are how you orient yourself safely: `whoami` tells you what access you have, `pwd` and `ls` tell you where you are and what is around, before you touch anything.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Tab and up-arrow are cheats',
            text:
              'Press Tab to auto-complete file and folder names, and the up-arrow to bring back a past command. You will type half as much and make far fewer mistakes.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can move around, list files and read them from the terminal - the base every tool in this course builds on.',
          },
          {
            type: 'quiz',
            question: 'What does the pwd command tell you?',
            options: [
              'Your password',
              'The folder you are currently in',
              'The files in a folder',
              'Which user you are',
            ],
            correctIndex: 1,
            explanation: 'pwd stands for "print working directory" - it shows the folder you are currently sitting in.',
          },
        ],
      },
      {
        slug: 'curl-basics',
        title: 'curl: Talk to Servers by Hand',
        summary: 'curl lets you send an HTTP request straight from the terminal - no browser in the way.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('curl basics - talk to any server by hand from your terminal'),
          {
            type: 'paragraph',
            text:
              'A browser makes HTTP requests for you and hides all the details behind a pretty page. curl makes the exact same requests but shows you everything and lets you control every part - the method, the headers, the body. It is how you talk to a server directly, by hand, which is the heart of testing an API or a single request.',
          },
          {
            type: 'paragraph',
            text:
              'The power is that curl builds the raw request from your flags, with none of the browser\'s guardrails. Want to send a header the browser would never send? Add `-H`. Want to POST a body the form would not allow? Use `-d`. Want to see the whole exchange? Add `-v`. Because the server cannot tell curl\'s request from a browser\'s, whatever the browser hid becomes yours to control.',
          },
          {
            type: 'command',
            description: 'Fetch a page, see the headers, and send data - all safe and read-only:',
            commands: [
              'curl https://example.com',
              'curl -I https://example.com',
              'curl -v https://example.com',
              'curl -X POST -d "name=priya" https://httpbin.org/post',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first command dumps the page HTML to your screen. The second (`-I`) shows only the response headers. The third (`-v`) shows the full conversation, with `>` for what you sent and `<` for what came back. The fourth is the interesting one: it sends a POST with the body `name=priya` to httpbin\'s echo endpoint, and the JSON that returns contains `"form": {"name": "priya"}` - proving the server received exactly the data you typed. That is you sending data by hand, no form required.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**-I** - show only the response headers (a HEAD request)',
              '**-v** - verbose: show the full request and response',
              '**-X** - choose the method (GET, POST, PUT, DELETE)',
              '**-d** - send data in the body',
              '**-H** - add a custom header',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why a hacker cares: curl is the fastest way to test a single request in isolation. Once DevTools or Burp shows you the shape of an API call, you can rebuild it in curl and hammer just that endpoint - swap an ID, drop the auth header to see if it is really required, change the method from GET to DELETE, send a value the UI would block. It is scriptable too, so the same request runs a thousand times with different inputs. curl is the manual complement to the point-and-click tools.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'curl sees what the browser hides',
            text:
              'Because curl shows the raw exchange and takes orders from flags, it is perfect for poking an API, testing whether a header is really enforced, or checking what a redirect actually does.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can send GET and POST requests by hand, add headers, and read the raw response - no browser required.',
          },
          {
            type: 'quiz',
            question: 'Which curl option shows only the response headers?',
            options: ['-d', '-X', '-I', '-o'],
            correctIndex: 2,
            explanation: '-I fetches just the response headers, without the body.',
          },
        ],
      },
      {
        slug: 'nmap-first-scan',
        title: 'Nmap: Your First Scan',
        summary: "Nmap knocks on a machine's doors and tells you which ones are open. It is the classic first move of recon.",
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Nmap first scan - find every open door on a machine in one command'),
          {
            type: 'paragraph',
            text:
              'Remember ports - the numbered doors on a machine, each one a service listening for connections? Nmap is the tool that walks up to a target and checks which doors are open, and often what is running behind them. It is the single most iconic recon tool in security, and it is genuinely friendly once you run the first scan.',
          },
          {
            type: 'paragraph',
            text:
              'Here is roughly how it works. For a basic TCP scan, Nmap sends a connection request (a SYN packet) to each port. If the port is open, the service answers and Nmap notes it. If it is closed, the machine replies with a reset. If a firewall silently drops the packet, Nmap gets nothing and marks the port "filtered". So one command turns a silent IP address into a list of live services - the map you need before you can test anything.',
          },
          {
            type: 'command',
            description: 'Scan a host that exists specifically for practice (you are authorised to scan this one):',
            commands: [
              'nmap scanme.nmap.org',
              'nmap -sV scanme.nmap.org',
              'nmap -p 80,443 scanme.nmap.org',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The first scan prints a table with a `PORT` column, a `STATE` column and a `SERVICE` column - you will typically see `22/tcp open ssh` and `80/tcp open http`, telling you a shell and a web server are reachable. The second command adds `-sV`, so the `SERVICE` column now includes versions like `OpenSSH 6.6.1` or `Apache httpd 2.4.7` - and a version number is exactly what you look up for known weaknesses. The third scans only ports 80 and 443, which is faster when you already know what you are after.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**nmap host** - a basic scan of the common ports',
              '**-sV** - also detect the service and version on each open port',
              '**-p** - scan specific ports, like `-p 80,443` or `-p-` for all 65535',
              '**-Pn** - skip the ping check, useful when a host ignores ping',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: recon comes before everything, and a port scan is where recon starts. Every open port is a service, every service is software, and every piece of software is a potential way in. That forgotten admin panel on port 8080, that old database exposed on 3306, that SSH running an ancient version - the scan surfaces all of it. You cannot test an attack surface you have not mapped, and Nmap is how you draw the map.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only your own targets',
            text:
              'Only scan machines you own or are explicitly authorised to test. `scanme.nmap.org` is provided by the Nmap project for exactly this practice - scanning anything else can be illegal.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You ran your first real scan and can list the open ports and service versions on an authorised target.',
          },
          { type: 'lab_ref', labSlug: 'port-discovery', title: 'Try it: Port Discovery lab' },
          {
            type: 'quiz',
            question: 'What does the -sV flag add to an Nmap scan?',
            options: [
              'It scans faster',
              'It detects the service and version behind each open port',
              'It hides your IP',
              'It scans every port',
            ],
            correctIndex: 1,
            explanation: '-sV asks Nmap to fingerprint the service and its version on each open port, not just report that the port is open.',
          },
        ],
      },
      {
        slug: 'burp-suite-first-launch',
        title: 'Burp Suite: First Launch',
        summary: 'Burp sits between your browser and the site so you can catch, read and change every request.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Burp Suite first launch - catch and edit web traffic like a pro'),
          {
            type: 'paragraph',
            text:
              'Burp Suite is the tool web hackers live inside. At its heart it is an intercepting proxy: it sits between your browser and the website, so every request pauses at your desk on the way out, where you can read it, change it, and then send it on. That "pause and edit" step is what turns you from a visitor into a tester.',
          },
          {
            type: 'paragraph',
            text:
              'Here is the mechanism that makes it work. Normally your browser talks straight to the server. You reconfigure the browser to send everything through Burp instead (usually on `127.0.0.1:8080`), so Burp becomes the middleman. For HTTPS, you also install Burp\'s certificate so the browser trusts the middleman and does not throw a warning. Now every request lands in Burp first. With Intercept on, a request freezes until you release it - and before you do, you can rewrite any byte of it.',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete edit. You buy something and the browser sends `POST /checkout` with a body of `item=42&price=999`. The web form would never let you change that price - but the request is now sitting in Burp. You edit `price=999` to `price=1`, forward it, and see whether the server honours it. If it does, you just found a bug where the price is trusted from the client. That is the whole game: the browser enforces rules, Burp ignores them, and you learn what the SERVER actually checks.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Proxy** - catch requests as they pass through',
              '**Intercept** - pause a request so you can edit it before it goes',
              '**Repeater** - send the same request again and again, tweaked each time',
              '**Target** - the map of everything you have visited on a site',
            ],
          },
          {
            type: 'code',
            language: 'http',
            code:
              'POST /checkout HTTP/1.1\nHost: shop.example.com\nContent-Type: application/x-www-form-urlencoded\nCookie: session=8f3ad9c2b1e7\n\nitem=42&price=999     <- edit price here in Burp before forwarding',
          },
          {
            type: 'paragraph',
            text:
              'That is the exact request you would edit in Burp. The top line and headers stay as they are; the last line is the body, and `price=999` is the field you tamper with. Reading it, you can see everything the server receives: which item, which price, and your session cookie proving who you are. Repeater lets you send this same request over and over with `price` changed each time, so you can probe the checkout logic methodically instead of clicking through the UI again for every attempt.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text:
              'Intercepting and editing traffic is only legal against systems you own or are explicitly authorised to test. Point Burp at the labs here, not at random sites.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'First-launch checklist',
            text:
              'Start Burp, set your browser to use its proxy on 127.0.0.1:8080, install Burp\'s certificate so HTTPS works without warnings, then browse. Requests start appearing in the Proxy tab.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know what Burp is for - catching and editing web requests - and the core tabs you will use every session.',
          },
          {
            type: 'practice_ref', title: 'Your First Tools check', exerciseSlug: 'nmap-basics-quiz',
          },
          { type: 'lab_ref', labSlug: 'http-investigation', title: 'Try it: HTTP Investigation lab' },
          {
            type: 'quiz',
            question: "What is the core job of Burp Suite's proxy?",
            options: [
              'To speed up your browser',
              'To sit between your browser and the site so you can catch and edit requests',
              'To scan ports',
              'To crack passwords',
            ],
            correctIndex: 1,
            explanation: "Burp's proxy intercepts traffic between your browser and the server, letting you read and change requests before they are sent.",
          },
        ],
      },
      {
        slug: 'note-taking-for-hackers',
        title: 'Notes That Win Bounties',
        summary: 'The finding you cannot reproduce is worth nothing. Good notes are the difference between a payout and a "meh".',
        estimatedMinutes: 7,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'The least glamorous skill in hacking pays the most: taking notes. In one focused hour you will test dozens of things across many requests. Without notes you will forget which request behaved oddly, on which parameter, with which payload - and a bug you cannot point back to is a bug you cannot report, which means it is unpaid.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism of a bounty is reproduction. You do not get paid for saying "the site is vulnerable" - you get paid when a triager on the other end follows your steps and sees the same result you did. So your notes have to capture enough that a stranger can replay the exact request. That means the full URL, the parameter you changed, the value you sent, and the response you got, saved AS YOU GO, not reconstructed from memory afterwards.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**What you tested** - the exact URL, the parameter, the payload',
              '**What happened** - the response, the status code, anything unusual',
              '**How to repeat it** - the precise steps, in order, so you can prove it later',
              '**Screenshots** - visual evidence beats a description every time',
            ],
          },
          {
            type: 'code',
            language: 'text',
            filename: 'finding-note.txt',
            code:
              '[2024-05-02 14:07] IDOR - Invoice Portal\nRequest:  GET /api/invoices/89  (Cookie: session=priya)\nExpected: 403 (invoice 89 is not mine)\nGot:      200 + full invoice for user "ravi"\nRepro:    log in as priya, open own invoice, change 88 -> 89 in URL\nEvidence: screenshot invoice-89-leak.png',
          },
          {
            type: 'paragraph',
            text:
              'Read that note - it is a complete, reproducible finding in six lines. It has a timestamp, the exact request with its cookie, what a secure app SHOULD have returned (403), what actually came back (someone else\'s invoice), the precise steps to repeat it, and a named screenshot as proof. A triager can follow it start to finish without asking you a single question. That is what turns "I think I found something" into a paid report - and it is nothing more than writing things down clearly as you work.',
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: notes are also your protection and your memory. Timestamped steps prove the bug was real at the moment you found it, which matters if the site changes or gets patched before triage reads your report. And across a long engagement, good notes stop you re-testing the same thing twice and help you connect a small oddity you saw on Tuesday to the real bug you confirm on Thursday. The habit feels slow; it is the fastest path to actually getting paid.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Timestamp everything',
            text:
              'Note when you tested something. If a site changes or a bug gets patched, your timestamped steps prove it was real when you found it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You know what to capture as you hunt so every finding is reproducible - which is what actually gets paid.',
          },
          {
            type: 'quiz',
            question: 'Why do good notes matter for bug bounties?',
            options: [
              'They make you look professional',
              'A report only gets paid if the bug can be reproduced from your steps',
              'They are required by law',
              'They speed up your scans',
            ],
            correctIndex: 1,
            explanation: 'Triagers pay for bugs they can reproduce. Clear notes with exact steps and evidence are what make that possible.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'browser-devtools',
    slug: 'http-quiz',
    title: 'The Web check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What is HTTP, in one line?',
        options: [
          'A programming language',
          'The request-and-response language browsers and servers use',
          'A type of encryption',
          'A web browser',
        ],
        correctIndex: 1,
        explanation: 'HTTP is the plain-text request-and-response protocol that browsers and servers use to talk.',
      },
      {
        prompt: 'A server responds with 404. What does it mean?',
        options: [
          'The request worked',
          'The resource was not found',
          'The server crashed',
          'You are not authorised',
        ],
        correctIndex: 1,
        explanation: '404 is a 4xx client-side code meaning the requested resource could not be found.',
      },
      {
        prompt: 'Which header tells the server which website you want?',
        options: ['User-Agent', 'Host', 'Accept', 'Content-Type'],
        correctIndex: 1,
        explanation: 'The Host header names the site, so a server hosting many domains knows which one to serve.',
      },
      {
        prompt: 'In https://site.com/search?q=cat, what is q=cat?',
        options: ['The host', 'The path', 'A query string parameter', 'The scheme'],
        correctIndex: 2,
        explanation: 'Everything after the ? is the query string. q=cat is a name=value parameter the user controls.',
      },
      {
        prompt: 'What does the HTTPS padlock guarantee?',
        options: [
          'The website is safe to trust',
          'The connection is encrypted and the server identity is verified',
          'The site cannot be hacked',
          'Your data is stored securely',
        ],
        correctIndex: 1,
        explanation: 'HTTPS secures the connection and verifies the server. It says nothing about whether the site itself is honest.',
      },
    ],
  },
  {
    lessonSlug: 'jwt-basics',
    slug: 'cookies-quiz',
    title: 'Sessions and Identity check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why do websites use cookies?',
        options: [
          'To make pages load faster',
          'Because HTTP has no memory, so a token proves you are still the same user',
          'To encrypt traffic',
          'To store the whole site on your device',
        ],
        correctIndex: 1,
        explanation: 'HTTP is stateless. A cookie is the token the browser sends back so the server remembers who you are.',
      },
      {
        prompt: 'What does a session cookie usually contain?',
        options: [
          'Your password',
          'A session ID pointing to a record on the server',
          'Your full profile',
          'The entire website',
        ],
        correctIndex: 1,
        explanation: 'The cookie normally holds just a session ID. The real user data lives in the session record on the server.',
      },
      {
        prompt: 'What is the difference between authentication and authorization?',
        options: [
          'They are the same thing',
          'Authentication is who you are; authorization is what you are allowed to do',
          'Authentication is faster',
          'Authorization happens before login',
        ],
        correctIndex: 1,
        explanation: 'Authentication proves identity; authorization decides what that identity is permitted to do.',
      },
      {
        prompt: 'What protects a JWT from being tampered with?',
        options: [
          'The payload is encrypted',
          'The signature, which breaks if the contents change',
          'It is hidden in a cookie',
          'Nothing protects it',
        ],
        correctIndex: 1,
        explanation: 'A JWT payload is only Base64-encoded and readable. The signature is what detects any change.',
      },
      {
        prompt: 'When you use "Login with Google", what does the app get?',
        options: [
          'Your Google password',
          'A token proving who you are, without your password',
          'Full control of your account',
          'Your entire inbox',
        ],
        correctIndex: 1,
        explanation: 'OAuth hands the app a limited token, never your password, and you approve exactly what it can access.',
      },
    ],
  },
  {
    lessonSlug: 'json-and-apis-intro',
    slug: 'data-and-encoding-quiz',
    title: 'Data, Encoding and Hashing check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Which of these is one-way and cannot be reversed?',
        options: ['Base64 encoding', 'Encryption', 'Hashing', 'URL encoding'],
        correctIndex: 2,
        explanation: 'Hashing is one-way. Encoding reverses freely, encryption reverses with a key.',
      },
      {
        prompt: 'You see the string aGVsbG8= . What is it most likely?',
        options: ['Encrypted data', 'Base64 encoding', 'A hash', 'A MAC address'],
        correctIndex: 1,
        explanation: 'Letters, digits and a trailing = are the classic signs of Base64 - just a reformat, not encryption.',
      },
      {
        prompt: 'Why add a salt before hashing a password?',
        options: [
          'It encrypts the password',
          'It makes identical passwords hash differently and defeats precomputed tables',
          'It makes the hash reversible',
          'It speeds up login',
        ],
        correctIndex: 1,
        explanation: 'A unique salt per user means the same password produces different hashes, so precomputed tables are useless.',
      },
      {
        prompt: 'What is JSON used for?',
        options: [
          'Encrypting traffic',
          'A readable format for apps and APIs to exchange labelled data',
          'Styling pages',
          'Storing passwords',
        ],
        correctIndex: 1,
        explanation: 'JSON is a lightweight, readable data format that apps and APIs use to exchange information.',
      },
      {
        prompt: 'What does %20 mean in a URL?',
        options: ['An encrypted character', 'URL encoding for a space', 'A hex colour', 'A percentage'],
        correctIndex: 1,
        explanation: '%20 is URL encoding: a percent sign followed by the hex code for a space.',
      },
    ],
  },
  {
    lessonSlug: 'burp-suite-first-launch',
    slug: 'nmap-basics-quiz',
    title: 'Your First Tools check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does the pwd command show?',
        options: ['Your password', 'The folder you are currently in', 'The files in a folder', 'Your username'],
        correctIndex: 1,
        explanation: 'pwd prints the working directory - the folder you are currently in.',
      },
      {
        prompt: 'Which curl option shows only the response headers?',
        options: ['-d', '-X', '-I', '-o'],
        correctIndex: 2,
        explanation: '-I fetches just the response headers, without the body.',
      },
      {
        prompt: 'What does Nmap do?',
        options: [
          'Cracks passwords',
          'Checks which ports on a machine are open and what runs behind them',
          'Encrypts your traffic',
          'Edits web requests',
        ],
        correctIndex: 1,
        explanation: 'Nmap scans a host to find open ports and, with -sV, the services and versions behind them.',
      },
      {
        prompt: "What is the core job of Burp Suite's proxy?",
        options: [
          'To speed up your browser',
          'To sit between your browser and the site so you can catch and edit requests',
          'To scan ports',
          'To crack hashes',
        ],
        correctIndex: 1,
        explanation: "Burp's proxy intercepts traffic so you can read and change requests before they reach the server.",
      },
      {
        prompt: 'Before scanning a host with Nmap, what must be true?',
        options: [
          'The host must be online',
          'You must own it or be explicitly authorised to test it',
          'You must use a VPN',
          'It must be a Linux machine',
        ],
        correctIndex: 1,
        explanation: 'Only scan targets you own or are authorised to test. Everything else is unauthorised access.',
      },
    ],
  },
];
