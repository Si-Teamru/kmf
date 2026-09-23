# KMF — инструкции для Claude Code

Сайт мебельной фабрики KMF: публичный сайт + CMS + интерактивный план помещения (3D или изометрия).
Полный план работ — [PLAN.md](PLAN.md).

## Стек

- Next.js 16 (App Router, TypeScript strict), React 19
- Payload CMS 3 внутри Next.js, PostgreSQL 16 (`@payloadcms/db-postgres`)
- Tailwind CSS 4 + CSS-переменные из UI-kit Figma (`src/styles/tokens.css`)
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
(desktop: `23:2`, `30:532`; mobile: `27:254`, `30:802`). `npm run tokens` генерирует `tokens.css`.

- Переменные в `:root` названы как в Figma (`--text-primary`, `--bg-sand`, `--layout-section-gap`),
  поэтому `var(--x, #fallback)` из `get_design_context` работает как есть.
- Значения, разные на 1440 и 360, интерполируются через `clamp()`; вес/межстрочный — переключаются на 768px.
- В Figma цвета называются `color_<группа>-<имя>` (`color_text-primary`, `color_bg-white`), а их
  code syntax — `var(--text-primary)`; текстовые стили — `Desktop|Mobile/h1…h6` и `…/text_<имя>`.
- Tailwind-утилиты:
  - цвета: `bg-bg-sand`, `text-text-primary`, `border-gray-200`, `bg-accent-red`…
  - отступы: `px-container-padding`, `gap-block-gap`, `py-section-gap`
  - радиусы: `rounded-xs|sm|md|tab|full`
  - типографика (имя стиля Figma без `text_`): `text-h1`…`text-h6`, `text-body-l`,
    `text-chip-label`, `text-caption`… Исключение: `text_button` → `text-button-type`
    (имя `text-button` занято цветом).
  - соответствие: h1 — Page Title, h2 — Section Title, h3 — Block Title, h4 — Card Title,
    h5 — Title M, h6 — Item Title; на главной заголовок первого экрана — `text-hero-title`.
- Не хардкодить цвета, размеры шрифтов и отступы из макета — брать утилиты/переменные выше.
- Шрифт — только Manrope, локально из `@fontsource-variable/manrope` (Google Fonts из РФ нестабилен), утилита `font-sans`.

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

## Процесс

- Работа через ветки и PR в `main`; CI (`.github/workflows/ci.yml`) должен быть зелёным.
- `develop` → staging, `main` → продакшен (деплой — этап 5).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
