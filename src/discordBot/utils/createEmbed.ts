import type { APIEmbed } from "discord-api-types/v9";
import { EmbedBuilder, EmbedData } from "discord.js";

export default function createEmbed(data?: EmbedData | APIEmbed) {
	return new EmbedBuilder(data).setColor(0x00adff);
}
