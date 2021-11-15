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
  private forcedStop: boolean = false;
  private timeout: NodeJS.Timeout | undefined;

  constructor(client: NClient, guildId: string) {
    super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
    this.client = client;
    this.guildId = guildId;

    this.on(AudioPlayerStatus.Playing, this.onPlay);
    this.on(AudioPlayerStatus.Idle, this.onIdle);
    this.on("error", console.error);
  }

  connect(voiceChannel: VoiceChannel, memberChannel: TextChannel) {
    if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id) {
      console.log("music_player:connect", "existing");
      return this.subscription;
    }

    console.log("music_player:connect", "new");
    this.channelId = memberChannel.id;
    this.voiceChannelId = voiceChannel.id;

    this.connection = joinVoiceChannel({
      guildId: this.guildId,
      channelId: this.voiceChannelId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    this.subscription = this.connection.subscribe(this);
  }

  stop(force?: boolean | undefined): boolean {
    this.track = undefined;
    this.trackAt = -1;
    this.forcedStop = true;
    console.log("music_player:stop", "clearing track.");

    return super.stop(force);
  }

  disconnect(): void {
    console.log("music_player:disconnect");

    this.connection?.destroy();
    this.connection = undefined;
    this.voiceChannelId = undefined;
    this.subscription?.unsubscribe();
    this.subscription = undefined;

    if (this.state?.status !== AudioPlayerStatus.Idle) {
      console.log("music_player:disconnect:stop", this.state.status);
      this.stop(true);
    }
  }

  setRepeatMode(mode: string) {
    console.log("music_player:setRepeatMode", mode);
    switch (mode) {
      case "off":
      case "current":
      case "all":
        return (this.mode = mode);
      default:
        return (this.mode = "off");
    }
  }

  async restart(): Promise<boolean> {
    console.log("music_player:restart", this.trackAt < 0);
    if (this.trackAt < 0) return false;

    this.track = await createAudio(this.track?.metadata);
    console.log(
      "music_player:restart:play",
      (this.track.metadata as any)?.title
    );
    this.play(this.track);
    await this.send(getFixture("music:NOW_PLAYING"), this.track.metadata);

    return true;
  }

  async add(audio: AudioResource): Promise<any | undefined> {
    this.tracks.push(audio);
    console.log("music_player:add:track", (audio.metadata as any)?.title);
    console.log("music_player:add:trackPlay", this.trackAt === -1);

    if (this.trackAt === -1) {
      this.trackAt = 0;
      this.track = audio;
      return this.play(audio);
    }

    console.log("music_player:add:trackAt", `#${this.tracks.length}`);
    return this.tracks.length;
  }

  async prev(): Promise<any | undefined> {
    if (this.trackAt < 1) return;

    this.trackAt--;

    console.log("music_player:prev", this.trackAt);

    this.track = this.tracks[this.trackAt];
    if (!this.track.readable || this.track.started)
      this.track = await createAudio(this.track.metadata);

    this.play(this.track);
    console.log("music_player:prev:play", (this.track.metadata as any)?.title);

    return this.track.metadata;
  }

  async next(forced: boolean = false): Promise<any | undefined> {
    console.log("music_player:next:forced", forced);

    if (this.tracks.length === this.trackAt + 1) {
      if (forced) return;

      if (this.mode === "all") this.trackAt = 0;
      else if (this.mode === "off") this.trackAt = -1;
    } else this.trackAt++;

    console.log("music_player:next", this.trackAt);

    if (this.trackAt < 0) {
      this.track = undefined;
      return;
    }

    this.track = this.tracks[this.trackAt];
    if (!this.track.readable || this.track.started)
      this.track = await createAudio(this.track.metadata);

    this.play(this.track);
    console.log("music_player:next:play", (this.track.metadata as any)?.title);

    if (!forced) {
      await this.send(getFixture("music:NOW_PLAYING"), this.track.metadata);
    }

    return this.track.metadata;
  }

  private async onPlay() {
    if (this.timeout) {
      console.log("music_player:on_play:clear_timeout");
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  private async onIdle() {
    let shouldSetTimeout;

    if (this.track) {
      if (this.mode === "current") {
        console.log("music_player:on_idle:restart", this.mode);
        await this.restart();
      } else {
        const next = await this.next();
        shouldSetTimeout = !next;
        console.log("music_player:on_idle:next", !!next);
      }
    }

    if ((shouldSetTimeout || this.forcedStop) && this.connection) {
      console.log("music_player:on_idle:set_timeout", this.idleTimer);
      this.forcedStop = false;
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
