import { describe, it, expect } from "vitest";
import PrefixParser from "../../src/lib/prefix/PrefixParser";
import { ValidationError } from "../../src/lib/errors/AppError";

describe("PrefixParser", () => {
  it("should parse simple space-separated arguments", () => {
    const result = PrefixParser.parse("foo bar baz");
    expect(result).toEqual(["foo", "bar", "baz"]);
  });

  it("should parse quoted arguments as a single argument", () => {
    const result = PrefixParser.parse('foo "bar baz"');
    expect(result).toEqual(["foo", "bar baz"]);
  });

  it("should handle escaped quotes inside quotes", () => {
    const result = PrefixParser.parse('foo "bar \\"baz\\""');
    expect(result).toEqual(["foo", 'bar "baz"']);
  });

  it("should handle escaped quotes outside quotes", () => {
    const result = PrefixParser.parse("foo \\\"bar");
    expect(result).toEqual(["foo", '"bar']);
  });

  it("should throw ValidationError on unmatched quotes", () => {
    expect(() => PrefixParser.parse('foo "bar')).toThrow(ValidationError);
  });

  it("should handle multiple spaces correctly", () => {
    const result = PrefixParser.parse("foo   bar");
    expect(result).toEqual(["foo", "bar"]);
  });

  it("should handle empty string in quotes", () => {
    const result = PrefixParser.parse('foo "" bar');
    expect(result).toEqual(["foo", "", "bar"]);
  });
});
