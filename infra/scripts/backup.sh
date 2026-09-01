#!/usr/bin/env bash
set -euo pipefail
environment="${1:-dev}"
[[ -n "${BACKUP_AGE_RECIPIENT:-}" ]] || { echo 'BACKUP_AGE_RECIPIENT تنظیم نشده است.' >&2; exit 1; }
mkdir -p var/backups/daily var/backups/weekly
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="var/backups/daily/novin-${stamp}.dump.age"
docker compose --env-file .env exec -T postgres pg_dump -U "${POSTGRES_USER:-novin}" -d "${POSTGRES_DB:-novin}" -Fc | age -r "$BACKUP_AGE_RECIPIENT" -o "$target"
sha256sum "$target" > "${target}.sha256"
find var/backups/daily -type f -name '*.dump.age' -printf '%T@ %p\n' | sort -nr | awk 'NR>7 {print $2}' | xargs -r rm -f
echo "encrypted backup created for $environment: $target"
