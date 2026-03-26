# @omni-wasm/cpp

C++ execution in the browser via **JSCPP**, a pure JavaScript C++ interpreter.

- **Zero compilation** — JSCPP interprets C++ code directly
- **Pure JavaScript** — No WASM build needed, works in any browser
- **Lightweight** — ~200 KB library
- **Browser-native** — No server, no API calls

## Features

- iostream (cout, cerr, endl)
- Basic STL (string, vector, arrays)
- Classes, constructors, methods
- Loops (for, while, do-while)
- Conditionals (if/else, switch)
- Functions, recursion
- Pointers (basic support)
- Static members

## Usage

```typescript
import createRuntime from '@omni-wasm/cpp';

const runtime = await createRuntime();
const result = await runtime.execute(`
  #include <iostream>
  #include <string>
  using namespace std;
  
  int main() {
    cout << "Hello from C++" << endl;
    return 0;
  }
`);

console.log(result.stdout); // "Hello from C++\n"
runtime.destroy();
```

## Browser Demo

Open `examples/index.html` in a browser to try C++ directly in your browser.

## Limitations

JSCPP is an interpreter, not a compiler. Some advanced features are not supported:

- Templates (basic templates only)
- Complex STL containers (limited vector, map support)
- Inline assembly
- Custom memory allocation (no new/delete support)
- External C libraries

For production use cases requiring full C++ compliance, consider:
- **@omni-wasm/wasm** (Emscripten + LLVM) — full C++ but larger binary
- **Server-side compilation** — send C++ code to a backend compiler

## API

Implements the standard `WasmRuntime` interface from `@omni-wasm/shared`:

```typescript
interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

interface WasmRuntime {
  language: string;
  version: string;
  ready: boolean;
  execute(code: string, options?: ExecuteOptions): Promise<ExecuteResult>;
  reset(): Promise<void>;
  destroy(): void;
}
```

## Options

```typescript
interface ExecuteOptions {
  timeout?: number;    // Timeout in ms (default: 30000)
  stdin?: string;      // Input to pass to program
  args?: string[];     // Command-line arguments
}

interface RuntimeOptions {
  wasmUrl?: string;              // Custom JSCPP CDN URL
  onProgress?: (percent) => void; // Progress callback
}
```

## Examples

### Hello World

```cpp
#include <iostream>
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}
```

### Classes and Objects

```cpp
#include <iostream>
using namespace std;

class Point {
  public:
    int x, y;
    Point(int px, int py) : x(px), y(py) {}
    void print() {
      cout << "(" << x << ", " << y << ")" << endl;
    }
};

int main() {
  Point p(10, 20);
  p.print();
  return 0;
}
```

### Arrays and Loops

```cpp
#include <iostream>
using namespace std;

int main() {
  int arr[] = {1, 2, 3, 4, 5};
  int sum = 0;
  for (int i = 0; i < 5; i++) {
    sum += arr[i];
  }
  cout << "Sum: " << sum << endl;
  return 0;
}
```

## Technology Stack

- **JSCPP 2.0.3** — JavaScript C++ interpreter
- **Emscripten** (for JSCPP compilation itself)
- **TypeScript** — Type-safe JavaScript

## License

MIT — See LICENSE for details.
