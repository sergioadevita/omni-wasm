# @omni-wasm/bash

Browser-native **Bash** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/bash';

const runtime = await createRuntime();
const result = await runtime.execute('// your Bash code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

bash source via Emscripten

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
