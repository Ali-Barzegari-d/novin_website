#!/usr/bin/env bash
set -euo pipefail
environment="${1:-production}"
[[ "$environment" == "production" ]] || { echo 'deploy فقط با ENV=production مجاز است.' >&2; exit 2; }
make preflight-production
make backup ENV=production
docker compose --env-file .env build
make migrate ENV=production
docker compose --env-file .env up -d --remove-orphans
make health ENV=production
echo 'Deploy completed. Record Git SHA and health evidence in PROGRESS.md.'
