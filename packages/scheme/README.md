# @omni-wasm/scheme

Browser-native **Scheme** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/scheme';

const runtime = await createRuntime();
const result = await runtime.execute('// your Scheme code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

BiwaScheme (pure JS)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
