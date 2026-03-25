# @omni-wasm/swift

Browser-native **Swift** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/swift';

const runtime = await createRuntime();
const result = await runtime.execute('// your Swift code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

swift-syntax + tree-walking evaluator via SwiftWasm

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
