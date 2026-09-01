#!/usr/bin/env bash
set -euo pipefail
make bootstrap ENV=dev
docker compose --env-file .env up -d postgres redis clamav
set -a
source .env
set +a
pnpm dev
