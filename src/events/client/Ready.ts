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
    logger.info(
      { event: "ready", user: this.client?.user?.tag },
      `${this.client?.user?.tag} is now ready`,
    );

    this.LogLoadedCommands();

    const clientId = this.client.developmentMode
      ? this.client.config.devDiscordClientId
      : this.client.config.discordClientId;
    const commands: object[] = this.GetJson(
      this.client.commands.filter((cmd) => cmd.supports.slash),
    );
    const productionCommands = this.GetJson(
      this.client.commands.filter((cmd) => !cmd.dev && cmd.supports.slash),
    );
    const rest = new REST().setToken(
      this.client.developmentMode
        ? this.client.config.devToken
        : this.client.config.token,
    );

    if (!this.client.developmentMode) {
      const globalCommands = (await rest.put(
        Routes.applicationCommands(`${clientId}`),
        { body: productionCommands },
      )) as unknown[];

      logger.info(
        {
          event: "commands_registered_global",
          count: globalCommands.length,
          names: this.client.commands.filter((c) => !c.dev).map((c) => c.name),
        },
        `Registered ${globalCommands.length} global application (/) commands.`,
      );
    } else {
      const devCommands = (await rest.put(
        Routes.applicationGuildCommands(
          `${this.client.config.devDiscordClientId}`,
          `${this.client.config.devGuildId}`,
        ),
        { body: commands },
      )) as unknown[];

      logger.info(
        {
          event: "commands_registered_guild",
          count: devCommands.length,
          guildId: this.client.config.devGuildId,
          names: this.client.commands.map((c) => c.name),
        },
        `Registered ${devCommands.length} guild application (/) commands.`,
      );
    }
  }

  /**
   * Logs a detailed summary of all loaded commands and their subcommands.
   */
  private LogLoadedCommands(): void {
    const subCommandSummary: Record<string, string[]> = {};

    this.client.subCommands.forEach((subCmd) => {
      const parent = subCmd.commandName;
      if (!subCommandSummary[parent]) subCommandSummary[parent] = [];
      const label = subCmd.subCommandGroup
        ? `${subCmd.subCommandGroup} > ${subCmd.name}`
        : subCmd.name;
      subCommandSummary[parent].push(label);
    });

    const total = this.client.commands.size + this.client.subCommands.size;

    const lines: string[] = [`Loaded (${total}) command(s).`];

    this.client.commands.forEach((cmd) => {
      lines.push(` - ${cmd.name}`);
      const subs = subCommandSummary[cmd.name];
      if (subs) {
        subs.forEach((s) => lines.push(`       - ${s}`));
      }
    });

    logger.info({ event: "commands_loaded", total }, lines.join("\n"));
  }

  private GetJson(commands: Collection<string, Command>): object[] {
    return commands.toJSON().map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
      options: cmd.options,
      default_member_permissions: +cmd.default_member_permissions.toString(),
      dm_permission: cmd.dm_permission,
    }));
  }
}
