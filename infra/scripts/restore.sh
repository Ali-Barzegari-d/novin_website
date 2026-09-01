#!/usr/bin/env bash
set -euo pipefail
backup="${1:-}"
[[ -f "$backup" ]] || { echo 'مسیر صریح backup لازم است.' >&2; exit 2; }
[[ "${ENV:-}" == "dev" ]] || { echo 'restore فقط با ENV=dev یا runbook مجاز است.' >&2; exit 1; }
[[ "${CONFIRM_RESTORE:-}" == "RESTORE_SYNTHETIC_DEV_DATA" ]] || { echo 'CONFIRM_RESTORE=RESTORE_SYNTHETIC_DEV_DATA لازم است.' >&2; exit 1; }
sha256sum -c "${backup}.sha256"
age -d -i "${AGE_IDENTITY_FILE:?AGE_IDENTITY_FILE لازم است}" "$backup" | docker compose --env-file .env exec -T postgres pg_restore -U "${POSTGRES_USER:-novin}" -d "${POSTGRES_DB:-novin}" --clean --if-exists
echo 'restore completed; run health and migration checks.'
