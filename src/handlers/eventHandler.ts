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

    // TODO: fix error logger
    this.init().catch(console.error);
  }

  private async init() {
    const path = join(__dirname, "..", "events");

    const eventFiles = getAllFiles(path).filter((file) => file.endsWith(".ts"));

    eventFiles.forEach((file) => {
      const eventClass = ((r) => r.default || r)(require(file));
      const files = file.split("/");
      const eventName = files[files.length - 1].split(".")[0];

      const event: Event = new eventClass(this.client, eventName);

      this.set(event.name, event);

      this.client[event.once ? "once" : "on"](
        event.name,
        (...args: unknown[]) => event.execute(...args)
      );
    });
  }
}
