import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";
import SlashCommand from "../../libs/structures/SlashCommand";

export default class Ping extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const message = new NMesssageEmbed();
    const execTime = Math.abs(Date.now() - interaction.createdTimestamp);
    const apiLatency = Math.floor(this.client.ws.ping);

    message
      .setTitle(getFixture("info/ping:PING"))
      .addField(getFixture("info/ping:EXEC_TIME"), `${execTime}ms`)
      .addField(getFixture("info/ping:API_LATENCY"), `${apiLatency}ms`);

    return interaction.editReply({ embeds: [message] });
  }
}
