#!/usr/bin/env bash
set -euo pipefail
make bootstrap ENV=dev
docker compose --env-file .env up -d postgres redis clamav
source "$(dirname "$0")/load-env.sh"
use_host_compose_services
pnpm dev
