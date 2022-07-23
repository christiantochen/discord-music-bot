import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";

export default class Remove extends Interaction {
	options = [
		new SlashCommandNumberOption()
			.setName("number")
			.setDescription("Enter your track number.")
			.setRequired(true),
		new SlashCommandNumberOption()
			.setName("count")
			.setDescription(
				"Enter how many tracks ahead you want to remove. Leave this at empty if you only need to delete 1."
			)
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const message = createEmbed();
		const trackFrom = interaction.options.get(this.options[0].name, true)
			.value as number;
		const count = interaction.options.get(this.options[1].name)
			?.value as number;
		const { trackAt } = player;

		if (this.anyActiveTrackInRange(trackAt, trackFrom, count)) {
			message.setDescription("Cannot delete currently playing track");
		} else {
			const removed = player!.remove(trackFrom!, count);
			if (removed) {
				const description = `Track #${trackFrom} to #${
					trackFrom + count! - 1
				} has been removed.`;
				message.setDescription(description);
			} else {
				message.setDescription("Track not found.");
			}
		}

		return interaction.editReply({ embeds: [message] });
	}

	private anyActiveTrackInRange(
		trackAt: number,
		trackFrom: number,
		count?: number | null | undefined
	) {
		const trackTo = count && count > 1 ? trackFrom + count - 1 : undefined;

		return (
			trackAt === trackFrom ||
			(trackTo && trackAt <= trackTo && trackAt >= trackFrom)
		);
	}
}
