import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'perl',
  name: 'Perl',
  extensions: ['.pl', '.pm'],
  binarySize: 12582912,
  tiobeRank: 11,
  tier: 1,
  technology: 'WebPerl (Perl 5 via WASM)',
};

/**
 * Create a Perl runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/perl';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Perl code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Perl WASM runtime
  throw new Error('@omni-wasm/perl: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
