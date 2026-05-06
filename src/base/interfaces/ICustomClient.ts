import { Collection } from "discord.js";
import IConfig from "./IConfig";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import Button from "../classes/Button";
import SelectMenu from "../classes/SelectMenu";

export default interface ICustomClient {
  config: IConfig;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  buttons: Collection<string, Button>;
  selectMenus: Collection<string, SelectMenu>;
  cooldowns: Collection<string, Collection<string, number>>;
  developmentMode: boolean;
  Init(): void;
  LoadHandler(): void;
  Shutdown(): void;
}
