import { AnySelectMenuInteraction } from "discord.js";
import ISelectMenu from "../interfaces/ISelectMenu";
import ISelectMenuOptions from "../interfaces/ISelectMenuOptions";
import CustomClient from "./CustomClient";

export default class SelectMenu implements ISelectMenu {
  client: CustomClient;
  name: string;

  constructor(client: CustomClient, options: ISelectMenuOptions) {
    this.client = client;
    this.name = options.name;
  }

  async Execute(interaction: AnySelectMenuInteraction): Promise<void> {}
}
