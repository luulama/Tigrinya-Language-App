#!/usr/bin/env bash
set -euo pipefail
POLYGLOT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$POLYGLOT_ROOT/.tools/node-version" ]]; then
 POLYGLOT_NODE_VERSION="$(cat "$POLYGLOT_ROOT/.tools/node-version")"
 export PATH="$POLYGLOT_ROOT/.tools/node-$POLYGLOT_NODE_VERSION-darwin-arm64/bin:$PATH"
fi
if [[ -d "$POLYGLOT_ROOT/.tools/dotnet" ]]; then export DOTNET_ROOT="$POLYGLOT_ROOT/.tools/dotnet"; export PATH="$POLYGLOT_ROOT/.tools/dotnet:$POLYGLOT_ROOT/.tools/bin:$PATH"; fi
export DOTNET_CLI_HOME="$POLYGLOT_ROOT/.tools/dotnet-home"
export NUGET_PACKAGES="$POLYGLOT_ROOT/.tools/nuget"
export npm_config_cache="$POLYGLOT_ROOT/.tools/npm-cache"
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

export NEXT_TELEMETRY_DISABLED=1
export DOTNET_CLI_DO_NOT_USE_MSBUILD_SERVER=1
export MSBUILDDISABLENODEREUSE=1
