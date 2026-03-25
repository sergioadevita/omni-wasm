# @omni-wasm/sql

Browser-native **SQL** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/sql';

const runtime = await createRuntime();
const result = await runtime.execute('// your SQL code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

SQLite amalgamation via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
