import { promises as fs } from 'node:fs'

import { PLACEHOLDERS, NUMBER_OF, YOUTUBE_CHANNEL_IDS } from './constants.js'

const FETCH_TIMEOUT_MS = 10_000

const { YOUTUBE_API_KEY } = process.env

if (!YOUTUBE_API_KEY) {
  console.error('❌ Missing YOUTUBE_API_KEY environment variable')
  process.exit(1)
}

async function getLatestYoutubeVideos (channelId = YOUTUBE_CHANNEL_IDS.MIDUDEV) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${channelId}&maxResults=${NUMBER_OF.VIDEOS}&key=${YOUTUBE_API_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${res.statusText}`)
  }

  const { items } = await res.json()
  return items
}

function generateYoutubeHTML ({ title, videoId }) {
  const safeTitle = title.replace(/'/g, '&#39;').replace(/\n/g, ' ')
  return `
<a href='https://youtu.be/${videoId}' target='_blank'>
  <img width='30%' src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg' alt='${safeTitle}' />
</a>`
}

function videosToHTML (videos) {
  return videos
    .map(({ snippet }) => generateYoutubeHTML({
      title: snippet.title,
      videoId: snippet.resourceId.videoId
    }))
    .join('')
}

async function main () {
  console.log('⏳ Fetching latest YouTube videos…')

  const [template, videos, secondaryVideos] = await Promise.all([
    fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' }),
    getLatestYoutubeVideos(),
    getLatestYoutubeVideos(YOUTUBE_CHANNEL_IDS.MIDULIVE)
  ])

  console.log(`✅ Fetched ${videos.length} + ${secondaryVideos.length} videos`)

  const newMarkdown = template
    .replace(PLACEHOLDERS.LATEST_YOUTUBE, videosToHTML(videos))
    .replace(PLACEHOLDERS.LATEST_YOUTUBE_SECONDARY, videosToHTML(secondaryVideos))

  await fs.writeFile('README.md', newMarkdown)
  console.log('✅ README.md updated successfully')
}

main().catch((error) => {
  console.error('❌ Failed to update README:', error.message)
  process.exit(1)
})
