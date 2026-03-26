# Download JSCPP (JavaScript C++ interpreter) artifacts for offline use.
#
# NOTE: This Dockerfile is provided for consistency with other packages but
# is NOT required. The C++ runtime loads JSCPP from CDN by default.
# Use build.sh directly for a simpler download.
#
# Usage:
#   docker build -t omni-wasm-cpp ./packages/cpp
#   docker run --rm -v $(pwd)/packages/cpp/dist/jscpp:/output omni-wasm-cpp
#
FROM alpine:3.19

RUN apk add --no-cache curl bash

WORKDIR /build

COPY build.sh /build/build.sh
RUN chmod +x /build/build.sh
RUN /build/build.sh

CMD ["cp", "-r", "/build/dist/jscpp/.", "/output/"]
