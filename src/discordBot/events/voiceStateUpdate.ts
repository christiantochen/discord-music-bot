import { AudioPlayerStatus } from "@discordjs/voice";
import type { VoiceState } from "discord.js";
import Event from "../libs/structures/Event";

export default class VoiceStateUpdate extends Event {
	override name = "voiceStateUpdate";
	// oldState: someone disconnected
	// newState: someone connected
	override async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
		// if a user join a voice channel
		// if voice channel members become to 2 member
		if (newState.channel?.members.size === 2) {
			const player = this.client.musics.get(newState.member?.guild.id!);

			// check and clear player timeout
			// Only clear if status is playing
			// because there's no point on clearing it's timeout when the player itself is idle
			if (player?.state.status === AudioPlayerStatus.Playing) {
				console.log("Not alone anymore", "clear timeout");
				player?.clearTimeout();
			}
		}
		// if a user leave a voice channel
		else if (!newState.channel) {
			// if bot was forcefully disconnected by user
			// clean the music player
			if (
				newState.member?.user.id === this.client.user?.id &&
				!newState.member?.voice.channel
			) {
				console.log("disconnected");
				this.client.musics.delete(newState.member?.guild.id!);
			}
			// if there's only 1 member left
			else if (oldState.channel?.members.size === 1) {
				const lastMember = oldState.channel.members.first();
				// and the last member is the bot itself
				// set timeout for player to disconnect
				if (lastMember?.user.id === this.client.user?.id) {
					console.log("alone", "set self timeout");
					this.client.musics.get(lastMember?.guild.id!)?.setTimeout();
				}
			}
		}
	}
}
