# @omni-wasm/r

Browser-native **R** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/r';

const runtime = await createRuntime();
const result = await runtime.execute('// your R code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

webR (full R via WASM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
