import { generateDependencyReport } from "@discordjs/voice";
import dotenv from "dotenv";
import Client from "./libs/client";

dotenv.config();

const client = new Client();

client.once("ready", () => {
	console.log(generateDependencyReport());
});
