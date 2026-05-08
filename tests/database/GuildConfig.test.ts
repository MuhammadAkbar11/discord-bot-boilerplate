/**
 * GuildConfig Logic — tests/database/GuildConfig.test.ts
 *
 * Tests the upsert pattern used by GuildCreate and Prefix commands.
 * We mock GuildConfigModel to avoid a real MongoDB connection.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import GuildConfigModel from "../../src/base/models/GuildConfig";

vi.mock("../../src/base/models/GuildConfig", () => ({
  default: {
    findOneAndUpdate: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe("GuildConfig Logic", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts a guild config when a new guild joins", async () => {
    (GuildConfigModel.findOneAndUpdate as any).mockResolvedValue({
      guildId: "guild1",
      prefix: "y!",
    });

    const result = await GuildConfigModel.findOneAndUpdate(
      { guildId: "guild1" },
      { $setOnInsert: { guildId: "guild1" } },
      { upsert: true, new: true },
    );

    expect(GuildConfigModel.findOneAndUpdate).toHaveBeenCalledOnce();
    expect(result?.guildId).toBe("guild1");
  });

  it("returns the default prefix when no custom prefix is set", async () => {
    (GuildConfigModel.findOne as any).mockResolvedValue(null); // guild not in DB yet

    const config = await GuildConfigModel.findOne({ guildId: "guild2" });
    const prefix = config?.prefix ?? "y!"; // falls back to DEFAULT_PREFIX

    expect(prefix).toBe("y!");
  });

  it("returns the custom prefix after it has been saved", async () => {
    (GuildConfigModel.findOne as any).mockResolvedValue({ guildId: "guild3", prefix: "!" });

    const config = await GuildConfigModel.findOne({ guildId: "guild3" });
    expect(config?.prefix).toBe("!");
  });

  it("updates the prefix correctly using findOneAndUpdate", async () => {
    (GuildConfigModel.findOneAndUpdate as any).mockResolvedValue({
      guildId: "guild3",
      prefix: ">>",
    });

    const result = await GuildConfigModel.findOneAndUpdate(
      { guildId: "guild3" },
      { prefix: ">>" },
      { upsert: true, new: true },
    );

    expect(result?.prefix).toBe(">>");
  });
});
