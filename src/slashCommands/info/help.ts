import { CommandInteraction } from "discord.js";
import NMesssageEmbed from "../../libs/structures/NMessageEmbed";
import SlashCommand from "../../libs/structures/SlashCommand";

export default class Help extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const message = new NMesssageEmbed().setTitle("HELP").setDescription(
      `
      **Play a music**
      \`/play <<query>> \`
      Example: \`/play query:beautiful saviour planetshakers\`
      Example(2): \`/play query:https://youtu.be/z8e9lCxn_IY\`

      **Play next track in queue**
      \`/next \`

      **Play previous track in queue**
      \`/prev \`

      **Stop music**
      \`/stop\`

      **Show list of queue**
      \`/show\`
      notes: still under development, only showing top 5 queues because discord limiting only 1024 characters per message.

      **Remove track(s) from queue**
      \`/remove <<number>> <<count>>\`
      Example: \`/remove number:1\`
      Example(2): \`/remove number:1 count:3\`
      notes: \`<<count>>\` is optional

      **Repeat mode**
      \`/repeat <<mode>>\`
      Example: \`/repeat mode:current\`
      notes: 3 modes are available. \`all\` \`current\` and \`off\`

      **Jump to specific track in queue**
      \`/track <<number>>\`
      Example: \`/track number:1\`

      **Join voice channel**
      \`/join\`

      **Leave voice channel**
      \`/leave\`
      notes: in case any bug happen, use this command to reset the bot.

      **Check if bot is able to response**
      \`/ping\`
      `
    );

    return interaction.editReply({ embeds: [message] });
  }
}
