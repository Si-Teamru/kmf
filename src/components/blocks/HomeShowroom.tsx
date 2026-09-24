import Image from 'next/image'

import { LinkArrow } from '@/components/ui'
import { home, type Polygon } from '@/data/home'
import { asset } from '@/lib/asset'

import { SectionHeading } from './SectionHeading'

const polygon = (shape: Polygon) => `polygon(${shape.map(([x, y]) => `${x}% ${y}%`).join(', ')})`

/**
 * «02 Выставочный зал и выезд с образцами» (Desktop 112:85, Mobile 115:264). pb 120 до формы.
 * Справа — видео на месте фото, со срезом-ступенькой сверху (clip-path); пока ролика нет — кадр.
 *
 * Mobile: Section Heading; текст 159 (Body M) с y 98; видео 182×236 справа с y 41;
 * ссылка-стрелка под видео на всю ширину (через 24). Текст тянется до низа видео, чтобы ссылка
 * не наезжала на него при любой ширине.
 * xl (контейнер 1360×617): Section Heading с y 139 (линия на 179); текст 392 (Body L) с (158, 315),
 * ссылка через 56; видео 475×617 с x 913 — выходит за край экрана на 28.
 */
export function HomeShowroom() {
  const { title, text, link, video, shape } = home.showroom
  return (
    <section
      aria-label={title}
      className="overflow-x-clip pt-section-gap pb-30 xl:pl-container-padding"
    >
      <div className="relative xl:h-[617px]">
        <div
          className="absolute top-[41px] right-0 aspect-[182/236] w-[50.5%] xl:top-0 xl:-right-7 xl:left-[913px] xl:aspect-auto xl:h-[617px] xl:w-auto"
          style={{ clipPath: polygon(shape) }}
        >
          {video.src ? (
            <video
              src={asset(video.src)}
              poster={asset(video.poster.src)}
              autoPlay
              muted
              loop
              playsInline
              className="size-full object-cover"
            />
          ) : (
            <Image
              src={asset(video.poster.src)}
              alt={video.poster.alt}
              fill
              sizes="(min-width: 1280px) 475px, 50vw"
              className="object-cover"
            />
          )}
        </div>

        <SectionHeading
          number="02"
          title={title}
          step="01"
          className="relative xl:absolute xl:inset-x-0 xl:top-[139px]"
        />

        <div className="mt-[18px] flex flex-col items-start gap-6 xl:absolute xl:top-[315px] xl:left-[158px] xl:mt-0 xl:gap-14">
          <p className="min-h-[calc(65.5vw-57px)] w-[calc(49.5vw-7px)] pl-3 text-body-m text-text-primary xl:min-h-0 xl:w-[392px] xl:pl-0 xl:text-body-l">
            {text}
          </p>
          <LinkArrow href={link.href} className="ml-3 xl:ml-0">
            {link.label}
          </LinkArrow>
        </div>
      </div>
    </section>
  )
}
