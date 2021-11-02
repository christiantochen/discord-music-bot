import { GuildMember } from "discord.js";
import Event from "../libs/structures/Event";

export default class guildMemberAdd extends Event {
  async execute(member: GuildMember) {
    if (!member.guild.available) return;
    if (member.user.bot) return;
    if (!member.guild.systemChannel) return;

    const welcomeChannel = member.guild.systemChannel;
    const rulesChannel = member.guild.rulesChannel;

    let message = `Welcome <@${member.id}>`;

    if (rulesChannel) message += `, be sure to checkout ${rulesChannel}`;

    await welcomeChannel.send(message);
  }
}
