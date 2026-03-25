# @omni-wasm/smalltalk

Browser-native **Smalltalk** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/smalltalk';

const runtime = await createRuntime();
const result = await runtime.execute('// your Smalltalk code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

SqueakJS (pure JS VM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
