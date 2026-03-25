import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'kotlin',
  name: 'Kotlin',
  extensions: ['.kt', '.kts'],
  binarySize: 10485760,
  tiobeRank: 21,
  tier: 1,
  technology: 'Doppio JVM + kotlinc',
};

/**
 * Create a Kotlin runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/kotlin';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Kotlin code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Kotlin WASM runtime
  throw new Error('@omni-wasm/kotlin: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
