import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import EmbedUtility from "../../lib/embed/EmbedUtility";
import GuildConfigModel from "../../base/models/GuildConfig";
import { DEFAULT_PREFIX } from "../../constants/bot";
import { AppError } from "../../lib/errors/AppError";

export default class Prefix extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "prefix",
      description: "View or update the guild prefix.",
      category: ECategory.utilities,
      options: [
        {
          name: "set",
          description: "Set the new prefix for the guild.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      aliases: [],
      dm_permission: false,
      cooldown: 5,
      dev: false,
      supports: {
        slash: true,
        prefix: false,
      },
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    if (!context.interaction) return; // Should not happen since supports.prefix is false

    const guildId = context.interaction.guildId;
    if (!guildId) {
      await context.interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const newPrefix = context.interaction.options.getString("set");

    try {
      if (newPrefix) {
        // Check permissions
        if (
          !context.interaction.memberPermissions?.has(
            PermissionsBitField.Flags.ManageGuild,
          )
        ) {
          await context.interaction.reply({
            embeds: [
              EmbedUtility.createErrorEmbed(
                "You do not have permission to update the server prefix.",
              ).setTitle("Prefix"),
            ],
            ephemeral: true,
          });
          return;
        }

        // Setter behavior
        // Validation
        if (newPrefix.length < 1 || newPrefix.length > 5) {
          await context.interaction.reply({
            embeds: [
              EmbedUtility.createErrorEmbed(
                "Prefix must be between 1 and 5 characters long.",
              ).setTitle("Prefix"),
            ],
            ephemeral: true,
          });
          return;
        }
        if (newPrefix.trim().length === 0) {
          await context.interaction.reply({
            embeds: [
              EmbedUtility.createErrorEmbed(
                "Prefix cannot be whitespace only.",
              ).setTitle("Prefix"),
            ],
            ephemeral: true,
          });
          return;
        }

        // Update DB
        await GuildConfigModel.findOneAndUpdate(
          { guildId },
          { prefix: newPrefix },
          { upsert: true, new: true },
        );

        const embed = EmbedUtility.createSuccessEmbed(
          `Prefix has been updated to \`${newPrefix}\``,
        ).setTitle("Prefix Updated");
        await context.interaction.reply({ embeds: [embed] });
      } else {
        // Getter behavior
        const config = await GuildConfigModel.findOne({ guildId });
        const currentPrefix = config?.prefix || DEFAULT_PREFIX;

        const embed = EmbedUtility.createInfoEmbed(
          `Current prefix is \`${currentPrefix}\``,
        ).setTitle("Prefix");
        await context.interaction.reply({ embeds: [embed] });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err: any) {
      throw new AppError(
        "Command operation failed",
        "Failed to get or set the prefix. Please try again later.",
        true,
      );
    }
  }
}
