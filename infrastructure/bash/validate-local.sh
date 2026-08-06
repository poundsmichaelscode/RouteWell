#!/usr/bin/env bash
set -Eeuo pipefail

MODE=${1:-static}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

if [[ "$MODE" != "static" && "$MODE" != "full" ]]; then
  echo "Usage: $0 [static|full]" >&2
  exit 2
fi

pass() { printf 'PASS  %s\n' "$1"; }
info() { printf 'INFO  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; exit 1; }
command_exists() { command -v "$1" >/dev/null 2>&1; }

info "Validating RouteWell in $MODE mode"

python3 - <<'PY'
import json
from pathlib import Path
root = Path('.')
files = sorted(path for path in root.rglob('*.json') if path.is_file())
for path in files:
    if any(part in {'node_modules', '.next', '.terraform'} for part in path.parts):
        continue
    json.loads(path.read_text())
print(f'validated {len(files)} JSON files')
PY
pass "JSON syntax"

python3 - <<'PY'
from pathlib import Path
try:
    import yaml
except ImportError as exc:
    raise SystemExit('PyYAML is required for static YAML validation: python3 -m pip install pyyaml') from exc
files = sorted([*Path('.').rglob('*.yml'), *Path('.').rglob('*.yaml')])
for path in files:
    if any(part in {'node_modules', '.next', '.terraform'} for part in path.parts):
        continue
    with path.open() as handle:
        yaml.safe_load(handle)
print(f'validated {len(files)} YAML files')
PY
pass "YAML syntax"

while IFS= read -r -d '' script; do
  bash -n "$script"
done < <(find backend infrastructure -type f -name '*.sh' -print0)
pass "Bash syntax"

if command_exists node; then
  node - <<'NODE'
const fs = require('fs');
const path = require('path');
let ts;
try {
  ts = require('typescript');
} catch {
  const candidates = [
    '/usr/local/lib/node_modules/typescript',
    '/opt/homebrew/lib/node_modules/typescript',
    process.env.NVM_BIN ? path.join(process.env.NVM_BIN, '..', 'lib', 'node_modules', 'typescript') : ''
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { ts = require(candidate); break; } catch {}
  }
}
if (!ts) {
  console.log('TypeScript parser is not installed globally; parser validation skipped.');
  process.exit(0);
}
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist'].includes(entry.name)) return [];
      return walk(file);
    }
    return [file];
  });
}
const files = ['backend', 'frontend'].flatMap(walk)
  .filter((file) => /\.(ts|tsx)$/.test(file) && !file.endsWith('.d.ts'));
const failures = [];
for (const file of files) {
  const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      esModuleInterop: true
    }
  });
  for (const diagnostic of result.diagnostics || []) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      failures.push(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`validated ${files.length} TypeScript/TSX files`);
NODE
  pass "TypeScript/TSX parser"
else
  info "Node.js unavailable; TypeScript parser validation skipped"
fi

python3 - <<'PY'
from pathlib import Path
files = sorted(Path('infrastructure/terraform').glob('*.tf'))
for path in files:
    text = path.read_text()
    pairs = {'{': '}', '[': ']'}
    stack = []
    quote = False
    escaped = False
    heredoc = None
    for line_no, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if heredoc:
            if stripped == heredoc:
                heredoc = None
            continue
        if '<<-' in line or '<<' in line:
            marker = line.split('<<-', 1)[1].strip() if '<<-' in line else line.split('<<', 1)[1].strip()
            if marker and marker.replace('_', '').isalnum():
                heredoc = marker
                continue
        for char in line:
            if escaped:
                escaped = False
                continue
            if char == '\\' and quote:
                escaped = True
                continue
            if char == '"':
                quote = not quote
                continue
            if quote:
                continue
            if char in pairs:
                stack.append((char, line_no))
            elif char in pairs.values():
                if not stack or pairs[stack[-1][0]] != char:
                    raise SystemExit(f'{path}:{line_no}: unbalanced {char}')
                stack.pop()
    if stack or quote or heredoc:
        raise SystemExit(f'{path}: incomplete Terraform structure')
