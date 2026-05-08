import { describe, it, expect, vi } from "vitest";
import CommandHandler from "../../src/events/guild/CommandHandler";
import { Collection } from "discord.js";

vi.mock("../../src/lib/cooldowns/CooldownManager", () => ({
  default: {
    getRemainingCooldown: vi.fn().mockResolvedValue(null),
    setCooldown: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("Alias Execution", () => {
  it("should resolve command alias", async () => {
    const mockCommand = {
      name: "help",
      supports: { prefix: true },
      Execute: vi.fn().mockResolvedValue({}),
    } as any;

    const mockClient = {
      commands: new Collection(),
      aliases: new Collection(),
      cooldowns: new Collection(),
    } as any;

    mockClient.commands.set("help", mockCommand);
    mockClient.aliases.set("h", "help");

    const mockMessage = {
      guild: { members: { cache: new Collection() } },
      author: { id: "1" },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    await CommandHandler.ExecutePrefixCommand(
      mockClient,
      mockMessage,
      "y!",
      "h",
      [],
    );

    expect(mockCommand.Execute).toHaveBeenCalled();
  });

  it("should resolve subcommand alias", async () => {
    const mockSubCommand = {
      name: "info",
      commandName: "user",
      supports: { prefix: true },
      Execute: vi.fn().mockResolvedValue({}),
    } as any;

    const mockParentCommand = {
      name: "user",
      supports: { prefix: true },
    } as any;

    const mockClient = {
      commands: new Collection(),
      subCommands: new Collection(),
      aliases: new Collection(),
      cooldowns: new Collection(),
    } as any;

    mockClient.commands.set("user", mockParentCommand);
    mockClient.subCommands.set("user.info", mockSubCommand);
    mockClient.aliases.set("userinfo", "user.info");

    const mockMessage = {
      guild: { members: { cache: new Collection() } },
      author: { id: "1" },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    await CommandHandler.ExecutePrefixCommand(
      mockClient,
      mockMessage,
      "y!",
      "userinfo",
      [],
    );

    expect(mockSubCommand.Execute).toHaveBeenCalled();
  });
});
