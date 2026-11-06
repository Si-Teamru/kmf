import type { CollectionConfig } from 'payload'

/**
 * Фото проектов. Сжатие при загрузке: WebP q82, длинная сторона до 2560 — лайтбокс 1100 px на
 * экране ×2, оригиналы с телефона по 4096 и 5–10 МБ не уходят посетителям.
 * Только растровые форматы: SVG может нести скрипт, HEIC готовая сборка sharp не читает.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Файлы' },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Описание (для незрячих и поисковиков)',
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    resizeOptions: { width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
}
