#!/bin/bash
# Build SQLite to WebAssembly via Emscripten.
#
# Uses the SQLite amalgamation (single sqlite3.c file) — the recommended
# way to build SQLite. Also builds the shell (shell.c) for CLI-style execution.
#
# Output: /build/output/sqlite3.wasm, /build/output/sqlite3.js
#
set -euo pipefail

SQLITE_YEAR="2025"
SQLITE_VERSION="3490100"
SQLITE_URL="https://www.sqlite.org/${SQLITE_YEAR}/sqlite-amalgamation-${SQLITE_VERSION}.zip"
OUTPUT_DIR="/build/output"

echo "=== Building SQLite → WebAssembly ==="

# 1. Download SQLite amalgamation
echo "→ Downloading SQLite amalgamation..."
cd /build
curl -sSL "$SQLITE_URL" -o sqlite.zip
unzip -q sqlite.zip
cd "sqlite-amalgamation-${SQLITE_VERSION}"

# 2. Compile with Emscripten
echo "→ Compiling SQLite with emcc..."
mkdir -p "$OUTPUT_DIR"

# Compile the amalgamation (sqlite3.c) + shell (shell.c) together
# The shell provides the CLI interface we use to execute SQL statements
emcc sqlite3.c shell.c \
  -O2 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createSQLiteModule" \
  -s EXPORTED_RUNTIME_METHODS='["callMain","FS"]' \
  -s FILESYSTEM=1 \
  -s FORCE_FILESYSTEM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s INITIAL_MEMORY=33554432 \
  -s MAXIMUM_MEMORY=536870912 \
  -s ENVIRONMENT='web,worker' \
  -s EXIT_RUNTIME=1 \
  -s INVOKE_RUN=0 \
  -s ASSERTIONS=0 \
  -s MALLOC=emmalloc \
  -DSQLITE_ENABLE_JSON1 \
  -DSQLITE_ENABLE_FTS5 \
  -DSQLITE_ENABLE_RTREE \
  -DSQLITE_ENABLE_MATH_FUNCTIONS \
  -DSQLITE_THREADSAFE=0 \
  -DSQLITE_OMIT_LOAD_EXTENSION \
  -DSQLITE_OMIT_DEPRECATED \
  -o "$OUTPUT_DIR/sqlite3.js"

# 3. Verify outputs
echo "→ Verifying outputs..."
ls -lh "$OUTPUT_DIR/sqlite3.js" "$OUTPUT_DIR/sqlite3.wasm"

WASM_SIZE=$(stat -f%z "$OUTPUT_DIR/sqlite3.wasm" 2>/dev/null || stat -c%s "$OUTPUT_DIR/sqlite3.wasm" 2>/dev/null)
echo "→ sqlite3.wasm size: ${WASM_SIZE} bytes ($(( WASM_SIZE / 1024 )) KB)"

echo "=== SQLite WASM build complete ==="
