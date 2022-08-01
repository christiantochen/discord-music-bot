const parseMetadata = (track: any) =>
	`[${track.title}](${track.url}) by [${track.channel.name}](${track.channel.url}) [${track.durationRaw}]`;

export default parseMetadata;
