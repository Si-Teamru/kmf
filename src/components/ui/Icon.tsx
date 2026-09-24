import Image from 'next/image'

import { asset } from '@/lib/asset'

/**
 * Иконки UI-kit (доска «04 · Логотип и иконки»). SVG выгружены из Figma в public/icons
 * и очищены `scripts/clean-figma-svg.mjs`; размеры — как у компонентов в Figma.
 */
export const icons = {
  'logo-desktop-51': [51, 51],
  'logo-footer-60': [60, 60],
  'logo-mobile-24': [24, 24],
  'cta-arrow-red': [40, 41],
  'arrow-outline-45': [45, 45],
  'burger-mobile': [24, 24],
  'burger-desktop': [20, 6],
  'instagram-36': [36, 36],
  'whatsapp-36': [36, 36],
  'telegram-36': [36, 36],
  'instagram-22': [22, 22],
  'whatsapp-22': [22, 22],
  'telegram-22': [22, 22],
  'slider-arrows': [95, 16],
  'external-arrow-18': [18, 18],
  'link-arrow-98': [99, 15],
  'link-arrow-98-red': [99, 15],
  'view-all-arrow': [131, 15],
  'chevron-down': [19, 8],
  'back-circle': [23, 23],
  'circle-arrow-dark': [23, 23],
  'swipe-hint': [36, 19],
  'plus-15': [15, 17],
  'plus-11': [11, 13],
  'minus-15': [15, 17],
  enlarge: [13, 14],
  'dot-red': [8, 8],
  'zone-kitchen': [26, 15],
  'zone-bedroom': [25, 22],
  'zone-hallway': [20, 26],
  'zone-wardrobe': [14, 26],
  'zone-wardrobe-active': [32, 33],
} as const satisfies Record<string, readonly [number, number]>

export type IconName = keyof typeof icons

type IconProps = {
  name: IconName
  /** Пустой alt — иконка декоративная; для смысловых иконок передать текст. */
  alt?: string
  className?: string
}

export function Icon({ name, alt = '', className }: IconProps) {
  const [width, height] = icons[name]
  return (
    <Image
      src={asset(`/icons/${name}.svg`)}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  )
}
