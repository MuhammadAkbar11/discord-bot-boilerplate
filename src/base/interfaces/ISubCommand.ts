import { AutocompleteInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import {
  ICommandExecutionContext,
  ICommandSupports,
} from "./ICommandExecutionContext";

export default interface ISubCommand {
  client: CustomClient;
  name: string;
  commandName: string;
  subCommandGroup?: string;
  supports: ICommandSupports;

  Execute(context: ICommandExecutionContext): Promise<void>;
  AutoComplete(interaction: AutocompleteInteraction): Promise<void>;
}
