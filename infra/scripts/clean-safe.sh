#!/usr/bin/env bash
set -euo pipefail
rm -rf -- .next apps/web/.next apps/api/dist packages/contracts/dist packages/config/dist packages/db/dist coverage playwright-report test-results artifacts
echo 'Build and test caches removed. Persistent var/ data was not touched.'
