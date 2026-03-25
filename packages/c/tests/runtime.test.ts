import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import createRuntime from '../src/index.js';
import type { WasmRuntime } from '@omni-wasm/shared';

describe('@omni-wasm/c', () => {
  let runtime: WasmRuntime;

  before(async () => {
    runtime = await createRuntime();
  });

  after(() => {
    runtime?.destroy();
  });

  describe('API contract', () => {
    it('should expose language property', () => {
      assert.equal(runtime.language, 'c');
    });

    it('should expose version string', () => {
      assert.ok(runtime.version.includes('picoc'));
    });

    it('should report ready state', () => {
      assert.equal(runtime.ready, true);
    });
  });

  describe('execute()', () => {
    it('should run hello world', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        int main() { printf("Hello, World!\\n"); return 0; }
      `);
      assert.equal(result.stdout.trim(), 'Hello, World!');
      assert.equal(result.exitCode, 0);
    });

    it('should handle math operations', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        int main() {
          int a = 7, b = 3;
          printf("%d %d %d %d\\n", a+b, a-b, a*b, a/b);
          return 0;
        }
      `);
      assert.equal(result.stdout.trim(), '10 4 21 2');
    });

    it('should handle arrays and loops', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        int main() {
          int arr[5];
          int i;
          int sum = 0;
          arr[0] = 5; arr[1] = 3; arr[2] = 8; arr[3] = 1; arr[4] = 9;
          for (i = 0; i < 5; i++) sum += arr[i];
          printf("%d\\n", sum);
          return 0;
        }
      `);
      assert.equal(result.stdout.trim(), '26');
    });

    it('should handle structs', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        struct Point { int x; int y; };
        int main() {
          struct Point p;
          p.x = 10;
          p.y = 20;
          printf("(%d, %d)\\n", p.x, p.y);
          return 0;
        }
      `);
      assert.equal(result.stdout.trim(), '(10, 20)');
    });

    it('should handle pointers and malloc', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        #include <stdlib.h>
        int main() {
          int *p = malloc(sizeof(int));
          *p = 42;
          printf("%d\\n", *p);
          free(p);
          return 0;
        }
      `);
      assert.equal(result.stdout.trim(), '42');
    });

    it('should handle string operations', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        #include <string.h>
        int main() {
          char s[] = "hello";
          printf("%d\\n", (int)strlen(s));
          return 0;
        }
      `);
      assert.equal(result.stdout.trim(), '5');
    });

    it('should capture errors in stderr', async () => {
      const result = await runtime.execute(`
        int main() {
          undeclared_variable = 5;
          return 0;
        }
      `);
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.stderr.length > 0);
    });

    it('should handle non-zero return codes', async () => {
      const result = await runtime.execute(`
        int main() { return 42; }
      `);
      assert.equal(result.exitCode, 42);
    });

    it('should measure execution duration', async () => {
      const result = await runtime.execute(`
        #include <stdio.h>
        int main() { printf("fast\\n"); return 0; }
      `);
      assert.ok(result.duration >= 0);
      assert.ok(result.duration < 5000);
    });
  });

  describe('destroy()', () => {
    it('should throw on execute after destroy', async () => {
      const r = await createRuntime();
      r.destroy();
      assert.equal(r.ready, false);
      await assert.rejects(() => r.execute('int main() { return 0; }'), /destroyed/);
    });
  });
});
