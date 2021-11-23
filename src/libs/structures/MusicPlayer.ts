import {
	AudioPlayer,
	AudioPlayerStatus,
	NoSubscriberBehavior
} from "@discordjs/voice";
import { createAudio } from "../utils/play-dl";

export type LoopMode = "off" | "current" | "all";

export default class MusicPlayer extends AudioPlayer {
	loop: LoopMode = "off";
	tracks: any[] = [];
	// trackAt start from 0, so when used as index need to -1
	trackAt = 0;

	constructor() {
		super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
	}

	load(tracks: any[] | undefined): void {
		if (tracks) this.tracks = tracks;
	}

	setLoop(loop: LoopMode | undefined) {
		this.loop = loop || "off";
	}

	async play(metadata: any): Promise<any> {
		super.play(await createAudio(metadata));
		return metadata;
	}

	async add(metadata: any): Promise<any | undefined> {
		this.tracks.push(metadata);

		// if first time or player currently not playing anything
		// then immediately play the newly added track
		if (
			this.tracks.length === 1 ||
			this.state.status === AudioPlayerStatus.Idle
		) {
			this.trackAt = this.tracks.length;
			return this.play(metadata);
		}

		return;
	}

	async restart(): Promise<any> {
		return this.play(this.tracks[this.trackAt - 1]);
	}

	async skip(trackNo: number): Promise<any | undefined> {
		if (trackNo <= 0) return;
		if (this.tracks.length < trackNo) return;

		return this.play(this.tracks[(this.trackAt = trackNo) - 1]);
	}

	async next(): Promise<any | undefined> {
		if (this.tracks.length !== this.trackAt) this.trackAt++;
		else if (this.loop === "all") this.trackAt = 1;
		else if (this.loop === "off") return;

		return this.play(this.tracks[this.trackAt - 1]);
	}

	async prev(): Promise<any | undefined> {
		if (this.tracks.length <= 1) return;
		this.trackAt--;

		return this.play(this.tracks[this.trackAt - 1]);
	}

	remove(
		trackFrom: number,
		count?: number | null | undefined
	): any | undefined {
		if (trackFrom < 0) return;
		if (count && count < 1) return;
		else if (!count) count = 1;
		if (trackFrom + count - 1 > this.tracks.length) return;

		// get current playing track
		// ignore if there's no track playing
		let track: any;
		if (this.trackAt != 0) {
			track = this.tracks[this.trackAt - 1];
		}

		// remove tracks
		const removedTrack = this.tracks.splice(trackFrom - 1, count);

		// update current track position
		// ignore if there's no track playing
		if (track) {
			this.trackAt = this.tracks.findIndex((v) => v.id === track.id) + 1;
		}

		return removedTrack;
	}
}
