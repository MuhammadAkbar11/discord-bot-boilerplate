import {
  ChatInputCommandInteraction,
  CacheType,
  AutocompleteInteraction,
  ApplicationCommandOptionData,
} from "discord.js";
import ECategory from "../enums/ECategory";
import ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import ICommandOptions from "../interfaces/ICommandOptions";

export default class Command implements ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: ECategory;
  options: ApplicationCommandOptionData[];
  default_member_permissions: bigint;
  dm_permission: boolean;
  cooldown: number;
  dev: boolean;

  constructor(client: CustomClient, options: ICommandOptions) {
    this.client = client;
    this.options = options.options;
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.default_member_permissions = options.default_member_permissions;
    this.dm_permission = options.dm_permission;
    this.cooldown = options.cooldown;
    this.dev = options.dev;
  }

  Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
    // throw new Error("Method not implemented.");
  }
  AutoComplete(interaction: AutocompleteInteraction<CacheType>): void {
    // throw new Error("Method not implemented.");
  }
}
