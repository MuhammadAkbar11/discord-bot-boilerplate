import { AutocompleteInteraction, EmbedBuilder, time, TimestampStyles } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Info extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "info",
      commandName: "user",
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
          // Fallback if ID is invalid or user not found
        }
      }
    } else {
      target = context.message!.mentions.users.first() || context.message!.author;
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
      .setAuthor({
        name: target.tag,
        iconURL: target.displayAvatarURL(),
      })
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Username", value: target.username, inline: true },
        { name: "User ID", value: target.id, inline: true },
        {
          name: "Account Created",
          value: `${time(target.createdAt, TimestampStyles.RelativeTime)} (${time(
            target.createdAt,
            TimestampStyles.LongDate
          )})`,
          inline: false,
        }
      )
      .setColor("Blue")
      .setTimestamp();

    if (member) {
      embed.addFields({
        name: "Joined Server",
        value: member.joinedAt
          ? `${time(member.joinedAt, TimestampStyles.RelativeTime)} (${time(
              member.joinedAt,
              TimestampStyles.LongDate
            )})`
          : "Unknown",
        inline: false,
      });

      const roles = member.roles.cache
        .filter((role) => role.name !== "@everyone")
        .map((role) => role.toString());

      if (roles.length > 0) {
        embed.addFields({
          name: `Roles (${roles.length})`,
          value: roles.slice(0, 10).join(" ") + (roles.length > 10 ? ` ...and ${roles.length - 10} more` : ""),
          inline: false,
        });
      }
    }

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

    const members = await guild.members.fetch({ query: focusedValue, limit: 25 });
    
    await interaction.respond(
      members.map(member => ({
        name: member.user.tag,
        value: member.id,
      }))
    );
  }
}
