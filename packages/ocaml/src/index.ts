import type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo } from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'ocaml',
  name: 'OCaml',
  extensions: ['.ml', '.mli'],
  binarySize: 5242880,
  tiobeRank: 35,
  tier: 2,
  technology: 'OCaml toplevel via WASM',
};

/**
 * Create a OCaml runtime instance.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/ocaml';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute('// your OCaml code here');
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (options?: RuntimeOptions): Promise<WasmRuntime> => {
  // TODO: Implement OCaml WASM runtime
  throw new Error('@omni-wasm/ocaml: runtime not yet implemented');
};

export default createRuntime;
export type { WasmRuntime, RuntimeOptions, ExecuteResult, ExecuteOptions, CreateRuntime, LanguageInfo };
