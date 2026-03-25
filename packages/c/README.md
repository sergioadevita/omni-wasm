# @omni-wasm/c

Browser-native **C** interpretation and execution via WebAssembly. Uses picoc (a small C interpreter) built from source. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/c';

const runtime = await createRuntime();
const result = await runtime.execute(`
  #include <stdio.h>
  int main() {
    printf("Hello from C!\\n");
    return 0;
  }
`);
console.log(result.stdout); // "Hello from C!\n"
runtime.destroy();
```

## Technology

picoc 3.2.2 compiled to WASM via Emscripten. picoc is a very small C interpreter originally designed for embedded systems. It interprets C code directly — no native code generation — making it safe to run inside a WebAssembly sandbox.

**Binary size:** ~200 KB (.wasm)

## Building

```bash
docker build -t omni-wasm-c ./packages/c
docker run --rm -v $(pwd)/packages/c/dist/wasm:/output omni-wasm-c
npx tsc -p packages/c/tsconfig.json
```

## C Features Supported

- C89/C90 standard with some C99 extensions
- Standard library: stdio, stdlib, string, math, ctype, time
- Structs, unions, enums, typedefs
- Pointers and dynamic memory (malloc/free)
- Function pointers and callbacks
- #include and #define preprocessor directives

## Limitations

picoc is an interpreter, not a full compiler. Some advanced C features are not supported:

- Complex preprocessor macros with token pasting
- Bitfields (partial support)
- Some C99/C11 features (VLAs, designated initializers)
- Full POSIX API

For most educational and interactive use cases, picoc covers the essential C language features well.

## License

MIT
