import type { SocialNetwork } from '@/components/ui'

/**
 * Статические данные проектов для вёрстки (этап 1). Поля повторяют будущую коллекцию
 * Payload `Projects`; на этапе 2 источник заменится на Local API.
 */
export type ProjectImage = { src: string; alt: string; width: number; height: number }

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
}

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
  },
]

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
