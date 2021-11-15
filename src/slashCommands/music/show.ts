import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Show extends MusicPlayerSlashCommand {
  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.get(interaction.guildId);
    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });
    let prevTracks: any[] | undefined;
    let nextTracks: any[] | undefined;

    if (player!.trackAt === -1) {
      nextTracks = player?.tracks;
    } else if (player!.trackAt === 0) {
      nextTracks = player!.tracks.slice(1);
    } else if (player!.trackAt === player!.tracks.length) {
      prevTracks = player!.tracks.slice(0, player!.trackAt - 1);
    } else {
      prevTracks = player!.tracks.slice(0, player!.trackAt);
      nextTracks = player!.tracks.slice(player!.trackAt + 1);
    }

    const message = new NMesssageEmbed().setTitle(
      getFixture("music/show:TRACK_LIST")
    );

    if (prevTracks && prevTracks.length > 0) {
      const prev = prevTracks
        .map(
          (track, index) =>
            `**${index + 1}.**\t${getFixture("music:METADATA", track.metadata)}`
        )
        .reduce((prevVal, val) => `${prevVal}\n${val}`);
      message.addField(getFixture("music:PREV"), prev);
    }

    if (player?.track) {
      message.addField(
        getFixture("music:NOW_PLAYING"),
        `**${player!.trackAt + 1}.**\t${getFixture(
          "music:METADATA",
          player?.track?.metadata
        )}`
      );
    }

    if (nextTracks && nextTracks.length > 0) {
      const next = nextTracks
        .map(
          (track, index) =>
            `**${player!.trackAt + index + 2}.**\t${getFixture(
              "music:METADATA",
              track.metadata
            )}`
        )
        .reduce((prevVal, val) => `${prevVal}\n${val}`);
      message.addField(getFixture("music:UP_NEXT"), next);
    }

    message.setFooter(`Repeat mode: ${player?.mode}`);

    return interaction.editReply({ embeds: [message] });
  }
}
