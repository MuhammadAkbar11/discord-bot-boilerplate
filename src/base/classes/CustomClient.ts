import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import IConfig from "../interfaces/IConfig";
import {
  DEV_DISCORD_CLIENT_ID,
  DEV_DISCORD_TOKEN,
  DEV_GUILD_ID,
  DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
  ENV_MODE,
  MONGO_URL,
} from "../../configs/varsConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import Button from "./Button";
import SelectMenu from "./SelectMenu";
import Modal from "./Modal";
import { connect, disconnect } from "mongoose";
import logger from "../../lib/logger";
import ErrorHandler from "../../lib/errors/ErrorHandler";

export default class CustomClient extends Client implements ICustomClient {
  handler: Handler;
  config: IConfig;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  buttons: Collection<string, Button>;
  selectMenus: Collection<string, SelectMenu>;
  modals: Collection<string, Modal>;
  aliases: Collection<string, string>;
  developmentMode: boolean;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.config = {
      token: DISCORD_TOKEN,
      discordClientId: DISCORD_CLIENT_ID,
      devToken: DEV_DISCORD_TOKEN || DISCORD_TOKEN,
      devDiscordClientId: DEV_DISCORD_CLIENT_ID || DISCORD_CLIENT_ID,
      devGuildId: DEV_GUILD_ID,
      databaseUrl: MONGO_URL,
    };
    this.handler = new Handler(this);
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
    this.modals = new Collection();
    this.aliases = new Collection();
    this.developmentMode = ENV_MODE === "development";

    this.on("error", (error) => ErrorHandler.handle(error));
    this.on("warn", (info) => logger.warn({ event: "discord_warning" }, info));
  }

  async Init(): Promise<void> {
    logger.info(
      { event: "init_start", mode: ENV_MODE },
      `Starting the bot in ${ENV_MODE} mode...`,
    );
    const token = this.developmentMode
      ? this.config.devToken
      : this.config.token;

    try {
      await this.LoadHandler();

      await this.login(token);
      logger.info(
        { event: "discord_connected" },
        "Successfully logged in to Discord.",
      );

      await connect(this.config.databaseUrl);
      logger.info(
        { event: "database_connected" },
        "Successfully connected to MongoDB.",
      );
    } catch (error) {
      logger.error(
        { event: "init_failed", error },
        "Failed to initialize the bot",
      );
      process.exit(1);
    }
  }

  async LoadHandler(): Promise<void> {
    await this.handler.LoadEvents();
    await this.handler.LoadCommands();
    await this.handler.LoadButtons();
    await this.handler.LoadSelectMenus();
    await this.handler.LoadModals();
  }

  async Shutdown(): Promise<void> {
    logger.info(
      { event: "shutdown_initiated" },
      "Graceful shutdown initiated...",
    );
    this.destroy();
    await disconnect();
    logger.info(
      { event: "shutdown_complete" },
      "Disconnected from Discord and MongoDB. Goodbye!",
    );
    process.exit(0);
  }
}
