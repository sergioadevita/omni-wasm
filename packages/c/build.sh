#!/bin/bash
# Build picoc (C interpreter) to WebAssembly via Emscripten.
#
# picoc interprets C code directly — no native code generation — which is
# essential for running in a WASM sandbox where you can't execute machine
# code. Supports C89/C90 with some C99 features.
#
# Output: /build/output/picoc.wasm, /build/output/picoc.js
#
set -euo pipefail

PICOC_REPO="https://github.com/jpoirier/picoc"
PICOC_TAG="v3.2.2"
OUTPUT_DIR="/build/output"

echo "=== Building picoc ${PICOC_TAG} → WebAssembly ==="

# 1. Download picoc source
echo "→ Downloading picoc ${PICOC_TAG}..."
cd /build
curl -sSL "${PICOC_REPO}/archive/refs/tags/${PICOC_TAG}.tar.gz" -o picoc.tar.gz
tar xzf picoc.tar.gz
cd picoc-*  # handles picoc-2.1 directory name

echo "→ Patching for Emscripten compatibility..."

# 2a. Fix incomplete type error: Emscripten's musl libc has FILE as opaque forward-declared struct.
#     CStdOutBase is declared as `IOFILE CStdOutBase;` (value type) but never used — remove it.
sed -i 's/^    IOFILE CStdOutBase;/    \/\* removed: IOFILE CStdOutBase — incomplete type in musl \*\//' interpreter.h

# 2b. Fix sizeof(FILE) in cstdlib/stdio.c — FILE is opaque in musl libc.
#     picoc creates opaque structs sized to FILE; substitute sizeof(void*) since
#     picoc only passes around pointers to these, not the actual contents.
sed -i 's/sizeof(FILE)/sizeof(void*)/g' cstdlib/stdio.c

# 2c. Stub out POSIX functions not available in Emscripten's musl
#     getdtablesize and getpass are referenced in cstdlib/unistd.c
cat >> cstdlib/unistd.c << 'STUBEOF'

/* Emscripten stubs for missing POSIX functions */
#ifdef __EMSCRIPTEN__
#include <stdio.h>
int getdtablesize(void) { return 256; }
char *getpass(const char *prompt) {
    static char buf[128];
    if (prompt) fprintf(stderr, "%s", prompt);
    buf[0] = '\0';
    return buf;
}
#endif
STUBEOF

# 2d. Patch platform_unix.c to remove readline dependency and fix Emscripten issues
# picoc's Unix platform uses readline for interactive mode; we don't need it
sed -i 's/#include <readline\/readline.h>//' platform/platform_unix.c 2>/dev/null || true
sed -i 's/#include <readline\/history.h>//' platform/platform_unix.c 2>/dev/null || true

# Replace PlatformGetLine to not use readline (simple fgets fallback)
cat > /tmp/platform_patch.c << 'PATCHEOF'
/* Emscripten-compatible PlatformGetLine — no readline */
char *PlatformGetLine(char *Buf, int MaxLen, const char *Prompt)
{
    if (Prompt != NULL)
        printf("%s", Prompt);
    fflush(stdout);
    return fgets(Buf, MaxLen, stdin);
}
PATCHEOF

# Check if PlatformGetLine uses readline and replace it
if grep -q "readline" platform/platform_unix.c; then
    # Remove the existing PlatformGetLine function and replace
    python3 -c "
import re
with open('platform/platform_unix.c', 'r') as f:
    content = f.read()

# Remove readline-based PlatformGetLine
content = re.sub(
    r'char \*PlatformGetLine\(.*?\n\{.*?^\}',
    '',
    content,
    flags=re.MULTILINE | re.DOTALL
)

with open('platform/platform_unix.c', 'w') as f:
    f.write(content)
" 2>/dev/null || true
    cat /tmp/platform_patch.c >> platform/platform_unix.c
fi

# 3. Compile picoc with Emscripten
echo "→ Compiling picoc with emcc..."

mkdir -p "$OUTPUT_DIR"

# Collect all source files
SOURCES="picoc.c table.c lex.c parse.c expression.c heap.c type.c variable.c \
         clibrary.c platform.c include.c debug.c \
         platform/platform_unix.c platform/library_unix.c \
         cstdlib/stdio.c cstdlib/math.c cstdlib/string.c cstdlib/stdlib.c \
         cstdlib/time.c cstdlib/errno.c cstdlib/ctype.c cstdlib/stdbool.c \
         cstdlib/unistd.c"

# Filter out any source files that don't exist (picoc versions vary slightly)
EXISTING_SOURCES=""
for src in $SOURCES; do
    if [ -f "$src" ]; then
        EXISTING_SOURCES="$EXISTING_SOURCES $src"
    else
        echo "  (skipping missing: $src)"
    fi
done

emcc $EXISTING_SOURCES \
  -O2 \
  -DUNIX_HOST \
  -DNO_READLINE \
  -I. \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createPicocModule" \
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
  -o "$OUTPUT_DIR/picoc.js"

# 4. Verify outputs
echo "→ Verifying outputs..."
ls -lh "$OUTPUT_DIR/picoc.js" "$OUTPUT_DIR/picoc.wasm"

WASM_SIZE=$(stat -f%z "$OUTPUT_DIR/picoc.wasm" 2>/dev/null || stat -c%s "$OUTPUT_DIR/picoc.wasm" 2>/dev/null)
echo "→ picoc.wasm size: ${WASM_SIZE} bytes ($(( WASM_SIZE / 1024 )) KB)"

echo "=== picoc ${PICOC_TAG} WASM build complete ==="
