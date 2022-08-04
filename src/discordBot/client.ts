import { Client, GatewayIntentBits } from "discord.js";
import EventHandler from "./handlers/eventHandler";
import InteractionHandler from "./handlers/interactionHandler";
import MusicHandler from "./handlers/musicHandler";
import SettingHandler from "./handlers/settingHandler";
import Database from "./database";

export default class DiscordClient extends Client {
	public caches = {};

	public readonly database: Database = new Database();
	public settings = new SettingHandler(this);
	public events = new EventHandler(this);
	public interactions = new InteractionHandler(this);
	public musics = new MusicHandler(this);

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildVoiceStates
			]
		});

		this.login(process.env.TOKEN!);
	}
}
