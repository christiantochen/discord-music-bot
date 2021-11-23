import {
	AudioPlayer,
	AudioPlayerStatus,
	joinVoiceChannel,
	NoSubscriberBehavior,
	VoiceConnection
} from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import BotClient from "../client";
import { getFixture } from "../fixtures";
import createEmbed from "../utils/createEmbed";
import { createAudio } from "../utils/play-dl";

export type LoopMode = "off" | "current" | "all";

export default class MusicPlayer extends AudioPlayer {
	readonly client: BotClient;
	readonly guildId: string;
	channelId: string | undefined;
	voiceChannelId: string | undefined;
	loop: LoopMode = "off";
	tracks: any[] = [];
	trackAt = 0;
	idleTimer = 60000;

	// private readonly player: MusicPlayer;
	private connection: VoiceConnection | undefined;
	private stopCalled = false;
	private timeout: NodeJS.Timeout | undefined;
	private readonly pageLimit = 5;

	constructor(client: BotClient, guildId: string) {
		super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
		this.client = client;
		this.guildId = guildId;
		this.on(AudioPlayerStatus.Playing, () => this.onPlay());
		this.on(AudioPlayerStatus.Idle, () => this.onIdle());
	}

	async connect(voiceChannel: VoiceChannel, memberChannel: TextChannel) {
		if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id) return;
		this.client.log.info();
		await this.load();

		this.channelId = memberChannel.id;
		this.voiceChannelId = voiceChannel.id;
		this.connection = joinVoiceChannel({
			guildId: this.guildId,
			channelId: this.voiceChannelId,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator
		});
		this.connection.subscribe(this);

		return this.setTimeout();
	}

	disconnect(): void {
		this.client.log.info();
		this.connection?.destroy();
		this.connection = undefined;
		this.voiceChannelId = undefined;
	}

	async setLoop(mode: string): Promise<void> {
		this.client.log.info(mode);
		this.loop = (mode as LoopMode) || "off";
		return this.save();
	}

	async play(metadata: any): Promise<any> {
		super.play(await createAudio(metadata));
		return metadata;
	}

	async prev(): Promise<any | undefined> {
		this.client.log.info();
		if (this.trackAt <= 1) return;
		this.trackAt--;
		return this.play(this.tracks[this.trackAt - 1]);
	}

	async next(): Promise<any | undefined> {
		this.client.log.info();

		if (this.trackAt < this.tracks.length) this.trackAt++;
		else if (this.loop === "all") this.trackAt = 1;
		else if (this.loop === "off") return;
		return this.play(this.tracks[this.trackAt - 1]);
	}

	async skip(trackNo: number): Promise<any | undefined> {
		this.client.log.info(trackNo);
		if (trackNo < 1) return;
		if (trackNo > this.tracks.length) return;
		this.trackAt = trackNo;
		return this.play(this.tracks[this.trackAt - 1]);
	}

	stop(force?: boolean | undefined): boolean {
		this.client.log.info(force);
		this.stopCalled = true;
		return super.stop(force);
	}

	remove(targetTrack: number, count: number | null): boolean | undefined {
		this.client.log.info(targetTrack, count);
		if (!count) count = 1;
		if (targetTrack < 0) return;
		if (count && count < 1) return;
		if (targetTrack + count - 1 > this.tracks.length) return;

		// get current playing track
		// ignore if there's no track playing
		let track: any;
		if (this.trackAt != 0) {
			track = this.tracks[this.trackAt - 1];
		}

		// remove tracks
		const removedTrack = this.tracks.splice(targetTrack - 1, count);

		// update current track position
		// ignore if there's no track playing
		if (track) {
			this.trackAt = this.tracks.findIndex((v) => v.id === track.id) + 1;
		}

		return removedTrack?.length > 0;
	}

	async add(metadata: any): Promise<any | undefined> {
		this.client.log.info(metadata?.title);
		this.tracks.push(metadata);
		await this.save();

		// if first time or player currently not playing anything
		// then immediately play the newly added track
		if (
			this.tracks.length === 1 ||
			this.state.status === AudioPlayerStatus.Idle
		) {
			this.trackAt = this.tracks.length;
			await this.play(metadata);
		}

		return this.tracks.length;
	}

	setTimeout() {
		if (!this.timeout) {
			this.client.log.info("setTimeout", this.idleTimer);
			this.stopCalled = false;
			this.timeout = setTimeout(() => this.disconnect(), this.idleTimer);
		}
	}

	clearTimeout() {
		if (this.timeout) {
			this.client.log.info("clearTimeout");
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}

	private onPlay() {
		this.client.log.info();
		this.clearTimeout();
	}

	private async onIdle(): Promise<void> {
		this.client.log.info("noConnection", !this.connection);
		if (!this.connection) return;
		this.client.log.info("stopCalled", this.stopCalled);
		if (this.stopCalled) return this.setTimeout();

		let metadata;

		this.client.log.info("checkLoop", this.loop);
		if (this.loop === "current") {
			metadata = await this.play(this.tracks[this.trackAt - 1]);
			this.client.log.info("restart", metadata?.title);
		} else {
			metadata = await this.next();
			this.client.log.info("next", metadata?.title);
		}

		if (metadata) {
			const channel = this.client.channels.cache.get(this.channelId!);

			if (channel instanceof TextChannel) {
				channel.send({
					embeds: [
						createEmbed().addField(
							`NOW PLAYING TRACK #${this.trackAt}`,
							getFixture("music:METADATA", metadata)
						)
					]
				});
			}

			return;
		}

		return this.setTimeout();
	}

	private async save() {
		this.client.log.info();

		await this.client.settings?.update(this.guildId, {
			music: { tracks: this.tracks, loop: this.loop }
		});
	}

	private async load() {
		this.client.log.info();
		const data = await this.client.settings.getOrCreate(this.guildId);

		if (data && data.music) {
			this.tracks = data.music.tracks || this.tracks;
			this.setLoop(data.music.loop);
		}
	}
}
