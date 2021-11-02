import { APIEmbed } from "discord-api-types";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export default class NMesssageEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
    super(data);
    this.setColor(0x00adff);
  }
}
