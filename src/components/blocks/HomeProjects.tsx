'use client'

import { useRef } from 'react'

import { ButtonCard } from '@/components/ui'
import type { ProjectCardData } from '@/data/projects'
import { home } from '@/data/home'

import { Track, TrackArrows } from './ProjectsSlider'
import { ArrowLine } from './StepDivider'

const allProjects = { label: 'Все проекты', href: '/projects' }

/**
 * «04 Реализованные проекты» на главной (Desktop 113:93, Mobile 117:268).
 * Раскладки разные (навигация над лентой vs под ней), переключение на xl.
 * Срез карточек — clip-path, под ним виден фон страницы: на xl низ карточек лежит на белом.
 */
export function HomeProjects({ cards }: { cards: ProjectCardData[] }) {
  const { title } = home.projects
  return (
    <section aria-label={title}>
      <Desktop cards={cards} title={title} />
      <Mobile cards={cards} title={title} />
    </section>
  )
}

/**
 * xl: pt section-gap, pb 80, pl container-padding. Строка 80: номер 04 в колонке 160 + Slider Nav
 * (линия flex-1 | стрелки + «Все проекты», gap 40 | линия 200; gap 24). Через 8: h2 268 с x 158
 * и лента карточек 418 (gap 16) с x 477 до правого края экрана.
 * Фон bg-cream продолжается из формы до 243px высоты карточек.
 */
function Desktop({ cards, title }: { cards: ProjectCardData[]; title: string }) {
  const track = useRef<HTMLDivElement>(null)
  return (
    <div className="relative hidden pt-section-gap pb-20 pl-container-padding xl:block">
      <div className="absolute inset-x-0 top-0 h-[calc(var(--layout-section-gap)+331px)] bg-bg-cream" />
      <div className="relative flex h-20 items-center">
        <span className="w-40 shrink-0 text-numeral-type text-text-numeral" aria-hidden>
          04
        </span>
        <div className="flex flex-1 items-center gap-6">
          <ArrowLine className="flex-1" />
          <div className="flex items-center gap-10">
            <TrackArrows track={track} />
            <ButtonCard href={allProjects.href} variant="sand">
              {allProjects.label}
            </ButtonCard>
          </div>
          <ArrowLine className="w-[200px] shrink-0" />
        </div>
      </div>
      <div className="relative mt-2 flex">
        <h2 className="absolute top-0 left-[158px] w-[268px] text-h2 text-text-heading uppercase">
          {title}
        </h2>
        <Track track={track} cards={cards} className="ml-[477px] gap-4" />
      </div>
    </div>
  )
}

/**
 * Mobile: фон bg-cream, pt 80, pb 32, pl 12. Номер + h2 в строку (gap 16), через 40 — лента
 * карточек 314 (gap 8); slider-nav pt 51 (линия + стрелки); «Все проекты» 240×36 по центру, pt 41.
 */
function Mobile({ cards, title }: { cards: ProjectCardData[]; title: string }) {
  const track = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col bg-bg-cream pt-20 pb-8 pl-3 xl:hidden">
      <div className="flex items-center gap-4 pr-3">
        <span className="text-numeral-type text-text-numeral" aria-hidden>
          04
        </span>
        <h2 className="flex-1 text-h2 text-text-heading uppercase">{title}</h2>
      </div>
      <Track track={track} cards={cards} className="mt-10 gap-2" />
      <div className="flex items-center gap-6 pt-[51px] pr-3">
        <ArrowLine className="flex-1" />
        <TrackArrows track={track} />
      </div>
      <div className="flex justify-center pt-[41px] pr-3">
        <ButtonCard href={allProjects.href} variant="sand" size="h-9 w-[240px]">
          {allProjects.label}
        </ButtonCard>
      </div>
    </div>
  )
}
