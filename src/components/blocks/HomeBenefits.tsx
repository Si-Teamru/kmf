'use client'

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn, FeatureItem } from '@/components/ui'
import { home, type Polygon } from '@/data/home'
import { asset } from '@/lib/asset'

import { SectionHeading } from './SectionHeading'

/** Длительность смены пункта, с — и CSS-переходов, и блокировки следующего жеста. */
const DURATION = 0.7
/** Сколько пикселей прокрутки держится закрепление (запас, чтобы войти и выйти). */
const PIN_DISTANCE = 200
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
 * GSAP: ScrollTrigger закрепляет блок по центру экрана, Observer перехватывает жест (колесо, свайп,
 * клавиши) и переключает ровно на один пункт — сколько бы ни прокрутили за раз; следующий жест
 * принимается после окончания анимации. На 01 вверх и на 06 вниз закрепление отпускает прокрутку.
 * Анимации — CSS-переходы: лента пунктов (transform), фото (наплыв), срез (clip-path).
 *
 * Номер пункта — внутри пункта, над ним: у активного он ровно на линии заголовка (место на линии
 * держит невидимый номер Step Divider), поэтому при смене цифра следующего пункта приезжает на линию.
 * Над 01 виден 06 (круг), под 06 — пусто.
 *
 * Mobile (контейнер 360×432): Section Heading сверху; окно пунктов 159 с x 12, y 60, активный с y 88
 * (номер на −23), gap 48; фото 182×272 справа с y 41.
 * xl (контейнер 1360×707): Section Heading с y 193 (линия на 233); пункты 317 с x 546, активный
 * на y 281 (номер на −54 — на линии, x 837), gap 72; фото 447×668 с x 913, y 39 — размер фиксирован.
 */
export function HomeBenefits() {
  const { title, items } = home.benefits
  const n = items.length
  // Над первым пунктом — последний (круг вверх); после последнего ничего нет.
  const ring = [n - 1, ...items.map((_, i) => i)]

  const box = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [shift, setShift] = useState({ value: 0, smooth: false })

  useEffect(() => {
    const el = box.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger, Observer)
    let index = 0
    let busy = false
    let saved = 0
    const restore = () => window.scrollTo(0, saved)

    const go = (dir: 1 | -1) => {
      if (busy) return
      const next = index + dir
      if (next < 0 || next >= n) {
        // Край: отпускаем прокрутку, следующий жест уйдёт на страницу.
        intent.disable()
        return
      }
      busy = true
      index = next
      setActive(next)
      gsap.delayedCall(DURATION, () => {
        busy = false
      })
    }

    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) go(1)
      else if (['ArrowUp', 'PageUp'].includes(e.key)) go(-1)
      else return
      e.preventDefault()
    }

    const intent = Observer.create({
      type: 'wheel,touch',
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onUp: () => go(1),
      onDown: () => go(-1),
      onEnable: () => {
        saved = window.scrollY
        document.addEventListener('scroll', restore, { passive: false })
        window.addEventListener('keydown', onKey)
      },
      onDisable: () => {
        document.removeEventListener('scroll', restore)
        window.removeEventListener('keydown', onKey)
      },
    })
    intent.disable()

    const pin = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: 'center center',
      end: `+=${PIN_DISTANCE}`,
      onEnter: (self) => {
        if (intent.isEnabled) return
        self.scroll(self.start + 1)
        intent.enable()
      },
      onEnterBack: (self) => {
        if (intent.isEnabled) return
        self.scroll(self.end - 1)
        intent.enable()
      },
    })

    return () => {
      intent.kill()
      pin.kill()
    }
  }, [n])

  // Сдвиг ленты: верх активного пункта — на 48 под линией (xl) / на 28 в окне (mobile).
  // Анимируется только смена пункта; пересчёт после загрузки шрифта и смены ширины — без анимации.
  const activeRef = useRef(active)
  const shiftRef = useRef(0)
  const measure = useCallback((smooth: boolean) => {
    const el = list.current?.children[activeRef.current + 1] as HTMLElement | undefined
    if (!el) return
    const next = (matchMedia('(min-width: 1280px)').matches ? 281 : 28) - el.offsetTop
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

  const fade = 'transition-[opacity,color] duration-700 motion-reduce:transition-none'

  return (
    <section aria-label={title} className="overflow-x-clip pt-section-gap xl:pl-container-padding">
      <div ref={box} className="relative h-[432px] xl:h-[707px]">
        <div
          className="absolute top-[41px] right-0 aspect-[182/272] w-[50.5%] transition-[clip-path] duration-700 ease-in-out motion-reduce:transition-none xl:top-[39px] xl:right-auto xl:left-[913px] xl:aspect-auto xl:h-[668px] xl:w-[447px]"
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
          stepHidden
          className="absolute inset-x-0 top-0 xl:top-[193px]"
        />

        <div className="absolute top-[60px] bottom-0 left-3 w-[calc(49.5%-19px)] overflow-hidden [mask-image:linear-gradient(#000_80%,transparent)] xl:top-0 xl:left-[546px] xl:w-[317px] xl:overflow-visible xl:[mask-image:none]">
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
                  aria-hidden={pos === 0 || undefined}
                  className={cn('relative', fade, Math.abs(d) > 1 && 'opacity-0')}
                >
                  <span
                    className={cn(
                      'absolute -top-[23px] left-[111px] text-step-number xl:-top-[54px] xl:left-[291px]',
                      fade,
                      d === 0 ? 'text-accent-red' : 'text-accent-red xl:text-accent-beige',
                    )}
                  >
                    {num(i)}
                  </span>
                  <FeatureItem title={items[i].title} active={d === 0}>
                    {items[i].text}
                  </FeatureItem>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
