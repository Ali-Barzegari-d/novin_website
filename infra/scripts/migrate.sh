#!/usr/bin/env bash
set -euo pipefail
environment="${1:-dev}"
if [[ "$environment" == "production" && "${APP_ENV:-}" != "production" ]]; then echo 'برای migration تولید APP_ENV=production لازم است.' >&2; exit 1; fi
pnpm db:migrate
