import Image from 'next/image'

import { cn, LinkWatchVideo } from '@/components/ui'
import type { ProjectImage } from '@/data/projects'

/**
 * Video Tile: Desktop (19:503) 876×563.56, Mobile (26:172) 351×225.
 * Превью (object-cover) + тонкая рамка color_gray-300 и «СМОТРЕТЬ ВИДЕО +» по центру.
 * Рамка в макете пропорциональна плитке на обоих размерах, поэтому задана в % и cqw:
 *   отступ 2% ширины / 3.1% высоты; верх/низ — 83.3% ширины (верхняя смещена на −1.33%);
 *   бока — 90.7% высоты; толщина 0.0833cqw (0.73px при 876, 0.29px при 351).
 */
export function VideoTile({
  poster,
  videoUrl,
  sizes,
  className,
}: {
  poster: ProjectImage
  videoUrl?: string
  sizes: string
  className?: string
}) {
  const line = 'absolute bg-gray-300'
  return (
    <div className={cn('@container relative overflow-hidden', className)}>
      <Image src={poster.src} alt={poster.alt} fill sizes={sizes} className="object-cover" />
      <span
        className={cn(
          line,
          'top-[3.1%] left-[calc(50%-1.33%)] h-[0.0833cqw] w-[83.3%] -translate-x-1/2',
        )}
      />
      <span
        className={cn(line, 'bottom-[3.1%] left-1/2 h-[0.0833cqw] w-[83.3%] -translate-x-1/2')}
      />
      <span className={cn(line, 'top-1/2 left-[2%] h-[90.7%] w-[0.0833cqw] -translate-y-1/2')} />
      <span className={cn(line, 'top-1/2 right-[2%] h-[90.7%] w-[0.0833cqw] -translate-y-1/2')} />
      <LinkWatchVideo
        {...(videoUrl ? { href: videoUrl } : {})}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        Смотреть видео
      </LinkWatchVideo>
    </div>
  )
}
