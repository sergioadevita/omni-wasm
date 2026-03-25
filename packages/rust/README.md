# @omni-wasm/rust

Browser-native **Rust** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/rust';

const runtime = await createRuntime();
const result = await runtime.execute('// your Rust code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Miri/Rubri MIR interpreter via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
