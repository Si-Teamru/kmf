# KMF — сайт

Next.js + Payload CMS + PostgreSQL. План работ — [PLAN.md](PLAN.md), соглашения для разработки с ИИ — [CLAUDE.md](CLAUDE.md).

## Локальный запуск

Требуется Node.js ≥ 20.9 и Docker.

```bash
cp .env.example .env         # задать PAYLOAD_SECRET
npm install
npm run db:up                # Postgres 16 в Docker
npm run dev                  # http://localhost:3000
```

Админка: http://localhost:3000/admin — при первом входе создаётся администратор.

Всё в контейнерах: `docker compose --profile app up`.

## Проверки

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

Те же проверки выполняет GitHub Actions на каждый PR и пуш в `main` / `develop`.

## Витрина на GitHub Pages

Статическая версия страниц сайта (без админки и API) публикуется workflow
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) при каждом пуше в `main`:

- https://si-teamru.github.io/kmf/ — главная
- https://si-teamru.github.io/kmf/projects/mytishchi-prospekt-astrakhova/ — страница проекта

Локально та же сборка: `STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/kmf npm run build` (предварительно
убрать `src/app/(payload)` во временной копии), результат — папка `out/`.
