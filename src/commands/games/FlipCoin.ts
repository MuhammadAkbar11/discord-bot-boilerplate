import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import InteractionLifecycle from "../../lib/interactions/InteractionLifecycle";

export default class FlipCoin extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "flipcoin",
      description: "Flip a coin and guess the result!",
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
    const user = context.interaction?.user ?? context.message!.author;

    const embed = new EmbedBuilder()
      .setTitle("🪙 Coin Flip")
      .setDescription("Choose your side!")
      .setColor("Blue")
      .setFooter({ text: `Game for ${user.tag}` })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`flipcoin:${user.id}:heads`)
        .setLabel("Heads")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`flipcoin:${user.id}:tails`)
        .setLabel("Tails")
        .setStyle(ButtonStyle.Primary),
    );

    let responseMessage;
    if (context.interaction) {
      const response = await context.interaction.reply({ embeds: [embed], components: [row], withResponse: true });
      responseMessage = response.resource?.message;
    } else {
      responseMessage = await context.message!.reply({ embeds: [embed], components: [row] });
    }

    if (responseMessage) {
      InteractionLifecycle.track(responseMessage as any, user.id);
    }
  }
}
