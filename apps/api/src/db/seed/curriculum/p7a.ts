import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'api-security',
    title: 'API Security',
    description:
      "Modern apps are barely web pages any more - they are a phone or a browser talking to a pile of APIs behind the scenes, and that is where the real attack surface lives. By the end you can describe what a REST endpoint trusts that a web page does not, find the specific places authorisation gets skipped, spot a mass-assignment or BOLA bug in a JSON body, and map an API that ships with no documentation at all.",
    lessons: [
      {
        slug: 'rest-api-attack-surface',
        title: 'The REST API Attack Surface',
        summary: 'A REST API is just a machine talking to a machine. No screen, no buttons - and that is exactly why so much authorisation gets forgotten.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Open the Swiggy app and tap on your orders. No new web page loads - the app quietly fires a request to something like `GET /api/v1/orders/8842` and gets back a blob of JSON. That request is an API call, and the server on the other end is a REST API. Almost every app on your phone works this way now, which means the real attack surface is not the pretty screen, it is the pile of endpoints behind it.",
          },
          {
            type: 'paragraph',
            text:
              "REST is a style, not a product, and it rests on four simple ideas. First, everything is a *resource* with an address: an order is `/orders/8842`, a user is `/users/17`, a comment is `/comments/91`. Second, you act on a resource with an HTTP *verb*: `GET` to read, `POST` to create, `PUT` or `PATCH` to change, `DELETE` to remove. Third, the server answers with a *status code* that tells you what happened - `200` fine, `401` not logged in, `403` logged in but not allowed, `404` not found. Fourth, and this is the one that matters most, REST is *stateless*: the server remembers nothing about you between requests, so every single request must carry its own proof of who you are, usually a token in a header.",
          },
          {
            type: 'paragraph',
            text:
              "Statelessness is the crack everything crawls through. Because the server has no memory, it re-decides on every request whether you are allowed to do the thing. A web page can hide the 'edit' button from a normal user and feel secure. An API cannot hide anything - the endpoint is just sitting there at a guessable address, and if the code forgets to check 'is this order actually yours?' before returning it, then changing `8842` to `8843` hands you someone else's order. The screen was never the guard. The check in the code was, and APIs make it very easy to skip that check.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**GET** - read a resource, should never change anything',
              '**POST** - create a new resource',
              '**PUT / PATCH** - replace or partly update a resource',
              '**DELETE** - remove a resource',
              '**401 vs 403** - `401` means "who are you?" (not authenticated); `403` means "I know you, and no" (not authorised)',
              '**Statelessness** - no server-side memory of you; every request re-proves identity and re-checks permission',
            ],
          },
          {
            type: 'command',
            description: 'On an API you own or are authorised to test, read one resource with your token, then change only the id and send it again:',
            commands: [
              'curl -s https://api.example.com/api/v1/orders/8842 -H "Authorization: Bearer YOUR_TOKEN"',
              'curl -s https://api.example.com/api/v1/orders/8843 -H "Authorization: Bearer YOUR_TOKEN"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Read the two responses side by side, because the comparison is the whole test. The first call returns your own order as JSON with a `200` - that is the baseline, proof your token works. In the second call you changed nothing but the number on the end. If it returns a `403` or `404`, the server checked ownership and refused - good, boring, secure. If it returns a `200` with someone else's name, address and items, the server authenticated you (your token is valid) but never authorised you (it never asked whether order 8843 was yours). That gap between authenticated and authorised is where a huge share of API bugs live.",
          },
          {
            type: 'paragraph',
            text:
              "Why this matters when you are hunting: an API gives you a clean, scriptable list of doors, and each door is a place to ask 'does this endpoint check that the thing belongs to me?'. You test it by taking a request that works for your account and pointing it at another account's data. The impact sentence a triager wants is concrete - 'any authenticated user can read any other user's orders by changing the id' - because that is a broken-access-control finding, and those pay.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Authenticated is not authorised',
            text:
              "A valid token proves *who* you are. It says nothing about *what* you are allowed to touch. Every endpoint has to check both, on every request - and the second check is the one that quietly goes missing.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only your own doors',
            text: 'Swapping ids to read another account only counts as testing on an API you own or are written-in authorised to assess. Do it anywhere else and it is unauthorised access, full stop.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a REST endpoint, tell authentication apart from authorisation, and explain why statelessness is exactly why the ownership check gets skipped.',
          },
          { type: 'related_lesson', lessonSlug: 'idor', title: 'The same bug in web pages: IDOR' },
          {
            type: 'quiz',
            question: 'Your token is valid and the server returns another user\'s order when you change the id. What went wrong?',
            options: [
              'The API failed to authenticate you',
              'The API authenticated you but never checked the order was yours',
              'Your token expired',
              'The order does not exist',
            ],
            correctIndex: 1,
            explanation: 'Authentication (valid token) succeeded; authorisation (is this resource yours?) was never checked. That missing ownership check is the core of most API access-control bugs.',
          },
        ],
      },
      {
        slug: 'api-authentication-flaws',
        title: 'API Authentication Flaws',
        summary: 'Before an API can check what you are allowed to do, it has to know who you are. That first step breaks more often than you would think.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Every API request has to answer one question first: who is sending this? Because REST keeps no memory, the answer travels with the request - almost always a token in a header. Get the handling of that token wrong and the whole building has no front door, no matter how good the locks are inside.",
          },
          {
            type: 'paragraph',
            text:
              "There are a handful of ways APIs prove identity, and each fails in its own way. A *bearer token* is a string you send in an `Authorization: Bearer ...` header; whoever holds it is treated as you, so a leaked one in a log or a URL is game over. An *API key* is a long static secret, often baked into a mobile app where anyone can extract it. *Basic auth* is just your username and password base64-encoded - not encrypted, just reversibly scrambled - so it must ride over HTTPS or it is readable in transit. And a *JWT* is a token you can actually decode and read, which is a lesson of its own.",
          },
          {
            type: 'paragraph',
            text:
              "Walk one concrete failure. An app authenticates with a bearer token, and the developer, testing locally, added a shortcut: if the request carries a header `X-Debug-User: admin`, skip the token check and treat the caller as that user. It was meant to be removed before launch. It was not. Now an attacker who sends `X-Debug-User: admin` with no token at all is logged in as an administrator. This is not exotic - forgotten debug backdoors, endpoints that accept an *expired* token because nobody checks the expiry, and 'optional' auth that quietly defaults to a privileged account are all the same shape: the identity step trusts something it should not.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Bearer token** - holder is treated as the user; a leak equals a login',
              '**API key** - long static secret, frequently extractable from a mobile app or a JS bundle',
              '**Basic auth** - `base64(user:pass)`, reversible, safe ONLY over HTTPS',
              '**Missing expiry check** - server accepts a token long after it should have died',
              '**Debug / backdoor headers** - test shortcuts that ship to production and skip auth entirely',
            ],
          },
          {
            type: 'command',
            description: 'On an API you are authorised to test, send a request with NO token, then with a deliberately invalid one, and read the status codes:',
            commands: [
              'curl -s -o /dev/null -w "%{http_code}\\n" https://api.example.com/api/v1/me',
              'curl -s -o /dev/null -w "%{http_code}\\n" https://api.example.com/api/v1/me -H "Authorization: Bearer not-a-real-token"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The `-w \"%{http_code}\"` trick prints only the status number, so you can compare the two calls at a glance. A healthy endpoint returns `401` both times - no token and a junk token are both rejected. If the no-token call returns `200` with real data, the endpoint has optional or missing authentication and is serving anyone who asks. If the junk-token call returns `200`, the server is not actually validating the token, only checking that a header is present. Either `200` is a finding; the status code is doing the telling.",
          },
          {
            type: 'paragraph',
            text:
              "For a hunter this is high-value because a broken authentication step affects everyone: it is not 'this one account is exposed' but 'anyone can be any account'. The report is blunt - name the endpoint, show the request that got in without valid credentials, and state the impact: complete authentication bypass. Pair it with what an unauthenticated caller can then reach.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Try the request with nothing',
            text:
              "The fastest auth test is to strip the token entirely and resend. A surprising number of endpoints that look protected will happily answer an anonymous request - they check the header exists, never that it is valid.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Probing authentication - sending forged, empty or debug headers - is only testing on a system you own or hold written permission to assess.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the common ways APIs prove identity, and you can test whether an endpoint truly validates a token or just checks a header is present.',
          },
          { type: 'related_lesson', lessonSlug: 'jwt-attacks', title: 'Going deeper on tokens: JWT Attacks' },
          {
            type: 'quiz',
            question: 'An endpoint returns 200 with real data when you send an invalid bearer token. What does that tell you?',
            options: [
              'The token is somehow valid',
              'The server checks a header is present but never validates the token',
              'The endpoint is public by design and this is fine',
              'You need to send the token twice',
            ],
            correctIndex: 1,
            explanation: 'A junk token being accepted means the server is not actually validating tokens - it only confirms the header exists. That is a broken authentication finding.',
          },
        ],
      },
      {
        slug: 'mass-assignment-and-bola',
        title: 'Mass Assignment and BOLA',
        summary: 'Two of the most common API bugs, side by side: sending a field you should not be allowed to set, and reading an object that is not yours.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "These two bugs top every API vulnerability list for a reason: they are everywhere, they are simple, and scanners often miss them. BOLA is reading or changing an object that belongs to someone else. Mass assignment is sending an extra field in your request that the server blindly saves. Different bugs, same root cause - the server trusts the input more than it should.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'BOLA: the object is not yours',
          },
          {
            type: 'paragraph',
            text:
              "BOLA - Broken Object Level Authorisation - is the API twin of IDOR. You call `GET /api/v1/invoices/1001` and get your own invoice. You change `1001` to `1002` and get someone else's, because the server checked you were logged in but never checked the invoice belonged to you. That is it. The reason it is worth its own name in the API world is scale: an API hands you thousands of neatly numbered objects to walk through, and one missing ownership check exposes all of them.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Mass assignment: the field you were not offered',
          },
          {
            type: 'paragraph',
            text:
              "Now the worked example that makes mass assignment click. You update your profile and the app sends this body:",
          },
          {
            type: 'code',
            language: 'json',
            filename: 'PATCH /api/v1/users/17',
            code: '{\n  "displayName": "Arjun",\n  "email": "arjun@example.com"\n}',
          },
          {
            type: 'paragraph',
            text:
              "The form only let you edit those two fields. But the server takes the whole JSON object and maps it straight onto the user record in the database. So you resend the request by hand and add a field the form never showed you:",
          },
          {
            type: 'code',
            language: 'json',
            filename: 'PATCH /api/v1/users/17 (tampered)',
            code: '{\n  "displayName": "Arjun",\n  "email": "arjun@example.com",\n  "role": "admin"\n}',
          },
          {
            type: 'paragraph',
            text:
              "If the server saves that `role` field without checking whether you are allowed to set it, you just made yourself an administrator by typing one extra line. The server assumed you could only send what the form offered. An attacker sends whatever they like. Other classic injected fields are `isVerified`, `accountBalance`, `discount` and `userId` - anything the backend model has that the UI never exposed.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**BOLA** - reading/changing another user\'s object by changing an id; the single most common API bug',
              '**Mass assignment** - adding an unlisted field to a request body that the server saves without checking',
              'Fields worth trying: `role`, `isAdmin`, `isVerified`, `userId`, `accountBalance`, `discount`, `status`',
              'Confirm BOLA by comparing a self request against the same request pointed at another id',
              'Confirm mass assignment by reading the object back after your write and checking the injected field stuck',
            ],
          },
          {
            type: 'command',
            description: 'On an account you control, add an unlisted field to your own profile update, then read the profile back to see if it stuck:',
            commands: [
              'curl -s -X PATCH https://api.example.com/api/v1/users/17 -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d \'{"displayName":"Arjun","role":"admin"}\'',
              'curl -s https://api.example.com/api/v1/users/17 -H "Authorization: Bearer YOUR_TOKEN"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The write request slips in `\"role\":\"admin\"`, a field the profile form never offered. The follow-up `GET` is the proof step, and you must always do it: read the object back and look at the `role` value in the returned JSON. If it now says `admin`, the server accepted the field and the bug is confirmed - suspecting is not enough, you show it stuck. If the response still shows your original role, the server ignored the extra field and there is no finding here.",
          },
          {
            type: 'paragraph',
            text:
              "Impact for the report: BOLA is a data-exposure or data-tampering finding scaled by how many objects it touches - 'any user can read every invoice' is critical. Mass assignment is often straight privilege escalation - 'any user can set their own role to admin' - and you prove it with the before-and-after read, quoting the exact injected field. A triager wants the request, the field, and the confirmed effect.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Always read it back',
            text:
              "The server may accept your tampered field silently and still return a normal-looking response. The only proof is to GET the object afterwards and see the injected value in the data. No read-back, no finding.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own account only',
            text: 'Test BOLA and mass assignment against objects and accounts you own or are explicitly cleared to touch. Reaching real strangers\' data is where testing becomes an offence.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can spot BOLA by walking ids and prove mass assignment by injecting a field and reading it back - the two bugs at the top of every API list.',
          },
          { type: 'practice_ref', title: 'API Security check', exerciseSlug: 'api-security-quiz' },
          {
            type: 'quiz',
            question: 'You add "role":"admin" to your profile update and afterwards the GET shows your role as admin. What is this?',
            options: [
              'A BOLA finding',
              'A mass assignment finding - the server saved a field you should not control',
              'Normal behaviour',
              'An authentication bypass',
            ],
            correctIndex: 1,
            explanation: 'The server bound an unlisted field (role) straight onto the record without an authorisation check. Confirmed by reading the object back and seeing the value stuck. That is mass assignment.',
          },
        ],
      },
      {
        slug: 'api-versioning-and-shadow-endpoints',
        title: 'Old Versions and Shadow Endpoints',
        summary: 'The version of the API nobody maintains any more, and the endpoints that were never meant to be public, are often the softest way in.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "When an API changes, the old version rarely dies. The team ships `/api/v2/` for the new app, but `/api/v1/` stays running so older phones keep working - and `v1` stops getting security fixes the day everyone's attention moves on. Add the endpoints that were never supposed to be reachable at all, and you have two of the most reliable places to find a bug: the forgotten version and the shadow endpoint.",
          },
          {
            type: 'paragraph',
            text:
              "Think of it like a shop that renovated the front but left the old side entrance unlocked because a few regulars still use it. The new door has a guard and a camera. The old door has neither, because everyone forgot it was there. A `v1` endpoint may still accept a weaker token format, skip a check that `v2` added, or expose a field that was later hidden. The fix went into the version people watch; the version people forgot never got it.",
          },
          {
            type: 'paragraph',
            text:
              "'Shadow endpoints' are the ones that exist but are not in the docs and not linked in the app: a `/api/internal/` path meant for backend use, a `/debug/` route, a `/api/v1/admin/export` that the mobile app never calls but that still answers. They are undocumented, so nobody tested them the way the public ones were tested, and 'nobody looks here' is a security model that fails the moment someone looks. You find them by taking a known endpoint and trying its neighbours: swap `v2` for `v1` and `v3`, swap `/users/me` for `/users/all`, try `/export`, `/debug`, `/internal`.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Version markers to try swapping: `/v1/`, `/v2/`, `/v3/`, `/beta/`, `/internal/`',
              'Old versions often lag on auth changes, rate limits and field-level filtering',
              'Shadow paths worth guessing: `/debug`, `/export`, `/admin`, `/internal`, `/test`',
              'A response schema that differs between versions is a strong sign one skips a check the other adds',
              'Undocumented does not mean unreachable - the server answers whether or not the docs mention it',
            ],
          },
          {
            type: 'command',
            description: 'On an API you are authorised to test, request the same resource across versions and compare what comes back:',
            commands: [
              'curl -s -o /dev/null -w "v2: %{http_code}\\n" https://api.example.com/api/v2/users/17 -H "Authorization: Bearer YOUR_TOKEN"',
              'curl -s -o /dev/null -w "v1: %{http_code}\\n" https://api.example.com/api/v1/users/17 -H "Authorization: Bearer YOUR_TOKEN"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Compare the two status lines. If `v2` returns `403` (the new version enforces a check) but `v1` returns `200` with the data, you have found a version that skips an authorisation the current one applies - the old door with no guard. If both behave the same, versioning is not the weak spot here and you move on. When the codes match, fetch the full bodies too: `v1` sometimes returns extra fields - an email, a phone number - that `v2` learned to strip, and that difference is a disclosure finding on its own.",
          },
          {
            type: 'paragraph',
            text:
              "For the hunter this is cheap, high-yield work: you are not finding a new bug, you are finding a fixed bug that still lives at an old address. The report names both endpoints and shows the difference - 'v2 enforces ownership, v1 does not, so any user reads any record via v1' - which makes the fix obvious: retire or patch the old version.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The fix is in the version nobody uses',
            text:
              "When you find a check on the current endpoint, always try the previous version. The security fix usually landed on `v2` alone, and `v1` is still serving the vulnerable behaviour to anyone who asks for it by name.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Guessing paths is still testing',
            text: 'Probing for hidden versions and shadow endpoints only counts as research on a target you own or are authorised to assess. Elsewhere, poking undocumented paths is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know why old API versions and undocumented endpoints stay vulnerable, and how to find them by comparing a known endpoint against its neighbours.',
          },
          {
            type: 'quiz',
            question: 'A resource returns 403 on /api/v2/ but 200 with full data on /api/v1/. What have you found?',
            options: [
              'Nothing - versions are supposed to differ',
              'An old version that skips an authorisation check the current one enforces',
              'A network error',
              'A rate-limit problem',
            ],
            correctIndex: 1,
            explanation: 'The security fix went into v2 only. v1 still serves the vulnerable behaviour, so any user can reach the data through the forgotten version.',
          },
        ],
      },
      {
        slug: 'testing-apis-without-docs',
        title: 'Testing an API With No Docs',
        summary: 'No documentation, no Swagger page, no endpoint list. The app itself is the documentation - you just have to read it.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Reverse-engineering an undocumented API from the app and the JS bundle'),
          {
            type: 'paragraph',
            text:
              "Real targets rarely hand you a tidy API reference. There is no Swagger page, no list of endpoints, nothing. But the app that talks to the API is running on your own device or in your own browser, and every request it makes is visible to you. The app IS the documentation. Your job is to watch it work and write down what it says.",
          },
          {
            type: 'paragraph',
            text:
              "For a web app, the tool is already in your browser: open DevTools, go to the Network tab, filter to `Fetch/XHR`, and just use the site. Log in, open your profile, load a list, submit a form. Each action fires one or more API calls, and each call shows you the method, the full URL, the headers (including your token) and the JSON body. Ten minutes of clicking around builds a real map of the API - the endpoints, the id formats, the field names - none of which was written down anywhere.",
          },
          {
            type: 'paragraph',
            text:
              "The JavaScript bundle is the second goldmine. Modern sites ship a big `app.js` (often minified into one dense file), and that file contains the URLs of endpoints the app can call - including ones you have not triggered yet. Search the bundle for `/api/`, for `fetch(`, for `axios`, and you will pull out paths the interface never took you to: an admin export, a feature behind a flag, a v1 route. For a mobile app the same idea applies one level deeper - you point the phone's traffic through an intercepting proxy and watch the API calls the same way you watched the browser's.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'DevTools Network tab, filtered to `Fetch/XHR`, is a free live API recorder',
              'Every captured request shows method, URL, headers and body - the whole call',
              'Grep the JS bundle for `/api/`, `fetch(`, `axios`, `.get(`, `.post(` to find unused endpoints',
              'Note id formats (sequential number vs UUID) - sequential ids make BOLA testing trivial',
              'Build a list: endpoint, method, what it does, what fields it takes - that list IS your test plan',
            ],
          },
          {
            type: 'command',
            description: 'After saving the site\'s JavaScript bundle locally, pull out every API path it references:',
            commands: [
              'grep -oE "/api/[a-zA-Z0-9/_-]+" app.js | sort -u',
              'grep -oE "(fetch|axios)\\([^)]+" app.js | head -n 40',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The first `grep` prints every distinct string that looks like an API path - `/api/v1/orders`, `/api/v1/admin/export`, `/api/v2/users` - and `sort -u` removes duplicates so you get a clean endpoint list. Read it looking for the ones you never saw in the UI; those are your leads. The second command pulls out the actual `fetch` and `axios` calls, which show you not just the path but how it is called - the method and sometimes the body shape. Together they turn one downloaded file into a documented API you can now test endpoint by endpoint.",
          },
          {
            type: 'paragraph',
            text:
              "This is the unglamorous work that makes everything else possible: you cannot test BOLA, mass assignment or a shadow endpoint until you know the endpoint exists. Mapping an undocumented API is the recon that feeds every API bug you will report, and doing it well - a complete list before you attack - is what separates a thorough hunter from someone poking one endpoint at random.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The interface hides endpoints; the code does not',
            text:
              "The UI only shows you the buttons the designers put there. The JavaScript bundle lists every endpoint the app CAN call, including the ones behind flags, admin gates and old versions. Read the code, not just the screen.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can map an undocumented API from the Network tab and the JS bundle, turning a black box into a written test plan of endpoints and fields.',
          },
          {
            type: 'quiz',
            question: 'You have no API docs. Where do you find the fullest list of endpoints the app can reach?',
            options: [
              'Only by guessing common paths',
              'In the JavaScript bundle and the Network tab of the running app',
              'You cannot test an API without official docs',
              'By emailing the company for their spec',
            ],
            correctIndex: 1,
            explanation: 'The app is the documentation. The Network tab records live calls and the JS bundle lists endpoints the app can call - including ones the interface never triggers.',
          },
        ],
      },
    ],
  },
  {
    slug: 'graphql',
    title: 'GraphQL',
    description:
      "One endpoint instead of hundreds, where the client asks for exactly the data it wants - flexible for developers, and a gift for attackers. By the end you can read a GraphQL query and its response, pull a full schema out of a server with introspection, use aliases and batching to hammer a login past its rate limit, and explain why per-object authorisation is even easier to forget here than in REST.",
    lessons: [
      {
        slug: 'graphql-basics',
        title: 'GraphQL Basics',
        summary: 'Instead of many URLs, GraphQL gives you one, and you send it a shopping list of exactly the data you want. Here is how to read it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "REST gives you a hundred addresses, one per resource. GraphQL flips that: there is usually a single endpoint, almost always `/graphql`, and instead of picking a URL you send a *query* describing exactly the data you want back. Think of a REST API as a fixed thali - you get the plates the kitchen decided on - and GraphQL as ordering a la carte, naming each dish and how much of it.",
          },
          {
            type: 'paragraph',
            text:
              "A query is just a nested shape of field names. You ask for a user, and inside that user you ask for specific fields - and you can walk relationships in the same request, pulling the user's orders without a second call. Here is a real one:",
          },
          {
            type: 'code',
            language: 'graphql',
            filename: 'POST /graphql',
            code: 'query {\n  user(id: 17) {\n    displayName\n    email\n    orders {\n      id\n      total\n    }\n  }\n}',
          },
          {
            type: 'paragraph',
            text:
              "The server answers with JSON shaped exactly like the query - a `data` object containing `user`, containing `displayName`, `email` and an `orders` list. Three things matter for a hacker. First, it is almost always a `POST` to one URL, so you will not see a tidy list of endpoints in the Network tab - just repeated calls to `/graphql` with different query bodies. Second, the *type* of operation is written in the query: `query` reads, `mutation` changes, `subscription` streams. Third, because the client chooses the fields, the server has to make an authorisation decision on every field it returns - and that is a lot of decisions to get right.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'One endpoint, usually `/graphql`, reached by `POST` with a query in the body',
              '`query` = read, `mutation` = write/change, `subscription` = live stream',
              'The response JSON mirrors the shape of the query you sent',
              'You can traverse relationships (user -> orders -> items) in a single request',
              'The client picks the fields, so authorisation has to be enforced field by field',
            ],
          },
          {
            type: 'command',
            description: 'On a GraphQL API you are authorised to test, send a simple query and read the response shape:',
            commands: [
              'curl -s https://api.example.com/graphql -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d \'{"query":"query { user(id: 17) { displayName email } }"}\'',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Notice the query is wrapped as a JSON string under a `query` key - that envelope is how every GraphQL request travels. The response comes back as `{\"data\": {\"user\": {\"displayName\": \"...\", \"email\": \"...\"}}}`, mirroring what you asked for. If you made a mistake, you get an `errors` array instead of (or alongside) `data`, and those error messages are often chatty - GraphQL servers love to suggest 'did you mean this field?', which quietly leaks the schema. Reading whether you got `data` or `errors`, and what the errors say, is the start of every GraphQL test.",
          },
          {
            type: 'paragraph',
            text:
              "Why this matters: GraphQL concentrates the whole API behind one door, which sounds safer but is not. The flexibility that lets a client ask for anything means the server must refuse the right things everywhere, and its helpful error messages hand you a map. Understanding the query shape is the foundation for everything in this module - you cannot attack what you cannot read.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'One URL, many requests',
            text:
              "Do not expect a list of endpoints. Every GraphQL call hits the same `/graphql` path - the difference is entirely in the query body. Read the bodies, not the URLs.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a GraphQL query and its mirrored response, and tell a read from a write from the operation keyword.',
          },
          {
            type: 'quiz',
            question: 'In GraphQL, what decides whether an operation reads or changes data?',
            options: [
              'The URL you send it to',
              'The keyword at the start - query, mutation or subscription',
              'The HTTP status code',
              'The size of the response',
            ],
            correctIndex: 1,
            explanation: 'GraphQL uses one endpoint. The operation keyword - query (read), mutation (write), subscription (stream) - declares what the request does.',
          },
        ],
      },
      {
        slug: 'graphql-introspection-and-recon',
        title: 'Introspection and Recon',
        summary: 'GraphQL can be asked to describe its own entire schema. When that feature is left on, the API hands you its blueprint.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "GraphQL has a built-in feature that no REST API offers: you can ask the server to describe itself. It is called introspection, and a single special query returns every type, every field, every argument and every mutation the API supports. When it is left enabled - and it very often is - the server hands you the complete blueprint of its own attack surface.",
          },
          {
            type: 'paragraph',
            text:
              "The magic is a set of meta-fields that start with a double underscore. `__schema` returns the whole thing; `__type` describes one type in detail. You send this and read the reply:",
          },
          {
            type: 'code',
            language: 'graphql',
            filename: 'introspection query',
            code: 'query {\n  __schema {\n    queryType { name }\n    mutationType { name }\n    types {\n      name\n      fields { name }\n    }\n  }\n}',
          },
          {
            type: 'paragraph',
            text:
              "The response is a JSON catalogue of the API. In it you find types you never saw in the app - an `AdminUser` type, a `deleteUser` mutation, an `internalNotes` field on the order type. Introspection does not just list the friendly public operations; it lists everything the schema defines, including the administrative and internal ones the interface would never show you. That is the recon jackpot: instead of guessing endpoints, you are handed the exact names to try.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`__schema` - dumps the entire schema: types, queries, mutations',
              '`__type(name: "User")` - describes one type, field by field',
              'Look for admin/internal types and mutations the UI never exposed',
              'Field names leak intent: `passwordHash`, `isAdmin`, `impersonate`, `internalNotes`',
              'If introspection is disabled, error messages and field suggestions still leak the schema slowly',
            ],
          },
          {
            type: 'command',
            description: 'On an authorised GraphQL target, run the introspection query and see whether the schema comes back:',
            commands: [
              'curl -s https://api.example.com/graphql -H "Content-Type: application/json" -d \'{"query":"query { __schema { types { name } } }"}\'',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Read the response for one thing first: did you get a `data` block full of type names, or an `errors` block saying introspection is disabled? A long list of type names means introspection is on and you now have the map - scan it for anything that sounds administrative or sensitive. If instead you see an error like 'introspection is disabled', the server has been hardened; you fall back to guessing field names and reading the 'did you mean...' suggestions in error messages, which reconstruct the schema more slowly but still work. The presence of the schema in that first response is itself worth noting - an exposed introspection endpoint on a production API is a common, legitimate report.",
          },
          {
            type: 'paragraph',
            text:
              "For the hunter, introspection turns hours of endpoint guessing into one request. You feed the schema into the next lessons - the mutations you found are where writes and privilege changes live, and the admin types are where authorisation checks are most likely to be missing. In a report, an open introspection endpoint on a sensitive production API is a finding on its own, and the schema you pulled is the evidence for every follow-up bug.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The map is not the treasure',
            text:
              "Introspection gives you every operation the server defines, but many will still be locked. The schema tells you what to try; whether each one actually returns data is the real test that comes next.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only where you are cleared',
            text: 'Pulling a full schema is active reconnaissance. Do it only against a GraphQL API you own or have written authorisation to assess.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can run an introspection query, read the schema it returns, and pick out the admin and internal operations worth testing next.',
          },
          {
            type: 'quiz',
            question: 'What does a successful __schema introspection query give an attacker?',
            options: [
              'A password reset',
              'The complete list of the API\'s types, fields and mutations, including hidden ones',
              'A denial of service',
              'Nothing useful',
            ],
            correctIndex: 1,
            explanation: 'Introspection returns the full schema - every type, field and mutation the server defines, including administrative and internal operations the UI never shows.',
          },
        ],
      },
      {
        slug: 'graphql-injection-and-batching',
        title: 'Injection and Batching Attacks',
        summary: 'GraphQL passes your input to the same databases underneath, so injection still bites - and aliases let you send a thousand attempts in one request.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "GraphQL is a layer on top; underneath, the server still talks to SQL or NoSQL databases, still shells out to other services, still builds queries from your input. So the classic injection bugs do not disappear - your input in a GraphQL argument can reach a database query exactly as it would through a REST parameter. On top of that, GraphQL adds a trick of its own that turns a slow guessing attack into a fast one: batching.",
          },
          {
            type: 'paragraph',
            text:
              "First, injection. If a `search(term: \"...\")` argument gets dropped into a SQL query without proper handling, then a term like `x' OR '1'='1` behaves the same way it would anywhere else. GraphQL does not sanitise for the developer; it just carries your string to the resolver, and the resolver's own code decides whether it is safe. You test the arguments exactly as you would test any input field - the query language around them is different, the injection is the same.",
          },
          {
            type: 'paragraph',
            text:
              "Now the batching amplifier, which is the GraphQL-specific bug. Normally a rate limiter counts requests: after five failed logins from one request each, it blocks you. GraphQL lets you put many operations in ONE request using *aliases* - you name each copy so the results do not collide. So you send one HTTP request containing a hundred login attempts:",
          },
          {
            type: 'code',
            language: 'graphql',
            filename: 'aliased brute-force in a single request',
            code: 'mutation {\n  try1: login(user: "admin", pass: "123456") { token }\n  try2: login(user: "admin", pass: "password") { token }\n  try3: login(user: "admin", pass: "admin123") { token }\n}',
          },
          {
            type: 'paragraph',
            text:
              "To the rate limiter this is a single request, so a limit of 'five attempts' is meaningless - you just made three (or three hundred) attempts that count as one. The aliases `try1`, `try2`, `try3` let each `login` call return its own labelled result, so you can read which password produced a `token`. This is how a rate limit that looks solid gets walked straight past.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'GraphQL arguments still reach SQL/NoSQL - test them for injection like any input',
              'Aliases let one request carry many copies of the same operation',
              'Rate limits usually count requests, not operations - so batching defeats them',
              'Batching amplifies brute-force (logins, OTPs, coupon codes) and can also be a DoS lever',
              'Look for `login`, `verifyOtp`, `applyCoupon`, `resetPassword` - anything that should be attempt-limited',
            ],
          },
          {
            type: 'command',
            description: 'On an authorised target, send one request carrying several aliased login attempts and read which one returns a token:',
            commands: [
              'curl -s https://api.example.com/graphql -H "Content-Type: application/json" -d \'{"query":"mutation { a: login(user:\\"admin\\",pass:\\"123456\\"){token} b: login(user:\\"admin\\",pass:\\"password\\"){token} }"}\'',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The response comes back with one block per alias - a `data` object containing `a` and `b`, each holding the result of that login attempt. Read them for the one where `token` is not null: that alias holds the password that worked. The key observation is that the server processed both attempts, yet a request-counting rate limiter saw exactly one request. If you can send fifty aliases and get fifty results, the login has no effective throttle at the GraphQL layer, and that is the finding - not just the guessed password, but the batching that made guessing free.",
          },
          {
            type: 'paragraph',
            text:
              "Impact for the report: an injection through a GraphQL argument is reported like any injection, with the database effect proven. A batching bypass is reported as a rate-limit failure with real impact - 'authentication can be brute-forced without limit because N attempts fit in one request' - and you show the single request that carried many attempts. Both connect the GraphQL wrapper to a concrete, familiar consequence.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The limiter counts the wrong thing',
            text:
              "A per-request rate limit is no limit at all against aliasing. If the throttle counts HTTP requests instead of operations, one request full of aliases sails past it - that mismatch is the bug.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised systems only',
            text: 'Injection probing and batched brute-force are live attacks. Run them only against a GraphQL API you own or are explicitly authorised to test - anywhere else it is a crime, not a test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can test GraphQL arguments for injection and use aliases to defeat a per-request rate limit, turning one request into a brute-force run.',
          },
          { type: 'related_lesson', lessonSlug: 'sql-injection', title: 'The injection underneath: SQL Injection' },
          { type: 'related_lesson', lessonSlug: 'rate-limit-bypass', title: 'More on limits: Rate Limit Bypass' },
          {
            type: 'quiz',
            question: 'Why does GraphQL aliasing defeat a rate limiter set to "5 login attempts"?',
            options: [
              'It encrypts the attempts',
              'Many aliased login operations fit in one HTTP request, and the limiter counts requests, not operations',
              'It disables the limiter',
              'Aliases guess the password automatically',
            ],
            correctIndex: 1,
            explanation: 'A request-counting limiter sees one request no matter how many aliased operations it contains, so batching packs many attempts into a single counted request.',
          },
        ],
      },
      {
        slug: 'graphql-authorization-flaws',
        title: 'GraphQL Authorization Flaws',
        summary: 'The client picks the fields, so the server must check permission on every one. Miss a single field and it leaks through any query that reaches it.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "This is where GraphQL's flexibility becomes its biggest weakness. In REST, an endpoint returns a fixed shape and the developer secures that one shape. In GraphQL the client chooses the fields, so the server has to enforce authorisation on every field and every relationship a query could reach. Miss one, and it leaks through any path that touches it.",
          },
          {
            type: 'paragraph',
            text:
              "Walk the classic failure. The developer secures the top-level `user(id:)` query so you can only fetch your own profile. Good. But a user has `orders`, and an order has a `customer`, and that `customer` is a user. So you write a query that starts somewhere allowed and walks the graph sideways into data that was never checked:",
          },
          {
            type: 'code',
            language: 'graphql',
            filename: 'walking the graph past the check',
            code: 'query {\n  myOrders {\n    id\n    customer {\n      email\n      phone\n      addressLine\n    }\n  }\n}',
          },
          {
            type: 'paragraph',
            text:
              "If `customer` was assumed to only ever be you, but the resolver returns whichever customer the order belongs to without re-checking, a shared or transferred order leaks a stranger's `email`, `phone` and `addressLine`. The check existed at the front door (`user(id:)`) but not on the nested relationship, and GraphQL will happily follow the relationship for you. This is field-level and object-level authorisation failing at depth - the BOLA idea from REST, made worse because one query can reach through several objects.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Authorisation must be enforced per field and per relationship, not just at the top-level query',
              'Nested paths (user -> orders -> customer) often skip the check that the entry point applies',
              'Sensitive fields to probe: `email`, `phone`, `passwordHash`, `role`, `internalNotes`, `ssn`',
              'Mutations found via introspection may lack the authorisation their query twins have',
              'Test by reaching a sensitive field through an indirect path, not just by asking for it directly',
            ],
          },
          {
            type: 'command',
            description: 'On an authorised target, request a sensitive field directly, then reach the same field through a nested relationship and compare:',
            commands: [
              'curl -s https://api.example.com/graphql -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d \'{"query":"query { user(id: 99) { email } }"}\'',
              'curl -s https://api.example.com/graphql -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d \'{"query":"query { myOrders { customer { email } } }"}\'',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The first query asks for user 99's email head-on; a well-secured server returns `null` or an authorisation error, proving the direct door is guarded. The second reaches `email` through `myOrders -> customer`. Compare the two: if the direct request is blocked but the nested one returns an email that is not yours, you have found authorisation enforced at the entry point but missing on the relationship. That difference between the blocked direct path and the working indirect path is the exact evidence of the bug - the server guarded the obvious door and left the side passage open.",
          },
          {
            type: 'paragraph',
            text:
              "Impact for the report: this is broken object/field-level authorisation, and you report it with both queries side by side - 'the direct query is denied, but the same field is readable via this nested path, exposing other users' PII'. Naming the exact field and the path that reaches it tells the defender precisely which resolver forgot its check, which is far more useful than 'GraphQL has an authz bug'.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The side door is the bug',
            text:
              "A field can be locked when you ask for it directly and wide open when you reach it through a relationship. Always try the indirect path - that is where the missing check hides.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own data only',
            text: 'Reaching another person\'s fields - directly or through a nested path - is only a test on an API you own or are cleared in writing to assess. Real strangers\' PII is a line you do not cross.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can find GraphQL authorisation bugs by reaching sensitive fields through nested relationships that skip the check the entry point enforces.',
          },
          { type: 'practice_ref', title: 'GraphQL check', exerciseSlug: 'graphql-quiz' },
          { type: 'related_lesson', lessonSlug: 'idor', title: 'The same class in web pages: IDOR' },
          {
            type: 'quiz',
            question: 'A field is blocked when queried directly but readable through user -> orders -> customer. What is the flaw?',
            options: [
              'The token is invalid',
              'Authorisation is enforced at the entry point but not on the nested relationship',
              'GraphQL is insecure by design',
              'The field does not exist',
            ],
            correctIndex: 1,
            explanation: 'GraphQL lets a client reach a field through relationships. If the resolver for a nested path skips the check the direct query applies, sensitive data leaks through the side door.',
          },
        ],
      },
    ],
  },
  {
    slug: 'identity-deep',
    title: 'Identity, Deeper',
    description:
      "How 'Login with Google', single sign-on and API tokens actually work under the hood - the protocols that decide who you are across the whole modern web. By the end you can trace an OAuth authorisation-code flow with real parameters, say what breaks when redirect_uri or state is mishandled, tell an OpenID login from a plain OAuth authorisation, and choose between server sessions and stateless tokens knowing what each one costs.",
    lessons: [
      {
        slug: 'oauth-deep-dive',
        title: 'OAuth 2.0 Deep Dive',
        summary: 'The valet key of the internet: OAuth lets one app act on your behalf at another without ever handing over your password. Here is the exact dance.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('The OAuth authorisation-code flow, step by step, with real redirect parameters'),
          {
            type: 'paragraph',
            text:
              "OAuth is how one app gets permission to act on your behalf at another, without ever seeing your password. When a photo-printing site asks 'can I see your Google Photos?', it does not want your Google password - it wants a limited, revocable pass. OAuth is the protocol that issues that pass. Think of the valet key that starts the car and opens the door but not the boot: limited access, granted deliberately, taken back whenever you like.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'The four players and the dance',
          },
          {
            type: 'paragraph',
            text:
              "There are four roles. You are the *resource owner*. The printing site is the *client*. Google is both the *authorisation server* (it asks you to approve) and the *resource server* (it holds the photos). The most common and most secure flow is the *authorisation code* flow, and it goes like this, with real-looking values. Step one, the client sends your browser to Google:",
          },
          {
            type: 'code',
            language: 'text',
            filename: 'step 1 - browser redirected to the authorisation server',
            code: 'GET https://accounts.google.com/o/oauth2/v2/auth?\n  response_type=code&\n  client_id=printapp-12345&\n  redirect_uri=https://printapp.example.com/callback&\n  scope=photos.read&\n  state=8fq2z9',
          },
          {
            type: 'paragraph',
            text:
              "Google shows you a consent screen ('PrintApp wants to read your photos - allow?'). You click allow. Step two, Google sends your browser back to the `redirect_uri` the client named, with a short-lived *authorisation code* attached: `https://printapp.example.com/callback?code=4/AbCdEf&state=8fq2z9`. Step three, and this is the crucial part, the client's *server* takes that code and calls Google directly - back-channel, not through your browser - swapping the code plus its own secret for an *access token*. The token is what actually reads the photos. The code was just a one-time voucher to fetch the token safely.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**resource owner** - you; **client** - the app asking; **authorisation server** - issues the code/token; **resource server** - holds the data',
              '**authorisation code flow** - browser gets a short-lived `code`; the client\'s server swaps it for a token in the back channel',
              '**redirect_uri** - where the code is sent; must be pre-registered and exactly matched, or it becomes a theft channel',
              '**state** - a random value the client sends and re-checks on return; the anti-CSRF token of OAuth',
              '**scope** - the exact permissions requested (`photos.read`), the valet key\'s limits',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Two parameters are where OAuth breaks, so understand what each guards. The `redirect_uri` is where the code gets delivered - if the server accepts a `redirect_uri` it did not pre-register, an attacker points it at their own site and the victim's code lands in the attacker's hands. The `state` is a random string the client generates before step one and verifies on the way back; it ties the response to the request the same browser started, and without it an attacker can splice their own code into your session (an OAuth CSRF that ends in account linking to the attacker). A server that does not exact-match `redirect_uri` or does not check `state` is the bug.",
          },
          {
            type: 'command',
            description: 'On an OAuth flow you are authorised to test, tamper only the redirect_uri and watch whether the server accepts an unregistered destination:',
            commands: [
              'curl -s -o /dev/null -w "%{http_code} %{redirect_url}\\n" "https://accounts.example.com/authorize?response_type=code&client_id=printapp-12345&redirect_uri=https://attacker.example.net/steal&scope=photos.read&state=8fq2z9"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Read the status and the redirect target the server hands back. A correctly configured authorisation server rejects the request outright - a `400` with an error like `redirect_uri_mismatch` - because the destination is not in its pre-registered list. If instead it returns a `302` pointing your browser at `attacker.example.net` with a code attached, the server allowed an arbitrary redirect and you have found the code-theft path. The whole test is that one comparison: does the server enforce the registered URI, or will it deliver the code anywhere you name?",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'redirect_uri and state carry the whole flow',
            text:
              "A loose `redirect_uri` sends the authorisation code to an attacker; a missing `state` lets an attacker graft their code onto your session. Almost every OAuth bug traces back to one of these two being sloppy.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test only flows you own',
            text: 'Manipulating OAuth parameters against a live provider is an attack unless the flow belongs to you or you hold written authorisation. Keep it to your own client and test accounts.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can trace the authorisation-code flow end to end and name what breaks when redirect_uri or state is mishandled.',
          },
          { type: 'related_lesson', lessonSlug: 'oauth-misconfigurations', title: 'The bugs in detail: OAuth Misconfigurations' },
          {
            type: 'quiz',
            question: 'In the authorisation code flow, why is the code swapped for a token on the client\'s server rather than in the browser?',
            options: [
              'To make it faster',
              'So the client secret and the real token never travel through the user\'s browser where they could be stolen',
              'Because browsers cannot make requests',
              'To skip the consent screen',
            ],
            correctIndex: 1,
            explanation: 'The back-channel exchange keeps the client secret and the access token off the browser. The browser only ever handles a short-lived, single-use code.',
          },
        ],
      },
      {
        slug: 'openid-connect-and-sso',
        title: 'OpenID Connect and SSO',
        summary: 'OAuth proves what an app may do. OpenID Connect proves who you are. That one extra layer is what powers "Login with Google" and company-wide single sign-on.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "OAuth was built to grant access, not to prove identity - and people bent it to do logins anyway, badly. OpenID Connect (OIDC) is the fix: a thin, standard layer on top of OAuth that adds one honest answer to the question 'who is this person?'. Every 'Login with Google' button and almost every company single sign-on runs on OIDC, so this is the identity layer you meet most often.",
          },
          {
            type: 'paragraph',
            text:
              "The core addition is the *ID token*, and it is a JWT. Where OAuth's access token is a valet key (it says what you may do, and is opaque to the app), the ID token is an identity card the app can actually read: it contains claims like `sub` (a stable unique id for the user), `email`, `name`, and critically `iss` (who issued it), `aud` (who it was issued for) and `exp` (when it dies). The app decodes the ID token and now knows who logged in - no separate 'who are you' call needed.",
          },
          {
            type: 'paragraph',
            text:
              "Single sign-on falls straight out of this. Your company runs one identity provider - say Okta or Google Workspace. You log in there once. Now every app that trusts that provider accepts your ID token and logs you in without asking again, because they all outsource 'who is this?' to the same trusted issuer. One login, many apps. The flip side: that provider is now the master key to everything, which is why the checks on the ID token matter so much.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**OAuth** answers "what may this app do?"; **OIDC** adds "who is this user?"',
              '**ID token** - a readable JWT of identity claims, separate from the access token',
              '**sub** - stable user id; **iss** - issuer; **aud** - intended audience; **exp** - expiry',
              '**SSO** - one identity provider trusted by many apps, so one login unlocks all of them',
              'The dangerous shortcut: trusting an ID token without verifying `iss`, `aud`, signature and `exp`',
            ],
          },
          {
            type: 'command',
            description: 'On a token from a flow you own, decode the ID token\'s middle segment to read its claims (decoding is not verifying):',
            commands: [
              'echo "eyJzdWIiOiIxNyIsImVtYWlsIjoiYXJqdW5AZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwczovL2FjY291bnRzLmV4YW1wbGUuY29tIiwiYXVkIjoicHJpbnRhcHAtMTIzNDUifQ" | base64 -d',
            ],
          },
          {
            type: 'paragraph',
            text:
              "That prints the JSON claims of the token - here `{\"sub\":\"17\",\"email\":\"arjun@example.com\",\"iss\":\"https://accounts.example.com\",\"aud\":\"printapp-12345\"}`. Reading it teaches the key lesson: a JWT's payload is only base64, so anyone can read it and anyone can craft one. What makes an ID token trustworthy is not that it decodes, but that the app checks the signature came from the real issuer (`iss`), that the token was meant for this app (`aud`), and that it has not expired (`exp`). An app that reads `sub` and logs you in without those checks will happily accept a token an attacker minted - claiming to be user 1, the admin.",
          },
          {
            type: 'paragraph',
            text:
              "Why this matters to a hunter: OIDC bugs are identity bugs, the highest-impact kind. If an app accepts an ID token without verifying the issuer or audience, an attacker forges identity and logs in as anyone. In a report you point at the exact missing check - 'the app trusts the `sub` claim without validating the signature and `aud`' - because that names the fix precisely.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Decoding is not verifying',
            text:
              "Anyone can read a JWT and anyone can write one. Trust comes only from checking the signature, the issuer (`iss`), the audience (`aud`) and the expiry (`exp`). An app that skips those is trusting a card anyone can print.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell an OIDC login from a plain OAuth authorisation, read an ID token\'s claims, and name the checks that make it trustworthy.',
          },
          { type: 'related_lesson', lessonSlug: 'jwt-attacks', title: 'Forging and abusing tokens: JWT Attacks' },
          {
            type: 'quiz',
            question: 'What does OpenID Connect add on top of OAuth 2.0?',
            options: [
              'Faster tokens',
              'An ID token that proves who the user is, with verifiable identity claims',
              'A new HTTP method',
              'Password storage',
            ],
            correctIndex: 1,
            explanation: 'OAuth grants access; OIDC adds an ID token (a JWT of identity claims like sub, iss, aud, exp) so the app can trust who logged in.',
          },
        ],
      },
      {
        slug: 'session-vs-token-architectures',
        title: 'Sessions vs Tokens',
        summary: 'Two ways to keep you logged in: the server remembers you, or you carry proof yourself. Each choice has a different failure mode a hacker cares about.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Once you have logged in, something has to keep you logged in across every later request - HTTP forgets you the instant a request ends. There are two fundamentally different ways to do it, and which one an app chose changes how you attack it. Either the server remembers you (sessions), or you carry a signed proof of yourself on every request (tokens). Understanding the trade-off tells you where each one breaks.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Server-side sessions',
          },
          {
            type: 'paragraph',
            text:
              "With sessions, the server keeps a record - 'session `abc123` belongs to user 17' - and hands your browser a cookie holding just that random id. On every request the browser sends the cookie, the server looks up the record, and knows you. It is like a cloakroom token at a wedding: the tag in your hand means nothing by itself; the cloakroom holds the coat. The big advantage is instant revocation - to log you out everywhere, the server deletes its record and your cookie is now worthless. The cost is that the server must store and look up state for every active user.",
          },
          {
            type: 'heading',
            level: 3,
            text: 'Stateless tokens',
          },
          {
            type: 'paragraph',
            text:
              "With tokens, usually JWTs, the server stores nothing. It signs a token that says 'user 17, expires 3pm' and hands it over; you send it on every request and the server just checks the signature is its own. No lookup, which scales beautifully across many servers. But there is a nasty catch: because nothing is stored, there is nothing to delete. You cannot easily revoke a token before it expires - if it leaks, it is valid until `exp`, and 'log out everywhere right now' becomes genuinely hard. Teams paper over this with short expiry plus refresh tokens, which adds its own moving parts.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Session** - server stores the state, cookie holds only a random id; easy to revoke, needs server storage',
              '**Token (JWT)** - server stores nothing, client carries a signed claim; scales well, hard to revoke early',
              'Session attacks: cookie theft, fixation, weak `SameSite`/`HttpOnly` flags, predictable ids',
              'Token attacks: weak or `none` signature, a leaked long-lived token, no revocation after logout',
              'Refresh tokens exist to shorten token lifetime - and become a theft target of their own',
            ],
          },
          {
            type: 'command',
            description: 'On a site you are authorised to test, log in and inspect how it keeps you logged in - a session cookie, or a bearer token:',
            commands: [
              'curl -s -i https://app.example.com/login -d \'user=arjun&pass=REDACTED\' | grep -i "set-cookie"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Read the `Set-Cookie` line the login returns, because it tells you the architecture and its weaknesses at once. A cookie named something like `sessionid` with `HttpOnly; Secure; SameSite=Lax` is a server-side session done properly - `HttpOnly` keeps JavaScript from reading it (blunting XSS theft), `Secure` keeps it off plain HTTP, `SameSite` limits cross-site sending (blunting CSRF). If any of those flags are missing, note it. If instead you see no session cookie and the app stores a JWT in local storage (visible in DevTools, not in the cookie header), you are looking at a token architecture - and now the questions are signature strength and whether logout actually kills the token.",
          },
          {
            type: 'paragraph',
            text:
              "For a hunter, spotting the architecture early aims your whole test. A session app pushes you toward cookie flags, fixation and CSRF. A token app pushes you toward signature attacks and the revocation gap - the classic report there is 'the token is still accepted after logout', which you prove by logging out and replaying the old token. Matching the attack to the architecture is what makes testing efficient instead of random.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Stateless means unrevokable',
            text:
              "A pure JWT setup cannot easily kill a token before it expires - there is no server record to delete. Test it: log out, replay the old token, and see if it still works. Often it does, and that is the finding.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell a session architecture from a token one at login, and you know the different failure mode each one hands you to test.',
          },
          { type: 'practice_ref', title: 'Identity, Deeper check', exerciseSlug: 'identity-deep-quiz' },
          {
            type: 'quiz',
            question: 'Why is a leaked stateless JWT harder to deal with than a leaked session cookie?',
            options: [
              'JWTs are larger',
              'There is no server-side record to delete, so the token stays valid until it expires',
              'Cookies cannot be stolen',
              'JWTs are encrypted and cookies are not',
            ],
            correctIndex: 1,
            explanation: 'A session can be revoked by deleting the server record. A stateless token has no such record, so it remains valid until its exp - revocation before then is the hard part.',
          },
        ],
      },
      {
        slug: 'saml-basics',
        title: 'SAML Basics',
        summary: 'The older, XML-based single sign-on still running in most large companies. Heavier than OIDC, and its signature checks fail in their own special ways.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Before OpenID Connect and JSON tokens, enterprise single sign-on ran on SAML, and it still does across most large organisations - banks, universities, big corporates. It does the same job as OIDC (log in once, access many apps) but with XML instead of JSON, and it is worth knowing because when you test a large company, SAML is very often what is holding the front door.",
          },
          {
            type: 'paragraph',
            text:
              "The players have SAML names but the roles are familiar. The *Identity Provider* (IdP) is who you log in with - the company's central login. The *Service Provider* (SP) is the app you are trying to reach. When you hit the app, it bounces you to the IdP; you authenticate there; the IdP sends your browser back to the app carrying a signed XML document called a *SAML assertion* that says, in effect, 'this is arjun@example.com, I vouch for them'. The app checks the signature, trusts the assertion, and logs you in.",
          },
          {
            type: 'paragraph',
            text:
              "The whole security rests on that XML signature, and XML signatures are notoriously fiddly - which is exactly where SAML bugs cluster. The famous class is *XML Signature Wrapping*: the attacker takes a validly signed assertion and wraps extra, unsigned XML around it so that the code which *checks* the signature reads one element while the code which *uses* the identity reads another. Verify the real one, act on the injected one. If it works, you rewrite `arjun@example.com` to `admin@example.com` in a part the signature check never looked at, and log in as the admin.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**IdP** - the identity provider you authenticate against; **SP** - the app you are reaching',
              '**SAML assertion** - a signed XML document asserting who you are',
              'Security depends entirely on the XML signature being checked correctly',
              '**XML Signature Wrapping** - verifier reads the signed element, app reads an injected unsigned one',
              'Also check: is the assertion signed at all, is it bound to one SP (`Audience`), can it be replayed',
            ],
          },
          {
            type: 'command',
            description: 'On a SAML flow you own, decode the base64 SAMLResponse captured from the login redirect to read the assertion XML:',
            commands: [
              'echo "$SAML_RESPONSE_B64" | base64 -d | head -n 40',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The SAML response travels base64-encoded in the login POST, and decoding it prints the raw XML assertion. Read it for the structure that matters: the `<Signature>` element (what is signed), the `<Subject>` naming the user, and the `<Audience>` naming which SP it is for. Understanding which parts sit inside the signed region and which do not is the whole game - a wrapping attack lives on getting the user identity read from *outside* the signed part. If the assertion is not signed at all, or the `<Audience>` is missing so the same assertion works at any app, those are findings you can see just by reading the decoded XML.",
          },
          {
            type: 'paragraph',
            text:
              "Why it matters: SAML sits in front of high-value enterprise apps, so a signature-handling bug is often a full authentication bypass into everything behind the SSO. It is fiddly, XML-heavy work, which is why it is an optional deep-cut here - but knowing the assertion structure and the wrapping idea means you recognise the opportunity when a big target turns out to speak SAML.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The signed part and the used part must match',
            text:
              "Every SAML signature bug comes down to a gap between what the verifier checked and what the app acted on. If those two can point at different XML, an attacker rewrites their identity in the part nobody verified.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Own flow, written permission',
            text: 'Tampering with SAML assertions is an authentication attack. Only ever do it against a SAML setup you own or are explicitly authorised in writing to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can read a SAML assertion, name its players, and explain how signature wrapping turns a valid login into an identity of your choosing.',
          },
          {
            type: 'quiz',
            question: 'What is the core idea behind an XML Signature Wrapping attack on SAML?',
            options: [
              'Breaking the encryption key',
              'Making the signature-checking code and the identity-using code read different XML elements',
              'Guessing the user\'s password',
              'Flooding the IdP with requests',
            ],
            correctIndex: 1,
            explanation: 'Wrapping exploits the gap between what is verified and what is used: the checker validates the signed element while the app trusts an injected, unsigned one carrying the attacker\'s identity.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'mass-assignment-and-bola',
    slug: 'api-security-quiz',
    title: 'API Security check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'What does REST being "stateless" force the server to do on every request?',
        options: [
          'Forget the user entirely',
          'Re-prove who the caller is and re-check what they are allowed to do',
          'Store a session in memory',
          'Send a new password',
        ],
        correctIndex: 1,
        explanation: 'No server-side memory means identity and permission must be established on every single request - and the permission check is the one that often goes missing.',
      },
      {
        prompt: 'An endpoint returns 200 with real data when you send a completely invalid token. What is the flaw?',
        options: [
          'The token happens to be valid',
          'The server checks a header is present but never validates the token',
          'The endpoint is meant to be public',
          'Nothing - this is normal',
        ],
        correctIndex: 1,
        explanation: 'Accepting a junk token means the server only confirms the header exists rather than validating it - a broken authentication finding.',
      },
      {
        prompt: 'You add "role":"admin" to your own profile update, then GET the profile and it shows role admin. What bug is this?',
        options: ['BOLA', 'Mass assignment', 'CSRF', 'Open redirect'],
        correctIndex: 1,
        explanation: 'The server bound an unlisted field straight onto the record without an authorisation check - mass assignment, confirmed by reading it back.',
      },
      {
        prompt: 'Changing an id from /invoices/1001 to /invoices/1002 returns someone else\'s invoice. What is this called in the API world?',
        options: ['Mass assignment', 'BOLA (Broken Object Level Authorisation)', 'Rate limiting', 'CORS misconfiguration'],
        correctIndex: 1,
        explanation: 'Reading another user\'s object by changing its id, with no ownership check, is BOLA - the API twin of IDOR and the most common API bug.',
      },
      {
        prompt: 'You have no API documentation. Where is the fullest list of endpoints the app can call?',
        options: [
          'Only by brute-force guessing',
          'The JavaScript bundle and the DevTools Network tab of the running app',
          'You cannot proceed without official docs',
          'In the HTTP status codes',
        ],
        correctIndex: 1,
        explanation: 'The app is the documentation: the Network tab records live calls and the JS bundle lists endpoints the app can reach, including ones the UI never triggers.',
      },
    ],
  },
  {
    lessonSlug: 'graphql-authorization-flaws',
    slug: 'graphql-quiz',
    title: 'GraphQL check',
    instructions: 'Four quick ones. Get three right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'How does a GraphQL client tell the server whether it wants to read or change data?',
        options: [
          'By the URL',
          'By the operation keyword: query, mutation or subscription',
          'By the HTTP status code',
          'By the token type',
        ],
        correctIndex: 1,
        explanation: 'GraphQL uses one endpoint; the operation keyword declares intent - query reads, mutation writes, subscription streams.',
      },
      {
        prompt: 'A successful __schema introspection query gives an attacker what?',
        options: [
          'A valid login token',
          'The complete list of types, fields and mutations, including hidden admin ones',
          'A denial of service',
          'The server\'s source code',
        ],
        correctIndex: 1,
        explanation: 'Introspection returns the full schema the server defines - the recon jackpot that turns endpoint guessing into one request.',
      },
      {
        prompt: 'Why does GraphQL aliasing defeat a rate limiter set to five login attempts?',
        options: [
          'It encrypts the attempts',
          'Many aliased operations fit in one request, and the limiter counts requests not operations',
          'It disables the limiter',
          'Aliases guess the password for you',
        ],
        correctIndex: 1,
        explanation: 'A request-counting limiter sees one request however many aliased operations it carries, so batching packs many attempts into a single counted request.',
      },
      {
        prompt: 'A field is blocked when queried directly but readable via user -> orders -> customer. What is wrong?',
        options: [
          'The token is invalid',
          'Authorisation is enforced at the entry point but not on the nested relationship',
          'GraphQL is insecure by design',
          'The field does not exist',
        ],
        correctIndex: 1,
        explanation: 'The resolver for the nested path skips the check the direct query applies, so sensitive data leaks through the side door.',
      },
    ],
  },
  {
    lessonSlug: 'session-vs-token-architectures',
    slug: 'identity-deep-quiz',
    title: 'Identity, Deeper check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In the OAuth authorisation code flow, why swap the code for a token on the client\'s server?',
        options: [
          'To make it faster',
          'So the client secret and real token never pass through the browser',
          'Because browsers cannot make requests',
          'To skip consent',
        ],
        correctIndex: 1,
        explanation: 'The back-channel exchange keeps the secret and access token off the browser, which only ever handles a short-lived, single-use code.',
      },
      {
        prompt: 'A loose redirect_uri in OAuth lets an attacker do what?',
        options: [
          'Slow the server',
          'Have the authorisation code delivered to a site they control',
          'Read the database',
          'Change the scope automatically',
        ],
        correctIndex: 1,
        explanation: 'If the server does not exact-match a pre-registered redirect_uri, the code is sent to the attacker\'s destination - a code-theft path.',
      },
      {
        prompt: 'What does OpenID Connect add on top of OAuth 2.0?',
        options: [
          'Faster tokens',
          'An ID token that proves who the user is, with verifiable identity claims',
          'A new HTTP method',
          'Password storage',
        ],
        correctIndex: 1,
        explanation: 'OAuth grants access; OIDC adds an ID token (a JWT with claims like sub, iss, aud, exp) so the app can trust who logged in.',
      },
      {
        prompt: 'Why is a leaked stateless JWT harder to handle than a leaked session cookie?',
        options: [
          'It is larger',
          'There is no server record to delete, so it stays valid until it expires',
          'Cookies cannot be stolen',
          'JWTs are always encrypted',
        ],
        correctIndex: 1,
        explanation: 'A session is revoked by deleting the server record; a stateless token has none, so it remains valid until its exp.',
      },
      {
        prompt: 'Which cookie flag most directly blunts JavaScript-based (XSS) theft of a session cookie?',
        options: ['Secure', 'HttpOnly', 'SameSite', 'Path'],
        correctIndex: 1,
        explanation: 'HttpOnly stops JavaScript from reading the cookie, so an XSS payload cannot exfiltrate the session id. Secure and SameSite guard different risks.',
      },
    ],
  },
];
