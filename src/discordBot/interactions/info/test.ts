import { CommandInteraction } from "discord.js";
import Interaction from "../../libs/structures/Interaction";
import createEmbed from "../../utils/createEmbed";

// YouTubeVideo {
//     id: '8dgEh5crj0I',
//     url: 'https://www.youtube.com/watch?v=8dgEh5crj0I',
//     type: 'video',
//     title: 'MAHALINI - KISAH SEMPURNA (OFFICIAL MUSIC VIDEO)',
//     description: 'Siapa tak mengenal kenal Mahalini Raharja, penyanyi wanita jebolan Indonesian Idol X yang sukses membuat hits single single ...',
//     durationRaw: '5:14',
//     durationInSec: 314,
//     uploadedAt: '3 months ago',
//     liveAt: undefined,
//     upcoming: undefined,
//     views: 32848400,
//     thumbnails: [
//       YouTubeThumbnail {
//         url: 'https://i.ytimg.com/vi/8dgEh5crj0I/hq720.jpg?sqp=-oaymwEcCOgCEMoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCCJt6OhVeoOP7Xq9vLtlm_G_lXiw',
//         width: 360,
//         height: 202
//       },
//       YouTubeThumbnail {
//         url: 'https://i.ytimg.com/vi/8dgEh5crj0I/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBdEY2wtrDzruZW47EmAbVfWz1OIQ',
//         width: 720,
//         height: 404
//       }
//     ],
//     channel: YouTubeChannel {
//       type: 'channel',
//       name: 'HITS Records',
//       verified: true,
//       artist: false,
//       id: 'UCYJo04cZFlwL3XNnJ8aYtTw',
//       url: 'https://www.youtube.com/c/indohitsrecords',
//       icons: [ [Object] ],
//       subscribers: null
//     },
//     likes: 0,
//     live: false,
//     private: false,
//     tags: [],
//     discretionAdvised: undefined,
//     music: [],
//     chapters: []
//   }

export default class Ping extends Interaction {
	name = "test";

	async execute(interaction: CommandInteraction) {
		const message = createEmbed({
			color: 0x0099ff,
			author: {
				name: "HITS Records",
				icon_url:
					"https://yt3.ggpht.com/kbUEY0C4UkVQdvk4maIC_E6UM2R55Sb9TpywHQGMe89IqPHqhbg2V-pjSCSJZXbHtc7jr9FHaA=s68-c-k-c0x00ffffff-no-rj",
				url: "https://www.youtube.com/c/indohitsrecords"
			},
			thumbnail: {
				url: "https://i.ytimg.com/vi/8dgEh5crj0I/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBdEY2wtrDzruZW47EmAbVfWz1OIQ"
			},
			fields: [
				{
					name: "Currently Playing",
					value: "MAHALINI - KISAH SEMPURNA (OFFICIAL MUSIC VIDEO) - (5:14)"
				}
			],
			footer: {
				text: "3 months ago"
			}
		});

		return interaction.editReply({
			embeds: [message]
		});
	}
}
