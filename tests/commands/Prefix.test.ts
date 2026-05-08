/**
 * Prefix Command — tests/commands/Prefix.test.ts
 *
 * The /prefix command lets admins set the guild prefix and anyone view it.
 * We mock GuildConfigModel to keep tests fast and DB-free.
 */
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
  let cmd: Prefix;

  beforeEach(() => {
    cmd = new Prefix({} as any);
    vi.clearAllMocks();
  });

  /** Build a minimal fake slash interaction */
  function makeInteraction(
    prefix: string | null,
    hasManageGuild: boolean = true,
  ) {
    return {
      guildId: "guild1",
      options: { getString: () => prefix },
      memberPermissions: { has: () => hasManageGuild },
      reply: vi.fn().mockResolvedValue({}),
    } as any;
  }

  it("shows the current prefix when no 'set' option is provided", async () => {
    (GuildConfigModel.findOne as any).mockResolvedValue({ prefix: "!!" });

    const interaction = makeInteraction(null);
    await cmd.Execute({ interaction } as any);

    expect(interaction.reply).toHaveBeenCalledOnce();
    const embed = interaction.reply.mock.calls[0][0].embeds[0].toJSON();
    expect(embed.description).toContain("!!");
  });

  it("updates the prefix when a valid value is provided by an admin", async () => {
    (GuildConfigModel.findOneAndUpdate as any).mockResolvedValue({});

    const interaction = makeInteraction(">>", true);
    await cmd.Execute({ interaction } as any);

    expect(GuildConfigModel.findOneAndUpdate).toHaveBeenCalledWith(
      { guildId: "guild1" },
      { prefix: ">>" },
      expect.anything(),
    );
  });

  it("blocks prefix update when the user lacks ManageGuild permission", async () => {
    const interaction = makeInteraction("!", false); // no permission
    await cmd.Execute({ interaction } as any);

    expect(GuildConfigModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true }),
    );
  });

  it("rejects a prefix that is too long (more than 5 characters)", async () => {
    const interaction = makeInteraction("toolong", true);
    await cmd.Execute({ interaction } as any);

    expect(GuildConfigModel.findOneAndUpdate).not.toHaveBeenCalled();
    const embed = interaction.reply.mock.calls[0][0].embeds[0].toJSON();
    expect(embed.description).toContain("between 1 and 5");
  });
});
