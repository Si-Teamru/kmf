import Image from 'next/image'

import { home } from '@/data/home'
import { asset } from '@/lib/asset'

import { HeroRibbon } from './HeroRibbon'

/**
 * Первый экран главной (Desktop 111:7, Mobile 115:209), position: relative.
 * Секция подтянута под шапку: на мобильном заголовок стоит в строке шапки по центру (−56),
 * на xl шапка прозрачная и лежит поверх (−75). Между md и xl — мобильная раскладка под шапкой.
 * pointer-events: none — чтобы секция не перекрывала шапку; лента включает их обратно.
 *
 * Mobile 360×541: h1 + подзаголовок по центру (top 19, gap 4), hero__lead 259 (top 77),
 * лента 101×135 (top 287), фото 276×370 (top 143) + подпись через 11.
 * xl 1440×640: фото 431×577 по центру (top 30) + подпись через 8; лента 95×127 (top 339);
 * h1 + подзаголовок слева (24, 512, gap 8); hero__lead 263 справа (right 24, top 523).
 */
export function HomeHero() {
  const { hero } = home
  return (
    <section className="pointer-events-none relative -mt-14 h-[541px] overflow-hidden md:mt-0 xl:-mt-[75px] xl:h-[640px]">
      <HeroRibbon items={hero.thumbs} className="absolute inset-x-0 top-[287px] xl:top-[339px]" />

      <figure className="absolute top-[143px] left-1/2 flex w-[276px] -translate-x-1/2 flex-col items-center gap-[11px] xl:top-[30px] xl:w-[431px] xl:gap-2">
        <div className="relative h-[370px] w-full xl:h-[577px]">
          <Image
            src={asset(hero.photo.src)}
            alt={hero.photo.alt}
            fill
            priority
            sizes="(min-width: 1280px) 431px, 276px"
            className="object-cover"
          />
        </div>
        <figcaption className="text-location-caps text-text-primary uppercase">
          {hero.caption}
        </figcaption>
      </figure>

      <div className="absolute inset-x-0 top-[19px] flex flex-col items-center gap-1 text-center text-text-primary xl:inset-x-auto xl:top-[512px] xl:left-6 xl:items-start xl:gap-2 xl:text-left">
        <h1 className="text-hero-title uppercase">{hero.title}</h1>
        <p className="text-hero-subtitle">{hero.tagline}</p>
      </div>

      <p className="absolute top-[77px] left-1/2 w-[259px] -translate-x-1/2 text-center text-body-m text-text-primary xl:top-[523px] xl:right-6 xl:left-auto xl:w-[263px] xl:translate-x-0 xl:text-left">
        <span className="font-medium">{hero.lead.accent}</span>
        {hero.lead.text}
      </p>
    </section>
  )
}
