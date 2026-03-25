import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'octave',
  name: 'MATLAB / Octave',
  extensions: ['.m', '.oct'],
  binarySize: 36700160,
  tiobeRank: 15,
  tier: 4,
  technology: 'Full GNU Octave via Emscripten',
};

/**
 * Create a MATLAB / Octave runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/octave';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your MATLAB / Octave code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement MATLAB / Octave WASM runtime
  throw new Error('@omni-wasm/octave: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
