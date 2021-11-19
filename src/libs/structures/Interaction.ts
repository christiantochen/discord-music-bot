import {
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";
import NClient from "../client";

export default class Interaction {
  readonly client: NClient;
  readonly name: string;
  readonly description: string = "No description provided.";

  options: any[] = [];
  default_permission: boolean | undefined;

  constructor(client: NClient, name: string, description: string) {
    this.client = client;
    this.name = name;

    if (description.length > 0) this.description = description;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(..._args: unknown[]) {
    throw new Error("Unsupported operation.");
  }

  toJSON(): RESTPostAPIApplicationCommandsJSONBody {
    const command = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description!);

    if (this.default_permission !== undefined)
      command.setDefaultPermission(this.default_permission);

    this.options.forEach((option) => {
      if (option instanceof SlashCommandUserOption)
        command.addUserOption(option);
      if (option instanceof SlashCommandStringOption)
        command.addStringOption(option);
      if (option instanceof SlashCommandNumberOption)
        command.addNumberOption(option);
    });

    return command.toJSON();
  }
}
