import { GuildMember } from "discord.js";
import NMesssageEmbed from "../extensions/NMessageEmbed";
import { getFixture } from "../fixtures";
import MusicPlayerManager from "../managers/MusicPlayerManager";

function musicPlayerInteraction(
  member: GuildMember,
  player: MusicPlayerManager | undefined
) {
  if (!player)
    return {
      valid: false,
      errorMessage: new NMesssageEmbed({
        description: getFixture("music:NO_PLAYER"),
      }),
    };

  if (!member.voice.channelId)
    return {
      valid: false,
      errorMessage: new NMesssageEmbed({
        description: getFixture("music:REQUIRE_VOICE_CHANNEL"),
      }),
    };

  if (player.voiceChannelId && member.voice.channelId !== player.voiceChannelId)
    return {
      valid: false,
      errorMessage: new NMesssageEmbed({
        description: getFixture("music:REQUIRE_SAME_CHANNEL"),
      }),
    };

  return { valid: true };
}

export default {
  musicPlayerInteraction,
};
