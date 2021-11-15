import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";
import SlashCommand from "../../libs/structures/SlashCommand";

export default class Help extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const message = new NMesssageEmbed().addField(
      getFixture("info/help:HELP"),
      "Under development"
    );

    return interaction.editReply({ embeds: [message] });
  }
}
