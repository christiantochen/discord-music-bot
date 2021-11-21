import Collection from "@discordjs/collection";
import BotClient from "../libs/client";
import MusicManager from "../libs/managers/MusicManager";

export default class MusicHandler extends Collection<string, MusicManager> {
	readonly client: BotClient;

	constructor(client: BotClient) {
		super();
		this.client = client;
	}

	getOrCreate(guildId: string): MusicManager {
		return this.get(guildId) ?? this.create(guildId);
	}

	create(guildId: string): MusicManager {
		const player = new MusicManager(this.client, guildId);
		this.set(guildId, player);
		return player;
	}
}
