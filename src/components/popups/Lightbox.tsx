'use client'

import Image from 'next/image'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type TouchEvent,
} from 'react'

import { cn, IconButtonClose, SliderArrows } from '@/components/ui'
import type { GalleryItem } from '@/data/projects'
import { asset } from '@/lib/asset'

import { lockScroll } from './lockScroll'

const LightboxContext = createContext<(index: number) => void>(() => {})

/** Минимальный сдвиг пальца для свайпа, px. */
const SWIPE = 50

/**
 * Лайтбокс галереи проекта (Desktop / Mobile «Лайтбокс галереи — к вёрстке», страница 22:2).
 * Провайдер оборачивает галерею, плитки открывают лайтбокс через `LightboxTrigger`.
 */
export function LightboxProvider({
  items,
  children,
}: {
  items: GalleryItem[]
  children: ReactNode
}) {
  const [index, setIndex] = useState<number | null>(null)
  return (
    <LightboxContext.Provider value={setIndex}>
      {children}
      <Lightbox items={items} index={index} onChange={setIndex} />
    </LightboxContext.Provider>
  )
}

/** Прозрачная кнопка на всю плитку галереи — открывает лайтбокс на этом кадре. */
export function LightboxTrigger({ index, label }: { index: number; label: string }) {
  const open = useContext(LightboxContext)
  return (
    <button
      type="button"
      aria-label={`Открыть: ${label}`}
      onClick={() => open(index)}
      className="absolute inset-0 z-10 cursor-zoom-in"
    />
  )
}

const media = (item: GalleryItem) => (item.type === 'photo' ? item : item.poster)

/**
 * Фон color_icon-dark 96%. Сверху «ГАЛЕРЕЯ ПРОЕКТА» (text_label-caps, белый 60%) и крестик Inverse.
 * Кадр вписан целиком (object-contain): desktop — поле 1100×708 (отступы 170 по бокам),
 * mobile — на всю ширину. Снизу стрелки Slider Arrows + счётчик «03 / 11» и лента Lightbox Thumb
 * (Desktop 88×57, Mobile 56×36, gap 8, прокрутка). Листание: стрелки, ← →, свайп, клик по превью.
 * Видео без ссылки на ролик показывается превью; с `videoUrl` — плеер.
 */
function Lightbox({
  items,
  index,
  onChange,
}: {
  items: GalleryItem[]
  index: number | null
  onChange: (index: number | null) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const thumbs = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)
  const open = index !== null
  const current = index ?? 0
  const canPrev = current > 0
  const canNext = current < items.length - 1
  const go = (to: number) => onChange(Math.min(Math.max(to, 0), items.length - 1))

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
    return open ? lockScroll() : undefined
  }, [open])

  useEffect(() => {
    if (!open) return
    thumbs.current?.children[current]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [open, current])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(current - 1)
    else if (e.key === 'ArrowRight') go(current + 1)
  }
  const onTouchStart = (e: TouchEvent) => (touchX.current = e.touches[0]?.clientX ?? null)
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current
    const end = e.changedTouches[0]?.clientX
    touchX.current = null
    if (start === null || end === undefined || Math.abs(end - start) < SWIPE) return
    go(current + (end < start ? 1 : -1))
  }

  const item = items[current]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <dialog
      ref={dialog}
      aria-label="Галерея проекта"
      onClose={() => onChange(null)}
      onKeyDown={onKey}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-icon-dark/96 p-0 backdrop:bg-transparent open:flex open:animate-[fade-in_0.3s_ease-out]"
    >
      {open && item && (
        <div className="flex size-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-3 md:h-[72px] md:pr-10 md:pl-10 xl:pl-[170px]">
            <span className="text-label-caps text-text-inverse uppercase opacity-60">
              Галерея проекта
            </span>
            <IconButtonClose tone="inverse" onClick={() => onChange(null)} />
          </div>
          <div
            className="relative min-h-0 flex-1 md:mx-10 xl:mx-[170px]"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {item.type === 'video' && item.videoUrl ? (
              <video
                key={item.videoUrl}
                src={item.videoUrl}
                poster={asset(item.poster.src)}
                controls
                autoPlay
                className="size-full object-contain"
              />
            ) : (
              <Image
                key={media(item).src}
                src={asset(media(item).src)}
                alt={media(item).alt}
                fill
                sizes="(min-width: 1280px) 1100px, 100vw"
                className="object-contain"
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-6 px-3 pt-10 pb-8 md:flex-row md:items-center md:justify-between md:px-10 md:pt-6 md:pb-10 xl:px-[170px]">
            <div className="flex items-center justify-between gap-6">
              <span
                className="text-label-caps whitespace-nowrap text-text-inverse"
                aria-live="polite"
              >
                {pad(current + 1)} / {pad(items.length)}
              </span>
              <SliderArrows
                canPrev={canPrev}
                canNext={canNext}
                onPrev={() => go(current - 1)}
                onNext={() => go(current + 1)}
                labels={['Предыдущий кадр', 'Следующий кадр']}
                className="md:order-first"
              />
            </div>
            <div
              ref={thumbs}
              className="flex min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            >
              {items.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Кадр ${i + 1}`}
                  aria-current={i === current}
                  onClick={() => go(i)}
                  className="relative h-9 w-14 shrink-0 cursor-pointer md:h-[57px] md:w-[88px]"
                >
                  <Image
                    src={asset(media(it).src)}
                    alt=""
                    fill
                    sizes="88px"
                    className={cn(
                      'object-cover transition-opacity duration-200',
                      i === current ? 'opacity-100' : 'opacity-40 hover:opacity-70',
                    )}
                  />
                  {i === current && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-red" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
