#!/bin/bash
# Build a specific @omni-wasm package.
#
# Usage:
#   ./tools/build.sh lua
#   ./tools/build.sh python
#   ./tools/build.sh --all
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

build_package() {
  local lang="$1"
  local pkg_dir="$ROOT_DIR/packages/$lang"

  if [ ! -d "$pkg_dir" ]; then
    echo "❌ Package not found: $lang"
    exit 1
  fi

  echo "🔨 Building @omni-wasm/$lang..."

  # Check if a Docker-based WASM build exists
  if [ -f "$pkg_dir/build.sh" ]; then
    echo "  → Running WASM build (Emscripten/Rust)..."
    bash "$pkg_dir/build.sh"
  fi

  # Build TypeScript wrapper
  echo "  → Compiling TypeScript..."
  (cd "$pkg_dir" && npm run build)

  echo "✅ @omni-wasm/$lang built successfully"
}

if [ "${1:-}" = "--all" ]; then
  for pkg_dir in "$ROOT_DIR"/packages/*/; do
    lang=$(basename "$pkg_dir")
    [ "$lang" = "shared" ] && continue
    build_package "$lang"
  done
elif [ -n "${1:-}" ]; then
  build_package "$1"
else
  echo "Usage: ./tools/build.sh <language>  or  ./tools/build.sh --all"
  echo "Example: ./tools/build.sh lua"
  exit 1
fi
