# @omni-wasm/clojure

Browser-native **Clojure** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/clojure';

const runtime = await createRuntime();
const result = await runtime.execute('// your Clojure code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

ClojureScript self-hosted

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
