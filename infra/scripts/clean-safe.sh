#!/usr/bin/env bash
set -euo pipefail
rm -rf -- apps/api/dist packages/contracts/dist packages/config/dist packages/db/dist coverage test-results artifacts
echo 'Build and test caches removed. Persistent var/ data was not touched.'
