import { describe, it, expect, vi } from "vitest";
import Info from "../../src/commands/user/Info";

describe("Info Command Autocomplete", () => {
  it("should respect Discord result limits (max 25)", async () => {
    const mockClient = {} as any;
    const command = new Info(mockClient);

    const mockInteraction = {
      options: {
        getFocused: () => "test",
      },
      guild: {
        members: {
          fetch: vi.fn().mockResolvedValue([
            { id: "1", user: { tag: "User#0001" } },
          ]),
        },
      },
      respond: vi.fn().mockResolvedValue({}),
    } as any;

    await command.AutoComplete(mockInteraction);

    expect(mockInteraction.guild.members.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 25,
      }),
    );
  });
});
