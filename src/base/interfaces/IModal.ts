import { ModalSubmitInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface IModal {
  client: CustomClient;
  name: string;

  Execute(interaction: ModalSubmitInteraction): Promise<void>;
}
