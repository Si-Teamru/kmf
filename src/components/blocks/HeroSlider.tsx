'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

import { cn } from '@/components/ui'
import type { HeroSlide } from '@/data/home'
import { asset } from '@/lib/asset'

/** Сколько активный слайд стоит до автоматической смены, мс. */
const INTERVAL = 4500
/** Порог свайпа, px. */
const SWIPE = 40

/** Позиция слайда относительно активного: 0 — большое фото, 1…5 — справа, −1…−5 — слева. */
function place(i: number, active: number, n: number) {
  const d = (((i - active) % n) + n) % n
  return d > n / 2 ? d - n : d
}

/**
 * Геометрия из макета. Переменные на обёртке: Mobile / xl.
 * --half — половина ширины фото (276 / 431), --top/--h — фото; --t-top/--tw/--th — превью;
 * --step — шаг ленты (превью + gap 8); --cap — отступ подписи (11 / 8).
 */
const vars =
  '[--half:138px] [--top:143px] [--h:370px] [--t-top:287px] [--tw:101px] [--th:135px] [--step:109px] [--cap:11px] ' +
  'xl:[--half:215.5px] xl:[--top:30px] xl:[--h:577px] xl:[--t-top:339px] xl:[--tw:95px] xl:[--th:127px] xl:[--step:103px] xl:[--cap:8px]'

function box(d: number): CSSProperties {
  if (d === 0)
    return {
      left: 'calc(50% - var(--half))',
      top: 'var(--top)',
      width: 'calc(var(--half) * 2)',
      height: 'var(--h)',
    }
  const left =
    d > 0
      ? `calc(50% + var(--half) + 8px + ${d - 1} * var(--step))`
      : `calc(50% - var(--half) - 8px - var(--tw) + ${d + 1} * var(--step))`
  return { left, top: 'var(--t-top)', width: 'var(--tw)', height: 'var(--th)' }
}

/**
 * Слайдер первого экрана (Hero Photo 116:463 + Hero Thumb 116:466).
 * Активный слайд — большое фото по центру с подписью (название проекта, text_location-caps),
 * остальные — лента превью 40% по бокам: следующие справа, предыдущие слева (как в макете).
 * Каждые INTERVAL мс следующее превью вырастает в большое фото, текущее уменьшается и уходит
 * в ленту слева, подпись сменяется. Клик по превью — перейти к нему; свайп/перетаскивание —
 * следующий/предыдущий; клик по большому фото — страница проекта.
 * Слайд, перескакивающий с одного края ленты на другой, переставляется без анимации.
 * При prefers-reduced-motion автосмены нет.
 */
export function HeroSlider({ slides, className }: { slides: HeroSlide[]; className?: string }) {
  const n = slides.length
  // from — прошлый активный: по нему видно, какой слайд перескакивает с края на край.
  const [{ active, from }, setState] = useState({ active: 0, from: 0 })
  const [paused, setPaused] = useState(false)
  const drag = useRef<{ x: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)

  const go = useCallback(
    (to: number) => setState((s) => ({ active: ((to % n) + n) % n, from: s.active })),
    [n],
  )

  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => go(active + 1), INTERVAL)
    return () => window.clearTimeout(t)
  }, [active, paused, go])

  const slide = slides[active]

  return (
    <div
      className={cn(vars, className)}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, moved: false }
        setPaused(true)
      }}
      onPointerUp={(e) => {
        const start = drag.current
        drag.current = null
        setPaused(false)
        if (!start) return
        const dx = e.clientX - start.x
        if (Math.abs(dx) < SWIPE) return
        suppressClick.current = true
        go(active + (dx < 0 ? 1 : -1))
      }}
      onPointerCancel={() => {
        drag.current = null
        setPaused(false)
      }}
      onClickCapture={(e) => {
        if (!suppressClick.current) return
        suppressClick.current = false
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {slides.map((s, i) => {
        const d = place(i, active, n)
        const jump = Math.abs(d - place(i, from, n)) > n / 2
        return (
          <div
            key={s.image.src + i}
            aria-hidden
            onClick={d === 0 ? undefined : () => go(i)}
            className={cn(
              'pointer-events-auto absolute touch-pan-y overflow-hidden select-none',
              d === 0 ? 'z-10 opacity-100' : 'cursor-pointer opacity-40',
              jump
                ? 'transition-none'
                : 'transition-[left,top,width,height,opacity] duration-700 ease-in-out motion-reduce:transition-none',
            )}
            style={box(d)}
          >
            <Image
              src={asset(s.image.src)}
              alt=""
              fill
              priority={i === 0}
              draggable={false}
              sizes="(min-width: 1280px) 431px, 276px"
              className="object-cover"
            />
          </div>
        )
      })}

      <Link
        href={slide.href}
        aria-label={`Проект «${slide.title}»`}
        className="pointer-events-auto absolute z-20 touch-pan-y"
        style={box(0)}
        draggable={false}
      />

      <p
        key={active}
        className="absolute inset-x-0 top-[calc(var(--top)+var(--h)+var(--cap))] animate-[fade-in_0.5s] text-center text-location-caps text-text-primary uppercase"
        aria-live="polite"
      >
        {slide.title}
      </p>
    </div>
  )
}
