#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-dev}}"
source "$(dirname "$0")/load-env.sh"
if [[ "$environment" == "production" && "${APP_ENV:-}" != "production" ]]; then echo 'برای migration تولید APP_ENV=production لازم است.' >&2; exit 1; fi
if [[ "$environment" == "production" ]]; then
  docker compose --env-file .env run --rm --no-deps api node packages/db/dist/migrate.js
else
  use_host_compose_services
  pnpm db:migrate
fi
