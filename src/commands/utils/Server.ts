import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import EmbedUtility from "../../lib/embed/EmbedUtility";

export default class Server extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "server",
      description: "Displays information about the server.",
      category: ECategory.utilities,
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: false,
      cooldown: 5,
      dev: false,
      supports: {
        slash: true,
        prefix: true,
      },
      options: [],
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const guild = context.interaction?.guild ?? context.message!.guild;
    const user = context.interaction?.user ?? context.message!.author;

    if (!guild) return;

    const embed = EmbedUtility.createBaseEmbed({
      user,
      title: `🏰 Server Info: ${guild.name}`,
      description: "Select a category below to view more information.",
      thumbnail: guild.iconURL() || undefined,
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`server:${user.id}:info`)
      .setPlaceholder("Select a category...")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("General")
          .setValue("general")
          .setDescription("Basic server information.")
          .setEmoji("📜"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Roles")
          .setValue("roles")
          .setDescription("List of server roles.")
          .setEmoji("🎭"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Channels")
          .setValue("channels")
          .setDescription("List of server channels.")
          .setEmoji("📁"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Emojis")
          .setValue("emojis")
          .setDescription("List of server emojis.")
          .setEmoji("😀"),
      );

    const selectRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`dismiss:${user.id}`)
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger),
    );

    if (context.interaction) {
      await context.interaction.reply({
        embeds: [embed],
        components: [selectRow, buttonRow],
      });
    } else {
      await context.message!.reply({
        embeds: [embed],
        components: [selectRow, buttonRow],
      });
    }
  }
}
