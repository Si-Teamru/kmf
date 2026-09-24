'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import { cn, FeatureItem } from '@/components/ui'
import { home, type Polygon } from '@/data/home'
import { asset } from '@/lib/asset'

import { SectionHeading } from './SectionHeading'

/** Сколько пикселей прокрутки приходится на один пункт, пока секция закреплена. */
const STEP = 400
/** До скольких точек дополнять срезы, чтобы clip-path плавно перетекал между ними. */
const POINTS = 8

const num = (i: number) => String(i + 1).padStart(2, '0')

/** Дополняет многоугольник до POINTS точек повтором последней — число точек у всех кадров одно. */
function polygon(shape: Polygon) {
  const pts = [...shape]
  while (pts.length < POINTS) pts.push(pts[pts.length - 1])
  return `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(', ')})`
}

/**
 * «01 Мы знаем цену дизайнерского решения» (Desktop 112:45, Mobile 115:236; кадры 124:1956).
 *
 * Секция закрепляется (sticky, как pin в GSAP ScrollTrigger): пока она на экране, прокрутка
 * листает пункты 01–06 — по STEP px на пункт, затем секция отпускается. Активный пункт стоит
 * под линией заголовка, соседние — бледные (Feature Item Inactive) с номерами; номер активного —
 * на линии. Фото справа меняется вместе с пунктом: срез (clip-path) перетекает, картинка — наплывом.
 * Пункты идут по кругу: над 01 виден 06, под 06 — 01.
 *
 * Mobile (контейнер 360×432): Section Heading сверху; пункты 159 с x 12 и y 88 (виден активный и
 * следующий, gap 48); фото 182×272 справа с y 41. xl (контейнер 1360×707): Section Heading с y 193
 * (линия на 233); пункты 317 с x 546, активный на y 281 (48 под линией), gap 72; фото 447×668 с x 913,
 * y 39. Между 1280 и 1440 фото сужается (от x 913 до правого края).
 */
export function HomeBenefits() {
  const { title, items } = home.benefits
  const n = items.length
  // Лента по кругу: последний пункт перед первым и первый после последнего.
  const ring = [n - 1, ...items.map((_, i) => i), 0]

  const track = useRef<HTMLDivElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [shift, setShift] = useState({ value: 0, smooth: false })

  useEffect(() => {
    const onScroll = () => {
      const t = track.current
      const s = sticky.current
      if (!t || !s) return
      const top = parseFloat(getComputedStyle(s).top) || 0
      const rect = t.getBoundingClientRect()
      const progress = (top - rect.top) / Math.max(rect.height - s.offsetHeight, 1)
      setActive(Math.min(n - 1, Math.max(0, Math.floor(progress * n))))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [n])

  // Сдвиг ленты: верх активного пункта — на уровень 48 под линией (xl) / в начало окна (mobile).
  // Анимируется только смена пункта; пересчёт после загрузки шрифта и смены ширины — без анимации.
  const activeRef = useRef(active)
  const shiftRef = useRef(0)
  const measure = useCallback((smooth: boolean) => {
    const el = list.current?.children[activeRef.current + 1] as HTMLElement | undefined
    if (!el) return
    const next = (matchMedia('(min-width: 1280px)').matches ? 281 : 0) - el.offsetTop
    if (next === shiftRef.current) return
    shiftRef.current = next
    setShift({ value: next, smooth })
  }, [])

  const first = useRef(true)
  useLayoutEffect(() => {
    activeRef.current = active
    measure(!first.current)
    first.current = false
  }, [active, measure])

  useEffect(() => {
    const ro = new ResizeObserver(() => measure(false))
    if (list.current) ro.observe(list.current)
    return () => ro.disconnect()
  }, [measure])

  return (
    <section aria-label={title} className="pt-section-gap">
      <div
        ref={track}
        className="relative h-[calc(432px+var(--steps))] xl:h-[calc(707px+var(--steps))] xl:pl-container-padding"
        style={{ '--steps': `${(n - 1) * STEP}px` } as CSSProperties}
      >
        <div
          ref={sticky}
          className="sticky top-[max(24px,calc(50vh-216px))] h-[432px] xl:top-[max(100px,calc(50vh-353px))] xl:h-[707px]"
        >
          <div
            className="absolute top-[41px] right-0 aspect-[182/272] w-[50.5%] transition-[clip-path] duration-700 ease-in-out motion-reduce:transition-none xl:top-[39px] xl:left-[913px] xl:aspect-[447/668] xl:w-auto"
            style={{ clipPath: polygon(items[active].shape) }}
          >
            {items.map((item, i) => (
              <Image
                key={item.title}
                src={asset(item.image.src)}
                alt={i === active ? item.image.alt : ''}
                fill
                sizes="(min-width: 1280px) 447px, 50vw"
                className={cn(
                  'object-cover transition-opacity duration-700 motion-reduce:transition-none',
                  i === active ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}
          </div>

          <SectionHeading
            number="01"
            title={title}
            step={num(active)}
            className="absolute inset-x-0 top-0 xl:top-[193px]"
          />

          <div className="absolute top-[88px] bottom-0 left-3 w-[calc(49.5%-19px)] overflow-hidden [mask-image:linear-gradient(#000_80%,transparent)] xl:top-0 xl:left-[546px] xl:w-[317px] xl:overflow-visible xl:[mask-image:none]">
            <div
              ref={list}
              className={cn(
                'flex flex-col gap-12 xl:gap-[72px]',
                shift.smooth &&
                  'transition-transform duration-700 ease-in-out motion-reduce:transition-none',
              )}
              style={{ transform: `translateY(${shift.value}px)` }}
            >
              {ring.map((i, pos) => {
                const d = pos - (active + 1)
                return (
                  <div
                    key={pos}
                    aria-hidden={pos === 0 || pos === ring.length - 1 || undefined}
                    className={cn(
                      'relative transition-opacity duration-700 motion-reduce:transition-none',
                      Math.abs(d) > 1 && 'opacity-0',
                    )}
                  >
                    {d !== 0 && (
                      <span className="absolute -top-8 left-[111px] text-step-number text-accent-red xl:-top-[54px] xl:left-[291px] xl:text-accent-beige">
                        {num(i)}
                      </span>
                    )}
                    <FeatureItem title={items[i].title} active={d === 0}>
                      {items[i].text}
                    </FeatureItem>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
