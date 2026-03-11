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

  let centered1024 = await sharp(trimmedPng)
    .resize(resizedW, resizedH, { kernel: 'lanczos3' })
    .extract({ left, top, width: baseSize, height: baseSize })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Replace white/light ring with dominant (gold) color so icon fills like other apps
  const { data, info } = centered1024
  centered1024 = null
  const w = info.width
  const h = info.height
  const ch = info.channels
  const stride = w * ch
  const isNearWhite = (r, g, b) => r >= 230 && g >= 230 && b >= 230
  const isNearTransparent = (a) => a < 20
  // Sample gold from center (avoid white ring)
  let fillR = 0xc9, fillG = 0x9a, fillB = 0x50
  for (const [cx, cy] of [[w/2, h/2], [w/4, h/2], [w/2, h/4], [3*w/4, h/2], [w/2, 3*h/4]]) {
    const i = (Math.floor(cy) * stride + Math.floor(cx) * ch)
    const r = data[i], g = data[i+1], b = data[i+2]
    if (!isNearWhite(r, g, b)) { fillR = r; fillG = g; fillB = b; break }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * stride + x * ch
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
      if (isNearTransparent(a) || isNearWhite(r, g, b)) {
        data[i] = fillR; data[i+1] = fillG; data[i+2] = fillB; data[i+3] = 255
      }
    }
  }
  centered1024 = await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: ch } })
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
