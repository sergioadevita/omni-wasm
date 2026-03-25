# @omni-wasm/dart

Browser-native **Dart** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/dart';

const runtime = await createRuntime();
const result = await runtime.execute('// your Dart code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

dart2js compiler in JS sandbox

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
