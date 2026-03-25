#!/bin/bash
# Build Lua 5.4 to WebAssembly via Emscripten.
#
# This script is designed to run INSIDE the Emscripten Docker container
# (emscripten/emsdk:3.1.56) but can also run on a host with Emscripten installed.
#
# Output: /build/output/lua.wasm, /build/output/lua.js
#
set -euo pipefail

LUA_VERSION="5.4.7"
LUA_URL="https://www.lua.org/ftp/lua-${LUA_VERSION}.tar.gz"
OUTPUT_DIR="/build/output"

echo "=== Building Lua ${LUA_VERSION} → WebAssembly ==="

# 1. Download Lua source
echo "→ Downloading Lua ${LUA_VERSION}..."
cd /build
curl -sSL "$LUA_URL" -o lua.tar.gz
tar xzf lua.tar.gz
cd "lua-${LUA_VERSION}"

# 2. Patch Lua source for Emscripten compatibility
echo "→ Patching for Emscripten..."

# Disable os.execute, os.rename, os.remove, os.tmpname (no real filesystem in browser)
# We keep os.clock, os.time, os.date, os.difftime (Emscripten provides these)
# No patches needed — Emscripten's libc stubs handle this gracefully.

# 3. Compile with Emscripten
echo "→ Compiling with emcc..."

CORE_SRCS="
  lapi.c lcode.c lctype.c ldebug.c ldo.c ldump.c lfunc.c lgc.c llex.c
  lmem.c lobject.c lopcodes.c lparser.c lstate.c lstring.c ltable.c
  ltm.c lundump.c lvm.c lzio.c
"

LIB_SRCS="
  lauxlib.c lbaselib.c lcorolib.c ldblib.c liolib.c lmathlib.c
  loslib.c lstrlib.c ltablib.c lutf8lib.c loadlib.c linit.c
"

mkdir -p "$OUTPUT_DIR"

cd src

# Compile all .c files to .o files
for src in $CORE_SRCS $LIB_SRCS; do
  emcc -c "$src" \
    -O2 \
    -DLUA_USE_POSIX \
    -o "${src%.c}.o"
done

# Compile the standalone interpreter (lua.c) — this is the entry point
emcc -c lua.c \
  -O2 \
  -DLUA_USE_POSIX \
  -o lua.o

# Link everything into a WASM module with JavaScript glue
echo "→ Linking WASM module..."

OBJ_FILES=""
for src in $CORE_SRCS $LIB_SRCS; do
  OBJ_FILES="$OBJ_FILES ${src%.c}.o"
done

emcc $OBJ_FILES lua.o \
  -O2 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createLuaModule" \
  -s EXPORTED_RUNTIME_METHODS='["callMain","FS"]' \
  -s FILESYSTEM=1 \
  -s FORCE_FILESYSTEM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s INITIAL_MEMORY=16777216 \
  -s MAXIMUM_MEMORY=268435456 \
  -s ENVIRONMENT='web,worker' \
  -s EXIT_RUNTIME=1 \
  -s INVOKE_RUN=0 \
  -s ASSERTIONS=0 \
  -s MALLOC=emmalloc \
  -o "$OUTPUT_DIR/lua.js"

# 4. Verify outputs
echo "→ Verifying outputs..."
ls -lh "$OUTPUT_DIR/lua.js" "$OUTPUT_DIR/lua.wasm"

WASM_SIZE=$(stat -f%z "$OUTPUT_DIR/lua.wasm" 2>/dev/null || stat -c%s "$OUTPUT_DIR/lua.wasm" 2>/dev/null)
echo "→ lua.wasm size: ${WASM_SIZE} bytes ($(( WASM_SIZE / 1024 )) KB)"

echo "=== Lua ${LUA_VERSION} WASM build complete ==="
