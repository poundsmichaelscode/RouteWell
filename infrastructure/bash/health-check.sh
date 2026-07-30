#!/usr/bin/env bash
set -Eeuo pipefail
BASE_URL=${1:-http://localhost}
for path in /healthz /api/health /api/v1/auth/me; do
  code=$(curl -ksS -o /tmp/routewell-health-body -w '%{http_code}' "${BASE_URL}${path}" || true)
  printf '%-28s %s\n' "$path" "$code"
  if [[ "$path" != "/api/v1/auth/me" && "$code" -ge 400 ]]; then
    cat /tmp/routewell-health-body
    exit 1
  fi
done
