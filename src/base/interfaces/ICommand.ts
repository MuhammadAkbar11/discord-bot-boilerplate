import {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import CustomClient from "../classes/CustomClient";
import ECategory from "../enums/ECategory";

export default interface ICommand {
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
  Execute(interaction: ChatInputCommandInteraction): Promise<void>;
  AutoComplete(interaction: AutocompleteInteraction): void;
}
