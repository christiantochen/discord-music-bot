import Event from "../libs/structures/Event";

export default class Ready extends Event {
  once = true;

  async execute() {
    await this.client.slashCommands.deploy();
    await this.client.user?.setStatus("online");
    await this.client.user?.setActivity({
      name: `Goshujin-sama`,
      type: "LISTENING",
    });

    console.log(
      `${this.client.user?.username} is ready to serve ${this.client.guilds.cache.size} guilds.`
    );
  }
}
