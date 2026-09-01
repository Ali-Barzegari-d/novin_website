#!/usr/bin/env bash
set -euo pipefail
echo 'Rollback never downgrades database migrations automatically.'
echo 'Select the recorded last-known-good application image in the deployment runbook, then restart web and api.'
exit 1
