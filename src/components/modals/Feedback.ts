import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import Modal from "../../base/classes/Modal";
import CustomClient from "../../base/classes/CustomClient";
import EmbedUtility from "../../lib/embed/EmbedUtility";

export default class FeedbackModal extends Modal {
  constructor(client: CustomClient) {
    super(client, {
      name: "feedback",
    });
  }

  async Execute(interaction: ModalSubmitInteraction): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ownerId] = interaction.customId.split(":");

    // Ownership check
    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: "❌ You cannot interact with this modal.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const subject = interaction.fields.getTextInputValue("subject");
    const description = interaction.fields.getTextInputValue("description");

    const embed = EmbedUtility.createSuccessEmbed(
      "Your feedback has been submitted successfully!",
    )
      .setTitle("Feedback Received")
      .addFields(
        { name: "Subject", value: subject },
        { name: "Description", value: description },
      );

    await interaction.reply({
      embeds: [embed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
