#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-dev}}"
source "$(dirname "$0")/load-env.sh"
[[ -n "${BACKUP_AGE_RECIPIENT:-}" ]] || { echo 'BACKUP_AGE_RECIPIENT تنظیم نشده است.' >&2; exit 1; }
mkdir -p var/backups/daily var/backups/weekly
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="var/backups/daily/novin-${stamp}.dump.age"
uploads_target="var/backups/daily/novin-${stamp}.uploads.tar.age"
docker compose --env-file .env exec -T postgres pg_dump -U "${POSTGRES_USER:-novin}" -d "${POSTGRES_DB:-novin}" -Fc | age -r "$BACKUP_AGE_RECIPIENT" -o "$target"
tar -C var -cf - uploads | age -r "$BACKUP_AGE_RECIPIENT" -o "$uploads_target"
[[ -s "$target" && -s "$uploads_target" ]] || { echo 'backup تهی است.' >&2; exit 1; }
sha256sum "$target" > "${target}.sha256"
sha256sum "$uploads_target" > "${uploads_target}.sha256"

prune_generation() {
  local directory="$1" keep="$2"
  mapfile -t obsolete < <(find "$directory" -type f -name '*.dump.age' -printf '%T@ %p\n' | sort -nr | awk -v keep="$keep" 'NR > keep { print $2 }')
  for file in "${obsolete[@]:-}"; do
    [[ -n "$file" ]] || continue
    rm -f -- "$file" "${file}.sha256" "${file%.dump.age}.uploads.tar.age" "${file%.dump.age}.uploads.tar.age.sha256"
  done
}

prune_generation var/backups/daily "${BACKUP_DAILY_KEEP:-7}"
if [[ "$(date -u +%u)" == "7" ]]; then
  weekly="var/backups/weekly/novin-${stamp}.dump.age"
  weekly_uploads="var/backups/weekly/novin-${stamp}.uploads.tar.age"
  cp -- "$target" "$weekly"
  cp -- "$uploads_target" "$weekly_uploads"
  sha256sum "$weekly" > "${weekly}.sha256"
  sha256sum "$weekly_uploads" > "${weekly_uploads}.sha256"
  prune_generation var/backups/weekly "${BACKUP_WEEKLY_KEEP:-4}"
fi
echo "encrypted database and upload backup created for $environment: $target"
