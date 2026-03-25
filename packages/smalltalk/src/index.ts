import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'smalltalk',
  name: 'Smalltalk',
  extensions: ['.st'],
  binarySize: 5242880,
  tiobeRank: 50,
  tier: 3,
  technology: 'SqueakJS (pure JS VM)',
};

/**
 * Create a Smalltalk runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/smalltalk';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Smalltalk code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Smalltalk WASM runtime
  throw new Error('@omni-wasm/smalltalk: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
