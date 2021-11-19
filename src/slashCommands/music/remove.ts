import { SlashCommandNumberOption } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";

export default class Remove extends MusicPlayerSlashCommand {
  options = [
    new SlashCommandNumberOption()
      .setName(getFixture("music/remove:OPTION_NUMBER"))
      .setDescription(getFixture("music/remove:OPTION_NUMBER_DESCRIPTION"))
      .setRequired(true),
    new SlashCommandNumberOption()
      .setName(getFixture("music/remove:OPTION_COUNT"))
      .setDescription(getFixture("music/remove:OPTION_COUNT_DESCRIPTION")),
  ];

  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.get(interaction.guildId);

    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    const message = new NMesssageEmbed();
    const count = interaction.options.getNumber(this.options[1].name);
    const trackFrom = interaction.options.getNumber(this.options[0].name)!;
    const trackTo = count && count > 1 ? trackFrom + count - 1 : undefined;
    let anyActiveTrack = false;

    if (player?.trackAt !== undefined && player?.trackAt > -1) {
      anyActiveTrack =
        trackFrom! === player.trackAt + 1 ||
        (!!trackTo &&
          trackTo >= player.trackAt + 1 &&
          trackFrom <= player.trackAt + 1);
    }

    if (anyActiveTrack) {
      message.setDescription(getFixture(`music/remove:ACTIVE_TRACK`));
    } else {
      const removed = await player!.removeAt(trackFrom!, count);
      if (removed && removed >= 1) {
        message.setDescription(
          getFixture(`music/remove:REMOVED${trackTo ? "_RANGE" : ""}`, {
            trackFrom,
            trackTo,
          })
        );
      } else {
        message.setDescription(getFixture("music/remove:NOT_FOUND"));
      }
    }

    return interaction.editReply({ embeds: [message] });
  }
}
