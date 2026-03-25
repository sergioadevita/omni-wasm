# @omni-wasm/lua

Browser-native **Lua 5.4.7** execution via WebAssembly. Built from source using Emscripten. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/lua';

const runtime = await createRuntime();
const result = await runtime.execute('print("Hello from Lua!")');
console.log(result.stdout); // "Hello from Lua!\n"
runtime.destroy();
```

## Technology

Lua 5.4.7 compiled from the official C source to WebAssembly via Emscripten 3.1.56. This is our own build — not a third-party wrapper.

**Binary size:** ~250 KB (.wasm)

## Building the WASM Binary

Requires Docker:

```bash
# Build the WASM binary
docker build -t omni-wasm-lua ./packages/lua
docker run --rm -v $(pwd)/packages/lua/dist/wasm:/output omni-wasm-lua

# Build the TypeScript wrapper
cd packages/lua && npm run build
```

Or use the monorepo build tool:

```bash
./tools/build.sh lua
```

## API

Implements the standard `@omni-wasm` `WasmRuntime` interface:

```ts
interface WasmRuntime {
  readonly language: string;      // "lua"
  readonly version: string;       // "Lua 5.4.7 via Emscripten (omni-wasm)"
  readonly ready: boolean;
  execute(code: string, options?: ExecuteOptions): Promise<ExecuteResult>;
  reset(): Promise<void>;
  destroy(): void;
}
```

## Lua Features Supported

- Full Lua 5.4 standard library (string, table, math, coroutine, utf8, os, io)
- Closures and metatables
- Coroutines
- Pattern matching
- Integer/float distinction (Lua 5.4)
- Bitwise operators

## License

MIT
