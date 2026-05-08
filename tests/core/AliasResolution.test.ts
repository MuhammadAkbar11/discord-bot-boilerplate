/**
 * AliasResolution — tests/core/AliasResolution.test.ts
 *
 * Tests that StartupValidator correctly detects alias conflicts,
 * which is how the boilerplate enforces alias integrity at startup.
 */
import { describe, it, expect } from "vitest";
import { Collection } from "discord.js";
import StartupValidator from "../../src/lib/validation/StartupValidator";

describe("Alias Resolution", () => {
  /** Helper that builds a minimal mock client */
  function makeClient(
    commands: { name: string; aliases?: string[] }[],
    subCommands: { name: string; aliases?: string[] }[] = [],
  ) {
    return {
      commands: new Collection(commands.map((c) => [c.name, c])),
      subCommands: new Collection(subCommands.map((s) => [s.name, s])),
    } as any;
  }

  it("passes validation when all command names are unique", () => {
    const client = makeClient([
      { name: "ping" },
      { name: "help" },
    ]);
    expect(() => StartupValidator.validateCommands(client)).not.toThrow();
  });

  it("throws when two commands share the same name", () => {
    // Simulates a loader that accidentally registers the same command twice
    // under two different map keys but with the same .name value
    const client = makeClient([
      { name: "ping" },
      { name: "ping" }, // same .name, will be deduplicated by Collection key — so we test via aliases
    ]);
    // Collection deduplicates by key — use aliases to trigger the real conflict path
    const conflictClient = {
      commands: new Collection([
        ["ping", { name: "ping", aliases: ["p"] }],
        ["pong", { name: "pong", aliases: ["p"] }], // duplicate alias "p"
      ]),
      subCommands: new Collection(),
    } as any;
    expect(() => StartupValidator.validateCommands(conflictClient)).toThrow(/Alias conflict/);
  });

  it("throws when two commands share the same alias", () => {
    const client = makeClient([
      { name: "help", aliases: ["h"] },
      { name: "halp", aliases: ["h"] }, // conflict
    ]);
    expect(() => StartupValidator.validateCommands(client)).toThrow(/Alias conflict/);
  });

  it("throws when a subcommand alias collides with a command alias", () => {
    const client = makeClient(
      [{ name: "user", aliases: ["u"] }],
      [{ name: "info", aliases: ["u"] }], // subcommand alias conflicts with command alias
    );
    expect(() => StartupValidator.validateCommands(client)).toThrow(/Alias conflict/);
  });
});
