import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MAIN_PORT = 8080
HIDDEN_PORT = 9090
FLAG = "SURAKSHA{p0rt_sc4nn1ng_101}"

PAGE_BASE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title} - Nexatech Intranet</title>
  <style>
    body {{ font-family: Georgia, serif; max-width: 720px; margin: 40px auto; color: #222; }}
    header {{ border-bottom: 3px solid #16425b; padding-bottom: 8px; }}
    h1 {{ color: #16425b; margin-bottom: 0; }}
    nav a {{ margin-right: 14px; color: #2f6690; }}
    footer {{ margin-top: 32px; font-size: 0.85em; color: #777; }}
  </style>
</head>
<body>
<header>
  <h1>Nexatech Industries</h1>
  <p>Employee Intranet &mdash; internal use only</p>
  <nav><a href="/">Home</a><a href="/announcements">Announcements</a><a href="/handbook">IT Handbook</a><a href="/it-faq">IT FAQ</a></nav>
</header>
<main>
{body}
</main>
<footer>Nexatech Industries intranet node NX-INTRA-03. Unauthorized use is monitored.</footer>
</body>
</html>
"""

PAGES = {
    "/": PAGE_BASE.format(
        title="Home",
        body="""
<h2>Welcome back, employee</h2>
<p>You are connected to the Nexatech employee intranet. Use the navigation
above to browse announcements and IT documentation.</p>
<p>If you are looking for administrative tooling, please contact the IT
department. Access to internal management services is restricted to this
host.</p>
""",
    ),
    "/announcements": PAGE_BASE.format(
        title="Announcements",
        body="""
<h2>Company announcements</h2>
<ul>
  <li><strong>Q3 security training</strong> is due by Friday. Completion is mandatory.</li>
  <li>The building will be closed Saturday for badge-system maintenance.</li>
  <li><em>IT reminder:</em> our internal admin service runs on this very host.
  For safety reasons we deliberately do not publish which network port it uses,
  so it stays invisible to casual browsing.</li>
</ul>
""",
    ),
    "/handbook": PAGE_BASE.format(
        title="IT Handbook",
        body="""
<h2>IT handbook (excerpt)</h2>
<p>All production systems are reachable exclusively from the internal network.
Services that must stay private are bound to the local host only and are not
advertised in any service catalog.</p>
<p>Employees must never attempt to discover or enumerate unpublished internal
services. Violations are reported to the security team.</p>
""",
    ),
    "/it-faq": PAGE_BASE.format(
        title="IT FAQ",
        body="""
<h2>Frequently asked questions</h2>
<dl>
  <dt>How do I reach the admin panel?</dt>
  <dd>The admin panel lives on this host, but its port is intentionally
  undocumented. Ask IT for a supervised session instead of hunting for it.</dd>
  <dt>Is port scanning allowed?</dt>
  <dd>No. Scanning internal hosts is prohibited... on the corporate network.
  On your own machine, it is a core skill.</dd>
</dl>
""",
    ),
}


class MainHandler(BaseHTTPRequestHandler):
    def _respond(self, code: int, ctype: str, body: bytes) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path != "/":
            path = path.rstrip("/")
        page = PAGES.get(path)
        if page is None:
            self._respond(
                404,
                "text/html; charset=utf-8",
                PAGE_BASE.format(title="404", body="<h2>404 - Page not found</h2>").encode(),
            )
            return
        self._respond(200, "text/html; charset=utf-8", page.encode())


class HiddenAdminHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path == "/flag":
            body = (FLAG + "\n").encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            body = b"404 Not Found\n"
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)


def main() -> None:
    hidden = ThreadingHTTPServer(("0.0.0.0", HIDDEN_PORT), HiddenAdminHandler)
    threading.Thread(target=hidden.serve_forever, daemon=True).start()

    main_server = ThreadingHTTPServer(("0.0.0.0", MAIN_PORT), MainHandler)
    print(f"[nexatech] intranet listening on port {MAIN_PORT}", flush=True)
    try:
        main_server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
