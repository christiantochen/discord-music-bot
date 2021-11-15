import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Fix extends MusicPlayerSlashCommand {
  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.get(interaction.guildId);
    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    player!.disconnect();
    this.client.musicPlayers.delete(interaction.guildId);

    return interaction.editReply({
      embeds: [
        new NMesssageEmbed({ description: getFixture("music:LEAVE_CHANNEL") }),
      ],
    });
  }
}
