from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8080
HEADER_PIECE = "SURAKSHA{"
COOKIE_PIECE = "t3ll_st0r13s"

PAGE_BASE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title} - The Daily Packet</title>
  <style>
    body {{ font-family: 'Times New Roman', serif; max-width: 760px; margin: 32px auto; color: #1a1a1a; }}
    header {{ border-bottom: 4px double #333; padding-bottom: 6px; }}
    h1 {{ font-size: 2.2em; margin: 0; letter-spacing: 1px; }}
    .tagline {{ font-style: italic; color: #555; }}
    nav a {{ margin-right: 14px; color: #8b0000; text-decoration: none; }}
    article h2 {{ margin-bottom: 4px; }}
    .meta {{ color: #777; font-size: 0.85em; margin-bottom: 12px; }}
    footer {{ margin-top: 36px; border-top: 1px solid #ccc; padding-top: 8px; font-size: 0.8em; color: #888; }}
  </style>
</head>
<body>
<header>
  <h1>The Daily Packet</h1>
  <p class="tagline">All the frames that fit on the wire, since 1974</p>
  <nav><a href="/">Home</a><a href="/article/packet-loss">Featured</a><a href="/login">Sign in</a></nav>
</header>
<main>
{body}
</main>
<footer>&copy; 2026 The Daily Packet. Delivered over TCP because we care.</footer>
</body>
</html>
"""

ARTICLES = {
    "/article/packet-loss": (
        "When Packets Go Missing",
        "2026-08-14 by R. Ackermann",
        """
<p>Every network engineer remembers their first dropped packet. In this feature
we trace a single datagram from a coffee-shop laptop to a data center and back,
and examine the five most common places a packet quietly disappears.</p>
<p> Spoiler: it is almost always bufferbloat.</p>
""",
    ),
    "/article/tls-handshake": (
        "Anatomy of a TLS Handshake",
        "2026-08-11 by C. Cipher",
        """
<p>ClientHello, ServerHello, key share, finished. Four flights of messages
stand between you and an encrypted channel. We break down each step with
annotated captures you can reproduce at home.</p>
""",
    ),
    "/article/dns-stories": (
        "DNS: The Internet's Phone Book Leaks",
        "2026-08-05 by A. Resolver",
        """
<p>Plain-text DNS queries tell your resolver every site you visit. We look at
encrypted DNS options and what they do - and do not - hide.</p>
""",
    ),
}


class BlogHandler(BaseHTTPRequestHandler):
    def _respond(self, code: int, ctype: str, body: bytes, extra_headers=None) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for name, value in extra_headers:
                self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def _page(self, title: str, body: str, extra_headers=None) -> None:
        html = PAGE_BASE.format(title=title, body=body).encode()
        self._respond(200, "text/html; charset=utf-8", html, extra_headers)

    def _home_body(self) -> str:
        links = "".join(
            f'<article><h2><a href="{path}">{title}</a></h2>'
            f'<p class="meta">{meta}</p></article>'
            for path, (title, meta, _) in ARTICLES.items()
        )
        return f"<h2>Top stories</h2>{links}"

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path != "/":
            path = path.rstrip("/")

        if path == "/":
            headers = [("X-Debug-Token", HEADER_PIECE), ("X-Powered-By", "DailyPacket/1.0")]
            self._page("Home", self._home_body(), headers)
            return

        if path in ARTICLES:
            title, meta, body = ARTICLES[path]
            self._page(title, f"<h2>{title}</h2><p class='meta'>{meta}</p>{body}")
            return

        if path == "/robots.txt":
            robots = (
                "User-agent: *\n"
                "Disallow: /drafts/\n"
                "Disallow: /internal/\n"
                "\n"
                "# h34d3rs_\n"
                "Sitemap: https://thedailypacket.example/sitemap.xml\n"
            ).encode()
            self._respond(200, "text/plain; charset=utf-8", robots)
            return

        if path == "/login":
            body = PAGE_BASE.format(
                title="Sign in",
                body="""
<h2>Subscriber sign in</h2>
<form method="POST" action="/login">
  <p><label>Email<br><input type="email" name="email" size="30"></label></p>
  <p><label>Password<br><input type="password" name="password" size="30"></label></p>
  <p><button type="submit">Sign in</button></p>
</form>
<p class="meta">Demo portal - any credentials are accepted.</p>
""",
            )
            self._respond(
                200,
                "text/html; charset=utf-8",
                body.encode(),
                [("Set-Cookie", f"last_visit={COOKIE_PIECE}; Path=/")],
            )
            return

        if path == "/debug":
            lines = [
                "HTTP/1.1 200 OK",
                f"Content-Type: text/plain; charset=utf-8",
                "Cache-Control: no-store",
                "X-Powered-By: DailyPacket/1.0",
                f"X-Debug-Token: {HEADER_PIECE}",
                f"Set-Cookie: last_visit={COOKIE_PIECE}; Path=/",
                "",
                "The above are the response headers for this request.",
                "Some of them should not ship to production.",
            ]
            self._respond(200, "text/plain; charset=utf-8", ("\n".join(lines) + "\n").encode())
            return

        self._respond(
            404,
            "text/html; charset=utf-8",
            PAGE_BASE.format(title="404", body="<h2>404 - Story not found</h2>").encode(),
        )

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0].rstrip("/")
        if path == "/login":
            length = int(self.headers.get("Content-Length", 0) or 0)
            self.rfile.read(length)
            self.send_response(303)
            self.send_header("Location", "/")
            self.send_header("Set-Cookie", f"last_visit={COOKIE_PIECE}; Path=/")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self._respond(404, "text/plain; charset=utf-8", b"404 Not Found\n")


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), BlogHandler)
    print(f"[daily-packet] blog listening on port {PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
