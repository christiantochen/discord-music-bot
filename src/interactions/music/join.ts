import {
	CommandInteraction,
	GuildMember,
	TextChannel,
	VoiceChannel
} from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import { isMemberInVoiceChannel } from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Join extends Interaction {
	@isMemberInVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId);
		const member = interaction.member as GuildMember;
		const memberChannel = interaction.channel as TextChannel;
		const voiceChannel = member.voice.channel as VoiceChannel;
		const message = createEmbed();

		if (!player.voiceChannelId) {
			await player.connect(voiceChannel, memberChannel);
			return interaction.editReply({
				embeds: [message.setDescription(getFixture("music/join:JOIN_CHANNEL"))]
			});
		}

		return interaction.editReply({
			embeds: [message.setDescription(getFixture("music/join:ALREADY_JOIN"))]
		});
	}
}
