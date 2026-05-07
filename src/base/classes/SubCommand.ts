import { AutocompleteInteraction } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import CustomClient from "./CustomClient";
import ISubCommandOptions from "../interfaces/ISubCommandOptions";
import {
  ICommandExecutionContext,
  ICommandSupports,
} from "../interfaces/ICommandExecutionContext";

export default class SubCommand implements ISubCommand {
  client: CustomClient;
  name: string;
  commandName: string;
  subCommandGroup?: string;
  supports: ICommandSupports;

  constructor(client: CustomClient, options: ISubCommandOptions) {
    this.client = client;
    this.name = options.name;
    this.commandName = options.commandName;
    this.subCommandGroup = options.subCommandGroup;
    this.supports = options.supports ?? { slash: true, prefix: true };
  }

  async Execute(context: ICommandExecutionContext): Promise<void> {}

  async AutoComplete(interaction: AutocompleteInteraction): Promise<void> {}
}
