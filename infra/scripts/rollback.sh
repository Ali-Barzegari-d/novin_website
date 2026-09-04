#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/load-env.sh"
[[ "${ENV:-dev}" == "production" ]] || { echo 'rollback فقط با ENV=production مجاز است.' >&2; exit 2; }
rollback_sha="${ROLLBACK_SHA:-}"
[[ -n "$rollback_sha" ]] || { echo 'ROLLBACK_SHA صریح لازم است؛ مقدار last-known-good را از var/releases بررسی کنید.' >&2; exit 2; }
[[ "$rollback_sha" =~ ^[0-9a-f]{7,64}$ ]] || { echo 'ROLLBACK_SHA نامعتبر است.' >&2; exit 2; }
[[ "${CONFIRM_ROLLBACK:-}" == "ROLLBACK_APPLICATION_ONLY" ]] || { echo 'CONFIRM_ROLLBACK=ROLLBACK_APPLICATION_ONLY لازم است.' >&2; exit 1; }
export RELEASE_SHA="$rollback_sha"
docker image inspect "novin-financial-api:${rollback_sha}" >/dev/null
docker compose --env-file .env up -d --no-build api worker
ENV=production ./infra/scripts/health.sh
echo "application rollback completed: ${rollback_sha}; database migrations were not downgraded."
