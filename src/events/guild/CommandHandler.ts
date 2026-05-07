/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
  GuildMember,
  Interaction,
  InteractionReplyOptions,
  Message,
  MessageFlags,
  MessageReplyOptions,
  ModalSubmitInteraction,
  PermissionsBitField,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import Command from "../../base/classes/Command";
import logger from "../../lib/logger";
import {
  CommandExecutionType,
  ICommandExecutionContext,
} from "../../base/interfaces/ICommandExecutionContext";
import EmbedUtility from "../../lib/embed/EmbedUtility";
import ErrorHandler from "../../lib/errors/ErrorHandler";
import { DEFAULT_COMMAND_COOLDOWN } from "../../constants/bot";

export default class CommandHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: "Command Handler event",
      once: false,
    });
  }

  async Execute(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      await CommandHandler.ExecuteCommand(this.client, {
        type: "slash",
        commandName: interaction.commandName,
        args: [],
        interaction,
      });
    } else if (interaction.isAutocomplete()) {
      await CommandHandler.ExecuteAutocomplete(this.client, interaction);
    } else if (interaction.isButton()) {
      await CommandHandler.ExecuteButton(this.client, interaction);
    } else if (interaction.isAnySelectMenu()) {
      await CommandHandler.ExecuteSelectMenu(this.client, interaction);
    } else if (interaction.isModalSubmit()) {
      await CommandHandler.ExecuteModal(this.client, interaction);
    }
  }

  static async ExecutePrefixCommand(
    client: CustomClient,
    message: Message<true>,
    prefix: string,
    commandName: string,
    args: string[],
  ): Promise<void> {
    await CommandHandler.ExecuteCommand(client, {
      type: "prefix",
      commandName,
      args,
      prefix,
      message,
    });
  }

  private static async ExecuteCommand(
    client: CustomClient,
    context: ICommandExecutionContext,
  ): Promise<void> {
    const command: Command | undefined = client.commands?.get(
      context.commandName,
    );

    if (!command) {
      await CommandHandler.Reply(context, "This command does not exist!");
      client.commands.delete(context.commandName);
      return;
    }

    if (!command.supports[context.type]) {
      await CommandHandler.Reply(
        context,
        `This command does not support ${context.type} execution.`,
      );
      return;
    }

    // --- Cooldown check ---
    const { cooldowns } = client;
    if (!cooldowns.has(command.name))
      cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount =
      (command.cooldown || DEFAULT_COMMAND_COOLDOWN) * 1000;
    const user = CommandHandler.GetUser(context);

    if (
      timestamps.has(user.id) &&
      now < (timestamps.get(user.id) || 0) + cooldownAmount
    ) {
      const remaining = (
        ((timestamps.get(user.id) || 0) + cooldownAmount - now) /
        1000
      ).toFixed();
      await CommandHandler.Reply(context, {
        embeds: [
          EmbedUtility.createErrorEmbed(
            `Please wait another \`${remaining}\` seconds to run this command.`,
          ),
        ],
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    timestamps.set(user.id, now);
    setTimeout(() => timestamps.delete(user.id), cooldownAmount);

    // --- Permission & Role check ---
    if (
      context.type === "prefix" &&
      !command.dm_permission &&
      !context.message?.guild
    ) {
      await CommandHandler.Reply(
        context,
        "This command can only be used in a server.",
      );
      return;
    }

    const guild = context.interaction?.guild ?? context.message?.guild;
    if (guild) {
      const member = CommandHandler.GetMember(context);
      if (member) {
        // Check Discord Permissions
        if (command.default_member_permissions) {
          const missingPermissions = member.permissions.missing(
            command.default_member_permissions,
          );
          if (missingPermissions.length > 0) {
            const permissionNames = missingPermissions
              .map((p) => `**${new PermissionsBitField(p).toArray()}**`)
              .join(", ");

            logger.warn(
              {
                event: "command_permission_denied",
                command: command.name,
                executionType: context.type,
                user: user.tag,
                missingPermissions,
              },
              `User ${user.tag} denied execution of ${CommandHandler.FormatCommandName(context.type, command.name)} due to missing permissions: ${missingPermissions.join(", ")}`,
            );

            await CommandHandler.Reply(context, {
              embeds: [
                EmbedUtility.createErrorEmbed(
                  `You need the following permission(s) to use this command: ${permissionNames}`,
                ),
              ],
              flags: [MessageFlags.Ephemeral],
            });
            return;
          }
        }

        // Check Roles
        if (command.roles.length > 0) {
          const hasRole = command.roles.some(
            (roleIdOrName) =>
              member.roles.cache.has(roleIdOrName) ||
              member.roles.cache.some((r) => r.name === roleIdOrName),
          );

          if (!hasRole) {
            // const roleNames = command.roles.map((r) => `**${r}**`).join(" or ");

            logger.warn(
              {
                event: "command_role_denied",
                command: command.name,
                executionType: context.type,
                user: user.tag,
                requiredRoles: command.roles,
              },
              `User ${user.tag} denied execution of ${CommandHandler.FormatCommandName(context.type, command.name)} due to missing roles.`,
            );

            await CommandHandler.Reply(context, {
              embeds: [
                EmbedUtility.createErrorEmbed(
                  "You don't have permissions to use this command",
                ),
              ],
              flags: [MessageFlags.Ephemeral],
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
        executionType: context.type,
        user: user.tag,
        userId: user.id,
        guildId: guild?.id,
      },
      `User ${user.tag} executed command ${CommandHandler.FormatCommandName(context.type, command.name)}`,
    );

    try {
      const { subCommandGroup, subCommandName } =
        CommandHandler.GetSubCommand(context);

      if (subCommandName) {
        const groupPrefix = subCommandGroup ? `${subCommandGroup}.` : "";
        const subCommandKey = `${context.commandName}.${groupPrefix}${subCommandName}`;
        const subCommand = client.subCommands.get(subCommandKey);

        if (subCommand) {
          if (!subCommand.supports[context.type]) {
            await CommandHandler.Reply(
              context,
              `This subcommand does not support ${context.type} execution.`,
            );
            return;
          }

          await subCommand.Execute({
            ...context,
            args:
              context.type === "prefix" ? context.args.slice(1) : context.args,
          });
          return;
        }
      }

      await command.Execute(context);
    } catch (error) {
      await ErrorHandler.handle(error as Error, {
        interaction: context.interaction,
        message: context.message,
      });
    }
  }

  private static async ExecuteAutocomplete(
    client: CustomClient,
    interaction: AutocompleteInteraction,
  ): Promise<void> {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommandName = interaction.options.getSubcommand(false);

      if (subCommandName) {
        const groupPrefix = subCommandGroup ? `${subCommandGroup}.` : "";
        const subCommandKey = `${interaction.commandName}.${groupPrefix}${subCommandName}`;
        const subCommand = client.subCommands.get(subCommandKey);

        if (subCommand) {
          await subCommand.AutoComplete(interaction);
          return;
        }
      }

      await command.AutoComplete(interaction);
    } catch (error) {
      logger.error(
        {
          event: "autocomplete_error",
          command: interaction.commandName,
          user: interaction.user.tag,
          error: (error as Error).message,
        },
        `Error during autocomplete for command /${interaction.commandName}: ${(error as Error).message}`,
      );
    }
  }

  private static async ExecuteButton(
    client: CustomClient,
    interaction: ButtonInteraction,
  ): Promise<void> {
    const customId = interaction.customId;
    const buttonName = customId.split(":")[0];
    const button = client.buttons.get(buttonName);

    if (!button) return;

    logger.info(
      {
        event: "button_executed",
        button: button.name,
        user: interaction.user.tag,
        userId: interaction.user.id,
        guildId: interaction.guildId,
        customId,
      },
      `User ${interaction.user.tag} clicked button ${button.name} (${customId})`,
    );

    try {
      await button.Execute(interaction);
    } catch (error) {
      await ErrorHandler.handle(error as Error, { interaction });
    }
  }

  private static async ExecuteSelectMenu(
    client: CustomClient,
    interaction: AnySelectMenuInteraction,
  ): Promise<void> {
    const customId = interaction.customId;
    const menuName = customId.split(":")[0];
    const menu = client.selectMenus.get(menuName);

    if (!menu) return;

    logger.info(
      {
        event: "select_menu_executed",
        menu: menu.name,
        user: interaction.user.tag,
        userId: interaction.user.id,
        guildId: interaction.guildId,
        customId,
      },
      `User ${interaction.user.tag} used select menu ${menu.name} (${customId})`,
    );

    try {
      await menu.Execute(interaction);
    } catch (error) {
      await ErrorHandler.handle(error as Error, { interaction });
    }
  }

  private static async ExecuteModal(
    client: CustomClient,
    interaction: ModalSubmitInteraction,
  ): Promise<void> {
    const customId = interaction.customId;
    const modalName = customId.split(":")[0];
    const modal = client.modals.get(modalName);

    if (!modal) return;

    logger.info(
      {
        event: "modal_executed",
        modal: modal.name,
        user: interaction.user.tag,
        userId: interaction.user.id,
        guildId: interaction.guildId,
        customId,
      },
      `User ${interaction.user.tag} submitted modal ${modal.name} (${customId})`,
    );

    try {
      await modal.Execute(interaction);
    } catch (error) {
      await ErrorHandler.handle(error as Error, { interaction });
    }
  }

  private static GetSubCommand(context: ICommandExecutionContext): {
    subCommandGroup?: string | null;
    subCommandName?: string | null;
  } {
    if (context.interaction) {
      return {
        subCommandGroup: context.interaction.options.getSubcommandGroup(false),
        subCommandName: context.interaction.options.getSubcommand(false),
      };
    }

    return {
      subCommandName: context.args[0],
    };
  }

  private static GetUser(context: ICommandExecutionContext) {
    return context.interaction?.user ?? context.message!.author;
  }

  private static GetMember(
    context: ICommandExecutionContext,
  ): GuildMember | null {
    const guild = context.interaction?.guild ?? context.message?.guild;
    const user = CommandHandler.GetUser(context);
    const cachedMember = guild?.members.cache.get(user.id);
    if (cachedMember) return cachedMember;

    return context.message?.member instanceof GuildMember
      ? context.message.member
      : null;
  }

  private static FormatCommandName(
    type: CommandExecutionType,
    commandName: string,
  ): string {
    return type === "slash" ? `/${commandName}` : `${commandName}`;
  }

  private static async Reply(
    context: ICommandExecutionContext,
    response: string | InteractionReplyOptions,
  ): Promise<void> {
    if (context.interaction) {
      const payload: InteractionReplyOptions =
        typeof response === "string"
          ? { content: response, flags: [MessageFlags.Ephemeral] }
          : response;

      if (context.interaction.replied || context.interaction.deferred) {
        await context.interaction.followUp(payload);
      } else {
        await context.interaction.reply(payload);
      }
      return;
    }

    if (context.message) {
      if (typeof response === "string") {
        await context.message.reply(response);
      } else {
        const {
          flags: _flags,
          withResponse: _withResponse,
          ephemeral: _ephemeral,
          ...messageResponse
        } = response as InteractionReplyOptions &
          MessageReplyOptions & { ephemeral?: boolean };
        await context.message.reply(messageResponse);
      }
    }
  }
}
