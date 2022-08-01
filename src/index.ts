import { generateDependencyReport } from "@discordjs/voice";
import dotenv from "dotenv";
import DiscordClient from "./discordBot/client";
import Database from "./discordBot/database";

dotenv.config();

const database = new Database();
const client = new DiscordClient(database);

client.once("ready", () => {
	console.log(generateDependencyReport());
});
