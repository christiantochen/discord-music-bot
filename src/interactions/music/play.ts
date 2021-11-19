import { SlashCommandStringOption } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import { getAudioMetadata } from "../../libs/utils/play-dl";
import Interaction from "../../libs/structures/Interaction";
import validate from "../../libs/utils/validate";

export default class Play extends Interaction {
  options = [
    new SlashCommandStringOption()
      .setName(getFixture(`music/play:OPTION_TITLE`))
      .setDescription(getFixture(`music/play:OPTION_TITLE_DESCRIPTION`))
      .setRequired(true),
  ];

  async execute(interaction: CommandInteraction) {
    const manager = await this.client.musicPlayers.getOrCreate(
      interaction.guildId
    );
    const member = interaction.member as GuildMember;
    const validation = await validate.musicPlayerInteraction(member, manager);

    if (!validation.valid)
      return interaction.editReply({ embeds: [validation.errorMessage!] });

    const message = new NMesssageEmbed();
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
