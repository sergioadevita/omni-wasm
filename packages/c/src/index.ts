import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'c',
  name: 'C',
  extensions: ['.c', '.h'],
  binarySize: 2097152,
  tiobeRank: 2,
  tier: 0,
  technology: 'TCC (Tiny C Compiler) via Emscripten',
};

/**
 * Create a C runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/c';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your C code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement C WASM runtime
  throw new Error('@omni-wasm/c: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
