# KMF — инструкции для Claude Code

Сайт мебельной фабрики KMF: публичный сайт + CMS + интерактивный план помещения (3D или изометрия).
Полный план работ — [PLAN.md](PLAN.md).

## Дизайн-система — обязательна

Всё про дизайн (Figma и id узлов, токены, компоненты кита ↔ код, состояния, адаптив, паттерны попапов,
правила текстов без англицизмов, ассеты, проверка вёрстки, правки в Figma через MCP) — в
[DESIGN.md](DESIGN.md). Он подключён ниже и действует в каждой сессии: любую задачу, которая затрагивает
вёрстку, стили, тексты интерфейса или Figma, начинать с его раздела «0. Порядок работы» и не
отступать от него без согласия пользователя. Изменил дизайн-систему — обнови DESIGN.md в том же коммите.

@DESIGN.md

## Стек

- Next.js 16 (App Router, TypeScript strict), React 19
- Payload CMS 3 внутри Next.js, PostgreSQL 16 (`@payloadcms/db-postgres`)
- Tailwind CSS 4 + CSS-переменные из UI-kit Figma (`src/styles/tokens.css`)
- Анимации: `motion` (`motion/react`) — шапка Desktop ↔ Compact через `layoutId`; `gsap` (ScrollTrigger +
  Observer) — закреплённые секции с пошаговым листанием (карусель преимуществ на главной)
- 3D: React Three Fiber + drei (этап 3)
- Пакетный менеджер: **npm** (lockfile `package-lock.json`)

## Команды

```bash
npm run db:up        # Postgres в Docker
npm run dev          # http://localhost:3000, админка /admin
npm run lint && npm run typecheck && npm run format:check
npm run build
npm run check:layout        # сверка вёрстки с координатами Figma (нужен запущенный dev)
npm run tokens              # пересобрать src/styles/tokens.css из scripts/figma/variables.json
npm run generate:types      # после изменения коллекций Payload
npm run generate:importmap  # после добавления кастомных компонентов в админку
```

## Структура

- `src/app/(site)/` — публичные страницы (`/`, `/projects`, `/projects/[slug]`, `/privacy`)
- `src/app/(payload)/` — админка и API Payload (сгенерировано, руками не править без необходимости)
- `src/collections/`, `src/globals/` — схемы Payload
- `src/components/ui/` — примитивы по UI-kit (Button, Link, Chip, Field…)
- `src/components/blocks/` — секции страниц: Header (+ HeaderDesktop), Footer, ProjectIntro,
  ProjectGallery, ProjectReview, ProjectsSlider, ProjectCard, VideoTile, StepDivider (+ ArrowLine),
  SectionHeading; главная — HomeHero (+ HeroSlider), HomeBenefits, HomeShowroom, HomeForm, HomeProjects
- `src/components/popups/` — `Popup` (каркас на `<dialog>`), `PopupHost` (попапы «Отправить проект» /
  «Записаться в выставочный зал», в layout; открываются любой ссылкой на `#send-project` / `#showroom`),
  `Lightbox` (лайтбокс галереи: `LightboxProvider` + `LightboxTrigger`), `lockScroll`,
  `ConsentBanner` (согласие на текстовые файлы данных: баннер + панель настроек, в layout)
- `src/lib/consent.ts` — выбор пользователя по категориям (`kmf_consent`, 12 месяцев). Аналитику и
  рекламу подключать только при `hasConsent(...)` и слушать `CONSENT_EVENT`
- `src/components/plan/` — PlanBlock, Plan3DViewer, PlanImageViewer, PlanPanel (этап 3)
- `src/data/` — статические данные до CMS (`site.ts` — контакты/меню, `projects.ts` — проекты,
  `home.ts` — главная);
  поля повторяют будущие коллекции Payload
- `src/lib/asset.ts` — `asset()` для путей из `public` (basePath для GitHub Pages)
- `src/styles/tokens.css` — токены (генерируется, руками не править)
- `public/icons` — иконки кита (SVG), `public/demo` — демо-фото до CMS
- `scripts/` — export-tokens, clean-figma-svg, check-layout (далее optimize-model, seed)
- `tests/layout/*.json` — спеки сверки с Figma для `npm run check:layout`
- `CHANGELOG.md` — журнал изменений, дополнять в каждом PR

