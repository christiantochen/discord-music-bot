import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import Client from "../client";

export default class Interaction {
	readonly client: Client;
	readonly name: string;

	description: string = "No description provided.";
	options: any[] = [];
	dmPermission: boolean | undefined;

	constructor(client: Client, name: string) {
		this.client = client;
		this.name = name;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(..._args: unknown[]) {
		throw new Error("Unsupported operation.");
	}

	toJSON(): RESTPostAPIApplicationCommandsJSONBody {
		const command = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description!);

		command.setDMPermission(this.dmPermission);

		this.options.forEach((option) => {
			command.options.push(option);
		});

		return command.toJSON();
	}
}
