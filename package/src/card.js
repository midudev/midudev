import chalk from 'chalk'
import boxen from 'boxen'
import { fetchLatestYouTubeVideo, checkTwitchLive } from './data.js'

const LINKS = [
  { label: 'Web', url: 'https://midu.dev' },
  { label: 'GitHub', url: 'https://github.com/midudev' },
  { label: 'YouTube', url: 'https://youtube.com/@midudev' },
  { label: 'midulive', url: 'https://youtube.com/@midulive' },
  { label: 'Twitch', url: 'https://twitch.tv/midudev' },
  { label: 'X', url: 'https://x.com/midudev' },
  { label: 'Instagram', url: 'https://instagram.com/midu.dev' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/midudev' },
  { label: 'Discord', url: 'https://discord.gg/midudev' }
]

function truncate (text, max) {
  return text.length > max ? text.substring(0, max - 3) + '...' : text
}

export async function renderCard () {
  process.stdout.write(chalk.dim('\n  Cargando información de midudev...\r'))

  const [latestVideo, isLive] = await Promise.all([
    fetchLatestYouTubeVideo(),
    checkTwitchLive()
  ])

  // Clear the loading line
  process.stdout.write('\x1B[2K\r')

  const lines = []

  // Header
  lines.push(
    chalk.bold.hex('#F0DB4F')('  midudev') +
    chalk.dim('  /  ') +
    chalk.white.bold('Miguel Ángel Durán')
  )
  lines.push('')
  lines.push(chalk.white('  Creador de contenido sobre programación'))
  lines.push(chalk.white('  y desarrollo web. Formador. Divulgador.'))

  // Twitch live status
  if (isLive) {
    lines.push('')
    lines.push(
      chalk.bgRed.white.bold(' EN DIRECTO ') +
      chalk.red.bold(' ¡Ahora mismo en Twitch!')
    )
    lines.push(chalk.dim('  → https://twitch.tv/midudev'))
  }

  // Latest YouTube video
  if (latestVideo) {
    lines.push('')
    lines.push(chalk.hex('#FF0000')('  ▶ ') + chalk.bold('Último vídeo de YouTube:'))
    lines.push(chalk.white(`    ${truncate(latestVideo.title, 48)}`))
    lines.push(chalk.dim(`    ${latestVideo.url}`))
  }

  // Social links
  lines.push('')

  const maxLabelLen = Math.max(...LINKS.map(l => l.label.length))
  for (const { label, url } of LINKS) {
    const paddedLabel = label.padStart(maxLabelLen)
    lines.push(
      chalk.hex('#F0DB4F').bold(`  ${paddedLabel}`) +
      chalk.dim(':  ') +
      chalk.cyan(url)
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
    title: '👋 ¡Hola!',
    titleAlignment: 'center'
  })

  console.log('\n' + card + '\n')
}
