import { EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";
import PaginationUtility from "../../lib/pagination/PaginationUtility";
import { DEMO_PAGINATION_PAGE_SIZE } from "../../constants/limits";

export default class Users extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "users",
      description: "Shows a paginated list of users (Demo).",
      category: ECategory.utilities,
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: false,
      cooldown: 3,
      dev: true,
      supports: {
        slash: true,
        prefix: true,
      },
      options: [],
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
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

    const page = 1;
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

    let responseMessage;
    if (context.interaction) {
      const response = await context.interaction.reply({
        embeds: [embed],
        components: [row],
        withResponse: true,
      });
      responseMessage = response.resource?.message;
    } else {
      responseMessage = await context.message!.reply({
        embeds: [embed],
        components: [row],
      });
    }

    if (responseMessage) {
      const userId = context.interaction?.user.id ?? context.message!.author.id;
      InteractionLifecycle.track(responseMessage as any, userId);
    }
  }
}
