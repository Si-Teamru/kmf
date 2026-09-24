'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import { cn } from '@/components/ui'
import type { ProjectImage } from '@/data/projects'
import { asset } from '@/lib/asset'

/** Скорость автопрокрутки, px/с. */
const SPEED = 24
/** Сколько раз повторить набор, чтобы лента закрывала экран при любом сдвиге. */
const COPIES = 4

/**
 * Лента превью первого экрана (Hero Thumb 116:466): бесконечная, крутится сама справа налево
 * и листается перетаскиванием (мышь, палец). Превью 101×135 (mobile) / 95×127 (xl), gap 8,
 * opacity 40%. Центральное фото лежит поверх ленты.
 * Сдвиг — transform по rAF; набор повторён COPIES раз, сдвиг берётся по модулю ширины набора.
 * При prefers-reduced-motion лента не едет сама, но перетаскивается.
 */
export function HeroRibbon({ items, className }: { items: ProjectImage[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    // Стартовый сдвиг: первое превью на x = −10 (desktop) / −67 (mobile), как в макете.
    let offset = 0
    let setWidth = 0
    let dragging = false
    let lastX = 0
    let last = performance.now()
    let raf = 0

    const measure = () => {
      const first = el.children[0] as HTMLElement | undefined
      const nth = el.children[items.length] as HTMLElement | undefined
      if (!first || !nth) return
      const prev = setWidth
      setWidth = nth.offsetLeft - first.offsetLeft
      if (!prev) offset = setWidth + (matchMedia('(min-width: 1280px)').matches ? 10 : 67)
    }
    const apply = () => {
      if (setWidth) offset = ((offset % setWidth) + setWidth) % setWidth
      el.style.transform = `translate3d(${-offset - setWidth}px,0,0)`
    }
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000
      last = now
      if (!dragging && !reduced) offset += SPEED * dt
      apply()
      raf = requestAnimationFrame(tick)
    }

    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      offset -= e.clientX - lastX
      lastX = e.clientX
    }
    const onUp = () => {
      dragging = false
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [items.length])

  return (
    <div className={cn('pointer-events-auto overflow-hidden', className)}>
      <div
        ref={track}
        className="flex w-max cursor-grab touch-pan-y gap-2 select-none active:cursor-grabbing"
      >
        {Array.from({ length: COPIES }, (_, copy) =>
          items.map((item, i) => (
            <div
              key={`${copy}-${i}`}
              className="relative h-[135px] w-[101px] shrink-0 opacity-40 xl:h-[127px] xl:w-[95px]"
              aria-hidden={copy > 0 || undefined}
            >
              <Image
                src={asset(item.src)}
                alt={copy === 0 ? item.alt : ''}
                fill
                sizes="101px"
                draggable={false}
                className="object-cover"
              />
            </div>
          )),
        )}
      </div>
    </div>
  )
}
