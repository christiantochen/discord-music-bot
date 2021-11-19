import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  PlayerSubscription,
  VoiceConnection,
} from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import NClient from "../client";
import { getFixture } from "../fixtures";
import { createAudio } from "../utils";
import NMesssageEmbed from "./NMessageEmbed";

export default class MusicPlayer extends AudioPlayer {
  readonly client: NClient;
  readonly guildId: string;
  channelId: string | undefined;
  voiceChannelId: string | undefined;
  tracks: AudioResource<any>[] = [];
  track: AudioResource<any> | undefined;
  trackAt: number = -1;
  mode: "off" | "current" | "all" = "off";
  idleTimer: number = 60000;

  private connection: VoiceConnection | undefined;
  private subscription: PlayerSubscription | undefined;
  private stopCalled: boolean = false;
  private timeout: NodeJS.Timeout | undefined;

  constructor(client: NClient, guildId: string) {
    super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
    this.client = client;
    this.guildId = guildId;

    this.on(AudioPlayerStatus.Playing, this.onPlay);
    this.on(AudioPlayerStatus.Idle, this.onIdle);
  }

  async connect(
    voiceChannel: VoiceChannel,
    memberChannel: TextChannel
  ): Promise<boolean> {
    if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id) {
      this.client.log.info("exists");
      return false;
    }

    await this.loadTracksFromHistory();

    this.channelId = memberChannel.id;
    this.voiceChannelId = voiceChannel.id;
    this.connection = joinVoiceChannel({
      guildId: this.guildId,
      channelId: this.voiceChannelId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    this.client.log.info("new");
    this.subscription = this.connection.subscribe(this);
    this.setTimeout();

    return true;
  }

  stop(force?: boolean | undefined): boolean {
    this.client.log.info();
    this.stopCalled = true;
    return super.stop(force);
  }

  disconnect(): void {
    this.client.log.info();
    this.connection?.destroy();
    this.connection = undefined;
    this.voiceChannelId = undefined;
    this.subscription?.unsubscribe();
    this.subscription = undefined;

    if (this.state?.status !== AudioPlayerStatus.Idle) {
      this.stop(true);
    }
  }

  setRepeatMode(mode: any) {
    this.client.log.info(mode);
    return (this.mode = mode);
  }

  async skipTo(num: number): Promise<any> {
    if (this.tracks.length < num) return;

    this.trackAt = num - 1;
    this.track = await this.getTrack(this.trackAt);
    this.play(this.track);

    return this.track.metadata;
  }

  async removeAt(
    trackAt: number,
    count?: number | null | undefined
  ): Promise<any | undefined> {
    if (trackAt < 1) return;
    if (count && count < 1) return;
    if (this.tracks.length < trackAt - 1 + (count ?? 1)) return;

    const removed = this.tracks.splice(trackAt - 1, count ?? 1);
    await this.client.database?.update(
      "history",
      { _id: this.guildId },
      { data: this.tracks.map((t) => t.metadata) }
    );

    return removed.length;
  }

  async restart(): Promise<boolean> {
    this.client.log.info(this.hasTrack());
    if (!this.hasTrack()) return false;

    this.track = await this.getTrack(this.trackAt);
    this.play(this.track);
    await this.send(getFixture("music:NOW_PLAYING"), this.track.metadata);

    return true;
  }

  async add(audio: AudioResource<any>): Promise<any | undefined> {
    this.tracks.push(audio);
    this.client.log.info(audio.metadata.title);
    this.client.database?.update(
      "history",
      { _id: this.guildId },
      { _id: this.guildId, data: this.tracks.map((t) => t.metadata) }
    );

    if (!this.hasTrack() || this.state.status === AudioPlayerStatus.Idle) {
      this.trackAt = this.tracks.length - 1;
      this.track = audio;
      return this.play(audio);
    }

    this.client.log.info("tracks size", `${this.tracks.length}`);
    return this.tracks.length;
  }

  async prev(): Promise<any | undefined> {
    if (this.isFirstTrack()) return;

    this.trackAt--;
    this.track = await this.getTrack(this.trackAt);
    this.play(this.track);

    return this.track.metadata;
  }

  async next(forced: boolean = false): Promise<any | undefined> {
    this.client.log.info("forced", forced);

    if (this.isLastTrack()) {
      if (this.mode === "off" || forced) return;
      else if (this.mode === "all") this.trackAt = 0;
    } else this.trackAt++;

    this.track = this.tracks[this.trackAt];
    if (!this.track.readable || this.track.started)
      this.track = await createAudio(this.track.metadata);

    this.play(this.track);

    if (!forced) {
      await this.send(getFixture("music:NOW_PLAYING"), this.track.metadata);
    }

    return this.track.metadata;
  }

  async play(audio: AudioResource<any>) {
    this.client.log.info(audio.metadata?.title);
    return super.play(audio);
  }

  private async getTrack(trackAt: number): Promise<AudioResource<any>> {
    this.client.log.info(trackAt);
    let track = this.tracks[trackAt];

    if (!track.readable || track.started)
      track = await createAudio(track.metadata);

    return track;
  }

  private hasTrack() {
    return this.tracks && this.trackAt > -1;
  }

  private isFirstTrack() {
    return this.trackAt === 0;
  }

  private isLastTrack() {
    return this.tracks.length === this.trackAt + 1;
  }

  private async onPlay() {
    if (this.timeout) {
      this.client.log.info("clearTimeout");
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  private async onIdle() {
    if (this.stopCalled && this.connection) {
      return this.setTimeout();
    }

    if (this.track && this.connection) {
      if (this.mode === "current") {
        this.client.log.info("restart", this.mode);
        await this.restart();
      } else {
        const next = await this.next();
        if (!next) this.setTimeout();
      }
    }
  }

  private async setTimeout() {
    this.client.log.info("setTimeout", this.idleTimer);
    this.stopCalled = false;
    this.timeout = setTimeout(() => this.disconnect, this.idleTimer);
  }

  private async loadTracksFromHistory() {
    const history = await this.client.database?.get("history", {
      _id: this.guildId,
    });

    if (history) {
      const data = history.data as any[];
      await Promise.all(
        data.map(async (metadata) => {
          const audio = await createAudio(metadata);
          this.tracks.push(audio);
        })
      );

      if (this.tracks.length > 0) {
        this.trackAt = 0;
        this.track = this.tracks[this.trackAt];
      }
    }
  }

  private async send(title: string, metadata: any) {
    const channel = this.client.channels.cache.get(
      this.channelId!
    ) as TextChannel;

    return channel.send({
      embeds: [
        new NMesssageEmbed().addField(
          title,
          getFixture("music:METADATA", metadata)
        ),
      ],
    });
  }
}
