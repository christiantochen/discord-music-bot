import BotClient from "../client";

export default class Event {
	readonly client: BotClient;
	readonly name: string;
	once = false;

	constructor(client: BotClient, name: string) {
		this.client = client;
		this.name = name;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(..._args: unknown[]) {
		throw new Error("Unsupported operation.");
	}
}
