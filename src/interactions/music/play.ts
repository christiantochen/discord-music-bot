import { SlashCommandStringOption } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getFixture } from "../../libs/fixtures";
import { getAudioMetadata } from "../../libs/utils/play-dl";
import Interaction from "../../libs/structures/Interaction";
import {
  isMemberInVoiceChannel,
  IsMemberOnSameVoiceChannel,
} from "../../libs/decorators/music";
import createEmbed from "../../libs/utils/createEmbed";

export default class Play extends Interaction {
  options = [
    new SlashCommandStringOption()
      .setName(getFixture(`music/play:OPTION_TITLE`))
      .setDescription(getFixture(`music/play:OPTION_TITLE_DESCRIPTION`))
      .setRequired(true),
  ];

  @isMemberInVoiceChannel()
  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musics.getOrCreate(interaction.guildId);
    const member = interaction.member as GuildMember;
    const message = createEmbed();
    const query = interaction.options.getString(this.options[0].name, true);
    const metadata = await getAudioMetadata(query);

    if (!metadata) {
      message.setDescription(getFixture("music:NO_SOURCE", { query }));
      return interaction.editReply({ embeds: [message] });
    }

    const memberChannel = interaction.channel as TextChannel;
    const voiceChannel = member.voice.channel as VoiceChannel;
    await manager.connect(voiceChannel, memberChannel);

    const trackAt = await manager.add(metadata);
    let title = trackAt
      ? getFixture("music:TRACK_AT", { trackAt })
      : getFixture("music:NOW_PLAYING");
    message.addField(title, getFixture("music:METADATA", metadata));

    return interaction.editReply({ embeds: [message] });
  }
}
