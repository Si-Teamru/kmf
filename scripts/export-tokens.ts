/**
 * Figma-переменные → src/styles/tokens.css
 *
 * Источник: scripts/figma/variables.json — сырые ответы Figma MCP `get_variable_defs`
 * по подготовленным фреймам (desktop 1440 и mobile 360) и доскам UI-kit (`kit`: 01 · Цвета,
 * 02 · Типографика, 03 · Сетка — полный список цветов, радиусов и стилей Desktop/Mobile).
 *
 * Обновление токенов:
 *   1. В Claude Code вызвать `get_variable_defs` для фреймов из variables.json и заменить их содержимое.
 *   2. npm run tokens
 *
 * Что генерируется:
 *   - :root с переменными под именами из Figma (--text-primary, --bg-sand…), чтобы код из
 *     `get_design_context` (`var(--text-primary, #4c4c4c)`) работал без правок;
 *   - значения, различающиеся на 1440 и 360, интерполируются через clamp();
 *   - @theme для Tailwind: цвета (bg-bg-sand, text-text-primary), радиусы, отступы,
 *     текстовые стили (Figma `h1`…`h6`, `text_body-l` → text-h1, text-body-l…).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MOBILE_VW = 360
const DESKTOP_VW = 1440
/** Порог переключения неинтерполируемых свойств (вес, межстрочный интервал). */
const MOBILE_BREAKPOINT = 768

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = path.join(root, 'scripts/figma/variables.json')
const output = path.join(root, 'src/styles/tokens.css')

type Raw = Record<string, string>
type Source = {
  fileKey: string
  sources: { desktop: Record<string, Raw>; mobile: Record<string, Raw>; kit?: Record<string, Raw> }
}
type Font = { size: number; weight: number; lineHeight: number; letterSpacing: number }
type Pair<T> = { desktop?: T; mobile?: T }

const data = JSON.parse(fs.readFileSync(input, 'utf8')) as Source

const vars = new Map<string, Pair<string>>()
const fonts = new Map<string, Pair<Font>>()

