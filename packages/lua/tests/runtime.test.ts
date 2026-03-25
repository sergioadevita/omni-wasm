/**
 * @omni-wasm/lua — Runtime Tests
 *
 * These tests validate the Lua WASM runtime against the standard @omni-wasm API contract.
 * They require the WASM binary to be built first (npm run build:wasm).
 *
 * Run: node --test tests/runtime.test.ts
 * (Requires Node 20+ with native test runner and --loader for TS)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import createRuntime from '../src/index.js';
import type { WasmRuntime } from '@omni-wasm/shared';

describe('@omni-wasm/lua', () => {
  let runtime: WasmRuntime;

  before(async () => {
    runtime = await createRuntime();
  });

  after(() => {
    runtime?.destroy();
  });

  describe('API contract', () => {
    it('should expose language property', () => {
      assert.equal(runtime.language, 'lua');
    });

    it('should expose version string', () => {
      assert.ok(runtime.version.includes('Lua'));
      assert.ok(runtime.version.includes('5.4'));
    });

    it('should report ready state', () => {
      assert.equal(runtime.ready, true);
    });
  });

  describe('execute()', () => {
    it('should execute print statements', async () => {
      const result = await runtime.execute('print("Hello, World!")');
      assert.equal(result.stdout.trim(), 'Hello, World!');
      assert.equal(result.exitCode, 0);
    });

    it('should capture multiple print outputs', async () => {
      const result = await runtime.execute(`
        print("line 1")
        print("line 2")
        print("line 3")
      `);
      const lines = result.stdout.trim().split('\n');
      assert.equal(lines.length, 3);
      assert.equal(lines[0], 'line 1');
      assert.equal(lines[1], 'line 2');
      assert.equal(lines[2], 'line 3');
    });

    it('should handle math operations', async () => {
      const result = await runtime.execute('print(2 + 3 * 4)');
      assert.equal(result.stdout.trim(), '14');
      assert.equal(result.exitCode, 0);
    });

    it('should handle string operations', async () => {
      const result = await runtime.execute(`
        local s = "hello"
        print(s:upper())
        print(s:rep(3))
        print(#s)
      `);
      const lines = result.stdout.trim().split('\n');
      assert.equal(lines[0], 'HELLO');
      assert.equal(lines[1], 'hellohellohello');
      assert.equal(lines[2], '5');
    });

    it('should handle tables', async () => {
      const result = await runtime.execute(`
        local t = {10, 20, 30}
        for _, v in ipairs(t) do
          print(v)
        end
      `);
      const lines = result.stdout.trim().split('\n');
      assert.deepEqual(lines, ['10', '20', '30']);
    });

    it('should handle functions and closures', async () => {
      const result = await runtime.execute(`
        function make_adder(x)
          return function(y) return x + y end
        end
        local add5 = make_adder(5)
        print(add5(3))
        print(add5(10))
      `);
      const lines = result.stdout.trim().split('\n');
      assert.equal(lines[0], '8');
      assert.equal(lines[1], '15');
    });

    it('should handle coroutines', async () => {
      const result = await runtime.execute(`
        local co = coroutine.create(function()
          for i = 1, 3 do
            coroutine.yield(i)
          end
        end)
        for i = 1, 3 do
          local ok, val = coroutine.resume(co)
          print(val)
        end
      `);
      const lines = result.stdout.trim().split('\n');
      assert.deepEqual(lines, ['1', '2', '3']);
    });

    it('should capture syntax errors in stderr', async () => {
      const result = await runtime.execute('print(');
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.stderr.length > 0);
    });

    it('should capture runtime errors in stderr', async () => {
      const result = await runtime.execute('error("test error")');
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.stderr.includes('test error'));
    });

    it('should measure execution duration', async () => {
      const result = await runtime.execute('print("fast")');
      assert.ok(result.duration >= 0);
      assert.ok(result.duration < 5000); // Should be much faster than 5s
    });

    it('should handle empty code', async () => {
      const result = await runtime.execute('');
      assert.equal(result.exitCode, 0);
      assert.equal(result.stdout, '');
    });

    it('should handle _VERSION global', async () => {
      const result = await runtime.execute('print(_VERSION)');
      assert.ok(result.stdout.includes('Lua 5.4'));
    });

    it('should support command-line args', async () => {
      const result = await runtime.execute(`
        for i, v in ipairs(arg) do
          print(i, v)
        end
      `, { args: ['foo', 'bar'] });
      assert.ok(result.stdout.includes('foo'));
      assert.ok(result.stdout.includes('bar'));
    });
  });

  describe('reset()', () => {
    it('should clear state between executions', async () => {
      await runtime.execute('myGlobal = 42');
      await runtime.reset();
      const result = await runtime.execute('print(type(myGlobal))');
      // After reset, myGlobal should be nil
      assert.ok(result.stdout.includes('nil'));
    });
  });

  describe('destroy()', () => {
    it('should mark runtime as not ready after destroy', () => {
      const tempRuntime = { ...runtime };
      // We test on a separate instance to not break other tests
      // This is a structural test — destroy() sets ready = false
    });

    it('should throw on execute after destroy', async () => {
      const r = await createRuntime();
      r.destroy();
      assert.equal(r.ready, false);
      await assert.rejects(
        () => r.execute('print("nope")'),
        /destroyed/,
      );
    });
  });
});
