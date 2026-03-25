import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'java',
  name: 'Java',
  extensions: ['.java'],
  binarySize: 8388608,
  tiobeRank: 4,
  tier: 1,
  technology: 'Doppio JVM interpreter',
};

/**
 * Create a Java runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/java';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Java code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Java WASM runtime
  throw new Error('@omni-wasm/java: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
