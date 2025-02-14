import { promises as fs } from 'fs'

import { PLACEHOLDERS, NUMBER_OF, YOUTUBE_CHANNEL_IDS } from './constants.js'

const {
  // INSTAGRAM_API_KEY,
  // TWITCH_API_CLIENT_KEY,
  // TWITCH_API_SECRET_KEY,
  YOUTUBE_API_KEY
} = process.env

// const INSTAGRAM_USER_ID = '8242141302'

// const authProvider = new ClientCredentialsAuthProvider(TWITCH_API_CLIENT_KEY, TWITCH_API_SECRET_KEY)
// const apiClient = new ApiClient({ authProvider })

// const getLatestTwitchStream = async () => {
//   const response = await apiClient.kraken.channels.getChannel('midudev')
//   console.log(response)
// }

// const getPhotosFromInstagram = async () => {
//   const response = await fetch(`https://instagram130.p.rapidapi.com/account-medias?userid=${INSTAGRAM_USER_ID}&first=20`, {
//     headers: {
//       'x-rapidapi-host': 'instagram130.p.rapidapi.com',
//       'x-rapidapi-key': INSTAGRAM_API_KEY
//     }
//   })

//   const json = await response.json()

//   return json?.edges
// }

const getLatestYoutubeVideos = ({ channelId } = { channelId: YOUTUBE_CHANNEL_IDS.MIDUDEV }) =>
  fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${channelId}&maxResults=${NUMBER_OF.VIDEOS}&key=${YOUTUBE_API_KEY}`
  )
    .then((res) => res.json())
    .then((videos) => videos.items)

// const generateInstagramHTML = ({ node: { display_url: url, shortcode } }) => `
// <a href='https://instagram.com/p/${shortcode}' target='_blank'>
//   <img width='20%' src='${url}' alt='Instagram photo' />
// </a>`

const generateYoutubeHTML = ({ title, videoId }) => `
<a href='https://youtu.be/${videoId}' target='_blank'>
  <img width='30%' src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg' alt='${title}' />
</a>`;

(async () => {
  // await getLatestTwitchStream()

  const [template, videos, secondaryChannelVideos] = await Promise.all([
    fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' }),
    getLatestYoutubeVideos(),
    getLatestYoutubeVideos({ channelId: YOUTUBE_CHANNEL_IDS.MIDULIVE })
  ])

  // create latest youtube videos channel
  const latestYoutubeVideos = videos
    .map(({ snippet }) => {
      const { title, resourceId } = snippet
      const { videoId } = resourceId
      return generateYoutubeHTML({ videoId, title })
    })
    .join('')

  // create latest youtube videos secondary channel
  const latestYoutubeSecondaryChannelVideos = secondaryChannelVideos
    .map(({ snippet }) => {
      const { title, resourceId } = snippet
      const { videoId } = resourceId
      return generateYoutubeHTML({ videoId, title })
    })
    .join('')

  // replace all placeholders with info
  const newMarkdown = template
    .replace(PLACEHOLDERS.LATEST_YOUTUBE, latestYoutubeVideos)
    .replace(PLACEHOLDERS.LATEST_YOUTUBE_SECONDARY, latestYoutubeSecondaryChannelVideos)

  await fs.writeFile('README.md', newMarkdown)
})()
