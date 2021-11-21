import { VoiceState } from "discord.js";
import Event from "../libs/structures/Event";

export default class VoiceStateUpdate extends Event {
	async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
		if (newState.member?.user.id !== this.client.user?.id) return;
		if (!newState.member?.voice.channel) {
			const manager = this.client.musics.get(newState.member?.guild.id!);
			if (manager) {
				manager.disconnect();
				this.client.musics.delete(newState.member?.guild.id!);
			}
		}
	}
}
