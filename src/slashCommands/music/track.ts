import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Track extends MusicPlayerSlashCommand {
  options = [
    new SlashCommandNumberOption()
      .setName(getFixture("music/track:OPTION_NUMBER"))
      .setDescription(getFixture("music/track:OPTION_NUMBER_DESCRIPTION"))
      .setRequired(true),
  ];

  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.get(interaction.guildId);

    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    const trackNo = interaction.options.getNumber(this.options[0].name);
    const metadata = await player!.skipTo(trackNo!);

    const message = new NMesssageEmbed();

    if (metadata) {
      message.addField(
        getFixture("music:NOW_PLAYING"),
        getFixture("music:METADATA", metadata)
      );
    } else if (trackNo) {
      message.setDescription(
        getFixture("music/track:ERROR", { trackNo })
      );
    } else {
      message.setDescription(getFixture("music:LAST_SONG"));
    }

    return interaction.editReply({ embeds: [message] });
  }
}
