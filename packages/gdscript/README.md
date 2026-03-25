# @omni-wasm/gdscript

Browser-native **GDScript** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/gdscript';

const runtime = await createRuntime();
const result = await runtime.execute('// your GDScript code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Comprehensive standalone interpreter in Rust via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
