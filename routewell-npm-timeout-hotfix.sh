#!/usr/bin/env bash
set -euo pipefail

for f in frontend/Dockerfile backend/Dockerfile frontend/.npmrc backend/.npmrc frontend/package-lock.json backend/package-lock.json; do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f"
    echo "Run this script from the RouteWell project root."
    exit 1
  fi
done

STAMP="$(date +%Y%m%d-%H%M%S)"
cp frontend/Dockerfile "frontend/Dockerfile.backup-$STAMP"
cp backend/Dockerfile "backend/Dockerfile.backup-$STAMP"
cp frontend/.npmrc "frontend/.npmrc.backup-$STAMP"
cp backend/.npmrc "backend/.npmrc.backup-$STAMP"

cat > frontend/.npmrc <<'NPMRC'
registry=https://registry.npmjs.org/
fetch-retries=10
fetch-retry-factor=2
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=180000
fetch-timeout=1200000
maxsockets=5
prefer-offline=true
audit=false
fund=false
NPMRC

cp frontend/.npmrc backend/.npmrc

python3 - <<'PY'
from pathlib import Path

front = Path("frontend/Dockerfile")
text = front.read_text()
old = '''RUN --mount=type=cache,target=/root/.npm \\
    if [ -f package-lock.json ]; then \\
      npm ci --no-audit --no-fund; \\
    else \\
      npm install --prefer-offline --no-audit --no-fund; \\
    fi'''
new = '''RUN --mount=type=cache,target=/root/.npm,sharing=locked \\
    set -eu; \\
    attempt=1; \\
    until npm ci --prefer-offline --no-audit --no-fund; do \\
      if [ "$attempt" -ge 5 ]; then \\
        echo "npm ci failed after ${attempt} attempts"; \\
        exit 1; \\
      fi; \\
      echo "npm registry transfer failed; retrying from cache (attempt ${attempt}/5)"; \\
      sleep $((attempt * 15)); \\
      attempt=$((attempt + 1)); \\
    done'''
if "npm registry transfer failed; retrying from cache" not in text:
    if old not in text:
        raise SystemExit("Could not locate expected frontend install block")
    front.write_text(text.replace(old, new, 1))

back = Path("backend/Dockerfile")
text = back.read_text()
old = '''RUN --mount=type=cache,target=/root/.npm \\
    cd backend \\
    && if [ -f package-lock.json ]; then \\
         npm ci --ignore-scripts --no-audit --no-fund; \\
       else \\
         npm install --prefer-offline --ignore-scripts --no-audit --no-fund; \\
       fi \\
    && npm run prisma:generate'''
new = '''RUN --mount=type=cache,target=/root/.npm,sharing=locked \\
    set -eu; \\
    cd backend; \\
    attempt=1; \\
    until npm ci --prefer-offline --ignore-scripts --no-audit --no-fund; do \\
      if [ "$attempt" -ge 5 ]; then \\
        echo "npm ci failed after ${attempt} attempts"; \\
        exit 1; \\
      fi; \\
      echo "npm registry transfer failed; retrying from cache (attempt ${attempt}/5)"; \\
      sleep $((attempt * 15)); \\
      attempt=$((attempt + 1)); \\
    done; \\
    npm run prisma:generate'''
if "npm registry transfer failed; retrying from cache" not in text:
    if old not in text:
        raise SystemExit("Could not locate expected backend install block")
    back.write_text(text.replace(old, new, 1))

print("Patched frontend and backend Dockerfiles.")
PY

echo
echo "Checking Docker daemon..."
docker info >/dev/null

echo "Checking npm registry from Docker..."
docker run --rm node:24-alpine sh -lc 'npm ping --registry=https://registry.npmjs.org/'

echo
echo "Hotfix applied successfully."
echo "BuildKit's /root/.npm cache target is unchanged, so previously downloaded packages can be reused."
echo
echo "Next:"
echo "  docker compose --progress=plain build frontend"
echo "  docker compose --progress=plain build backend"
