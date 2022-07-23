import Client from "../client";

export default class Event {
	readonly client: Client;
	readonly name: string;
	once = false;

	constructor(client: Client, name: string) {
		this.client = client;
		this.name = name;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(..._args: unknown[]) {
		throw new Error("Unsupported operation.");
	}
}
