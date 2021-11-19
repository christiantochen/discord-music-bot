import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import Interaction from "../../libs/structures/Interaction";
import validate from "../../libs/utils/validate";

export default class Remove extends Interaction {
  options = [
    new SlashCommandNumberOption()
      .setName(getFixture("music/remove:OPTION_NUMBER"))
      .setDescription(getFixture("music/remove:OPTION_NUMBER_DESCRIPTION"))
      .setRequired(true),
    new SlashCommandNumberOption()
      .setName(getFixture("music/remove:OPTION_COUNT"))
      .setDescription(getFixture("music/remove:OPTION_COUNT_DESCRIPTION")),
  ];

  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.get(interaction.guildId);
    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const message = new NMesssageEmbed();
    const trackFrom = interaction.options.getNumber(this.options[0].name, true);
    const count = interaction.options.getNumber(this.options[1].name);
    let anyActiveTrack = manager!.anyActiveTrackInRange(trackFrom, count);

    if (anyActiveTrack) {
      message.setDescription(getFixture(`music/remove:ACTIVE_TRACK`));
    } else {
      const removed = await manager!.remove(trackFrom!, count);
      if (removed) {
        const descriptionItem = { trackFrom, trackTo: trackFrom + count! };
        const description = getFixture(
          `music/remove:REMOVED${count ? "_RANGE" : ""}`,
          descriptionItem
        );
        message.setDescription(description);
      } else {
        message.setDescription(getFixture("music/remove:NOT_FOUND"));
      }
    }

    return interaction.editReply({ embeds: [message] });
  }
}
