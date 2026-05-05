import {
  ChatInputCommandInteraction,
  CacheType,
  AutocompleteInteraction,
} from "discord.js";
import ECategory from "../enums/ECategory";
import ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import ICommanddOptions from "../interfaces/ICommandsOptions";

export default class Command implements ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: ECategory;
  options: any;
  default_member_permissions: bigint;
  dm_permission: boolean;
  cooldown: number;
  dev: boolean;

  constructor(client: CustomClient, options: ICommanddOptions) {
    this.client = client;
    this.options = options;
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