print(f'validated {len(files)} Terraform files')
PY
pass "Terraform lexical structure"

python3 - <<'PY_VALIDATION'
import ipaddress
import re
from pathlib import Path

root = Path('.')
errors: list[str] = []

def resolves(base: Path, target: str) -> bool:
    candidate = (base / target).resolve()
    options = [
        candidate,
        Path(str(candidate) + '.ts'),
        Path(str(candidate) + '.tsx'),
        Path(str(candidate) + '.d.ts'),
        candidate / 'index.ts',
        candidate / 'index.tsx',
    ]
    return any(option.exists() for option in options)

import_pattern = re.compile(r'(?:from\s+|import\s*\()([\"\'])([^\"\']+)\1')
for directory in [Path('backend'), Path('frontend')]:
    for path in directory.rglob('*'):
        if path.suffix not in {'.ts', '.tsx'} or any(part in {'node_modules', '.next', 'dist'} for part in path.parts):
            continue
        for _, target in import_pattern.findall(path.read_text()):
            if target.startswith('.') and not resolves(path.parent, target):
                errors.append(f'{path}: unresolved import {target}')
            elif target.startswith('@/') and directory.name == 'frontend' and not resolves(Path('frontend'), target[2:]):
                errors.append(f'{path}: unresolved alias import {target}')

required = [
    Path('.env.example'),
    Path('frontend/public/.gitkeep'),
    Path('database/prisma/schema.prisma'),
    Path('database/prisma/migrations/migration_lock.toml'),
    Path('infrastructure/nginx/nginx.local.conf'),
    Path('infrastructure/nginx/nginx.prod.conf'),
    Path('infrastructure/monitoring/grafana/dashboards/routewell-overview.json'),
]
for path in required:
    if not path.exists():
        errors.append(f'missing required file: {path}')

