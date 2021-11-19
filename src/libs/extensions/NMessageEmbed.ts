import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { APIEmbed } from "discord-api-types";

export default class NMesssageEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
    super(data);
    this.setColor(0x00adff);
  }
}
