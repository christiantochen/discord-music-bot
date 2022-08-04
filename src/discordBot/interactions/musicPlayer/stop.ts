import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	CommandInteraction
} from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

const playButton = new ButtonBuilder()
	.setCustomId("play")
	.setLabel("Play")
	.setStyle(ButtonStyle.Primary);

export default class Stop extends Interaction {
	name = "stop";
	description = "Stop the music player.";

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		player!.stop(true);

		if (interaction.isButton()) {
			const buttonInteraction = interaction as ButtonInteraction<CacheType>;

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				playButton
			);

			return buttonInteraction.update({ components: [row] });
		}

		return interaction.editReply({
			embeds: [createEmbed({ description: "Music stop." })]
		});
	}
}
