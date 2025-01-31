<<<<<<< HEAD
=======


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
    getLatestYoutubeVideos({ channelId: YOUTUBE_MIDULIVE_CHANNEL_ID })
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
>>>>>>> 3f1ee93cec958e3c2dbd790ce03049b59ed749f4
