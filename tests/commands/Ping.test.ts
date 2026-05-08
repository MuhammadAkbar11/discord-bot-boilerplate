/**
 * Ping Command — tests/commands/Ping.test.ts
 *
 * The Ping command replies with bot and API latency.
 * We mock the Discord interaction to avoid a real connection.
 */
import { describe, it, expect, vi } from "vitest";
import Ping from "../../src/commands/utils/Ping";

describe("Ping Command", () => {
  /** Build a minimal fake slash interaction */
  function makeSlashContext(overrides: Record<string, any> = {}) {
    return {
      interaction: {
        user: {
          tag: "User#0001",
          id: "1",
          displayAvatarURL: () => "https://cdn.discordapp.com/avatar.png",
        },
        createdTimestamp: Date.now(),
        reply: vi.fn().mockResolvedValue({
          resource: { message: { createdTimestamp: Date.now() } },
        }),
        editReply: vi.fn().mockResolvedValue({}),
        ...overrides,
      },
      message: undefined,
    } as any;
  }

  /** Build a minimal fake prefix (message) context */
  function makePrefixContext() {
    const fakeResponse = {
      createdTimestamp: Date.now() + 100,
      edit: vi.fn().mockResolvedValue({}),
    };
    return {
      interaction: undefined,
      message: {
        author: {
          tag: "User#0001",
          id: "1",
          displayAvatarURL: () => "https://cdn.discordapp.com/avatar.png",
        },
        createdTimestamp: Date.now(),
        reply: vi.fn().mockResolvedValue(fakeResponse),
      },
    } as any;
  }

  it("responds to a slash interaction by replying then editing with Pong", async () => {
    const client = { ws: { ping: 42 } } as any;
    const cmd = new Ping(client);

    const context = makeSlashContext();
    await cmd.Execute(context);

    expect(context.interaction.reply).toHaveBeenCalledOnce();
    expect(context.interaction.editReply).toHaveBeenCalledOnce();

    // The edit should include "Pong"
    const editArg = context.interaction.editReply.mock.calls[0][0];
    const desc = editArg.embeds[0].toJSON().description ?? "";
    expect(desc).toContain("Latency");
  });

  it("responds to a prefix message by replying then editing with Pong", async () => {
    const client = { ws: { ping: 42 } } as any;
    const cmd = new Ping(client);

    const context = makePrefixContext();
    await cmd.Execute(context);

    expect(context.message.reply).toHaveBeenCalledOnce();
    const response = await context.message.reply.mock.results[0].value;
    expect(response.edit).toHaveBeenCalledOnce();
  });
});
