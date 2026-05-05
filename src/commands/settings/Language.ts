import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Language extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "language",
      commandName: "settings",
      supports: {
        slash: true,
        prefix: true,
      },
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    const locale = context.interaction
      ? context.interaction.options.getString("locale", true)
      : context.args[0];

    if (!locale) {
      const response = "❌ Please provide a language locale.";
      if (context.interaction) {
        await context.interaction.reply({ content: response, ephemeral: true });
      } else {
        await context.message!.reply(response);
      }
      return;
    }

    // Example logic to update language in a database would go here

    const response = `✅ Server language has been successfully updated to \`${locale}\`.`;
    if (context.interaction) {
      await context.interaction.reply({ content: response, ephemeral: true });
    } else {
      await context.message!.reply(response);
    }
  }
}
