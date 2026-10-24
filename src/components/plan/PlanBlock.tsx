'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import { ButtonCta, InfoChip } from '@/components/ui'
import { cn } from '@/components/ui/cn'
import { site } from '@/data/site'
import { asset } from '@/lib/asset'

import type { PlanItem, PlanRect, PlanSelection, PlanZone } from './Plan3DViewer'

const Plan3DViewer = dynamic(() => import('./Plan3DViewer').then((m) => m.Plan3DViewer), {
  ssr: false,
})

export type PlanFact = { label: string; value: string }

/** Цвета вкладок по кругу (макет: #F4F3F3 → #D5D0C9 → #EEEDE8 → #E2E2E2). */
const TONES = [
  { bg: 'bg-gray-100', fill: 'fill-gray-100' },
  { bg: 'bg-bg-stone', fill: 'fill-bg-stone' },
  { bg: 'bg-bg-cream', fill: 'fill-bg-cream' },
  { bg: 'bg-gray-200', fill: 'fill-gray-200' },
]
/** Иконки зон (KMF-to-dev: «Таб плана», секция «Вкладки плана — разное число зон» 137:2). */
const ICONS = new Set([
  'kitchen',
  'bedroom',
  'bathroom',
  'hallway',
  'kids',
  'wardrobe',
  'bathroom-2',
  'laundry',
  'balcony',
])

/** Порядок вкладок: как в макете (кухня, спальня, санузел, прихожая), затем остальные зоны. */
const ZONE_ORDER = [
  'kitchen',
  'bedroom',
  'bathroom',
  'hallway',
  'kids',
  'wardrobe',
  'bathroom-2',
  'laundry',
  'balcony',
]
const byOrder = (a: PlanZone, b: PlanZone) => {
  const ia = ZONE_ORDER.indexOf(a.key)
  const ib = ZONE_ORDER.indexOf(b.key)
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
}

/** Композиция макета 1440 (KMF-to-dev 1:61 / 1:675): px от левого края контейнера 1440. */
const SECTION_PT = 80 // верхний отступ секции на xl
const STACK_TOP = 114
const STACK_H = 764
const STACK_W = 737 // открытая панель 683 + язычок 54
const FRAME_CLOSED = { x: 265, y: 73, w: 960, h: 622 }
const FRAME_OPEN = { x: 838, y: 247, w: 508, h: 463 }

/** Расстановка язычков по числу вкладок — правило из секции 137:2. */
function tongueLayout(n: number) {
  if (n <= 6) return { top0: 100, step: 88, scale: 1 }
  if (n === 7) return { top0: 40, step: 88, scale: 1 }
  if (n === 8) return { top0: 24, step: 80, scale: 0.85 }
  return {
    top0: 24,
    step: Math.min(72, Math.floor((STACK_H - 24 - 128 - 8) / (n - 1))),
    scale: 0.85,
  }
}

/** Шеврон из макета: уголок 7px, повёрнутый вправо или влево. */
function Chevron({ dir, className }: { dir: 'left' | 'right'; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'block size-[7px] border-b border-l border-current',
        dir === 'right' ? 'rotate-[225deg]' : 'rotate-45',
        className,
      )}
    />
  )
}

function ZoneIcon({ zone, className }: { zone: string; className?: string }) {
  if (!ICONS.has(zone)) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element -- линейная иконка зоны из макета, 28×28
    <img
      src={asset(`/icons/plan-zone-${zone}.svg`)}
      alt=""
      width={28}
      height={28}
      className={className}
    />
  )
}

/** Язычок вкладки: форма из макета (54×150,75), иконка; у открытой — в красном квадрате. */
function Tongue({ fill, zone, active }: { fill: string; zone: string; active: boolean }) {
  return (
    <span className="relative block h-[150.75px] w-[54px]">
      <svg
        width="54"
        height="150.75"
        viewBox="0 0 54 150.75"
        aria-hidden
        className={cn('absolute inset-0', fill)}
      >
        <path d="M43.3105 15.2393C49.715 17.4928 54 23.5427 54 30.332V120.418C54 127.207 49.715 133.257 43.3105 135.511L0 150.75V0L43.3105 15.2393Z" />
      </svg>
      <span
        className={cn(
          'absolute top-[59px] left-[11px] grid h-[33px] w-8 place-items-center rounded-xs',
          active && 'bg-accent-red',
        )}
      >
        <ZoneIcon zone={zone} />
      </span>
    </span>
  )
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Назад"
        onClick={onBack}
        className="grid h-[23px] w-[23px] shrink-0 cursor-pointer place-items-center rounded-full border border-text-primary"
      >
        <Chevron dir="left" className="ml-0.5" />
      </button>
      <h3 className="text-tab-title">{title}</h3>
    </div>
  )
}

