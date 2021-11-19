import Collection from "@discordjs/collection";
import NClient from "../libs/client";
import MusicPlayerManager from "../libs/managers/MusicPlayerManager";

export default class MusicPlayerHandler extends Collection<
  string,
  MusicPlayerManager
> {
  readonly client: NClient;

  constructor(client: NClient) {
    super();

    this.client = client;
  }

  async getOrCreate(guildId: string): Promise<MusicPlayerManager> {
    return this.get(guildId) ?? this.create(guildId);
  }

  async create(guildId: string): Promise<MusicPlayerManager> {
    const player = new MusicPlayerManager(this.client, guildId);
    this.set(guildId, player);
    return player;
  }
}
