import Collection from "@discordjs/collection";
import NClient from "../libs/client";
import MusicPlayer from "../libs/structures/MusicPlayer";

export default class MusicPlayerHandler extends Collection<
  string,
  MusicPlayer
> {
  readonly client: NClient;

  constructor(client: NClient) {
    super();

    this.client = client;
  }

  async getOrCreate(guildId: string): Promise<MusicPlayer> {
    return this.get(guildId) ?? this.create(guildId);
  }

  async create(guildId: string): Promise<MusicPlayer> {
    const player = new MusicPlayer(this.client, guildId);
    this.set(guildId, player);
    return player;
  }
}
