/**
 * Capture real module screenshots for the welcome-page carousel.
 *
 * Prerequisites:
 *   1. `npm install` (includes playwright)
 *   2. `npx playwright install chromium`
 *   3. Start the app: `npm run dev` (default http://127.0.0.1:3000)
 *   4. In another terminal: `npm run capture:module-previews`
 *
 * The script seeds localStorage (fake premium + child profile) so you are not
 * prompted to log in. It does not call your production APIs for subscription.
 *
 * Env:
 *   CAPTURE_BASE_URL — default http://127.0.0.1:3000
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'images', 'module-previews')
const baseURL = process.env.CAPTURE_BASE_URL || 'http://127.0.0.1:3000'

const shots = [
  { key: 'speaking', path: '/learning/speaking' },
  { key: 'writing', path: '/learning/writing' },
  { key: 'reading', path: '/learning/reading' },
  { key: 'games', path: '/learning/games' },
  { key: 'grammar', path: '/learning/grammar' },
  { key: 'puzzles', path: '/learning/puzzle' },
  { key: 'coloring', path: '/learning/alphabet-coloring' },
  {
    key: 'challenges',
    path: '/learning',
    after: async (page) => {
      const loc = page.locator('text=Daily Challenges').first()
      if (await loc.count()) {
        await loc.scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
      }
    },
  },
  { key: 'math', path: '/learning/math' },
  {
    key: 'creative',
    path: '/learning/writing',
    after: async (page) => {
      await page.getByRole('button', { name: /Creative Writing/i }).click()
      await page.waitForTimeout(1500)
    },
  },
  { key: 'progress', path: '/dashboard' },
]

function seedPreviewSession() {
  const far = new Date(Date.now() + 10 * 365 * 86400000).toISOString()
  const parentId = 'module-preview-parent'
  const email = 'module.preview@local.test'
  const child = {
    id: 'module-preview-child',
    name: 'Alex',
    age: 7,
    ageGroup: 'AGE_6_8',
    parentId,
    parentEmail: email,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(
    'user_subscription',
    JSON.stringify({
      isActive: true,
      expiresAt: far,
      type: 'yearly',
      activatedAt: new Date().toISOString(),
    })
  )
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: parentId,
      email,
      name: 'Preview Parent',
      accountType: 'parent',
    })
  )
  localStorage.setItem('children', JSON.stringify([child]))
  localStorage.setItem('currentChild', JSON.stringify(child))
  localStorage.setItem('writing_tracing_tips_seen_v1', '1')
}

async function main() {
  mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    baseURL,
  })

  await context.addInitScript(seedPreviewSession)

  const page = await context.newPage()

  for (const shot of shots) {
    const url = shot.path
    process.stdout.write(`Capturing ${shot.key} → ${url} ... `)
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForLoadState('networkidle').catch(() => {})
      await page.waitForTimeout(1500)
      if (typeof shot.after === 'function') {
        await shot.after(page)
      }
      const file = join(outDir, `${shot.key}.png`)
      await page.screenshot({ path: file, fullPage: false })
      console.log('ok')
    } catch (e) {
      console.log('FAILED', e?.message || e)
    }
  }

  await browser.close()
  console.log(`\nDone. PNGs saved under public/images/module-previews/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
