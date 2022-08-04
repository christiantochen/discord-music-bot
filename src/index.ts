import { generateDependencyReport } from "@discordjs/voice";
import dotenv from "dotenv";
import DiscordClient from "./discordBot/client";

dotenv.config();

const client = new DiscordClient();

client.once("ready", () => {
	console.log(generateDependencyReport());
});
