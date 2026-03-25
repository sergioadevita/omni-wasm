# @omni-wasm/perl

Browser-native **Perl** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/perl';

const runtime = await createRuntime();
const result = await runtime.execute('// your Perl code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

WebPerl (Perl 5 via WASM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
