# @omni-wasm/assembly

Browser-native **Assembly** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/assembly';

const runtime = await createRuntime();
const result = await runtime.execute('// your Assembly code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

v86 x86 emulator (JS/WASM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
