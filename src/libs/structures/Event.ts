import NClient from "../client";

export default class Event {
  readonly client: NClient;
  readonly name: string;
  once: boolean = false;

  constructor(client: NClient, name: string) {
    this.client = client;
    this.name = name;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(..._args: unknown[]) {
    throw new Error("Unsupported operation.");
  }
}
