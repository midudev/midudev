import { promises as fs } from "fs"
import fetch from "node-fetch"
import Parser from "rss-parser"
import { ApiClient } from 'twitch'
import { ClientCredentialsAuthProvider } from 'twitch-auth';

import { PLACEHOLDERS, NUMBER_OF } from "./constants.js";

const {
  TWITCH_API_CLIENT_KEY,
  TWITCH_API_SECRET_KEY,
  YOUTUBE_API_KEY
} = process.env;

const INSTAGRAM_REGEXP = new RegExp(
  /<script type="text\/javascript">window\._sharedData = (.*);<\/script>/
);


const authProvider = new ClientCredentialsAuthProvider(TWITCH_API_CLIENT_KEY, TWITCH_API_SECRET_KEY);
const apiClient = new ApiClient({ authProvider })

const parser = new Parser();

const getLatestArticlesFromBlog = () =>
  parser.parseURL("https://midu.dev/index.xml").then((data) => data.items);

const getLatestTwitchStream = async () => {
  const response = await apiClient.kraken.channels.getChannel('midudev')
  console.log(response)
}

const getPhotosFromInstagram = async () => {
  const response = await fetch(`https://www.instagram.com/midu.dev/`);
  const text = await response.text();
  const json = JSON.parse(text.match(INSTAGRAM_REGEXP)[1]);
  const edges = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.splice(
    0,
    8
  );
  return edges.map(({ node }) => ({
    permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    media_url: node.thumbnail_src,
  }));
};

const getLatestYoutubeVideos = () =>
  fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UU8LeXCWOalN8SxlrPcG-PaQ&maxResults=${NUMBER_OF.VIDEOS}&key=${YOUTUBE_API_KEY}`
  )
    .then((res) => res.json())
    .then((videos) => videos.items);

const generateInstagramHTML = ({ media_url, permalink }) => `
<a href='${permalink}' target='_blank'>
  <img width='20%' src='${media_url}' alt='Instagram photo' />
</a>`;

const generateYoutubeHTML = ({ title, videoId }) => `
<a href='https://youtu.be/${videoId}' target='_blank'>
  <img width='30%' src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg' alt='${title}' />
</a>`;

(async () => {
  // await getLatestTwitchStream()

  const [template, articles, videos, photos] = await Promise.all([
    fs.readFile("./src/README.md.tpl", { encoding: "utf-8" }),
    getLatestArticlesFromBlog(),
    getLatestYoutubeVideos(),
    getPhotosFromInstagram(),
  ]);

  // create latest articles markdown
  const latestArticlesMarkdown = articles
    .slice(0, NUMBER_OF.ARTICLES)
    .map(({ title, link }) => `- [${title}](${link})`)
    .join("\n");

  // create latest youtube videos channel
  const latestYoutubeVideos = videos
    .map(({ snippet }) => {
      const { title, resourceId } = snippet;
      const { videoId } = resourceId;
      return generateYoutubeHTML({ videoId, title });
    })
    .join("");

  // create latest photos from instagram
  const latestInstagramPhotos = photos
    .slice(0, NUMBER_OF.PHOTOS)
    .map(generateInstagramHTML)
    .join("");

  // replace all placeholders with info
  const newMarkdown = template
    .replace(PLACEHOLDERS.LATEST_ARTICLES, latestArticlesMarkdown)
    .replace(PLACEHOLDERS.LATEST_YOUTUBE, latestYoutubeVideos)
    .replace(PLACEHOLDERS.LATEST_INSTAGRAM, latestInstagramPhotos);

  await fs.writeFile("README.md", newMarkdown);
})();
