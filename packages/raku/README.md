# @omni-wasm/raku

Browser-native **Raku** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/raku';

const runtime = await createRuntime();
const result = await runtime.execute('// your Raku code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Rakudo.js (official JS backend)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
