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

    const message = new NMesssageEmbed();
    let tracklist = player!.tracks;

    if (tracklist.length > 5) {
      tracklist = tracklist.slice(0, 5);
    }

    message.addField(
      getFixture("music/show:TRACK_LIST"),
      this.mapTrackListToString(tracklist, player!.trackAt) ??
        getFixture("music/show:EMPTY")
    );
    message.setFooter(
      `Repeat mode: ${player!.mode} | Total tracks: ${player!.tracks.length}`
    );

    return interaction.editReply({ embeds: [message] });
  }

  mapTrackListToString(tracks: any[], trackAt: number): string | undefined {
    if (!tracks || tracks.length === 0) return;

    return tracks
      .map((track, index) => {
        let message = getFixture("music:METADATA", track.metadata);

        if (index === trackAt) message = `*${message}*`;

        return `**${index + 1}.**\t${message}`;
      })
      .reduce((prev, current) => `${prev}\n${current}`);
  }
}
