import Collection from "@discordjs/collection";
import NClient from "../libs/client";
import Database from "../libs/database";
import { GuildSettings } from "../libs/interfaces/GuildSettings";

const collection = "guilds";

export default class SettingHandler extends Collection<string, GuildSettings> {
  readonly client: NClient;
  private readonly database: Database;

  constructor(client: NClient) {
    super();

    this.client = client;
    this.database = client.database;
  }

  async getOrCreate(id: string): Promise<GuildSettings> {
    if (this.has(id)) return this.get(id) as GuildSettings;

    const row = await this.database?.get(collection, {
      _id: id,
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
    const row = await this.database?.update(collection, { _id: id }, value);

    const payload = row?.value as GuildSettings;
    this.set(id, payload);

    return payload;
  }
}
