import { CommandInteraction, GuildMember } from "discord.js";
import decorator from ".";

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
		if (member.voice.channelId === member.guild.me?.voice.channelId) return;
		return "You need to be in the same voice channel with me to execute this command!";
	});
}
