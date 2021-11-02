import { AudioResource, createAudioResource } from "@discordjs/voice";
import * as play from "play-dl";
import { YouTubeVideo } from "play-dl/dist/YouTube/classes/Video";

export const getYoutubeVideo = async (
  query: string
): Promise<YouTubeVideo | undefined> => {
  const videoResult = await play.search(query, { limit: 1 });

  if (!videoResult.length) return undefined;

  return videoResult[0] as YouTubeVideo;
};

export const createAudio = async (video: any): Promise<AudioResource> => {
  const { stream, type } = await play.stream(video.url, { quality: 0 });

  return createAudioResource(stream, {
    inputType: type,
    metadata: video,
  });
};
