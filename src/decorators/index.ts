import { CommandInteraction, GuildMember } from "discord.js";
import decorator from "../libs/decorator";

export function isMemberInVoiceChannel(): any {
	return decorator(async (interaction: CommandInteraction) => {
		const member = interaction.member as GuildMember;
		if (member.voice.channelId) return;
		return "Please join a voice channel!";
	});
}

export function IsMemberOnSameVoiceChannel(): any {
	return decorator(async (interaction: CommandInteraction) => {
		const member = interaction.member as GuildMember;
		const bot = interaction.guild?.members.me;

		if (!bot?.voice.channelId) return "Bot has yet join any voice channel!";
		if (member.voice.channelId !== bot?.voice.channelId)
			return "You need to be in the same voice channel with me to execute this command!";

		return;
	});
}
