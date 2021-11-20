import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
  isMemberInVoiceChannel,
  IsMemberOnSameVoiceChannel,
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Track extends Interaction {
  options = [
    new SlashCommandNumberOption()
      .setName(getFixture("music/track:OPTION_NUMBER"))
      .setDescription(getFixture("music/track:OPTION_NUMBER_DESCRIPTION"))
      .setRequired(true),
  ];

  @isMemberInVoiceChannel()
  @IsMemberOnSameVoiceChannel()
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musics.get(interaction.guildId);

    const trackNo = interaction.options.getNumber(this.options[0].name, true);
    const metadata = await manager!.skip(trackNo);

    const message = createEmbed();

    if (metadata) {
      message.addField(
        getFixture("music:NOW_PLAYING"),
        getFixture("music:METADATA", metadata)
      );
    } else if (trackNo) {
      message.setDescription(getFixture("music/track:ERROR", { trackNo }));
    } else {
      message.setDescription(getFixture("music:LAST_SONG"));
    }

    return interaction.editReply({ embeds: [message] });
  }
}
