import { GuildMember } from "discord.js";
import { getFixture } from "../fixtures";
import MusicPlayer from "./MusicPlayer";
import NMesssageEmbed from "./NMessageEmbed";
import SlashCommand from "./SlashCommand";

export default class MusicPlayerSlashCommand extends SlashCommand {
  async validate(member: GuildMember, player: MusicPlayer | undefined) {
    if (!player)
      return {
        valid: false,
        errorMessage: new NMesssageEmbed({
          color: 0x00adff,
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

    if (
      player.voiceChannelId &&
      member.voice.channelId !== player.voiceChannelId
    )
      return {
        valid: false,
        errorMessage: new NMesssageEmbed({
          description: getFixture("music:REQUIRE_SAME_CHANNEL"),
        }),
      };

    return { valid: true };
  }
}
