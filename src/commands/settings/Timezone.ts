import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Timezone extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timezone",
      commandName: "settings",
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const zone = context.interaction
      ? context.interaction.options.getString(this.name, true)
      : context.args[0];

    if (!zone) {
      const response = "❌ Please provide a timezone.";
      if (context.interaction) {
        await context.interaction.reply({ content: response, ephemeral: true });
      } else {
        await context.message!.reply(response);
      }
      return;
    }

    // Example logic to update timezone in a database would go here

    const response = `✅ Server timezone has been successfully updated to \`${zone}\`.`;
    if (context.interaction) {
      await context.interaction.reply({ content: response, ephemeral: true });
    } else {
      await context.message!.reply(response);
    }
  }
}
