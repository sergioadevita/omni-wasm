# @omni-wasm/ada

Browser-native **Ada** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/ada';

const runtime = await createRuntime();
const result = await runtime.execute('// your Ada code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

AdaWebPack (GNAT via WASM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
