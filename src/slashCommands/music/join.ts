import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Join extends MusicPlayerSlashCommand {
  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.getOrCreate(
      interaction.guildId
    );
    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    const memberChannel = interaction.channel as TextChannel;
    const voiceChannel = member.voice.channel as VoiceChannel;

    const connect = await player!.connect(voiceChannel, memberChannel);
    const message = new NMesssageEmbed();

    if (connect) {
      await interaction.editReply({
        embeds: [message.setDescription(getFixture("music/join:JOIN_CHANNEL"))],
      });

      //   if (player.track) {
      //     await interaction.editReply({
      //       embeds: [
      //         message.setDescription(
      //           `${message.description}\nFound a track, play it ?`
      //         ),
      //       ],
      //       components: [
      //         new MessageActionRow().addComponents(
      //           new MessageButton()
      //             .setCustomId("play")
      //             .setLabel("Play")
      //             .setStyle("PRIMARY")
      //         ),
      //       ],
      //     });

      //     const filter = (i: any) =>
      //       i.customId === "play" && i.user.id === member.user.id;

      //     const collector = interaction.channel?.createMessageComponentCollector({
      //       filter,
      //       time: 15000,
      //     });

      //     collector?.once("collect", async (i) => {
      //       if (i.customId === "play") {
      //         player!.play(player.track!);
      //         message.addField(
      //           getFixture("music:NOW_PLAYING"),
      //           getFixture("music:METADATA", player.track!.metadata)
      //         );

      //         await i.update({ embeds: [message], components: [] });
      //       }
      //     });
      //   }

      return;
    }

    return interaction.editReply({
      embeds: [message.setDescription(getFixture("music/join:ALREADY_JOIN"))],
    });
  }
}
