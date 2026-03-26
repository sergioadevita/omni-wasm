import type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
} from '@omni-wasm/shared';

export const languageInfo: LanguageInfo = {
  id: 'ruby',
  name: 'Ruby',
  extensions: ['.rb'],
  binarySize: 15_728_640, // ~15 MB WASM binary (ruby.wasm + stdlib)
  tiobeRank: 17,
  tier: 0,
  technology: 'CRuby 3.2 via ruby.wasm (WASI)',
};

/**
 * Ruby VM API types (subset we use).
 */
interface RubyVM {
  eval(code: string): unknown;
  call(methodName: string, ...args: unknown[]): unknown;
  print(message: string): void;
}

interface RubyModule {
  defaultRubyVM?: (module: WebAssembly.Module) => Promise<{ vm: RubyVM }>;
}

type LoadRubyFn = (
  module: WebAssembly.Module,
) => Promise<{ vm: RubyVM }>;

const RUBY_WASM_VERSION = '2.3.0';
const RUBY_WASM_CDN = `https://cdn.jsdelivr.net/npm/ruby-3_2-wasm-wasi@${RUBY_WASM_VERSION}/dist`;

/**
 * Load the Ruby WASM module from CDN.
 */
async function loadRubyModule(cdnUrl: string): Promise<WebAssembly.Module> {
  const wasmUrl = `${cdnUrl}/ruby+stdlib.wasm`;
  const response = await fetch(wasmUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Ruby WASM from ${wasmUrl}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return WebAssembly.compile(buffer);
}

/**
 * Load the Ruby VM initializer script.
 */
async function loadRubyLoader(cdnUrl: string): Promise<LoadRubyFn> {
  const g = globalThis as unknown as Record<string, unknown>;

  // Already loaded? The IIFE script exposes `DefaultRubyVM` as a global.
  if (typeof g.DefaultRubyVM === 'function') {
    return g.DefaultRubyVM as LoadRubyFn;
  }

  // Browser: load via script tag
  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${cdnUrl}/browser.script.iife.js`;
      script.onload = () => {
        const fn = (window as unknown as Record<string, unknown>).DefaultRubyVM;
        if (typeof fn === 'function') {
          resolve(fn as LoadRubyFn);
        } else {
          reject(new Error('DefaultRubyVM not found after loading script'));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load Ruby WASM loader from ${cdnUrl}`));
      document.head.appendChild(script);
    });
  }

  // Node.js / non-browser: try dynamic import
  try {
    const module = await import(/* @vite-ignore */ `${cdnUrl}/browser.esm.js`);
    return module.DefaultRubyVM ?? module.default;
  } catch {
    throw new Error(
      'Could not load Ruby WASM in this environment. Ensure you are in a browser or Node.js with ESM support.',
    );
  }
}

/**
 * Ruby code to set up stdout/stderr capture using StringIO.
 * This mimics the approach used in Python and captures output cleanly.
 */
const CAPTURE_SETUP = `
require 'stringio'

$_omni_orig_stdout = $stdout
$_omni_orig_stderr = $stderr
$_omni_cap_out = StringIO.new
$_omni_cap_err = StringIO.new
`;

/**
 * Create a Ruby runtime instance.
 *
 * Uses CRuby compiled to WASM via ruby.wasm. Runs Ruby code in the
 * browser with access to the standard library.
 *
 * @example
 * ```ts
 * import createRuntime from '@omni-wasm/ruby';
 *
 * const runtime = await createRuntime();
 * const result = await runtime.execute(`
 *   puts "Hello from Ruby!"
 *   puts [1, 2, 3].map { |x| x ** 2 }.inspect
 * `);
 * console.log(result.stdout);
 * runtime.destroy();
 * ```
 */
