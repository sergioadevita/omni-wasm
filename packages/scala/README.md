# @omni-wasm/scala

Browser-native **Scala** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/scala';

const runtime = await createRuntime();
const result = await runtime.execute('// your Scala code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Scala.js self-hosted compiler

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
