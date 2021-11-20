import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import {
  isMemberInVoiceChannel,
  IsMemberOnSameVoiceChannel,
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Repeat extends Interaction {
  options = [
    new SlashCommandStringOption()
      .setName(getFixture("music/repeat:MODE"))
      .setDescription(getFixture("music/repeat:MODE_DESCRIPTION"))
      .addChoices([
        [getFixture("music/repeat:MODE_OPTION_OFF"), "off"],
        [getFixture("music/repeat:MODE_OPTION_CURRENT"), "current"],
        [getFixture("music/repeat:MODE_OPTION_ALL"), "all"],
      ])
      .setRequired(true),
  ];

  @isMemberInVoiceChannel()
  @IsMemberOnSameVoiceChannel()
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musics.get(interaction.guildId);
    const mode = interaction.options.getString(this.options[0].name, true);
    await manager!.setRepeatMode(mode);

    return interaction.editReply({
      embeds: [
        createEmbed({
          description: getFixture("music/repeat:INFO", { mode }),
        }),
      ],
    });
  }
}
