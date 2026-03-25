# @omni-wasm/erlang

Browser-native **Erlang** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/erlang';

const runtime = await createRuntime();
const result = await runtime.execute('// your Erlang code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

AtomVM (shared with Elixir)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
