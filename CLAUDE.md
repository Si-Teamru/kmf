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
- `src/styles/tokens.css` — токены; не хардкодить цвета/отступы, брать из токенов
- `scripts/` — export-tokens, optimize-model, seed

## Соглашения

- Интерактивный план: имена `zone--<key>` и `item--<key>` для мешей GLB и `id` полигонов SVG; `key` совпадает с `zones[].key` / `items[].key` в CMS.
- Состояние плана: `{ state: 'closed' | 'zone' | 'object', zoneKey, itemKey }`, синхронизируется с URL (`?zone=…&item=…`).
- Компоненты называть как в UI-kit Figma (Panel Header, Plan List Item, Zone Tab…).
- Серверные компоненты по умолчанию; `'use client'` только там, где нужна интерактивность.
- Данные из Payload — через Local API (`getPayload`) в серверных компонентах.
- Язык интерфейса и контента — русский.

## Figma

- Файл: `391WjOgpmjW5OdsbXgV1YO` (страницы «UI-kit» и «Проект — к вёрстке»)
- Фреймы для вёрстки: `23:2`, `27:254`, `30:532`, `30:802`
- Брейкпоинты: 1440 (десктоп) → 360 (мобайл), планшет — интерполяция.
- Вёрстку делать через Figma MCP (`get_design_context`), переиспользуя `src/components/ui`.

## Процесс

- Работа через ветки и PR в `main`; CI (`.github/workflows/ci.yml`) должен быть зелёным.
- `develop` → staging, `main` → продакшен (деплой — этап 5).
