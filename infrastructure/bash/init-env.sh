#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
ENV_FILE="$ROOT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  echo "Environment file already exists: $ENV_FILE"
  exit 0
fi

command -v openssl >/dev/null 2>&1 || {
  echo "OpenSSL is required to generate local secrets." >&2
  exit 1
}

POSTGRES_PASSWORD=$(openssl rand -hex 18)
JWT_ACCESS_SECRET=$(openssl rand -hex 48)
JWT_REFRESH_SECRET=$(openssl rand -hex 48)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -hex 18)

cat >"$ENV_FILE" <<EOF_ENV
COMPOSE_PROJECT_NAME=routewell
NODE_ENV=development
HTTP_PORT=80

POSTGRES_DB=routewell
POSTGRES_USER=routewell
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://routewell:${POSTGRES_PASSWORD}@postgres:5432/routewell?schema=public

REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
ALLOW_PUBLIC_REGISTRATION=true
COOKIE_DOMAIN=
COOKIE_SECURE=false

FRONTEND_URL=http://localhost
NEXT_PUBLIC_API_BASE_URL=/api/v1
NEXT_PUBLIC_ALLOW_REGISTRATION=true
BACKEND_INTERNAL_URL=http://backend:8080

LOG_LEVEL=debug
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}

SEED_ADMIN_PASSWORD=RouteWellAdmin123!
SEED_DRIVER_PASSWORD=RouteWellDriver123!
EOF_ENV

chmod 600 "$ENV_FILE"
echo "Created $ENV_FILE with generated local secrets."
echo "Next: make lock && docker compose --progress=plain build frontend && docker compose --progress=plain build backend"
