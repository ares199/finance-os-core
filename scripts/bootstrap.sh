#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[bootstrap] Preparing finance-os-core dependencies"

echo "[bootstrap] Node: $(node -v 2>/dev/null || echo 'missing')"
echo "[bootstrap] NPM:  $(npm -v 2>/dev/null || echo 'missing')"

echo "[bootstrap] Clearing proxy env vars for this process to avoid blocked corporate/default proxy configs"
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY NPM_CONFIG_HTTP_PROXY NPM_CONFIG_HTTPS_PROXY

if [ -d node_modules ]; then
  echo "[bootstrap] Removing existing node_modules"
  python - <<'PY'
import shutil, os
if os.path.isdir('node_modules'):
    shutil.rmtree('node_modules')
PY
fi

echo "[bootstrap] Installing dependencies"
npm install --no-audit --no-fund

echo "[bootstrap] Running validation checks"
npm run lint
npm run test
npm run build

echo "[bootstrap] ✅ Project is ready"
