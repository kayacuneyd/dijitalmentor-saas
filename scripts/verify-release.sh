#!/usr/bin/env bash
set -euo pipefail

# Local/staging release gate. Production deploy already calls these checks; this
# script gives operators and CI one stable command for the same baseline.
npm run check
npm test
npm run build
if [[ "${VERIFY_RELEASE_SMOKE:-0}" == "1" ]]; then
		node scripts/smoke-production.mjs
fi
echo "release verification passed"
