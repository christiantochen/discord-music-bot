import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import validate from "../../libs/utils/validate";
import Interaction from "../../libs/structures/Interaction";

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

  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.get(interaction.guildId);
    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const mode = interaction.options.getString(this.options[0].name, true);
    await manager!.setRepeatMode(mode);

    return interaction.editReply({
      embeds: [
        new NMesssageEmbed({
          description: getFixture("music/repeat:INFO", { mode }),
        }),
      ],
    });
  }
}
