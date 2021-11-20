import { CommandInteraction } from "discord.js";

export default function decorator<
  T extends (interaction: CommandInteraction) => Promise<boolean | undefined>
>(func: T) {
  return (_: unknown, __: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (interaction: CommandInteraction) {
      const passed = await func(interaction);
      if (passed) await method.call(this, interaction);
      return undefined;
    };
  };
}
