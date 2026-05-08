import { ENV_MODE } from "../../configs/varsConfig";
import IHandler from "../interfaces/IHandler";
import path from "path";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Events";
import Command from "./Command";
import SubCommand from "./SubCommand";
import Button from "./Button";
import SelectMenu from "./SelectMenu";
import Modal from "./Modal";
import logger from "../../lib/logger";

export default class Handler implements IHandler {
  eventFilepath: string;
  commandsFilepath: string;
  buttonsFilepath: string;
  selectMenusFilepath: string;
  modalsFilepath: string;
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

    this.buttonsFilepath =
      ENV_MODE === "development"
        ? "src/components/buttons/**/*.ts"
        : "build/components/buttons/**/*.js";

    this.selectMenusFilepath =
      ENV_MODE === "development"
        ? "src/components/selectMenus/**/*.ts"
        : "build/components/selectMenus/**/*.js";

    this.modalsFilepath =
      ENV_MODE === "development"
        ? "src/components/modals/**/*.ts"
        : "build/components/modals/**/*.js";
  }

  async LoadEvents(): Promise<void> {
    try {
      const files = (await glob(this.eventFilepath)).map((filePath) =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async (file) => {
          const event: Event = new (await import(file)).default(this.client);

          if (!event?.name) {
            return logger.error(
              { event: "event_load_error", file: path.basename(file) },
              "Event is missing a name.",
            );
          }

          const execute = (...args: unknown[]) =>
            Promise.resolve(event.Execute(...args)).catch((error) => {
              logger.error(
                {
                  event: "event_execution_error",
                  eventName: event.name,
                  error,
                },
                `Unhandled error in event: ${event.name}`,
              );
            });

          if (event.once) this.client?.once(event.name as string, execute);
          else this.client.on(event.name as string, execute);

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error(
        { event: "events_load_failed", error },
        "Error loading events",
      );
    }
  }

  async LoadCommands(): Promise<void> {
    try {
      const files = (await glob(this.commandsFilepath)).map((filePath) =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async (file) => {
          const command: Command | SubCommand = new (
            await import(file)
          ).default(this.client);

          if (!command?.name) {
            return logger.error(
              { event: "command_load_error", file: path.basename(file) },
              "Command is missing a name.",
            );
          }

          if (command instanceof SubCommand) {
            const groupPrefix = command.subCommandGroup
              ? `${command.subCommandGroup}.`
              : "";
            const subCommandKey = `${command.commandName}.${groupPrefix}${command.name}`;
            this.client.subCommands?.set(subCommandKey, command);

            if (command.aliases) {
              for (const alias of command.aliases) {
                if (
                  this.client.commands.has(alias) ||
                  this.client.aliases.has(alias)
                ) {
                  logger.error(
                    { event: "alias_conflict", alias, file: path.basename(file) },
                    `Alias conflict: ${alias} is already registered as a command or alias.`,
                  );
                  continue;
                }
                this.client.aliases.set(alias, subCommandKey);
              }
            }
          } else {
            this.client.commands.set(command.name, command as Command);

            if (command.aliases) {
              for (const alias of command.aliases) {
                if (
                  this.client.commands.has(alias) ||
                  this.client.aliases.has(alias)
                ) {
                  logger.error(
                    { event: "alias_conflict", alias, file: path.basename(file) },
                    `Alias conflict: ${alias} is already registered as a command or alias.`,
                  );
                  continue;
                }
                this.client.aliases.set(alias, command.name);
              }
            }
          }

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error(
        { event: "commands_load_failed", error },
        "Error loading commands",
      );
    }
  }

  async LoadButtons(): Promise<void> {
    try {
      const files = (await glob(this.buttonsFilepath)).map((filePath) =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async (file) => {
          const button: Button = new (await import(file)).default(this.client);

          if (!button?.name) {
            return logger.error(
              { event: "button_load_error", file: path.basename(file) },
              "Button is missing a name.",
            );
          }

          this.client.buttons.set(button.name, button);

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error(
        { event: "buttons_load_failed", error },
        "Error loading buttons",
      );
    }
  }

  async LoadSelectMenus(): Promise<void> {
    try {
      const files = (await glob(this.selectMenusFilepath)).map((filePath) =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async (file) => {
          const selectMenu: SelectMenu = new (await import(file)).default(
            this.client,
          );

          if (!selectMenu?.name) {
            return logger.error(
              { event: "select_menu_load_error", file: path.basename(file) },
              "Select Menu is missing a name.",
            );
          }

          this.client.selectMenus.set(selectMenu.name, selectMenu);

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error(
        { event: "select_menus_load_failed", error },
        "Error loading select menus",
      );
    }
  }

  async LoadModals(): Promise<void> {
    try {
      const files = (await glob(this.modalsFilepath)).map((filePath) =>
        path.resolve(filePath),
      );

      await Promise.all(
        files.map(async (file) => {
          const modal: Modal = new (await import(file)).default(this.client);

          if (!modal?.name) {
            return logger.error(
              { event: "modal_load_error", file: path.basename(file) },
              "Modal is missing a name.",
            );
          }

          this.client.modals.set(modal.name, modal);

          delete require.cache[require.resolve(file)];
        }),
      );
    } catch (error) {
      logger.error(
        { event: "modals_load_failed", error },
        "Error loading modals",
      );
    }
  }
}
