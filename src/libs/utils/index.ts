import { AudioResource, createAudioResource } from "@discordjs/voice";
import * as play from "play-dl";
import { YouTubeVideo } from "play-dl/dist/YouTube/classes/Video";

export const getAudio = async (
  query: string
): Promise<AudioResource<any> | undefined> => {
  const validate = await play.validate(query);

  if (validate === "search") {
    const videoResult = await play.search(query, {
      source: { youtube: "video" },
      limit: 1,
    });
    if (!videoResult.length) return;

    const video = videoResult[0] as YouTubeVideo;
    return createAudio(video);
  }

  if (validate === "yt_video") {
    const { video_details } = await play.video_basic_info(query);
    return createAudio(video_details);
  }
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
