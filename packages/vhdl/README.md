# @omni-wasm/vhdl

Browser-native **VHDL** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/vhdl';

const runtime = await createRuntime();
const result = await runtime.execute('// your VHDL code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Comprehensive VHDL-93 simulator in Rust via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
