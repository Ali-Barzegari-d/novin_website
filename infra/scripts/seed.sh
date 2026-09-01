#!/usr/bin/env bash
set -euo pipefail
environment="${1:-dev}"
if [[ "$environment" == "production" && "${ALLOW_SYNTHETIC_PRODUCTION_SEED:-}" != "I_UNDERSTAND_SYNTHETIC_ONLY" ]]; then echo 'seed تولیدی مسدود است.' >&2; exit 1; fi
pnpm db:seed
