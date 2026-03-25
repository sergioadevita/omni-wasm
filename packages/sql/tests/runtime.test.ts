/**
 * @omni-wasm/sql — Runtime Tests
 *
 * Validates the SQLite WASM runtime against the standard @omni-wasm API contract.
 * Requires the WASM binary to be built first (npm run build:wasm).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import createRuntime from '../src/index.js';
import type { WasmRuntime } from '@omni-wasm/shared';

describe('@omni-wasm/sql', () => {
  let runtime: WasmRuntime;

  before(async () => {
    runtime = await createRuntime();
  });

  after(() => {
    runtime?.destroy();
  });

  describe('API contract', () => {
    it('should expose language property', () => {
      assert.equal(runtime.language, 'sql');
    });

    it('should expose version string', () => {
      assert.ok(runtime.version.includes('SQLite'));
    });

    it('should report ready state', () => {
      assert.equal(runtime.ready, true);
    });
  });

  describe('execute()', () => {
    it('should create a table', async () => {
      const result = await runtime.execute(
        'CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT);'
      );
      assert.equal(result.exitCode, 0);
    });

    it('should insert and select data', async () => {
      await runtime.execute(
        "INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');"
      );
      const result = await runtime.execute('SELECT * FROM test;');
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('Alice'));
      assert.ok(result.stdout.includes('Bob'));
      assert.ok(result.stdout.includes('Charlie'));
    });

    it('should handle aggregate queries', async () => {
      const result = await runtime.execute('SELECT COUNT(*) FROM test;');
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('3'));
    });

    it('should handle WHERE clauses', async () => {
      const result = await runtime.execute(
        "SELECT name FROM test WHERE id > 1;"
      );
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('Bob'));
      assert.ok(result.stdout.includes('Charlie'));
      assert.ok(!result.stdout.includes('Alice'));
    });

    it('should handle JOIN operations', async () => {
      await runtime.execute(
        'CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, item TEXT);'
      );
      await runtime.execute(
        "INSERT INTO orders VALUES (1, 1, 'Book'), (2, 2, 'Pen'), (3, 1, 'Laptop');"
      );
      const result = await runtime.execute(
        'SELECT test.name, orders.item FROM test JOIN orders ON test.id = orders.user_id;'
      );
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('Alice'));
      assert.ok(result.stdout.includes('Laptop'));
    });

    it('should handle syntax errors', async () => {
      const result = await runtime.execute('SELEC * FORM test;');
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.stderr.length > 0);
    });

    it('should handle empty input', async () => {
      const result = await runtime.execute('');
      assert.equal(result.exitCode, 0);
    });

    it('should measure execution duration', async () => {
      const result = await runtime.execute('SELECT 1;');
      assert.ok(result.duration >= 0);
      assert.ok(result.duration < 5000);
    });

    it('should support JSON functions', async () => {
      const result = await runtime.execute(
        "SELECT json_object('name', 'test', 'value', 42);"
      );
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('test'));
    });

    it('should support math functions', async () => {
      const result = await runtime.execute(
        'SELECT sqrt(144), pow(2, 10);'
      );
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('12'));
      assert.ok(result.stdout.includes('1024'));
    });
  });

  describe('reset()', () => {
    it('should clear the database on reset', async () => {
      await runtime.execute('CREATE TABLE temp (x INTEGER);');
      await runtime.reset();
      const result = await runtime.execute('SELECT * FROM temp;');
      // Table should not exist after reset
      assert.notEqual(result.exitCode, 0);
    });
  });

  describe('destroy()', () => {
    it('should throw on execute after destroy', async () => {
      const r = await createRuntime();
      r.destroy();
      assert.equal(r.ready, false);
      await assert.rejects(
        () => r.execute('SELECT 1;'),
        /destroyed/,
      );
    });
  });
});
