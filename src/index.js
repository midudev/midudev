import {promises as fs} from 'fs'
import fetch from 'node-fetch'
import Parser from 'rss-parser'

import {PLACEHOLDERS, NUMBER_OF, USER_AGENT} from './constants.js'

const parser = new Parser()

const {YOUTUBE_API_KEY} = process.env

const getLatestArticlesFromBlog = () =>
  parser.parseURL('https://midu.dev/index.xml').then(data => data.items)

const getPhotosFromInstagram = () =>
  fetch('https://instagram.com/midu.dev?__a=1', { headers: { userAgent: USER_AGENT }})
    .then(res => res.json())
    .then(({graphql}) => {
      const { user } = graphql
      const {edge_owner_to_timeline_media: {edges}} = user
      return edges
    })

const getLatestYoutubeVideos = () =>
  fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UU8LeXCWOalN8SxlrPcG-PaQ&maxResults=${NUMBER_OF.VIDEOS}&key=${YOUTUBE_API_KEY}`)
    .then(res => res.json())
    .then(videos => videos.items)

const generateInstagramHTML = ({shortcode, thumbnail_src}) => `
<a href='https://www.instagram.com/p/${shortcode}/' target='_blank'>
  <img width='20%' src='${thumbnail_src}' alt='Instagram photo' />
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
    .map(({node}) => generateInstagramHTML(node))
    .join('')

  // replace all placeholders with info
  const newMarkdown = template
    .replace(PLACEHOLDERS.LATEST_ARTICLES, latestArticlesMarkdown)
    .replace(PLACEHOLDERS.LATEST_YOUTUBE, latestYoutubeVideos)
    .replace(PLACEHOLDERS.LATEST_INSTAGRAM, latestInstagramPhotos)

  await fs.writeFile('README.md', newMarkdown)
})()