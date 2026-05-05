import { Events, Message } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import GuildConfigModel, { DEFAULT_PREFIX } from "../../base/models/GuildConfig";
import logger from "../../lib/logger";
import CommandHandler from "./CommandHandler";

export default class PrefixCommandHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.MessageCreate,
      description: "Prefix Command Handler event",
      once: false,
    });
  }

  async Execute(message: Message): Promise<void> {
    if (!message.inGuild() || message.author.bot) return;

    const prefix = await this.GetPrefix(message.guildId);
    if (!message.content.startsWith(prefix)) return;

    const rawCommand = message.content.slice(prefix.length).trim();
    if (!rawCommand) return;

    const [commandName, ...args] = rawCommand.split(/\s+/);
    if (!commandName) return;

    await CommandHandler.ExecutePrefixCommand(
      this.client,
      message,
      prefix,
      commandName.toLowerCase(),
      args,
    );
  }

  private async GetPrefix(guildId: string): Promise<string> {
    try {
      const guildConfig = await GuildConfigModel.findOne({ guildId }).select("prefix").lean();
      return guildConfig?.prefix || DEFAULT_PREFIX;
    } catch (error) {
      logger.error(
        { event: "prefix_lookup_failed", guildId, error },
        "Failed to load guild prefix. Falling back to the default prefix.",
      );
      return DEFAULT_PREFIX;
    }
  }
}
