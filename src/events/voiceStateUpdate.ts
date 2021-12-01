import { AudioPlayerStatus } from "@discordjs/voice";
import { VoiceState } from "discord.js";
import Event from "../libs/structures/Event";

export default class VoiceStateUpdate extends Event {
	// oldState: someone disconnected
	// newState: someone connected
	async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
		// if before is 1 member and increased to 2 member
		// check and clear player timeout
		if (newState.channel && newState.channel?.members.size === 2) {
			const player = this.client.musics.get(newState.member?.guild.id!);
			// Only clear if status is playing
			// because there's no point on clearing it's timeout when the player itself is idle
			if (player?.state.status === AudioPlayerStatus.Playing) {
				this.client.log.info("Not alone anymore", "clear timeout");
				player?.clearTimeout();
			}
		}
		// if there's only 1 member left
		else if (oldState.channel?.members.size === 1) {
			const lastMember = oldState.channel.members.first();
			// and the last member is the bot itself
			// set timeout for player to disconnect
			if (lastMember?.user.id === this.client.user?.id) {
				this.client.log.info("alone", "set self timeout");
				this.client.musics.get(lastMember?.guild.id!)?.setTimeout();
			}
		}
		// if bot was forcefully disconnected by user
		// clean the music player
		else if (
			newState.member?.user.id === this.client.user?.id &&
			!newState.member?.voice.channel
		) {
			this.client.log.info("disconnected");
			this.client.musics.delete(newState.member?.guild.id!);
		}
	}
}
