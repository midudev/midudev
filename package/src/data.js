const YOUTUBE_CHANNEL_ID = 'UC8LeXCWOalN8SxlrPcG-PaQ'
const TWITCH_USERNAME = 'midudev'
const TIMEOUT_MS = 5000

function decodeHTMLEntities (text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

export async function fetchLatestYouTubeVideo () {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    )
    const xml = await res.text()

    const titleMatch = xml.match(/<entry>[\s\S]*?<title>(.*?)<\/title>/)
    const linkMatch = xml.match(/<entry>[\s\S]*?<link rel="alternate" href="(.*?)"/)

    if (titleMatch && linkMatch) {
      return {
        title: decodeHTMLEntities(titleMatch[1]),
        url: linkMatch[1]
      }
    }
    return null
  } catch {
    return null
  }
}

export async function checkTwitchLive () {
  try {
    const res = await fetch(
      `https://decapi.me/twitch/uptime/${TWITCH_USERNAME}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    )
    const text = await res.text()
    return !text.toLowerCase().includes('offline')
  } catch {
    return false
  }
}
