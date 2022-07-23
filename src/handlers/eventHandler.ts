import Client from "../libs/client";
import Event from "../libs/structures/Event";
import { join } from "path";
import getAllFiles from "../libs/utils/getAllFiles";
import { Collection } from "discord.js";

export default class EventHandler extends Collection<string, Event> {
	readonly client: Client;

	constructor(client: Client) {
		super();

		this.client = client;

		this.init();
	}

	private async init() {
		const path = join(__dirname, "..", "events");

		const files = getAllFiles(path);

		files.forEach((file) => {
			const eventClass = ((r) => r.default || r)(require(file));
			const eventFiles = file.split("/");
			const eventName = eventFiles[eventFiles.length - 1].split(".")[0];
			const event: Event = new eventClass(this.client, eventName);

			this.set(event.name, event);

			console.log(event.name);

			this.client[event.once ? "once" : "on"](
				event.name,
				(...args: unknown[]) => event.execute(...args)
			);
		});
	}
}
