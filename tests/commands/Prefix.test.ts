import { describe, it, expect, vi, beforeEach } from "vitest";
import Prefix from "../../src/commands/utils/Prefix";
import GuildConfigModel from "../../src/base/models/GuildConfig";

vi.mock("../../src/base/models/GuildConfig", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

describe("Prefix Command", () => {
  let command: Prefix;

  beforeEach(() => {
    command = new Prefix({} as any);
    vi.clearAllMocks();
  });

  it("should return default prefix if none stored", async () => {
    const mockInteraction = {
      guildId: "123",
      options: { getString: () => null },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    (GuildConfigModel.findOne as any).mockResolvedValue(null);

    await command.Execute({ interaction: mockInteraction } as any);

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: [
          expect.objectContaining({
            data: expect.objectContaining({
              description: expect.stringContaining("Current prefix is"),
            }),
          }),
        ],
      }),
    );
  });

  it("should update prefix on valid input", async () => {
    const mockInteraction = {
      guildId: "123",
      options: { getString: () => "!" },
      memberPermissions: { has: () => true },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    await command.Execute({ interaction: mockInteraction } as any);

    expect(GuildConfigModel.findOneAndUpdate).toHaveBeenCalledWith(
      { guildId: "123" },
      { prefix: "!" },
      expect.anything(),
    );
    expect(mockInteraction.reply).toHaveBeenCalled();
  });

  it("should reject invalid prefix length", async () => {
    const mockInteraction = {
      guildId: "123",
      options: { getString: () => "toolong" },
      memberPermissions: { has: () => true },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    await command.Execute({ interaction: mockInteraction } as any);

    expect(GuildConfigModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("between 1 and 5"),
        ephemeral: true,
      }),
    );
  });

  it("should reject whitespace only prefix", async () => {
    const mockInteraction = {
      guildId: "123",
      options: { getString: () => "   " },
      memberPermissions: { has: () => true },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    await command.Execute({ interaction: mockInteraction } as any);

    expect(GuildConfigModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("cannot be whitespace only"),
        ephemeral: true,
      }),
    );
  });

  it("should reject if user lacks permission", async () => {
    const mockInteraction = {
      guildId: "123",
      options: { getString: () => "!" },
      memberPermissions: { has: () => false },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    await command.Execute({ interaction: mockInteraction } as any);

    expect(GuildConfigModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("do not have permission"),
        ephemeral: true,
      }),
    );
  });

  it("should throw error on DB failure", async () => {
    const mockInteraction = {
      guildId: "123",
      options: { getString: () => null },
      reply: vi.fn().mockResolvedValue({}),
    } as any;

    (GuildConfigModel.findOne as any).mockRejectedValue(new Error("DB down"));

    await expect(command.Execute({ interaction: mockInteraction } as any)).rejects.toThrow();
  });
});
