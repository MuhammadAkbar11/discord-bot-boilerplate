import { EmbedBuilder } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Avatar extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "avatar",
      commandName: "user",
      supports: {
        slash: true,
        prefix: true,
      },
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    let target = context.interaction
      ? context.interaction.options.getUser("target") || context.interaction.user
      : context.message!.mentions.users.first() || context.message!.author;

    // Fallback for prefix command if ID is provided but not a mention
    if (!context.interaction && !context.message!.mentions.users.first() && context.args[0]) {
      try {
        const fetchedUser = await this.client.users.fetch(context.args[0]);
        if (fetchedUser) target = fetchedUser;
      } catch {
        // Ignore fetch error, stick with author
      }
    }

    const guild = context.interaction?.guild ?? context.message?.guild;
    const member = guild?.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Avatar`)
      .setImage(target.displayAvatarURL({ size: 1024 }))
      .setColor(member?.displayHexColor ?? "Blue")
      .setFooter({ text: `Requested by ${context.interaction ? context.interaction.user.tag : context.message!.author.tag}` })
      .setTimestamp();

    if (context.interaction) {
      await context.interaction.reply({ embeds: [embed] });
    } else {
      await context.message!.reply({ embeds: [embed] });
    }
  }
}
