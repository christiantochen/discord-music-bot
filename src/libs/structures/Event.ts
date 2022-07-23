import Client from "../client";

export default class Event {
	readonly client: Client;
	name: string = "";
	once: boolean = false;

	constructor(client: Client) {
		this.client = client;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(..._args: unknown[]) {
		throw new Error("Unsupported operation.");
	}
}
