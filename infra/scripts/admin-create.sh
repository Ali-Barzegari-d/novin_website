#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-dev}}"
source "$(dirname "$0")/load-env.sh"
if [[ "$environment" == "production" && "${CONFIRM_ADMIN_CREATE:-}" != "CREATE_FIRST_SUPERADMIN" ]]; then echo 'برای ایجاد ادمین تولیدی CONFIRM_ADMIN_CREATE لازم است.' >&2; exit 1; fi
if [[ "$environment" == "production" ]]; then
  docker compose --env-file .env run --rm --no-deps api node packages/db/dist/create-admin.js
else
  use_host_compose_services
  pnpm admin:create
fi
