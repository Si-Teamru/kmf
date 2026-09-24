'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

import { ButtonCard, LinkArrow, SliderArrows } from '@/components/ui'
import type { ProjectCardData } from '@/data/projects'

import { ProjectCard } from './ProjectCard'
import { ArrowLine } from './StepDivider'

const title = 'Реализованные проекты'
const lead =
  'Реализуем проект чётко по вашей задумке. Все наши проекты индивидуальны и рассчитываются по вашим чертежам'
const showroom = { label: 'Записаться в выставочный зал', href: '#showroom' }
const allProjects = { label: 'Все проекты', href: '/projects' }

/**
 * Секция «Реализованные проекты» (Desktop 23:191, Mobile 27:506).
 * Лента — нативная прокрутка со snap; стрелки Slider Nav листают на одну карточку.
 * Снизу полоса color_bg-cream (desktop 289, mobile 311) — в макете продолжается в подвал.
 * Раскладки разные (aside слева vs текст сверху, навигация сверху vs снизу), переключение на xl.
 */
export function ProjectsSlider({ cards }: { cards: ProjectCardData[] }) {
  return (
    <section aria-label={title} className="relative">
      <Desktop cards={cards} />
      <Mobile cards={cards} />
    </section>
  )
}

/**
 * Desktop (23:191): pt section-gap, pb 80, pl container-padding, gap 32.
 * Slider Nav (17:159) h 40 до правого края: линия flex-1 | стрелки + «Все проекты» (gap 40) | линия 200; gap 24.
 * container gap 23: projects__aside 454 (pt 40, место compact-bar 41 — её роль играет плавающая шапка;
 * текст pt 106: h2 капсом color_text-heading 268 + body-l 335, gap 16; ссылка pt 32)
 * | лента карточек 418×567, gap 16, уходит за правый край экрана.
 */
function Desktop({ cards }: { cards: ProjectCardData[] }) {
  const track = useRef<HTMLDivElement>(null)
  return (
    <div className="relative hidden flex-col gap-8 pt-section-gap pb-20 pl-container-padding xl:flex">
      <div className="absolute inset-x-0 bottom-0 h-[289px] bg-bg-cream" />
      <div className="relative flex h-10 items-center gap-6">
        <ArrowLine className="flex-1" />
        <div className="flex items-center gap-10">
          <TrackArrows track={track} />
          <ButtonCard href={allProjects.href} variant="sand">
            {allProjects.label}
          </ButtonCard>
        </div>
        <ArrowLine className="w-[200px] shrink-0" />
      </div>
      <div className="relative flex items-start gap-[23px]">
        <div className="flex w-[454px] shrink-0 flex-col pt-10">
          <div className="h-[41px]" />
          <div className="flex flex-col gap-4 pt-[106px]">
            <h2 className="w-[268px] text-h2 text-text-heading uppercase">{title}</h2>
            <p className="w-[335px] text-body-l text-text-primary">{lead}</p>
          </div>
          <div className="pt-8">
            <LinkArrow href={showroom.href}>{showroom.label}</LinkArrow>
          </div>
        </div>
        <Track track={track} cards={cards} className="gap-4" />
      </div>
    </div>
  )
}

/**
 * Mobile (27:506): pt section-gap, pb 40, pl container-padding.
 * projects__text gap 16: h3 капсом 275 + body-static 319 + ссылка-стрелка (accent-copper, как на десктопе).
 * Лента pt 48, карточки 314×478, gap 8. slider-nav pt 51, pr 12: линия flex-1 + стрелки, gap 24.
 * projects__all pt 41, pr 12, по центру: «Все проекты» 240×36.
 */
function Mobile({ cards }: { cards: ProjectCardData[] }) {
  const track = useRef<HTMLDivElement>(null)
  return (
    <div className="relative flex flex-col pt-section-gap pb-10 pl-container-padding xl:hidden">
      <div className="absolute inset-x-0 bottom-0 h-[311px] bg-bg-cream" />
      <div className="relative flex flex-col items-start gap-4">
        <h2 className="w-[275px] text-h3 text-text-primary uppercase">{title}</h2>
        <p className="w-[319px] max-w-full text-body-static text-text-primary">{lead}</p>
        <LinkArrow href={showroom.href}>{showroom.label}</LinkArrow>
      </div>
      <Track track={track} cards={cards} className="relative gap-2 pt-12" />
      <div className="relative flex items-center gap-6 pt-[51px] pr-3">
        <ArrowLine className="flex-1" />
        <TrackArrows track={track} />
      </div>
      <div className="relative flex justify-center pt-[41px] pr-3">
        <ButtonCard href={allProjects.href} variant="sand" size="h-9 w-[240px]">
          {allProjects.label}
        </ButtonCard>
      </div>
    </div>
  )
}

export function Track({
  track,
  cards,
  className,
}: {
  track: RefObject<HTMLDivElement | null>
  cards: ProjectCardData[]
  className: string
}) {
  return (
    <div
      ref={track}
      className={`flex min-w-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {cards.map((card) => (
        <ProjectCard key={card.title} card={card} className="snap-start" />
      ))}
    </div>
  )
}

/** Запас на дробный scrollLeft при snap. */
const EDGE = 2

/** Slider Arrows для ленты: листает на одну карточку, цвета стрелок — по возможности прокрутки. */
export function TrackArrows({ track }: { track: RefObject<HTMLDivElement | null> }) {
  const [can, setCan] = useState({ prev: false, next: false })

  useEffect(() => {
    const el = track.current
    if (!el) return
    const update = () =>
      setCan({
        prev: el.scrollLeft > EDGE,
        next: el.scrollLeft + el.clientWidth < el.scrollWidth - EDGE,
      })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', update)
    }
  }, [track])

  const scroll = (dir: -1 | 1) => {
    const el = track.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <SliderArrows
      canPrev={can.prev}
      canNext={can.next}
      onPrev={() => scroll(-1)}
      onNext={() => scroll(1)}
      labels={['Предыдущий проект', 'Следующий проект']}
    />
  )
}
