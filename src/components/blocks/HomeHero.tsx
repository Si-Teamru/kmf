import { home } from '@/data/home'

import { HeroSlider } from './HeroSlider'

/**
 * Первый экран главной (Desktop 111:7, Mobile 115:209), position: relative.
 * Секция подтянута под шапку: на мобильном заголовок стоит в строке шапки по центру (−56),
 * на xl шапка прозрачная и лежит поверх (−75). Между md и xl — мобильная раскладка под шапкой.
 * pointer-events: none — чтобы секция не перекрывала шапку; слайды включают их обратно.
 *
 * Mobile 360×541: h1 + подзаголовок по центру (top 19, gap 4), hero__lead 259 (top 77),
 * слайдер: фото 276×370 (top 143) + подпись через 11, превью 101×135 (top 287).
 * xl 1440×640: фото 431×577 по центру (top 30) + подпись через 8; превью 95×127 (top 339);
 * h1 + подзаголовок слева (24, 512, gap 8); hero__lead 263 справа (right 24, top 523).
 */
export function HomeHero() {
  const { hero } = home
  return (
    <section className="pointer-events-none relative -mt-14 h-[541px] overflow-hidden md:mt-0 xl:-mt-[75px] xl:h-[640px]">
      <HeroSlider slides={hero.slides} className="absolute inset-0" />

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
