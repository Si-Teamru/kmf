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
  ProjectGallery, ProjectsSlider, ProjectCard, VideoTile, StepDivider (+ ArrowLine)
- `src/components/plan/` — PlanBlock, Plan3DViewer, PlanImageViewer, PlanPanel (этап 3)
- `src/data/` — статические данные до CMS (`site.ts` — контакты/меню, `projects.ts` — проекты);
  поля повторяют будущие коллекции Payload
- `src/lib/asset.ts` — `asset()` для путей из `public` (basePath для GitHub Pages)
- `src/styles/tokens.css` — токены (генерируется, руками не править)
- `public/icons` — иконки кита (SVG), `public/demo` — демо-фото до CMS
- `scripts/` — export-tokens, clean-figma-svg, check-layout (далее optimize-model, seed)
- `tests/layout/*.json` — спеки сверки с Figma для `npm run check:layout`
- `CHANGELOG.md` — журнал изменений, дополнять в каждом PR

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
  `DesignerLine`, `SocialLink`, `Review`. Кнопки и ссылки через `Pressable`: с `href` — ссылка, без — `<button>`.
- Иконки — SVG в `public/icons`, реестр с размерами из Figma в `Icon.tsx`. Новая иконка:
  `download_assets` (format svg) по id компонента → `public/icons/<name>.svg` →
  `node scripts/clean-figma-svg.mjs public/icons/<name>.svg` (убирает фон холста и доски) → добавить в `icons`.
- Hover по киту (в макете не нарисован): transition 0.2s; пилюля CTA — заливка `text-button` с белым
  текстом; красный квадрат — `brightness-90`; ссылки — `opacity-70`. Фокус полей — рамка `text-primary`.
- Мобильные варианты компонентов переключаются на `md:` (768px), размеры шрифтов — через токены.
- Пути к файлам из `public` в `next/image` оборачивать в `asset()` из `@/lib/asset` — иначе картинки
  сломаются в статической сборке для GitHub Pages (basePath `/kmf`).

## Соглашения

- Интерактивный план: имена `zone--<key>` и `item--<key>` для мешей GLB и `id` полигонов SVG; `key` совпадает с `zones[].key` / `items[].key` в CMS.
- Состояние плана: `{ state: 'closed' | 'zone' | 'object', zoneKey, itemKey }`, синхронизируется с URL (`?zone=…&item=…`).
- Компоненты называть как в UI-kit Figma (Panel Header, Plan List Item, Zone Tab…).
- Серверные компоненты по умолчанию; `'use client'` только там, где нужна интерактивность.
- Данные из Payload — через Local API (`getPayload`) в серверных компонентах.
- Язык интерфейса и контента — русский.

## Figma

- Файл: `391WjOgpmjW5OdsbXgV1YO`. Страница UI-kit — `6:12`.
- Фреймы «к вёрстке»: проект desktop `23:2`, mobile `27:254`; панель плана desktop `30:532`, mobile `30:802`.
  Секции проекта (desktop / mobile): шапка `23:3` / `27:255`, intro `23:35` / `27:270`, план `23:92` / `27:373`,
  галерея `23:118` / `27:460`, проекты `23:191` / `27:506`, подвал `23:277` / `27:551`.
- Брейкпоинты: 1440 (десктоп) → 360 (мобайл), планшет — интерполяция.
- Вёрстку делать через Figma MCP (`get_design_context`), переиспользуя `src/components/ui`.
- Размеры, отступы, gap, выравнивание и стили текста брать из кода `get_design_context` и
  координат `get_metadata`, а не со скриншота. Скриншот — только для финальной сверки.
- Чего нет в макете (раскрытое меню, hover, состояния) — не придумывать, а спрашивать.
- Проверка: `npm run check:layout` — Playwright-замер ключевых элементов на 1440 и 360 против
  координат фреймов Figma (допуск ±2px), плюс отсутствие горизонтального скролла. Для каждой новой
  секции добавлять её элементы в спеку `tests/layout/<страница>.json` (координаты из `get_metadata`,
  абсолютные во фрейме страницы). Свой допуск элемента — только с пояснением в `notes`.

