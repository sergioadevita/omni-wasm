import type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
} from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'cpp',
  name: 'C++',
  extensions: ['.cpp', '.hpp', '.cc', '.cxx'],
  binarySize: 200_000, // ~200 KB JSCPP library
  tiobeRank: 3,
  tier: 0,
  technology: 'JSCPP pure JavaScript interpreter',
};

/**
 * JSCPP library type (subset we use).
 */
interface JSCPPLibrary {
  run(
    code: string,
    input: string,
    options?: {
      stdio?: {
        write?: (text: string) => void;
        read?: () => string;
      };
      timeout?: number;
      callback?: (exitCode: number) => void;
    },
  ): number;
  version?: string;
}

const DEFAULT_CDN_URL = 'https://cdn.jsdelivr.net/npm/JSCPP@2.0.3/dist/JSCPP.es5.min.js';

/**
 * Load the JSCPP library (browser via script tag or Node via dynamic import).
 */
async function loadJSCPP(cdnUrl: string): Promise<JSCPPLibrary> {
  const g = globalThis as unknown as Record<string, unknown>;

  // Already loaded?
  if (typeof g.JSCPP === 'object' && g.JSCPP !== null) {
    return g.JSCPP as JSCPPLibrary;
  }

  // Browser: load via script tag
  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = cdnUrl;
      script.onload = () => {
        const lib = (window as unknown as Record<string, unknown>).JSCPP;
        if (typeof lib === 'object' && lib !== null) {
          resolve(lib as JSCPPLibrary);
        } else {
          reject(new Error('JSCPP not found after loading script'));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load JSCPP from ${cdnUrl}`));
      document.head.appendChild(script);
    });
  }

  // Node: try dynamic import
  try {
    const mod = await import(/* @vite-ignore */ cdnUrl) as Record<string, unknown>;
    const lib = mod.default ?? mod.JSCPP ?? mod;
    if (lib && typeof lib === 'object') {
      return lib as JSCPPLibrary;
    }
  } catch {
    // Fall through to error
  }

  throw new Error('JSCPP could not be loaded');
}

/**
 * Create a C++ runtime instance.
 *
 * Uses JSCPP, a pure JavaScript C++ interpreter that works directly in the browser.
 * Supports: iostream, basic classes, arrays, vectors, loops, pointers, basic STL.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/cpp';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute(`
 *   #include <iostream>
 *   using namespace std;
 *   int main() {
 *     cout << "Hello from C++" << endl;
 *     return 0;
 *   }
 * `);
 * console.log(result.stdout); // "Hello from C++\n"
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (
  options?: RuntimeOptions,
): Promise<WasmRuntime> => {
  const cdnUrl = options?.wasmUrl ?? DEFAULT_CDN_URL;
  const onProgress = options?.onProgress;

  onProgress?.(0);

  const jscpp = await loadJSCPP(cdnUrl);

  onProgress?.(100);

  let isDestroyed = false;
  const isReady = true;

  const runtime: WasmRuntime = {
    get language() {
      return 'cpp';
    },

    get version() {
      return `C++ via JSCPP 2.0.3 (omni-wasm)`;
    },

    get ready() {
      return isReady && !isDestroyed;
    },

    async execute(
      code: string,
      execOptions?: ExecuteOptions,
    ): Promise<ExecuteResult> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/cpp: runtime has been destroyed');
      }

      const timeout = execOptions?.timeout ?? 30_000;
      const stdin = execOptions?.stdin ?? '';
      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];

      const start = performance.now();
      let exitCode = 0;

      try {
        const stdoutWrite = (text: string) => {
          stdoutChunks.push(text);
        };

        const execPromise = new Promise<number>((resolve) => {
          let timedOut = false;
          const timeoutHandle = setTimeout(() => {
            timedOut = true;
          }, timeout);

          try {
            const result = jscpp.run(code, stdin, {
              stdio: {
                write: stdoutWrite,
              },
            });

            clearTimeout(timeoutHandle);

            if (timedOut) {
              stderrChunks.push(`Execution timed out after ${timeout}ms\n`);
              resolve(124);
            } else {
              resolve(typeof result === 'number' ? result : 0);
            }
          } catch (err: unknown) {
            clearTimeout(timeoutHandle);
            let msg = String(err);

            // JSCPP-specific error messages
            if (err instanceof Error) {
              msg = err.message;
            }

            stderrChunks.push(msg + '\n');
            resolve(1);
          }
        });

        exitCode = await execPromise;
      } catch (err: unknown) {
        stderrChunks.push(String(err) + '\n');
        exitCode = 1;
      }

      const duration = performance.now() - start;

      return {
        stdout: stdoutChunks.join(''),
        stderr: stderrChunks.join(''),
        exitCode,
        duration,
      };
    },

    async reset(): Promise<void> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/cpp: runtime has been destroyed');
      }
      // JSCPP is stateless per-run, no reset needed
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;
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
