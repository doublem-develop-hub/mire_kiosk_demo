import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const KEYS = [
  'qr-expired',
  'qr-failed',
  'user-unregistered',
  'iris-failed',
  'hand-removed',
  'measure-timeout',
  'sensor-error',
  'network-error',
  'analyze-failed',
  'out-of-service',
]

const OUT = '/Users/gimjinhyeon/Desktop/02_development/mire/mire_kiosk_demo/screenshots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 2,
})

let i = 1
for (const key of KEYS) {
  await page.goto(`http://localhost:5173/?error=${key}`, {
    waitUntil: 'networkidle',
  })
  // fade/pop 애니메이션이 끝난 상태로 캡처
  await page.waitForTimeout(900)
  const n = String(i).padStart(2, '0')
  const file = `${OUT}/${n}_${key}.png`
  await page.screenshot({ path: file })
  console.log('saved', file)
  i++
}

await browser.close()
console.log('DONE', KEYS.length, 'screenshots ->', OUT)
