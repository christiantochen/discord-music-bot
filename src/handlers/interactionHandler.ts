import Client from "../libs/client";
import { join } from "path";
import Interaction from "../libs/structures/Interaction";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import getAllFiles from "../libs/utils/getAllFiles";
import { Collection } from "discord.js";

export default class InteractionHandler extends Collection<
	string,
	Interaction
> {
	client: Client;

	constructor(client: Client) {
		super();

		this.client = client;

		this.init();
	}

	private async init() {
		const folder = "interactions";
		const path = join(__dirname, "..", folder);

		const files = getAllFiles(path).filter((file) =>
			file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts")
		);

		files.forEach((file) => {
			const interactionClass = ((r) => r.default || r)(require(file));
			const interactionFiles = file.split("\\");
			const fileName =
				interactionFiles[interactionFiles.length - 1].split(".")[0];

			const command: Interaction = new interactionClass(this.client, fileName);

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
