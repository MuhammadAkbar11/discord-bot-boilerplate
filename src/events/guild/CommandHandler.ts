import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
  MessageFlags,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import Command from "../../base/classes/Command";
import logger from "../../lib/logger";

export default class CommandHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: "Command Handler event",
      once: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command: Command = this.client.commands?.get(interaction.commandName)!;

    if (!command) {
      await interaction.reply({
        content: "This command does not exist!",
        flags: MessageFlags.Ephemeral,
      });
      this.client.commands.delete(interaction.commandName);
      return;
    }

    // --- Cooldown check ---
    const { cooldowns } = this.client;
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(interaction.user.id) && now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount) {
      const remaining = (((timestamps.get(interaction.user.id) || 0) + cooldownAmount - now) / 1000).toFixed();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ Please wait another \`${remaining}\` seconds to run this command.`),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // --- Execution ---
    logger.info(
      {
        event: "command_executed",
        command: command.name,
        user: interaction.user.tag,
        userId: interaction.user.id,
        guildId: interaction.guildId,
      },
      `User ${interaction.user.tag} executed command /${command.name}`,
    );

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommandName = interaction.options.getSubcommand(false);

      if (subCommandName) {
        const groupPrefix = subCommandGroup ? `${subCommandGroup}.` : "";
        const subCommandKey = `${interaction.commandName}.${groupPrefix}${subCommandName}`;
        const subCommand = this.client.subCommands.get(subCommandKey);

        if (subCommand) {
          await subCommand.Execute(interaction);
          return;
        }
      }

      await command.Execute(interaction);
    } catch (error) {
      logger.error(
        { event: "command_error", command: command.name, error },
        `Error executing command /${command.name}`,
      );

      const errorMessage = "❌ An error occurred while executing this command.";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      }
    }
  }
}
