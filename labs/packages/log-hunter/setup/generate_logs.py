import os
import random

random.seed(20260812)

OUT_DIR = "/var/log/suraksha"

FLAG_LINE = (
    "Aug 12 03:41:22 srv01 sshd[2231]: Accepted password for backup "
    "from 10.0.0.7 port 2244: SURAKSHA{gr3p_1s_y0ur_fr13nd}"
)

USERS = ["alice", "bob", "carol", "deploy", "svc-jenkins"]
IPS = ["10.0.0.4", "10.0.0.5", "10.0.0.9", "192.168.12.30", "172.16.4.21"]
PATHS = [
    "/index.html",
    "/login",
    "/api/v1/status",
    "/assets/app.js",
    "/reports/summary.pdf",
    "/health",
    "/static/logo.png",
]
USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
    "curl/8.5.0",
    "python-requests/2.31.0",
]

MONTHS = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
}


def syslog_ts(day: int) -> str:
    return f"Aug {day:02d} {random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"


def clf_ts(day: int) -> str:
    return f"{day:02d}/Aug/2026:{random.randint(7,22):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d} +0000"


def gen_access(n: int) -> list:
    lines = []
    for _ in range(n):
        day = random.randint(1, 20)
        ip = random.choice(IPS)
        user = "-" if random.random() < 0.9 else random.choice(USERS)
        method = random.choice(["GET", "GET", "GET", "POST"])
        path = random.choice(PATHS)
        status = random.choices([200, 301, 404, 500], weights=[80, 6, 10, 4])[0]
        size = random.randint(180, 48000)
        ref = '"-"' if random.random() < 0.7 else '"https://intranet.local/menu"'
        ua = f'"{random.choice(USER_AGENTS)}"'
        lines.append(
            f'{ip} - {user} [{clf_ts(day)}] "{method} {path} HTTP/1.1" '
            f"{status} {size} {ref} {ua}"
        )
    return lines


def gen_auth(n: int) -> list:
    lines = []
    pids = random.sample(range(1000, 99999), k=64)
    for i in range(n):
        day = random.randint(1, 20)
        pid = pids[i % len(pids)]
        roll = random.random()
        if roll < 0.45:
            bad_user = random.choice(
                ["oracle", "test", "admin1", "ubuntu", "pi", "git", "postgres"]
            )
            src = f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
            port = random.randint(1024, 65535)
            lines.append(
                f"Aug {day:02d} {syslog_ts(day)[7:]} srv01 sshd[{pid}]: "
                f"Failed password for invalid user {bad_user} from {src} port {port} ssh2"
            )
        elif roll < 0.75:
            good_user = random.choice(USERS)
            src = random.choice(IPS[:3])
            port = random.randint(1024, 65535)
            lines.append(
                f"Aug {day:02d} {syslog_ts(day)[7:]} srv01 sshd[{pid}]: "
                f"Accepted password for {good_user} from {src} port {port} ssh2"
            )
        elif roll < 0.85:
            lines.append(
                f"Aug {day:02d} {syslog_ts(day)[7:]} srv01 sshd[{pid}]: "
                f"pam_unix(sshd:session): session opened for user "
                f"{random.choice(USERS)} by (uid=0)"
            )
        elif roll < 0.95:
            lines.append(
                f"Aug {day:02d} {syslog_ts(day)[7:]} srv01 sudo:   "
                f"{random.choice(['alice', 'deploy'])} : TTY=pts/0 ; "
                f"PWD=/home ; USER=root ; COMMAND=/usr/bin/apt update"
            )
        else:
            lines.append(
                f"Aug {day:02d} {syslog_ts(day)[7:]} srv01 systemd-logind[812]: "
                f"New session {random.randint(2,900)} of user {random.randint(1000,1002)}."
            )
    return lines


def gen_error(n: int) -> list:
    templates = [
        "2026-08-{d:02d} {t} [error] 9412#9412: *{c} open() \"/srv/www{p}\" failed (2: No such file or directory), client: {ip}, request: \"GET {p} HTTP/1.1\"",
        "2026-08-{d:02d} {t} [warn] 9412#9412: *{c} upstream server temporarily disabled while reading response header from upstream, client: {ip}",
        "2026-08-{d:02d} {t} ERROR app.middleware Unhandled exception on request {rid}: ConnectionResetError",
        "2026-08-{d:02d} {t} WARNING retrytool attempt {k}/5 failed for job job-{j}: timeout after 30s",
        "2026-08-{d:02d} {t} CRITICAL supervisor worker worker-{k} exited unexpectedly (code 1); restarting",
    ]
    lines = []
    for _ in range(n):
        t = f"{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        tpl = random.choice(templates)
        lines.append(
            tpl.format(
                d=random.randint(1, 20),
                t=t,
                c=random.randint(100, 99999),
                p=random.choice(PATHS),
                ip=random.choice(IPS),
                rid=f"req-{random.randint(10000,99999)}",
                k=random.randint(1, 8),
                j=random.randint(100, 999),
            )
        )
    return lines


