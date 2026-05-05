import { ApplicationCommandOptionData } from "discord.js";
import ECategory from "../enums/ECategory";

export default interface ICommandOptions {
  name: string;
  description: string;
  category: ECategory;
  options: ApplicationCommandOptionData[];
  default_member_permissions: bigint;
  roles?: string[];
  dm_permission: boolean;
  cooldown: number;
  dev: boolean;
}
