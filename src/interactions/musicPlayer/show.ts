import { CommandInteraction } from "discord.js";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";
import { SlashCommandIntegerOption } from "@discordjs/builders";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import parseMetadata from "../../libs/utils/parseMetadata";

export default class Show extends Interaction {
	name = "show";
	description = "Display the queue of the current tracks.";
	pageLimit = 5;
	options = [
		new SlashCommandIntegerOption()
			.setName("page")
			.setDescription("Page Number")
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const message = createEmbed();
		const { tracks, trackAt, loop } = player;

		const pageNumber =
			(interaction.options.get(this.options[0].name)?.value as number) ?? 1;
		const tracklist = this.generateTracklist(tracks, trackAt, pageNumber);

		if (!tracklist)
			return interaction.editReply({
				embeds: [message.setDescription("Invalid Page")]
			});

		message.addFields([
			{
				name: "TRACK LIST",
				value: tracklist.description ?? "No queue at the moment"
			}
		]);
		message.setFooter({
			text: `Pages: ${tracklist.currentPage}/${tracklist.totalPage} | Loop Mode: ${loop} | Total: ${tracks.length}`
		});

		return interaction.editReply({ embeds: [message] });
	}

	// REFACTOR: refactor paging to perpage with next/prev components
	private generateTracklist(
		tracks: any[],
		trackAt = 0,
		targetPage?: number | null | undefined
	):
		| {
				totalPage: number;
				currentPage: number;
				description: string | undefined;
		  }
		| undefined {
		const totalPage = Math.ceil(tracks.length / this.pageLimit);

		if (targetPage && totalPage < targetPage) return;

		const currentPage =
			targetPage ?? (trackAt > 0 ? Math.ceil(trackAt / this.pageLimit) : 1);
		const trackStart = currentPage * this.pageLimit - this.pageLimit + 1;
		const tracklist = tracks
			.slice(trackStart - 1, trackStart - 1 + this.pageLimit)
			.map((track, index) => {
				let message = parseMetadata(track);

				if (trackStart - 1 + index === trackAt - 1) message = `*${message}*`;

				return `**${trackStart + index}.**\t${message}`;
			});

		let description;

		if (tracklist.length > 0)
			description = tracklist.reduce((prev, current) => `${prev}\n${current}`);

		return { totalPage, currentPage, description };
	}
}
