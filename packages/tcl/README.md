# @omni-wasm/tcl

Browser-native **Tcl** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/tcl';

const runtime = await createRuntime();
const result = await runtime.execute('// your Tcl code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Wacl (Tcl via Emscripten)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
