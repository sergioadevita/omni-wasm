# @omni-wasm/powershell

Browser-native **PowerShell** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/powershell';

const runtime = await createRuntime();
const result = await runtime.execute('// your PowerShell code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Comprehensive PS interpreter in Rust via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
