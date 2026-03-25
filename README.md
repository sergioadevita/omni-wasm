# omni-wasm

Browser-native WASM runtimes for **every programming language**. No server required.

## What is this?

A monorepo containing 45 independent npm packages — one for every programming language — that execute code entirely in the browser via WebAssembly. Zero backend, zero cloud, zero dependencies on third-party WASM binaries. Every runtime is built from source.

## Quick Start

```ts
import createRuntime from '@omni-wasm/python';

const runtime = await createRuntime();
const result = await runtime.execute('print("Hello from Python in the browser!")');
console.log(result.stdout); // "Hello from Python in the browser!\n"
runtime.destroy();
```

## Packages

Every package exports the same API: `createRuntime()` → `execute()` → `destroy()`.

| Package | Language | Status |
|---------|----------|--------|
| `@omni-wasm/python` | Python | 🚧 |
| `@omni-wasm/lua` | Lua | 🚧 |
| `@omni-wasm/sql` | SQL | 🚧 |
| `@omni-wasm/c` | C | 🚧 |
| `@omni-wasm/cpp` | C++ | 🚧 |
| `@omni-wasm/ruby` | Ruby | 🚧 |
| `@omni-wasm/java` | Java | 🚧 |
| `@omni-wasm/go` | Go | 🚧 |
| `@omni-wasm/rust` | Rust | 🚧 |
| ... | 36 more | 🚧 |

See [`packages/`](./packages/) for all 45 languages.

## Standard API

Every `@omni-wasm/*` package implements this interface:

```ts
interface WasmRuntime {
  readonly language: string;
  readonly version: string;
  readonly ready: boolean;
  execute(code: string, options?: ExecuteOptions): Promise<ExecuteResult>;
  reset(): Promise<void>;
  destroy(): void;
}
```

## Building

```bash
npm install          # Install dependencies
npm run build        # Build all TypeScript wrappers
./tools/build.sh lua # Build a specific WASM runtime
./tools/build.sh --all # Build all WASM runtimes (requires Docker)
```

## License

MIT
