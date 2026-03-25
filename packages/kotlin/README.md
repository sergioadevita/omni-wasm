# @omni-wasm/kotlin

Browser-native **Kotlin** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/kotlin';

const runtime = await createRuntime();
const result = await runtime.execute('// your Kotlin code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Doppio JVM + kotlinc

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
