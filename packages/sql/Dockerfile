# Build SQLite → WebAssembly
#
# Usage:
#   docker build -t omni-wasm-sql ./packages/sql
#   docker run --rm -v $(pwd)/packages/sql/dist/wasm:/output omni-wasm-sql
#
FROM emscripten/emsdk:3.1.56

RUN apt-get update -qq && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY build.sh /build/build.sh
RUN chmod +x /build/build.sh
RUN /build/build.sh

CMD ["cp", "-r", "/build/output/.", "/output/"]
