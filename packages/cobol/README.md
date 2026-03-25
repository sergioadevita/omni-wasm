# @omni-wasm/cobol

Browser-native **COBOL** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/cobol';

const runtime = await createRuntime();
const result = await runtime.execute('// your COBOL code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

GnuCOBOL via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
