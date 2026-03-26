#!/bin/bash
# Download JSCPP (JavaScript C++ interpreter) for offline use.
#
# JSCPP is a pure JavaScript library, so we're just downloading the minified
# version from CDN. The runtime (src/index.ts) loads it from CDN by default,
# so these local artifacts are only needed for offline/self-hosted usage.
#
# Output: dist/jscpp/JSCPP.es5.min.js
#
set -euo pipefail

JSCPP_VERSION="2.0.3"
CDN_BASE="https://cdn.jsdelivr.net/npm/JSCPP@${JSCPP_VERSION}/dist"
OUTPUT_DIR="dist/jscpp"

echo "=== Downloading JSCPP ${JSCPP_VERSION} (JavaScript C++ interpreter) ==="

mkdir -p "$OUTPUT_DIR"

# Core file needed for the runtime
echo "→ Downloading JSCPP.es5.min.js..."
curl -sSL "${CDN_BASE}/JSCPP.es5.min.js" -o "${OUTPUT_DIR}/JSCPP.es5.min.js"
SIZE=$(du -h "${OUTPUT_DIR}/JSCPP.es5.min.js" | cut -f1)
echo "  ✓ JSCPP.es5.min.js (${SIZE})"

echo ""
echo "=== JSCPP ${JSCPP_VERSION} downloaded ==="
ls -lh "$OUTPUT_DIR/"
echo ""
echo "Total size:"
du -sh "$OUTPUT_DIR/"
