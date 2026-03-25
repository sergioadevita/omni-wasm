# @omni-wasm/php

Browser-native **PHP** execution via WebAssembly. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/php';

const runtime = await createRuntime();
const result = await runtime.execute('// your PHP code here');
console.log(result.stdout);
runtime.destroy();
```

## Technology

php-wasm (PHP 8.x via WASM)

## Status

🚧 **Not yet implemented** — scaffold only.

## License

MIT
