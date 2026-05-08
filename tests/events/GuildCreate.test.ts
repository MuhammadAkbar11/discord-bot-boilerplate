import { describe, it, expect, vi, beforeEach } from "vitest";
import GuildCreate from "../../src/events/guild/GuildCreate";
import GuildConfigModel from "../../src/base/models/GuildConfig";

vi.mock("../../src/base/models/GuildConfig", () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe("GuildCreate Event", () => {
  let event: GuildCreate;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      user: { tag: "Bot#0001", displayAvatarURL: () => "http://avatar.url" },
    };
    event = new GuildCreate(mockClient as any);
    vi.clearAllMocks();
  });

  it("should create guild config on join using upsert", async () => {
    const mockOwner = {
      id: "1",
      tag: "Owner#0001",
      send: vi.fn().mockResolvedValue({}),
    };

    const mockGuild = {
      id: "123",
      name: "Test Guild",
      fetchOwner: vi.fn().mockResolvedValue(mockOwner),
      memberCount: 10,
      iconURL: () => null,
    } as any;

    (GuildConfigModel.findOneAndUpdate as any).mockResolvedValue({});

    await event.Execute(mockGuild);

    expect(GuildConfigModel.findOneAndUpdate).toHaveBeenCalledWith(
      { guildId: "123" },
      { $setOnInsert: { guildId: "123" } },
      { upsert: true, new: true },
    );

    expect(mockOwner.send).toHaveBeenCalled();
  });
});
