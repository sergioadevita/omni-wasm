import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'visualbasic',
  name: 'Visual Basic .NET',
  extensions: ['.vb'],
  binarySize: 5242880,
  tiobeRank: 7,
  tier: 4,
  technology: 'Extend Mono WASM + Roslyn VB Compiler',
};

/**
 * Create a Visual Basic .NET runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/visualbasic';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Visual Basic .NET code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Visual Basic .NET WASM runtime
  throw new Error('@omni-wasm/visualbasic: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
