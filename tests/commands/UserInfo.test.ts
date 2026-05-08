/**
 * User Info Subcommand — tests/commands/UserInfo.test.ts
 *
 * The "user info" subcommand fetches and displays information about a Discord user.
 * We stub the client.users.fetch to avoid Discord API calls.
 */
import { describe, it, expect, vi } from "vitest";
import Info from "../../src/commands/user/Info";

describe("User Info Subcommand", () => {
  /** Build a fake user object */
  function makeUser(id = "42", username = "exampleuser") {
    return {
      id,
      tag: `${username}#0001`,
      username,
      createdAt: new Date("2020-01-01"),
      displayAvatarURL: () => "https://cdn.discordapp.com/avatar.png",
    } as any;
  }

  /** Build a minimal fake slash interaction */
  function makeSlashContext(targetId: string | null = null) {
    const author = makeUser("1", "author");
    const client = {
      users: { fetch: vi.fn().mockResolvedValue(makeUser("42", "fetcheduser")) },
    } as any;

    return {
      client,
      context: {
        interaction: {
          user: author,
          guild: null,
          options: { getString: () => targetId },
          reply: vi.fn().mockResolvedValue({}),
        },
        message: undefined,
        args: [],
      } as any,
    };
  }

  it("replies with an embed for the command author when no target is given", async () => {
    const { client, context } = makeSlashContext(null);
    const cmd = new Info(client);
    await cmd.Execute(context);

    expect(context.interaction.reply).toHaveBeenCalledOnce();
    const embed = context.interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed).toBeDefined();
  });

  it("fetches a different user when a target ID is provided", async () => {
    const { client, context } = makeSlashContext("42");
    const cmd = new Info(client);
    await cmd.Execute(context);

    expect(client.users.fetch).toHaveBeenCalledWith("42");
    expect(context.interaction.reply).toHaveBeenCalledOnce();
  });

  it("falls back to the author when the user fetch fails", async () => {
    const { client, context } = makeSlashContext("bad-id");
    client.users.fetch.mockRejectedValue(new Error("Unknown User"));

    const cmd = new Info(client);
    await cmd.Execute(context);

    // Should still reply even when fetch fails
    expect(context.interaction.reply).toHaveBeenCalledOnce();
  });
});
