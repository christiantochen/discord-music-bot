import { SlashCommandStringOption } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getFixture } from "../../libs/fixtures";
import MusicPlayerSlashCommand from "../../libs/structures/MusicPlayerSlashCommand";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";
import { createAudio, getAudio } from "../../libs/utils";

export default class Play extends MusicPlayerSlashCommand {
  options = [
    new SlashCommandStringOption()
      .setName(getFixture(`music/play:OPTION_TITLE`))
      .setDescription(getFixture(`music/play:OPTION_TITLE_DESCRIPTION`))
      .setRequired(true),
  ];

  async execute(interaction: CommandInteraction) {
    const player = await this.client.musicPlayers.getOrCreate(
      interaction.guildId
    );
    const member = interaction.member as GuildMember;
    const { valid, errorMessage } = await this.validate(member, player);

    if (!valid) return interaction.editReply({ embeds: [errorMessage!] });

    const memberChannel = interaction.channel as TextChannel;
    const voiceChannel = member.voice.channel as VoiceChannel;
    const message = new NMesssageEmbed();
    const query = interaction.options.getString(this.options[0].name, true);
    const resource = await getAudio(query);

    if (!resource) {
      message.setDescription(getFixture("music:NO_SOURCE", { query }));
      return interaction.editReply({ embeds: [message] });
    }

    await player.connect(voiceChannel, memberChannel);

    const trackAt = await player.add(resource);
    let title = trackAt
      ? getFixture("music:TRACK_AT", { trackAt })
      : getFixture("music:NOW_PLAYING");
    message.addField(title, getFixture("music:METADATA", resource.metadata));

    return interaction.editReply({ embeds: [message] });
  }
}
