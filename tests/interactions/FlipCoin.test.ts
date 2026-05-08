/**
 * FlipCoin Button — tests/interactions/FlipCoin.test.ts
 *
 * The FlipCoin button handles a coin-flip game. It uses ownership checks
 * (encoded in the customId) to prevent other users from clicking.
 */
import { describe, it, expect, vi } from "vitest";
import FlipCoin from "../../src/components/buttons/FlipCoin";

// Stub InteractionLifecycle.untrack so we don't need a real tracked message
vi.mock("../../src/lib/interactions/InteractionLifecycle", () => ({
  default: { untrack: vi.fn() },
}));

describe("FlipCoin Button", () => {
  /** Build a minimal fake button interaction */
  function makeInteraction(choice: string, userId: string, ownerId: string) {
    return {
      customId: `flipcoin:${ownerId}:${choice}`,
      user: {
        id: userId,
        tag: "User#0001",
        displayAvatarURL: () => "https://cdn.discordapp.com/avatar.png",
      },
      message: { id: "msg1" },
      reply: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    } as any;
  }

  it("rejects the interaction when it is triggered by a different user", async () => {
    const btn = new FlipCoin({} as any);
    const interaction = makeInteraction("heads", "intruder", "owner1");

    await btn.Execute(interaction);

    // Should reply ephemerally with an error, not update the message
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.update).not.toHaveBeenCalled();
  });

  it("updates the message when triggered by the correct owner", async () => {
    const btn = new FlipCoin({} as any);
    const interaction = makeInteraction("heads", "owner1", "owner1");

    await btn.Execute(interaction);

    expect(interaction.update).toHaveBeenCalledOnce();
    // Buttons should be disabled after the flip
    const updateArg = interaction.update.mock.calls[0][0];
    const buttons = updateArg.components[0].toJSON().components;
    expect(buttons.every((b: any) => b.disabled)).toBe(true);
  });

  it("includes the chosen side and result in the embed description", async () => {
    const btn = new FlipCoin({} as any);
    const interaction = makeInteraction("tails", "owner1", "owner1");

    await btn.Execute(interaction);

    const updateArg = interaction.update.mock.calls[0][0];
    const desc = updateArg.embeds[0].toJSON().description ?? "";
    expect(desc).toContain("Tails");
  });
});
