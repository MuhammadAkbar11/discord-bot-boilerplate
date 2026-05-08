/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from "vitest";
import StartupValidator from "../../src/lib/validation/StartupValidator";
import { Collection } from "discord.js";

describe("StartupValidator", () => {
  describe("validateEnvironment", () => {
    it("should throw if databaseUrl is missing", () => {
      expect(() =>
        StartupValidator.validateEnvironment({
          token: "",
          databaseUrl: "mongodb://localhost",
        }),
      ).toThrow();
    });

    it("should throw if token is missing", () => {
      expect(() =>
        StartupValidator.validateEnvironment({
          token: "token",
          databaseUrl: "",
        }),
      ).toThrow();
    });

    it("should not throw if both are present", () => {
      expect(() =>
        StartupValidator.validateEnvironment({
          token: "token",
          databaseUrl: "mongodb://localhost",
        }),
      ).not.toThrow();
    });
  });

  describe("validateCommands", () => {
    it("should throw on duplicate command names", () => {
      const mockClient = {
        commands: new Collection([
          ["help", { name: "help" }],
          ["help2", { name: "help" }],
        ]),
        subCommands: new Collection(),
      } as any;

      expect(() => StartupValidator.validateCommands(mockClient)).toThrowError(
        /Duplicate command name/,
      );
    });

    it("should throw on alias conflicts", () => {
      const mockClient = {
        commands: new Collection([
          ["help", { name: "help", aliases: ["h"] }],
          ["info", { name: "info", aliases: ["h"] }],
        ]),
        subCommands: new Collection(),
      } as any;

      expect(() => StartupValidator.validateCommands(mockClient)).toThrowError(
        /Alias conflict detected/,
      );
    });
  });

  describe("validateComponents", () => {
    it("should throw on duplicate button IDs", () => {
      const mockClient = {
        buttons: new Collection([
          ["confirm", { name: "confirm" }],
          ["confirm2", { name: "confirm" }],
        ]),
        selectMenus: new Collection(),
        modals: new Collection(),
      } as any;

      expect(() =>
        StartupValidator.validateComponents(mockClient),
      ).toThrowError(/Duplicate button ID/);
    });

    it("should throw on duplicate select menu IDs", () => {
      const mockClient = {
        buttons: new Collection(),
        selectMenus: new Collection([
          ["server", { name: "server" }],
          ["server2", { name: "server" }],
        ]),
        modals: new Collection(),
      } as any;

      expect(() =>
        StartupValidator.validateComponents(mockClient),
      ).toThrowError(/Duplicate select menu ID/);
    });

    it("should throw on duplicate modal IDs", () => {
      const mockClient = {
        buttons: new Collection(),
        selectMenus: new Collection(),
        modals: new Collection([
          ["feedback", { name: "feedback" }],
          ["feedback2", { name: "feedback" }],
        ]),
      } as any;

      expect(() =>
        StartupValidator.validateComponents(mockClient),
      ).toThrowError(/Duplicate modal ID/);
    });
  });
});
