import { GuildMember, VoiceState } from "discord.js";
import Event from "../libs/structures/Event";

export default class VoiceStateUpdate extends Event {
  async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (newState.member?.id !== this.client.user?.id) return;
    if (!newState.member?.voice.channel) {
      const player = this.client.musicPlayers.get(newState.member?.guild.id!);
      if (player) {
        player.disconnect();
        this.client.musicPlayers.delete(newState.member?.guild.id!);
      }
    }
  }
}
