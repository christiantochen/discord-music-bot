import type DiscordClient from "../../client";

export default class Event {
	readonly client: DiscordClient;
	name: string = "";
	once: boolean = false;

	constructor(client: DiscordClient) {
		this.client = client;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(..._args: unknown[]) {
		throw new Error("Unsupported operation.");
	}
}
