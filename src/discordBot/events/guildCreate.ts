import type { Guild } from "discord.js";
import Event from "../libs/structures/Event";

export default class guildCreate extends Event {
	override name = "guildCreate";

	override async execute(guild: Guild) {
		console.log(guild);
	}
}
