# @omni-wasm/go

Browser-native **Go** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/go';

const runtime = await createRuntime();
const result = await runtime.execute('// your Go code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Yaegi interpreter via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
