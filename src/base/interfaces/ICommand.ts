import {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
} from "discord.js";
import CustomClient from "../classes/CustomClient";
import ECategory from "../enums/ECategory";
import {
  ICommandExecutionContext,
  ICommandSupports,
} from "./ICommandExecutionContext";

export default interface ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: ECategory;
  options: ApplicationCommandOptionData[];
  default_member_permissions: bigint;
  roles: string[];
  aliases: string[];
  dm_permission: boolean;
  cooldown: number;
  dev: boolean;
  supports: ICommandSupports;
  Execute(context: ICommandExecutionContext): Promise<void>;
  AutoComplete(interaction: AutocompleteInteraction): Promise<void>;
}
