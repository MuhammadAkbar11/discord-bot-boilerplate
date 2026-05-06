import { EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import logger from "../../lib/logger";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import EmbedUtility from "../../lib/embed/EmbedUtility";

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
      supports: {
        slash: true,
        prefix: true,
      },
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const user = context.interaction?.user ?? context.message!.author;

    const pingEmbed = EmbedUtility.createBaseEmbed({
      user,
      title: "Pinging...",
    });
    const pongEmbed = (latency: number) =>
      EmbedUtility.createBaseEmbed({
        user,
        title: "Pong! 🏓",
        description: `Bot Latency: \`${latency}ms\`\nAPI Latency: \`${Math.round(this.client.ws.ping)}ms\``,
      });

    let latency: number;

    if (context.interaction) {
      const response = await context.interaction.reply({
        embeds: [pingEmbed],
        withResponse: true,
      });

      latency =
        (response.resource?.message?.createdTimestamp ?? Date.now()) -
        context.interaction.createdTimestamp;

      await context.interaction.editReply({
        embeds: [pongEmbed(latency)],
      });
    } else {
      const response = await context.message!.reply({ embeds: [pingEmbed] });
      latency = response.createdTimestamp - context.message!.createdTimestamp;
      await response.edit({ embeds: [pongEmbed(latency)] });
    }

    logger.debug(
      { event: "ping_completed", latency, apiPing: this.client.ws.ping },
      "Ping command completed successfully",
    );
  }
}