## Соглашения

- Интерактивный план: имена `zone--<key>` и `item--<key>` для мешей GLB и `id` полигонов SVG; `key` совпадает с `zones[].key` / `items[].key` в CMS.
- Состояние плана: `{ state: 'closed' | 'zone' | 'object', zoneKey, itemKey }`, синхронизируется с URL (`?zone=…&item=…`).
- Компоненты называть как в UI-kit Figma (Panel Header, Plan List Item, Zone Tab…).
- Серверные компоненты по умолчанию; `'use client'` только там, где нужна интерактивность.
- Данные из Payload — через Local API (`getPayload`) в серверных компонентах.
- Язык интерфейса и контента — русский, без англицизмов (DESIGN.md §8).
- Страницы в `(site)` собираются статически (витрина Pages): без cookies/headers/серверных API во
  время запроса; `params` — Promise, для динамических путей — `generateStaticParams`.

## Процесс

- **Сначала работаем локально.** Правки копятся в локальной ветке (коммиты — локально), проверка —
  на `npm run dev` (дать ссылку на localhost) + lint/typecheck/format и `check:layout`. Push, PR,
  merge и публикация на Pages — только когда пользователь скажет запушить изменения; тогда весь
  накопленный пакет проходит процесс ниже одним PR.
- Ветка на задачу (`feat/…`, `fix/…`, `docs/…`, `chore/…`) → PR в `main` → CI зелёный → squash-merge.
  Коммиты — на английском, заголовок PR и описание — по-русски (заголовок PR становится коммитом в `main`).
- В каждом PR: запись в `CHANGELOG.md` (раздел «Не выпущено»), обновить `CLAUDE.md`/`DESIGN.md`/`PLAN.md`,
  если поменялись правила, дизайн-система, структура или статус.
- После merge: перемотать `develop` до `main` (`git push origin origin/main:refs/heads/develop`, только
  fast-forward). Затем предложить пользователю удалить ненужные ветки (слитые PR, без коммитов
  после merge — сверить SHA головы ветки с PR) и удалять только после его согласия:
  `git push origin --delete <ветка>` + локально `git branch -D <ветка>`.
- Push в `main` сам публикует витрину на GitHub Pages (`pages.yml`) — после merge проверить, что
  страница открывается.
- `develop` → staging, `main` → продакшен (деплой — этап 5).

## Грабли и правила (выведены из реальных ошибок)

Грабли вёрстки, ассетов и Figma — в DESIGN.md (§9, §11, §12).

### Окружение (Windows)

- Не запускать `npm run build`, пока работает `npm run dev`: у них общий `.next`, dev-сервер ломается.
  Остановить dev или перезапустить его после сборки.
- Git Bash превращает значения вида `/kmf` в пути (`C:/Program Files/Git/kmf`) — для таких
  переменных `MSYS_NO_PATHCONV=1`.
- Turbopack не принимает `node_modules`, подключённый ссылкой/junction, — во временной копии
  проекта ставить зависимости `npm ci` (кэш npm уже на D:).
- Временные копии, сборки и кэши — на `D:\dev-cache\…` (см. `CLAUDE.local.md`), не в `%TEMP%` на C:.
- Одноразовые Playwright-скрипты запускать из папки проекта (иначе не находится `@playwright/test`);
  браузеры — `PLAYWRIGHT_BROWSERS_PATH=D:\dev-cache\ms-playwright`.

### GitHub

- У токена MCP нет прав на запуск workflow и защиту веток — перезапуск Pages делает пользователь
  в интерфейсе GitHub. В MCP нет удаления веток — удалять через git (см. «Процесс»), только с
  согласия пользователя. Прямые запросы к API с токеном в обход MCP не делать.
- Merge PR через MCP — только при зелёном CI (разрешение в `.claude/settings.local.json`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