/** Имя стиля Figma → имя утилиты: `text_body-l` → `body-l`, `h1` → `h1`. */
const slug = (s: string) =>
  s
    .replace(/^text_/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const parseFont = (s: string): Font => {
  const num = (key: string) => Number(new RegExp(`${key}: ([\\d.]+)`).exec(s)?.[1] ?? 0)
  return {
    size: num('size'),
    weight: num('weight'),
    lineHeight: Math.round(num('lineHeight') * 100) / 100,
    letterSpacing: num('letterSpacing'),
  }
}

for (const mode of ['desktop', 'mobile', 'kit'] as const) {
  for (const raw of Object.values(data.sources[mode] ?? {})) {
    for (const [key, value] of Object.entries(raw)) {
      const varMatch = /^var\(--(.+)\)$/.exec(key)
      if (varMatch) {
        const entry = vars.get(varMatch[1]) ?? {}
        if (mode === 'kit') {
          // Доски кита не привязаны к брейкпоинту: только дополняют недостающее.
          entry.desktop ??= value
          entry.mobile ??= value
        } else {
          entry[mode] ??= value
        }
        vars.set(varMatch[1], entry)
        continue
      }
      const fontMatch = /^(Desktop|Mobile)\/(.+)$/.exec(key)
      if (fontMatch) {
        const fontMode = fontMatch[1].toLowerCase() as 'desktop' | 'mobile'
        const name = slug(fontMatch[2])
        const entry = fonts.get(name) ?? {}
        entry[fontMode] ??= parseFont(value)
        fonts.set(name, entry)
      }
    }
  }
}

const round = (n: number) => Math.round(n * 10000) / 10000

/** Линейная интерполяция px-значения между 360 и 1440. */
const fluid = (mobile: number, desktop: number) => {
  if (mobile === desktop) return `${desktop}px`
  const slope = (desktop - mobile) / (DESKTOP_VW - MOBILE_VW)
  const intercept = mobile - slope * MOBILE_VW
  const [min, max] = mobile < desktop ? [mobile, desktop] : [desktop, mobile]
  return `clamp(${min}px, ${round(intercept)}px + ${round(slope * 100)}vw, ${max}px)`
}

const isColor = (v: string) => v.startsWith('#')
const byName = <T>(a: [string, T], b: [string, T]) => a[0].localeCompare(b[0])

const colorVars = [...vars].filter(([, v]) => isColor((v.desktop ?? v.mobile)!)).sort(byName)
const sizeVars = [...vars].filter(([, v]) => !isColor((v.desktop ?? v.mobile)!)).sort(byName)
const fontEntries = [...fonts].sort(byName)

const rootLines: string[] = []
const mobileLines: string[] = []
const themeLines: string[] = []
/** Радиусы Figma совпадают с неймспейсом Tailwind (--radius-*), поэтому задаются литералами. */
const staticThemeLines: string[] = []

rootLines.push('  /* Цвета */')
for (const [name, v] of colorVars) {
  rootLines.push(`  --${name}: ${v.desktop ?? v.mobile};`)
  themeLines.push(`  --color-${name}: var(--${name});`)
}

rootLines.push('', '  /* Layout (радиусы — в @theme static) */')
const missing: string[] = []
for (const [name, v] of sizeVars) {
  const d = Number(v.desktop ?? v.mobile)
  const m = Number(v.mobile ?? v.desktop)
  if (!v.desktop || !v.mobile) {
    if (name.startsWith('layout-')) missing.push(name)
  }
  if (name.startsWith('radius-') && m === d) {
    staticThemeLines.push(`  --${name}: ${d}px;`)
    continue
  }
  rootLines.push(`  --${name}: ${fluid(m, d)};`)

  if (name.startsWith('layout-'))
    themeLines.push(`  --spacing-${name.replace(/^layout-/, '')}: var(--${name});`)
}

rootLines.push('', '  /* Типографика (Manrope) */')
for (const [style, f] of fontEntries) {
  const d = (f.desktop ?? f.mobile)!
  const m = (f.mobile ?? f.desktop)!
  const p = `--type-${style}`
  // Tailwind-стиль --text-<name> не должен совпадать с цветом Figma (--text-button).
  const name = vars.has(`text-${style}`) ? `${style}-type` : style
  rootLines.push(`  ${p}-size: ${fluid(m.size, d.size)};`)
  rootLines.push(`  ${p}-line-height: ${d.lineHeight};`)
  rootLines.push(`  ${p}-weight: ${d.weight};`)
  if (d.letterSpacing) rootLines.push(`  ${p}-letter-spacing: ${d.letterSpacing}px;`)
  if (m.lineHeight !== d.lineHeight) mobileLines.push(`    ${p}-line-height: ${m.lineHeight};`)
  if (m.weight !== d.weight) mobileLines.push(`    ${p}-weight: ${m.weight};`)

  themeLines.push(`  --text-${name}: var(${p}-size);`)
  themeLines.push(`  --text-${name}--line-height: var(${p}-line-height);`)
  themeLines.push(`  --text-${name}--font-weight: var(${p}-weight);`)
  if (d.letterSpacing)
    themeLines.push(`  --text-${name}--letter-spacing: var(${p}-letter-spacing);`)
}

const css = `/*
 * Сгенерировано scripts/export-tokens.ts из Figma (${data.fileKey}). Не редактировать вручную —
 * обновить scripts/figma/variables.json и запустить \`npm run tokens\`.
 */
:root {
${rootLines.join('\n')}
}

@media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
  :root {
${mobileLines.join('\n')}
  }
}

@theme static {
${staticThemeLines.join('\n')}
}

@theme inline {
${themeLines.join('\n')}
}
`

fs.writeFileSync(output, css)
console.log(
  `tokens.css: ${colorVars.length} цветов, ${sizeVars.length} размеров, ${fontEntries.length} текстовых стилей`,
)
if (missing.length)
  console.warn(`Нет значения для одного из брейкпоинтов (взято общее): ${missing.join(', ')}`)
