#!/usr/bin/env bash
set -euo pipefail
backup="${BACKUP:-${1:-}}"
source "$(dirname "$0")/load-env.sh"
[[ -f "$backup" ]] || { echo 'مسیر صریح backup لازم است.' >&2; exit 2; }
[[ "${ENV:-}" == "dev" ]] || { echo 'restore فقط با ENV=dev یا runbook مجاز است.' >&2; exit 1; }
[[ "${CONFIRM_RESTORE:-}" == "RESTORE_SYNTHETIC_DEV_DATA" ]] || { echo 'CONFIRM_RESTORE=RESTORE_SYNTHETIC_DEV_DATA لازم است.' >&2; exit 1; }
sha256sum -c "${backup}.sha256"
uploads_backup="${backup%.dump.age}.uploads.tar.age"
[[ -f "$uploads_backup" ]] && sha256sum -c "${uploads_backup}.sha256"
age -d -i "${AGE_IDENTITY_FILE:?AGE_IDENTITY_FILE لازم است}" "$backup" | docker compose --env-file .env exec -T postgres pg_restore -U "${POSTGRES_USER:-novin}" -d "${POSTGRES_DB:-novin}" --clean --if-exists
if [[ "${RESTORE_UPLOADS:-}" == "RESTORE_SYNTHETIC_UPLOADS" ]]; then
  [[ -f "$uploads_backup" ]] || { echo 'backup فایل‌های خصوصی موجود نیست.' >&2; exit 1; }
  staging="var/restore-staging/$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$staging"
  age -d -i "${AGE_IDENTITY_FILE}" "$uploads_backup" | tar -x -C "$staging"
  echo "فایل‌های بازیابی‌شده برای بازبینی در $staging قرار گرفتند؛ جایگزینی uploads فعال عمدی نیست."
fi
echo 'restore completed; run migration and health checks before use.'
