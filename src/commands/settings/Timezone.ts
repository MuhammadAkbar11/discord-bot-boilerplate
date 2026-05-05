import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";

export default class Timezone extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timezone",
      commandName: "settings",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const zone = interaction.options.getString("zone", true);
    
    // Example logic to update timezone in a database would go here

    await interaction.reply({
      content: `✅ Server timezone has been successfully updated to \`${zone}\`.`,
      ephemeral: true,
    });
  }
}
