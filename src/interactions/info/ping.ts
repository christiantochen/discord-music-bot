import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import Interaction from "../../libs/structures/Interaction";

export default class Ping extends Interaction {
  async execute(interaction: CommandInteraction) {
    const message = new NMesssageEmbed();
    const execTime = Math.abs(Date.now() - interaction.createdTimestamp);
    const apiLatency = Math.floor(this.client.ws.ping);

    message
      .addField(getFixture("info/ping:EXEC_TIME"), `${execTime}ms`)
      .addField(getFixture("info/ping:API_LATENCY"), `${apiLatency}ms`);

    return interaction.editReply({ embeds: [message] });
  }
}
