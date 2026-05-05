import { Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import Command from "../../base/classes/Command";
import logger from "../../lib/logger";

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: "Ready Event",
      once: true,
    });
  }

  async Execute() {
    logger.info({ event: "ready", user: this.client?.user?.tag }, `${this.client?.user?.tag} is now ready`);

    const clientId = this.client.developmentMode
      ? this.client.config.devDiscordClientId
      : this.client.config.discordClientId;
    const commands: object[] = this.GetJson(this.client.commands);
    const productionCommands = this.GetJson(
      this.client.commands.filter(cmd => !cmd.dev),
    );
    const rest = new REST().setToken(
      this.client.developmentMode
        ? this.client.config.devToken
        : this.client.config.token,
    );
    if (!this.client.developmentMode) {
      const globalCommands = (await rest.put(
        Routes.applicationCommands(`${clientId}`),
        {
          body: productionCommands,
        },
      )) as unknown[];
      logger.info(
        { event: "commands_registered_global", count: globalCommands.length },
        `Successfully loaded ${globalCommands.length} global application (/) commands.`,
      );
    } else {
      const devCommands = (await rest.put(
        Routes.applicationGuildCommands(
          `${this.client.config.devDiscordClientId}`,
          `${this.client.config.devGuildId}`,
        ),
        {
          body: commands,
        },
      )) as unknown[];

      logger.info(
        { event: "commands_registered_guild", count: devCommands.length, guildId: this.client.config.devGuildId },
        `Successfully loaded ${devCommands.length} guild-specific application (/) commands.`,
      );
    }
  }

  private GetJson(commands: Collection<string, Command>): object[] {
    const data: object[] = [];

    commands.toJSON().forEach(command => {
      const cmd = command;

      data.push({
        name: cmd.name,
        description: cmd.description,
        options: cmd.options,
        category: cmd.category,
        cooldown: cmd.cooldown,
        default_member_permissions: +cmd.default_member_permissions.toString(),
        dm_permission: cmd.dm_permission,
        dev: cmd.dev,
      });
    });

    return data;
  }
}
