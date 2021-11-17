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

    const tracklist = player?.tracks
      .map((track, index) => {
        let message = getFixture("music:METADATA", track.metadata);

        if (index === player.trackAt) message = `*${message}*`;

        return `**${index + 1}.**\t${message}`;
      })
      .reduce((prev, current) => `${prev}\n${current}`);

    message.addField(getFixture("music/show:TRACK_LIST"), tracklist!);
    message.setFooter(`Repeat mode: ${player?.mode}`);

    return interaction.editReply({ embeds: [message] });
  }
}
