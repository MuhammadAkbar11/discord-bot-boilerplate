import CustomClient from "../classes/CustomClient";
import { ICommandExecutionContext } from "./ICommandExecutionContext";

export default interface ISubCommand {
  client: CustomClient;
  name: string;
  commandName: string;
  subCommandGroup?: string;

  Execute(context: ICommandExecutionContext): Promise<void>;
}
