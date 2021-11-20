import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
  isMemberInVoiceChannel,
  IsMemberOnSameVoiceChannel,
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Show extends Interaction {
  @isMemberInVoiceChannel()
  @IsMemberOnSameVoiceChannel()
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musics.get(interaction.guildId);
    const message = createEmbed();
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
