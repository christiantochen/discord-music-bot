import { SlashCommandNumberOption } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";
import parseMetadata from "../../utils/parseMetadata";

export default class Track extends Interaction {
	override name = "track";
	override description = "Play track based on input number.";
	override options = [
		new SlashCommandNumberOption()
			.setName("number")
			.setDescription("Enter your track number.")
			.setRequired(true)
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	override async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);

		const trackNo = interaction.options.get(this.options[0]!.name, true)
			.value as number;
		const metadata = await player!.skip(trackNo);

		const message = createEmbed();

		if (metadata) {
			message.addFields({
				name: "NOW PLAYING",
				value: parseMetadata(metadata)
			});
		} else if (trackNo) {
			message.setDescription(`Player have less than ${trackNo} tracks.`);
		} else {
			message.setDescription("This is the last song in the player.");
		}

		return interaction.editReply({ embeds: [message] });
	}
}
