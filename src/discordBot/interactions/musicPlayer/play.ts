import { SlashCommandStringOption } from "@discordjs/builders";
import {
	ActionRowBuilder,
	APIEmbedField,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	CommandInteraction,
	EmbedBuilder,
	GuildMember,
	TextChannel,
	VoiceChannel
} from "discord.js";
import { getAudioMetadata } from "../../utils/play-dl";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import { YouTubeVideo } from "play-dl";

const createEmbedFromYTVideo = ({
	channel,
	thumbnails,
	...metadata
}: YouTubeVideo): EmbedBuilder => {
	let thumbnail;
	let fields: APIEmbedField[] = [];
	let footer;

	if (channel && channel.name) {
		fields.push(
			{
				name: "Currently Playing",
				value: `[${metadata.title}](${metadata.url})`
			},
			{
				name: "Duration",
				value: metadata.durationRaw,
				inline: true
			},
			{
				name: "by",
				value: `[${channel.name}](${channel.url})`,
				inline: true
			}
		);
	}

	if (thumbnails && thumbnails.length > 0) {
		thumbnail = { url: thumbnails[thumbnails.length - 1].url };
	}

	return createEmbed({ thumbnail, fields, footer });
};

const stopButton = new ButtonBuilder()
	.setCustomId("stop")
	.setLabel("Stop")
	.setStyle(ButtonStyle.Danger);

export default class Play extends Interaction {
	name = "play";
	description =
		"Search for a track on YouTube and add the first one on the search list to track.";
	options = [
		new SlashCommandStringOption()
			.setName("query")
			.setDescription("Enter keyword or youtube url.")
			.setRequired(false)
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(stopButton);
		let query: string | undefined;
		let metadata: YouTubeVideo | undefined;

		if (interaction.isButton()) {
			const buttonInteraction = interaction as ButtonInteraction<CacheType>;
			await buttonInteraction.deferUpdate();
		} else {
			query = interaction.options.get(this.options[0].name)?.value as string;

			const member = interaction.member as GuildMember;
			const memberChannel = interaction.channel as TextChannel;
			const voiceChannel = member.voice.channel as VoiceChannel;
			await player.connect(voiceChannel, memberChannel);
		}

		if (query) {
			metadata = await getAudioMetadata(query);
		} else if (player.tracks.length > 0) {
			const trackAt =
				(player.trackAt > 0 ? player.trackAt : player.tracks.length) - 1;
			metadata = player.tracks[trackAt];
		}

		if (!metadata) {
			const message = createEmbed({
				description: `No source found${query ? ` for ${query}` : ""}.`
			});
			return interaction.editReply({ embeds: [message] });
		}

		await player.play(metadata);

		const message = createEmbedFromYTVideo(metadata);
		return interaction.editReply({ embeds: [message], components: [row] });
	}
}
