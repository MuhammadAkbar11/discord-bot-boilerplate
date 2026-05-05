import { ENV_MODE } from "../../configs/varsConfig";
import IHandler from "../interfaces/IHandler";
import path from "path";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Events";
import Command from "./Command";
import SubCommand from "./SubCommand";

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

  async LoadEvents(): Promise<void | boolean> {
    try {
      const files = (await glob(this.eventFilepath)).map(filePath =>
        path.resolve(filePath),
      );
      // for (const file of files) {

      // }
      await Promise.all(
        files.map(async file => {
          const event: Event = new (await import(file)).default(this.client);

          if (!event?.name) {
            return (
              delete require.cache[require.resolve(file)] &&
              console.log(`${path.basename(file)} does not have name`)
            );
          }
          const execute = (...args: any) => event.Execute(...args);

          // @ts-ignore
          if (event.once) this.client?.once(event?.name, execute);
          // @ts-ignore
          else this.client.on(event?.name, execute);

          return delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async LoadCommands(): Promise<any> {
    try {
      const files = (await glob(this.commandsFilepath)).map(filePath =>
        path.resolve(filePath),
      );
      return await Promise.all(
        files.map(async file => {
          const command: Command | SubCommand = new (await import(file)).default(
            this.client,
          );
          if (!command?.name) {
            return (
              delete require.cache[require.resolve(file)] &&
              console.log(`${path.basename(file)} does not have name`)
            );
          }

          if (path.basename(file).split(".").length > 2) {
            return this.client.subCommands?.set(command?.name, command);
          }
          this.client.commands.set(command?.name, command as Command);

          return delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
