import { Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import GuildConfigSchema from "../../base/schema/GuildConfig";

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
      await GuildConfigSchema.findOneAndDelete({
        guildId: guild.id,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
