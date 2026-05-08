/* eslint-disable @typescript-eslint/no-unused-vars */
import CustomClient from "../../base/classes/CustomClient";
import logger from "../logger";

export default class StartupValidator {
  /**
   * Validates that required environment variables are present.
   */
  static validateEnvironment(config: {
    token: string;
    databaseUrl: string;
  }): void {
    const missing: string[] = [];

    if (!config.token) missing.push("DISCORD_TOKEN / DEV_DISCORD_TOKEN");
    if (!config.databaseUrl) missing.push("MONGO_URL");

    if (missing.length > 0) {
      const errorMsg = `Missing required environment configuration: ${missing.join(", ")}`;
      logger.error({ event: "startup_validation_failed", missing }, errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Validates that there are no duplicate commands or aliases.
   */
  static validateCommands(client: CustomClient): void {
    const commandNames = new Set<string>();
    const aliases = new Set<string>();

    client.commands.forEach((command) => {
      if (commandNames.has(command.name)) {
        const errorMsg = `Duplicate command name detected: ${command.name}`;
        logger.error(
          { event: "duplicate_command", name: command.name },
          errorMsg,
        );
        throw new Error(errorMsg);
      }
      commandNames.add(command.name);

      if (command.aliases) {
        command.aliases.forEach((alias) => {
          if (commandNames.has(alias) || aliases.has(alias)) {
            const errorMsg = `Alias conflict detected: ${alias} is already registered as a command or alias.`;
            logger.error({ event: "alias_conflict", alias }, errorMsg);
            throw new Error(errorMsg);
          }
          aliases.add(alias);
        });
      }
    });

    client.subCommands.forEach((subCommand, key) => {
      if (subCommand.aliases) {
        subCommand.aliases.forEach((alias) => {
          if (commandNames.has(alias) || aliases.has(alias)) {
            const errorMsg = `Alias conflict detected for subcommand alias: ${alias}`;
            logger.error({ event: "alias_conflict", alias }, errorMsg);
            throw new Error(errorMsg);
          }
          aliases.add(alias);
        });
      }
    });
  }

  /**
   * Validates that there are no duplicate component IDs.
   */
  static validateComponents(client: CustomClient): void {
    const buttonIds = new Set<string>();
    const selectMenuIds = new Set<string>();
    const modalIds = new Set<string>();

    client.buttons.forEach((button) => {
      if (buttonIds.has(button.name)) {
        const errorMsg = `Duplicate button ID detected: ${button.name}`;
        logger.error(
          { event: "duplicate_button", name: button.name },
          errorMsg,
        );
        throw new Error(errorMsg);
      }
      buttonIds.add(button.name);
    });

    client.selectMenus.forEach((menu) => {
      if (selectMenuIds.has(menu.name)) {
        const errorMsg = `Duplicate select menu ID detected: ${menu.name}`;
        logger.error(
          { event: "duplicate_select_menu", name: menu.name },
          errorMsg,
        );
        throw new Error(errorMsg);
      }
      selectMenuIds.add(menu.name);
    });

    client.modals.forEach((modal) => {
      if (modalIds.has(modal.name)) {
        const errorMsg = `Duplicate modal ID detected: ${modal.name}`;
        logger.error({ event: "duplicate_modal", name: modal.name }, errorMsg);
        throw new Error(errorMsg);
      }
      modalIds.add(modal.name);
    });
  }
}
