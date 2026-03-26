# @omni-wasm/python

Browser-native **Python** execution via WebAssembly. CPython 3.12 via Pyodide. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/python';

const runtime = await createRuntime();
const result = await runtime.execute(`
  import json
  data = {"language": "Python", "runtime": "CPython 3.12"}
  print(json.dumps(data, indent=2))
`);
console.log(result.stdout);
runtime.destroy();
```

## Technology

Uses [Pyodide](https://pyodide.org/) — CPython 3.12 compiled to WebAssembly via Emscripten by the Python community. The WASM binary is loaded from Pyodide's CDN by default (~7.5 MB).

For offline/self-hosted usage, run `bash build.sh` to download the Pyodide artifacts locally.

## Building

```bash
# Download Pyodide WASM artifacts for offline use (optional — CDN is used by default)
bash packages/python/build.sh

# Compile TypeScript
npx tsc -p packages/python/tsconfig.json
```

## Standard Library

Most of CPython's stdlib is available, including: math, json, re, collections, itertools, functools, dataclasses, typing, string, textwrap, datetime, calendar, random, statistics, pathlib, io, os.path, struct, hashlib, base64, copy, pprint, operator, enum, abc, contextlib, decimal, fractions.

Modules that require OS/network access (socket, multiprocessing, threading, tkinter, curses, dbm) are not available in the browser environment.

## License

MIT
