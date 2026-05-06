import { ButtonInteraction, MessageFlags } from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";

export default class Dismiss extends Button {
  constructor(client: CustomClient) {
    super(client, {
      name: "dismiss",
    });
  }

  async Execute(interaction: ButtonInteraction): Promise<void | any> {
    const [_, ownerId] = interaction.customId.split(":");

    // Ownership check
    if (ownerId && interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "❌ You cannot dismiss this message.",
        flags: [MessageFlags.Ephemeral],
      });
    }

    try {
      await interaction.message.delete();
    } catch (error) {
      // If we can't delete (e.g. no permissions), just remove components
      await interaction.update({ components: [] });
    }
  }
}
