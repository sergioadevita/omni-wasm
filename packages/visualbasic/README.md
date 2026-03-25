# @omni-wasm/visualbasic

Browser-native **Visual Basic .NET** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/visualbasic';

const runtime = await createRuntime();
const result = await runtime.execute('// your Visual Basic .NET code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Extend Mono WASM + Roslyn VB Compiler

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
