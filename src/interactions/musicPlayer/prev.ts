import { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";
import parseMetadata from "../../libs/utils/parseMetadata";

export default class Prev extends Interaction {
	description = "Play previous queue from current track.";

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const metadata = await player!.prev();
		const message = createEmbed();

		if (metadata) {
			message.addFields({
				name: "NOW PLAYING",
				value: parseMetadata(metadata)
			});
		} else {
			message.setDescription("This is the first song in the player.");
		}

		return interaction.editReply({ embeds: [message] });
	}
}
