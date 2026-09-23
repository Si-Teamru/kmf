import Image from 'next/image'

import { asset } from '@/lib/asset'

import { cn } from '@/components/ui'
import type { ProjectImage } from '@/data/projects'

/**
 * Project Gallery 2x2: Desktop (19:572) — 308px, ячейки 150×150; Mobile (26:361) — 336px,
 * ячейки 164×164. Сетка 2×2, gap 8, фото object-cover.
 */
export function ProjectGallery2x2({
  images,
  className,
}: {
  images: ProjectImage[]
  className?: string
}) {
  return (
    <div className={cn('grid w-[336px] grid-cols-2 gap-2 xl:w-[308px]', className)}>
      {images.slice(0, 4).map((img, i) => (
        <div key={img.src} className="relative size-[164px] overflow-hidden xl:size-[150px]">
          <Image
            src={asset(img.src)}
            alt={img.alt}
            fill
            sizes="(min-width: 1280px) 150px, 164px"
            className="object-cover"
            priority={i < 2}
          />
        </div>
      ))}
    </div>
  )
}
