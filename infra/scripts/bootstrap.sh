#!/usr/bin/env bash
set -euo pipefail
environment="${1:-dev}"
source "$(dirname "$0")/load-env.sh"
if [[ "$environment" != "dev" && "$environment" != "production" ]]; then echo "ENV باید dev یا production باشد." >&2; exit 2; fi
for directory in var/postgres var/redis var/uploads/quarantine var/uploads/clean var/backups/daily var/backups/weekly var/logs var/clamav; do
  mkdir -p "$directory"
  chmod 700 "$directory"
done
if [[ ! -f .env ]]; then cp .env.example .env; chmod 600 .env; echo '.env نمونه ساخته شد؛ رازهای توسعه را پیش از اجرا تغییر دهید.'; fi
if [[ "$environment" == "production" ]]; then [[ -L var ]] && { echo 'var نباید symbolic link باشد.' >&2; exit 1; }; fi
if [[ "$environment" == "production" ]]; then
  for directory in var/uploads/quarantine var/uploads/clean var/logs; do
    [[ "$(stat -c '%u:%g' "$directory")" == "${APP_UID:-1000}:${APP_GID:-1000}" ]] || { echo "مالک $directory باید ${APP_UID:-1000}:${APP_GID:-1000} باشد." >&2; exit 1; }
  done
fi
echo "bootstrap $environment complete"
