import {
  AudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import { createAudio } from "../utils/play-dl";

export type RepeatMode = "off" | "current" | "all";

export default class MusicPlayer extends AudioPlayer {
  mode: RepeatMode = "off";
  tracks: any[] = [];
  trackAt: number = 0;

  constructor() {
    super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
  }

  async load(tracks: any[] | undefined) {
    if (!tracks) return;
    this.tracks = tracks;
  }

  setMode(mode: RepeatMode | undefined) {
    return (this.mode = mode || "off");
  }

  async play(metadata: any): Promise<any> {
    super.play(await createAudio(metadata));
    return metadata;
  }

  async add(metadata: any): Promise<any | undefined> {
    this.tracks.push(metadata);

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

  async skip(trackAt: number): Promise<any | undefined> {
    if (trackAt <= 0) return;
    if (this.tracks.length < trackAt) return;
    this.trackAt = trackAt;
    return this.play(this.tracks[this.trackAt - 1]);
  }

  async next(): Promise<any | undefined> {
    if (this.tracks.length !== this.trackAt) this.trackAt++;
    else if (this.mode === "all") this.trackAt = 1;
    else if (this.mode === "off") return;
    return this.play(this.tracks[this.trackAt - 1]);
  }

  async prev(): Promise<any | undefined> {
    if (this.tracks.length <= 1) return;
    this.trackAt--;
    return this.play(this.tracks[this.trackAt - 1]);
  }

  async remove(
    trackFrom: number,
    count?: number | null | undefined
  ): Promise<any | undefined> {
    if (trackFrom < 0) return;
    if (count && count < 1) return;
    else count = 1;
    if (this.tracks.length < trackFrom + count) return;

    const track = this.tracks[this.trackAt - 1];
    const removedTrack = this.tracks.splice(trackFrom - 1, count);
    this.trackAt = this.tracks.findIndex((v) => v.id === track.id) + 1;

    return removedTrack;
  }

  stop(force?: boolean | undefined): boolean {
    return super.stop(force);
  }
}
