import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";

export default class Language extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "language",
      commandName: "settings",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = interaction.options.getString("locale", true);
    
    // Example logic to update language in a database would go here

    await interaction.reply({
      content: `✅ Server language has been successfully updated to \`${locale}\`.`,
      ephemeral: true,
    });
  }
}
