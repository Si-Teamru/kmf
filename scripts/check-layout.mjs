/**
 * Сверка вёрстки с координатами Figma.
 *
 *   npm run check:layout                         # все спеки из tests/layout/*.json
 *   npm run check:layout -- tests/layout/project.json
 *   BASE_URL=http://localhost:3000 npm run check:layout
 *
 * Спека — JSON: { "path": "/projects/…", "viewports": { "1440": { "<имя>": [селектор, [x, y, w, h], допуск?] } } }.
 * Третий элемент — свой допуск для элемента (например, накопленное округление межстрочного у текста).
 * Координаты — абсолютные во фрейме Figma (y от верха страницы, `get_metadata`).
 * Селектор — CSS; префикс `text:` меряет текст внутри элемента (Range), а не его рамку.
 * Проверяет Δ ≤ TOLERANCE (по умолчанию 2px) и отсутствие горизонтального скролла.
 * Нужен запущенный `npm run dev`. Браузер Playwright: PLAYWRIGHT_BROWSERS_PATH (см. CLAUDE.local.md).
 */
import fs from 'node:fs'
import path from 'node:path'

import { chromium } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const TOLERANCE = Number(process.env.TOLERANCE ?? 2)

const args = process.argv.slice(2)
const files = args.length
  ? args
  : fs
      .readdirSync('tests/layout')
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join('tests/layout', f))

const browser = await chromium.launch()
let failed = 0

for (const file of files) {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const [width, elements] of Object.entries(spec.viewports)) {
    const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } })
    await page.goto(BASE_URL + spec.path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    console.log(`\n${file} @ ${width}px`)

    for (const [name, [selector, expected, tolerance = TOLERANCE]] of Object.entries(elements)) {
      const box = await page.evaluate((sel) => {
        const text = sel.startsWith('text:')
        const el = document.querySelector(text ? sel.slice(5) : sel)
        if (!el) return null
        let rect = el.getBoundingClientRect()
        if (text) {
          const range = document.createRange()
          range.selectNodeContents(el)
          rect = range.getBoundingClientRect()
        }
        return [rect.x, rect.y + window.scrollY, rect.width, rect.height].map(Math.round)
      }, selector)

      if (!box) {
        failed++
        console.log(`  ✗ ${name.padEnd(14)} не найден: ${selector}`)
        continue
      }
      const delta = box.map((v, i) => v - expected[i])
      const ok = delta.every((d) => Math.abs(d) <= tolerance)
      if (!ok) failed++
      console.log(
        `  ${ok ? '✓' : '✗'} ${name.padEnd(14)} ${JSON.stringify(box).padEnd(26)} figma ${JSON.stringify(expected).padEnd(26)} Δ ${JSON.stringify(delta)}`,
      )
    }

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    if (scrollWidth > Number(width)) {
      failed++
      console.log(`  ✗ горизонтальный скролл: scrollWidth ${scrollWidth} > ${width}`)
    }
    await page.close()
  }
}

await browser.close()
console.log(failed ? `\n✗ расхождений: ${failed}` : '\n✓ всё совпадает с Figma')
process.exit(failed ? 1 : 0)
