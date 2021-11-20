import { CommandInteraction, GuildMember } from "discord.js";
import decorator from ".";
import createEmbed from "../utils/createEmbed";

export function isMemberInVoiceChannel(): any {
  return decorator(async (interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;

    if (member.voice.channelId) return true;

    await interaction.editReply({
      embeds: [
        createEmbed({
          description: "Please join a voice channel!",
        }),
      ],
    });

    return false;
  });
}

export function IsMemberOnSameVoiceChannel(): any {
  return decorator(async (interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;
    if (member.voice.channelId === member.guild.me?.voice.channelId)
      return true;

    await interaction.editReply({
      embeds: [
        createEmbed({
          description:
            "You need to be in the same voice channel with me to execute this command!",
        }),
      ],
    });

    return false;
  });
}
