import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
  MessageFlags,
  PermissionsBitField,
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

    // --- Permission & Role check ---
    if (interaction.guild) {
      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (member) {
        // Check Discord Permissions
        if (command.default_member_permissions) {
          const missingPermissions = member.permissions.missing(command.default_member_permissions);
          if (missingPermissions.length > 0) {
            const permissionNames = missingPermissions
              .map((p) => `**${new PermissionsBitField(p).toArray()}**`)
              .join(", ");
            
            logger.warn(
              { event: "command_permission_denied", command: command.name, user: interaction.user.tag, missingPermissions },
              `User ${interaction.user.tag} denied execution of /${command.name} due to missing permissions: ${missingPermissions.join(", ")}`
            );

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("Red")
                  .setDescription(`❌ You need the following permission(s) to use this command: ${permissionNames}`),
              ],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
        }

        // Check Roles
        if (command.roles.length > 0) {
          const hasRole = command.roles.some((roleIdOrName) => 
            member.roles.cache.has(roleIdOrName) || member.roles.cache.some((r) => r.name === roleIdOrName)
          );

          if (!hasRole) {
            const roleNames = command.roles.map((r) => `**${r}**`).join(" or ");
            
            logger.warn(
              { event: "command_role_denied", command: command.name, user: interaction.user.tag, requiredRoles: command.roles },
              `User ${interaction.user.tag} denied execution of /${command.name} due to missing roles.`
            );

            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("Red")
                  .setDescription(`❌ You must have one of the following roles to use this command: ${roleNames}`),
              ],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
        }
      }
    }

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
