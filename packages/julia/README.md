# @omni-wasm/julia

Browser-native **Julia** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/julia';

const runtime = await createRuntime();
const result = await runtime.execute('// your Julia code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

julia-wasm (full Julia via Emscripten)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
