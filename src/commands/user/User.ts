import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class User extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "user",
      description: "User related commands.",
      category: ECategory.utilities,
      dm_permission: false,
      cooldown: 3,
      supports: {
        slash: true,
        prefix: true,
      },
      options: [
        {
          name: "info",
          description: "Displays basic information about a user.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to get information about.",
              type: ApplicationCommandOptionType.User,
              required: false,
            },
          ],
        },
        {
          name: "avatar",
          description: "Displays the avatar of a user.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to get the avatar of.",
              type: ApplicationCommandOptionType.User,
              required: false,
            },
          ],
        },
      ],
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dev: false,
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const response = "Please select a valid user subcommand.";
    if (context.interaction) {
      await context.interaction.reply({ content: response, ephemeral: true });
    } else {
      await context.message!.reply(response);
    }
  }
}
