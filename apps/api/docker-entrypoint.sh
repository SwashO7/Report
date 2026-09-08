#!/bin/sh
# Suraksha Labs — API container entrypoint.
#
# STORAGE_DIR is a Docker volume. A volume that already exists (even if empty)
# masks whatever the image shipped at that path, so lab packages baked into the
# image are staged at LAB_PACKAGE_STAGE and synced in here on every boot. This
# makes an empty or stale storage volume self-healing instead of turning every
# download into "the lab package is not available yet".
set -eu

STORAGE_DIR="${STORAGE_DIR:-./storage}"
LAB_PACKAGE_STAGE="${LAB_PACKAGE_STAGE:-/app/lab-packages-dist}"

if [ -d "$LAB_PACKAGE_STAGE" ]; then
  mkdir -p "$STORAGE_DIR/labs"
  synced=0
  for zip in "$LAB_PACKAGE_STAGE"/*.zip; do
    [ -e "$zip" ] || continue
    target="$STORAGE_DIR/labs/$(basename "$zip")"
    if [ ! -f "$target" ]; then
      cp "$zip" "$target"
      synced=$((synced + 1))
    fi
  done
  echo "[entrypoint] lab packages synced into $STORAGE_DIR/labs: $synced new"
fi

bun src/db/migrate.ts
exec bun src/index.ts
