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
  tracks: AudioResource[] = [];
  track: AudioResource | undefined;
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
    this.on("error", (e) => {
      client.log.error(e);
    });
  }

  connect(voiceChannel: VoiceChannel, memberChannel: TextChannel) {
    if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id) {
      this.client.log.info("exists");
      return this.subscription;
    }

    this.channelId = memberChannel.id;
    this.voiceChannelId = voiceChannel.id;

    this.connection = joinVoiceChannel({
      guildId: this.guildId,
      channelId: this.voiceChannelId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    this.client.log.info("new");
    return (this.subscription = this.connection.subscribe(this));
  }

  stop(force?: boolean | undefined): boolean {
    this.stopCalled = true;
    this.track = undefined;
    this.trackAt = -1;
    this.client.log.info();

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
      this.client.log.info("stop");
      this.stop(true);
    }
  }

  setRepeatMode(mode: string) {
    this.client.log.info(mode);
    switch (mode) {
      case "off":
      case "current":
      case "all":
        return (this.mode = mode);
      default:
        return (this.mode = "off");
    }
  }

  async skipTo(skipNo: number): Promise<any> {
    if (this.tracks.length < skipNo) return;

    this.trackAt = skipNo - 1;
    this.client.log.info("trackAt", this.trackAt);
    this.track = this.tracks[this.trackAt];
    this.client.log.info("play", (this.track.metadata as any)?.title);
    this.play(this.track);

    return this.track.metadata;
  }

  async restart(): Promise<boolean> {
    this.client.log.info("hasTrack and !firstTrack", this.trackAt < 0);
    if (this.trackAt < 0) return false;

    this.track = await createAudio(this.track?.metadata);
    this.client.log.info("play", (this.track.metadata as any)?.title);
    this.play(this.track);
    await this.send(getFixture("music:NOW_PLAYING"), this.track.metadata);

    return true;
  }

  async add(audio: AudioResource): Promise<any | undefined> {
    this.tracks.push(audio);
    this.client.log.info("hasTrack", this.trackAt != -1);

    if (this.trackAt === -1) {
      this.trackAt = 0;
      this.track = audio;
      this.client.log.info("play", (audio.metadata as any)?.title);
      return this.play(audio);
    }

    this.client.log.info("tracks", `${this.tracks.length}`);
    return this.tracks.length;
  }

  async prev(): Promise<any | undefined> {
    if (this.trackAt < 1) return;

    this.trackAt--;
    this.client.log.info("trackAt", this.trackAt);
    this.track = this.tracks[this.trackAt];

    if (!this.track.readable || this.track.started)
      this.track = await createAudio(this.track.metadata);

    this.client.log.info("play", (this.track.metadata as any)?.title);
    this.play(this.track);

    return this.track.metadata;
  }

  async next(forced: boolean = false): Promise<any | undefined> {
    this.client.log.info("forced", forced);

    if (this.tracks.length === this.trackAt + 1) {
      if (forced) return;

      if (this.mode === "all") this.trackAt = 0;
      else if (this.mode === "off") this.trackAt = -1;
    } else this.trackAt++;

    this.client.log.info("trackAt", this.trackAt);
    if (this.trackAt < 0) return (this.track = undefined);

    this.track = this.tracks[this.trackAt];
    if (!this.track.readable || this.track.started)
      this.track = await createAudio(this.track.metadata);

    this.client.log.info("play", (this.track.metadata as any)?.title);
    this.play(this.track);

    if (!forced) {
      await this.send(getFixture("music:NOW_PLAYING"), this.track.metadata);
    }

    return this.track.metadata;
  }

  private async onPlay() {
    if (this.timeout) {
      this.client.log.info("clear_timeout");
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  private async onIdle() {
    let shouldSetTimeout;

    if (this.track) {
      if (this.mode === "current") {
        this.client.log.info("restart", this.mode);
        await this.restart();
      } else {
        const next = await this.next();
        shouldSetTimeout = !next;
        this.client.log.info("next", !!next);
      }
    }

    if ((shouldSetTimeout || this.stopCalled) && this.connection) {
      this.client.log.info("set_timeout", this.idleTimer);
      this.stopCalled = false;
      this.timeout = setTimeout(() => this.disconnect(), this.idleTimer);
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
