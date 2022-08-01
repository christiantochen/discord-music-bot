import { AudioResource, createAudioResource } from "@discordjs/voice";
import * as play from "play-dl";

export const getAudioMetadata = async (
	query: string
): Promise<play.YouTubeVideo | undefined> => {
	const validate = await play.validate(query);

	if (validate === "search") {
		const videoResult = await play.search(query, {
			source: { youtube: "video" },
			limit: 1
		});

		if (videoResult.length === 0) return;

		return videoResult[0] as play.YouTubeVideo;
	}

	if (validate === "yt_video") {
		const { video_details } = await play.video_basic_info(query);
		return video_details;
	}

	return;
};

export const createAudio = async (
	metadata: play.YouTubeVideo | any
): Promise<AudioResource<any>> => {
	const { stream, type } = await play.stream(metadata.url, { quality: 0 });

	return createAudioResource(stream, { inputType: type, metadata });
};
