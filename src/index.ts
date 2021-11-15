import dotenv from "dotenv";
import NClient from "./libs/client";

dotenv.config();

console.log(`Running on ${process.env.NODE_ENV} environment.`);

new NClient();
