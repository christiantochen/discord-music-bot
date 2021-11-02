import { Client, Intents } from "discord.js";
import SlashCommandHandler from "../handlers/slashCommandHandler";
import EventHandler from "../handlers/eventHandler";
import MusicPlayerHandler from "../handlers/musicPlayerHandler";

export default class NClient extends Client {
  public slashCommands = new SlashCommandHandler(this);
  public events = new EventHandler(this);
  public musicPlayers = new MusicPlayerHandler(this);

  public caches = {};

  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });

    this.login(process.env.TOKEN!).catch(console.error);
  }
}
