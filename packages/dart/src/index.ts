import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'dart',
  name: 'Dart',
  extensions: ['.dart'],
  binarySize: 8388608,
  tiobeRank: 25,
  tier: 1,
  technology: 'dart2js compiler in JS sandbox',
};

/**
 * Create a Dart runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/dart';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Dart code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Dart WASM runtime
  throw new Error('@omni-wasm/dart: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
