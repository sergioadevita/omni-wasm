import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'fsharp',
  name: 'F#',
  extensions: ['.fs', '.fsx'],
  binarySize: 2097152,
  tiobeRank: 30,
  tier: 2,
  technology: 'Extend Mono WASM (like C#)',
};

/**
 * Create a F# runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/fsharp';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your F# code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement F# WASM runtime
  throw new Error('@omni-wasm/fsharp: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
