# Build picoc (C interpreter) → WebAssembly
#
# Usage:
#   docker build -t omni-wasm-c ./packages/c
#   docker run --rm -v $(pwd)/packages/c/dist/wasm:/output omni-wasm-c
#
FROM emscripten/emsdk:3.1.56

RUN apt-get update -qq && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY build.sh /build/build.sh
RUN chmod +x /build/build.sh
RUN /build/build.sh

CMD ["cp", "-r", "/build/output/.", "/output/"]
