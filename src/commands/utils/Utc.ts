import { PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import logger from "../../lib/logger";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import DayjsUTC from "../../lib/date";
import EmbedUtility from "../../lib/embed/EmbedUtility";

export default class Utc extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "utc",
      description: "Shows the current UTC time.",
      category: ECategory.utilities,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: false,
      cooldown: 3,
      dev: true,
      supports: {
        slash: true,
        prefix: true,
      },
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const user = context.interaction?.user ?? context.message!.author;
    const dataUTC = DayjsUTC().format("HH:mm");
    const utcEmbed = EmbedUtility.createBaseEmbed({
      user,
      description: `**UTC Time:** \`${dataUTC}\` UTC`,
    });

    if (context.interaction) {
      await context.interaction.reply({
        embeds: [utcEmbed],
      });
    } else {
      await context.message!.reply({ embeds: [utcEmbed] });
    }

    logger.debug(
      {
        event: "utc_completed",
        date: dataUTC,
      },
      "Utc command completed successfully",
    );
  }
}
