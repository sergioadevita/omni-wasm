# @omni-wasm/python

Browser-native **Python** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/python';

const runtime = await createRuntime();
const result = await runtime.execute('// your Python code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

CPython 3.12 via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
