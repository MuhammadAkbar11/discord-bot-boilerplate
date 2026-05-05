import { ChatInputCommandInteraction, CacheType } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import CustomClient from "./CustomClient";
import ISubCommandOptions from "../interfaces/ISubCommandOptions";

export default class SubCommand implements ISubCommand {
  client: CustomClient;
  name: string;
  commandName: string;
  subCommandGroup?: string;
  constructor(client: CustomClient, options: ISubCommandOptions) {
    this.client = client;
    this.name = options.name;
    this.commandName = options.commandName;
    this.subCommandGroup = options.subCommandGroup;
  }

  async Execute(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {}
}
