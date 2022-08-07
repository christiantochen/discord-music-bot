import { SlashCommandStringOption } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

export default class Loop extends Interaction {
	override name = "loop";
	override description = "Change the loop mode.";
	override options = [
		new SlashCommandStringOption()
			.setName("mode")
			.setDescription("select the mode.")
			.addChoices(
				{
					name: "off",
					value: "off"
				},
				{
					name: "current",
					value: "current"
				},
				{
					name: "all",
					value: "all"
				}
			)
			.setRequired(true)
	];

	@isMemberInVoiceChannel()
	@IsMemberOnSameVoiceChannel()
	override async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const mode = interaction.options.get(this.options[0]!.name, true)
			.value as string;
		await player!.setLoop(mode);

		return interaction.editReply({
			embeds: [
				createEmbed({
					description: `Loop mode: **${mode}**`
				})
			]
		});
	}
}
