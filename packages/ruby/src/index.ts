import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'ruby',
  name: 'Ruby',
  extensions: ['.rb'],
  binarySize: 15728640,
  tiobeRank: 17,
  tier: 0,
  technology: 'CRuby (MRI) via WASI',
};

/**
 * Create a Ruby runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/ruby';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Ruby code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Ruby WASM runtime
  throw new Error('@omni-wasm/ruby: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
