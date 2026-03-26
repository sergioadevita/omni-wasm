# Download Pyodide (CPython 3.12 → WASM) artifacts for offline use.
#
# NOTE: This Dockerfile is provided for consistency with other packages but
# is NOT required. The Python runtime loads Pyodide from CDN by default.
# Use build.sh directly for a simpler download.
#
# Usage:
#   docker build -t omni-wasm-python ./packages/python
#   docker run --rm -v $(pwd)/packages/python/dist/wasm:/output omni-wasm-python
#
FROM alpine:3.19

RUN apk add --no-cache curl bash

WORKDIR /build

COPY build.sh /build/build.sh
RUN chmod +x /build/build.sh
RUN /build/build.sh

CMD ["cp", "-r", "/build/dist/wasm/.", "/output/"]
