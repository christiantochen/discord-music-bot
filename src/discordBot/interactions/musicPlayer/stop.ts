import { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

export default class Stop extends Interaction {
	name = "stop";
	description = "Stop the music player.";

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		player!.stop(true);

		return interaction.editReply({
			embeds: [createEmbed({ description: "Music stop." })]
		});
	}
}
