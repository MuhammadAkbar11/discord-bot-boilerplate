import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";

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
    // Initial data (same as in Pagination button handler for demo)
    const users = [
        { id: "1", tag: "UserOne#0001" },
        { id: "2", tag: "UserTwo#0002" },
        { id: "3", tag: "UserThree#0003" },
    ];
    
    const page = 1;
    const totalPages = 4; // ceil(10/3)

    const embed = new EmbedBuilder()
      .setTitle("👥 Paginated User List (Demo)")
      .setDescription(users.map(u => `• **${u.tag}** (ID: ${u.id})`).join("\n"))
      .setFooter({ text: `Page ${page} of ${totalPages}` })
      .setColor("Blue")
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`pagination:users:${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`pagination:users:${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
    );

    let responseMessage;
    if (context.interaction) {
      const response = await context.interaction.reply({ embeds: [embed], components: [row], withResponse: true });
      responseMessage = response.resource?.message;
    } else {
      responseMessage = await context.message!.reply({ embeds: [embed], components: [row] });
    }

    if (responseMessage) {
      const userId = context.interaction?.user.id ?? context.message!.author.id;
      InteractionLifecycle.track(responseMessage as any, userId);
    }
  }
}