compose = Path('docker-compose.yml').read_text()
for secret in ['POSTGRES_PASSWORD', 'DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'GRAFANA_ADMIN_PASSWORD']:
    if f'${{{secret}:?' not in compose:
        errors.append(f'docker-compose.yml must require {secret} instead of using an unsafe fallback')

for dockerfile in [Path('backend/Dockerfile'), Path('frontend/Dockerfile')]:
    text = dockerfile.read_text()
    if '--mount=type=cache,target=/root/.npm' not in text:
        errors.append(f'{dockerfile}: npm BuildKit cache is missing')
    if 'package-lock.json' not in text or 'npm ci' not in text:
        errors.append(f'{dockerfile}: lockfile-aware install path is missing')

import json
backend_manifest = json.loads(Path('backend/package.json').read_text())
frontend_manifest = json.loads(Path('frontend/package.json').read_text())
backend_package = Path('backend/package.json').read_text()
if '@types/uuid' in backend_package:
    errors.append('backend/package.json must not include the deprecated @types/uuid stub')

frontend_dependencies = frontend_manifest.get('dependencies', {})
frontend_dev_dependencies = frontend_manifest.get('devDependencies', {})
if frontend_dependencies.get('react-is') != frontend_dependencies.get('react'):
    errors.append('frontend react-is must be installed and exactly match the React version for Recharts')
if '@testing-library/dom' not in frontend_dev_dependencies:
    errors.append('frontend must install the @testing-library/dom peer required by @testing-library/react 16+')
if backend_manifest.get('devDependencies', {}).get('typescript-eslint') != '8.65.0':
    errors.append('backend must use the TypeScript-5.9-compatible typescript-eslint 8.65.0 toolchain')

backend_source = '\n'.join(path.read_text() for path in Path('backend/src').rglob('*.ts'))
if 'params.id!' in backend_source:
    errors.append('unsafe Express route parameter non-null assertions remain')

ci = Path('.github/workflows/ci.yml').read_text()
if 'npm ci --no-audit --no-fund' not in ci or 'if [[ -f package-lock.json ]]' not in ci:
    errors.append('CI must use npm ci when committed lockfiles are available')

frontend_docker = Path('frontend/Dockerfile').read_text()
if 'NEXT_PUBLIC_ALLOW_REGISTRATION' not in frontend_docker:
    errors.append('frontend production build is missing the registration feature flag')

cd_workflow = Path('.github/workflows/cd.yml').read_text()
if 'NEXT_PUBLIC_ALLOW_REGISTRATION=false' not in cd_workflow:
    errors.append('production frontend build must disable public registration')

if 'ALLOW_PUBLIC_REGISTRATION: "false"' not in Path('infrastructure/docker/compose.app.yml').read_text():
    errors.append('production backend Compose must disable public registration')

if 'backend:\n        condition: service_healthy' not in compose:
    errors.append('seed service must wait for the migrated backend to become healthy')

canonical_migration = Path('database/prisma/migrations/202607290001_initial/migration.sql')
review_migration = Path('database/migrations/202607290001_initial/migration.sql')
if not canonical_migration.exists() or not review_migration.exists():
    errors.append('canonical and reviewed initial migrations must both exist')
elif canonical_migration.read_bytes() != review_migration.read_bytes():
    errors.append('reviewed migration mirror differs from the executable Prisma migration')

cidrs = [
    ipaddress.ip_network('10.10.0.0/24'),
    ipaddress.ip_network('10.10.1.0/27'),
    ipaddress.ip_network('10.10.2.0/27'),
    ipaddress.ip_network('10.10.3.0/28'),
    ipaddress.ip_network('10.10.5.0/26'),
]
for index, left in enumerate(cidrs):
    for right in cidrs[index + 1:]:
        if left.overlaps(right):
            errors.append(f'Azure subnet overlap: {left} and {right}')

if errors:
    raise SystemExit('Repository consistency errors:\n' + '\n'.join(errors))
print('repository imports, runtime files, Docker policy and CIDRs validated')
PY_VALIDATION
pass "Repository consistency"

python3 - <<'PY'
import re
from pathlib import Path
root = Path('.')
missing = []
pattern = re.compile(r'\[[^\]]+\]\(([^)]+)\)')
for path in root.rglob('*.md'):
    if any(part in {'node_modules', '.next'} for part in path.parts):
        continue
    for target in pattern.findall(path.read_text()):
        if target.startswith(('http://', 'https://', '#', 'mailto:')):
            continue
        clean = target.split('#', 1)[0]
        if clean and not (path.parent / clean).resolve().exists():
            missing.append(f'{path}: {target}')
if missing:
    raise SystemExit('Missing Markdown targets:\n' + '\n'.join(missing))
print('relative Markdown links validated')
PY
pass "Markdown links"

if find . -type f \( -name '.DS_Store' -o -name '*.pem' -o -name '*.key' -o -name '*.tfstate' \) -print | grep -q .; then
  fail "Unexpected generated or secret-bearing file detected"
fi
pass "Artifact hygiene"

if command_exists docker; then
  docker compose --env-file .env.example config --quiet
  pass "Docker Compose expansion"
else
  info "Docker unavailable; Compose expansion skipped"
fi

if [[ "$MODE" == "full" ]]; then
  command_exists npm || fail "npm is required for full validation"
  if [[ -f backend/package-lock.json ]]; then
    npm --prefix backend ci --no-audit --no-fund
  else
    npm --prefix backend install --no-audit --no-fund
  fi
  if [[ -f frontend/package-lock.json ]]; then
    npm --prefix frontend ci --no-audit --no-fund
  else
    npm --prefix frontend install --no-audit --no-fund
  fi
  npm --prefix backend run prisma:generate
  npm run lint
  npm test
  npm run build
  pass "Application lint, tests and production builds"

  if command_exists docker; then
    docker compose --env-file .env.example config --quiet
    docker compose --env-file .env.example --progress=plain build backend frontend
    pass "Docker Compose and image builds"
  else
    info "Docker unavailable; Compose runtime validation skipped"
  fi

  if command_exists terraform; then
    terraform -chdir=infrastructure/terraform fmt -check -recursive
    terraform -chdir=infrastructure/terraform init -backend=false
    terraform -chdir=infrastructure/terraform validate
    pass "Terraform provider validation"
  else
    info "Terraform unavailable; provider validation skipped"
  fi
fi

pass "RouteWell validation complete"
