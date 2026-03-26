import type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
} from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'python',
  name: 'Python',
  extensions: ['.py', '.pyw'],
  binarySize: 7_500_000, // ~7.5 MB WASM binary (Pyodide core)
  tiobeRank: 1,
  tier: 0,
  technology: 'CPython 3.12 via Pyodide + Emscripten',
};

/**
 * Pyodide API types (subset we use).
 */
interface PyodideInterface {
  runPython(code: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  loadPackage(packages: string | string[]): Promise<void>;
  globals: { get(name: string): unknown; set(name: string, value: unknown): void };
  version: string;
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, opts?: { encoding?: string }): string | Uint8Array;
    unlink(path: string): void;
    mkdir(path: string): void;
  };
}

type LoadPyodideFn = (config?: {
  indexURL?: string;
  stdout?: (text: string) => void;
  stderr?: (text: string) => void;
  fullStdLib?: boolean;
}) => Promise<PyodideInterface>;

const PYODIDE_VERSION = '0.26.4';
const DEFAULT_CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/**
 * Load the Pyodide loader script (loadPyodide function).
 */
async function loadPyodideLoader(indexURL: string): Promise<LoadPyodideFn> {
  const g = globalThis as unknown as Record<string, unknown>;

  // Already loaded?
  if (typeof g.loadPyodide === 'function') {
    return g.loadPyodide as LoadPyodideFn;
  }

  // Browser: load via script tag
  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${indexURL}pyodide.js`;
      script.onload = () => {
        const fn = (window as unknown as Record<string, unknown>).loadPyodide;
        if (typeof fn === 'function') {
          resolve(fn as LoadPyodideFn);
        } else {
          reject(new Error('loadPyodide not found after loading script'));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load Pyodide from ${indexURL}`));
      document.head.appendChild(script);
    });
  }

  // Node: dynamic import
  const module = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
  return module.loadPyodide ?? module.default;
}

/**
 * Python code injected to set up stdout/stderr capture.
 * Uses a StringIO-based approach that cleanly captures all print() output.
 */
const CAPTURE_SETUP = `
import sys as _omni_sys
import io as _omni_io

class _OmniCapture:
    def __init__(self):
        self.stdout = _omni_io.StringIO()
        self.stderr = _omni_io.StringIO()
        self._orig_stdout = _omni_sys.stdout
        self._orig_stderr = _omni_sys.stderr

    def start(self):
        self.stdout.truncate(0)
        self.stdout.seek(0)
        self.stderr.truncate(0)
        self.stderr.seek(0)
        _omni_sys.stdout = self.stdout
        _omni_sys.stderr = self.stderr

    def stop(self):
        _omni_sys.stdout = self._orig_stdout
        _omni_sys.stderr = self._orig_stderr

    def get_stdout(self):
        return self.stdout.getvalue()

    def get_stderr(self):
        return self.stderr.getvalue()

_omni_capture = _OmniCapture()
`;

/**
 * Create a Python runtime instance.
 *
 * Uses CPython compiled to WASM via Pyodide. Runs Python code in the
 * browser with access to the standard library (math, json, re, collections, etc.).
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/python';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute(`
 *   import json
 *   data = {"language": "Python", "runtime": "CPython 3.12"}
 *   print(json.dumps(data, indent=2))
 * `);
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (
  options?: RuntimeOptions,
): Promise<WasmRuntime> => {
  const indexURL = options?.wasmUrl ?? DEFAULT_CDN_URL;
  const onProgress = options?.onProgress;

  onProgress?.(0);

  const loadPyodide = await loadPyodideLoader(indexURL);

  onProgress?.(20);

  let pyodide: PyodideInterface | null = null;
  let isReady = false;
  let isDestroyed = false;

  async function initPyodide(): Promise<PyodideInterface> {
    const py = await loadPyodide({
      indexURL,
      fullStdLib: false,
    });
    // Set up the capture helper
    py.runPython(CAPTURE_SETUP);
    return py;
  }

  pyodide = await initPyodide();
  isReady = true;
  onProgress?.(100);

  const pyodideVersion = pyodide.version;

  const runtime: WasmRuntime = {
    get language() {
      return 'python';
    },

    get version() {
      return `CPython 3.12 via Pyodide ${pyodideVersion} (omni-wasm)`;
    },

    get ready() {
      return isReady && !isDestroyed;
    },

    async execute(
      code: string,
      execOptions?: ExecuteOptions,
    ): Promise<ExecuteResult> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/python: runtime has been destroyed');
      }
      if (!pyodide) {
        throw new Error('@omni-wasm/python: runtime not initialized');
      }

      const timeout = execOptions?.timeout ?? 30_000;
      const start = performance.now();
      let exitCode = 0;
      let stdout = '';
      let stderr = '';

      try {
        // Start capture
        pyodide.runPython('_omni_capture.start()');

        // Write user code to a file in Pyodide's virtual FS to avoid escaping issues
        const srcPath = '/tmp/_omni_exec.py';
        pyodide.FS.writeFile(srcPath, code);

        // Execute the file via exec(open(...).read()) wrapped in error handling
        const runnerCode = `
try:
    with open('${srcPath}') as _omni_f:
        exec(compile(_omni_f.read(), '<user>', 'exec'))
    _omni_exit_code = 0
except SystemExit as _omni_e:
    _omni_exit_code = _omni_e.code if isinstance(_omni_e.code, int) else 1
except Exception:
    import traceback as _omni_tb
    _omni_sys.stderr.write(_omni_tb.format_exc())
    _omni_exit_code = 1
`;

        // Execute with timeout
        const execPromise = new Promise<void>((resolve) => {
          try {
            pyodide!.runPython(runnerCode);
          } catch (err: unknown) {
            // Pyodide-level error (shouldn't happen with our wrapper, but just in case)
            try {
              pyodide!.runPython('_omni_exit_code = 1');
              pyodide!.runPython(
                `_omni_sys.stderr.write(${JSON.stringify(String(err) + '\n')})`
              );
            } catch {
              // Ignore — capture will still work
            }
          }
          resolve();
        });

        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Execution timed out after ${timeout}ms`)),
            timeout,
          );
        });

        await Promise.race([execPromise, timeoutPromise]);

        // Stop capture and collect output
        pyodide.runPython('_omni_capture.stop()');
        stdout = String(pyodide.runPython('_omni_capture.get_stdout()') ?? '');
        stderr = String(pyodide.runPython('_omni_capture.get_stderr()') ?? '');
        const rawExit = pyodide.runPython('_omni_exit_code');
        exitCode = typeof rawExit === 'number' ? rawExit : 0;

        // Clean up temp file
        try { pyodide.FS.unlink(srcPath); } catch { /* ignore */ }
      } catch (err: unknown) {
        // Ensure capture is stopped even on error
        try {
          pyodide.runPython('_omni_capture.stop()');
          stdout = String(pyodide.runPython('_omni_capture.get_stdout()') ?? '');
          stderr = String(pyodide.runPython('_omni_capture.get_stderr()') ?? '');
        } catch {
          // Ignore errors during cleanup
        }

        if (err instanceof Error && err.message.includes('timed out')) {
          stderr += err.message + '\n';
          exitCode = 124;
        } else {
          stderr += String(err) + '\n';
          exitCode = 1;
        }
      }

      const duration = performance.now() - start;

      return {
        stdout,
        stderr,
        exitCode,
        duration,
      };
    },

    async reset(): Promise<void> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/python: runtime has been destroyed');
      }
      pyodide = await initPyodide();
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;
      isReady = false;
      pyodide = null;
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
