#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/dev-env.sh"
cd "$POLYGLOT_ROOT"
exec "$@"
