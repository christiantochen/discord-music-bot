import Event from "../libs/structures/Event";

export default class Ready extends Event {
  once = true;

  async execute(): Promise<void> {
    await this.client.slashCommands.deploy();
    await this.client.user?.setStatus("online");
    await this.client.user?.setActivity({
      name: `Lozernhein`,
      type: "LISTENING",
    });

    this.client.log.info(
      `${this.client.user?.username} is ready to serve ${this.client.guilds.cache.size} guilds on ${process.env.NODE_ENV}.`
    );
  }
}
