# @omni-wasm/haskell

Browser-native **Haskell** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/haskell';

const runtime = await createRuntime();
const result = await runtime.execute('// your Haskell code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

GHC WASM backend (official)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
