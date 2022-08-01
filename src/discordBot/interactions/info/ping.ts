import { CommandInteraction } from "discord.js";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

export default class Ping extends Interaction {
	name = "ping";
	description = "A check to see if `bot` is able to respond.";

	async execute(interaction: CommandInteraction) {
		const execTime = Math.abs(Date.now() - interaction.createdTimestamp);
		const apiLatency = Math.floor(this.client.ws.ping);

		return interaction.editReply({
			embeds: [
				createEmbed().addFields([
					{
						name: "Command Execution Time",
						value: `${execTime}ms`
					},
					{
						name: "Discord API Latency",
						value: `${apiLatency}ms`
					}
				])
			]
		});
	}
}
