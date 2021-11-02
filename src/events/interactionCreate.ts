import { Interaction } from "discord.js";
import Event from "../libs/structures/Event";

export default class interactionCreate extends Event {
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const command = this.client.slashCommands.get(interaction.commandName);

    if (!command)
      return interaction.reply(`Command not recognized, please try again.`);

    await interaction.deferReply();
    await command.execute(interaction);
  }
}
