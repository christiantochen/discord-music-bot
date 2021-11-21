import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Remove extends Interaction {
	options = [
		new SlashCommandNumberOption()
			.setName(getFixture("music/remove:OPTION_NUMBER"))
			.setDescription(getFixture("music/remove:OPTION_NUMBER_DESCRIPTION"))
			.setRequired(true),
		new SlashCommandNumberOption()
			.setName(getFixture("music/remove:OPTION_COUNT"))
			.setDescription(getFixture("music/remove:OPTION_COUNT_DESCRIPTION"))
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const manager = this.client.musics.getOrCreate(interaction.guildId);
		const message = createEmbed();
		const trackFrom = interaction.options.getNumber(this.options[0].name, true);
		const count = interaction.options.getNumber(this.options[1].name);
		const anyActiveTrack = manager!.anyActiveTrackInRange(trackFrom, count);

		if (anyActiveTrack) {
			message.setDescription(getFixture("music/remove:ACTIVE_TRACK"));
		} else {
			const removed = manager!.remove(trackFrom!, count);
			if (removed) {
				const descriptionItem = { trackFrom, trackTo: trackFrom + count! - 1 };
				const description = getFixture(
					`music/remove:REMOVED${count ? "_RANGE" : ""}`,
					descriptionItem
				);
				message.setDescription(description);
			} else {
				message.setDescription(getFixture("music/remove:NOT_FOUND"));
			}
		}

		return interaction.editReply({ embeds: [message] });
	}
}
