import { ButtonInteraction } from "discord.js";
import IButton from "../interfaces/IButton";
import IButtonOptions from "../interfaces/IButtonOptions";
import CustomClient from "./CustomClient";

export default class Button implements IButton {
  client: CustomClient;
  name: string;

  constructor(client: CustomClient, options: IButtonOptions) {
    this.client = client;
    this.name = options.name;
  }

  async Execute(_interaction: ButtonInteraction): Promise<void> {}
}
