import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Repeat extends MusicPlayerSlashCommand {
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

  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.get(interaction.guildId);

    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    const mode = player!.setRepeatMode(
      interaction.options.getString(this.options[0].name, true)
    );

    return interaction.editReply({
      embeds: [
        new NMesssageEmbed({
          description: getFixture("music/repeat:INFO", { mode }),
        }),
      ],
    });
  }
}
