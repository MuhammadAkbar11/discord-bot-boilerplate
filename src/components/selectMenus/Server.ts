import {
  AnySelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ChannelType,
  MessageFlags,
  ButtonStyle,
} from "discord.js";
import SelectMenu from "../../base/classes/SelectMenu";
import CustomClient from "../../base/classes/CustomClient";
import EmbedUtility from "../../lib/embed/EmbedUtility";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";
import PaginationUtility from "../../lib/pagination/PaginationUtility";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../../constants/limits";

export default class ServerMenu extends SelectMenu {
  constructor(client: CustomClient) {
    super(client, {
      name: "server",
    });
  }

  async Execute(interaction: AnySelectMenuInteraction): Promise<void | any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const components: any[] = [];
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
          .filter((r) => r.id !== guild.id)
          .map((r) => `• ${r.toString()} (\`${r.members.size}\`)`);
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
          .filter((c) => c.type === ChannelType.GuildCategory)
          .sort((a, b) => (a as any).position - (b as any).position);

        const channelTree: string[] = [];

        // Orphans (no category)
        const orphans = guild.channels.cache
          .filter((c) => !c.parentId && c.type !== ChannelType.GuildCategory)
          .sort((a, b) => (a as any).position - (b as any).position);

        orphans.forEach((c) => channelTree.push(`• ${c.toString()}`));

        categories.forEach((cat) => {
          channelTree.push(`\n**${cat.name.toUpperCase()}**`);
          const children = guild.channels.cache
            .filter((c) => c.parentId === cat.id)
            .sort((a, b) => (a as any).position - (b as any).position);
          children.forEach((c) => channelTree.push(`  └ ${c.toString()}`));
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
        const emojis = guild.emojis.cache.map((e) => e.toString());
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
    const pagination = PaginationUtility.getPaginationResult(
      items,
      page,
      DEFAULT_PAGINATION_PAGE_SIZE,
    );

    embed
      .setTitle(title)
      .setDescription(pagination.items.join("\n") || "No items found.");

    // Update footer for pagination
    embed.setFooter({
      text: PaginationUtility.getFooterText(
        pagination.page,
        pagination.totalPages,
        `Requested by ${interaction.user.tag}`,
      ),
      iconURL: interaction.user.displayAvatarURL(),
    });

    const components: any[] = [
      ActionRowBuilder.from(interaction.message.components[0] as any),
    ]; // Keep the select menu

    if (pagination.totalPages > 1) {
      const buttonRow = PaginationUtility.createNavigationRow(
        pagination.page,
        pagination.totalPages,
        (p) => `server_page:${ownerId}:${category}:${p}`,
        ButtonStyle.Secondary,
      );
      components.push(buttonRow);
    }

    await interaction.update({ embeds: [embed], components });
    InteractionLifecycle.track(interaction.message, ownerId);
  }
}
