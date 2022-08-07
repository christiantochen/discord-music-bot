import { ActivityType } from "discord.js";
import type DiscordClient from "../client";
import Event from "../libs/structures/Event";

export default class Ready extends Event {
	override name = "ready";
	override once = true;

	override async execute(client: DiscordClient): Promise<void> {
		await client.interactions.deploy();
		await client.user?.setPresence({
			status: "online",
			activities: [
				{
					name: "/help",
					type: ActivityType.Listening
				}
			]
		});

		console.log(
			`${this.client.user?.username} is ready to serve ${this.client.guilds.cache.size} guilds.`
		);
	}
}
