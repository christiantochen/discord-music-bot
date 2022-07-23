import { SlashCommandStringOption } from "@discordjs/builders";
import {
	CommandInteraction,
	GuildMember,
	TextChannel,
	VoiceChannel
} from "discord.js";
import { getAudioMetadata } from "../../libs/utils/play-dl";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import parseMetadata from "../../libs/utils/parseMetadata";

export default class Play extends Interaction {
	name = "play";
	description =
		"Search for a track on YouTube and add the first one on the search list to track.";
	options = [
		new SlashCommandStringOption()
			.setName("query")
			.setDescription("Enter keyword or youtube url.")
			.setRequired(true)
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const member = interaction.member as GuildMember;
		const message = createEmbed();
		const query = interaction.options.get(this.options[0].name, true)
			.value as string;
		const metadata = await getAudioMetadata(query);

		if (!metadata) {
			message.setDescription(`No source found for **${query}**`);
			return interaction.editReply({ embeds: [message] });
		}

		const memberChannel = interaction.channel as TextChannel;
		const voiceChannel = member.voice.channel as VoiceChannel;
		await player.connect(voiceChannel, memberChannel);

		const trackAt = await player.add(metadata);
		const title = trackAt
			? `New track added at position #${trackAt}`
			: "NOW PLAYING";
		message.addFields({
			name: title,
			value: parseMetadata(metadata)
		});

		return interaction.editReply({ embeds: [message] });
	}
}
