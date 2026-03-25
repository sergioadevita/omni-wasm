import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'common-lisp',
  name: 'Common Lisp',
  extensions: ['.lisp', '.cl'],
  binarySize: 512000,
  tiobeRank: 50,
  tier: 3,
  technology: 'JSCL (CL to JS compiler)',
};

/**
 * Create a Common Lisp runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/common-lisp';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Common Lisp code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Common Lisp WASM runtime
  throw new Error('@omni-wasm/common-lisp: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
