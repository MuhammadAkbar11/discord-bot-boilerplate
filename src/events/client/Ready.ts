import { Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import Command from "../../base/classes/Command";

function ParsingResult(obj: any) {
  const stringifyObj = JSON.stringify(obj, (_, v) =>
    typeof v === "bigint" ? +v.toString() : v,
  );

  return JSON.parse(stringifyObj);
}

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: "Ready Event",
      once: true,
    });
  }

  async Execute(...args: any) {
    console.log(`${this.client?.user?.tag} is now ready`);

    const clientId = this.client.developmentMode
      ? this.client.config.devDiscordClientId
      : this.client.config.discordClientId;
    const commands: object[] = this.GetJson(this.client.commands);
    const productionCommands = this.GetJson(
      this.client.commands.filter(cmd => !cmd.dev),
    );
    const rest = new REST().setToken(this.client.config.token);
    if (!this.client.developmentMode) {
      const globalCommands: any = await rest.put(
        Routes.applicationCommands(`${clientId}`),
        {
          body: productionCommands,
        },
      );
      console.log(
        `Successfully loaded ${globalCommands.length} global application (/) commands.`,
      );
    } else {
      const devCommands: any = await rest.put(
        Routes.applicationGuildCommands(
          `${this.client.config.devDiscordClientId}`,
          `${this.client.config.devGuildId}`,
        ),
        {
          body: commands,
        },
        // { body: commands as unknown }
      );

      console.log(
        `Successfully loaded ${devCommands.length} applications (/) commands.`,
      );
    }
  }

  private GetJson(commands: Collection<string, Command>): object[] {
    const data: object[] = [];

    commands.toJSON().forEach(command => {
      const cmd = command;

      const commandOptions = {
        ...cmd.options,
        default_member_permissions:
          +cmd.options.default_member_permissions.toString(),
      };

      // if (commandOptions?.options?.length === 0) {
      delete commandOptions.options;
      // }
      data.push({
        name: cmd.name,
        description: cmd.description,
        // options: commandOptions,
        options: cmd.options?.options,
        category: cmd.category,
        cooldown: cmd.cooldown,
        default_member_permissions: +cmd.default_member_permissions.toString(),
        dm_permission: cmd.dm_permission,
        dev: cmd.dev,
      });
    });
    // console.log(data);
    return data;
  }
}
