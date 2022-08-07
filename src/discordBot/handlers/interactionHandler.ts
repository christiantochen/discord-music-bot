import type DiscordClient from "../client";
import { join } from "path";
import type Interaction from "../libs/structures/Interaction";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import getAllFiles from "../utils/getAllFiles";
import { Collection } from "discord.js";

export default class InteractionHandler extends Collection<
	string,
	Interaction
> {
	client: DiscordClient;

	constructor(client: DiscordClient) {
		super();

		this.client = client;

		this.init();
	}

	private async init() {
		const folder = "interactions";
		const path = join(__dirname, "..", folder);

		const files = getAllFiles(path);

		files.forEach((file) => {
			const interactionClass = ((r) => r.default || r)(require(file));
			const command: Interaction = new interactionClass(this.client);

			this.set(command.name, command);
		});
	}

	async deploy() {
		const commands = this.map((c) => c.toJSON());
		const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

		const { CLIENT_ID } = process.env;

		const guilds = this.client.guilds.cache;

		guilds.forEach((guild) => {
			rest.put(Routes.applicationGuildCommands(CLIENT_ID!, guild.id), {
				body: commands
			});
		});
	}
}
