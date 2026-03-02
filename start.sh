#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "node is not installed. Install Node.js first."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed. Install npm first."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing frontend dependencies..."
  npm install
fi

if lsof -iTCP:5174 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Frontend already running on port 5174."
  echo "URL: http://localhost:5174"
  exit 0
fi

echo "Starting frontend on http://localhost:5174 ..."
nohup npm run dev -- --host 0.0.0.0 --port 5174 > /tmp/tiein-frontend.log 2>&1 &

for i in {1..30}; do
  if curl -fsS "http://127.0.0.1:5174" >/dev/null 2>&1; then
    echo "Frontend is up."
    echo "URL: http://localhost:5174"
    echo "Logs: /tmp/tiein-frontend.log"
    exit 0
  fi
  sleep 1
done

echo "Frontend did not become ready in time."
echo "Check logs: /tmp/tiein-frontend.log"
exit 1