/** Содержимое открытой вкладки: список изделий зоны или карточка изделия. */
function ZonePanel({
  zone,
  item,
  onItem,
  onBack,
}: {
  zone: PlanZone
  item: PlanItem | null
  onItem: (key: string) => void
  onBack: () => void
}) {
  if (item) {
    const dims: Array<[string, string, number]> = [
      ['А', 'высота', item.size.height],
      ['Б', 'ширина', item.size.width],
      ['В', 'глубина', item.size.depth],
    ]
    return (
      <div className="flex flex-col gap-8">
        <BackHeader title={zone.title} onBack={onBack} />
        <div className="flex flex-col gap-4">
          <p className="text-h6">{item.title}</p>
        </div>
        <dl className="flex flex-col gap-3 text-spec text-text-secondary">
          {dims.map(([letter, label, value]) => (
            <div key={label} className="flex items-center gap-[7px]">
              <dt className="flex gap-[11px]">
                <span className="uppercase">{letter}</span>
                <span className="w-[54px]">{label}</span>
              </dt>
              <dd className="flex gap-1">
                <span className="w-11 text-right">{value.toLocaleString('ru-RU')}</span>
                <span>мм</span>
              </dd>
            </div>
          ))}
        </dl>
        <ButtonCta href={site.cta.href} arrow="outline" className="self-start">
          Заказать проект
        </ButtonCta>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-8">
      <BackHeader title={zone.title} onBack={onBack} />
      <ul className="flex flex-col gap-4">
        {zone.items.map((it) => (
          <li key={it.key}>
            <button
              type="button"
              onClick={() => onItem(it.key)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-text-primary/30 py-2 pr-2 pl-3 text-left text-h6 font-medium transition-colors duration-200 hover:border-text-primary"
            >
              {it.title}
              <span className="grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full bg-bg-graphite text-text-inverse">
                <Chevron dir="right" className="-ml-0.5" />
              </span>
            </button>
          </li>
        ))}
        {zone.items.length === 0 && (
          <li className="text-body-l text-text-secondary">Мебели KMF в зоне нет</li>
        )}
      </ul>
    </div>
  )
}

/**
 * PlanBlock — секция «План проекта» с 3D-моделью (KMF-to-dev: закрыт 1:61, открыт 1:675,
 * объект 1:849; 360px — 1:1290 / 1:1496 / 1:1726). Вкладок столько, сколько зон в модели.
 * xl+: вкладки прижаты к левому краю экрана, холст модели — на всю секцию (модель не обрезается);
 * при открытой вкладке, если она перекрывает модель, модель уезжает и уменьшается.
 * Ниже xl: ряд вкладок-плашек с прокруткой вбок, открытая вкладка заменяет модель.
 */
export function PlanBlock({ model, facts }: { model: string; facts: PlanFact[] }) {
  const [selection, setSelection] = useState<PlanSelection>({ zoneKey: null, itemKey: null })
  const [zones, setZones] = useState<PlanZone[]>([])
  const [width, setWidth] = useState(0)
  const [desktop, setDesktop] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 1280px)')
    const update = () => {
      setWidth(el.clientWidth)
      setDesktop(mq.matches)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    mq.addEventListener('change', update)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [])

  const zone = zones.find((z) => z.key === selection.zoneKey) ?? null
  const item = zone?.items.find((i) => i.key === selection.itemKey) ?? null
  const open = !!zone
  const toggleZone = (key: string) =>
    setSelection((s) =>
      s.zoneKey === key ? { zoneKey: null, itemKey: null } : { zoneKey: key, itemKey: null },
    )

  // Отступ контейнера 1440 от края секции; модель уезжает, только если открытая вкладка её перекрывает.
  const off = Math.max(0, (width - 1440) / 2)
  const shifted = open && STACK_W > off + FRAME_CLOSED.x
  const f = shifted ? FRAME_OPEN : FRAME_CLOSED
  const frame: PlanRect | null = desktop ? { ...f, x: off + f.x, y: SECTION_PT + f.y } : null

  const n = zones.length
  const { top0, step, scale } = tongueLayout(n)

  return (
    <section
      ref={sectionRef}
      aria-label="План проекта"
      className="relative flex flex-col pt-[120px] xl:block xl:h-[958px] xl:pt-20"
    >
      <div className="contents xl:pointer-events-none xl:relative xl:z-10 xl:mx-auto xl:block xl:h-full xl:max-w-[1440px]">
        <div className="order-1 px-container-padding text-text-primary xl:absolute xl:top-0 xl:left-20 xl:w-[203px] xl:px-0">
          <h2 className="text-h3 uppercase">План проекта</h2>
          <p className="mt-[15px] text-body-l xl:w-[173px]">Выберите зону, чтобы увидеть детали</p>
        </div>

        {/* Ниже xl: ряд вкладок-плашек 80×42 (до 4 зон) или 64×42 с прокруткой вбок */}
        <div className="order-2 mt-6 flex [scrollbar-width:none] gap-1 overflow-x-auto px-container-padding xl:hidden">
          {zones.map((z, i) => (
            <button
              key={z.key}
              type="button"
              aria-label={z.title}
              aria-pressed={z.key === selection.zoneKey}
              onClick={() => toggleZone(z.key)}
              className={cn(
                'grid h-[42px] shrink-0 cursor-pointer place-items-center rounded-tab',
                n <= 4 ? 'w-20' : 'w-16',
                TONES[i % 4].bg,
              )}
            >
              <span
                className={cn(
                  'grid h-[33px] w-8 place-items-center rounded-xs',
                  z.key === selection.zoneKey && 'bg-accent-red',
                )}
              >
                <ZoneIcon zone={z.key} />
              </span>
            </button>
          ))}
        </div>
        {zone && (
          <div
            className={cn(
              'order-3 mx-container-padding mt-1 rounded-lg px-4 py-8 text-text-primary xl:hidden',
              TONES[zones.indexOf(zone) % 4].bg,
            )}
          >
            <ZonePanel
              zone={zone}
              item={item}
              onItem={(key) => setSelection({ zoneKey: zone.key, itemKey: key })}
              onBack={() =>
                setSelection(
                  item ? { zoneKey: zone.key, itemKey: null } : { zoneKey: null, itemKey: null },
                )
              }
            />
          </div>
        )}

        <div
          className={cn(
            'order-5 grid grid-cols-2 gap-2 px-container-padding xl:pointer-events-auto xl:absolute xl:flex xl:gap-4 xl:px-0 xl:transition-[left,top] xl:duration-300',
            shifted
              ? 'xl:top-[683px] xl:left-[828px] xl:flex-row'
              : 'xl:top-[435px] xl:left-[1239px] xl:w-[121px] xl:flex-col',
            'mt-6 xl:mt-0',
          )}
        >
          {facts.map((fact) => (
            <InfoChip
              key={fact.label}
              label={<span className="whitespace-nowrap">{fact.label}</span>}
              value={fact.value}
              className={shifted ? 'xl:w-[121px]' : undefined}
            />
          ))}
        </div>
      </div>

      <Plan3DViewer
        src={asset(model)}
        selection={selection}
        onSelect={setSelection}
        onZones={(z) => setZones([...z].sort(byOrder))}
        frame={frame}
        className={cn(
          'order-4 mt-6 h-[345px] w-full xl:absolute xl:inset-0 xl:mt-0 xl:h-auto',
          open && 'max-xl:hidden',
        )}
      />

      {/* xl+: стопка вкладок у левого края экрана; первая — сверху, открытая — поверх всех */}
      <div
        className="pointer-events-none absolute left-0 hidden xl:block"
        style={{ top: SECTION_PT + STACK_TOP, width: STACK_W, height: STACK_H }}
      >
        {zones.map((z, i) => {
          const active = z.key === selection.zoneKey
          const tone = TONES[i % 4]
          const last = i === n - 1
          const h = n <= 4 && !last ? 624 : STACK_H
          return (
            <div
              key={z.key}
              className="absolute top-0 left-0 flex items-start"
              style={{ zIndex: active ? n + 1 : n - i, height: h }}
            >
              <div
                className={cn(
                  'pointer-events-auto h-full overflow-hidden transition-[width] duration-300',
                  tone.bg,
                  last ? 'rounded-r-lg' : 'rounded-lg',
                  active ? 'w-[683px]' : 'w-2.5',
                )}
              >
                {active && zone && (
                  <div className="w-[683px] py-8 pr-[42px] pl-24 text-text-primary">
                    <ZonePanel
                      zone={zone}
                      item={item}
                      onItem={(key) => setSelection({ zoneKey: zone.key, itemKey: key })}
                      onBack={() =>
                        setSelection(
                          item
                            ? { zoneKey: zone.key, itemKey: null }
                            : { zoneKey: null, itemKey: null },
                        )
                      }
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label={z.title}
                aria-expanded={active}
                onClick={() => toggleZone(z.key)}
                className="pointer-events-auto shrink-0 origin-top-left cursor-pointer"
                style={{
                  marginTop: top0 + i * step,
                  transform: scale !== 1 ? `scale(${scale})` : undefined,
                }}
              >
                <Tongue fill={tone.fill} zone={z.key} active={active} />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
