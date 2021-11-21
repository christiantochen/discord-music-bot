import { CommandInteraction, TextChannel } from "discord.js";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";

export default class Purge extends Interaction {
	async execute(interaction: CommandInteraction) {
		const message = createEmbed();

		if (interaction.user.id !== interaction.guild?.ownerId)
			return interaction.editReply({
				embeds: [message.setDescription("Only Owner can purge messages.")]
			});

		const channel = interaction.channel as TextChannel;
		const purged = await channel.bulkDelete(100, true);

		if (purged && purged.size)
			return interaction.channel?.send({
				embeds: [message.setDescription(`${purged.size} messages were purged.`)]
			});

		return interaction.editReply({
			embeds: [message.setDescription("No message was purged.")]
		});
	}
}
