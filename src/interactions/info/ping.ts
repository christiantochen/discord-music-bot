import { CommandInteraction } from "discord.js";
import { getFixture } from "../../libs/fixtures";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../libs/utils/createEmbed";

export default class Ping extends Interaction {
  async execute(interaction: CommandInteraction) {
    const execTime = Math.abs(Date.now() - interaction.createdTimestamp);
    const apiLatency = Math.floor(this.client.ws.ping);

    return interaction.editReply({
      embeds: [
        createEmbed()
          .addField(getFixture("info/ping:EXEC_TIME"), `${execTime}ms`)
          .addField(getFixture("info/ping:API_LATENCY"), `${apiLatency}ms`),
      ],
    });
  }
}
