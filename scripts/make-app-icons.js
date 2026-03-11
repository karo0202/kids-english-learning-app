/*
  Make App Icons from existing logo
  - Input: app/public/logo.png (or pass a path)
  - Output: app/public/icons/icon-<size>.png (1024,512,256,192,128,64), public/favicon.png

  Approach:
  - Load image, convert to sRGB, trim outer background
  - Scale to COVER 1024x1024 (fill entire icon, no white/padding edges), crop center
  - Export all sizes + favicon
*/

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public')

async function main() {
  const srcArg = process.argv[2]
  // Try multiple possible logo file names
  const possibleLogos = [
    srcArg ? path.resolve(srcArg) : null,
    path.join(PUBLIC_DIR, 'logo.png'),
    path.join(PUBLIC_DIR, 'logo.jpg'),
    path.join(PUBLIC_DIR, 'icons', 'logo.jpg'),
  ].filter(Boolean)
  
  let srcPath = null
  for (const possiblePath of possibleLogos) {
    if (fs.existsSync(possiblePath)) {
      srcPath = possiblePath
      break
    }
  }
  
  const outDir = path.join(PUBLIC_DIR, 'icons')
  const sizes = [1024, 512, 256, 192, 128, 64]

  if (!srcPath) {
    console.error(`Source image not found. Tried:`)
    possibleLogos.forEach(p => console.error(`  - ${p}`))
    console.error(`\nPlease place your logo image as one of:`)
    console.error(`  - app/public/logo.png`)
    console.error(`  - app/public/logo.jpg`)
    console.error(`  - app/public/icons/logo.jpg`)
    console.error(`\nOr pass the path as an argument: node scripts/make-app-icons.js <path-to-your-icon>`)
    process.exit(1)
  }
  
  console.log(`Using source image: ${srcPath}`)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Load and trim edges automatically
  const trimmedPng = await sharp(srcPath)
    .toColourspace('srgb')
    .ensureAlpha()
    .trim({ threshold: 32 })
    .png()
    .toBuffer()

  // Measure trimmed image
  const meta = await sharp(trimmedPng).metadata()
  const cropW = meta.width
  const cropH = meta.height

  // Fill entire icon (no padding): scale to cover 1024x1024, then crop center
  const baseSize = 1024
  const scale = Math.max(baseSize / cropW, baseSize / cropH)
  const resizedW = Math.round(cropW * scale)
  const resizedH = Math.round(cropH * scale)
  const left = Math.max(0, Math.round((resizedW - baseSize) / 2))
  const top = Math.max(0, Math.round((resizedH - baseSize) / 2))

  const centered1024 = await sharp(trimmedPng)
    .resize(resizedW, resizedH, { kernel: 'lanczos3' })
    .extract({ left, top, width: baseSize, height: baseSize })
    .png({ compressionLevel: 9 })
    .toBuffer()

  // Save master and downscaled sizes
  await sharp(centered1024).toFile(path.join(outDir, 'icon-1024.png'))
  for (const size of sizes.filter(s => s !== 1024)) {
    await sharp(centered1024).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(path.join(outDir, `icon-${size}.png`))
  }

  // Favicon (32x32) so browser tab icon also has no white edges
  await sharp(centered1024).resize(32, 32, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_DIR, 'favicon.png'))

  console.log('Icons created in', outDir, '(favicon.png updated)')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