## Процесс

- **Сначала работаем локально.** Правки копятся в локальной ветке (коммиты — локально), проверка —
  на `npm run dev` (дать ссылку на localhost) + lint/typecheck/format и `check:layout`. Push, PR,
  merge и публикация на Pages — только когда пользователь скажет запушить изменения; тогда весь
  накопленный пакет проходит процесс ниже одним PR.
- Ветка на задачу (`feat/…`, `fix/…`, `docs/…`, `chore/…`) → PR в `main` → CI зелёный → squash-merge.
  Коммиты — на английском, заголовок PR и описание — по-русски (заголовок PR становится коммитом в `main`).
- В каждом PR: запись в `CHANGELOG.md` (раздел «Не выпущено»), обновить `CLAUDE.md`/`PLAN.md`, если
  поменялись правила, структура или статус.
- После merge: перемотать `develop` до `main` (`git push origin origin/main:refs/heads/develop`, только
  fast-forward). Затем предложить пользователю удалить ненужные ветки (слитые PR, без коммитов
  после merge — сверить SHA головы ветки с PR) и удалять только после его согласия:
  `git push origin --delete <ветка>` + локально `git branch -D <ветка>`.
- Push в `main` сам публикует витрину на GitHub Pages (`pages.yml`) — после merge проверить, что
  страница открывается.
- `develop` → staging, `main` → продакшен (деплой — этап 5).

## Грабли и правила (выведены из реальных ошибок)

### Ассеты из Figma

- URL ассетов Figma живут 7 дней — скачивать сразу, в репозиторий класть файлы, не ссылки.
- **Иконки**: `download_assets` по id компонента (format svg) → `clean-figma-svg.mjs`. После — открыть
  `/ui-kit` и посмотреть глазами. Если в `get_design_context` у вектора отрицательные отступы
  (`inset-[-7.36px_…]`), вектор больше своего бокса и экспорт компонента может его обрезать
  (так сломалась `link-arrow-98`) — брать SVG из констант `get_design_context` (полный вектор).
- **Фото**: брать `rawImages` (оригиналы), выбирать самый большой файл; совпадения искать по md5 и
  переиспользовать. PNG-фото тяжелее ~1 МБ — пересохранять в JPEG q90 без смены разрешения (sharp).
  На Pages картинки не оптимизируются — вес важен.
- Если в узле > 20 картинок, `download_assets` обрезает список — выгружать по дочерним узлам.
- Растягиваемые линии с точками/стрелками — CSS (`ArrowLine`, `StepDivider`), не растянутый SVG
  (`preserveAspectRatio="none"` искажает точки).

### Вёрстка

- Если на мобильном и десктопе меняется только порядок — один DOM + `grid-template-areas`
  (h1 не дублируется). Если раскладки принципиально разные — две ветки (`hidden xl:block` / `xl:hidden`).
- Брейкпоинты: компоненты, шапка, подвал — `md` (768); секции, чьи колонки десктопа не влезают
  уже (intro, галерея, слайдер проектов) — `xl` (1280). Указывать брейкпоинт в JSDoc компонента.
- `cn()` не сливает конфликтующие классы (`w-full` + `w-[564px]` → непредсказуемо). В базовых классах
  компонента не держать display/ширину/высоту, которые снаружи меняют, — выносить в проп с
  дефолтом (`ButtonCard size`, `StepDivider className = 'flex w-full'`).
- Плавающая мини-шапка (desktop) занимает место compact-bar из макета: в секциях с compact-bar
  оставлять пустой отступ 41px, отдельную compact-bar не рисовать.
- Картинки из `public` в `next/image` — через `asset()`; новые папки в `public` для `next/image`
  добавлять в `images.localPatterns` в `next.config.ts`.
- Страницы в `(site)` должны собираться статически (витрина Pages): без cookies/headers/серверных
  API во время запроса; `params` — Promise, для динамических путей — `generateStaticParams`.

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
