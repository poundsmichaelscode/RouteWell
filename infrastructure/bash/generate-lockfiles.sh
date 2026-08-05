#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required to generate lockfiles with the project Node version." >&2
  exit 1
}

generate() {
  local directory=$1
  echo "Generating ${directory}/package-lock.json"
  docker run --rm \
    -v "$ROOT_DIR/$directory:/workspace" \
    -w /workspace \
    node:24.17.0-alpine \
    npm install --package-lock-only --ignore-scripts --no-audit --no-fund
}

generate backend
generate frontend

echo "Lockfiles generated. Commit both package-lock.json files."
