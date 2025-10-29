/*
  Make App Icons from existing logo
  - Input: app/public/logo.png (or pass a path)
  - Output: app/public/icons/icon-<size>.png (1024,512,256,192,128,64)

  Approach:
  - Load image, convert to sRGB
  - Auto-trim outer background using trim(threshold)
  - Center on transparent 1024x1024 canvas with padding
  - Export multiple sizes
*/

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public')

async function main() {
  const srcArg = process.argv[2]
  const srcPath = srcArg ? path.resolve(srcArg) : path.join(PUBLIC_DIR, 'logo.png')
  const outDir = path.join(PUBLIC_DIR, 'icons')
  const sizes = [1024, 512, 256, 192, 128, 64]

  if (!fs.existsSync(srcPath)) {
    console.error(`Source image not found: ${srcPath}`)
    process.exit(1)
  }
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

  // Compose on transparent square 1024 canvas with padding
  const baseSize = 1024
  const paddingRatio = 0.10 // 10% padding keeps edges clean at small sizes
  const targetBox = Math.round(baseSize * (1 - paddingRatio * 2))
  const scale = Math.min(targetBox / cropW, targetBox / cropH)
  const resizedW = Math.max(1, Math.round(cropW * scale))
  const resizedH = Math.max(1, Math.round(cropH * scale))

  const centered1024 = await sharp({ create: { width: baseSize, height: baseSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: await sharp(trimmedPng).resize(resizedW, resizedH, { kernel: 'lanczos3' }).png().toBuffer(), left: Math.round((baseSize - resizedW) / 2), top: Math.round((baseSize - resizedH) / 2) }
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()

  // Save master and downscaled sizes
  await sharp(centered1024).toFile(path.join(outDir, 'icon-1024.png'))
  for (const size of sizes.filter(s => s !== 1024)) {
    await sharp(centered1024).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(path.join(outDir, `icon-${size}.png`))
  }

  console.log('Icons created in', outDir)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
