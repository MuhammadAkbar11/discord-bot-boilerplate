import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";

export default class Pagination extends Button {
  constructor(client: CustomClient) {
    super(client, {
      name: "pagination",
    });
  }

  async Execute(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;
    const [_, type, pageStr] = customId.split(":");
    let page = parseInt(pageStr);

    if (type === "users") {
      await this.handleUserPagination(interaction, page);
    }
  }

  private async handleUserPagination(
    interaction: ButtonInteraction,
    page: number,
  ): Promise<void> {
    // Mock data for demonstration
    const users = [
      { id: "1", tag: "UserOne#0001" },
      { id: "2", tag: "UserTwo#0002" },
      { id: "3", tag: "UserThree#0003" },
      { id: "4", tag: "UserFour#0004" },
      { id: "5", tag: "UserFive#0005" },
      { id: "6", tag: "UserSix#0006" },
      { id: "7", tag: "UserSeven#0007" },
      { id: "8", tag: "UserEight#0008" },
      { id: "9", tag: "UserNine#0009" },
      { id: "10", tag: "UserTen#0010" },
    ];

    const pageSize = 3;
    const totalPages = Math.ceil(users.length / pageSize);

    // Ensure page is within bounds
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const currentUsers = users.slice(start, end);

    const embed = new EmbedBuilder()
      .setTitle("👥 Paginated User List (Demo)")
      .setDescription(
        currentUsers.map(u => `• **${u.tag}** (ID: ${u.id})`).join("\n"),
      )
      .setFooter({ text: `Page ${page} of ${totalPages}` })
      .setColor("Blue")
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`pagination:users:${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId(`pagination:users:${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === totalPages),
    );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  }
}
