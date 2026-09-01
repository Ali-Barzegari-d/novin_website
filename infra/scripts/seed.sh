#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-dev}}"
source "$(dirname "$0")/load-env.sh"
if [[ "$environment" == "production" && "${ALLOW_SYNTHETIC_PRODUCTION_SEED:-}" != "I_UNDERSTAND_SYNTHETIC_ONLY" ]]; then echo 'seed تولیدی مسدود است.' >&2; exit 1; fi
if [[ "$environment" == "production" ]]; then
  docker compose --env-file .env run --rm --no-deps api node packages/db/dist/seed.js
else
  use_host_compose_services
  pnpm db:seed
fi
