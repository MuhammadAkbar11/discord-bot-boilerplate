/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";
import EmbedUtility from "../../lib/embed/EmbedUtility";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";
import { EEmbedColor } from "../../constants/embeds";

export default class FlipCoin extends Button {
  constructor(client: CustomClient) {
    super(client, {
      name: "flipcoin",
    });
  }

  async Execute(interaction: ButtonInteraction): Promise<void | any> {
    const [_, ownerId, choice] = interaction.customId.split(":");

    // Ownership check
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        embeds: [
          EmbedUtility.createErrorEmbed(
            "You cannot interact with this button.",
          ),
        ],
        flags: [MessageFlags.Ephemeral],
      });
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const won = choice === result;

    const resultEmbed = EmbedUtility.createBaseEmbed({
      user: interaction.user,
      title: "🪙 Coin Flip Result",
      description:
        `You selected: **${choice.charAt(0).toUpperCase() + choice.slice(1)}**\n` +
        `Result: **${result.charAt(0).toUpperCase() + result.slice(1)}**\n\n` +
        (won ? "🎉 **You won!**" : "💀 **You lost!**"),
      color: won ? EEmbedColor.Success : EEmbedColor.Error,
    });

    // Disable buttons
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("flipcoin_disabled_heads")
        .setLabel("Heads")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("flipcoin_disabled_tails")
        .setLabel("Tails")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
    );

    await interaction.update({
      embeds: [resultEmbed],
      components: [row],
    });
    InteractionLifecycle.untrack(interaction.message.id);
  }
}
