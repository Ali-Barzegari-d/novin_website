#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-dev}}"
source "$(dirname "$0")/load-env.sh"
services="$(docker compose --env-file .env ps --format json)"
printf '%s\n' "$services"
if grep -q '"Health":"unhealthy"' <<<"$services"; then
  echo 'حداقل یک سرویس Compose unhealthy است.' >&2
  exit 1
fi
if docker compose --env-file .env ps --services --status running | grep -qx api; then
  docker compose --env-file .env exec -T api node -e "fetch('http://127.0.0.1:4000/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
else
  curl --fail --silent --show-error "${API_BASE_URL:-http://127.0.0.1:4000}/health/ready" >/dev/null
fi
if docker compose --env-file .env ps --services --status running | grep -qx web; then
  docker compose --env-file .env exec -T web node -e "fetch('http://127.0.0.1:3050/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
else
  curl --fail --silent --show-error "${PUBLIC_BASE_URL:-http://127.0.0.1:3050}/health" >/dev/null
fi
disk_line="$(df -P . | awk 'NR == 2 { print $5 " used (" $4 " KiB free)" }')"
backup="$(find var/backups/daily -type f -name '*.dump.age' -printf '%T@ %s %p\n' 2>/dev/null | sort -nr | head -n 1 || true)"
backup_path="${backup#* * }"
[[ -n "$backup_path" ]] || backup_path='not-provisioned'
if [[ "$environment" == "production" ]]; then
  [[ -n "$backup" ]] && [[ "${backup#* }" != "0 "* ]] || { echo 'هیچ backup رمزنگاری‌شده و غیرتهی پیدا نشد.' >&2; exit 1; }
fi
echo "health $environment ok; disk $disk_line; latest backup $backup_path"
