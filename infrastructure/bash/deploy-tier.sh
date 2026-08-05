#!/usr/bin/env bash
set -Eeuo pipefail

# Azure Run Command passes parameters as key=value arguments. The script also
# works interactively: ./deploy-tier.sh tier=app repo_url=... ref=main ...
for argument in "$@"; do
  key=${argument%%=*}
  value=${argument#*=}
  case "$key" in
    tier|repo_url|ref|key_vault|image_prefix|image_tag|app_ip|db_ip|public_url|cookie_domain) printf -v "$key" '%s' "$value" ;;
    *) echo "Ignoring unknown parameter: $key" ;;
  esac
done

: "${tier:?tier is required}"
: "${repo_url:?repo_url is required}"
: "${ref:=main}"
: "${key_vault:?key_vault is required}"
: "${image_prefix:?image_prefix is required}"
: "${image_tag:=latest}"
: "${app_ip:=10.10.2.10}"
: "${db_ip:=10.10.3.10}"
: "${public_url:=https://routewell.example.com}"
: "${cookie_domain:=}"

ROOT=/opt/routewell
REPO="$ROOT/repo"
SECRETS="$ROOT/secrets"
mkdir -p "$ROOT" "$SECRETS"
chmod 700 "$SECRETS"

# A detached checkout supports branches, tags and immutable commit SHAs.
if [[ ! -d "$REPO/.git" ]]; then
  git clone --filter=blob:none --no-checkout "$repo_url" "$REPO"
fi
git -C "$REPO" fetch --force --depth 1 origin "$ref"
git -C "$REPO" checkout --force --detach FETCH_HEAD
git -C "$REPO" clean -fdx

if ! command -v docker >/dev/null 2>&1; then
  bash "$REPO/infrastructure/bash/bootstrap-vm.sh"
fi

az login --identity --allow-no-subscriptions >/dev/null
kv_secret() { az keyvault secret show --vault-name "$key_vault" --name "$1" --query value -o tsv; }
wait_for_healthy() {
  local compose_file=$1 service=$2 attempts=${3:-30}
  for ((i=1; i<=attempts; i++)); do
    status=$(docker compose -f "$compose_file" ps --format json "$service" 2>/dev/null | jq -r 'if type=="array" then .[0].Health // .[0].State else .Health // .State end' 2>/dev/null || true)
    [[ "$status" == "healthy" || "$status" == "running" ]] && return 0
    sleep 5
  done
  docker compose -f "$compose_file" logs --tail 100 "$service" || true
  return 1
}

GHCR_USERNAME=$(kv_secret routewell-ghcr-username 2>/dev/null || true)
GHCR_TOKEN=$(kv_secret routewell-ghcr-token 2>/dev/null || true)
if [[ -n "$GHCR_USERNAME" && -n "$GHCR_TOKEN" ]]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

cd "$REPO"
case "$tier" in
  db)
    kv_secret routewell-postgres-password >"$SECRETS/postgres_password"
    chmod 600 "$SECRETS/postgres_password"
    docker compose -f infrastructure/docker/compose.db.yml pull
    docker compose -f infrastructure/docker/compose.db.yml up -d --remove-orphans
    wait_for_healthy infrastructure/docker/compose.db.yml postgres 36
    ;;
  app)
    kv_secret routewell-database-url >"$SECRETS/database_url"
    kv_secret routewell-jwt-access-secret >"$SECRETS/jwt_access_secret"
    kv_secret routewell-jwt-refresh-secret >"$SECRETS/jwt_refresh_secret"
    chmod 600 "$SECRETS"/*
    export BACKEND_IMAGE="${image_prefix}-backend:${image_tag}"
    export FRONTEND_URL="$public_url"
    export COOKIE_DOMAIN="$cookie_domain"
    if [[ "$public_url" == https://* ]]; then
      export COOKIE_SECURE=true
    else
      export COOKIE_SECURE=false
      echo "WARNING: deploying with non-secure cookies because public_url is not HTTPS" >&2
    fi
    docker compose -f infrastructure/docker/compose.app.yml pull
    docker compose -f infrastructure/docker/compose.app.yml up -d --remove-orphans
    wait_for_healthy infrastructure/docker/compose.app.yml backend 36
    ;;
  web)
    export FRONTEND_IMAGE="${image_prefix}-frontend:${image_tag}"
    export BACKEND_INTERNAL_URL="http://${app_ip}:8080"
    docker compose -f infrastructure/docker/compose.web.yml pull
    docker compose -f infrastructure/docker/compose.web.yml up -d --remove-orphans
    wait_for_healthy infrastructure/docker/compose.web.yml nginx 30
    ;;
  *) echo "tier must be web, app or db" >&2; exit 2 ;;
esac

docker compose -f "infrastructure/docker/compose.${tier}.yml" ps
