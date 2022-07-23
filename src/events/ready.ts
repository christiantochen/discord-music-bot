import { ActivityType } from "discord.js";
import Client from "../libs/client";
import Event from "../libs/structures/Event";

export default class Ready extends Event {
	once = true;

	async execute(client: Client): Promise<void> {
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
			`${this.client.user?.username} is ready to serve ${this.client.guilds.cache.size} guilds on ${process.env.NODE_ENV}.`
		);
	}
}
