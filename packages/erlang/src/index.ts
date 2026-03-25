import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'erlang',
  name: 'Erlang',
  extensions: ['.erl', '.hrl'],
  binarySize: 4194304,
  tiobeRank: 42,
  tier: 4,
  technology: 'AtomVM (shared with Elixir)',
};

/**
 * Create a Erlang runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/erlang';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Erlang code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Erlang WASM runtime
  throw new Error('@omni-wasm/erlang: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
