#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-dev}}"
source "$(dirname "$0")/load-env.sh"
base_url="${PUBLIC_BASE_URL:-http://127.0.0.1:3050}"
curl --fail --silent --show-error "${base_url}/health" >/dev/null
services="$(docker compose --env-file .env ps --format json)"
printf '%s\n' "$services"
if grep -q '"Health":"unhealthy"' <<<"$services"; then
  echo 'حداقل یک سرویس Compose unhealthy است.' >&2
  exit 1
fi
disk_line="$(df -P . | awk 'NR == 2 { print $5 " used (" $4 " KiB free)" }')"
backup="$(find var/backups/daily -type f -name '*.dump.age' -printf '%T@ %s %p\n' 2>/dev/null | sort -nr | head -n 1 || true)"
backup_path="${backup#* * }"
[[ -n "$backup_path" ]] || backup_path='not-provisioned'
if [[ "$environment" == "production" ]]; then
  [[ -n "$backup" ]] && [[ "${backup#* }" != "0 "* ]] || { echo 'هیچ backup رمزنگاری‌شده و غیرتهی پیدا نشد.' >&2; exit 1; }
fi
echo "health $environment ok; disk $disk_line; latest backup $backup_path"
