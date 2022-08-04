import { Guild } from "discord.js";
import Event from "../libs/structures/Event";

export default class guildCreate extends Event {
	name = "guildCreate";

	async execute(guild: Guild) {
		console.log(guild);
	}
}
