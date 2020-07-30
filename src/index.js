import {promises as fs} from 'fs'
import fetch from 'node-fetch'
import Parser from 'rss-parser'

import {PLACEHOLDERS, NUMBER_OF, USER_AGENT} from './constants.js'

const parser = new Parser()

const {INSTAGRAM_ID, INSTAGRAM_TOKEN, YOUTUBE_API_KEY} = process.env

const getLatestArticlesFromBlog = () =>
  parser.parseURL('https://midu.dev/index.xml').then(data => data.items)

const getPhotosFromInstagram = () =>
  fetch(`https://graph.facebook.com/v7.0/${INSTAGRAM_ID}/media?fields=id%2Cig_id%2Cmedia_type%2Cthumbnail_url%2Cmedia_url%2Cpermalink&access_token=${INSTAGRAM_TOKEN}`)
    .then(res => res.json())
    .then(({data}) => data)

const getLatestYoutubeVideos = () =>
  fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UU8LeXCWOalN8SxlrPcG-PaQ&maxResults=${NUMBER_OF.VIDEOS}&key=${YOUTUBE_API_KEY}`)
    .then(res => res.json())
    .then(videos => videos.items)

const generateInstagramHTML = ({media_url, permalink}) => `
<a href='${permalink}' target='_blank'>
  <img width='20%' src='${media_url}' alt='Instagram photo' />
</a>`

const generateYoutubeHTML = ({title, videoId}) => `
<a href='https://youtu.be/${videoId}' target='_blank'>
  <img width='30%' src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg' alt='${title}' />
</a>`


;(async () => {
  const [template, articles, videos, photos] = await Promise.all([
    fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' }),
    getLatestArticlesFromBlog(),
    getLatestYoutubeVideos(),
    getPhotosFromInstagram()
  ])

  // create latest articles markdown
  const latestArticlesMarkdown = articles.slice(0, NUMBER_OF.ARTICLES)
    .map(({title, link}) => `- [${title}](${link})`)
    .join('\n')

  // create latest youtube videos channel
  const latestYoutubeVideos = videos
    .map(({snippet}) => {
      const {title, resourceId} = snippet
      const {videoId} = resourceId
      return generateYoutubeHTML({videoId, title})
    })
    .join('')

  // create latest photos from instagram
  const latestInstagramPhotos = photos
    .slice(0, NUMBER_OF.PHOTOS)
    .map(generateInstagramHTML)
    .join('')

  // replace all placeholders with info
  const newMarkdown = template
    .replace(PLACEHOLDERS.LATEST_ARTICLES, latestArticlesMarkdown)
    .replace(PLACEHOLDERS.LATEST_YOUTUBE, latestYoutubeVideos)
    .replace(PLACEHOLDERS.LATEST_INSTAGRAM, latestInstagramPhotos)

  await fs.writeFile('README.md', newMarkdown)
})()