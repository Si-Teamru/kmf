'use client'

import { useAnimate } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { cn } from './cn'

type Side = 'left' | 'right'

/** Центр кружка: у хвоста правой стрелки (x 56) или, зеркально, левой (x 44). */
const dotX: Record<Side, number> = { left: 44, right: 56 }

/**
 * Icon/Slider Arrows (11:269), 95×16: левая стрелка 0–44, gap 12, правая 56–94, линии 2px.
 * Стрелка color_accent-red, когда в её сторону можно листать, иначе color_bg-stone-light.
 * Кружок ⌀10.67 стоит на хвосте активной стрелки: по умолчанию справа, при клике перепрыгивает
 * на нажатую стрелку, в конце ленты — на ту, что осталась активной.
 * Поверх — две прозрачные кнопки на левую и правую половины.
 */
export function SliderArrows({
  canPrev,
  canNext,
  onPrev,
  onNext,
  labels = ['Назад', 'Вперёд'],
  className,
}: {
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  labels?: [string, string]
  className?: string
}) {
  const [clicked, setClicked] = useState<Side>('right')
  // В конце ленты кружок уходит на единственную активную стрелку, иначе — на последнюю нажатую.
  const side: Side = canPrev && !canNext ? 'left' : canNext && !canPrev ? 'right' : clicked
  const [dot, animate] = useAnimate<SVGCircleElement>()
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    animate(dot.current, { cx: dotX[side], cy: [8, 1, 8] }, { duration: 0.35, ease: 'easeInOut' })
  }, [side, animate, dot])

  const press = (to: Side) => {
    if (to === 'left' ? !canPrev : !canNext) return
    setClicked(to)
    ;(to === 'left' ? onPrev : onNext)()
  }

  const tone = (active: boolean) =>
    cn(
      'transition-[stroke,fill] duration-200',
      active ? 'stroke-accent-red' : 'stroke-bg-stone-light',
    )
  const arrow = 'fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]'

  return (
    <div className={cn('relative shrink-0', className)}>
      <svg width="95" height="16" viewBox="0 0 95 16" className="overflow-visible" aria-hidden>
        <path d="M44 8H0M6.36 1.64 0 8l6.36 6.36" className={cn(arrow, tone(canPrev))} />
        <path d="M56 8h38m-6.36-6.36L94 8l-6.36 6.36" className={cn(arrow, tone(canNext))} />
        <circle
          ref={dot}
          cx={dotX[side]}
          cy={8}
          r={5.33}
          className={cn(
            'stroke-0 transition-[fill] duration-200',
            (side === 'left' ? canPrev : canNext) ? 'fill-accent-red' : 'fill-bg-stone-light',
          )}
        />
      </svg>
      <button
        type="button"
        aria-label={labels[0]}
        disabled={!canPrev}
        onClick={() => press('left')}
        className="absolute inset-y-[-12px] left-0 w-1/2 cursor-pointer disabled:cursor-default"
      />
      <button
        type="button"
        aria-label={labels[1]}
        disabled={!canNext}
        onClick={() => press('right')}
        className="absolute inset-y-[-12px] right-0 w-1/2 cursor-pointer disabled:cursor-default"
      />
    </div>
  )
}
