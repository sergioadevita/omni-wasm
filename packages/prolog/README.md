# @omni-wasm/prolog

Browser-native **Prolog** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/prolog';

const runtime = await createRuntime();
const result = await runtime.execute('// your Prolog code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Tau Prolog (pure JS)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
