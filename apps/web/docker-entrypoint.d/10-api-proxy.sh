#!/bin/sh
# Emits /etc/nginx/api-proxy.conf before nginx starts.
#
# nginx resolves a hostname in `proxy_pass` at STARTUP, not per request. A block
# pointing at the Docker Compose hostname "api" therefore prevents the container
# from booting anywhere that host does not exist - Cloud Run included. So the
# block is written only when API_UPSTREAM is set, and the file is left empty
# otherwise.
#
# Runs before 20-envsubst-on-templates.sh (the nginx image executes
# /docker-entrypoint.d/*.sh in filename order), and writes a plain conf rather
# than a template, so envsubst never touches it.
set -eu

TARGET=/etc/nginx/api-proxy.conf

if [ -n "${API_UPSTREAM:-}" ]; then
  echo "[entrypoint] proxying /api/ to ${API_UPSTREAM}"
  cat > "$TARGET" <<CONF
location /api/ {
    proxy_pass http://${API_UPSTREAM};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    client_max_body_size 220m;
    proxy_read_timeout 120s;
}
CONF
else
  echo "[entrypoint] API_UPSTREAM unset - serving static files only (the load balancer routes /api)"
  : > "$TARGET"
fi
