import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import IConfig from "../interfaces/IConfig";
import {
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  DISCORD_TOKEN,
  ENV_MODE,
  MONGO_URL,
} from "../../configs/varsConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { connect } from "mongoose";

export default class CustomClient extends Client implements ICustomClient {
  handler: Handler;
  config: IConfig;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;
  developmentMode: boolean;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
      ],
    });

    this.config = {
      token: DISCORD_TOKEN,
      discordClientId: DISCORD_CLIENT_ID,
      devToken: DISCORD_TOKEN,
      devDiscordClientId: DISCORD_CLIENT_ID,
      devGuildId: DISCORD_GUILD_ID,
      databaseUrl: MONGO_URL,
    };
    this.handler = new Handler(this);
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.cooldowns = new Collection();
    this.developmentMode = ENV_MODE === "development";
  }

  async Init(): Promise<void> {
    console.log(`Starting the bot in ${ENV_MODE} mode`);
    const token = this.developmentMode
      ? this.config.devToken
      : this.config.token;
    try {
      await this.LoadHander();

      const login = await this.login(token);
      console.log("Logged in");
      console.log("connect to database....");

      await connect(this.config.databaseUrl);
      console.log("successed to connect database");
    } catch (error) {
      console.log(error);
      throw new Error("Error ");
    }
  }

  async LoadHander(): Promise<void> {
    await this.handler.LoadEvents();
    await this.handler.LoadCommands();
  }
}
