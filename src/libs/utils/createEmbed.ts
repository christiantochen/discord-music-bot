import { APIEmbed } from "discord-api-types";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export default function createEmbed(
  data?: MessageEmbed | MessageEmbedOptions | APIEmbed
) {
  return new MessageEmbed(data).setColor(0x00adff);
}
