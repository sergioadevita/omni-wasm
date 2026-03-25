import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'gdscript',
  name: 'GDScript',
  extensions: ['.gd'],
  binarySize: 8388608,
  tiobeRank: 50,
  tier: 4,
  technology: 'Comprehensive standalone interpreter in Rust via WASM',
};

/**
 * Create a GDScript runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/gdscript';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your GDScript code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement GDScript WASM runtime
  throw new Error('@omni-wasm/gdscript: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
