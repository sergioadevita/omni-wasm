#!/bin/bash
# Download Pyodide (CPython 3.12 compiled to WASM) artifacts.
#
# Pyodide is CPython built from source to WebAssembly by the Python community.
# Instead of compiling CPython ourselves (which takes 30+ minutes and needs
# heavy Docker setup), we use the pre-built Pyodide distribution.
#
# The runtime (src/index.ts) loads Pyodide from CDN by default, so these
# local artifacts are only needed for offline/self-hosted usage.
#
# Output: dist/wasm/pyodide.js, pyodide.asm.js, pyodide.asm.wasm, etc.
#
set -euo pipefail

PYODIDE_VERSION="0.26.4"
CDN_BASE="https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full"
OUTPUT_DIR="dist/wasm"

echo "=== Downloading Pyodide ${PYODIDE_VERSION} (CPython 3.12 → WASM) ==="

mkdir -p "$OUTPUT_DIR"

# Core files needed for the runtime
CORE_FILES=(
  "pyodide.js"
  "pyodide.asm.js"
  "pyodide.asm.wasm"
  "pyodide-lock.json"
  "python_stdlib.zip"
)

for file in "${CORE_FILES[@]}"; do
  echo "→ Downloading ${file}..."
  curl -sSL "${CDN_BASE}/${file}" -o "${OUTPUT_DIR}/${file}"
  SIZE=$(du -h "${OUTPUT_DIR}/${file}" | cut -f1)
  echo "  ✓ ${file} (${SIZE})"
done

echo ""
echo "=== Pyodide ${PYODIDE_VERSION} downloaded ==="
ls -lh "$OUTPUT_DIR/"
echo ""
echo "Total size:"
du -sh "$OUTPUT_DIR/"
