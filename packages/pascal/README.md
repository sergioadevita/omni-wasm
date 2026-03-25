# @omni-wasm/pascal

Browser-native **Pascal** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/pascal';

const runtime = await createRuntime();
const result = await runtime.execute('// your Pascal code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

pas2js transpiler in browser

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
