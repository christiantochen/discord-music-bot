import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Show extends Interaction {
	pageLimit = 5;

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId);
		const message = createEmbed();
		const { tracks, trackAt, loop } = player;

		const tracklist = this.generateTracklist(tracks, trackAt);

		let description = getFixture("music/show:EMPTY");

		if (tracklist.length > 0)
			description = tracklist.reduce((prev, current) => `${prev}\n${current}`);

		message.addField(getFixture("music/show:TRACK_LIST"), description);
		message.setFooter(`Loop mode: ${loop}\t|\tTotal tracks: ${tracks.length}`);

		return interaction.editReply({ embeds: [message] });
	}

	// REFACTOR: refactor paging to perpage with next/prev components
	private generateTracklist(tracks: any[], trackAt = 0): any[] {
		const median = Math.floor(this.pageLimit / 2);
		let trackStart = 1;

		if (tracks.length > this.pageLimit && tracks.length - trackAt < median) {
			trackStart = trackAt - (this.pageLimit - (tracks.length - trackAt) - 1);
		} else if (tracks.length > this.pageLimit && trackAt > median) {
			trackStart = trackAt - median;
		}

		return tracks
			.slice(trackStart - 1, trackStart - 1 + this.pageLimit)
			.map((track, index) => {
				let message = getFixture("music:METADATA", track);

				if (trackStart - 1 + index === trackAt - 1) message = `*${message}*`;

				return `**${trackStart + index}.**\t${message}`;
			});
	}
}
