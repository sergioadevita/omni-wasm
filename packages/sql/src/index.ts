import type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
} from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'sql',
  name: 'SQL',
  extensions: ['.sql'],
  binarySize: 1_300_000, // ~1.3 MB WASM binary
  tiobeRank: 8,
  tier: 0,
  technology: 'SQLite 3.49 amalgamation via Emscripten (own build)',
};

/**
 * Emscripten module type for the SQLite WASM build.
 */
interface SQLiteEmscriptenModule {
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

type CreateSQLiteModuleFactory = (
  overrides?: Partial<SQLiteEmscriptenModule>,
) => Promise<SQLiteEmscriptenModule>;

const DEFAULT_WASM_JS_URL = new URL('./wasm/sqlite3.js', import.meta.url).href;

/**
 * Load the Emscripten module factory.
 * Same pattern as @omni-wasm/lua — script tag for browser, dynamic import for Node.
 */
async function loadModuleFactory(wasmJsUrl: string): Promise<CreateSQLiteModuleFactory> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (typeof g.createSQLiteModule === 'function') {
    return g.createSQLiteModule as CreateSQLiteModuleFactory;
  }

  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = wasmJsUrl;
      script.onload = () => {
        const factory = (window as unknown as Record<string, unknown>).createSQLiteModule;
        if (typeof factory === 'function') {
          resolve(factory as CreateSQLiteModuleFactory);
        } else {
          reject(new Error('createSQLiteModule not found after loading script'));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${wasmJsUrl}`));
      document.head.appendChild(script);
    });
  }

  const module = await import(/* @vite-ignore */ wasmJsUrl);
  return module.default ?? module.createSQLiteModule ?? module;
}

/**
 * Create a SQL (SQLite) runtime instance.
 *
 * The SQLite runtime maintains an in-memory database. Each execute() call
 * runs SQL statements against it. Use reset() to get a fresh empty database.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/sql';
 *
 * const runtime = await createRuntime();
 * await runtime.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);');
 * await runtime.execute("INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');");
 * const result = await runtime.execute('SELECT * FROM users;');
 * console.log(result.stdout);
 * // "1|Alice\n2|Bob\n"
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

  // Mutable callbacks for output capture (Emscripten binds at init time)
  let stdoutCallback: (text: string) => void = () => {};
  let stderrCallback: (text: string) => void = () => {};

  let module: SQLiteEmscriptenModule | null = null;
  let isReady = false;
  let isDestroyed = false;

  // Database file path in the virtual filesystem
  const DB_PATH = '/tmp/omni.db';

  async function initModule(): Promise<SQLiteEmscriptenModule> {
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
      return 'sql';
    },

    get version() {
      return 'SQLite 3.49 via Emscripten (omni-wasm)';
    },

    get ready() {
      return isReady && !isDestroyed;
    },

    async execute(
      code: string,
      execOptions?: ExecuteOptions,
    ): Promise<ExecuteResult> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/sql: runtime has been destroyed');
      }
      if (!module) {
        throw new Error('@omni-wasm/sql: runtime not initialized');
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

      // Write SQL to a temp file
      const scriptPath = '/tmp/_omni_exec.sql';
      module.FS.writeFile(scriptPath, code);

      const start = performance.now();
      let exitCode = 0;

      try {
        const execPromise = new Promise<number>((resolve) => {
          try {
            // Run sqlite3 CLI with the database and the SQL script
            // -header: show column names
            // -column or default pipe-separated output
            const result = module!.callMain([DB_PATH, '.read ' + scriptPath]);
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

      // Clean up temp SQL file
      try {
        module.FS.unlink(scriptPath);
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
        throw new Error('@omni-wasm/sql: runtime has been destroyed');
      }

      // Re-instantiate to get a fresh database
      stdoutCallback = () => {};
      stderrCallback = () => {};
      module = await initModule();

      // Delete old database file if it exists
      try {
        module.FS.unlink(DB_PATH);
      } catch {
        // Didn't exist
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
