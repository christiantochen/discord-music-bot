import { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";
import parseMetadata from "../../utils/parseMetadata";

export default class Next extends Interaction {
	name = "next";
	description = "Skip current song and play next song from tracklist.";

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const metadata = await player!.next();
		const message = createEmbed();

		if (metadata) {
			message.addFields({
				name: "NOW PLAYING",
				value: parseMetadata(metadata)
			});
		} else {
			message.setDescription("This is the last song in the player.");
		}

		return interaction.editReply({ embeds: [message] });
	}
}
