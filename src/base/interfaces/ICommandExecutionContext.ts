import { ChatInputCommandInteraction, Message } from "discord.js";

export type CommandExecutionType = "slash" | "prefix";

export interface ICommandSupports {
  slash: boolean;
  prefix: boolean;
}

export interface ICommandExecutionContext {
  type: CommandExecutionType;
  commandName: string;
  args: string[];
  prefix?: string;
  interaction?: ChatInputCommandInteraction;
  message?: Message<true>;
}
