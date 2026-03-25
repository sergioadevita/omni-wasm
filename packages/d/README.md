# @omni-wasm/d

Browser-native **D** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/d';

const runtime = await createRuntime();
const result = await runtime.execute('// your D code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

LDC compiler (LLVM WASM target)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
