# @omni-wasm/nim

Browser-native **Nim** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/nim';

const runtime = await createRuntime();
const result = await runtime.execute('// your Nim code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Nim self-hosted via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
