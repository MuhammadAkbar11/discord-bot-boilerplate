import { AutocompleteInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Avatar extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "avatar",
      commandName: "user",
      aliases: ["avatar", "ava"],
      supports: {
        slash: true,
        prefix: true,
      },
    });
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    let target = context.interaction?.user ?? context.message!.author;

    if (context.interaction) {
      const targetId = context.interaction.options.getString("target");
      if (targetId) {
        try {
          target = await this.client.users.fetch(targetId);
        } catch {
          // Fallback
        }
      }
    } else {
      target =
        context.message!.mentions.users.first() || context.message!.author;
      // Fallback for prefix command if ID is provided but not a mention
      if (!context.message!.mentions.users.first() && context.args[0]) {
        try {
          const fetchedUser = await this.client.users.fetch(context.args[0]);
          if (fetchedUser) target = fetchedUser;
        } catch {
          // Ignore fetch error
        }
      }
    }

    const guild = context.interaction?.guild ?? context.message?.guild;
    const member = guild?.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Avatar`)
      .setImage(target.displayAvatarURL({ size: 1024 }))
      .setColor(member?.displayHexColor ?? "Blue")
      .setFooter({
        text: `Requested by ${context.interaction ? context.interaction.user.tag : context.message!.author.tag}`,
      })
      .setTimestamp();

    if (context.interaction) {
      await context.interaction.reply({ embeds: [embed] });
    } else {
      await context.message!.reply({ embeds: [embed] });
    }
  }

  async AutoComplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const guild = interaction.guild;
    if (!guild) return;

    const members = await guild.members.fetch({
      query: focusedValue,
      limit: 25,
    });

    await interaction.respond(
      members.map((member) => ({
        name: member.user.tag,
        value: member.id,
      })),
    );
  }
}
