import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Prev extends Interaction {
	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const manager = this.client.musics.getOrCreate(interaction.guildId);
		const metadata = await manager!.prev();
		const message = createEmbed();

		if (metadata) {
			message.addField(
				getFixture("music:NOW_PLAYING"),
				getFixture("music:METADATA", metadata)
			);
		} else {
			message.setDescription(getFixture("music:FIRST_SONG"));
		}

		return interaction.editReply({ embeds: [message] });
	}
}
