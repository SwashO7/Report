import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'the-web',
    title: 'The Web',
    description: 'What actually happens between your click and the page loading.',
    lessons: [
      {
        slug: 'http',
        title: "HTTP: The Web's Request Language",
        summary: 'Every web page is a conversation. HTTP is the language both sides speak.',
        estimatedMinutes: 5,
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
              'Every time you open a website, your browser and the server have a quick chat. Your browser asks for something, the server answers. HTTP is the language they use for that back-and-forth.',
          },
          {
            type: 'paragraph',
            text:
              'It is stunningly simple. Your browser says "GET me this page", the server says "here you go, and by the way it worked". No magic, just a request and a response in plain text.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**GET** - "give me this resource" (loading a page)',
              '**POST** - "here is some data" (submitting a form)',
              '**PUT** - "update this resource"',
              '**DELETE** - "remove this resource"',
            ],
          },
          {
            type: 'command',
            description: 'Make a raw HTTP request yourself and read the reply:',
            commands: ['curl -v http://example.com'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'HTTP is just text',
            text:
              'A request is readable text you could type by hand. That is exactly why tools let you catch it, edit it, and send it back changed.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know HTTP is a plain request-and-response chat, and you can name the common methods.',
          },
          { type: 'lab_ref', labSlug: 'http-investigation', title: 'Try it: HTTP Investigation lab' },
          {
            type: 'quiz',
            question: 'Which HTTP method is used to simply load a web page?',
            options: ['POST', 'GET', 'DELETE', 'PUT'],
            correctIndex: 1,
            explanation: 'GET asks the server for a resource, like loading a page. POST sends data, such as a form.',
          },
        ],
      },
      {
        slug: 'requests-and-responses',
        title: 'Anatomy of a Request and Response',
        summary: 'Open up one HTTP request and one response and see every part that makes the web work.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Inside an HTTP request and response - every part, line by line'),
          {
            type: 'paragraph',
            text:
              'An HTTP message has a shape you can learn once and recognise forever. Split it in two: what your browser sends (the request) and what the server sends back (the response).',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The request',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'GET /login HTTP/1.1\nHost: example.com\nUser-Agent: Mozilla/5.0\nAccept: text/html\n\n',
          },
          {
            type: 'paragraph',
            text:
              'Top line: the method, the path and the version. Then a list of headers - extra info about you and what you want. A blank line ends the headers, and any body goes after it.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The response',
          },
          {
            type: 'code',
            language: 'http',
            code:
              'HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 1274\n\n<!DOCTYPE html>...',
          },
          {
            type: 'paragraph',
            text:
              'The server answers with a status code (200 means OK), its own headers, a blank line, and then the actual content - the HTML of the page.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Same shape every time',
            text:
              'Start line, headers, blank line, body. Once you see that pattern, every request in a proxy stops looking like noise.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can point at any part of a request or response and say what it does.',
          },
          {
            type: 'quiz',
            question: 'What separates the headers from the body in an HTTP message?',
            options: ['A semicolon', 'A blank line', 'The word BODY', 'Nothing, they run together'],
            correctIndex: 1,
            explanation: 'A single blank line marks the end of the headers. Anything after it is the body.',
          },
        ],
      },
      {
        slug: 'headers',
        title: 'Headers: The Metadata That Runs the Web',
        summary: 'Headers are the sticky notes on every request and response. They quietly control almost everything.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('HTTP headers - the hidden sticky notes controlling every web request'),
          {
            type: 'paragraph',
            text:
              'Headers are small "name: value" lines carried by every request and response. They do not hold the page itself - they hold the details about it. Who you are, what you accept, whether you are logged in.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Host** - which site you want (one server hosts many)',
              '**User-Agent** - what browser or tool you are',
              '**Cookie** - your session token, sent on every request',
              '**Content-Type** - what kind of data is in the body',
              '**Authorization** - credentials or a token proving who you are',
            ],
          },
          {
            type: 'command',
            description: 'See only the response headers of a site:',
            commands: ['curl -I https://example.com'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Headers leak secrets',
            text:
              'A `Server: Apache/2.4.29` header just told you what software is running. Recon often starts by reading headers nobody meant to expose.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read common headers and see how they carry identity, format and hints about the server.',
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
        estimatedMinutes: 5,
        importance: 'core',
        blocks: [
          videoSlot('HTTP status codes - what 200, 404 and 500 are really telling you'),
          {
            type: 'paragraph',
            text:
              'Every response comes with a three-digit status code. The first digit tells you the mood: worked, moved, your fault, or the server\'s fault. Learn the ranges and you can read a scan at a glance.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**2xx** - success. `200 OK` is the happy path',
              '**3xx** - redirect. `301` moved permanently, `302` moved temporarily',
              '**4xx** - you messed up. `404` not found, `401` unauthorised, `403` forbidden',
              '**5xx** - the server messed up. `500` internal error, `503` unavailable',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The difference between `401`, `403` and `404` is gold for a hacker. A `403` says "this exists but you cannot have it" - which just told you the resource is real.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: '403 vs 404 is a tell',
            text:
              'A `404` says nothing is there. A `403` admits something is there but blocked. That tiny difference maps out hidden pages.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Reading a URL like a hacker - every part of the address bar explained'),
          {
            type: 'paragraph',
            text:
              'You type URLs all day without thinking. But a URL is a stack of parts, and each one tells you something. Learn to read them and you start noticing where the interesting inputs are.',
          },
          {
            type: 'code',
            language: 'text',
            code:
              'https://shop.example.com:443/products?id=42&sort=price#reviews\n|_____| |______________| |__| |_______| |_____________| |______|\nscheme      host          port  path       query        fragment',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**scheme** - `https`, the protocol to use',
              '**host** - `shop.example.com`, which server',
              '**path** - `/products`, which resource on it',
              '**query string** - `?id=42&sort=price`, the parameters',
              '**fragment** - `#reviews`, a spot on the page (browser-only)',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The query string is where a lot of the action is. Each `name=value` pair after the `?` is an input you can change. Swap `id=42` for `id=43` and you might be looking at someone else\'s data.',
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
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('HTTPS and TLS - what the padlock actually protects, and what it does not'),
          {
            type: 'paragraph',
            text:
              'HTTP sends everything in plain text, so anyone in the middle can read it. HTTPS is HTTP wrapped in encryption called TLS. Same conversation, but now it is scrambled to everyone except you and the server.',
          },
          {
            type: 'paragraph',
            text:
              'TLS does two jobs. It proves you are really talking to the right server (using a certificate), and it encrypts the traffic so a snoop on the same Wi-Fi sees gibberish instead of your password.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Encryption** - outsiders see scrambled data, not your login',
              '**Identity** - the certificate proves the server is who it claims',
              '**Integrity** - tampering in transit gets detected',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The padlock is not a safety badge',
            text:
              'HTTPS means the connection is private, not that the site is honest. A scam site can have a perfectly valid padlock too.',
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
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Browser DevTools for hackers - the free toolkit hiding behind F12'),
          {
            type: 'paragraph',
            text:
              'You already own a serious hacking tool and you did not pay for it. Press F12 in Chrome or Firefox and DevTools opens - the same window developers use, and the same one you will use to watch a site\'s every move.',
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
              '**Elements** - the HTML and CSS of the current page, editable',
              '**Console** - run JavaScript against the page right now',
              '**Application** - cookies, local storage and session data',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Open the Network tab, reload a page, and watch dozens of requests appear. Click any one to see its headers, the data sent, and what came back. This is where you learn what a site is really doing.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Client-side changes are just cosmetic',
            text:
              'You can edit any page in Elements, but that only changes your view. The real security lives on the server - never trust what you can edit in the browser.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can open DevTools, watch a page\'s network traffic, and inspect its cookies and storage.',
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
    description: 'How sites remember who you are, and how that memory gets abused.',
    lessons: [
      {
        slug: 'cookies',
        title: 'Cookies: Tiny Files, Huge Consequences',
        summary: 'HTTP forgets you between clicks. Cookies are how a site remembers you are still there.',
        estimatedMinutes: 6,
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
              'HTTP has no memory. Each request is a stranger walking in for the first time. So how does a site keep you logged in? It hands your browser a small token called a cookie, and your browser sends it back on every request.',
          },
          {
            type: 'paragraph',
            text:
              'It is like a coat-check ticket at a wedding. The counter does not remember your face, but hand over the ticket and it gives you your coat. Steal the ticket and you get the coat too - which is exactly the risk.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Session cookie** - proves you are logged in, sent every request',
              '**HttpOnly** - JavaScript cannot read it, which blocks some theft',
              '**Secure** - only sent over HTTPS, never plain HTTP',
              '**SameSite** - limits sending the cookie from other sites',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'A stolen cookie is a stolen login',
            text:
              'If an attacker grabs your session cookie, they do not need your password. They just hand over the ticket and walk in as you.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know cookies are how a forgetful protocol remembers you, and why the security flags on them matter.',
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
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Sessions vs cookies - what actually keeps you logged in behind the scenes'),
          {
            type: 'paragraph',
            text:
              'People mix up cookies and sessions. Here is the clean split: the cookie is the ticket in your browser, and the session is the file on the server that the ticket refers to. One is the claim, one is the record.',
          },
          {
            type: 'paragraph',
            text:
              'When you log in, the server creates a session - a note saying "this ID belongs to user Priya, logged in at 10:04". It gives you a cookie holding just the session ID. Every request, you send the ID; the server looks up the note.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'You log in with your password',
              'The server creates a session and stores it',
              'It sends you a cookie with the session ID',
              'Every later request carries that ID so the server knows it is you',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Guessable IDs are a disaster',
            text:
              'If session IDs are short or predictable, an attacker can guess a valid one and become another user. Good IDs are long and random.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain the cookie-versus-session split and trace what happens from login to logged-in.',
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
        estimatedMinutes: 5,
        importance: 'essential',
        blocks: [
          videoSlot('Authentication vs authorization - who you are versus what you can do'),
          {
            type: 'paragraph',
            text:
              'These two get confused constantly, so nail it now. Authentication is proving who you are. Authorization is what you are allowed to do once you are in. One is the door, the other is the rooms you can enter.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Authentication (authn)** - "are you really Priya?" - login, OTP, password',
              '**Authorization (authz)** - "is Priya allowed to open the admin panel?"',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Think of an airport. Authentication is showing your passport at check-in. Authorization is the boarding pass deciding which gate and which seat. A valid passport does not let you into the cockpit.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Where the money bugs live',
            text:
              'A huge class of bugs is broken authorization: you are logged in as yourself, but the app lets you reach things that are not yours. Keep this split in your head.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You will never again confuse "who you are" with "what you can do" - the split behind a whole family of bugs.',
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
        estimatedMinutes: 6,
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
              'A JWT (JSON Web Token) is a popular alternative to server-side sessions. Instead of the server storing your session, it hands you a signed token that carries the facts about you, and you send it back each request.',
          },
          {
            type: 'paragraph',
            text:
              'The surprise for beginners: a JWT is not encrypted. It is three parts separated by dots, and the middle part is just Base64. Anyone can decode it and read what it claims. The signature is what stops you changing it.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Header** - which signing algorithm is used',
              '**Payload** - the claims: who you are, your role, expiry',
              '**Signature** - proof the token was not tampered with',
            ],
          },
          {
            type: 'command',
            description: 'Decode the readable middle part of a token (safe, local only):',
            commands: ['echo "<payload-part>" | base64 -d'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Readable does not mean forgeable',
            text:
              'You can read a JWT, but changing the payload breaks the signature. Weak or missing signature checks are exactly what JWT attacks target later.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know a JWT is a signed, readable token in three parts, and that the signature - not secrecy - protects it.',
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
        estimatedMinutes: 6,
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
              'You have clicked "Login with Google" a hundred times. That is OAuth doing its job. It lets one site log you in using your account somewhere else, without ever seeing your password for that other account.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a valet key. You give the valet a key that starts the car but does not open the boot. The app gets permission to know who you are, but never gets your actual Google password.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'You click "Login with Google" on some app',
              'You get sent to Google to approve it',
              'Google asks "let this app see your basic profile?"',
              'You approve, and Google hands the app a token - not your password',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Consent is the whole point',
            text:
              'OAuth is about granting limited access. The screen listing what an app can see is the consent step - and misconfigured OAuth flows are a real bug class.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can explain how "Login with Google" signs you in without sharing your password with the app.',
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
            explanation: 'OAuth hands the app a limited token, never your password. You approve exactly what it can access.',
          },
        ],
      },
    ],
  },
  {
    slug: 'data-and-encoding',
    title: 'Data, Encoding and Hashing',
    description: 'Tell encoding, encryption and hashing apart forever - the three get mixed up constantly.',
    lessons: [
      {
        slug: 'encoding-vs-encryption-vs-hashing',
        title: 'Encoding vs Encryption vs Hashing',
        summary: 'Three things that scramble data, three totally different purposes. Confusing them causes real bugs.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('Encoding vs encryption vs hashing - stop confusing the three forever'),
          {
            type: 'paragraph',
            text:
              'These three get mixed up all the time, even by developers. They all turn readable data into something else, but for completely different reasons. Get this straight and half of crypto confusion disappears.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Encoding** - reformat data so systems can carry it. Not secret, anyone can reverse it (Base64)',
              '**Encryption** - hide data with a key. Reversible only if you have the key',
              '**Hashing** - a one-way fingerprint. Cannot be reversed, same input always gives the same hash',
            ],
          },
          {
            type: 'paragraph',
            text:
              'The giveaway: encoding needs no key and reverses freely. Encryption needs a key to go back. Hashing does not go back at all - you can only check if a new input produces the same fingerprint.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Base64, hex and URL encoding - spot them on sight and decode them fast'),
          {
            type: 'paragraph',
            text:
              'While hunting, you will constantly bump into scrambled-looking strings. Most are not encrypted - they are just encoded. Learn to recognise the three common types and you can read them instantly.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Base64** - letters, digits, `+/`, often ending in `=`. `aGVsbG8=` is "hello"',
              '**Hex** - only `0-9` and `a-f`. `68656c6c6f` is also "hello"',
              '**URL encoding** - `%` followed by two hex digits. `%20` is a space, `%2F` is `/`',
            ],
          },
          {
            type: 'command',
            description: 'Encode and decode Base64 on your own machine:',
            commands: ['echo -n "hello" | base64', 'echo "aGVsbG8=" | base64 -d'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'CyberChef is your friend',
            text:
              'When a string looks odd, tools like CyberChef will guess the encoding and unwrap it. But learn to eyeball the common three yourself.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('How passwords should be stored - hashing, salting, and why plain text is a crime'),
          {
            type: 'paragraph',
            text:
              'A properly built site never stores your real password. It stores a hash of it - that one-way fingerprint. When you log in, it hashes what you typed and compares fingerprints. Even the site never sees your actual password again.',
          },
          {
            type: 'paragraph',
            text:
              'But plain hashing is not enough. Two people with the password "india123" get the same hash, and attackers precompute huge tables of common hashes. The fix is a salt - a random value added to each password before hashing.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Plain text** - the site stores your actual password. A disaster',
              '**Plain hash** - better, but vulnerable to precomputed tables',
              '**Salted hash** - random salt per user defeats those tables',
              '**bcrypt / argon2** - slow-on-purpose hashes built for passwords',
            ],
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
            text: 'You know why good sites store salted, slow hashes - and why finding plain-text passwords is a serious finding.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('JSON and APIs in 6 minutes - how modern apps actually talk to each other'),
          {
            type: 'paragraph',
            text:
              'Behind most modern apps, the front end and back end chat using APIs, and they mostly speak JSON. Once you can read JSON, you can read what an app is really sending - which is most of web hacking.',
          },
          {
            type: 'paragraph',
            text:
              'JSON is just labelled data: keys and values, wrapped in braces. It is designed to be readable by both machines and humans, which is very good news for you.',
          },
          {
            type: 'code',
            language: 'json',
            filename: 'user.json',
            code:
              '{\n  "id": 42,\n  "name": "Priya",\n  "role": "user",\n  "isAdmin": false\n}',
          },
          {
            type: 'paragraph',
            text:
              'An API is just a set of URLs an app calls to get or change data - like `GET /api/users/42`. It answers with JSON. Notice that `"isAdmin": false` above? Changing values like that is a whole attack class.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'APIs are the real attack surface',
            text:
              'The pretty page is just paint. The API underneath is where the data and the decisions live, so that is where you look for bugs.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a JSON object and understand what an API is doing when an app calls one.',
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
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Unicode tricks hackers love - when two identical letters are not the same'),
          {
            type: 'paragraph',
            text:
              'Computers store text as numbers, and the map from characters to numbers is a character set. ASCII covered basic English; Unicode covers nearly every script on Earth. That richness creates weird edge cases attackers enjoy.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**ASCII** - the original 128 characters, plain English',
              '**UTF-8** - the Unicode encoding the web runs on',
              '**Homoglyphs** - characters that look identical but are different (Latin "a" vs Cyrillic "a")',
              '**Normalization** - collapsing different byte sequences to one form',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Homoglyphs power lookalike-domain scams: `pаypal.com` with a Cyrillic letter looks right but is a different site. Normalization bugs can also sneak a blocked word or character past a filter.',
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
            text: 'You know why two identical-looking characters can be different bytes, and how that fuels lookalike and filter tricks.',
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
    description: 'Four tools, one scan, zero fear - the starter kit you will use in every lesson that follows.',
    lessons: [
      {
        slug: 'command-line-basics',
        title: 'The Command Line, Minus the Fear',
        summary: 'The black window is not scary. It is just typing instructions instead of clicking them.',
        estimatedMinutes: 6,
        importance: 'essential',
        blocks: [
          videoSlot('The command line without fear - your first ten commands, explained'),
          {
            type: 'paragraph',
            text:
              'The terminal looks intimidating because it is silent and plain. But it is just a way to tell the computer what to do by typing instead of clicking. Once it clicks, it is faster than any menu.',
          },
          {
            type: 'paragraph',
            text:
              'A command is a word, sometimes with options and a target. `ls -l /home` means "list, in long form, the /home folder". Word, options, target. That pattern covers most of what you type.',
          },
          {
            type: 'command',
            description: 'The handful you will use constantly - all read-only and safe:',
            commands: ['pwd', 'ls -l', 'cd /tmp', 'cat notes.txt', 'whoami'],
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
            type: 'callout',
            variant: 'info',
            title: 'Tab and up-arrow are cheats',
            text:
              'Press Tab to auto-complete names and up-arrow to repeat past commands. You will type half as much and make fewer mistakes.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can move around, list files and read them from the terminal - the base every tool builds on.',
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
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('curl basics - talk to any server by hand from your terminal'),
          {
            type: 'paragraph',
            text:
              'A browser makes requests for you and hides the details. curl makes the same requests but shows you everything and lets you control every part. It is how you talk to a server directly, by hand.',
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
            type: 'list',
            ordered: false,
            items: [
              '**-I** - show only the response headers',
              '**-v** - verbose: show the full request and response',
              '**-X** - choose the method (GET, POST, and so on)',
              '**-d** - send data in the body',
              '**-H** - add a custom header',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'curl sees what the browser hides',
            text:
              'Because curl shows the raw exchange, it is perfect for poking an API, testing a header, or checking what a redirect actually does.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can send GET and POST requests by hand and read the raw response - no browser required.',
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
        summary: 'Nmap knocks on a machine\'s doors and tells you which ones are open. It is the classic first move of recon.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Nmap first scan - find every open door on a machine in one command'),
          {
            type: 'paragraph',
            text:
              'Remember ports - the doors on a machine? Nmap is the tool that walks up and checks which doors are open, and often what is running behind them. It is the single most iconic recon tool, and it is friendly once you start.',
          },
          {
            type: 'command',
            description: 'Scan a host you own or are authorised to test:',
            commands: [
              'nmap scanme.nmap.org',
              'nmap -sV scanme.nmap.org',
              'nmap -p 80,443 scanme.nmap.org',
            ],
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**nmap host** - a basic scan of common ports',
              '**-sV** - also detect the service and version on each open port',
              '**-p** - scan specific ports, like `-p 80,443`',
              '**-Pn** - skip the ping check (useful when a host blocks ping)',
            ],
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only your own targets',
            text:
              'Only scan machines you own or are explicitly authorised to test. `scanme.nmap.org` is provided for exactly this practice.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You ran your first real scan and can list the open ports and services on an authorised target.',
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
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Burp Suite first launch - catch and edit web traffic like a pro'),
          {
            type: 'paragraph',
            text:
              'Burp Suite is the tool web hackers live inside. At its heart it is a proxy: it sits between your browser and the website, so every request pauses at your desk where you can read it, change it, and send it on.',
          },
          {
            type: 'paragraph',
            text:
              'That "pause and edit" power is the whole game. The browser enforces rules like max length or hidden fields - but once the request is in Burp, none of that applies. You control the raw bytes.',
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
            type: 'callout',
            variant: 'info',
            title: 'First-launch checklist',
            text:
              'Start Burp, set your browser to use its proxy, install Burp\'s certificate so HTTPS works, then browse. Requests will start appearing in the Proxy tab.',
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
            question: 'What is the core job of Burp Suite\'s proxy?',
            options: [
              'To speed up your browser',
              'To sit between your browser and the site so you can catch and edit requests',
              'To scan ports',
              'To crack passwords',
            ],
            correctIndex: 1,
            explanation: 'Burp\'s proxy intercepts traffic between your browser and the server, letting you read and change requests before they are sent.',
          },
        ],
      },
      {
        slug: 'note-taking-for-hackers',
        title: 'Notes That Win Bounties',
        summary: 'The finding you cannot reproduce is worth nothing. Good notes are the difference between a payout and a "meh".',
        estimatedMinutes: 5,
        importance: 'optional',
        blocks: [
          videoSlot('Note-taking for hackers - the boring habit that actually earns bounties'),
          {
            type: 'paragraph',
            text:
              'The least glamorous skill in hacking pays the most: taking notes. You will test dozens of things in an hour. Without notes, you will forget which request behaved oddly, and a forgotten bug is an unpaid bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**What you tested** - the URL, the parameter, the payload',
              '**What happened** - the response, the status code, anything odd',
              '**How to repeat it** - the exact steps, so you can prove it later',
              '**Screenshots** - evidence beats a description every time',
            ],
          },
          {
            type: 'paragraph',
            text:
              'A report gets paid only if the triager can reproduce your bug. That means your notes need the exact request, the exact steps, and the exact result. Sloppy notes lose real money.',
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
        prompt: 'What is the core job of Burp Suite\'s proxy?',
        options: [
          'To speed up your browser',
          'To sit between your browser and the site so you can catch and edit requests',
          'To scan ports',
          'To crack hashes',
        ],
        correctIndex: 1,
        explanation: 'Burp\'s proxy intercepts traffic so you can read and change requests before they reach the server.',
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
