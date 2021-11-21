import {
	CommandInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
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
		const manager = this.client.musics.getOrCreate(interaction.guildId);
		const member = interaction.member as GuildMember;
		const memberChannel = interaction.channel as TextChannel;
		const voiceChannel = member.voice.channel as VoiceChannel;
		const message = createEmbed();

		if (!manager.voiceChannelId) {
			await manager.connect(voiceChannel, memberChannel);
			await interaction.editReply({
				embeds: [message.setDescription(getFixture("music/join:JOIN_CHANNEL"))]
			});

			const { tracks, trackAt } = manager.getInfo();

			if (tracks.length) {
				await interaction.channel?.send({
					embeds: [message.setDescription("Found a track, play it ?")],
					components: [
						new MessageActionRow().addComponents(
							new MessageButton()
								.setCustomId("play")
								.setLabel("Play")
								.setStyle("PRIMARY")
						)
					]
				});

				const filter = (i: any) =>
					i.customId === "play" && i.user.id === member.user.id;

				const collector = interaction.channel?.createMessageComponentCollector({
					filter,
					time: 15000
				});

				collector?.once("collect", async (i) => {
					if (i.customId === "play") {
						const metadata = await manager!.skip(trackAt);
						message.addField(
							getFixture("music:NOW_PLAYING"),
							getFixture("music:METADATA", metadata)
						);

						await i.update({ embeds: [message], components: [] });
					}
				});
			}

			return;
		}

		return interaction.editReply({
			embeds: [message.setDescription(getFixture("music/join:ALREADY_JOIN"))]
		});
	}
}