const createRuntime: CreateRuntime = async (
  options?: RuntimeOptions,
): Promise<WasmRuntime> => {
  const cdnUrl = options?.wasmUrl ?? RUBY_WASM_CDN;
  const onProgress = options?.onProgress;

  onProgress?.(0);

  let vm: RubyVM | null = null;
  let isReady = false;
  let isDestroyed = false;

  try {
    onProgress?.(10);

    // Load the Ruby WASM module
    const rubyModule = await loadRubyModule(cdnUrl);
    onProgress?.(50);

    // Load the Ruby VM initializer
    const loadRuby = await loadRubyLoader(cdnUrl);
    onProgress?.(75);

    // Initialize the VM
    const { vm: rubyVm } = await loadRuby(rubyModule);
    vm = rubyVm;

    // Set up the capture helper
    try {
      vm.eval(CAPTURE_SETUP);
    } catch (err) {
      // If capture setup fails, continue anyway (it will fall back to console output)
      console.warn('Failed to set up output capture:', err);
    }

    isReady = true;
    onProgress?.(100);
  } catch (err) {
    isDestroyed = true;
    throw err;
  }

  const runtime: WasmRuntime = {
    get language() {
      return 'ruby';
    },

    get version() {
      return `CRuby 3.2 via ruby.wasm ${RUBY_WASM_VERSION} (omni-wasm)`;
    },

    get ready() {
      return isReady && !isDestroyed;
    },

    async execute(
      code: string,
      execOptions?: ExecuteOptions,
    ): Promise<ExecuteResult> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/ruby: runtime has been destroyed');
      }
      if (!vm) {
        throw new Error('@omni-wasm/ruby: runtime not initialized');
      }

      const timeout = execOptions?.timeout ?? 30_000;
      const start = performance.now();
      let exitCode = 0;
      let stdout = '';
      let stderr = '';

      try {
        // Redirect $stdout/$stderr to StringIO for capture
        vm.eval('$_omni_cap_out = StringIO.new; $_omni_cap_err = StringIO.new; $stdout = $_omni_cap_out; $stderr = $_omni_cap_err');

        // Execute the user code wrapped in error handling
        const wrappedCode = `
begin
  eval(<<~'_OMNI_USER_CODE_END_'
${code}
_OMNI_USER_CODE_END_
  )
  $_omni_exit = 0
rescue SystemExit => e
  $_omni_exit = e.status || 1
rescue Exception => e
  $stderr.puts e.class.name + ": " + e.message
  $stderr.puts e.backtrace.join("\\n") if e.backtrace
  $_omni_exit = 1
end
`;

        // Execute with timeout
        const execPromise = new Promise<void>((resolve) => {
          try {
            vm!.eval(wrappedCode);
          } catch (err: unknown) {
            try {
              vm!.eval('$_omni_exit = 1');
            } catch {
              // Ignore
            }
          }
          resolve();
        });

        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Execution timed out after ${timeout}ms`)),
            timeout,
          );
        });

        await Promise.race([execPromise, timeoutPromise]);

        // Restore and collect output
        vm.eval('$stdout = $_omni_orig_stdout; $stderr = $_omni_orig_stderr');
        stdout = String(vm.eval('$_omni_cap_out.string') ?? '');
        stderr = String(vm.eval('$_omni_cap_err.string') ?? '');

        try {
          const rawExit = vm.eval('$_omni_exit');
          exitCode = typeof rawExit === 'number' ? rawExit : 0;
        } catch {
          exitCode = 0;
        }
      } catch (err: unknown) {
        // Ensure stdout/stderr are restored even on error
        try {
          vm.eval('$stdout = $_omni_orig_stdout; $stderr = $_omni_orig_stderr');
          stdout = String(vm.eval('$_omni_cap_out.string') ?? '');
          stderr = String(vm.eval('$_omni_cap_err.string') ?? '');
        } catch {
          // Ignore errors during cleanup
        }

        if (err instanceof Error && err.message.includes('timed out')) {
          stderr += (stderr ? '\n' : '') + err.message;
          exitCode = 124;
        } else {
          stderr += (stderr ? '\n' : '') + String(err);
          exitCode = 1;
        }
      }

      const duration = performance.now() - start;

      return {
        stdout,
        stderr,
        exitCode,
        duration,
      };
    },

    async reset(): Promise<void> {
      if (isDestroyed) {
        throw new Error('@omni-wasm/ruby: runtime has been destroyed');
      }
      // Ruby VM can't be fully reset without reloading WASM,
      // but we can reinitialize the capture globals
      if (vm) {
        try {
          vm.eval('$stdout = $_omni_orig_stdout; $stderr = $_omni_orig_stderr');
        } catch {
          // Ignore
        }
      }
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;
      isReady = false;
      vm = null;
    },
  };

  return runtime;
};

export default createRuntime;
export type {
  WasmRuntime,
  RuntimeOptions,
  ExecuteResult,
  ExecuteOptions,
  CreateRuntime,
  LanguageInfo,
};
