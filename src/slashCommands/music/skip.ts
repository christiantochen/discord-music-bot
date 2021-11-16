import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Skip extends MusicPlayerSlashCommand {
  options = [
    new SlashCommandNumberOption()
      .setName(getFixture("music/skip:OPTION_NUMBER"))
      .setDescription(getFixture("music/skip:OPTION_NUMBER_DESCRIPTION")),
  ];

  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.get(interaction.guildId);

    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    const message = new NMesssageEmbed();

    const trackNo = interaction.options.getNumber(this.options[0].name);

    this.client.log.info("trackNo", trackNo);
    const metadata = trackNo
      ? await player!.skipTo(trackNo)
      : await player!.next(true);
      
    if (metadata) {
      message.addField(
        getFixture("music:NOW_PLAYING"),
        getFixture("music:METADATA", metadata)
      );
    } else if (trackNo) {
      message.setDescription(
        getFixture("music/skip:ERROR_TRACK_LENGTH", { trackNo })
      );
    } else {
      message.setDescription(getFixture("music:LAST_SONG"));
    }

    return interaction.editReply({ embeds: [message] });
  }
}
