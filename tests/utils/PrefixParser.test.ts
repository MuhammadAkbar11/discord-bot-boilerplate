/**
 * PrefixParser — tests/utils/PrefixParser.test.ts
 *
 * PrefixParser turns a raw command string into an array of arguments.
 * It supports quoted strings and escaped characters.
 */
import { describe, it, expect } from "vitest";
import PrefixParser from "../../src/lib/prefix/PrefixParser";

describe("PrefixParser", () => {
  it("splits a normal space-separated string into arguments", () => {
    const result = PrefixParser.parse("hello world foo");
    expect(result).toEqual(["hello", "world", "foo"]);
  });

  it("keeps words inside double-quotes as a single argument", () => {
    const result = PrefixParser.parse('say "hello world"');
    expect(result).toEqual(["say", "hello world"]);
  });

  it("handles an escaped quote inside a quoted string", () => {
    const result = PrefixParser.parse('"say \\"hi\\""');
    expect(result).toContain('say "hi"');
  });

  it("throws a ValidationError when quotes are not closed", () => {
    expect(() => PrefixParser.parse('hello "world')).toThrow();
  });
});
