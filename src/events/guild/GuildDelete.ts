import { Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import GuildConfigModel from "../../base/models/GuildConfig";
import logger from "../../lib/logger";

export default class GuildDelete extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.GuildDelete,
      description: "Guild Delete Event",
      once: false,
    });
  }

  async Execute(guild: Guild): Promise<void> {
    try {
      await GuildConfigModel.findOneAndDelete({
        guildId: guild.id,
      });
      logger.info({ event: "guild_leave", guildId: guild.id }, `Left guild ${guild.name} (${guild.id})`);
    } catch (error) {
      logger.error({ event: "guild_delete_db_error", guildId: guild.id, error }, "Error removing guild config on leave");
    }
  }
}
