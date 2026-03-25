# @omni-wasm/cpp

Browser-native **C++** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/cpp';

const runtime = await createRuntime();
const result = await runtime.execute('// your C++ code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

TCC extended or Cling via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
