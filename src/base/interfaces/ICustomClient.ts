import { Collection } from "discord.js";
import IConfig from "./IConfig";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import Button from "../classes/Button";
import SelectMenu from "../classes/SelectMenu";
import Modal from "../classes/Modal";
import Handler from "../classes/Handler";

export default interface ICustomClient {
  handler: Handler;
  config: IConfig;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  buttons: Collection<string, Button>;
  selectMenus: Collection<string, SelectMenu>;
  modals: Collection<string, Modal>;
  cooldowns: Collection<string, Collection<string, number>>;
  developmentMode: boolean;
  Init(): Promise<void>;
  LoadHandler(): Promise<void>;
  Shutdown(): Promise<void>;
}
