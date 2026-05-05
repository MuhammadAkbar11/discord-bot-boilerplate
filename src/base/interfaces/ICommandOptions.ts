import { ApplicationCommandOptionData } from "discord.js";
import ECategory from "../enums/ECategory";
import { ICommandSupports } from "./ICommandExecutionContext";

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
  supports?: ICommandSupports;
}
