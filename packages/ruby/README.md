# @omni-wasm/ruby

Browser-native Ruby execution via WebAssembly. No server required.

Built on [ruby.wasm](https://github.com/ruby/ruby.wasm) — the official Ruby WebAssembly build from the Ruby team.

## Features

- **No server needed** — Ruby code runs directly in the browser
- **Full standard library** — Access to Time, JSON, CSV, Regexp, Enumerator, and more
- **Small download** — ~15 MB WASM binary (cached after first load)
- **Production-ready** — Based on CRuby 3.2 compiled to WASI

## Installation

```bash
npm install @omni-wasm/ruby
```

## Quick Start

```typescript
import createRuntime from '@omni-wasm/ruby';

const runtime = await createRuntime();

const result = await runtime.execute(`
  puts "Hello from Ruby!"
  
  numbers = [1, 2, 3, 4, 5]
  squares = numbers.map { |n| n ** 2 }
  puts squares.inspect
`);

console.log(result.stdout);
// Output:
// Hello from Ruby!
// [1, 4, 9, 16, 25]

runtime.destroy();
```

## API

### `createRuntime(options?: RuntimeOptions): Promise<WasmRuntime>`

Creates and initializes a Ruby runtime instance.

```typescript
const runtime = await createRuntime({
  wasmUrl: 'https://cdn.example.com/ruby.wasm', // Optional: custom CDN
  onProgress: (percent) => console.log(`Loading: ${percent}%`),
});
```

### `runtime.execute(code: string, options?: ExecuteOptions): Promise<ExecuteResult>`

Executes Ruby code and returns the result.

```typescript
const result = await runtime.execute(`
  class Person
    def initialize(name)
      @name = name
    end
    
    def greet
      "Hello, I'm #{@name}"
    end
  end
  
  person = Person.new("Alice")
  puts person.greet
`);

// ExecuteResult:
// {
//   stdout: "Hello, I'm Alice\n",
//   stderr: "",
//   exitCode: 0,
//   duration: 42.5
// }
```

### `runtime.reset(): Promise<void>`

Resets the runtime state (clears variables, resets globals).

```typescript
await runtime.reset();
```

### `runtime.destroy(): void`

Frees all resources and shuts down the runtime.

```typescript
runtime.destroy();
```

## Example: HTML Demo

```html
<!DOCTYPE html>
<html>
<head>
  <title>Ruby WASM Demo</title>
</head>
<body>
  <textarea id="code">puts "Hello from Ruby in the browser!"</textarea>
  <button onclick="run()">Run</button>
  <pre id="output"></pre>

  <script type="module">
    import createRuntime from '@omni-wasm/ruby';

    let runtime;

    window.run = async () => {
      if (!runtime) {
        runtime = await createRuntime();
      }

      const code = document.getElementById('code').value;
      const result = await runtime.execute(code);

      document.getElementById('output').textContent = 
        result.stdout + 
        (result.stderr ? '\nERROR:\n' + result.stderr : '');
    };
  </script>
</body>
</html>
```

## Supported Ruby Features

- **Classes and Modules** — Full OOP support
- **Blocks, Procs, and Lambdas** — Functional programming
- **Arrays and Hashes** — Collections with standard methods
- **String Interpolation** — `"Hello, #{name}!"`
- **Regular Expressions** — `/pattern/` syntax
- **Exception Handling** — `begin/rescue/ensure`
- **Enumerable** — `.map`, `.select`, `.reduce`, etc.
- **Time** — Time manipulation
- **JSON** — `require 'json'`
- **CSV** — `require 'csv'`
- **Math** — `require 'math'`

## Limitations

- **No File I/O** — File system access is limited to WASI sandbox
- **No Network** — Cannot make HTTP requests
- **No C Extensions** — Ruby gems with native code won't work
- **Single-threaded** — No `Thread` support
- **Limited Stdlib** — Some stdlib modules not included (can be added)

## Performance

- **Initial load** — ~2-5 seconds (includes fetching and compiling 15 MB WASM)
- **Execution** — 10-100ms per eval (comparable to CPython via Pyodide)
- **Memory** — ~50-100 MB after initialization

## Caching

By default, the WASM binary is cached in IndexedDB after the first load. Subsequent calls to `createRuntime()` will load much faster. Disable with:

```typescript
const runtime = await createRuntime({ enableCache: false });
```

## How It Works

1. **Fetch WASM** — Downloads ruby.wasm from CDN (~15 MB)
2. **Compile** — WebAssembly.compile() compiles the binary
3. **Initialize** — ruby-wasm's loader sets up the Ruby VM
4. **Evaluate** — Code is executed via `vm.eval()`
5. **Capture Output** — stdout/stderr captured via StringIO

## Browser Support

- Chrome 74+
- Firefox 75+
- Safari 14.1+
- Edge 79+

## License

MIT

## See Also

- [ruby.wasm Documentation](https://ruby.github.io/ruby.wasm/)
- [@omni-wasm](https://github.com/sergioadevita/omni-wasm) — Multi-language WASM runtimes
- [Pyodide](https://pyodide.org/) — Python WASM runtime
