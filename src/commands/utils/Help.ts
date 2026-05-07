/* eslint-disable @typescript-eslint/no-unused-vars */
import { PermissionsBitField, ApplicationCommandOptionType } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import logger from "../../lib/logger";
import EmbedUtility from "../../lib/embed/EmbedUtility";

export default class Help extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "help",
      description: "Displays a list of all available commands.",
      category: ECategory.utilities,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: true,
      cooldown: 5,
      dev: false,
      supports: {
        slash: true,
        prefix: true,
      },
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const type = context.type;
    const user = context.interaction?.user ?? context.message!.author;

    const embed = EmbedUtility.createBaseEmbed({
      user,
      title: "📚 Command Help",
      thumbnail: this.client.user?.displayAvatarURL(),
    });

    const helpLines: string[] = [];

    // Filter commands that support the current context type (slash or prefix)
    const supportedCommands = this.client.commands.filter(
      (cmd) => cmd.supports[type],
    );

    logger.debug(
      {
        event: "help_command",
        supportedCommands: Array.from(supportedCommands),
      },
      "supportedCommands",
    );

    for (const [_, command] of supportedCommands) {
      // Find subcommands for this command that also support the current context type
      const commandSubCommands = this.client.subCommands.filter(
        (sub) => sub.commandName === command.name && sub.supports[type],
      );

      if (commandSubCommands.size > 0) {
        // List each subcommand individually
        for (const [__, subCommand] of commandSubCommands) {
          let description = "No description provided.";

          // Helper to find the subcommand's description from the parent command's options
          const findSubDescription = (options: any[]): string | null => {
            for (const opt of options) {
              // Direct subcommand match
              if (
                opt.type === ApplicationCommandOptionType.Subcommand &&
                opt.name === subCommand.name
              ) {
                return opt.description;
              }
              // If it's a group and matches the subcommand's group, search inside it
              if (
                opt.type === ApplicationCommandOptionType.SubcommandGroup &&
                opt.name === subCommand.subCommandGroup
              ) {
                return findSubDescription(opt.options || []);
              }
            }
            return null;
          };

          description = findSubDescription(command.options) || description;

          const cmdPath = subCommand.subCommandGroup
            ? `${command.name} ${subCommand.subCommandGroup} ${subCommand.name}`
            : `${command.name} ${subCommand.name}`;

          helpLines.push(`\`${cmdPath}\` — ${description}`);
        }
      } else {
        // Regular command without subcommands
        helpLines.push(`\`${command.name}\` — ${command.description}`);
      }
    }

    // Sort alphabetically for better UX
    helpLines.sort((a, b) => a.localeCompare(b));

    embed.setDescription(
      helpLines.join("\n") || `No commands available for **${type}** mode.`,
    );

    if (context.interaction) {
      await context.interaction.reply({ embeds: [embed] });
    } else {
      await context.message!.reply({ embeds: [embed] });
    }
  }
}
