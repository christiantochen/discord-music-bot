import Collection from "@discordjs/collection";
import NClient from "../libs/client";
import DefaultSettings, {
  GuildSettings,
} from "../libs/interfaces/GuildSettings";

export default class SettingHandler extends Collection<string, GuildSettings> {
  readonly client: NClient;

  constructor(client: NClient) {
    super();

    this.client = client;
  }

  async getOrCreate(id: string) {
    if (this.has(id)) return this.get(id) as GuildSettings;

    const row = (await this.client.database.get("guilds", {
      id: id,
    })) as GuildSettings;

    if (!row) return this.create(id);

    this.set(id, row);
    return row;
  }

  async create(id: string) {
    const payload = DefaultSettings(id);

    await this.client.database.insert("guilds", payload);
    this.set(id, payload);

    return payload;
  }

  async update(id: string, value: any) {
    const row = await this.client.database.update("guilds", { id }, value);

    const payload = row?.value as GuildSettings;
    this.set(id, payload);

    return payload;
  }
}
