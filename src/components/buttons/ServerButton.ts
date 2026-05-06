import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
} from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";

export default class ServerButton extends Button {
  constructor(client: CustomClient) {
    super(client, {
      name: "server_page",
    });
  }

  async Execute(interaction: ButtonInteraction): Promise<void | any> {
    const [_, ownerId, category, pageStr] = interaction.customId.split(":");
    const page = parseInt(pageStr);

    // Ownership check
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "❌ You cannot interact with this button.",
        flags: [MessageFlags.Ephemeral],
      });
    }

    const guild = interaction.guild;
    if (!guild) return;

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    let items: string[] = [];
    let title = "";

    switch (category) {
      case "roles":
        items = guild.roles.cache
          .sort((a, b) => b.position - a.position)
          .filter(r => r.id !== guild.id)
          .map(r => `• ${r.toString()} (\`${r.members.size}\`)`);
        title = "🎭 Server Roles";
        break;
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

        items = channelTree;
        title = "📁 Server Channels";
        break;
      case "emojis":
        items = guild.emojis.cache.map(e => e.toString());
        title = "😀 Server Emojis";
        break;
    }

    const pageSize = 15;
    const totalPages = Math.ceil(items.length / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const currentItems = items.slice(start, end);

    embed
      .setTitle(title)
      .setDescription(currentItems.join("\n") || "No items found.")
      .setFooter({
        text: `Page ${page} of ${totalPages} • Requested by ${interaction.user.tag}`,
      });

    const components: any[] = [
      ActionRowBuilder.from(interaction.message.components[0] as any),
    ]; // Keep the select menu

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
      new ButtonBuilder()
        .setCustomId(`dismiss:${ownerId}`)
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger)
    );
    components.push(buttonRow);

    await interaction.update({ embeds: [embed], components });
  }
}
