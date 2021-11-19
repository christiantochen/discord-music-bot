import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import validate from "../../libs/utils/validate";
import Interaction from "../../libs/structures/Interaction";

export default class Track extends Interaction {
  options = [
    new SlashCommandNumberOption()
      .setName(getFixture("music/track:OPTION_NUMBER"))
      .setDescription(getFixture("music/track:OPTION_NUMBER_DESCRIPTION"))
      .setRequired(true),
  ];

  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.get(interaction.guildId);

    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const trackNo = interaction.options.getNumber(this.options[0].name, true);
    const metadata = await manager!.skip(trackNo);

    const message = new NMesssageEmbed();

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
