import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ECategory from "../../base/enums/ECategory";

export default class Help extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "help",
      description: "Displays a list of available commands grouped by category.",
      category: ECategory.utilities,
      options: [
        {
          name: "category",
          description: "Filter commands by category.",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: Object.values(ECategory).map(cat => ({
            name: cat,
            value: cat,
          })),
        },
      ],
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: true,
      cooldown: 5,
      dev: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const selectedCategory = interaction.options.getString("category");
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📚 Bot Help Menu")
      .setThumbnail(this.client.user?.displayAvatarURL() || null)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    const commands = this.client.commands;

    if (selectedCategory) {
      const filteredCommands = commands.filter(
        cmd => cmd.category === selectedCategory,
      );

      if (filteredCommands.size === 0) {
        embed.setDescription(
          `No commands found in the **${selectedCategory}** category.`,
        );
      } else {
        embed.setTitle(`📚 Help: ${selectedCategory}`);
        embed.setDescription(
          filteredCommands
            .map(cmd => `\`/${cmd.name}\` — ${cmd.description}`)
            .join("\n"),
        );
      }
    } else {
      embed.setDescription(
        "Use `/help <category>` to view commands in a specific category.",
      );

      for (const category of Object.values(ECategory)) {
        const categoryCommands = commands.filter(
          cmd => cmd.category === category,
        );
        if (categoryCommands.size > 0) {
          embed.addFields({
            name: `${category} [${categoryCommands.size}]`,
            value: categoryCommands.map(cmd => `\`/${cmd.name}\``).join(", "),
            inline: false,
          });
        }
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
}
