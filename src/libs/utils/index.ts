import { AudioResource, createAudioResource } from "@discordjs/voice";
import * as play from "play-dl";
import { YouTubeVideo } from "play-dl/dist/YouTube/classes/Video";

export const getAudio = async (
  query: string
): Promise<AudioResource<any> | undefined> => {
  const videoResult = await play.search(query, { limit: 1 });
  if (!videoResult.length) return;

  const video = videoResult[0] as YouTubeVideo;
  return createAudio(video);
};

export const createAudio = async (
  video: YouTubeVideo | any
): Promise<AudioResource<any>> => {
  const { stream, type } = await play.stream(video.url, { quality: 0 });

  return createAudioResource(stream, {
    inputType: type,
    metadata: video,
  });
};
