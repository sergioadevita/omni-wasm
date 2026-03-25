# @omni-wasm/elixir

Browser-native **Elixir** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/elixir';

const runtime = await createRuntime();
const result = await runtime.execute('// your Elixir code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

AtomVM (BEAM VM) via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
