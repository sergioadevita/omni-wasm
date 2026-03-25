# @omni-wasm/c

Browser-native **C** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/c';

const runtime = await createRuntime();
const result = await runtime.execute('// your C code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

TCC (Tiny C Compiler) via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
