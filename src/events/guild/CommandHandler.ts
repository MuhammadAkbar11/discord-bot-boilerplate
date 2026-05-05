import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
  MessageFlags,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import Command from "../../base/classes/Command";

export default class CommandHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: "Command Handler event",
      once: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const command: Command = await this.client.commands?.get(
      interaction?.commandName,
    )!;

    if (!command)
      return (
        (await interaction.reply({
          content: "This Command does not exist!",
          flags: MessageFlags.Ephemeral,
        })) && this.client.commands.delete(interaction.commandName)
      );

    const { cooldowns } = this.client;
    if (!cooldowns.has(command.name))
      cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (
      timestamps.has(interaction.user.id) &&
      now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ Please wait another \'${(
                ((timestamps.get(interaction.user.id) || 0) +
                  cooldownAmount -
                  now) /
                1000
              ).toFixed()}\' seconds to run this command`,
            ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommand = `${interaction.commandName}${
        subCommandGroup ? `${subCommandGroup}` : ""
      }.${interaction.options.getSubcommand(false) || ""}`;

      return (
        this.client.subCommands.get(subCommand)?.Execute(interaction) ||
        command.Execute(interaction)
      );
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
