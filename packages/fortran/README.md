# @omni-wasm/fortran

Browser-native **Fortran** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/fortran';

const runtime = await createRuntime();
const result = await runtime.execute('// your Fortran code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

f2c translator via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
