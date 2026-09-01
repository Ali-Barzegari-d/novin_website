#!/usr/bin/env bash
set -euo pipefail
environment="${1:-dev}"
if [[ "$environment" == "production" && "${CONFIRM_ADMIN_CREATE:-}" != "CREATE_FIRST_SUPERADMIN" ]]; then echo 'برای ایجاد ادمین تولیدی CONFIRM_ADMIN_CREATE لازم است.' >&2; exit 1; fi
pnpm admin:create
