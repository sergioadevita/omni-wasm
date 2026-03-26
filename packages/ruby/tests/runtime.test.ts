import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import createRuntime from '../src/index';
import type { WasmRuntime } from '@omni-wasm/shared';

describe('@omni-wasm/ruby', () => {
  let runtime: WasmRuntime;

  beforeAll(async () => {
    runtime = await createRuntime();
  });

  afterAll(() => {
    runtime.destroy();
  });

  describe('initialization', () => {
    it('should create a runtime instance', () => {
      expect(runtime).toBeDefined();
      expect(runtime.language).toBe('ruby');
      expect(runtime.ready).toBe(true);
    });

    it('should have a version string', () => {
      expect(runtime.version).toMatch(/CRuby 3.2/);
      expect(runtime.version).toMatch(/ruby.wasm/);
    });
  });

  describe('execute', () => {
    it('should execute simple puts', async () => {
      const result = await runtime.execute('puts "Hello, Ruby!"');
      expect(result.stdout).toContain('Hello, Ruby!');
      expect(result.exitCode).toBe(0);
    });

    it('should capture multiple puts', async () => {
      const result = await runtime.execute(`
puts "Line 1"
puts "Line 2"
puts "Line 3"
      `);
      expect(result.stdout).toContain('Line 1');
      expect(result.stdout).toContain('Line 2');
      expect(result.stdout).toContain('Line 3');
      expect(result.exitCode).toBe(0);
    });

    it('should handle arrays and blocks', async () => {
      const result = await runtime.execute(`
arr = [1, 2, 3, 4, 5]
result = arr.map { |x| x * 2 }
puts result.inspect
      `);
      expect(result.stdout).toContain('[2, 4, 6, 8, 10]');
      expect(result.exitCode).toBe(0);
    });

    it('should handle hashes', async () => {
      const result = await runtime.execute(`
hash = { "a" => 1, "b" => 2 }
puts hash["a"]
puts hash["b"]
      `);
      expect(result.stdout).toContain('1');
      expect(result.stdout).toContain('2');
      expect(result.exitCode).toBe(0);
    });

    it('should handle string interpolation', async () => {
      const result = await runtime.execute(`
name = "Ruby"
puts "Hello, #{name}!"
      `);
      expect(result.stdout).toContain('Hello, Ruby!');
      expect(result.exitCode).toBe(0);
    });

    it('should handle classes and objects', async () => {
      const result = await runtime.execute(`
class Greeter
  def initialize(name)
    @name = name
  end
  
  def greet
    "Hello, #{@name}!"
  end
end

g = Greeter.new("World")
puts g.greet
      `);
      expect(result.stdout).toContain('Hello, World!');
      expect(result.exitCode).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const result = await runtime.execute(`
puts "Before error"
1 / 0
puts "After error"
      `);
      expect(result.stdout).toContain('Before error');
      expect(result.stderr.length).toBeGreaterThan(0);
      expect(result.exitCode).not.toBe(0);
    });

    it('should return execution duration', async () => {
      const result = await runtime.execute('puts "test"');
      expect(result.duration).toBeGreaterThan(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should handle multiline code', async () => {
      const result = await runtime.execute(`
numbers = [1, 2, 3, 4, 5]
sum = 0
numbers.each { |n| sum += n }
puts sum
      `);
      expect(result.stdout).toContain('15');
      expect(result.exitCode).toBe(0);
    });

    it('should handle string output', async () => {
      const result = await runtime.execute(`
str = "hello"
puts str.upcase
puts str.reverse
      `);
      expect(result.stdout).toContain('HELLO');
      expect(result.stdout).toContain('olleh');
      expect(result.exitCode).toBe(0);
    });

    it('should handle numeric operations', async () => {
      const result = await runtime.execute(`
puts 2 + 3
puts 10 - 4
puts 3 * 4
puts 15 / 3
      `);
      expect(result.stdout).toContain('5');
      expect(result.stdout).toContain('6');
      expect(result.stdout).toContain('12');
      expect(result.stdout).toContain('5');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset the runtime state', async () => {
      // Execute code that creates a variable
      await runtime.execute('$test_var = "original"');

      // Reset the runtime
      await runtime.reset();

      // Try to access the variable (should be undefined)
      const result = await runtime.execute(`
begin
  puts $test_var
rescue => e
  puts "Variable not found"
end
      `);
      expect(result.stdout).toContain('Variable not found');
    });
  });

  describe('destroy', () => {
    it('should destroy the runtime', () => {
      runtime.destroy();
      expect(runtime.ready).toBe(false);
    });

    it('should throw error when executing on destroyed runtime', async () => {
      await expect(runtime.execute('puts "test"')).rejects.toThrow();
    });
  });
});
