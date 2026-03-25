# @omni-wasm/lua

Browser-native **Lua** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/lua';

const runtime = await createRuntime();
const result = await runtime.execute('// your Lua code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Lua 5.4 source via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
