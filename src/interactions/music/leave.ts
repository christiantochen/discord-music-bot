import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import validate from "../../libs/utils/validate";
import Interaction from "../../libs/structures/Interaction";

export default class Leave extends Interaction {
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.get(interaction.guildId);
    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    manager!.disconnect();
    this.client.musicPlayers.delete(interaction.guildId);

    return interaction.editReply({
      embeds: [
        new NMesssageEmbed({
          description: getFixture("music/leave:LEAVE_CHANNEL"),
        }),
      ],
    });
  }
}
