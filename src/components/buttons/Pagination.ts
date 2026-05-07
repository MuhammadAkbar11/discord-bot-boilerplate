import { ButtonInteraction, EmbedBuilder } from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";
import PaginationUtility from "../../lib/pagination/PaginationUtility";
import { DEMO_PAGINATION_PAGE_SIZE } from "../../constants/limits";

export default class Pagination extends Button {
  constructor(client: CustomClient) {
    super(client, {
      name: "pagination",
    });
  }

  async Execute(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, type, pageStr] = customId.split(":");
    const page = parseInt(pageStr);

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

    const pagination = PaginationUtility.getPaginationResult(
      users,
      page,
      DEMO_PAGINATION_PAGE_SIZE,
    );

    const embed = new EmbedBuilder()
      .setTitle("👥 Paginated User List (Demo)")
      .setDescription(
        pagination.items.map((u) => `• **${u.tag}** (ID: ${u.id})`).join("\n"),
      )
      .setFooter({
        text: PaginationUtility.getFooterText(
          pagination.page,
          pagination.totalPages,
        ),
      })
      .setColor("Blue")
      .setTimestamp();

    const row = PaginationUtility.createNavigationRow(
      pagination.page,
      pagination.totalPages,
      (p) => `pagination:users:${p}`,
    );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
    InteractionLifecycle.track(interaction.message, interaction.user.id);
  }
}
