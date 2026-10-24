'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { InfoChip } from '@/components/ui'
import { cn } from '@/components/ui/cn'
import { asset } from '@/lib/asset'

import type { PlanSelection, PlanZone } from './Plan3DViewer'

const Plan3DViewer = dynamic(() => import('./Plan3DViewer').then((m) => m.Plan3DViewer), {
  ssr: false,
})

export type PlanFact = { label: string; value: string }

/**
 * Вкладки зон слева — как в макете «Plan Block» (KMF-to-dev 1:61): стопка панелей со «язычком» и
 * иконкой. В макете четыре вкладки; зоны без вкладки выбираются кликом по модели.
 */
const TABS = [
  { zone: 'kitchen', icon: 'kitchen', bg: 'bg-gray-100', tongueTop: 100, title: 'Кухня-гостиная' },
  { zone: 'bedroom', icon: 'bedroom', bg: 'bg-bg-stone', tongueTop: 188, title: 'Спальня' },
  {
    zone: 'bathroom',
    icon: 'bathroom',
    bg: 'bg-bg-cream',
    tongueTop: 276,
    title: 'Мастер-санузел',
  },
  { zone: 'hallway', icon: 'hallway', bg: 'bg-gray-200', tongueTop: 364, title: 'Прихожая' },
] as const

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

/**
 * PlanBlock — секция «План проекта» с 3D-моделью. Desktop — композиция макета 1440×878 (xl+),
 * ниже xl макета нет: заголовок, модель и параметры колонкой, вкладки скрыты.
 */
export function PlanBlock({ model, facts }: { model: string; facts: PlanFact[] }) {
  const [selection, setSelection] = useState<PlanSelection>({ zoneKey: null, itemKey: null })
  const [zones, setZones] = useState<PlanZone[]>([])
  const zoneOf = (key: string) => zones.find((z) => z.key === key)

  const toggleZone = (zone: string) =>
    setSelection((s) =>
      s.zoneKey === zone ? { zoneKey: null, itemKey: null } : { zoneKey: zone, itemKey: null },
    )

  return (
    <section aria-label="План проекта" className="pt-[120px] xl:pt-20">
      <div className="relative mx-auto max-w-[1440px] xl:h-[878px]">
        <div className="px-container-padding text-text-primary xl:absolute xl:top-0 xl:left-20 xl:w-[203px] xl:px-0">
          <h2 className="text-h3 uppercase">План проекта</h2>
          <p className="mt-[15px] text-body-l xl:w-[173px]">Выберите зону, чтобы увидеть детали</p>
        </div>

        <Plan3DViewer
          src={asset(model)}
          selection={selection}
          onSelect={setSelection}
          onZones={setZones}
          className="mt-8 h-[420px] w-full md:h-[560px] xl:absolute xl:top-[73px] xl:left-[calc(50%+25px)] xl:mt-0 xl:h-[622px] xl:w-[960px] xl:-translate-x-1/2"
        />

        <div className="mt-6 grid grid-cols-2 gap-2 px-container-padding xl:absolute xl:top-[435px] xl:left-[1239px] xl:mt-0 xl:flex xl:w-[121px] xl:flex-col xl:gap-4 xl:px-0">
          {facts.map((f) => (
            <InfoChip
              key={f.label}
              label={<span className="whitespace-nowrap">{f.label}</span>}
              value={f.value}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute top-[114px] left-0 hidden h-[764px] w-[737px] xl:block">
          {TABS.map((tab, i) => {
            const open = selection.zoneKey === tab.zone
            const last = i === TABS.length - 1
            const zone = zoneOf(tab.zone)
            return (
              <div
                key={tab.zone}
                className={cn('absolute top-0 left-0 flex items-start', open ? 'z-10' : '')}
                style={open ? undefined : { zIndex: TABS.length - i }}
              >
                <div
                  className={cn(
                    'pointer-events-auto overflow-hidden transition-[width] duration-300',
                    tab.bg,
                    last ? 'h-[764px] rounded-r-lg' : 'h-[624px] rounded-lg',
                    open ? 'w-[400px]' : 'w-2.5',
                  )}
                >
                  <div className="flex w-[400px] flex-col gap-8 py-8 pr-8 pl-20 text-text-primary">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Свернуть"
                        onClick={() => toggleZone(tab.zone)}
                        tabIndex={open ? 0 : -1}
                        className="grid h-[23px] w-[23px] shrink-0 cursor-pointer place-items-center rounded-full border border-text-primary"
                      >
                        <Chevron dir="left" className="ml-0.5" />
                      </button>
                      <h3 className="text-h3">{zone?.title ?? tab.title}</h3>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {(zone?.items ?? []).map((item) => {
                        const active = selection.itemKey === item.key
                        return (
                          <li key={item.key}>
                            <button
                              type="button"
                              tabIndex={open ? 0 : -1}
                              onClick={() =>
                                setSelection({
                                  zoneKey: tab.zone,
                                  itemKey: active ? null : item.key,
                                })
                              }
                              className={cn(
                                'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border py-2 pr-2 pl-3 text-left text-h6 transition-colors duration-200',
                                active
                                  ? 'border-text-primary'
                                  : 'border-text-primary/30 hover:border-text-primary',
                              )}
                            >
                              {item.title}
                              <span className="grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full bg-bg-graphite text-text-inverse">
                                <Chevron dir="right" className="-ml-0.5" />
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={zone?.title ?? tab.title}
                  aria-expanded={open}
                  onClick={() => toggleZone(tab.zone)}
                  className="pointer-events-auto shrink-0 cursor-pointer"
                  style={{ marginTop: tab.tongueTop }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG-язычок из макета, размеры из Figma */}
                  <img
                    src={asset(`/icons/plan-tab-${tab.icon}.svg`)}
                    alt=""
                    width={54}
                    height={150.75}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
