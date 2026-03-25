# Build Lua 5.4 → WebAssembly
#
# Usage:
#   docker build -t omni-wasm-lua ./packages/lua
#   docker run --rm -v $(pwd)/packages/lua/dist/wasm:/build/output omni-wasm-lua
#
FROM emscripten/emsdk:3.1.56

WORKDIR /build

COPY build.sh /build/build.sh
RUN chmod +x /build/build.sh
RUN /build/build.sh

CMD ["cp", "-r", "/build/output/.", "/output/"]
