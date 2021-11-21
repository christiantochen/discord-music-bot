import { LoopMode } from "../structures/MusicPlayer";

export interface GuildSettings {
	_id: string;
	language: string;
	prefix: string;
	music?: {
		loop: LoopMode;
		tracks: any[];
	};
}
