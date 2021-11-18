import { CommandInteraction, TextChannel } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";
import SlashCommand from "../../libs/structures/SlashCommand";

export default class Purge extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const { user, guild, channel } = interaction;
    const message = new NMesssageEmbed();

    if (user.id !== guild?.ownerId)
      return interaction.editReply({
        embeds: [message.setDescription("Only Owner can purge messages.")],
      });

    if (!(channel instanceof TextChannel))
      return interaction.editReply({
        embeds: [message.setDescription("Can only purge Text Channel.")],
      });

    const purged = await channel.bulkDelete(100, true);

    if (purged && purged.size)
      return interaction.channel?.send({
        embeds: [
          message.setDescription(`${purged.size} messages were purged.`),
        ],
      });

    return interaction.editReply({
      embeds: [message.setDescription(`No message was purged.`)],
    });
  }
}
