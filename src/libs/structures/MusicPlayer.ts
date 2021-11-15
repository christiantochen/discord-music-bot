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
  current: AudioResource | undefined;
  queues: AudioResource[] = [];
  // queueAt: number = 0;
  mode: "off" | "current" | "all" = "off";
  idleTimer: number = 60000;

  private connection: VoiceConnection | undefined;
  private subscription: PlayerSubscription | undefined;
  private forcedNext: boolean = false;
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
    if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id)
      return this.subscription;

    this.channelId = memberChannel.id;
    this.voiceChannelId = voiceChannel.id;

    this.connection = joinVoiceChannel({
      guildId: this.guildId,
      channelId: this.voiceChannelId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    this.subscription = this.connection.subscribe(this);
  }

  disconnect(): void {
    this.queues = [];
    this.current = undefined;

    if (this.state?.status !== AudioPlayerStatus.Idle) {
      this.stop(true);
    }

    this.connection?.destroy();
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.connection = undefined;
    this.voiceChannelId = undefined;
  }

  setRepeatMode(mode: string) {
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
    if (this.current) {
      this.current = await createAudio(this.current.metadata);
      this.play(this.current);
      await this.send(getFixture("music:NOW_PLAYING"), this.current.metadata);
      return true;
    }
    return false;
  }

  async queue(audio: AudioResource): Promise<number> {
    if (this.current) {
      this.queues.push(audio);
    } else {
      this.current = audio;
      this.play(audio);
    }

    return this.queues.length;
  }

  async next(forced: boolean = false): Promise<any | undefined> {
    const audio = this.queues.shift();
    this.forcedNext = forced;

    if (!audio) return;

    this.current = audio;
    this.play(audio);

    if (!this.forcedNext)
      await this.send(getFixture("music:NOW_PLAYING"), audio.metadata);

    return audio.metadata;
  }

  private async onPlay(): Promise<void> {
    if (this.timeout) {
      console.log("music_player:on_play:clear_timeout");
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  private async onIdle(): Promise<void> {
    if (this.current) {
      if (this.mode === "current") {
        await this.restart();
      } else {
        this.current = undefined;
        await this.next();
      }
    } else {
      console.log("music_player:on_idle:set_timeout");
      this.current = undefined;
      this.timeout = setTimeout(this.disconnect, this.idleTimer);
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
