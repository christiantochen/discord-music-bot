import Collection from "@discordjs/collection";
import NClient from "../libs/client";
import Event from "../libs/structures/Event";
import { join } from "path";
import getAllFiles from "../libs/getAllFiles";

export default class EventHandler extends Collection<string, Event> {
  readonly client: NClient;

  constructor(client: NClient) {
    super();

    this.client = client;

    this.init();
  }

  private async init() {
    const path = join(__dirname, "..", "events");

    const files = getAllFiles(path).filter((file) =>
      file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts")
    );

    files.forEach((file) => {
      const eventClass = ((r) => r.default || r)(require(file));
      const eventFiles = file.split("/");
      const eventName = eventFiles[eventFiles.length - 1].split(".")[0];

      const event: Event = new eventClass(this.client, eventName);

      this.set(event.name, event);

      this.client[event.once ? "once" : "on"](
        event.name,
        (...args: unknown[]) => event.execute(...args)
      );
    });
  }
}
