import { AnySelectMenuInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface ISelectMenu {
  client: CustomClient;
  name: string;

  Execute(interaction: AnySelectMenuInteraction): Promise<void>;
}
