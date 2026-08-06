#!/usr/bin/env bash
set -Eeuo pipefail

for required in backend/package.json frontend/package.json infrastructure/bash/generate-lockfiles.sh; do
  [[ -f "$required" ]] || { echo "Run this script from the RouteWell project root; missing $required" >&2; exit 1; }
done

cp backend/package.json backend/package.json.before-dependency-hotfix
cp frontend/package.json frontend/package.json.before-dependency-hotfix

python3 - <<'PY'
import json
from pathlib import Path

backend_path = Path('backend/package.json')
backend = json.loads(backend_path.read_text())
backend.setdefault('devDependencies', {})['typescript-eslint'] = '8.65.0'
backend_path.write_text(json.dumps(backend, indent=2) + '\n')

frontend_path = Path('frontend/package.json')
frontend = json.loads(frontend_path.read_text())
frontend.setdefault('dependencies', {})['react-is'] = frontend['dependencies']['react']
frontend.setdefault('devDependencies', {})['@testing-library/dom'] = '10.4.1'
frontend['devDependencies']['@testing-library/react'] = '16.3.2'
for group in ('dependencies', 'devDependencies'):
    frontend[group] = dict(sorted(frontend[group].items()))
frontend_path.write_text(json.dumps(frontend, indent=2) + '\n')
PY

cat > infrastructure/bash/generate-lockfiles.sh <<'LOCKSCRIPT'
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
LOCKSCRIPT
chmod +x infrastructure/bash/generate-lockfiles.sh
rm -f backend/package-lock.json frontend/package-lock.json backend/npm-lock.log frontend/npm-lock.log

echo "Dependency manifests corrected. Now run: make lock"
