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

    message.addField(
      getFixture("music:NOW_PLAYING"),
      player?.current?.metadata
        ? getFixture("music:METADATA", player?.current?.metadata)
        : "-"
    );

    const queues = await player?.queues;
    let upnext = "-";
    if (queues && queues.length > 0) {
      upnext = queues
        .map(
          (queue, index) =>
            `**${index + 1}.**\t${getFixture("music:METADATA", queue.metadata)}`
        )
        .reduce((prevVal, val) => `${prevVal}\n${val}`);
    }
    message.addField(getFixture("music:UP_NEXT"), upnext);

    message.setFooter(`Repeat mode: ${player?.mode}`);

    return interaction.editReply({ embeds: [message] });
  }
}
