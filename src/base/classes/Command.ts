import {
  CacheType,
  AutocompleteInteraction,
  ApplicationCommandOptionData,
} from "discord.js";
import ECategory from "../enums/ECategory";
import ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import ICommandOptions from "../interfaces/ICommandOptions";
import {
  ICommandExecutionContext,
  ICommandSupports,
} from "../interfaces/ICommandExecutionContext";

export default class Command implements ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: ECategory;
  options: ApplicationCommandOptionData[];
  default_member_permissions: bigint;
  roles: string[];
  dm_permission: boolean;
  cooldown: number;
  dev: boolean;
  supports: ICommandSupports;

  constructor(client: CustomClient, options: ICommandOptions) {
    this.client = client;
    this.options = options.options;
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.default_member_permissions = options.default_member_permissions;
    this.roles = options.roles || [];
    this.dm_permission = options.dm_permission;
    this.cooldown = options.cooldown;
    this.dev = options.dev;
    this.supports = options.supports ?? { slash: true, prefix: true };
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {
    // throw new Error("Method not implemented.");
  }
  AutoComplete(interaction: AutocompleteInteraction<CacheType>): void {
    // throw new Error("Method not implemented.");
  }
}
