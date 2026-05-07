import {
  ActionRowBuilder,
  ModalBuilder,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Feedback extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "feedback",
      description: "Send your feedback to the developers.",
      category: ECategory.utilities,
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: false,
      cooldown: 10,
      dev: false,
      supports: {
        slash: true,
        prefix: false,
      },
      options: [],
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    if (!context.interaction) return;

    const modal = new ModalBuilder()
      .setCustomId(`feedback:${context.interaction.user.id}`)
      .setTitle("Feedback");

    const subjectInput = new TextInputBuilder()
      .setCustomId("subject")
      .setLabel("Subject")
      .setPlaceholder("What is your feedback about?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100);

    const descriptionInput = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("Description")
      .setPlaceholder("Please provide more details...")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000);

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput);
    const secondActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await context.interaction.showModal(modal);
  }
}
