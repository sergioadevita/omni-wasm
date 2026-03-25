# @omni-wasm/java

Browser-native **Java** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/java';

const runtime = await createRuntime();
const result = await runtime.execute('// your Java code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

Doppio JVM interpreter

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
