#!/usr/bin/env bash
set -e

# PerfectPick Monorepo runner — starts backend and frontend side-by-side
# Usage: ./run.sh  (or bash run.sh on Windows)
# Requires: Node, npm, env files at apps/frontend/.env and apps/backend/.env

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "==> PerfectPick monorepo — $ROOT_DIR"
echo "==> Node $(node --version) | npm $(npm --version)"

# Check env files
if [ ! -f "$ROOT_DIR/apps/frontend/.env" ]; then
  echo "⚠️  Missing apps/frontend/.env — copy from apps/frontend/.env.example"
fi
if [ ! -f "$ROOT_DIR/apps/backend/.env" ]; then
  echo "⚠️  Missing apps/backend/.env — copy from apps/backend/.env.example"
fi

# Ensure deps
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "==> Installing root deps (concurrently)..."
  npm install --prefix "$ROOT_DIR"
fi
if [ ! -d "$ROOT_DIR/apps/frontend/node_modules" ]; then
  echo "==> Installing frontend deps..."
  npm install --prefix "$ROOT_DIR/apps/frontend"
fi
if [ ! -d "$ROOT_DIR/apps/backend/node_modules" ]; then
  echo "==> Installing backend deps..."
  npm install --prefix "$ROOT_DIR/apps/backend"
fi

echo "==> Starting backend (port 3000) + frontend (port 5173)..."
echo "    Backend: http://localhost:3000  |  Frontend: http://localhost:5173"
echo "    Logs are prefixed [backend] / [frontend] — Ctrl+C to stop both"
echo ""

# Use npx concurrently if available, else npm script
if npx --yes concurrently --version >/dev/null 2>&1; then
  npx concurrently \
    --names "backend,frontend" \
    --prefix-colors "blue,green" \
    "npm run dev --workspace=apps/backend" \
    "npm run dev --workspace=apps/frontend"
else
  npm run dev
fi
