import type { Interaction } from "discord.js";
import Event from "../libs/structures/Event";

export default class interactionCreate extends Event {
	override name = "interactionCreate";

	override async execute(interaction: Interaction) {
		if (interaction.isButton()) {
			const command = this.client.interactions.get(interaction.customId);
			return command!.execute(interaction);
		}

		if (interaction.isChatInputCommand()) {
			await interaction.deferReply();
			const command = this.client.interactions.get(interaction.commandName);
			return command!.execute(interaction);
		}
	}
}
