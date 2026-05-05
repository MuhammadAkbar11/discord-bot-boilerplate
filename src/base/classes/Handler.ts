import { ENV_MODE } from "../../configs/varsConfig";
import IHandler from "../interfaces/IHandler";
import path from "path";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Events";
import Command from "./Command";
import SubCommand from "./SubCommand";
import logger from "../../lib/logger";

export default class Handler implements IHandler {
  eventFilepath: string;
  commandsFilepath: string;
  client: CustomClient;
  constructor(client: CustomClient) {
    this.client = client;
    this.eventFilepath =
      ENV_MODE === "development"
        ? "src/events/**/*.ts"
        : "build/events/**/*.js";

    this.commandsFilepath =
      ENV_MODE === "development"
        ? "src/commands/**/*.ts"
        : "build/commands/**/*.js";
  }

  async LoadEvents(): Promise<void> {
    try {
      const files = (await glob(this.eventFilepath)).map(filePath =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async file => {
          const event: Event = new (await import(file)).default(this.client);

          if (!event?.name) {
            return logger.error({ event: "event_load_error", file: path.basename(file) }, "Event is missing a name.");
          }

          const execute = (...args: unknown[]) => event.Execute(...args);

          if (event.once) this.client?.once(event.name as string, execute);
          else this.client.on(event.name as string, execute);

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error({ event: "events_load_failed", error }, "Error loading events");
    }
  }

  async LoadCommands(): Promise<void> {
    try {
      const files = (await glob(this.commandsFilepath)).map(filePath =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async file => {
          const command: Command | SubCommand = new (await import(file)).default(
            this.client,
          );

          if (!command?.name) {
            return logger.error({ event: "command_load_error", file: path.basename(file) }, "Command is missing a name.");
          }

          if (command instanceof SubCommand) {
            const groupPrefix = command.subCommandGroup ? `${command.subCommandGroup}.` : "";
            const subCommandKey = `${command.commandName}.${groupPrefix}${command.name}`;
            this.client.subCommands?.set(subCommandKey, command);
          } else {
            this.client.commands.set(command.name, command as Command);
          }

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error({ event: "commands_load_failed", error }, "Error loading commands");
    }
  }
}
