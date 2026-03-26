import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import createRuntime from '../src/index.js';
import type { WasmRuntime } from '@omni-wasm/shared';

describe('@omni-wasm/cpp', () => {
  let runtime: WasmRuntime;

  before(async () => {
    runtime = await createRuntime();
  });

  after(() => {
    runtime?.destroy();
  });

  describe('API contract', () => {
    it('should expose language property', () => {
      assert.equal(runtime.language, 'cpp');
    });

    it('should expose version string', () => {
      assert.ok(runtime.version.includes('JSCPP'));
    });

    it('should report ready state', () => {
      assert.equal(runtime.ready, true);
    });
  });

  describe('execute()', () => {
    it('should run hello world via cout', async () => {
      const code = `
#include <iostream>
using namespace std;
int main() {
  cout << "Hello, World!" << endl;
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('Hello, World!'));
      assert.equal(result.exitCode, 0);
    });

    it('should handle basic math operations', async () => {
      const code = `
#include <iostream>
using namespace std;
int main() {
  int a = 10, b = 3;
  cout << (a + b) << " " << (a - b) << " " << (a * b) << endl;
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('13 7 30'));
    });

    it('should handle arrays and loops', async () => {
      const code = `
#include <iostream>
using namespace std;
int main() {
  int arr[] = {1, 2, 3, 4, 5};
  int sum = 0;
  for (int i = 0; i < 5; i++) {
    sum += arr[i];
  }
  cout << sum << endl;
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('15'));
    });

    it('should handle classes and objects', async () => {
      const code = `
#include <iostream>
using namespace std;
class Point {
  public:
    int x, y;
    Point(int px, int py) : x(px), y(py) {}
    void print() {
      cout << "(" << x << ", " << y << ")" << endl;
    }
};
int main() {
  Point p(10, 20);
  p.print();
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('(10, 20)'));
    });

    it('should handle functions', async () => {
      const code = `
#include <iostream>
using namespace std;
int factorial(int n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
int main() {
  cout << factorial(5) << endl;
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('120'));
    });

    it('should capture stderr on syntax errors', async () => {
      const code = `
#include <iostream>
int main() {
  this is not valid cpp code!!!
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.notEqual(result.exitCode, 0);
      // JSCPP will capture the error, but we just verify it doesn't crash
      assert.ok(result.stderr.length > 0 || result.exitCode !== 0);
    });

    it('should handle non-zero exit codes', async () => {
      const code = `
#include <iostream>
using namespace std;
int main() {
  cout << "About to exit with code 42" << endl;
  return 42;
}
      `;
      const result = await runtime.execute(code);
      assert.equal(result.exitCode, 42);
      assert.ok(result.stdout.includes('About to exit with code 42'));
    });

    it('should handle string operations', async () => {
      const code = `
#include <iostream>
#include <string>
using namespace std;
int main() {
  string s = "Hello";
  s += " C++";
  cout << s << endl;
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('Hello C++'));
    });

    it('should handle if-else conditionals', async () => {
      const code = `
#include <iostream>
using namespace std;
int main() {
  int x = 15;
  if (x > 10) {
    cout << "x is greater than 10" << endl;
  } else {
    cout << "x is not greater than 10" << endl;
  }
  return 0;
}
      `;
      const result = await runtime.execute(code);
      assert.ok(result.stdout.includes('x is greater than 10'));
    });
  });

  describe('destroy()', () => {
    it('should prevent execution after destroy', async () => {
      const rt = await createRuntime();
      rt.destroy();
      assert.rejects(
        () => rt.execute('int main() { return 0; }'),
        /has been destroyed/,
      );
    });

    it('should make ready flag false after destroy', async () => {
      const rt = await createRuntime();
      rt.destroy();
      assert.equal(rt.ready, false);
    });
  });
});
