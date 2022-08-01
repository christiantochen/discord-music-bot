import DiscordClient from "../client";
import Event from "../libs/structures/Event";
import { join } from "path";
import getAllFiles from "../utils/getAllFiles";
import { Collection } from "discord.js";

export default class EventHandler extends Collection<string, Event> {
	readonly client: DiscordClient;

	constructor(client: DiscordClient) {
		super();

		this.client = client;

		this.init();
	}

	private async init() {
		const path = join(__dirname, "..", "events");

		const files = getAllFiles(path);

		files.forEach((file) => {
			const eventClass = ((r) => r.default || r)(require(file));
			const event: Event = new eventClass(this.client);

			this.set(event.name, event);

			this.client[event.once ? "once" : "on"](
				event.name,
				(...args: unknown[]) => event.execute(...args)
			);
		});
	}
}
