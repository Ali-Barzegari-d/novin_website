#!/usr/bin/env bash
# All repository environment files must be shell-compatible KEY=VALUE pairs.
# This helper deliberately exports nothing when .env has not been provisioned.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source ./.env
  set +a
fi

# Development and test commands run on the host, while DATABASE_URL and
# REDIS_URL normally use Compose-only service names. Resolve only those names
# to the current private Compose-network IP; production runtime never calls
# this helper because it executes inside the API image.
use_host_compose_services() {
  local container ip
  if [[ "${DATABASE_URL:-}" == *'@postgres:'* ]]; then
    container="$(docker compose --env-file .env ps -q postgres)"
    [[ -n "$container" ]] || { echo 'سرویس PostgreSQL Compose اجرا نشده است.' >&2; return 1; }
    ip="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container")"
    [[ -n "$ip" ]] || { echo 'IP خصوصی PostgreSQL پیدا نشد.' >&2; return 1; }
    DATABASE_URL="${DATABASE_URL/@postgres:/@${ip}:}"
    export DATABASE_URL
  fi
  if [[ "${REDIS_URL:-}" == 'redis://redis:'* ]]; then
    container="$(docker compose --env-file .env ps -q redis)"
    [[ -n "$container" ]] || { echo 'سرویس Redis Compose اجرا نشده است.' >&2; return 1; }
    ip="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container")"
    [[ -n "$ip" ]] || { echo 'IP خصوصی Redis پیدا نشد.' >&2; return 1; }
    REDIS_URL="${REDIS_URL/redis://redis:/redis://${ip}:}"
    export REDIS_URL
  fi
}
