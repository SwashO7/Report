# INTENTIONALLY VULNERABLE - teaching artifact for Suraksha Labs. Never deploy.
#
# "Static Vault" serves downloadable files from a folder mapped onto the
# /files/ URL prefix - an "Alias"-style mapping, same as a real web server
# config (e.g. Apache's `Alias /files/ /srv/public/`). The handler below
# builds the filesystem path by decoding the URL and concatenating it onto
# the base directory WITHOUT normalizing ".." segments first - the same
# class of path-normalization flaw as CVE-2021-41773 / CVE-2021-42013.
# That lets a request walk out of the intended folder and read files the
# alias was never supposed to expose.

import os
import posixpath
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8080
BASE_DIR = "/srv/public"
PRIVATE_DIR = "/srv/private"
FLAG = "SURAKSHA{alias_escape_2e2e_2f}"

PAGE_BASE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title} - Static Vault</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 720px; margin: 32px auto; color: #202020; }}
    header {{ border-bottom: 3px solid #333; padding-bottom: 8px; margin-bottom: 20px; }}
    h1 {{ margin: 0; }}
    .tagline {{ color: #666; font-style: italic; }}
    table {{ width: 100%; border-collapse: collapse; }}
    td, th {{ text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; }}
    code {{ background: #f2f2f2; padding: 2px 5px; border-radius: 3px; }}
    footer {{ margin-top: 32px; color: #888; font-size: 0.85em; }}
  </style>
</head>
<body>
<header>
  <h1>Static Vault</h1>
  <p class="tagline">Acme file drop - internal downloads</p>
</header>
<main>
{body}
</main>
<footer>Served from an aliased downloads folder.</footer>
</body>
</html>
"""

# Files that live inside the served (public) folder.
PUBLIC_FILES = {
    "readme.txt": (
        "Static Vault - public downloads\n"
        "----------------------------------\n"
        "This folder is served under /files/ for internal file sharing.\n"
        "Only files placed in this folder should ever be reachable here.\n"
    ),
    "handbook.pdf.txt": (
        "Employee Handbook (plaintext stand-in for a PDF)\n"
        "Section 1: Welcome to Acme.\n"
        "Section 2: Please do not share files outside this folder.\n"
    ),
    "changelog.txt": (
        "v1.2 - added handbook\n"
        "v1.1 - added readme\n"
        "v1.0 - initial public drop\n"
    ),
}

# File that lives OUTSIDE the served folder - the alias should never reach this.
PRIVATE_FILES = {
    "flag.txt": (
        "internal-only: reference token for the security drill\n"
        f"{FLAG}\n"
    ),
}


def provision() -> None:
    os.makedirs(BASE_DIR, exist_ok=True)
    os.makedirs(PRIVATE_DIR, exist_ok=True)
    for name, content in PUBLIC_FILES.items():
        path = os.path.join(BASE_DIR, name)
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(content)
    for name, content in PRIVATE_FILES.items():
        path = os.path.join(PRIVATE_DIR, name)
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(content)


class VaultHandler(BaseHTTPRequestHandler):
    def _respond(self, code: int, ctype: str, body: bytes) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _page(self, title: str, body: str, code: int = 200) -> None:
        html = PAGE_BASE.format(title=title, body=body).encode()
        self._respond(code, "text/html; charset=utf-8", html)

    def _home_body(self) -> str:
        rows = "".join(
            f'<tr><td><a href="/files/{name}">{name}</a></td></tr>'
            for name in PUBLIC_FILES
        )
        return f"""
<h2>Available downloads</h2>
<table><tr><th>File</th></tr>{rows}</table>
<p>Files are served from a single downloads folder, mapped onto
<code>/files/</code>.</p>
"""

    def do_GET(self) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        raw_path = parsed.path

        if raw_path == "/":
            self._page("Downloads", self._home_body())
            return

        if raw_path.startswith("/files/"):
            self._serve_aliased_file(raw_path[len("/files/"):])
            return

        self._page("404", "<h2>404 - Not found</h2>", code=404)

    def _serve_aliased_file(self, requested: str) -> None:
        # --- VULNERABLE ALIAS RESOLUTION ---
        # The requested suffix is percent-decoded and joined directly onto
        # the base directory. ".." segments (plain OR percent-encoded, e.g.
        # "%2e%2e") are never stripped or rejected before the join, so a
        # crafted path can walk out of BASE_DIR entirely - mirroring the
        # real-world Apache path-normalization bug this lab is based on.
        decoded = urllib.parse.unquote(requested)
        target_path = posixpath.normpath(posixpath.join(BASE_DIR, decoded))
        # NOTE: normpath collapses "..", it does NOT confine the result to
        # BASE_DIR - there is deliberately no os.path.commonpath /
        # startswith containment check here. That missing check is the bug.

        if not os.path.isfile(target_path):
            self._page("404", "<h2>404 - File not found</h2>", code=404)
            return

        with open(target_path, "rb") as f:
            data = f.read()
        self._respond(200, "text/plain; charset=utf-8", data)

    def log_message(self, format: str, *args) -> None:  # quieter container logs
        pass


def main() -> None:
    provision()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), VaultHandler)
    print(f"[static-vault] serving on port {PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
