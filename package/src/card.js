import chalk from 'chalk'
import boxen from 'boxen'
import { fetchLatestYouTubeVideo, checkTwitchLive } from './data.js'
import { AVATAR_LINES } from './avatar.js'

const LINKS = [
  { label: 'Web', url: 'https://midu.dev', display: 'midu.dev' },
  { label: 'GitHub', url: 'https://github.com/midudev', display: 'github.com/midudev' },
  { label: 'YouTube', url: 'https://youtube.com/@midudev', display: 'youtube.com/@midudev' },
  { label: 'midulive', url: 'https://youtube.com/@midulive', display: 'youtube.com/@midulive' },
  { label: 'Twitch', url: 'https://twitch.tv/midudev', display: 'twitch.tv/midudev' },
  { label: 'X', url: 'https://x.com/midudev', display: 'x.com/midudev' },
  { label: 'Instagram', url: 'https://instagram.com/midu.dev', display: 'instagram.com/midu.dev' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/midudev', display: 'linkedin.com/in/midudev' },
  { label: 'Discord', url: 'https://discord.gg/midudev', display: 'discord.gg/midudev' }
]

function truncate (text, max) {
  return text.length > max ? text.substring(0, max - 3) + '...' : text
}

// OSC 8 hyperlink: text is clickable and opens url in supporting terminals
function link (text, url) {
  return '\x1b]8;;\x07'.replace('\x07', url + '\x07') + text + '\x1b]8;;\x07'
}

function stripAnsi (str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\]8;;.*?\x07/g, '')
}

function mergeAvatarWithInfo (avatarLines, infoLines) {
  const maxRows = Math.max(avatarLines.length, infoLines.length)
  const avatarVisualWidth = stripAnsi(avatarLines[0] || '').length
  const gap = '  '
  const merged = []

  for (let i = 0; i < maxRows; i++) {
    const avatarPart = i < avatarLines.length
      ? avatarLines[i]
      : ' '.repeat(avatarVisualWidth)
    const infoPart = i < infoLines.length ? infoLines[i] : ''
    merged.push(avatarPart + gap + infoPart)
  }
  return merged
}

export async function renderCard () {
  process.stdout.write(chalk.dim('\n  Cargando información de midudev...\r'))

  const [latestVideo, isLive] = await Promise.all([
    fetchLatestYouTubeVideo(),
    checkTwitchLive()
  ])

  process.stdout.write('\x1B[2K\r')

  // Info lines displayed next to the avatar
  const headerInfo = []
  headerInfo.push(
    chalk.bold.hex('#F0DB4F')('midudev') +
    chalk.dim('  /  ') +
    chalk.white.bold('Miguel Ángel Durán')
  )
  headerInfo.push('')
  headerInfo.push(chalk.white('Creador de contenido sobre programación'))
  headerInfo.push(chalk.white('e Inteligencia Artificial. Formador. Divulgador.'))

  if (isLive) {
    headerInfo.push('')
    headerInfo.push(
      chalk.bgRed.white.bold(' EN DIRECTO ') +
      chalk.red.bold(' ¡Ahora mismo en Twitch!')
    )
    headerInfo.push(link(chalk.dim('→ twitch.tv/midudev'), 'https://twitch.tv/midudev'))
  }

  if (latestVideo) {
    headerInfo.push('')
    headerInfo.push(chalk.hex('#FF0000')('▶ ') + chalk.bold('Último vídeo de YouTube:'))
    headerInfo.push(link(chalk.white(truncate(latestVideo.title, 42)), latestVideo.url))
  }

  // Merge avatar + info side by side
  const header = mergeAvatarWithInfo(AVATAR_LINES, headerInfo)

  const lines = [...header]

  // Social links
  lines.push('')

  const maxLabelLen = Math.max(...LINKS.map(l => l.label.length))
  for (const { label, url, display } of LINKS) {
    const paddedLabel = label.padStart(maxLabelLen)
    lines.push(
      chalk.hex('#F0DB4F').bold('  ' + paddedLabel) +
      chalk.dim(':  ') +
      link(chalk.cyan(display), url)
    )
  }

  // Footer
  lines.push('')
  lines.push(
    chalk.dim('  Ejecuta ') +
    chalk.hex('#F0DB4F').bold('npx midudev') +
    chalk.dim(' en cualquier momento')
  )

  const card = boxen(lines.join('\n'), {
    padding: { top: 1, right: 3, bottom: 1, left: 1 },
    borderColor: '#F0DB4F',
    borderStyle: 'round',
    title: '\ud83d\udc4b \u00a1Hola!',
    titleAlignment: 'center'
  })

  console.log('\n' + card + '\n')
}
