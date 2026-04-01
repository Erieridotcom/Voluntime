#!/usr/bin/env bash
set -e

echo "==> Instalando dependencias de Python..."
pip install -r backend/requirements.txt

echo "==> Instalando pnpm..."
npm install -g pnpm

echo "==> Instalando dependencias de Node.js..."
pnpm install

echo "==> Construyendo el frontend de React..."
pnpm --filter @workspace/voluntariado build

echo "==> Build completo."
