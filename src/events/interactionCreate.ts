import { Interaction } from "discord.js";
import Event from "../libs/structures/Event";

export default class interactionCreate extends Event {
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();
    const command = this.client.interactions.get(interaction.commandName);
    await command!.execute(interaction);
  }
}