def gen_app(day: int, n: int) -> list:
    levels = ["INFO", "INFO", "INFO", "WARN", "DEBUG"]
    messages = [
        "User login ok user={u}",
        "Session created sid={sid}",
        "Report generation finished report=r-{r} duration_ms={ms}",
        "Cache miss key=user_profile:{u} fallback=db",
        "Email queued template=invoice_reminder to={u}@acme.corp",
        "Slow query detected query=SELECT * FROM events took={ms}ms",
        "Background job completed job=digest-{r}",
        "Rate limit threshold reached for api_key=ak-{r}",
    ]
    lines = []
    for _ in range(n):
        t = f"{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        lvl = random.choice(levels)
        msg = random.choice(messages).format(
            u=random.choice(USERS),
            sid=os.urandom(4).hex(),
            r=random.randint(100, 999),
            ms=random.randint(120, 9500),
        )
        lines.append(f"2026-08-{day:02d} {t} {lvl} [req-{random.randint(1000,9999)}] {msg}")
    return lines


def gen_cron(n: int) -> list:
    cmds = [
        "run-parts /etc/cron.hourly",
        "test -x /usr/sbin/anacron || run-parts /etc/cron.daily",
        "/usr/local/bin/rotate-logs.sh",
        "/usr/bin/find /tmp -type f -mtime +7 -delete",
        "/usr/local/bin/backup-db.sh /backups",
    ]
    lines = []
    for _ in range(n):
        minute = random.choice([0, 15, 30, 45])
        hour = random.randint(0, 23)
        day = random.randint(1, 20)
        lines.append(
            f"Aug {day:02d} {hour:02d}:{minute:02d}:01 srv01 CRON[{random.randint(1000,9999)}]: "
            f"(root) CMD ({random.choice(cmds)})"
        )
    return lines


def gen_system(n: int) -> list:
    templates = [
        "Aug {d:02d} {t} srv01 kernel: [ {u}.000000] audit: type=1400 apparmor=\"DENIED\" operation=\"open\" profile=\"/usr/sbin/sshd\" name=\"/proc/{pid}/cmdline\"",
        "Aug {d:02d} {t} srv01 systemd[1]: Started Daily apt download activities.",
        "Aug {d:02d} {t} srv01 systemd[1]: {svc}.service: Deactivated successfully.",
        "Aug {d:02d} {t} srv01 ntpd[733]: adjusting local clock by {f}s",
        "Aug {d:02d} {t} srv01 kernel: [ {u}.000000] eth0: Link is Up at 1000Mbps full duplex",
    ]
    services = ["nginx", "postgres", "redis-server", "cron", "docker"]
    lines = []
    for _ in range(n):
        t = f"{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        lines.append(
            random.choice(templates).format(
                d=random.randint(1, 20),
                t=t,
                u=random.uniform(1000, 900000),
                pid=random.randint(300, 30000),
                svc=random.choice(services),
                f=round(random.uniform(-0.05, 0.05), 6),
            )
        )
    return lines


def write_file(name: str, lines: list) -> None:
    path = os.path.join(OUT_DIR, name)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    counts = {}
    files = {}

    files["access.log"] = gen_access(random.randint(240, 380))
    files["auth.log"] = gen_auth(random.randint(240, 380))
    files["error.log"] = gen_error(random.randint(200, 320))
    for day in range(1, 6):
        name = f"app-2026-08-{day:02d}.log"
        files[name] = gen_app(day, random.randint(220, 360))
    files["cron.log"] = gen_cron(random.randint(200, 340))
    files["system.log"] = gen_system(random.randint(210, 350))

    auth_lines = files["auth.log"]
    insert_at = random.randrange(len(auth_lines) // 4, len(auth_lines))
    auth_lines.insert(insert_at, FLAG_LINE)

    for name, lines in files.items():
        write_file(name, lines)
        counts[name] = len(lines)

    total = sum(counts.values())
    print(f"[log-hunter] wrote {len(files)} log files ({total} lines) to {OUT_DIR}", flush=True)


if __name__ == "__main__":
    main()
