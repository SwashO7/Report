import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8080
LOG_DIR = "/var/log/suraksha"

PAGE_BASE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Suraksha Log Archive - srv01</title>
  <style>
    body {{ font-family: monospace; max-width: 820px; margin: 36px auto; color: #222; background: #fafafa; }}
    h1 {{ font-size: 1.3em; border-bottom: 2px solid #444; padding-bottom: 6px; }}
    table {{ border-collapse: collapse; margin-top: 14px; }}
    td, th {{ border: 1px solid #bbb; padding: 4px 12px; text-align: left; font-size: 0.9em; }}
    code {{ background: #eee; padding: 2px 5px; }}
    .hint {{ background: #fffbe6; border: 1px solid #e6d97a; padding: 10px; }}
  </style>
</head>
<body>
<h1>srv01 :: centralized log archive</h1>
<p>This web service only exposes <strong>metadata</strong> about the archive.
The raw log files are stored <em>inside this container</em> at:</p>
<p><code>{logdir}</code></p>
<table>
  <tr><th>File</th><th>Size (bytes)</th></tr>
  {rows}
</table>
<p class="hint">To read the logs, open a shell inside the container from your
host machine:<br><br>
<code>docker compose exec target sh</code><br><br>
Then explore with standard Unix tools such as <code>ls</code>, <code>cat</code>,
and <code>grep</code>.</p>
</body>
</html>
"""


def list_log_files():
    rows = []
    try:
        names = sorted(os.listdir(LOG_DIR))
    except OSError:
        names = []
    for name in names:
        try:
            size = os.path.getsize(os.path.join(LOG_DIR, name))
        except OSError:
            size = 0
        rows.append(f"<tr><td>{name}</td><td>{size}</td></tr>")
    return "\n".join(rows)


class LogArchiveHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path != "/":
            body = b"404 Not Found\n"
            code = 404
            ctype = "text/plain; charset=utf-8"
        else:
            html = PAGE_BASE.format(logdir=LOG_DIR, rows=list_log_files()).encode()
            body = html
            code = 200
            ctype = "text/html; charset=utf-8"
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), LogArchiveHandler)
    print(f"[log-hunter] archive metadata service listening on port {PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
