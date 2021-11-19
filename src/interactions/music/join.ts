import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import Interaction from "../../libs/structures/Interaction";
import validate from "../../libs/utils/validate";

export default class Join extends Interaction {
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.getOrCreate(
      interaction.guildId
    );
    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const memberChannel = interaction.channel as TextChannel;
    const voiceChannel = member.voice.channel as VoiceChannel;
    const message = new NMesssageEmbed();

    if (!manager.voiceChannelId) {
      await manager.connect(voiceChannel, memberChannel);
      await interaction.editReply({
        embeds: [message.setDescription(getFixture("music/join:JOIN_CHANNEL"))],
      });

      const { tracks, trackAt } = manager.getInfo();

      if (tracks.length) {
        await interaction.channel?.send({
          embeds: [message.setDescription(`Found a track, play it ?`)],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId("play")
                .setLabel("Play")
                .setStyle("PRIMARY")
            ),
          ],
        });

        const filter = (i: any) =>
          i.customId === "play" && i.user.id === member.user.id;

        const collector = interaction.channel?.createMessageComponentCollector({
          filter,
          time: 15000,
        });

        collector?.once("collect", async (i) => {
          if (i.customId === "play") {
            const metadata = await manager!.skip(trackAt);
            message.addField(
              getFixture("music:NOW_PLAYING"),
              getFixture("music:METADATA", metadata)
            );

            await i.update({ embeds: [message], components: [] });
          }
        });
      }

      return;
    }

    return interaction.editReply({
      embeds: [message.setDescription(getFixture("music/join:ALREADY_JOIN"))],
    });
  }
}
