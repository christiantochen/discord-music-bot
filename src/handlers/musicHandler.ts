import Collection from "@discordjs/collection";
import BotClient from "../libs/client";
import MusicPlayer from "../libs/structures/MusicPlayer";

export default class MusicHandler extends Collection<string, MusicPlayer> {
	readonly client: BotClient;

	constructor(client: BotClient) {
		super();
		this.client = client;
	}

	getOrCreate(guildId: string): MusicPlayer {
		return this.get(guildId) ?? this.create(guildId);
	}

	create(guildId: string): MusicPlayer {
		const player = new MusicPlayer(this.client, guildId);
		this.set(guildId, player);
		return player;
	}
}
