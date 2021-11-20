import { RepeatMode } from "../structures/MusicPlayer";

export interface GuildSettings {
  _id: string;
  language: string;
  prefix: string;
  music?: {
    mode: RepeatMode;
    tracks: any[];
  };
}
