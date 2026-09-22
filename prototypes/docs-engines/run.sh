#!/usr/bin/env bash
# Throwaway compatibility fixtures; not the product documentation application.
set -euo pipefail

case "${1:-}" in
  vitepress|starlight) docs_engine="$1" ;;
  *) echo 'Usage: run.sh {vitepress|starlight} [dev|build|preview|verify]' >&2; exit 2 ;;
esac
docs_action="${2:-dev}"
case "$docs_action" in
  dev|build|preview|verify) ;;
  *) echo 'Action must be dev, build, preview, or verify.' >&2; exit 2 ;;
esac

docs_prototype_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_fixture_dir="$docs_prototype_dir/$docs_engine"
if [[ "$(node --version)" != 'v24.21.0' ]]; then
  echo 'Select Node 24.21.0 from the repository .nvmrc before running this fixture.' >&2
  exit 1
fi

export XDG_STATE_HOME="$docs_fixture_dir/.state"
export ASTRO_TELEMETRY_DISABLED=1
cd "$docs_fixture_dir"
docs_server_flags=(--host 127.0.0.1)
if [[ "$docs_engine" == starlight ]]; then
  docs_server_flags+=(--ignore-lock)
fi

pnpm --dir "$docs_fixture_dir" install --frozen-lockfile
case "$docs_action" in
  dev) exec pnpm --dir "$docs_fixture_dir/apps/docs" run dev "${docs_server_flags[@]}" ;;
  build) exec pnpm --dir "$docs_fixture_dir/apps/docs" run build ;;
  preview)
    pnpm --dir "$docs_fixture_dir/apps/docs" run build
    exec pnpm --dir "$docs_fixture_dir/apps/docs" run preview "${docs_server_flags[@]}"
    ;;
  verify)
    pnpm --dir "$docs_fixture_dir/apps/docs" run build
    python3 "$docs_fixture_dir/verify-runtime.py"
    if [[ "$docs_engine" == vitepress ]]; then
      python3 "$docs_fixture_dir/verify-followup.py"
    fi
    ;;
esac
