import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import Interaction from "../../libs/structures/Interaction";
import validate from "../../libs/utils/validate";

export default class Next extends Interaction {
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.get(interaction.guildId);

    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const metadata = await manager!.next();
    const message = new NMesssageEmbed();

    if (metadata) {
      message.addField(
        getFixture("music:NOW_PLAYING"),
        getFixture("music:METADATA", metadata)
      );
    } else {
      message.setDescription(getFixture("music:LAST_SONG"));
    }

    return interaction.editReply({ embeds: [message] });
  }
}
