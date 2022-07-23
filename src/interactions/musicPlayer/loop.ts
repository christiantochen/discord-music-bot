import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import {
	isMemberInVoiceChannel,
	IsMemberOnSameVoiceChannel
} from "../../decorators";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";

export default class Loop extends Interaction {
	name = "loop";
	description = "Change the loop mode.";
	options = [
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
	async execute(interaction: CommandInteraction) {
		const player = this.client.musics.getOrCreate(interaction.guildId!);
		const mode = interaction.options.get(this.options[0].name, true)
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
