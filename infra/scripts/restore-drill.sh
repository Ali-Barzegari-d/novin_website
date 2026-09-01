#!/usr/bin/env bash
set -euo pipefail

backup="${BACKUP:-${1:-}}"
source "$(dirname "$0")/load-env.sh"
[[ "${ENV:-dev}" == "dev" ]] || { echo 'restore drill فقط در ENV=dev مجاز است.' >&2; exit 1; }
[[ -f "$backup" ]] || { echo 'مسیر صریح backup لازم است.' >&2; exit 2; }
[[ "${CONFIRM_RESTORE_DRILL:-}" == "RESTORE_SYNTHETIC_DEV_DATA" ]] || { echo 'CONFIRM_RESTORE_DRILL=RESTORE_SYNTHETIC_DEV_DATA لازم است.' >&2; exit 1; }
sha256sum -c "${backup}.sha256"
drill_db="novin_restore_drill"
started="$(date +%s)"
docker compose --env-file .env exec -T postgres psql -U "${POSTGRES_USER:-novin}" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${drill_db};" -c "CREATE DATABASE ${drill_db};"
age -d -i "${AGE_IDENTITY_FILE:?AGE_IDENTITY_FILE لازم است}" "$backup" | docker compose --env-file .env exec -T postgres pg_restore -U "${POSTGRES_USER:-novin}" -d "$drill_db" --no-owner --no-privileges
sentinel="$(docker compose --env-file .env exec -T postgres psql -U "${POSTGRES_USER:-novin}" -d "$drill_db" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")"
[[ "$sentinel" -gt 0 ]] || { echo 'restore drill sentinel نامعتبر است.' >&2; exit 1; }
echo "restore drill passed: ${drill_db}; tables=${sentinel}; duration=$(( $(date +%s) - started ))s"
