import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'r',
  name: 'R',
  extensions: ['.r', '.R'],
  binarySize: 26214400,
  tiobeRank: 9,
  tier: 1,
  technology: 'webR (full R via WASM)',
};

/**
 * Create a R runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/r';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your R code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement R WASM runtime
  throw new Error('@omni-wasm/r: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
