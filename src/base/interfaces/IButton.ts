import { ButtonInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface IButton {
  client: CustomClient;
  name: string;

  Execute(interaction: ButtonInteraction): Promise<void>;
}
