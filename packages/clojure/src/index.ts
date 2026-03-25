import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'clojure',
  name: 'Clojure',
  extensions: ['.clj', '.cljs'],
  binarySize: 4194304,
  tiobeRank: 38,
  tier: 2,
  technology: 'ClojureScript self-hosted',
};

/**
 * Create a Clojure runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/clojure';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your Clojure code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement Clojure WASM runtime
  throw new Error('@omni-wasm/clojure: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
