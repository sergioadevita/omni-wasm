# @omni-wasm/ocaml

Browser-native **OCaml** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/ocaml';

const runtime = await createRuntime();
const result = await runtime.execute('// your OCaml code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

OCaml toplevel via WASM

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
