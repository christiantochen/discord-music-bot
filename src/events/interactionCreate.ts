import { Interaction } from "discord.js";
import Event from "../libs/structures/Event";

export default class interactionCreate extends Event {
	name = "interactionCreate";

	async execute(interaction: Interaction) {
		if (!interaction.isChatInputCommand()) return;

		await interaction.deferReply();
		const command = this.client.interactions.get(interaction.commandName);
		return command!.execute(interaction);
	}
}
