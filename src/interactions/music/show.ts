import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import Interaction from "../../libs/structures/Interaction";
import validate from "../../libs/utils/validate";

export default class Show extends Interaction {
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.get(interaction.guildId);
    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const message = new NMesssageEmbed();
    const { tracks, mode } = manager!.getInfo();
    const tracklist = await manager!.show();
    let description = getFixture("music/show:EMPTY");

    if (tracklist.length > 0)
      description = tracklist.reduce((prev, current) => `${prev}\n${current}`);

    message.addField(getFixture("music/show:TRACK_LIST"), description);
    message.setFooter(
      `Repeat mode: ${mode}\t|\tTotal tracks: ${tracks.length}`
    );

    return interaction.editReply({ embeds: [message] });
  }
}
