#!/usr/bin/env bash
set -euo pipefail
environment="${ENV:-${1:-production}}"
source "$(dirname "$0")/load-env.sh"
[[ "$environment" == "production" ]] || { echo 'deploy فقط با ENV=production مجاز است.' >&2; exit 2; }
make preflight-production
make backup ENV=production
release_sha="$(git rev-parse --short=12 HEAD)"
release_dir="var/releases"
mkdir -p "$release_dir"
if [[ -f "$release_dir/current.sha" ]]; then cp -- "$release_dir/current.sha" "$release_dir/last-known-good.sha"; fi
printf '%s\n' "$release_sha" > "$release_dir/candidate.sha"
export RELEASE_SHA="$release_sha"
docker compose --env-file .env build web api worker
make migrate ENV=production
docker compose --env-file .env up -d --remove-orphans
make health ENV=production
printf '%s\n' "$release_sha" > "$release_dir/current.sha"
printf '%s\n' "$release_sha" > "$release_dir/last-known-good.sha"
rm -f -- "$release_dir/candidate.sha"
echo "Deploy completed: $release_sha. Record health evidence in PROGRESS.md."
