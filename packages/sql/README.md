# @omni-wasm/sql

Browser-native **SQLite** execution via WebAssembly. Built from the official SQLite amalgamation source. No server required.

## Quick Start

```ts
import createRuntime from '@omni-wasm/sql';

const runtime = await createRuntime();
await runtime.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);');
await runtime.execute("INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');");
const result = await runtime.execute('SELECT * FROM users;');
console.log(result.stdout);
// "1|Alice\n2|Bob\n"
runtime.destroy();
```

## Technology

SQLite amalgamation compiled to WebAssembly via Emscripten 3.1.56. This is our own build — not sql.js or any third-party wrapper.

**Binary size:** ~1.3 MB (.wasm)

**Enabled extensions:** JSON1, FTS5, R*Tree, Math Functions

## Building the WASM Binary

```bash
docker build -t omni-wasm-sql ./packages/sql
docker run --rm -v $(pwd)/packages/sql/dist/wasm:/output omni-wasm-sql
npx tsc -p packages/sql/tsconfig.json
```

## Features

- Full SQLite SQL dialect (DDL, DML, CTEs, window functions, subqueries)
- In-memory database that persists between execute() calls
- JSON1, FTS5 full-text search, R*Tree spatial indexing
- Math functions (sqrt, pow, log, etc.)
- reset() clears the database to a fresh state

## License

MIT
