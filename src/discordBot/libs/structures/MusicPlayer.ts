import {
	AudioPlayer,
	AudioPlayerStatus,
	joinVoiceChannel,
	NoSubscriberBehavior,
	VoiceConnection
} from "@discordjs/voice";
import { Message, TextChannel, VoiceChannel } from "discord.js";
import type DiscordClient from "../../client";
import createEmbed from "../../utils/createEmbed";
import parseMetadata from "../../utils/parseMetadata";
import { createAudio } from "../../utils/play-dl";

export type LoopMode = "off" | "current" | "all";

export default class MusicPlayer extends AudioPlayer {
	readonly client: DiscordClient;
	readonly guildId: string;
	channelId: string | undefined;
	voiceChannelId: string | undefined;
	loop: LoopMode = "off";
	tracks: any[] = [];
	trackAt = 0;
	idleTimer = 60000;

	private connection: VoiceConnection | undefined;
	private stopCalled = false;
	private timeout: NodeJS.Timeout | undefined;
	private lastMessage: Message | undefined;

	constructor(client: DiscordClient, guildId: string) {
		super({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
		this.client = client;
		this.guildId = guildId;
		this.on(AudioPlayerStatus.Playing, () => this.onPlay());
		this.on(AudioPlayerStatus.Idle, () => this.onIdle());
	}

	async connect(voiceChannel: VoiceChannel, memberChannel: TextChannel) {
		if (this.voiceChannelId && this.voiceChannelId === voiceChannel.id) return;

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
		this.connection?.destroy();
		this.connection = undefined;
		this.voiceChannelId = undefined;
	}

	async setLoop(mode: string): Promise<void> {
		this.loop = (mode as LoopMode) || "off";
		return this.save();
	}

	override async play(metadata: any): Promise<any> {
		super.play(await createAudio(metadata));

		this.trackAt =
			this.tracks.findIndex((track) => track.id === metadata.id) + 1;

		if (this.trackAt === 0) {
			this.tracks.push(metadata);
			this.trackAt = this.tracks.length;
		}

		return metadata;
	}

	async prev(): Promise<any | undefined> {
		if (this.trackAt <= 1) return;
		this.trackAt--;
		return this.play(this.tracks[this.trackAt - 1]);
	}

	async next(): Promise<any | undefined> {
		if (this.trackAt < this.tracks.length) this.trackAt++;
		else if (this.loop === "all") this.trackAt = 1;
		else if (this.loop === "off") return;
		return this.play(this.tracks[this.trackAt - 1]);
	}

	async skip(trackNo: number): Promise<any | undefined> {
		if (trackNo < 1) return;
		if (trackNo > this.tracks.length) return;
		if (
			trackNo === this.trackAt &&
			this.state.status === AudioPlayerStatus.Playing
		)
			return;

		this.trackAt = trackNo;
		return this.play(this.tracks[this.trackAt - 1]);
	}

	override stop(force?: boolean | undefined): boolean {
		this.stopCalled = true;
		return super.stop(force);
	}

	remove(targetTrack: number, count: number | null): boolean | undefined {
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

	async add(metadata: any): Promise<void> {
		this.tracks.push(metadata);
		this.save();
	}

	setTimeout() {
		if (!this.timeout) {
			this.stopCalled = false;
			this.timeout = setTimeout(() => this.disconnect(), this.idleTimer);
		}
	}

	clearTimeout() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}

	private onPlay() {
		this.clearTimeout();
	}

	private async onIdle(): Promise<void> {
		console.log("noConnection", !this.connection);
		if (!this.connection) return;
		console.log("stopCalled", this.stopCalled);
		if (this.stopCalled) return this.setTimeout();

		let metadata;

		console.log("checkLoop", this.loop);
		if (this.loop === "current") {
			metadata = await this.play(this.tracks[this.trackAt - 1]);
			console.log("restart", metadata?.title);
		} else {
			metadata = await this.next();
			console.log("next", metadata?.title);
		}

		if (metadata) {
			const channel = this.client.channels.cache.get(this.channelId!);

			if (channel instanceof TextChannel) {
				const message = createEmbed().addFields([
					{
						name: `NOW PLAYING TRACK #${this.trackAt}`,
						value: parseMetadata(metadata)
					}
				]);

				if (
					!this.lastMessage ||
					channel.lastMessage?.id !== this.lastMessage.id
				) {
					this.lastMessage = await channel.send({ embeds: [message] });
				} else {
					this.lastMessage = await this.lastMessage.edit({ embeds: [message] });
				}
			}

			return;
		}

		return this.setTimeout();
	}

	private async save() {
		await this.client.settings?.update(this.guildId, {
			music: { tracks: this.tracks, loop: this.loop }
		});
	}

	private async load() {
		const data = await this.client.settings.getOrCreate(this.guildId);

		if (data && data.music) {
			this.tracks = data.music.tracks || this.tracks;
			this.setLoop(data.music.loop);
		}
	}
}
