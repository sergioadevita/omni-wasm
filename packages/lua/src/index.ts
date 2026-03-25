import type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
} from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'lua',
  name: 'Lua',
  extensions: ['.lua'],
  binarySize: 250_000, // ~250 KB WASM binary
  tiobeRank: 30,
  tier: 0,
  technology: 'Lua 5.4.7 via Emscripten (own build)',
};

/**
 * Emscripten module type for the Lua WASM build.
 * This matches the shape produced by emcc with MODULARIZE=1.
 */
interface LuaEmscriptenModule {
  callMain(args: string[]): number;
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, opts?: { encoding?: string }): string | Uint8Array;
    unlink(path: string): void;
    mkdir(path: string): void;
    stat(path: string): unknown;
  };
  _malloc(size: number): number;
  _free(ptr: number): void;
  ccall(
    ident: string,
    returnType: string | null,
    argTypes: string[],
    args: unknown[],
  ): unknown;
  print: (text: string) => void;
  printErr: (text: string) => void;
}

type CreateLuaModuleFactory = (
  overrides?: Partial<LuaEmscriptenModule>,
) => Promise<LuaEmscriptenModule>;

// Default path to the WASM JS glue (relative to where the package is served from)
const DEFAULT_WASM_JS_URL = new URL('./wasm/lua.js', import.meta.url).href;

/**
 * Load the Emscripten module factory.
 *
 * Emscripten's MODULARIZE output creates a global `createLuaModule` variable
 * with CommonJS/AMD fallbacks — but no ES module export. We load it via
 * a script tag (browser) or require (Node), then grab the global.
 */
async function loadModuleFactory(wasmJsUrl: string): Promise<CreateLuaModuleFactory> {
  // Check if already loaded on globalThis (e.g. from a previous call)
  const g = globalThis as unknown as Record<string, unknown>;
  if (typeof g.createLuaModule === 'function') {
    return g.createLuaModule as CreateLuaModuleFactory;
  }

  // Browser: load via script tag so the var lands on window
  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = wasmJsUrl;
      script.onload = () => {
        const factory = (window as unknown as Record<string, unknown>).createLuaModule;
        if (typeof factory === 'function') {
          resolve(factory as CreateLuaModuleFactory);
        } else {
          reject(new Error('createLuaModule not found after loading script'));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${wasmJsUrl}`));
      document.head.appendChild(script);
    });
  }

  // Node.js / Worker fallback: dynamic import (CommonJS module.exports)
  const module = await import(/* @vite-ignore */ wasmJsUrl);
  return module.default ?? module.createLuaModule ?? module;
}

/**
 * Create a Lua runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/lua';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('print("Hello from Lua!")');
 * console.log(result.stdout); // "Hello from Lua!\n"
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (
  options?: RuntimeOptions,
): Promise<WasmRuntime> => {
  const wasmJsUrl = options?.wasmUrl ?? DEFAULT_WASM_JS_URL;
  const onProgress = options?.onProgress;

  onProgress?.(0);

  // Load the Emscripten factory
  const factory = await loadModuleFactory(wasmJsUrl);

  onProgress?.(30);

  // We'll create a fresh module instance for each runtime.
  // Mutable callbacks that we swap per execute() call to capture output.
  // Emscripten binds print/printErr at init time, so we use indirection.
  let stdoutCallback: (text: string) => void = () => {};
  let stderrCallback: (text: string) => void = () => {};

  let module: LuaEmscriptenModule | null = null;
  let isReady = false;
  let isDestroyed = false;

  // Initialize the module with delegating print functions
  module = await factory({
    print: (text: string) => stdoutCallback(text),
    printErr: (text: string) => stderrCallback(text),
  });

  // Create /tmp for script files
  try {
    module.FS.mkdir('/tmp');
  } catch {
    // Already exists — that's fine
  }

  isReady = true;
  onProgress?.(100);

  const runtime: WasmRuntime = {
    get language() {
      return 'lua';
    },

    get version() {
      return 'Lua 5.4.7 via Emscripten (omni-wasm)';
    },

    get ready() {
      return isReady && !isDestroyed;
    },

    async execute(
      code: string,
      execOptions?: ExecuteOptions,
    ): Promise<ExecuteResult> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/lua: runtime has been destroyed');
      }
      if (!module) {
        throw new Error('@omni-wasm/lua: runtime not initialized');
      }

      const timeout = execOptions?.timeout ?? 30_000;
      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];

      // Point the mutable callbacks to our capture arrays
      stdoutCallback = (text: string) => {
        stdoutChunks.push(text + '\n');
      };
      stderrCallback = (text: string) => {
        stderrChunks.push(text + '\n');
      };

      // Write the Lua code to a temp file in the virtual filesystem
      const scriptPath = '/tmp/_omni_exec.lua';
      module.FS.writeFile(scriptPath, code);

      // If stdin is provided, write it to a file and set up redirection
      if (execOptions?.stdin) {
        module.FS.writeFile('/tmp/_omni_stdin.txt', execOptions.stdin);
      }

      const start = performance.now();
      let exitCode = 0;

      try {
        // Execute with a timeout using Promise.race
        const execPromise = new Promise<number>((resolve) => {
          try {
            // callMain runs the Lua interpreter with the script file as argument
            const args = [scriptPath];
            if (execOptions?.args) {
              args.push(...execOptions.args);
            }
            const result = module!.callMain(args);
            resolve(result ?? 0);
          } catch (err: unknown) {
            // Emscripten throws on non-zero exit. Extract exit code if available.
            if (err && typeof err === 'object' && 'status' in err) {
              resolve((err as { status: number }).status);
            } else {
              stderrChunks.push(String(err) + '\n');
              resolve(1);
            }
          }
        });

        const timeoutPromise = new Promise<number>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Execution timed out after ${timeout}ms`)),
            timeout,
          );
        });

        exitCode = await Promise.race([execPromise, timeoutPromise]);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('timed out')) {
          stderrChunks.push(err.message + '\n');
          exitCode = 124; // Standard timeout exit code
        } else {
          stderrChunks.push(String(err) + '\n');
          exitCode = 1;
        }
      }

      const duration = performance.now() - start;

      // Clean up temp files
      try {
        module.FS.unlink(scriptPath);
      } catch {
        // Ignore cleanup errors
      }
      try {
        module.FS.unlink('/tmp/_omni_stdin.txt');
      } catch {
        // Ignore cleanup errors
      }

      return {
        stdout: stdoutChunks.join(''),
        stderr: stderrChunks.join(''),
        exitCode,
        duration,
      };
    },

    async reset(): Promise<void> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/lua: runtime has been destroyed');
      }

      // To truly reset Lua state, we re-instantiate the module.
      // This is the cleanest approach — Lua's C API doesn't have a "reset all globals" call.
      stdoutCallback = () => {};
      stderrCallback = () => {};
      module = await factory({
        print: (text: string) => stdoutCallback(text),
        printErr: (text: string) => stderrCallback(text),
      });

      try {
        module.FS.mkdir('/tmp');
      } catch {
        // Already exists
      }
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;
      isReady = false;
      module = null;
    },
  };

  return runtime;
};

export default createRuntime;
export type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
};
