import secrets
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

PORT = 8080
SESSION_COOKIE = "sid"

sessions = {}

INVOICES = {
    "1001": {
        "owner": "guest",
        "client": "Halcyon Media Group",
        "issued": "2026-07-02",
        "due": "2026-08-01",
        "amount": "$1,240.00",
        "status": "Paid",
        "items": [
            ("Managed SOC monitoring - July", "$1,000.00"),
            ("Threat intel feed subscription", "$240.00"),
        ],
        "notes": "Payment received via bank transfer. Thank you.",
    },
    "1002": {
        "owner": "guest",
        "client": "Bluefin Logistics",
        "issued": "2026-07-28",
        "due": "2026-08-27",
        "amount": "$3,875.00",
        "status": "Pending",
        "items": [
            ("Penetration test - web application", "$3,200.00"),
            ("Remediation consultation (2h)", "$675.00"),
        ],
        "notes": "Reminder email scheduled for 2026-08-20.",
    },
    "1003": {
        "owner": "admin",
        "client": "Orion Holdings Ltd.",
        "issued": "2026-08-10",
        "due": "2026-09-09",
        "amount": "$48,900.00",
        "status": "Internal - confidential",
        "items": [
            ("Red team engagement - full scope", "$42,000.00"),
            ("Physical intrusion assessment", "$5,400.00"),
            ("Travel & expenses", "$1,500.00"),
        ],
        "notes": (
            "Confidential settlement for the Orion incident. Reference token: "
            "SURAKSHA{id0r_blund3r_c4ught}"
        ),
    },
}

PAGE_BASE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title} - Acme Corp Invoice Portal</title>
  <style>
    body {{ font-family: Arial, Helvetica, sans-serif; max-width: 780px; margin: 32px auto; color: #222; }}
    header {{ background: #0b3d62; color: #fff; padding: 14px 20px; border-radius: 6px; }}
    header h1 {{ margin: 0; font-size: 1.4em; }}
    nav a {{ color: #ffd166; margin-right: 14px; text-decoration: none; }}
    table {{ border-collapse: collapse; width: 100%; margin-top: 16px; }}
    th, td {{ border: 1px solid #ccc; padding: 8px 10px; text-align: left; }}
    th {{ background: #eef4f8; }}
    .invoice-meta td:first-child {{ font-weight: bold; width: 160px; background: #f7f7f7; }}
    .flash {{ background: #fff3cd; border: 1px solid #ffec99; padding: 10px; border-radius: 4px; }}
    footer {{ margin-top: 30px; font-size: 0.85em; color: #888; }}
  </style>
</head>
<body>
<header>
  <h1>Acme Corp Invoice Portal</h1>
  <nav><a href="/">Dashboard</a><a href="/logout">Sign out</a></nav>
</header>
<main>
{body}
</main>
<footer>Acme Corp finance systems - authorized personnel only.</footer>
</body>
</html>
"""

LOGIN_PAGE = """
<h2>Portal sign in</h2>
<p class="flash">Demo environment: any username and password will sign you in to
the shared <strong>guest</strong> account.</p>
<form method="POST" action="/login">
  <table>
    <tr><th><label for="username">Username</label></th>
        <td><input id="username" type="text" name="username" size="28"></td></tr>
    <tr><th><label for="password">Password</label></th>
        <td><input id="password" type="password" name="password" size="28"></td></tr>
  </table>
  <p><button type="submit">Sign in</button></p>
</form>
"""


def render_invoice(inv: dict) -> str:
    rows = "".join(
        f"<tr><td>{desc}</td><td>{amt}</td></tr>" for desc, amt in inv["items"]
    )
    return f"""
<h2>Invoice details</h2>
<table class="invoice-meta">
  <tr><td>Client</td><td>{inv['client']}</td></tr>
  <tr><td>Issued</td><td>{inv['issued']}</td></tr>
  <tr><td>Due</td><td>{inv['due']}</td></tr>
  <tr><td>Status</td><td>{inv['status']}</td></tr>
</table>
<h3>Line items</h3>
<table>
  <tr><th>Description</th><th>Amount</th></tr>
  {rows}
  <tr><th>Total</th><th>{inv['amount']}</th></tr>
</table>
<h3>Internal notes</h3>
<p>{inv['notes']}</p>
"""


class InvoiceHandler(BaseHTTPRequestHandler):
    def _respond(self, code: int, ctype: str, body: bytes, extra_headers=None) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for name, value in extra_headers:
                self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def _page(self, code: int, title: str, body: str, extra_headers=None) -> None:
        html = PAGE_BASE.format(title=title, body=body).encode()
        self._respond(code, "text/html; charset=utf-8", html, extra_headers)

    def _current_user(self) -> str | None:
        raw = self.headers.get("Cookie", "")
        try:
            cookie = SimpleCookie(raw)
        except Exception:
            return None
        morsel = cookie.get(SESSION_COOKIE)
        if morsel is None:
            return None
        return sessions.get(morsel.value)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        if path == "/logout":
            self._page(200, "Signed out", "<h2>You have been signed out.</h2>")
            return

        user = self._current_user()

        if path == "/":
            if user is None:
                self._page(200, "Sign in", LOGIN_PAGE)
                return
            rows = "".join(
                f'<tr><td><a href="/invoice?id={inv_id}">Invoice #{inv_id}</a></td>'
                f'<td>{INVOICES[inv_id]["client"]}</td>'
                f'<td>{INVOICES[inv_id]["amount"]}</td>'
                f'<td>{INVOICES[inv_id]["status"]}</td></tr>'
                for inv_id in ("1001", "1002")
            )
            dashboard = f"""
<h2>My Invoices</h2>
<p>Signed in as <strong>{user}</strong>. Invoices assigned to your account:</p>
<table>
  <tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Status</th></tr>
  {rows}
</table>
"""
            self._page(200, "Dashboard", dashboard)
            return

        if path == "/invoice":
            if user is None:
                self.send_response(303)
                self.send_header("Location", "/")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

            params = parse_qs(parsed.query)
            invoice_id = params.get("id", [""])[0].strip()

            # VULNERABILITY (teaching artifact): missing ownership check - never deploy this pattern
            invoice = INVOICES.get(invoice_id)
            if invoice is None:
                self._page(
                    404,
                    "Not found",
                    f"<h2>Invoice not found</h2><p>No invoice matches id "
                    f"<code>{invoice_id or '(empty)'}</code>.</p>",
                )
                return

            self._page(200, f"Invoice #{invoice_id}", render_invoice(invoice))
            return

        self._respond(404, "text/plain; charset=utf-8", b"404 Not Found\n")

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        if path == "/login":
            length = int(self.headers.get("Content-Length", 0) or 0)
            form = parse_qs(self.rfile.read(length).decode("utf-8", "replace"))
            username = form.get("username", [""])[0].strip()
            password = form.get("password", [""])[0].strip()
            if not username or not password:
                self._page(
                    400,
                    "Sign in",
                    LOGIN_PAGE + '<p class="flash">Enter both fields to continue.</p>',
                )
                return

            sid = secrets.token_hex(16)
            sessions[sid] = "guest"
            self.send_response(303)
            self.send_header("Location", "/")
            self.send_header(
                "Set-Cookie", f"{SESSION_COOKIE}={sid}; Path=/; HttpOnly"
            )
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        self._respond(404, "text/plain; charset=utf-8", b"404 Not Found\n")


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), InvoiceHandler)
    print(f"[acme-invoices] portal listening on port {PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
