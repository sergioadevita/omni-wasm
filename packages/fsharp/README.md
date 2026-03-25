# @omni-wasm/fsharp

Browser-native **F#** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/fsharp';

const runtime = await createRuntime();
const result = await runtime.execute('// your F# code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Extend Mono WASM (like C#)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
