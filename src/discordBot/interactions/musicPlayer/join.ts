import {
	CommandInteraction,
	GuildMember,
	TextChannel,
	VoiceChannel
} from "discord.js";
import { isMemberInVoiceChannel } from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

export default class Join extends Interaction {
	override name = "join";
	override description = "Bot will join voice channel.";

	@isMemberInVoiceChannel()
	override async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const member = interaction.member as GuildMember;
		const memberChannel = interaction.channel as TextChannel;
		const voiceChannel = member.voice.channel as VoiceChannel;
		const message = createEmbed();

		if (!player.voiceChannelId) {
			await player.connect(voiceChannel, memberChannel);
			return interaction.editReply({
				embeds: [message.setDescription("Ohhh, how exciting! Ahem.")]
			});
		}

		return interaction.editReply({
			embeds: [
				message.setDescription(
					"You seem tired. Would you like some tea? I'll brew you some. Do you take sugar? One cube, or two?"
				)
			]
		});
	}
}
