# @omni-wasm/actionscript

Browser-native **ActionScript** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/actionscript';

const runtime = await createRuntime();
const result = await runtime.execute('// your ActionScript code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Ruffle (Flash emulator WASM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
