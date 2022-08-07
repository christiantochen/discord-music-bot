import type { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

export default class Leave extends Interaction {
	override name = "leave";
	override description = "Bot will leave voice channel.";

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	override async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);

		player!.disconnect();

		return interaction.editReply({
			embeds: [createEmbed({ description: "Time to clean up." })]
		});
	}
}
