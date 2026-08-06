#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"
command -v docker >/dev/null 2>&1 || { echo "Docker is required." >&2; exit 1; }
NODE_IMAGE=${NODE_IMAGE:-node:24.17.0-alpine}
generate() {
  local directory=$1
  local log_file="$ROOT_DIR/$directory/npm-lock.log"
  echo
  echo "==> Generating ${directory}/package-lock.json with ${NODE_IMAGE}"
  rm -f "$log_file" "$ROOT_DIR/$directory/package-lock.json"
  if ! docker run --rm \
    -e NPM_CONFIG_FETCH_RETRIES=5 \
    -e NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    -e NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    -e NPM_CONFIG_FETCH_TIMEOUT=600000 \
    -v "$ROOT_DIR/$directory:/workspace" \
    -w /workspace \
    "$NODE_IMAGE" \
    sh -lc 'npm install --package-lock-only --ignore-scripts --include=dev --no-audit --no-fund 2>&1 | tee npm-lock.log'; then
      rm -f "$ROOT_DIR/$directory/package-lock.json"
      echo "Lockfile generation failed for $directory. See $directory/npm-lock.log" >&2
      grep -A 35 -B 10 -E 'ERESOLVE|Could not resolve dependency|Conflicting peer dependency|peer dependency' "$log_file" >&2 || true
      exit 1
  fi
  rm -f "$log_file"
  test -s "$ROOT_DIR/$directory/package-lock.json"
  echo "Created ${directory}/package-lock.json"
}
generate backend
generate frontend
echo
echo "Lockfiles generated successfully."
