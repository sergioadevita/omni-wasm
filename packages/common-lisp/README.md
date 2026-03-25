# @omni-wasm/common-lisp

Browser-native **Common Lisp** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/common-lisp';

const runtime = await createRuntime();
const result = await runtime.execute('// your Common Lisp code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

JSCL (CL to JS compiler)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
