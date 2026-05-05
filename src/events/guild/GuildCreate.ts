import { EmbedBuilder, Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import GuildConfigModel from "../../base/models/GuildConfig";
import logger from "../../lib/logger";

export default class GuildCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.GuildCreate,
      description: "Guild Create Event",
      once: false,
    });
  }

  async Execute(guild: Guild): Promise<void> {
    try {
      const isGuildExisted = await GuildConfigModel.exists({
        guildId: guild.id,
      });

      if (!isGuildExisted) {
        await GuildConfigModel.create({
          guildId: guild.id,
        });
      }
    } catch (error) {
      logger.error({ event: "guild_create_db_error", guildId: guild.id, error }, "Error updating guild config on join");
      return;
    }

    const owner = await guild.fetchOwner();
    if (!owner) return;

    const botClient = this.client.user;
    const avatarUrl = botClient?.displayAvatarURL() as string;
    const Embed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(
        `Thank you for adding **${this.client.user?.tag}** to your server!`,
      )
      .setThumbnail(avatarUrl!)
      .setTimestamp()
      .setFooter({
        text: `${guild.name} • ${new Date().getFullYear()}`,
        iconURL: guild.iconURL() ?? undefined,
      })
      .addFields({
        name: "Owner",
        value: `<@${owner.id}>`,
        inline: true,
      })
      .addFields({
        name: "Member Count",
        value: `${guild.memberCount}`,
        inline: true,
      });

    owner.send({ embeds: [Embed] }).catch(error => {
      logger.error({ event: "guild_create_dm_error", guildId: guild.id, ownerId: owner.id, error }, "Error sending welcome DM to guild owner");
      return;
    });
  }
}
