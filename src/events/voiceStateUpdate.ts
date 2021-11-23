import { AudioPlayerStatus } from "@discordjs/voice";
import { VoiceState } from "discord.js";
import Event from "../libs/structures/Event";

export default class VoiceStateUpdate extends Event {
	// oldState: someone disconnected
	// newState: someone connected
	async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
		// if before is 1 member and increased to 2 member
		// check and clear manager timeout
		if (
			newState.channel?.members.size &&
			newState.channel?.members.size === 2
		) {
			const manager = this.client.musics.get(newState.member?.guild.id!);

			// Only clear if status is playing
			// because there's no point on clearing it's timeout when the player itself is idle
			if (manager?.getInfo().state.status === AudioPlayerStatus.Playing) {
				manager?.clearTimeout();
			}
		}
		// if there's only 1 member left
		else if (oldState.channel?.members.size === 1) {
			const lastMember = oldState.channel.members.first();
			// and the last member is the bot itself
			// set timeout for manager to disconnect
			if (lastMember?.user.id === this.client.user?.id) {
				const manager = this.client.musics.get(oldState.member?.guild.id!);
				manager?.setTimeout();
			}
		}
		// if bot was forcefully disconnected by player
		// clean the music player
		else if (
			newState.member?.user.id === this.client.user?.id &&
			!newState.member?.voice.channel
		) {
			const manager = this.client.musics.get(newState.member?.guild.id!);
			if (manager) {
				manager.disconnect();
				this.client.musics.delete(newState.member?.guild.id!);
			}
		}
	}
}
