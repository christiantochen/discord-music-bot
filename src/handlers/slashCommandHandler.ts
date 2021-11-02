import Collection from "@discordjs/collection";
import NClient from "../libs/client";
import { join } from "path";
import SlashCommand from "../libs/structures/SlashCommand";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import getAllFiles from "../libs/getAllFiles";
import { getFixture } from "../libs/fixtures";

export default class SlashCommandHandler extends Collection<
  string,
  SlashCommand
> {
  client: NClient;

  constructor(client: NClient) {
    super();

    this.client = client;

    // TODO: fix error logger
    this.init().catch(console.error);
  }

  private async init() {
    const folder = "slashCommands";
    const path = join(__dirname, "..", folder);

    const files = getAllFiles(path).filter((file) =>
      file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts")
    );

    files.forEach((file) => {
      const commandClass = ((r) => r.default || r)(require(file));
      const commandFiles = file.split("/");
      const fileName = commandFiles[commandFiles.length - 1].split(".")[0];
      const subFolder = file.split(folder)[1];

      const command: SlashCommand = new commandClass(
        this.client,
        fileName,
        getFixture(`${subFolder}:DESCRIPTION`)
      );

      this.set(command.name, command);
    });
  }

  async deploy() {
    const commands = this.map((c) => c.toJSON());
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);

    const { CLIENT_ID, GUILD_ID } = process.env;

    const guilds = await this.client.guilds.cache;

    guilds.forEach((guild) => {
      rest.put(Routes.applicationGuildCommands(CLIENT_ID!, guild.id), {
        body: commands,
      });
    });
  }
}
