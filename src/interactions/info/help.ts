import { CommandInteraction } from "discord.js";
import NMesssageEmbed from "../../libs/extensions/NMessageEmbed";
import Interaction from "../../libs/structures/Interaction";

export default class Help extends Interaction {
  async execute(interaction: CommandInteraction) {
    const message = new NMesssageEmbed().setTitle("HELP").setDescription(
      `
      **Play a music**
      \`/play <<query>> \`
      query can be words or url.
      Example: \`/play query:beautiful saviour planetshakers\` 
      Example(2): \`/play query:https://youtu.be/z8e9lCxn_IY\`

      **Remove track(s) from queue** 
      \`/remove <<number>> <<count>>\`
      \`<<count>>\` is optional
      Example: \`/remove number:1\` 
      Example(2): \`/remove number:1 count:3\`

      **Repeat mode** 
      \`/repeat <<mode>>\`
      3 modes are available. \`all\` \`current\` and \`off\`      
      Example: \`/repeat mode:current\`

      **Jump to specific track in queue** 
      \`/track <<number>>\`
      Example: \`/track number:1\`

      **Play next track in queue** \`/next \`

      **Play previous track in queue** \`/prev \`

      **Stop music** \`/stop\`

      **Show list of queue** \`/show\`

      **Join voice channel** \`/join\`

      **Leave voice channel** \`/leave\` 
      In any case bug happen, use this command to reset the bot.
      `
    );

    return interaction.editReply({ embeds: [message] });
  }
}
