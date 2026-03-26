import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import createRuntime from '../src/index.js';
import type { WasmRuntime } from '@omni-wasm/shared';

describe('@omni-wasm/python', () => {
  let runtime: WasmRuntime;

  before(async () => {
    runtime = await createRuntime();
  });

  after(() => {
    runtime?.destroy();
  });

  describe('API contract', () => {
    it('should expose language property', () => {
      assert.equal(runtime.language, 'python');
    });

    it('should expose version string', () => {
      assert.ok(runtime.version.includes('CPython'));
      assert.ok(runtime.version.includes('3.12'));
    });

    it('should report ready state', () => {
      assert.equal(runtime.ready, true);
    });
  });

  describe('execute()', () => {
    it('should run hello world', async () => {
      const result = await runtime.execute('print("Hello, World!")');
      assert.equal(result.stdout.trim(), 'Hello, World!');
      assert.equal(result.exitCode, 0);
    });

    it('should handle math operations', async () => {
      const result = await runtime.execute(`
a, b = 7, 3
print(a + b, a - b, a * b, a // b)
      `);
      assert.equal(result.stdout.trim(), '10 4 21 2');
    });

    it('should handle lists and loops', async () => {
      const result = await runtime.execute(`
nums = [5, 3, 8, 1, 9]
print(sum(nums))
      `);
      assert.equal(result.stdout.trim(), '26');
    });

    it('should handle dictionaries', async () => {
      const result = await runtime.execute(`
d = {"x": 10, "y": 20}
print(f"({d['x']}, {d['y']})")
      `);
      assert.equal(result.stdout.trim(), '(10, 20)');
    });

    it('should handle list comprehensions', async () => {
      const result = await runtime.execute(`
squares = [x**2 for x in range(5)]
print(squares)
      `);
      assert.equal(result.stdout.trim(), '[0, 1, 4, 9, 16]');
    });

    it('should handle classes', async () => {
      const result = await runtime.execute(`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __str__(self):
        return f"({self.x}, {self.y})"

p = Point(10, 20)
print(p)
      `);
      assert.equal(result.stdout.trim(), '(10, 20)');
    });

    it('should handle imports (json)', async () => {
      const result = await runtime.execute(`
import json
print(json.dumps({"a": 1}))
      `);
      assert.equal(result.stdout.trim(), '{"a": 1}');
    });

    it('should capture syntax errors in stderr', async () => {
      const result = await runtime.execute('def foo(');
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.stderr.length > 0);
    });

    it('should handle non-zero exit via sys.exit', async () => {
      const result = await runtime.execute(`
import sys
sys.exit(42)
      `);
      assert.equal(result.exitCode, 42);
    });

    it('should measure execution duration', async () => {
      const result = await runtime.execute('print("fast")');
      assert.ok(result.duration >= 0);
      assert.ok(result.duration < 5000);
    });
  });

  describe('destroy()', () => {
    it('should throw on execute after destroy', async () => {
      const r = await createRuntime();
      r.destroy();
      assert.equal(r.ready, false);
      await assert.rejects(() => r.execute('print("hi")'), /destroyed/);
    });
  });
});
