import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Loop extends Interaction {
	options = [
		new SlashCommandStringOption()
			.setName(getFixture("music/loop:MODE"))
			.setDescription(getFixture("music/loop:MODE_DESCRIPTION"))
			.addChoices([
				[getFixture("music/loop:MODE_OPTION_OFF"), "off"],
				[getFixture("music/loop:MODE_OPTION_CURRENT"), "current"],
				[getFixture("music/loop:MODE_OPTION_ALL"), "all"]
			])
			.setRequired(true)
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	async execute(interaction: CommandInteraction) {
		const manager = this.client.musics.getOrCreate(interaction.guildId);
		const mode = interaction.options.getString(this.options[0].name, true);
		await manager!.setLoop(mode);

		return interaction.editReply({
			embeds: [
				createEmbed({
					description: getFixture("music/loop:INFO", { mode })
				})
			]
		});
	}
}
