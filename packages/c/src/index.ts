import type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
} from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'c',
  name: 'C',
  extensions: ['.c', '.h'],
  binarySize: 200_000, // ~200 KB WASM binary
  tiobeRank: 2,
  tier: 0,
  technology: 'picoc 3.2.2 (C interpreter) via Emscripten (own build)',
};

/**
 * Emscripten module type for the picoc WASM build.
 */
interface PicocEmscriptenModule {
  callMain(args: string[]): number;
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, opts?: { encoding?: string }): string | Uint8Array;
    unlink(path: string): void;
    mkdir(path: string): void;
  };
  print: (text: string) => void;
  printErr: (text: string) => void;
}

type CreatePicocModuleFactory = (
  overrides?: Partial<PicocEmscriptenModule>,
) => Promise<PicocEmscriptenModule>;

const DEFAULT_WASM_JS_URL = new URL('./wasm/picoc.js', import.meta.url).href;

/**
 * Load the Emscripten module factory via script tag (browser) or dynamic import (Node).
 */
async function loadModuleFactory(wasmJsUrl: string): Promise<CreatePicocModuleFactory> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (typeof g.createPicocModule === 'function') {
    return g.createPicocModule as CreatePicocModuleFactory;
  }

  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = wasmJsUrl;
      script.onload = () => {
        const factory = (window as unknown as Record<string, unknown>).createPicocModule;
        if (typeof factory === 'function') {
          resolve(factory as CreatePicocModuleFactory);
        } else {
          reject(new Error('createPicocModule not found after loading script'));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${wasmJsUrl}`));
      document.head.appendChild(script);
    });
  }

  const module = await import(/* @vite-ignore */ wasmJsUrl);
  return module.default ?? module.createPicocModule ?? module;
}

/**
 * Create a C runtime instance.
 *
 * Uses picoc (a small C interpreter) compiled to WASM. picoc interprets C code
 * directly without generating native machine code, making it ideal for running
 * inside a WebAssembly sandbox.
 *
 * Supports: C89/C90 with some C99 features, standard library (stdio, stdlib,
 * string, math), structs, unions, pointers, dynamic memory.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/c';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute(`
 *   #include <stdio.h>
 *   int main() {
 *     printf("Hello from C!\n");
 *     return 0;
 *   }
 * `);
 * console.log(result.stdout); // "Hello from C!\n"
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (
  options?: RuntimeOptions,
): Promise<WasmRuntime> => {
  const wasmJsUrl = options?.wasmUrl ?? DEFAULT_WASM_JS_URL;
  const onProgress = options?.onProgress;

  onProgress?.(0);

  const factory = await loadModuleFactory(wasmJsUrl);

  onProgress?.(30);

  // Mutable callbacks for output capture
  let stdoutCallback: (text: string) => void = () => {};
  let stderrCallback: (text: string) => void = () => {};

  let module: PicocEmscriptenModule | null = null;
  let isReady = false;
  let isDestroyed = false;

  async function initModule(): Promise<PicocEmscriptenModule> {
    const m = await factory({
      print: (text: string) => stdoutCallback(text),
      printErr: (text: string) => stderrCallback(text),
    });
    try {
      m.FS.mkdir('/tmp');
    } catch {
      // Already exists
    }
    return m;
  }

  module = await initModule();
  isReady = true;
  onProgress?.(100);

  const runtime: WasmRuntime = {
    get language() {
      return 'c';
    },

    get version() {
      return 'picoc 3.2.2 via Emscripten (omni-wasm)';
    },

    get ready() {
      return isReady && !isDestroyed;
    },

    async execute(
      code: string,
      execOptions?: ExecuteOptions,
    ): Promise<ExecuteResult> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/c: runtime has been destroyed');
      }
      if (!module) {
        throw new Error('@omni-wasm/c: runtime not initialized');
      }

      const timeout = execOptions?.timeout ?? 30_000;
      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];

      stdoutCallback = (text: string) => {
        stdoutChunks.push(text + '\n');
      };
      stderrCallback = (text: string) => {
        stderrChunks.push(text + '\n');
      };

      // Write C source to a temp file
      const srcPath = '/tmp/_omni_exec.c';
      module.FS.writeFile(srcPath, code);

      const start = performance.now();
      let exitCode = 0;

      try {
        const execPromise = new Promise<number>((resolve) => {
          try {
            // picoc interprets the C source file directly — no native code gen
            const args = [srcPath];
            if (execOptions?.args) {
              args.push(...execOptions.args);
            }
            const result = module!.callMain(args);
            resolve(result ?? 0);
          } catch (err: unknown) {
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
          exitCode = 124;
        } else {
          stderrChunks.push(String(err) + '\n');
          exitCode = 1;
        }
      }

      const duration = performance.now() - start;

      try {
        module.FS.unlink(srcPath);
      } catch {
        // Ignore
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
        throw new Error('@omni-wasm/c: runtime has been destroyed');
      }
      stdoutCallback = () => {};
      stderrCallback = () => {};
      module = await initModule();
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
