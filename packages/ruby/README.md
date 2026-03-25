# @omni-wasm/ruby

Browser-native **Ruby** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/ruby';

const runtime = await createRuntime();
const result = await runtime.execute('// your Ruby code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

CRuby (MRI) via WASI

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
