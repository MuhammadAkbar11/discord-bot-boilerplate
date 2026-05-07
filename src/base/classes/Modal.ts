import { ModalSubmitInteraction } from "discord.js";
import IModal from "../interfaces/IModal";
import IModalOptions from "../interfaces/IModalOptions";
import CustomClient from "./CustomClient";

export default class Modal implements IModal {
  client: CustomClient;
  name: string;

  constructor(client: CustomClient, options: IModalOptions) {
    this.client = client;
    this.name = options.name;
  }

  async Execute(_interaction: ModalSubmitInteraction): Promise<void> {}
}
