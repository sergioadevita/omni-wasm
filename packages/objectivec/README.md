# @omni-wasm/objectivec

Browser-native **Objective-C** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/objectivec';

const runtime = await createRuntime();
const result = await runtime.execute('// your Objective-C code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

GNUstep 2.2 + libobjc2 via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
