#!/usr/bin/env bash
set -euo pipefail
environment="${1:-dev}"
curl --fail --silent --show-error "${PUBLIC_BASE_URL:-http://127.0.0.1:3050}/health" >/dev/null
docker compose --env-file .env ps --format json
df -h . | tail -n 1
echo "health $environment ok"
