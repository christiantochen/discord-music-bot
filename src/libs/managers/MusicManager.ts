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
		this.player.stop(true);
		this.connection?.destroy();
		this.connection = undefined;
		this.voiceChannelId = undefined;
		this.subscription?.unsubscribe();
		this.subscription = undefined;
	}

	async setLoopMode(mode: string): Promise<void> {
		this.client.log.info(mode);
		await this.player.setLoop(mode as LoopMode);
		await this.save();
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

	stop(force?: boolean | undefined): boolean {
		this.client.log.info(force);
		this.stopCalled = true;
		return this.player.stop(force);
	}

	async remove(
		trackAt: number,
		count?: number | null | undefined
	): Promise<boolean | undefined> {
		this.client.log.info(trackAt, count);
		const removed = await this.player.remove(trackAt, count);
		return removed?.length > 0;
	}

	async add(metadata: any): Promise<any | undefined> {
		this.client.log.info(metadata?.title);
		await this.player.add(metadata);
		await this.save();

		if (this.player.tracks.length === 1) return;
		return this.player.tracks.length;
	}

	async show(): Promise<any[]> {
		this.client.log.info();
		const median = Math.floor(this.pageLimit / 2);
		const { tracks, trackAt } = this.player;
		let trackStart = 1;

		if (tracks.length > this.pageLimit && tracks.length - trackAt < median) {
			trackStart = trackAt - (this.pageLimit - (tracks.length - trackAt) - 1);
		} else if (trackAt > median) {
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
		const { tracks, trackAt, loop } = this.player;
		return { tracks, trackAt, loop };
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

	private onPlay() {
		this.client.log.info();
		if (this.timeout) {
			this.client.log.info("clearTimeout");
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}

	private async onIdle(): Promise<void> {
		this.client.log.info();
		if (!this.connection) return;
		if (this.stopCalled) return this.setTimeout();

		let metadata;

		if (this.player.loop === "current") metadata = await this.player.restart();
		else metadata = await this.player.next();

		if (metadata) return this.send(getFixture("music:NOW_PLAYING"), metadata);

		return this.setTimeout();
	}

	private async setTimeout() {
		this.client.log.info("setTimeout", this.idleTimer);
		this.stopCalled = false;
		this.timeout = setTimeout(() => this.disconnect, this.idleTimer);
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

	private async send(title: string, metadata: any): Promise<void> {
		this.client.log.info();
		const channel = this.client.channels.cache.get(
			this.channelId!
		) as TextChannel;

		await channel.send({
			embeds: [
				createEmbed().addField(title, getFixture("music:METADATA", metadata))
			]
		});
	}
}
