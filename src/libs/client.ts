import { Client, Intents } from "discord.js";
import EventHandler from "../handlers/eventHandler";
import MusicPlayerHandler from "../handlers/musicPlayerHandler";
import { Logger } from "tslog";
import Database from "./database";
import SettingHandler from "../handlers/settingHandler";
import InteractionHandler from "../handlers/interactionHandler";

export default class NClient extends Client {
  public log: Logger = new Logger();
  public database = new Database(this);
  public settings = new SettingHandler(this);

  public interactions = new InteractionHandler(this);
  public events = new EventHandler(this);
  public musicPlayers = new MusicPlayerHandler(this);

  public caches = {};

  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });

    this.login(process.env.TOKEN!);
  }
}
