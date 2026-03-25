import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'lua',
  name: 'Lua',
  extensions: ['.lua'],
  binarySize: 409600,
  tiobeRank: 30,
  tier: 0,
  technology: 'Lua 5.4 source via Emscripten',
};

/**
 * Create a Lua runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/lua';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Lua code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Lua WASM runtime
  throw new Error('@omni-wasm/lua: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
