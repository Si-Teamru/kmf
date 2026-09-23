import type { SocialNetwork } from '@/components/ui'

/**
 * Статические данные проектов для вёрстки (этап 1). Поля повторяют будущую коллекцию
 * Payload `Projects`; на этапе 2 источник заменится на Local API.
 */
export type ProjectImage = { src: string; alt: string; width: number; height: number }

/** Элемент галереи проекта: фото или видео (превью + ссылка на ролик, когда появится). */
export type GalleryItem =
  ({ type: 'photo' } & ProjectImage) | { type: 'video'; poster: ProjectImage; videoUrl?: string }

/** Отзыв: фрагменты текста, `strong` — полужирные (SemiBold) части цитаты. */
export type Review = {
  text: Array<{ text: string; strong?: boolean }>
  author: string
  role: string
  href?: string
}

export type Project = {
  slug: string
  title: string
  /** Строки под заголовком: бюджет, срок. */
  meta: string[]
  designer: { name: string; socials: Array<{ network: SocialNetwork; href: string }> }
  /** Превью 2×2 в первом блоке. */
  gallery2x2: [ProjectImage, ProjectImage, ProjectImage, ProjectImage]
  task: string
  solution: string
  gallery: GalleryItem[]
  review?: Review
}

const dir = '/demo/mytishchi'
const photo = (file: string, width: number, height: number, alt: string): GalleryItem => ({
  type: 'photo',
  src: `${dir}/${file}`,
  width,
  height,
  alt,
})

export const projects: Project[] = [
  {
    slug: 'mytishchi-prospekt-astrakhova',
    title: 'Мытищи. Проспект Астрахова',
    meta: ['Бюджет до 1 340 000 ₽', 'Срок — 64 дня.'],
    designer: {
      name: 'Анна Иванова',
      socials: [{ network: 'telegram', href: 'https://t.me/' }],
    },
    gallery2x2: [
      {
        src: '/demo/mytishchi/01-panel.jpg',
        alt: 'Жёлтая стеновая панель с фрезеровкой',
        width: 4096,
        height: 2730,
      },
      {
        src: '/demo/mytishchi/02-hallway.jpg',
        alt: 'Прихожая с подвесной консолью',
        width: 2730,
        height: 4096,
      },
      {
        src: '/demo/mytishchi/03-kitchen.jpg',
        alt: 'Светлая кухня с шестиугольной плиткой',
        width: 3072,
        height: 4096,
      },
      {
        src: '/demo/mytishchi/04-bedroom.jpg',
        alt: 'Спальня с панелью и светильником-луной',
        width: 4096,
        height: 2730,
      },
    ],
    task: 'Создать кухню в стиле лофт для квартиры 14 м² с нестандартным углом и скошенной стеной.',
    solution:
      'Спроектировали угловой модуль по индивидуальным размерам. Использовали фасады МДФ матовый «Stone», фурнитуру Blum, скрытые ручки Profile-L. Встроили технику в нишу со скошенной стеной.',
    // Порядок — как в gallery__media (23:164): 2 видео, затем 9 фото.
    gallery: [
      {
        type: 'video',
        poster: { src: `${dir}/gallery/video-01.png`, width: 786, height: 857, alt: 'Гостиная' },
      },
      {
        type: 'video',
        poster: { src: `${dir}/gallery/video-02.png`, width: 755, height: 861, alt: 'Кухня' },
      },
      photo('gallery/photo-01.jpg', 2731, 4096, 'Санузел: тумба с раковиной'),
      photo('gallery/photo-02.jpg', 3072, 4096, 'Санузел: зеркальный шкаф'),
      photo('gallery/photo-03.jpg', 2731, 4096, 'Прихожая: красная ниша'),
      photo('02-hallway.jpg', 2730, 4096, 'Прихожая с подвесной консолью'),
      photo('gallery/photo-05.jpg', 4096, 2731, 'Ванная: тумба и круглое зеркало'),
      photo('04-bedroom.jpg', 4096, 2730, 'Спальня с панелью и светильником-луной'),
      photo('gallery/photo-07.jpg', 2730, 4096, 'Рабочее место у окна'),
      photo('gallery/photo-08.jpg', 4096, 2731, 'Спальня с телевизором'),
      photo('gallery/photo-09.jpg', 2731, 4096, 'Санузел: шкаф и раковина'),
    ],
    review: {
      text: [
        { text: '«KMF Салон — единственные, кто взялся за наш нестандартный угол и ' },
        { text: 'сделал всё точно по проекту.', strong: true },
        { text: ' Фасады идеально совпали с образцом в шоуруме. ' },
        { text: 'Клиент в восторге...', strong: true },
      ],
      author: 'Анна Иванова',
      role: 'Дизайнер интерьера',
    },
  },
]

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
