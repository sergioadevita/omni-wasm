# @omni-wasm/octave

Browser-native **MATLAB / Octave** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/octave';

const runtime = await createRuntime();
const result = await runtime.execute('// your MATLAB / Octave code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Full GNU Octave via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
