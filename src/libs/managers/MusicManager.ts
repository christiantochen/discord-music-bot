import {
	AudioPlayerStatus,
	joinVoiceChannel,
	PlayerSubscription,
	VoiceConnection
} from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import BotClient from "../client";
import { getFixture } from "../fixtures";
import MusicPlayer, { LoopMode } from "../structures/MusicPlayer";
import createEmbed from "../utils/createEmbed";

export default class MusicManager {
	readonly client: BotClient;
	readonly guildId: string;
	channelId: string | undefined;
	voiceChannelId: string | undefined;
	idleTimer = 60000;

	private readonly player: MusicPlayer;
	private connection: VoiceConnection | undefined;
	private subscription: PlayerSubscription | undefined;
	private stopCalled = false;
	private timeout: NodeJS.Timeout | undefined;
	private readonly pageLimit = 5;

	constructor(client: BotClient, guildId: string) {
		this.client = client;
		this.guildId = guildId;

		this.player = new MusicPlayer();
		this.player.on(AudioPlayerStatus.Playing, () => this.onPlay());
		this.player.on(AudioPlayerStatus.Idle, () => this.onIdle());
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

		this.subscription = this.connection.subscribe(this.player);
		return this.setTimeout();
	}

	disconnect(): void {
		this.client.log.info();

		this.connection?.destroy();
		this.connection = undefined;
		this.voiceChannelId = undefined;
		this.subscription?.unsubscribe();
		this.subscription = undefined;
		this.stop(true);
	}

	async setLoop(mode: string): Promise<void> {
		this.client.log.info(mode);
		this.player.setLoop(mode as LoopMode);
		return this.save();
	}

	async prev(): Promise<any | undefined> {
		this.client.log.info();
		return this.player.prev();
	}

	async next(): Promise<any | undefined> {
		this.client.log.info();
		return this.player.next();
	}

	async skip(trackNo: number): Promise<any | undefined> {
		this.client.log.info(trackNo);
		return this.player.skip(trackNo);
	}

	async stop(force?: boolean | undefined): Promise<boolean> {
		this.client.log.info(force);
		this.stopCalled = true;
		return this.player.stop(force);
	}

	remove(
		trackAt: number,
		count?: number | null | undefined
	): boolean | undefined {
		this.client.log.info(trackAt, count);
		const removed = this.player.remove(trackAt, count);
		return removed?.length > 0;
	}

	async add(metadata: any): Promise<any | undefined> {
		this.client.log.info(metadata?.title);
		await this.player.add(metadata);
		await this.save();

		if (this.player.tracks.length === 1) return;
		return this.player.tracks.length;
	}

	getTracks(): any[] {
		this.client.log.info();
		const median = Math.floor(this.pageLimit / 2);
		const { tracks, trackAt } = this.player;
		let trackStart = 1;

		if (tracks.length > this.pageLimit && tracks.length - trackAt < median) {
			trackStart = trackAt - (this.pageLimit - (tracks.length - trackAt) - 1);
		} else if (tracks.length > this.pageLimit && trackAt > median) {
			trackStart = trackAt - median;
		}

		return this.player.tracks
			.slice(trackStart - 1, trackStart - 1 + this.pageLimit)
			.map((track, index) => {
				let message = getFixture("music:METADATA", track);

				if (trackStart - 1 + index === this.player.trackAt - 1)
					message = `*${message}*`;

				return `**${trackStart + index}.**\t${message}`;
			});
	}

	getInfo() {
		const { tracks, trackAt, loop, state } = this.player;
		return { tracks, trackAt, loop, state };
	}

	anyActiveTrackInRange(trackFrom: number, count?: number | null | undefined) {
		const trackTo = count && count > 1 ? trackFrom + count : undefined;

		return (
			trackFrom === this.player.trackAt ||
			(!!trackTo &&
				this.player.trackAt >= trackTo &&
				trackFrom <= this.player.trackAt)
		);
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
		this.client.log.info();
		if (!this.connection) return;
		if (this.stopCalled) return this.setTimeout();

		let metadata;

		if (this.player.loop === "current") metadata = await this.player.restart();
		else metadata = await this.player.next();

		if (metadata) {
			const channel = this.client.channels.cache.get(this.channelId!);

			if (channel instanceof TextChannel) {
				channel.send({
					embeds: [
						createEmbed().addField(
							`NOW PLAYING on TRACK #${this.player.trackAt}`,
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
		const { tracks, loop } = this.player;
		await this.client.settings?.update(this.guildId, {
			music: { tracks, loop }
		});
	}

	private async load() {
		this.client.log.info();
		const data = await this.client.settings.getOrCreate(this.guildId);

		this.player.load(data?.music?.tracks);
		this.player.setLoop(data?.music?.loop);
	}
}
