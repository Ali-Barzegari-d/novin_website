#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/load-env.sh"
if docker image inspect novin-financial-api:"${RELEASE_SHA:-dev}" >/dev/null 2>&1; then
  docker compose --env-file .env run --rm --no-deps api node_modules/.bin/tsx infra/scripts/preflight-production.ts
else
  pnpm preflight:production
fi
