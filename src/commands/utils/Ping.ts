import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import logger from "../../lib/logger";

export default class Ping extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "ping",
      description: "Replies with the bot's latency.",
      category: ECategory.utilities,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: false,
      cooldown: 3,
      dev: true,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    try {
      const response = await interaction.reply({
        embeds: [new EmbedBuilder().setDescription("Pinging...")],
        withResponse: true,
      });

      const latency =
        (response.resource?.message?.createdTimestamp ?? Date.now()) -
        interaction.createdTimestamp;

      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setDescription(
            `Pong! 🏓\nBot Latency: \`${latency}ms\`\nAPI Latency: \`${Math.round(this.client.ws.ping)}ms\``,
          ),
        ],
      });

      logger.debug(
        { event: "ping_completed", latency, apiPing: this.client.ws.ping },
        "Ping command completed successfully",
      );
    } catch (error) {
      logger.error(
        { event: "ping_error", error, userId: interaction.user.id },
        "Failed to execute ping command",
      );

      const errorMessage =
        "❌ An error occurred while executing the ping command.";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
}
