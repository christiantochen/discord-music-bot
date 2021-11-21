import { CommandInteraction } from "discord.js";
import createEmbed from "../utils/createEmbed";

export default function decorator<
	T extends (interaction: CommandInteraction) => Promise<string | undefined>
>(func: T) {
	return (_: unknown, __: string, descriptor: PropertyDescriptor) => {
		const method = descriptor.value;
		descriptor.value = async function (interaction: CommandInteraction) {
			const message = await func(interaction);
			
			if (message) {
				return interaction.editReply({
					embeds: [createEmbed({ description: message })]
				});
			}

			await method.call(this, interaction);
		};
	};
}
