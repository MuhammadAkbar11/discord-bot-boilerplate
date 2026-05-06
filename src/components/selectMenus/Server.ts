import {
  AnySelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
} from "discord.js";
import SelectMenu from "../../base/classes/SelectMenu";
import CustomClient from "../../base/classes/CustomClient";
import EmbedUtility from "../../lib/embed/EmbedUtility";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";

export default class ServerMenu extends SelectMenu {
  constructor(client: CustomClient) {
    super(client, {
      name: "server",
    });
  }

  async Execute(interaction: AnySelectMenuInteraction): Promise<void | any> {
    const [_, ownerId, action] = interaction.customId.split(":");

    // Ownership check
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        embeds: [
          EmbedUtility.createErrorEmbed("You cannot interact with this menu."),
        ],
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (!interaction.isStringSelectMenu()) return;

    const category = interaction.values[0];
    const guild = interaction.guild;
    if (!guild) return;

    const embed = EmbedUtility.createBaseEmbed({
      user: interaction.user,
      thumbnail: guild?.iconURL() as string,
    });

    let components: any[] = [];
    const selectMenuRow = ActionRowBuilder.from(
      interaction.message.components[0] as any,
    );
    components.push(selectMenuRow);

    switch (category) {
      case "general":
        embed.setTitle(`📜 General Info: ${guild.name}`).addFields(
          { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
          {
            name: "Created At",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          { name: "Members", value: `${guild.memberCount}`, inline: true },
          {
            name: "Boosts",
            value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`,
            inline: true,
          },
        );
        break;

      case "roles":
        const roles = guild.roles.cache
          .sort((a, b) => b.position - a.position)
          .filter(r => r.id !== guild.id)
          .map(r => `• ${r.toString()} (\`${r.members.size}\`)`);
        await this.handlePaginatedList(
          interaction,
          embed,
          "🎭 Server Roles",
          roles,
          "roles",
          1,
          ownerId,
        );
        return;

      case "channels":
        const categories = guild.channels.cache
          .filter(c => c.type === ChannelType.GuildCategory)
          .sort((a, b) => (a as any).position - (b as any).position);

        const channelTree: string[] = [];

        // Orphans (no category)
        const orphans = guild.channels.cache
          .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory)
          .sort((a, b) => (a as any).position - (b as any).position);

        orphans.forEach(c => channelTree.push(`• ${c.toString()}`));

        categories.forEach(cat => {
          channelTree.push(`\n**${cat.name.toUpperCase()}**`);
          const children = guild.channels.cache
            .filter(c => c.parentId === cat.id)
            .sort((a, b) => (a as any).position - (b as any).position);
          children.forEach(c => channelTree.push(`  └ ${c.toString()}`));
        });

        await this.handlePaginatedList(
          interaction,
          embed,
          "📁 Server Channels",
          channelTree,
          "channels",
          1,
          ownerId,
        );
        return;

      case "emojis":
        const emojis = guild.emojis.cache.map(e => e.toString());
        await this.handlePaginatedList(
          interaction,
          embed,
          "😀 Server Emojis",
          emojis,
          "emojis",
          1,
          ownerId,
        );
        return;
    }

    await interaction.update({ embeds: [embed], components });
    InteractionLifecycle.track(interaction.message, ownerId);
  }

  private async handlePaginatedList(
    interaction: AnySelectMenuInteraction,
    embed: EmbedBuilder,
    title: string,
    items: string[],
    category: string,
    page: number,
    ownerId: string,
  ): Promise<void> {
    const pageSize = 15;
    const totalPages = Math.ceil(items.length / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const currentItems = items.slice(start, end);

    embed
      .setTitle(title)
      .setDescription(currentItems.join("\n") || "No items found.");

    // Update footer for pagination
    embed.setFooter({
      text: `Page ${page} of ${totalPages} • Requested by ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    });

    const components: any[] = [
      ActionRowBuilder.from(interaction.message.components[0] as any),
    ]; // Keep the select menu
    const buttonRow = new ActionRowBuilder<ButtonBuilder>();

    if (totalPages > 1) {
      buttonRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`server_page:${ownerId}:${category}:${page - 1}`)
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`server_page:${ownerId}:${category}:${page + 1}`)
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages),
      );
    }

    if (buttonRow.components.length > 0) {
      components.push(buttonRow);
    }

    await interaction.update({ embeds: [embed], components });
    InteractionLifecycle.track(interaction.message, ownerId);
  }
}
