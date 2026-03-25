/**
 * @omni-wasm/shared
 *
 * Standard API contract for all @omni-wasm language runtimes.
 * Every runtime implements this interface — no exceptions.
 */

/** Result of executing code in a WASM runtime. */
export interface ExecuteResult {
  /** Standard output captured from the program. */
  stdout: string;
  /** Standard error captured from the program. */
  stderr: string;
  /** Exit code (0 = success, non-zero = error). */
  exitCode: number;
  /** Execution duration in milliseconds. */
  duration: number;
}

/** Options for code execution. */
export interface ExecuteOptions {
  /** Timeout in milliseconds. Default: 30000 (30 seconds). */
  timeout?: number;
  /** Standard input to feed to the program. */
  stdin?: string;
  /** Environment variables (key-value pairs). */
  env?: Record<string, string>;
  /** Arguments to pass to the program (like command-line args). */
  args?: string[];
}

/** Runtime initialization options. */
export interface RuntimeOptions {
  /**
   * URL or path to the WASM binary.
   * If not provided, the runtime will attempt to load from the default CDN location.
   */
  wasmUrl?: string;
  /**
   * Whether to run execution in a Web Worker (prevents UI blocking).
   * Default: true for runtimes > 5 MB, false otherwise.
   */
  useWorker?: boolean;
  /**
   * Whether to cache the WASM binary in IndexedDB after first load.
   * Default: true.
   */
  enableCache?: boolean;
  /**
   * Callback for reporting loading progress (0-100).
   */
  onProgress?: (percent: number) => void;
}

/**
 * The standard interface every @omni-wasm runtime must implement.
 *
 * Usage:
 * ```ts
 * import { createRuntime } from '@omni-wasm/python';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('print("Hello, World!")');
 * console.log(result.stdout); // "Hello, World!\n"
 * runtime.destroy();
 * ```
 */
export interface WasmRuntime {
  /** The language this runtime executes. */
  readonly language: string;

  /** Human-readable version string (e.g., "CPython 3.12.0 via Emscripten"). */
  readonly version: string;

  /** Whether the runtime has been initialized and is ready to execute code. */
  readonly ready: boolean;

  /** Execute source code and return the result. */
  execute(code: string, options?: ExecuteOptions): Promise<ExecuteResult>;

  /** Reset the runtime state (clear variables, imports, etc.) without reloading WASM. */
  reset(): Promise<void>;

  /** Destroy the runtime and free all resources (WASM memory, Web Workers, etc.). */
  destroy(): void;
}

/** Factory function type that every @omni-wasm package must export as default. */
export type CreateRuntime = (options?: RuntimeOptions) => Promise<WasmRuntime>;

/**
 * Language metadata — static info about a runtime package.
 * Useful for UI display without needing to load the runtime.
 */
export interface LanguageInfo {
  /** Language identifier (e.g., "python", "rust", "lua"). */
  id: string;
  /** Display name (e.g., "Python", "Rust", "Lua"). */
  name: string;
  /** File extensions associated with this language (e.g., [".py", ".pyw"]). */
  extensions: string[];
  /** Approximate WASM binary size in bytes. */
  binarySize: number;
  /** TIOBE index rank (approximate). */
  tiobeRank: number | null;
  /** Tier in the omni-wasm implementation plan (0-4). */
  tier: number;
  /** Underlying technology (e.g., "CPython via Emscripten", "Miri MIR interpreter"). */
  technology: string;
}
