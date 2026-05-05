import { ICommandSupports } from "./ICommandExecutionContext";

export default interface ISubCommandOptions {
  name: string;
  commandName: string;
  subCommandGroup?: string;
  supports?: ICommandSupports;
}
