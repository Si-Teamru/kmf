# KMF — инструкции для Claude Code

Сайт мебельной фабрики KMF: публичный сайт + CMS + интерактивный план помещения (3D или изометрия).
Полный план работ — [PLAN.md](PLAN.md).

## Стек

- Next.js 16 (App Router, TypeScript strict), React 19
- Payload CMS 3 внутри Next.js, PostgreSQL 16 (`@payloadcms/db-postgres`)
- Tailwind CSS 4 + CSS-переменные из UI-kit Figma (`src/styles/tokens.css`)
- Анимации: `motion` (`motion/react`) — шапка Desktop ↔ Compact через `layoutId`
- 3D: React Three Fiber + drei (этап 3)
- Пакетный менеджер: **npm** (lockfile `package-lock.json`)

## Команды

```bash
npm run db:up        # Postgres в Docker
npm run dev          # http://localhost:3000, админка /admin
npm run lint && npm run typecheck && npm run format:check
npm run build
npm run tokens              # пересобрать src/styles/tokens.css из scripts/figma/variables.json
npm run generate:types      # после изменения коллекций Payload
npm run generate:importmap  # после добавления кастомных компонентов в админку
```

## Структура

- `src/app/(site)/` — публичные страницы (`/`, `/projects`, `/projects/[slug]`, `/privacy`)
- `src/app/(payload)/` — админка и API Payload (сгенерировано, руками не править без необходимости)
- `src/collections/`, `src/globals/` — схемы Payload
- `src/components/ui/` — примитивы по UI-kit (Button, Link, Chip, Field…)
- `src/components/blocks/` — секции страниц (Header, Footer, ProjectCard…)
- `src/components/plan/` — PlanBlock, Plan3DViewer, PlanImageViewer, PlanPanel
- `src/styles/tokens.css` — токены (генерируется, руками не править)
- `scripts/` — export-tokens, optimize-model, seed

## Дизайн-токены

Источник — переменные Figma, выгруженные через MCP `get_variable_defs` в `scripts/figma/variables.json`
(desktop: `23:2`, `30:532`; mobile: `27:254`, `30:802`; kit: доски `8:2` цвета, `8:154` типографика,
`11:2` радиусы). `npm run tokens` генерирует `tokens.css`.

- Переменные в `:root` названы как в Figma (`--text-primary`, `--bg-sand`, `--layout-section-gap`),
  поэтому `var(--x, #fallback)` из `get_design_context` работает как есть.
- Значения, разные на 1440 и 360, интерполируются через `clamp()`; вес/межстрочный — переключаются на 768px.
- В Figma цвета называются `color_<группа>-<имя>` (`color_text-primary`, `color_bg-white`), а их
  code syntax — `var(--text-primary)`; текстовые стили — `Desktop|Mobile/h1…h6` и `…/text_<имя>`.
- Tailwind-утилиты:
  - цвета: `bg-bg-sand`, `text-text-primary`, `border-gray-200`, `bg-accent-red`…
  - отступы: `px-container-padding`, `gap-block-gap`, `py-section-gap`
  - радиусы: `rounded-none|xs|sm|md|lg|tab|full`
  - типографика (имя стиля Figma без `text_`): `text-h1`…`text-h6`, `text-body-l`,
    `text-chip-label`, `text-caption`… Исключение: `text_button` → `text-button-type`
    (имя `text-button` занято цветом).
  - соответствие: h1 — Page Title, h2 — Section Title, h3 — Block Title, h4 — Card Title,
    h5 — Title M, h6 — Item Title; на главной заголовок первого экрана — `text-hero-title`.
- Не хардкодить цвета, размеры шрифтов и отступы из макета — брать утилиты/переменные выше.
- Шрифт — только Manrope, локально из `@fontsource-variable/manrope` (Google Fonts из РФ нестабилен), утилита `font-sans`.

## UI-kit в коде

Кит в Figma — страница `6:12`, доски 01–10 (`04` иконки `11:157`, `05` кнопки и ссылки `12:2`,
`06` формы `13:14`, `07` карточки `14:40`, `08` навигация `16:70`, `09` план `19:146`, `10` медиа `19:484`).
Витрина всех примитивов — `/ui-kit` (только dev, в продакшене 404); сверять с досками после правок.

- `src/components/ui` (импорт из `@/components/ui`): `Icon`, `ButtonCta`, `ButtonCard`,
  `LinkArrow`, `LinkViewAll`, `LinkCapsDot`, `LinkCapsPlus`, `LinkWatchVideo`, `NavLink`,
  `FormField`, `FormUpload`, `FormConsent`, `InfoChip`, `FeatureItem`, `StepNumber`, `TextBlock`,
  `DesignerLine`, `SocialLink`. Кнопки и ссылки через `Pressable`: с `href` — ссылка, без — `<button>`.
- Иконки — SVG в `public/icons`, реестр с размерами из Figma в `Icon.tsx`. Новая иконка:
  `download_assets` (format svg) по id компонента → `public/icons/<name>.svg` →
  `node scripts/clean-figma-svg.mjs public/icons/<name>.svg` (убирает фон холста и доски) → добавить в `icons`.
- Hover по киту (в макете не нарисован): transition 0.2s; пилюля CTA — заливка `text-button` с белым
  текстом; красный квадрат — `brightness-90`; ссылки — `opacity-70`. Фокус полей — рамка `text-primary`.
- Мобильные варианты компонентов переключаются на `md:` (768px), размеры шрифтов — через токены.

## Соглашения

- Интерактивный план: имена `zone--<key>` и `item--<key>` для мешей GLB и `id` полигонов SVG; `key` совпадает с `zones[].key` / `items[].key` в CMS.
- Состояние плана: `{ state: 'closed' | 'zone' | 'object', zoneKey, itemKey }`, синхронизируется с URL (`?zone=…&item=…`).
- Компоненты называть как в UI-kit Figma (Panel Header, Plan List Item, Zone Tab…).
- Серверные компоненты по умолчанию; `'use client'` только там, где нужна интерактивность.
- Данные из Payload — через Local API (`getPayload`) в серверных компонентах.
- Язык интерфейса и контента — русский.

## Figma

- Файл: `391WjOgpmjW5OdsbXgV1YO`
- Фреймы для вёрстки: `23:2`, `27:254`, `30:532`, `30:802`
- Брейкпоинты: 1440 (десктоп) → 360 (мобайл), планшет — интерполяция.
- Вёрстку делать через Figma MCP (`get_design_context`), переиспользуя `src/components/ui`.
- Размеры, отступы, gap, выравнивание и стили текста брать из кода `get_design_context` и
  координат `get_metadata`, а не со скриншота. Скриншот — только для финальной сверки.
- Чего нет в макете (раскрытое меню, hover, состояния) — не придумывать, а спрашивать.
- Проверка: Playwright-замер `getBoundingClientRect` ключевых элементов на 1440 и 360 против
  координат фреймов Figma (допуск ±2px), плюс отсутствие горизонтального скролла на 360–1920.

## Процесс

- Работа через ветки и PR в `main`; CI (`.github/workflows/ci.yml`) должен быть зелёным.
- `develop` → staging, `main` → продакшен (деплой — этап 5).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
