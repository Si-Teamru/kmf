# KMF — сайт

Сайт мебельной фабрики KMF: Next.js 16 + Payload CMS 3 + PostgreSQL 16, Tailwind CSS 4.

- **Витрина:** https://si-teamru.github.io/kmf/projects/mytishchi-prospekt-astrakhova/
- **План работ и статус:** [PLAN.md](PLAN.md)
- **Что изменилось:** [CHANGELOG.md](CHANGELOG.md)
- **Правила разработки (в т. ч. для ИИ-агента):** [CLAUDE.md](CLAUDE.md)
- **Макет:** Figma `391WjOgpmjW5OdsbXgV1YO` (UI-kit — страница `6:12`)

## Локальный запуск

Нужны Node.js ≥ 20.9 и Docker.

```bash
cp .env.example .env         # задать PAYLOAD_SECRET
npm install
npm run db:up                # Postgres 16 в Docker
npm run dev                  # http://localhost:3000
```

- Страница проекта: http://localhost:3000/projects/mytishchi-prospekt-astrakhova
- Витрина UI-kit (только dev): http://localhost:3000/ui-kit
- Админка: http://localhost:3000/admin — при первом входе создаётся администратор.

Всё в контейнерах: `docker compose --profile app up`.

## Проверки

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build                # не запускать одновременно с npm run dev — общий .next
npm run check:layout         # сверка вёрстки с Figma (при запущенном npm run dev)
```

`lint`, `typecheck`, `format:check` и `build` выполняет GitHub Actions на каждый PR и пуш в
`main` / `develop`. `check:layout` — локально, перед PR с вёрсткой: координаты элементов на 1440 и 360
сравниваются с фреймами Figma (спеки в [`tests/layout`](tests/layout)), допуск ±2px.

## Дизайн-токены

Переменные и стили Figma выгружены в [`scripts/figma/variables.json`](scripts/figma/variables.json);
`npm run tokens` собирает из них [`src/styles/tokens.css`](src/styles/tokens.css) (цвета, отступы,
радиусы, 38 текстовых стилей, плавная интерполяция 360 → 1440). Правила использования — в CLAUDE.md.

## Витрина на GitHub Pages

Статическая версия страниц сайта (без админки и API) публикуется workflow
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) при каждом пуше в `main`, адрес —
https://si-teamru.github.io/kmf/ . Перезапустить вручную: Actions → GitHub Pages → Run workflow.

Локально та же сборка: во временной копии проекта удалить `src/app/(payload)` и выполнить
`STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/kmf npm run build` (в Git Bash — с `MSYS_NO_PATHCONV=1`),
результат — папка `out/`.

## Процесс

Ветка на задачу → PR в `main` → зелёный CI → squash-merge → `develop` перематывается до `main`.
В каждом PR — запись в `CHANGELOG.md`.
