import { Events, Message } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import GuildConfigModel from "../../base/models/GuildConfig";
import { DEFAULT_PREFIX } from "../../constants/bot";
import logger from "../../lib/logger";
import CommandHandler from "./CommandHandler";
import PrefixParser from "../../lib/prefix/PrefixParser";
import { ValidationError } from "../../lib/errors/AppError";
import ErrorHandler from "../../lib/errors/ErrorHandler";

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

    try {
      const parsedArgs = PrefixParser.parse(rawCommand);
      if (parsedArgs.length === 0) return;

      const commandName = parsedArgs[0];
      const args = parsedArgs.slice(1);

      await CommandHandler.ExecutePrefixCommand(
        this.client,
        message,
        prefix,
        commandName.toLowerCase(),
        args,
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        await ErrorHandler.handle(error, { message });
      } else {
        logger.error(
          { event: "prefix_parsing_error", error },
          "Failed to parse prefix command.",
        );
      }
    }
  }

  private async GetPrefix(guildId: string): Promise<string> {
    try {
      const guildConfig = await GuildConfigModel.findOne({ guildId })
        .select("prefix")
        .lean();
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
