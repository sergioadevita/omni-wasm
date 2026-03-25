import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'sql',
  name: 'SQL',
  extensions: ['.sql'],
  binarySize: 1258291,
  tiobeRank: 8,
  tier: 0,
  technology: 'SQLite amalgamation via Emscripten',
};

/**
 * Create a SQL runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/sql';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your SQL code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement SQL WASM runtime
  throw new Error('@omni-wasm/sql: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
