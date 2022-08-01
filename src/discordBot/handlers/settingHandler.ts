import { Collection } from "discord.js";
import DiscordClient from "../client";
import Database from "../database";
import { GuildSettings } from "../libs/entities/GuildSettings";

const collection = "guilds";

export default class SettingHandler extends Collection<string, GuildSettings> {
	readonly client: DiscordClient;
	private readonly database: Database | undefined;

	constructor(client: DiscordClient) {
		super();

		this.client = client;
		this.database = client.database;
	}

	async getOrCreate(id: string): Promise<GuildSettings> {
		if (this.has(id)) return this.get(id) as GuildSettings;

		const row = await this.database?.get(collection, {
			_id: id
		});

		if (!row) return this.create(id);

		this.set(id, row as GuildSettings);

		return row as GuildSettings;
	}

	async create(id: string): Promise<GuildSettings> {
		const payload = { _id: id, language: "en-US", prefix: "!" };

		await this.database?.insert(collection, payload);
		this.set(id, payload);

		return payload as GuildSettings;
	}

	async update(id: string, value: any) {
		let payload = value;

		if (!this.has(id)) {
			payload = { _id: id, language: "en-US", prefix: "!", ...value };
			await this.database?.insert(collection, payload);
		} else {
			const row = await this.database?.update(collection, { _id: id }, value);
			payload = row?.value;
		}

		this.set(id, payload);

		return payload;
	}
}
