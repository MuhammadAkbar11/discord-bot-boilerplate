import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Settings extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "settings",
      description: "Manage bot settings for this server.",
      category: ECategory.utilities,
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      roles: ["Admin", "Moderator"],
      dm_permission: false,
      cooldown: 3,
      dev: true,
      supports: {
        slash: true,
        prefix: true,
      },
      options: [
        {
          name: "language",
          description: "Set the bot's language.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "locale",
              description: "The language locale (e.g., en, es).",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "timezone",
          description: "Set the server timezone.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "zone",
              description: "The timezone string (e.g., UTC).",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
      ],
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    // If a subcommand is executed, the CommandHandler will automatically
    // route it to the respective SubCommand class's Execute method.
    // This fallback runs if the user somehow executes the base command directly.
    const response = "Please select a valid setting to manage.";
    if (context.interaction) {
      await context.interaction.reply({ content: response });
    } else {
      await context.message!.reply(response);
    }
  }
}
