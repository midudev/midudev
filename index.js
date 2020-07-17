const fs = require('fs').promises
const Parser = require('rss-parser')
const parser = new Parser()

const LATEST_ARTICLE_PLACEHOLDER = /%{{latest_article}}%/g
const ICONS_SIZE_PLACEHOLDER = /%{{icon_size}}%/g

const ICONS_SIZE = '24px'

;(async () => {
  const markdownTemplate = await fs.readFile('./README.md.tpl', { encoding: 'utf-8' })
  const {items} = await parser.parseURL('https://midu.dev/index.xml')
  // put the latest article
  const [{title, link}] = items
  const latestArticleMarkdown = `[${title}](${link})`

  // replace all placeholders with info
  const newMarkdown = markdownTemplate
    .replace(LATEST_ARTICLE_PLACEHOLDER, latestArticleMarkdown)
    .replace(ICONS_SIZE_PLACEHOLDER, ICONS_SIZE) // put the icon size to all icons
  
  await fs.writeFile('./README.md', newMarkdown)
})()